using Application.Common.Reporting;

namespace Infrastructure.Reporting;

/// <summary>محرّك التقارير — يوزّع التصيير على الكاتب المناسب حسب الصيغة (Strategy).</summary>
internal sealed class ReportEngine : IReportEngine
{
    private readonly IReadOnlyDictionary<ReportFormat, IReportWriter> _writers;

    public ReportEngine(IEnumerable<IReportWriter> writers)
        => _writers = writers.ToDictionary(w => w.Format);

    public ReportFile Generate(TabularReport report, ReportFormat format)
    {
        if (!_writers.TryGetValue(format, out var writer))
            throw new NotSupportedException($"صيغة التقرير غير مدعومة: {format}");
        return writer.Write(report);
    }
}
