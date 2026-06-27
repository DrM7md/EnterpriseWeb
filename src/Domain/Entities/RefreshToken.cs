using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// رمز تحديث مع تدوير وكشف إعادة الاستخدام (reuse-detection).
/// نُخزّن hash الرمز لا الرمز نفسه. استخدام رمز مُبطَل ⇒ تسريب ⇒ إبطال السلسلة كلها.
/// </summary>
public class RefreshToken : Entity
{
    public long UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public string CreatedByIp { get; set; } = string.Empty;

    public DateTimeOffset? RevokedAtUtc { get; set; }
    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive => RevokedAtUtc is null && DateTimeOffset.UtcNow < ExpiresAtUtc;
}
