using Application.Common.Abstractions;

namespace API.Middleware;

/// <summary>
/// Idempotency للكتابات الحرجة: إن حمل الطلب رأس <c>Idempotency-Key</c> ومستخدمًا مُصادَقًا،
/// يُعاد تنفيذه مرة واحدة فقط — وإعادة الإرسال بنفس المفتاح تُرجع الاستجابة المخزّنة بلا تكرار.
/// </summary>
public sealed class IdempotencyMiddleware(RequestDelegate next)
{
    public const string HeaderName = "Idempotency-Key";
    private static readonly string[] Methods = ["POST", "PUT", "PATCH", "DELETE"];

    public async Task Invoke(HttpContext context, ICurrentUser currentUser, IIdempotencyStore store)
    {
        var key = context.Request.Headers[HeaderName].ToString();
        var userId = currentUser.UserId;

        // idempotency اختيارية: تُفعَّل فقط مع مفتاح + كتابة + مستخدم مُصادَق.
        if (string.IsNullOrWhiteSpace(key) || userId is null || !Methods.Contains(context.Request.Method))
        {
            await next(context);
            return;
        }

        var existing = await store.GetAsync(key, userId.Value, context.RequestAborted);
        if (existing is not null)
        {
            await ReplayAsync(context, existing);
            return;
        }

        // التقاط استجابة التنفيذ الأول في buffer.
        var originalBody = context.Response.Body;
        using var buffer = new MemoryStream();
        context.Response.Body = buffer;

        try
        {
            await next(context);
        }
        finally
        {
            context.Response.Body = originalBody;
        }

        buffer.Position = 0;
        var body = await new StreamReader(buffer).ReadToEndAsync(context.RequestAborted);
        buffer.Position = 0;
        await buffer.CopyToAsync(originalBody, context.RequestAborted);

        // نخزّن النجاحات فقط (2xx) — الأخطاء يُعاد محاولتها بحرّية.
        if (context.Response.StatusCode is >= 200 and < 300)
        {
            await store.TrySaveAsync(key, userId.Value, context.Request.Method, context.Request.Path,
                context.Response.StatusCode, context.Response.ContentType, body, context.RequestAborted);
        }
    }

    private static async Task ReplayAsync(HttpContext context, StoredResponse stored)
    {
        context.Response.StatusCode = stored.StatusCode;
        if (stored.ContentType is not null)
            context.Response.ContentType = stored.ContentType;
        context.Response.Headers["Idempotency-Replayed"] = "true";
        await context.Response.WriteAsync(stored.Body, context.RequestAborted);
    }
}
