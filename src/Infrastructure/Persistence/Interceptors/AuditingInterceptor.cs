using System.Diagnostics;
using System.Text.Json;
using Application.Common.Abstractions;
using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Infrastructure.Persistence.Interceptors;

/// <summary>
/// يضبط حقول التدقيق، يربط السجلات الجديدة بوحدة المستخدم (لا سجل بلا scope)،
/// يحوّل الحذف الصلب إلى حذف ناعم، ويكتب AuditLog لكل كتابة حسّاسة.
///
/// التدقيق على مرحلتين: نلتقط التغييرات قبل الحفظ، لكن نكتب سجلّ الإنشاء **بعد** الحفظ
/// لأن المفتاح (Identity) يُولَّد أثناء الحفظ — وإلا سُجِّل EntityId=0 للسجلات الجديدة.
/// </summary>
public sealed class AuditingInterceptor(ICurrentUser currentUser, IDateTimeProvider clock)
    : SaveChangesInterceptor
{
    private readonly List<PendingAudit> _pending = [];
    private bool _writingAudit;

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null && !_writingAudit)
            Capture(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null && !_writingAudit && _pending.Count > 0)
            await FlushAsync(eventData.Context, cancellationToken);
        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        if (eventData.Context is not null && !_writingAudit)
            Capture(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        if (eventData.Context is not null && !_writingAudit && _pending.Count > 0)
            FlushAsync(eventData.Context, CancellationToken.None).GetAwaiter().GetResult();
        return base.SavedChanges(eventData, result);
    }

    private void Capture(DbContext context)
    {
        var now = clock.UtcNow;
        var userId = currentUser.UserId;
        var correlationId = Activity.Current?.Id;

        foreach (var entry in context.ChangeTracker.Entries().ToList())
        {
            if (entry.Entity is AuditLog || entry.Entity is not Entity domainEntity)
                continue;

            // ربط السجل الجديد بنطاق المستخدم إن لم يُحدَّد صراحةً.
            if (entry is { State: EntityState.Added, Entity: IOwnedByUnit owned } && owned.OwnerUnitId == 0 && currentUser.UnitId is { } unit)
                owned.OwnerUnitId = unit;

            if (entry.Entity is IAuditable auditable)
            {
                if (entry.State == EntityState.Added) { auditable.CreatedAtUtc = now; auditable.CreatedBy = userId; }
                else if (entry.State == EntityState.Modified) { auditable.UpdatedAtUtc = now; auditable.UpdatedBy = userId; }
            }

            var isSoftDelete = entry is { State: EntityState.Deleted, Entity: ISoftDeletable };
            if (isSoftDelete)
            {
                entry.State = EntityState.Modified;
                var s = (ISoftDeletable)entry.Entity;
                s.IsDeleted = true; s.DeletedAtUtc = now; s.DeletedBy = userId;
            }

            var action = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Modified => isSoftDelete ? "Deleted" : "Updated",
                _ => null
            };
            if (action is null)
                continue;

            _pending.Add(new PendingAudit(
                Entry: entry,
                DeferId: entry.State == EntityState.Added,
                EntityName: entry.Entity.GetType().Name,
                EntityId: domainEntity.Id.ToString(),
                Action: action,
                ChangesJson: BuildChanges(entry),
                OwnerUnitId: (entry.Entity as IOwnedByUnit)?.OwnerUnitId,
                UserId: userId,
                UserName: currentUser.UserName,
                CorrelationId: correlationId,
                TimestampUtc: now));
        }
    }

    private async Task FlushAsync(DbContext context, CancellationToken ct)
    {
        var logs = _pending.Select(p => new AuditLog
        {
            EntityName = p.EntityName,
            EntityId = p.DeferId ? ((Entity)p.Entry.Entity).Id.ToString() : p.EntityId, // المفتاح صار معروفًا بعد الحفظ
            Action = p.Action,
            ChangesJson = p.ChangesJson,
            UserId = p.UserId,
            UserName = p.UserName,
            OwnerUnitId = p.OwnerUnitId,
            CorrelationId = p.CorrelationId,
            TimestampUtc = p.TimestampUtc,
        }).ToList();

        _pending.Clear();

        context.Set<AuditLog>().AddRange(logs);
        _writingAudit = true;
        try { await context.SaveChangesAsync(ct); }
        finally { _writingAudit = false; }
    }

    private static string? BuildChanges(EntityEntry entry)
    {
        var changes = new Dictionary<string, object?>();
        foreach (var prop in entry.Properties)
        {
            if (prop.Metadata.Name is "PasswordHash" or "RowVersion" or "Id")
                continue;

            if (entry.State == EntityState.Added)
                changes[prop.Metadata.Name] = prop.CurrentValue;
            else if (prop.IsModified && !Equals(prop.OriginalValue, prop.CurrentValue))
                changes[prop.Metadata.Name] = new { from = prop.OriginalValue, to = prop.CurrentValue };
        }
        return changes.Count == 0 ? null : JsonSerializer.Serialize(changes);
    }

    private sealed record PendingAudit(
        EntityEntry Entry, bool DeferId, string EntityName, string EntityId, string Action,
        string? ChangesJson, long? OwnerUnitId, long? UserId, string? UserName, string? CorrelationId, DateTimeOffset TimestampUtc);
}
