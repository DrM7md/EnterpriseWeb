using Application.Common.Reporting;
using ClosedXML.Excel;

namespace Infrastructure.Reporting;

/// <summary>كاتب Excel عبر ClosedXML — رأس مُنسّق + تجميد الصف الأول + ضبط العرض.</summary>
internal sealed class ExcelReportWriter : IReportWriter
{
    public ReportFormat Format => ReportFormat.Excel;

    public ReportFile Write(TabularReport report)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add(Sanitize(report.Title));
        ws.RightToLeft = true;

        // الرأس.
        for (var c = 0; c < report.Columns.Count; c++)
        {
            var cell = ws.Cell(1, c + 1);
            cell.Value = report.Columns[c];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#14171F");
            cell.Style.Font.FontColor = XLColor.White;
        }

        // الصفوف.
        for (var r = 0; r < report.Rows.Count; r++)
            for (var c = 0; c < report.Rows[r].Count; c++)
                ws.Cell(r + 2, c + 1).Value = report.Rows[r][c];

        ws.SheetView.FreezeRows(1);
        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new ReportFile(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"{Slug(report.Title)}.xlsx");
    }

    private static string Sanitize(string title)
    {
        var cleaned = new string(title.Where(ch => !"[]*?/\\:".Contains(ch)).ToArray());
        return cleaned.Length is > 0 and <= 31 ? cleaned : "Report";
    }

    private static string Slug(string title) => $"report-{title.GetHashCode():x8}";
}
