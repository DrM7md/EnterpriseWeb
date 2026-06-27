using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// مستخدم النظام. مربوط بوحدة تنظيمية (OwnerUnitId = وحدته) ويخضع للعزل.
/// المصادقة (تسجيل الدخول) تتجاوز فلتر العزل صراحةً (عملية نظام مُبرَّرة).
/// </summary>
public class User : AuditableEntity, IOwnedByUnit
{
    public long OwnerUnitId { get; set; }
    public OrgUnit? OwnerUnit { get; set; }

    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<UserRole> UserRoles { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
