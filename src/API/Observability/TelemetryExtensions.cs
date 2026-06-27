using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace API.Observability;

/// <summary>
/// مراقبة موزّعة (OpenTelemetry): traces + metrics. تتكامل مع Correlation ID
/// (الـ middleware يقرأ Activity الذي يُنشئه OTel لكل طلب).
/// المُصدِّر: OTLP إن ضُبط endpoint (الإنتاج)، وإلا Console في التطوير. المقاييس عبر Prometheus.
/// </summary>
public static class TelemetryExtensions
{
    public const string ServiceName = "EnterpriseSystem.Api";

    public static IServiceCollection AddObservability(this IServiceCollection services, IConfiguration config, IHostEnvironment env)
    {
        var otlpEndpoint = config["Otel:OtlpEndpoint"];

        services.AddOpenTelemetry()
            .ConfigureResource(r => r.AddService(ServiceName, serviceVersion: "0.1.0"))
            .WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation(o => o.Filter = ctx =>
                        !ctx.Request.Path.StartsWithSegments("/metrics") &&
                        !ctx.Request.Path.StartsWithSegments("/health"))
                    .AddHttpClientInstrumentation()
                    .AddSqlClientInstrumentation();

                if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                    tracing.AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint));
                else if (env.IsDevelopment())
                    tracing.AddConsoleExporter();
            })
            .WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddPrometheusExporter();

                if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                    metrics.AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint));
            });

        return services;
    }
}
