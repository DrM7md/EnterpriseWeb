using Application.Common.Reporting;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Infrastructure.Reporting;

/// <summary>
/// كاتب PDF عبر QuestPDF — رأس/تذييل + جدول RTL. يدعم العربية مع خط مناسب
/// (الافتراضي قد لا يصيّر كل المحارف؛ يُضبَط خط عربي في الإنتاج).
/// </summary>
internal sealed class PdfReportWriter : IReportWriter
{
    public ReportFormat Format => ReportFormat.Pdf;

    public ReportFile Write(TabularReport report)
    {
        var bytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(24);
                page.DefaultTextStyle(x => x.FontSize(9).DirectionFromRightToLeft());

                page.Header().Column(col =>
                {
                    col.Item().Text(report.Title).FontSize(16).Bold();
                    col.Item().Text($"{report.GeneratedBy} · {report.GeneratedAtUtc:yyyy-MM-dd HH:mm} UTC")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                });

                page.Content().PaddingVertical(10).Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        for (var i = 0; i < report.Columns.Count; i++)
                            cols.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        foreach (var c in report.Columns)
                            header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text(c).FontColor(Colors.White).Bold();
                    });

                    foreach (var row in report.Rows)
                        foreach (var cell in row)
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(cell);
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("صفحة ");
                    t.CurrentPageNumber();
                    t.Span(" / ");
                    t.TotalPages();
                });
            });
        }).GeneratePdf();

        return new ReportFile(bytes, "application/pdf", $"report-{report.Title.GetHashCode():x8}.pdf");
    }
}
