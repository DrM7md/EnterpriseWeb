using Application.Common.Abstractions;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Shared.Results;

namespace Application.Features.OrgUnits;

public interface IOrgUnitService
{
    Task<IReadOnlyList<OrgUnitListItem>> GetTreeAsync(CancellationToken ct = default);
    Task<Result<OrgUnitDetail>> GetByIdAsync(long id, CancellationToken ct = default);
    Task<Result<long>> CreateAsync(CreateOrgUnitRequest request, CancellationToken ct = default);
    Task<Result> UpdateAsync(long id, UpdateOrgUnitRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(long id, CancellationToken ct = default);
}

/// <summary>
/// موديول الوحدات التنظيمية — نمط شجري (مسار مادي Path). أساس العزل: الوحدات تملك السجلات.
/// إنشاء الوحدة يحسب مسارها من الأمّ؛ الحذف محميّ (لا وحدة لها أبناء أو مستخدمون).
/// </summary>
internal sealed class OrgUnitService(IAppDbContext db, IAppCache cache) : IOrgUnitService
{
    private static readonly TimeSpan TreeTtl = TimeSpan.FromMinutes(5);

    public Task<IReadOnlyList<OrgUnitListItem>> GetTreeAsync(CancellationToken ct = default)
        // الشجرة عامّة (غير مُجزّأة بالمستخدم) وتتغيّر فقط عند الكتابة ⇒ تُخزَّن وتُبطَل عند الكتابة.
        => cache.GetOrCreateAsync(CacheKeys.OrgUnitTree, BuildTreeAsync, TreeTtl, ct);

    private async Task<IReadOnlyList<OrgUnitListItem>> BuildTreeAsync(CancellationToken ct)
    {
        var units = await db.OrgUnits.AsNoTracking().OrderBy(u => u.Path).ToListAsync(ct);

        // عدد المستخدمين لكل وحدة (نتجاوز العزل — عرض إداري للهيكل).
        var userCounts = await db.Users.AsNoTracking().IgnoreQueryFilters()
            .Where(u => !u.IsDeleted)
            .GroupBy(u => u.OwnerUnitId)
            .Select(g => new { UnitId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UnitId, x => x.Count, ct);

        return units.Select(u => new OrgUnitListItem(
            u.Id, u.Name, u.Code, u.ParentId,
            Level: Math.Max(0, u.Path.Count(c => c == '/') - 2),
            u.IsActive,
            ChildCount: units.Count(c => c.ParentId == u.Id),
            UserCount: userCounts.GetValueOrDefault(u.Id),
            u.CreatedAtUtc)).ToList();
    }

    public async Task<Result<OrgUnitDetail>> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var unit = await db.OrgUnits.AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new OrgUnitDetail(u.Id, u.Name, u.Code, u.ParentId, u.Path, u.IsActive, u.CreatedAtUtc, u.UpdatedAtUtc))
            .FirstOrDefaultAsync(ct);

        return unit is null ? OrgUnitErrors.NotFound : unit;
    }

    public async Task<Result<long>> CreateAsync(CreateOrgUnitRequest request, CancellationToken ct = default)
    {
        var code = request.Code.Trim();
        // الفهرس الفريد يشمل المحذوف ⇒ نفحص كل الصفوف.
        if (await db.OrgUnits.IgnoreQueryFilters().AnyAsync(u => u.Code == code, ct))
            return OrgUnitErrors.CodeTaken;

        var parentPath = "/";
        if (request.ParentId is { } parentId)
        {
            var parent = await db.OrgUnits.FirstOrDefaultAsync(u => u.Id == parentId, ct);
            if (parent is null)
                return OrgUnitErrors.ParentNotFound;
            parentPath = parent.Path;
        }

        var unit = new OrgUnit { Name = request.Name.Trim(), Code = code, ParentId = request.ParentId, Path = "/", IsActive = true };
        db.OrgUnits.Add(unit);
        await db.SaveChangesAsync(ct);

        // المسار المادي يُحسب بعد توليد المفتاح: مسار الأمّ + معرّف الوحدة.
        unit.Path = $"{parentPath}{unit.Id}/";
        await db.SaveChangesAsync(ct);
        cache.Remove(CacheKeys.OrgUnitTree);
        return unit.Id;
    }

    public async Task<Result> UpdateAsync(long id, UpdateOrgUnitRequest request, CancellationToken ct = default)
    {
        var unit = await db.OrgUnits.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (unit is null)
            return OrgUnitErrors.NotFound;

        unit.Name = request.Name.Trim();
        unit.IsActive = request.IsActive;
        await db.SaveChangesAsync(ct);
        cache.Remove(CacheKeys.OrgUnitTree);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(long id, CancellationToken ct = default)
    {
        var unit = await db.OrgUnits.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (unit is null)
            return OrgUnitErrors.NotFound;

        if (await db.OrgUnits.AnyAsync(u => u.ParentId == id, ct))
            return OrgUnitErrors.HasChildren;
        if (await db.Users.IgnoreQueryFilters().AnyAsync(u => u.OwnerUnitId == id && !u.IsDeleted, ct))
            return OrgUnitErrors.HasUsers;

        db.OrgUnits.Remove(unit); // حذف ناعم عبر الـ interceptor.
        await db.SaveChangesAsync(ct);
        cache.Remove(CacheKeys.OrgUnitTree);
        return Result.Success();
    }
}
