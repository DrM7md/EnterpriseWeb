using System.Text;
using Application.Common.Reporting;
using Infrastructure.Reporting;
using QuestPDF.Infrastructure;
using Xunit;

namespace Infrastructure.UnitTests.Reporting;

public class ReportEngineTests
{
    static ReportEngineTests() => QuestPDF.Settings.License = LicenseType.Community;

    private static readonly TabularReport Sample = new(
        Title: "تقرير اختبار",
        Columns: ["A", "B"],
        Rows: [["1", "2"], ["3", "4"]],
        GeneratedBy: "tester",
        GeneratedAtUtc: new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));

    private static ReportEngine NewEngine() =>
        new([new ExcelReportWriter(), new PdfReportWriter()]);

    [Fact]
    public void Excel_produces_valid_xlsx_zip()
    {
        var file = NewEngine().Generate(Sample, ReportFormat.Excel);

        // xlsx = حاوية ZIP تبدأ بـ "PK".
        Assert.Equal((byte)'P', file.Content[0]);
        Assert.Equal((byte)'K', file.Content[1]);
        Assert.EndsWith(".xlsx", file.FileName);
        Assert.Contains("spreadsheetml", file.ContentType);
        Assert.True(file.Content.Length > 500);
    }

    [Fact]
    public void Pdf_produces_valid_pdf()
    {
        var file = NewEngine().Generate(Sample, ReportFormat.Pdf);

        // PDF يبدأ بـ "%PDF".
        Assert.Equal("%PDF", Encoding.ASCII.GetString(file.Content, 0, 4));
        Assert.Equal("application/pdf", file.ContentType);
        Assert.True(file.Content.Length > 800);
    }

    [Fact]
    public void Unsupported_format_throws()
    {
        // محرّك بكاتب Excel فقط، نطلب PDF.
        var engine = new ReportEngine([new ExcelReportWriter()]);
        Assert.Throws<NotSupportedException>(() => engine.Generate(Sample, ReportFormat.Pdf));
    }
}
