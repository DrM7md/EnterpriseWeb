using API.Endpoints;
using Application;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

const string SpaCorsPolicy = "spa";

// --- Composition root: كل طبقة تُركّب نفسها ---
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

// CORS لخادم تطوير Vite (يُضبَط من config في الإنتاج).
builder.Services.AddCors(options =>
    options.AddPolicy(SpaCorsPolicy, policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(SpaCorsPolicy);

// Health probes (Phase 1 سيضيف ready-checks فعلية لقاعدة البيانات وغيرها).
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");

// API v1 — versioning من اليوم الأول حتى لا نكسر العملاء لاحقًا.
var v1 = app.MapGroup("/api/v1");
v1.MapSystemEndpoints();

app.Run();

// لإتاحة الوصول من مشروع الاختبارات (WebApplicationFactory) لاحقًا.
public partial class Program;
