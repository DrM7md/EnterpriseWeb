using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware;

/// <summary>
/// معالج استثناءات موحّد: يسجّل الخطأ (مع معرّف الارتباط) ويُرجع Problem Details
/// دون تسريب تفاصيل داخلية للعميل.
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception for {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "internal_error",
            Detail = "حدث خطأ غير متوقّع. تواصل مع الدعم مع معرّف الارتباط.",
        };
        problem.Extensions["correlationId"] = httpContext.Response.Headers[CorrelationIdMiddleware.HeaderName].ToString();

        httpContext.Response.StatusCode = problem.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
