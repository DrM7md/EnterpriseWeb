using Application.Common.Reporting;

namespace Application.Features.Reports;

public sealed record ReportStatusDto(
    long Id,
    string Type,
    string Format,
    string Status,
    int? RowCount,
    string? FileName,
    string? Error,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? CompletedAtUtc)
{
    public bool IsReady => Status == nameof(Domain.Entities.ReportStatus.Completed);
}

public sealed record EnqueueReportRequest(ReportFormat Format, string? Search);
