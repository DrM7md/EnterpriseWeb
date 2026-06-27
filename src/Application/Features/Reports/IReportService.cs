using Application.Common.Reporting;
using Shared.Results;

namespace Application.Features.Reports;

public interface IReportService
{
    /// <summary>يُنشئ طلب تقرير مستخدمين ويجدوله للخلفية. يُعيد معرّف الطلب.</summary>
    Task<long> EnqueueUsersExportAsync(ReportFormat format, string? search, CancellationToken ct = default);

    Task<IReadOnlyList<ReportStatusDto>> ListMineAsync(CancellationToken ct = default);
    Task<Result<ReportStatusDto>> GetStatusAsync(long id, CancellationToken ct = default);
    Task<Result<ReportFile>> DownloadAsync(long id, CancellationToken ct = default);
}

/// <summary>المنفّذ الفعلي للـ job (يُستدعى من Hangfire بلا سياق HTTP).</summary>
public interface IReportJobRunner
{
    Task RunAsync(long reportRequestId, CancellationToken ct = default);
}

public static class ReportErrors
{
    public static readonly Error NotFound = Error.NotFound("report.not_found", "التقرير غير موجود أو خارج نطاقك.");
    public static readonly Error NotReady = Error.Conflict("report.not_ready", "التقرير لم يكتمل بعد.");
    public static readonly Error FileMissing = Error.NotFound("report.file_missing", "ملف التقرير غير متاح.");
}
