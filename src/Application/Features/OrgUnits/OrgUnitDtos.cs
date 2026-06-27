namespace Application.Features.OrgUnits;

public sealed record OrgUnitListItem(
    long Id,
    string Name,
    string Code,
    long? ParentId,
    int Level,
    bool IsActive,
    int ChildCount,
    int UserCount,
    DateTimeOffset CreatedAtUtc);

public sealed record OrgUnitDetail(
    long Id,
    string Name,
    string Code,
    long? ParentId,
    string Path,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);

public sealed record CreateOrgUnitRequest(string Name, string Code, long? ParentId);

public sealed record UpdateOrgUnitRequest(string Name, bool IsActive);
