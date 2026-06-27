namespace Application.Features.Users;

public sealed record UserListItem(
    long Id,
    string UserName,
    string Email,
    string FullName,
    long UnitId,
    string UnitName,
    bool IsActive,
    IReadOnlyList<string> Roles,
    DateTimeOffset CreatedAtUtc);

public sealed record UserDetail(
    long Id,
    string UserName,
    string Email,
    string FullName,
    long UnitId,
    string UnitName,
    bool IsActive,
    IReadOnlyList<long> RoleIds,
    IReadOnlyList<string> Roles,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);

public sealed record CreateUserRequest(
    string UserName,
    string Email,
    string FullName,
    string Password,
    long? UnitId,
    IReadOnlyList<long>? RoleIds);

public sealed record UpdateUserRequest(
    string FullName,
    bool IsActive,
    IReadOnlyList<long>? RoleIds);
