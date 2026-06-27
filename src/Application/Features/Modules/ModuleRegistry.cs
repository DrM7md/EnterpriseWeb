using Application.Common.Abstractions;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Shared.Results;

namespace Application.Features.Modules;

public interface IModuleRegistry
{
    /// <summary>كل الموديولات مع حالتها الفعلية لوحدة معيّنة.</summary>
    Task<Result<IReadOnlyList<ModuleInfo>>> GetEffectiveAsync(long unitId, CancellationToken ct = default);

    /// <summary>هل الموديول مُفعّل لهذه الوحدة؟ (core دائمًا نعم). تُستخدم في بوابة التفعيل.</summary>
    Task<bool> IsEnabledAsync(string moduleKey, long unitId, CancellationToken ct = default);

    /// <summary>تفعيل/تعطيل موديول لوحدة (core لا يُعطَّل).</summary>
    Task<Result> SetEnabledAsync(string moduleKey, long unitId, bool enabled, CancellationToken ct = default);
}

/// <summary>
/// سجل الموديولات + أعلام التفعيل لكل قسم. القاعدة: core دائمًا مُفعّل؛
/// غير core مُعطّل افتراضيًا حتى يُفعَّل صراحةً لوحدة (opt-in لكل قسم).
/// </summary>
internal sealed class ModuleRegistry(IAppDbContext db, IMemoryCache cache) : IModuleRegistry
{
    private static readonly TimeSpan GateTtl = TimeSpan.FromSeconds(60);
    private static string GateKey(string moduleKey, long unitId) => $"module-enabled:{moduleKey}:{unitId}";

    public async Task<Result<IReadOnlyList<ModuleInfo>>> GetEffectiveAsync(long unitId, CancellationToken ct = default)
    {
        var modules = await db.Modules.AsNoTracking().ToListAsync(ct);

        // إعدادات هذه الوحدة (نتجاوز العزل لأن المسؤول قد يدير وحدة ضمن نطاقه).
        var settings = await db.ModuleSettings.AsNoTracking().IgnoreQueryFilters()
            .Where(s => s.OwnerUnitId == unitId && !s.IsDeleted)
            .ToDictionaryAsync(s => s.ModuleId, s => s.IsEnabled, ct);

        var result = modules
            .Select(m => new ModuleInfo(m.Key, m.Name, m.Description, m.IsCore,
                IsEnabled: m.IsCore || (settings.TryGetValue(m.Id, out var on) && on)))
            .ToList();

        return result;
    }

    public async Task<bool> IsEnabledAsync(string moduleKey, long unitId, CancellationToken ct = default)
    {
        // البوابة تُفحَص لكل طلب؛ نخزّنها مؤقتًا (TTL قصير) ونُبطلها عند التبديل.
        if (cache.TryGetValue(GateKey(moduleKey, unitId), out bool cached))
            return cached;

        var module = await db.Modules.AsNoTracking().FirstOrDefaultAsync(m => m.Key == moduleKey, ct);
        bool enabled;
        if (module is null)
            enabled = false;
        else if (module.IsCore)
            enabled = true;
        else
            enabled = await db.ModuleSettings.AsNoTracking().IgnoreQueryFilters()
                .AnyAsync(s => s.ModuleId == module.Id && s.OwnerUnitId == unitId && s.IsEnabled && !s.IsDeleted, ct);

        cache.Set(GateKey(moduleKey, unitId), enabled, GateTtl);
        return enabled;
    }

    public async Task<Result> SetEnabledAsync(string moduleKey, long unitId, bool enabled, CancellationToken ct = default)
    {
        var module = await db.Modules.FirstOrDefaultAsync(m => m.Key == moduleKey, ct);
        if (module is null)
            return ModuleErrors.NotFound;
        if (module.IsCore && !enabled)
            return ModuleErrors.CannotDisableCore;

        var setting = await db.ModuleSettings.IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.ModuleId == module.Id && s.OwnerUnitId == unitId, ct);

        if (setting is null)
            db.ModuleSettings.Add(new ModuleSetting { ModuleId = module.Id, OwnerUnitId = unitId, IsEnabled = enabled });
        else
            setting.IsEnabled = enabled;

        await db.SaveChangesAsync(ct);
        cache.Remove(GateKey(moduleKey, unitId)); // إبطال الكاش فورًا بعد التبديل.
        return Result.Success();
    }
}

public static class ModuleErrors
{
    public static readonly Error NotFound = Error.NotFound("module.not_found", "الموديول غير موجود.");
    public static readonly Error CannotDisableCore = Error.Conflict("module.core_locked", "لا يمكن تعطيل موديول أساسي.");
    public static Error Disabled(string key) => Error.Forbidden("module.disabled", $"الموديول '{key}' غير مُفعّل لوحدتك.");
}
