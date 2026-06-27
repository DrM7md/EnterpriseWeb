using System.Text;
using System.IdentityModel.Tokens.Jwt;
using API.Endpoints;
using API.Middleware;
using API.Security;
using Application;
using Application.Common.Security;
using Infrastructure;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
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

    builder.Services.AddOpenApi();
    builder.Services.AddProblemDetails();
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

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

    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();
    app.UseMiddleware<CorrelationIdMiddleware>();

    app.UseHttpsRedirection();
    app.UseCors(SpaCorsPolicy);
    app.UseAuthentication();
    app.UseAuthorization();

    // Health probes.
    app.MapHealthChecks("/health/live");
    app.MapHealthChecks("/health/ready");

    // API v1.
    var v1 = app.MapGroup("/api/v1");
    v1.MapSystemEndpoints();
    v1.MapAuthEndpoints();
    v1.MapUsersEndpoints();

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
