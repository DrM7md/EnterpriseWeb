using Shared.Results;

namespace Application.Common.Abstractions;

/// <summary>
/// خدمة معلومات النظام — أبسط slice لإثبات التدفّق end-to-end في Phase 0.
/// الواجهة تعيش في Application؛ التنفيذ في Infrastructure (قاعدة التبعية نحو الداخل).
/// </summary>
public interface ISystemInfoService
{
    Result<SystemInfo> GetSystemInfo();
}

/// <summary>DTO يُسقَط مباشرة (لا كيان كامل ثم mapping).</summary>
public sealed record SystemInfo(
    string Name,
    string Version,
    string Environment,
    DateTimeOffset ServerTimeUtc,
    IReadOnlyList<string> SupportedLanguages);
