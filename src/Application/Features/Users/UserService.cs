using Application.Common.Abstractions;
using Application.Common.Reporting;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Shared.Pagination;
using Shared.Results;

namespace Application.Features.Users;

public interface IUserService
{
    Task<Result<PagedResult<UserListItem>>> ListAsync(PagedRequest request, CancellationToken ct = default);
    Task<Result<UserDetail>> GetByIdAsync(long id, CancellationToken ct = default);
    Task<Result<long>> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<Result> UpdateAsync(long id, UpdateUserRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(long id, CancellationToken ct = default);

    /// <summary>يبني تقريرًا جدوليًا للمستخدمين ضمن نطاق المستخدم الحالي (تصدير متزامن).</summary>
    Task<TabularReport> BuildExportAsync(string? search, CancellationToken ct = default);

    /// <summary>يبني التقرير بنطاق عزل صريح — للـ background jobs بلا سياق HTTP.</summary>
    Task<TabularReport> BuildExportForScopeAsync(IReadOnlyCollection<long> unitScope, string? search, string? requestedBy, CancellationToken ct = default);
}

/// <summary>
/// موديول المستخدمين — أول Vertical Slice. القراءات معزولة تلقائيًا (RLS عبر فلتر EF)،
/// والكتابات تتحقّق من النطاق صراحةً وتُسقَط إلى DTO مباشرة (لا N+1).
/// </summary>
internal sealed class UserService(
    IAppDbContext db,
    ICurrentUser currentUser,
    IPasswordHasher passwordHasher) : IUserService
{
    public async Task<Result<PagedResult<UserListItem>>> ListAsync(PagedRequest request, CancellationToken ct = default)
    {
        // db.Users مُصفّى مسبقًا بالعزل (نطاق المستخدم) والحذف الناعم.
        var query = db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            query = query.Where(u =>
                u.FullName.Contains(term) ||
                u.Email.Contains(term) ||
                u.UserName.Contains(term));
        }

        query = ApplySort(query, request.SortBy, request.SortDescending);

        var total = await query.CountAsync(ct);

        var items = await query
            .Skip(request.Skip)
            .Take(request.NormalizedPageSize)
            .Select(u => new UserListItem(
                u.Id, u.UserName, u.Email, u.FullName,
                u.OwnerUnitId, u.OwnerUnit!.Name, u.IsActive,
                u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                u.CreatedAtUtc))
            .ToListAsync(ct);

        return new PagedResult<UserListItem>(items, request.NormalizedPage, request.NormalizedPageSize, total);
    }

    public async Task<Result<UserDetail>> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var user = await db.Users.AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UserDetail(
                u.Id, u.UserName, u.Email, u.FullName,
                u.OwnerUnitId, u.OwnerUnit!.Name, u.IsActive,
                u.UserRoles.Select(ur => ur.RoleId).ToList(),
                u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                u.CreatedAtUtc, u.UpdatedAtUtc))
            .FirstOrDefaultAsync(ct);

        return user is null ? UserErrors.NotFound : user;
    }

    public async Task<Result<long>> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        var targetUnit = request.UnitId ?? currentUser.UnitId ?? 0;
        if (!currentUser.UnitScope.Contains(targetUnit))
            return UserErrors.UnitOutOfScope;

        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        // التحقّق من التفرّد عالميًّا (تجاوز العزل) لتجنّب استثناء فهرس فريد.
        var emailExists = await db.Users.IgnoreQueryFilters()
            .AnyAsync(u => u.NormalizedEmail == normalizedEmail, ct);
        if (emailExists)
            return UserErrors.EmailTaken;

        var rolesResult = await ResolveRolesAsync(request.RoleIds, ct);
        if (rolesResult.IsFailure)
            return Result.Failure<long>(rolesResult.Error);

        var user = new User
        {
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            FullName = request.FullName.Trim(),
            PasswordHash = passwordHasher.Hash(request.Password),
            OwnerUnitId = targetUnit,
            IsActive = true,
        };

        foreach (var roleId in rolesResult.Value)
            user.UserRoles.Add(new UserRole { Role = null!, RoleId = roleId });

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return user.Id;
    }

    public async Task<Result> UpdateAsync(long id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null)
            return UserErrors.NotFound;

        var rolesResult = await ResolveRolesAsync(request.RoleIds, ct);
        if (rolesResult.IsFailure)
            return rolesResult;

        user.FullName = request.FullName.Trim();
        user.IsActive = request.IsActive;

        if (request.RoleIds is not null)
        {
            user.UserRoles.Clear();
            foreach (var roleId in rolesResult.Value)
                user.UserRoles.Add(new UserRole { Role = null!, RoleId = roleId });
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(long id, CancellationToken ct = default)
    {
        if (currentUser.UserId == id)
            return UserErrors.CannotDeleteSelf;

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null)
            return UserErrors.NotFound;

        db.Users.Remove(user); // يُحوَّل إلى حذف ناعم عبر الـ interceptor.
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public Task<TabularReport> BuildExportAsync(string? search, CancellationToken ct = default)
        // db.Users معزول تلقائيًا — التصدير المتزامن لا يتجاوز نطاق المستخدم.
        => BuildReportAsync(db.Users.AsNoTracking(), search, currentUser.UserName, ct);

    public Task<TabularReport> BuildExportForScopeAsync(IReadOnlyCollection<long> unitScope, string? search, string? requestedBy, CancellationToken ct = default)
        // الـ job بلا سياق HTTP: نطبّق العزل صراحةً بالنطاق المحفوظ وقت الطلب.
        => BuildReportAsync(
            db.Users.AsNoTracking().IgnoreQueryFilters().Where(u => !u.IsDeleted && unitScope.Contains(u.OwnerUnitId)),
            search, requestedBy, ct);

    private static async Task<TabularReport> BuildReportAsync(IQueryable<User> query, string? search, string? requestedBy, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u => u.FullName.Contains(term) || u.Email.Contains(term) || u.UserName.Contains(term));
        }

        var rows = await query
            .OrderBy(u => u.FullName)
            .Select(u => new[]
            {
                u.FullName,
                u.Email,
                u.UserName,
                u.OwnerUnit!.Name,
                u.IsActive ? "مُفعّل" : "معطّل",
                u.CreatedAtUtc.ToString("yyyy-MM-dd"),
            })
            .ToListAsync(ct);

        return new TabularReport(
            Title: "تقرير المستخدمين",
            Columns: ["الاسم", "البريد", "اسم المستخدم", "الوحدة", "الحالة", "أُنشئ"],
            Rows: rows.Select(r => (IReadOnlyList<string>)r).ToList(),
            GeneratedBy: requestedBy,
            GeneratedAtUtc: DateTimeOffset.UtcNow);
    }

    private async Task<Result<List<long>>> ResolveRolesAsync(IReadOnlyList<long>? roleIds, CancellationToken ct)
    {
        if (roleIds is null || roleIds.Count == 0)
            return new List<long>();

        var distinct = roleIds.Distinct().ToList();
        var existing = await db.Roles.Select(r => r.Id).Where(rid => distinct.Contains(rid)).ToListAsync(ct);
        var missing = distinct.Except(existing).ToList();
        return missing.Count > 0
            ? Result.Failure<List<long>>(UserErrors.RoleNotFound(missing[0]))
            : distinct;
    }

    private static IQueryable<User> ApplySort(IQueryable<User> query, string? sortBy, bool desc) =>
        (sortBy?.ToLowerInvariant()) switch
        {
            "fullname" => desc ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
            "email" => desc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "createdatutc" => desc ? query.OrderByDescending(u => u.CreatedAtUtc) : query.OrderBy(u => u.CreatedAtUtc),
            _ => query.OrderByDescending(u => u.CreatedAtUtc),
        };
}
