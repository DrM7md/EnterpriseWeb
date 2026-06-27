namespace Application.Common.Reporting;

public enum ReportFormat
{
    Excel = 0,
    Pdf = 1,
}

/// <summary>
/// نموذج تقرير جدولي محايد للصيغة — أي موديول يبنيه، والمحرّك يصيّره لأي صيغة.
/// (فصل بناء البيانات عن التصيير — نمط Strategy.)
/// </summary>
public sealed record TabularReport(
    string Title,
    IReadOnlyList<string> Columns,
    IReadOnlyList<IReadOnlyList<string>> Rows,
    string? GeneratedBy = null,
    DateTimeOffset? GeneratedAtUtc = null);

/// <summary>ناتج التقرير: بايتات + نوع المحتوى + اسم الملف المقترح.</summary>
public sealed record ReportFile(byte[] Content, string ContentType, string FileName);

/// <summary>محرّك التقارير — يصيّر تقريرًا جدوليًا إلى الصيغة المطلوبة.</summary>
public interface IReportEngine
{
    ReportFile Generate(TabularReport report, ReportFormat format);
}

/// <summary>كاتب صيغة واحدة (Strategy). يُسجَّل كل كاتب ويُختار بالـ Format.</summary>
public interface IReportWriter
{
    ReportFormat Format { get; }
    ReportFile Write(TabularReport report);
}
