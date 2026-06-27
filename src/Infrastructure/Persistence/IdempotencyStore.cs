using Application.Common.Abstractions;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

internal sealed class IdempotencyStore(AppDbContext db) : IIdempotencyStore
{
    public async Task<StoredResponse?> GetAsync(string key, long userId, CancellationToken ct = default)
    {
        var record = await db.IdempotencyRecords.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Key == key && r.UserId == userId, ct);

        return record is null ? null : new StoredResponse(record.StatusCode, record.ContentType, record.ResponseBody);
    }

    public async Task<bool> TrySaveAsync(string key, long userId, string method, string path,
        int statusCode, string? contentType, string responseBody, CancellationToken ct = default)
    {
        db.IdempotencyRecords.Add(new IdempotencyRecord
        {
            Key = key,
            UserId = userId,
            Method = method,
            Path = path,
            StatusCode = statusCode,
            ContentType = contentType,
            ResponseBody = responseBody,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        try
        {
            await db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException) // انتهاك الفهرس الفريد: طلب متزامن سبقنا.
        {
            return false;
        }
    }
}
