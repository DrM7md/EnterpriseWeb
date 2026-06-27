namespace Application.Features.Roles;

public sealed record RoleListItem(
    long Id,
    string Name,
    string? Description,
    bool IsSystem,
    int PermissionCount,
    DateTimeOffset CreatedAtUtc);

public sealed record RoleDetail(
    long Id,
    string Name,
    string? Description,
    bool IsSystem,
    IReadOnlyList<long> PermissionIds,
    IReadOnlyList<string> Permissions,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);

public sealed record CreateRoleRequest(string Name, string? Description, IReadOnlyList<long>? PermissionIds);

public sealed record UpdateRoleRequest(string Name, string? Description, IReadOnlyList<long>? PermissionIds);

/// <summary>عنصر من كتالوج الصلاحيات (للاختيار في الواجهة).</summary>
public sealed record PermissionItem(long Id, string Code, string Module, string? Description);
