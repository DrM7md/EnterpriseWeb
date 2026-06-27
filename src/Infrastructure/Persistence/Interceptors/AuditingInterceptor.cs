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
/// </summary>
public sealed class AuditingInterceptor(ICurrentUser currentUser, IDateTimeProvider clock)
    : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            Apply(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
            Apply(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    private void Apply(DbContext context)
    {
        var now = clock.UtcNow;
        var userId = currentUser.UserId;
        var correlationId = Activity.Current?.Id;
        var auditEntries = new List<AuditLog>();

        foreach (var entry in context.ChangeTracker.Entries().ToList())
        {
            if (entry.Entity is AuditLog)
                continue;

            // ربط السجل الجديد بنطاق المستخدم إن لم يُحدَّد صراحةً.
            if (entry is { State: EntityState.Added, Entity: IOwnedByUnit owned } && owned.OwnerUnitId == 0 && currentUser.UnitId is { } unit)
                owned.OwnerUnitId = unit;

            // حقول التدقيق.
            if (entry.Entity is IAuditable auditable)
            {
                if (entry.State == EntityState.Added)
                {
                    auditable.CreatedAtUtc = now;
                    auditable.CreatedBy = userId;
                }
                else if (entry.State == EntityState.Modified)
                {
                    auditable.UpdatedAtUtc = now;
                    auditable.UpdatedBy = userId;
                }
            }

            // تحويل الحذف الصلب إلى ناعم.
            if (entry is { State: EntityState.Deleted, Entity: ISoftDeletable softDeletable })
            {
                entry.State = EntityState.Modified;
                softDeletable.IsDeleted = true;
                softDeletable.DeletedAtUtc = now;
                softDeletable.DeletedBy = userId;
            }

            var action = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Modified => softDeletedNow(entry) ? "Deleted" : "Updated",
                _ => null
            };

            if (action is not null && entry.Entity is Entity domainEntity)
            {
                auditEntries.Add(new AuditLog
                {
                    EntityName = entry.Entity.GetType().Name,
                    EntityId = domainEntity.Id.ToString(),
                    Action = action,
                    ChangesJson = BuildChanges(entry),
                    UserId = userId,
                    UserName = currentUser.UserName,
                    OwnerUnitId = (entry.Entity as IOwnedByUnit)?.OwnerUnitId,
                    CorrelationId = correlationId,
                    TimestampUtc = now,
                });
            }
        }

        if (auditEntries.Count > 0)
            context.Set<AuditLog>().AddRange(auditEntries);
    }

    private static bool softDeletedNow(EntityEntry entry) =>
        entry.Entity is ISoftDeletable s && s.IsDeleted && entry.Property(nameof(ISoftDeletable.IsDeleted)).IsModified;

    private static string? BuildChanges(EntityEntry entry)
    {
        var changes = new Dictionary<string, object?>();
        foreach (var prop in entry.Properties)
        {
            if (prop.Metadata.Name is "PasswordHash" or "RowVersion")
                continue;

            if (entry.State == EntityState.Added)
            {
                changes[prop.Metadata.Name] = prop.CurrentValue;
            }
            else if (prop.IsModified && !Equals(prop.OriginalValue, prop.CurrentValue))
            {
                changes[prop.Metadata.Name] = new { from = prop.OriginalValue, to = prop.CurrentValue };
            }
        }
        return changes.Count == 0 ? null : JsonSerializer.Serialize(changes);
    }
}
