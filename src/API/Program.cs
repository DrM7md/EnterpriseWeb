using System.IO.Compression;
using System.Text;
using System.Threading.RateLimiting;
using System.IdentityModel.Tokens.Jwt;
using API.Endpoints;
using API.Middleware;
using API.Observability;
using API.Security;
using Application;
using Application.Common.Security;
using Infrastructure;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Hangfire;
using Serilog;

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    const string SpaCorsPolicy = "spa";

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // --- Composition root ---
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // --- Background jobs (Hangfire) لتوليد التقارير الثقيلة خارج الـ request ---
    var hangfireConn = builder.Configuration.GetConnectionString("Default")!;
    builder.Services.AddHangfire(cfg => cfg
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(hangfireConn));
    builder.Services.AddHangfireServer();

    builder.Services.AddOpenApi();
    builder.Services.AddProblemDetails();
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

    // --- المراقبة (OpenTelemetry: traces + metrics) ---
    builder.Services.AddObservability(builder.Configuration, builder.Environment);

    // --- المصادقة (JWT) ---
    var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
        ?? throw new InvalidOperationException("إعدادات Jwt غير مُعرّفة.");
    JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwt.Issuer,
                ValidAudience = jwt.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
                ClockSkew = TimeSpan.FromSeconds(30),
            };
        });

    // --- التصريح القائم على الصلاحيات ---
    builder.Services.AddAuthorization();
    builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
    builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<AppDbContext>("database");

    builder.Services.AddMemoryCache();

    // --- ضغط الاستجابات (Brotli أولًا ثم Gzip) ---
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
        options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(["application/json"]);
    });
    builder.Services.Configure<BrotliCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);
    builder.Services.Configure<GzipCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);

    // --- تحديد المعدّل: حدّ عام لكل IP + سياسة صارمة لمسارات المصادقة (منع التخمين) ---
    const string AuthRateLimitPolicy = "auth";
    var globalPermit = builder.Configuration.GetValue<int?>("RateLimit:GlobalPermitPerMinute") ?? 200;
    var authPermit = builder.Configuration.GetValue<int?>("RateLimit:AuthPermitPerMinute") ?? 10;
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions { PermitLimit = globalPermit, Window = TimeSpan.FromMinutes(1) }));

        options.AddPolicy(AuthRateLimitPolicy, httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions { PermitLimit = authPermit, Window = TimeSpan.FromMinutes(1) }));

        options.OnRejected = async (context, ct) =>
        {
            context.HttpContext.Response.Headers.RetryAfter = "60";
            await context.HttpContext.Response.WriteAsJsonAsync(
                new { title = "rate_limit_exceeded", status = 429, detail = "عدد كبير من الطلبات. حاول لاحقًا." }, ct);
        };
    });

    builder.Services.AddCors(options =>
        options.AddPolicy(SpaCorsPolicy, policy => policy
            .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod()));

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        await DbSeeder.SeedAsync(app.Services);
    }

    app.UseResponseCompression();
    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<SecurityHeadersMiddleware>();

    app.UseHttpsRedirection();
    app.UseCors(SpaCorsPolicy);
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseMiddleware<IdempotencyMiddleware>(); // بعد المصادقة (يحتاج هوية المستخدم)

    // Health probes + مقاييس Prometheus (/metrics).
    app.MapHealthChecks("/health/live");
    app.MapHealthChecks("/health/ready");
    app.MapPrometheusScrapingEndpoint();

    // API v1.
    var v1 = app.MapGroup("/api/v1");
    v1.MapSystemEndpoints();
    v1.MapAuthEndpoints();
    v1.MapUsersEndpoints();
    v1.MapRolesEndpoints();
    v1.MapOrgUnitsEndpoints();
    v1.MapModulesEndpoints();
    v1.MapReportsEndpoints();
    v1.MapUploadsEndpoints();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "فشل بدء التطبيق");
}
finally
{
    Log.CloseAndFlush();
}

// لإتاحة الوصول من مشروع الاختبارات (WebApplicationFactory) لاحقًا.
public partial class Program;
