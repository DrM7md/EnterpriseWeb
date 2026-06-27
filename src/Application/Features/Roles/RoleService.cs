using Application.Common.Abstractions;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Shared.Pagination;
using Shared.Results;

namespace Application.Features.Roles;

public interface IRoleService
{
    Task<Result<PagedResult<RoleListItem>>> ListAsync(PagedRequest request, CancellationToken ct = default);
    Task<Result<RoleDetail>> GetByIdAsync(long id, CancellationToken ct = default);
    Task<Result<long>> CreateAsync(CreateRoleRequest request, CancellationToken ct = default);
    Task<Result> UpdateAsync(long id, UpdateRoleRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(long id, CancellationToken ct = default);
    Task<IReadOnlyList<PermissionItem>> GetPermissionCatalogAsync(CancellationToken ct = default);
}

/// <summary>
/// موديول الأدوار — مبنيٌّ بقالب الموديول (brain/10). الأدوار على مستوى الوزارة (لا عزل).
/// أدوار النظام محميّة من التعديل/الحذف. الصلاحيات كتالوج ثابت يُبذَّر.
/// </summary>
internal sealed class RoleService(IAppDbContext db) : IRoleService
{
    public async Task<Result<PagedResult<RoleListItem>>> ListAsync(PagedRequest request, CancellationToken ct = default)
    {
        var query = db.Roles.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            query = query.Where(r => r.Name.Contains(term) || (r.Description != null && r.Description.Contains(term)));
        }

        query = (request.SortBy?.ToLowerInvariant()) switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name),
            _ => request.SortDescending ? query.OrderByDescending(r => r.CreatedAtUtc) : query.OrderBy(r => r.CreatedAtUtc),
        };

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip(request.Skip).Take(request.NormalizedPageSize)
            .Select(r => new RoleListItem(r.Id, r.Name, r.Description, r.IsSystem, r.RolePermissions.Count, r.CreatedAtUtc))
            .ToListAsync(ct);

        return new PagedResult<RoleListItem>(items, request.NormalizedPage, request.NormalizedPageSize, total);
    }

    public async Task<Result<RoleDetail>> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var role = await db.Roles.AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new RoleDetail(
                r.Id, r.Name, r.Description, r.IsSystem,
                r.RolePermissions.Select(rp => rp.PermissionId).ToList(),
                r.RolePermissions.Select(rp => rp.Permission.Code).ToList(),
                r.CreatedAtUtc, r.UpdatedAtUtc))
            .FirstOrDefaultAsync(ct);

        return role is null ? RoleErrors.NotFound : role;
    }

    public async Task<Result<long>> CreateAsync(CreateRoleRequest request, CancellationToken ct = default)
    {
        var normalized = request.Name.Trim().ToUpperInvariant();
        if (await db.Roles.AnyAsync(r => r.NormalizedName == normalized, ct))
            return RoleErrors.NameTaken;

        var permsResult = await ResolvePermissionsAsync(request.PermissionIds, ct);
        if (permsResult.IsFailure)
            return Result.Failure<long>(permsResult.Error);

        var role = new Role { Name = request.Name.Trim(), NormalizedName = normalized, Description = request.Description?.Trim() };
        foreach (var pid in permsResult.Value)
            role.RolePermissions.Add(new RolePermission { Permission = null!, PermissionId = pid });

        db.Roles.Add(role);
        await db.SaveChangesAsync(ct);
        return role.Id;
    }

    public async Task<Result> UpdateAsync(long id, UpdateRoleRequest request, CancellationToken ct = default)
    {
        var role = await db.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == id, ct);
        if (role is null)
            return RoleErrors.NotFound;
        if (role.IsSystem)
            return RoleErrors.SystemRoleLocked;

        var normalized = request.Name.Trim().ToUpperInvariant();
        if (await db.Roles.AnyAsync(r => r.NormalizedName == normalized && r.Id != id, ct))
            return RoleErrors.NameTaken;

        var permsResult = await ResolvePermissionsAsync(request.PermissionIds, ct);
        if (permsResult.IsFailure)
            return permsResult;

        role.Name = request.Name.Trim();
        role.NormalizedName = normalized;
        role.Description = request.Description?.Trim();

        if (request.PermissionIds is not null)
        {
            role.RolePermissions.Clear();
            foreach (var pid in permsResult.Value)
                role.RolePermissions.Add(new RolePermission { Permission = null!, PermissionId = pid });
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(long id, CancellationToken ct = default)
    {
        var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (role is null)
            return RoleErrors.NotFound;
        if (role.IsSystem)
            return RoleErrors.SystemRoleLocked;

        db.Roles.Remove(role); // حذف ناعم عبر الـ interceptor.
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<IReadOnlyList<PermissionItem>> GetPermissionCatalogAsync(CancellationToken ct = default) =>
        await db.Permissions.AsNoTracking()
            .OrderBy(p => p.Module).ThenBy(p => p.Code)
            .Select(p => new PermissionItem(p.Id, p.Code, p.Module, p.Description))
            .ToListAsync(ct);

    private async Task<Result<List<long>>> ResolvePermissionsAsync(IReadOnlyList<long>? ids, CancellationToken ct)
    {
        if (ids is null || ids.Count == 0)
            return new List<long>();

        var distinct = ids.Distinct().ToList();
        var existing = await db.Permissions.Select(p => p.Id).Where(pid => distinct.Contains(pid)).ToListAsync(ct);
        var missing = distinct.Except(existing).ToList();
        return missing.Count > 0
            ? Result.Failure<List<long>>(RoleErrors.PermissionNotFound(missing[0]))
            : distinct;
    }
}
