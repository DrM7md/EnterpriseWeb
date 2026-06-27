using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// سجل عملية كتابة مُنفَّذة بمفتاح idempotency — لإعادة نفس الاستجابة عند إعادة الإرسال
/// (منع التكرار من النقر المزدوج أو إعادة محاولة الشبكة). يُجزَّأ حسب المستخدم.
/// </summary>
public class IdempotencyRecord : Entity
{
    public string Key { get; set; } = string.Empty;
    public long UserId { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;

    public int StatusCode { get; set; }
    public string? ContentType { get; set; }
    public string ResponseBody { get; set; } = string.Empty;

    public DateTimeOffset CreatedAtUtc { get; set; }
}
