using API.Common;
using Application.Features.Reports;

namespace API.Endpoints;

/// <summary>متابعة التقارير غير المتزامنة وتنزيلها — معزولة حسب نطاق المستخدم.</summary>
public static class ReportsEndpoints
{
    public static IEndpointRouteBuilder MapReportsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/reports").WithTags("Reports").RequireAuthorization();

        group.MapGet("/", async (IReportService service, CancellationToken ct) =>
                Results.Ok(await service.ListMineAsync(ct)))
            .WithName("ListMyReports")
            .WithSummary("تقاريري (آخر 50).");

        group.MapGet("/{id:long}", async (long id, IReportService service, CancellationToken ct) =>
                (await service.GetStatusAsync(id, ct)).ToHttpResult())
            .WithName("GetReportStatus")
            .WithSummary("حالة تقرير (للـ polling).");

        group.MapGet("/{id:long}/download", async (long id, IReportService service, CancellationToken ct) =>
            {
                var result = await service.DownloadAsync(id, ct);
                return result.IsSuccess
                    ? Results.File(result.Value.Content, result.Value.ContentType, result.Value.FileName)
                    : result.ToHttpResult();
            })
            .WithName("DownloadReport")
            .WithSummary("تنزيل ملف التقرير عند جاهزيته.");

        return app;
    }
}
