using Domain.Common;

namespace Domain.Entities;

/// <summary>تعريف موديول في النظام. core منها لا تُطفأ.</summary>
public class Module : Entity
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCore { get; set; }

    public ICollection<ModuleSetting> Settings { get; set; } = [];
}

/// <summary>
/// إعداد موديول لوحدة تنظيمية (Feature Flag لكل قسم). الحقول الخاصة بالقسم تعيش
/// في ConfigJson محكومًا بـ schema validation (لا كل شيء ديناميكي — يحفظ الأداء وtype safety).
/// </summary>
public class ModuleSetting : AuditableEntity, IOwnedByUnit
{
    public long ModuleId { get; set; }
    public Module Module { get; set; } = null!;

    public long OwnerUnitId { get; set; }
    public OrgUnit? OwnerUnit { get; set; }

    public bool IsEnabled { get; set; }
    public string? ConfigJson { get; set; }
}
