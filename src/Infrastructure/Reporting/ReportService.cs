using System.Text.Json;
using Application.Common.Abstractions;
using Application.Common.Reporting;
using Application.Features.Reports;
using Domain.Entities;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Shared.Results;

namespace Infrastructure.Reporting;

/// <summary>
/// خدمة التقارير غير المتزامنة: تُنشئ الطلب (مع نطاق صاحبه) وتجدوله للخلفية،
/// وتتيح متابعة الحالة والتنزيل — كله معزول حسب نطاق المستخدم.
/// </summary>
internal sealed class ReportService(
    IAppDbContext db,
    ICurrentUser currentUser,
    IFileStorage storage,
    IBackgroundJobClient jobs) : IReportService
{
    public async Task<long> EnqueueUsersExportAsync(ReportFormat format, string? search, CancellationToken ct = default)
    {
        var request = new ReportRequest
        {
            OwnerUnitId = currentUser.UnitId ?? 0,
            RequestedBy = currentUser.UserId ?? 0,
            Type = "users",
            Format = format.ToString(),
            Search = search,
            ScopeJson = JsonSerializer.Serialize(currentUser.UnitScope),
            Status = ReportStatus.Pending,
        };
        db.ReportRequests.Add(request);
        await db.SaveChangesAsync(ct);

        // يُنفَّذ بالخلفية — لا يُولَّد الملف داخل الـ request.
        jobs.Enqueue<IReportJobRunner>(runner => runner.RunAsync(request.Id, CancellationToken.None));
        return request.Id;
    }

    public async Task<IReadOnlyList<ReportStatusDto>> ListMineAsync(CancellationToken ct = default)
    {
        var rows = await db.ReportRequests.AsNoTracking()   // معزول تلقائيًا حسب النطاق
            .OrderByDescending(r => r.CreatedAtUtc).Take(50).ToListAsync(ct);
        return rows.Select(Map).ToList();
    }

    public async Task<Result<ReportStatusDto>> GetStatusAsync(long id, CancellationToken ct = default)
    {
        var report = await db.ReportRequests.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id, ct);
        return report is null ? ReportErrors.NotFound : Map(report);
    }

    public async Task<Result<ReportFile>> DownloadAsync(long id, CancellationToken ct = default)
    {
        var report = await db.ReportRequests.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id, ct);
        if (report is null)
            return ReportErrors.NotFound;
        if (report.Status != ReportStatus.Completed || report.FileKey is null)
            return Result.Failure<ReportFile>(ReportErrors.NotReady);

        var bytes = await storage.ReadAsync(report.FileKey, ct);
        return bytes is null
            ? Result.Failure<ReportFile>(ReportErrors.FileMissing)
            : new ReportFile(bytes, report.ContentType ?? "application/octet-stream", report.FileName ?? "report");
    }

    private static ReportStatusDto Map(ReportRequest r) => new(
        r.Id, r.Type, r.Format, r.Status.ToString(), r.RowCount, r.FileName, r.Error, r.CreatedAtUtc, r.CompletedAtUtc);
}
