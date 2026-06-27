using Domain.Common;

namespace Domain.Entities;

public enum ReportStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
}

/// <summary>
/// طلب تقرير غير متزامن (يُولَّد بالخلفية عبر Hangfire). معزول حسب الوحدة،
/// ويحمل نطاق صاحبه وقت الطلب (ScopeJson) ليُولّد الـ job بنفس العزل دون سياق HTTP.
/// </summary>
public class ReportRequest : AuditableEntity, IOwnedByUnit
{
    public long OwnerUnitId { get; set; }

    public long RequestedBy { get; set; }
    public string Type { get; set; } = string.Empty;     // مثل "users"
    public string Format { get; set; } = string.Empty;   // "Excel" | "Pdf"
    public string? Search { get; set; }

    /// <summary>نطاق العزل وقت الطلب (قائمة معرّفات وحدات بصيغة JSON).</summary>
    public string ScopeJson { get; set; } = "[]";

    public ReportStatus Status { get; set; } = ReportStatus.Pending;
    public int? RowCount { get; set; }
    public string? FileKey { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public string? Error { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
}
