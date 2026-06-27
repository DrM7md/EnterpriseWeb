using Domain.Common;

namespace Domain.Entities;

/// <summary>دور = حزمة صلاحيات. لا منطق فيه سوى التجميع. على مستوى الوزارة (ليس معزولًا).</summary>
public class Role : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>أدوار النظام لا تُحذف ولا تُعدَّل أسماؤها.</summary>
    public bool IsSystem { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = [];
    public ICollection<UserRole> UserRoles { get; set; } = [];
}

/// <summary>صلاحية ذرّية بصيغة {module}.{action}. كتالوج ثابت يُبذَّر (seed).</summary>
public class Permission : Entity
{
    public string Code { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = [];
}

public class RolePermission
{
    public long RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public long PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}

public class UserRole
{
    public long UserId { get; set; }
    public User User { get; set; } = null!;
    public long RoleId { get; set; }
    public Role Role { get; set; } = null!;
}
