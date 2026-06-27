using Domain.Common;

namespace Domain.Entities;

/// <summary>سجل تدقيق ثابت (append-only): من/متى/ماذا/قبل-بعد + معرّف الارتباط.</summary>
public class AuditLog : Entity
{
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;

    /// <summary>Created / Updated / Deleted.</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>JSON يحوي القيم قبل/بعد للحقول المتغيّرة.</summary>
    public string? ChangesJson { get; set; }

    public long? UserId { get; set; }
    public string? UserName { get; set; }
    public long? OwnerUnitId { get; set; }

    public string? CorrelationId { get; set; }
    public DateTimeOffset TimestampUtc { get; set; }
}
