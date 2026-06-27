using Serilog.Context;

namespace API.Middleware;

/// <summary>
/// يضمن وجود معرّف ارتباط لكل طلب (من رأس X-Correlation-ID أو مُولَّد)،
/// يُرجعه في الاستجابة، ويدفعه إلى سياق Serilog ليظهر في كل سجلّ.
/// </summary>
public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-ID";

    public async Task Invoke(HttpContext context)
    {
        var correlationId = context.Request.Headers.TryGetValue(HeaderName, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value.ToString()
            : context.TraceIdentifier;

        context.Response.Headers[HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}
