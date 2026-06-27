using System.Text.Json;
using Application.Common.Abstractions;
using Application.Common.Reporting;
using Application.Features.Reports;
using Application.Features.Users;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Reporting;

/// <summary>
/// منفّذ الـ job (Hangfire). يعمل بلا سياق HTTP: يطبّق العزل بالنطاق المحفوظ في الطلب،
/// يولّد الملف عبر المحرّك، يخزّنه، ويُحدّث حالة الطلب. أي فشل → Failed مع رسالة.
/// </summary>
internal sealed class ReportJobRunner(
    IAppDbContext db,
    IUserService userService,
    IReportEngine engine,
    IFileStorage storage,
    ILogger<ReportJobRunner> logger) : IReportJobRunner
{
    public async Task RunAsync(long reportRequestId, CancellationToken ct = default)
    {
        // الـ job بلا scope — نتجاوز فلتر العزل ونعتمد النطاق المحفوظ في الطلب.
        var request = await db.ReportRequests.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == reportRequestId, ct);
        if (request is null)
        {
            logger.LogWarning("Report request {Id} not found", reportRequestId);
            return;
        }

        try
        {
            request.Status = ReportStatus.Processing;
            await db.SaveChangesAsync(ct);

            var scope = JsonSerializer.Deserialize<long[]>(request.ScopeJson) ?? [];
            var format = Enum.Parse<ReportFormat>(request.Format);

            var report = await userService.BuildExportForScopeAsync(scope, request.Search, $"user:{request.RequestedBy}", ct);
            var file = engine.Generate(report, format);
            var key = await storage.SaveAsync(file.Content, file.FileName, ct);

            request.Status = ReportStatus.Completed;
            request.FileKey = key;
            request.FileName = file.FileName;
            request.ContentType = file.ContentType;
            request.RowCount = report.Rows.Count;
            request.CompletedAtUtc = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);

            logger.LogInformation("Report {Id} completed ({Rows} rows)", reportRequestId, report.Rows.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Report {Id} failed", reportRequestId);
            request.Status = ReportStatus.Failed;
            request.Error = ex.Message;
            request.CompletedAtUtc = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            throw; // ليُسجّله Hangfire ويُعيد المحاولة وفق سياسته.
        }
    }
}
