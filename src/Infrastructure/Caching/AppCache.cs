using System.Diagnostics.Metrics;
using Application.Common.Abstractions;
using Microsoft.Extensions.Caching.Memory;

namespace Infrastructure.Caching;

/// <summary>
/// تخزين مؤقت مُجهَّز بعدّادات OpenTelemetry (hits/misses) عبر Meter "EnterpriseSystem.Cache"
/// — تظهر في /metrics لإثبات فعالية الكاش.
/// </summary>
internal sealed class AppCache : IAppCache
{
    public const string MeterName = "EnterpriseSystem.Cache";

    private readonly IMemoryCache _cache;
    private readonly Counter<long> _hits;
    private readonly Counter<long> _misses;

    public AppCache(IMemoryCache cache, IMeterFactory meterFactory)
    {
        _cache = cache;
        var meter = meterFactory.Create(MeterName);
        _hits = meter.CreateCounter<long>("app_cache_hits");
        _misses = meter.CreateCounter<long>("app_cache_misses");
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken ct = default)
    {
        var tag = new KeyValuePair<string, object?>("cache", key);

        if (_cache.TryGetValue(key, out T? cached) && cached is not null)
        {
            _hits.Add(1, tag);
            return cached;
        }

        _misses.Add(1, tag);
        var value = await factory(ct);
        _cache.Set(key, value, ttl);
        return value;
    }

    public void Remove(string key) => _cache.Remove(key);
}
