using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// وحدة تنظيمية في التسلسل الهرمي للوزارة (قطاع/إدارة/قسم).
/// مالكة السجلات عبر OwnerUnitId. الـ Path مسار مادي يُسرّع استعلامات الشجرة الفرعية.
/// </summary>
public class OrgUnit : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;

    public long? ParentId { get; set; }
    public OrgUnit? Parent { get; set; }
    public ICollection<OrgUnit> Children { get; set; } = [];

    /// <summary>مسار مادي مثل "/1/4/9/" — يسمح باستعلام الشجرة الفرعية بـ LIKE.</summary>
    public string Path { get; set; } = "/";

    public bool IsActive { get; set; } = true;
}
