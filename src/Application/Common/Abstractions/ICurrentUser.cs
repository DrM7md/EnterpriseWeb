namespace Application.Common.Abstractions;

/// <summary>
/// سياق المستخدم الحالي — مصدر العزل والتدقيق. يُملأ من JWT لكل طلب.
/// نطاق المستخدم (UnitScope) يُستخدم في Global Query Filter لفرض RLS تلقائيًا.
/// </summary>
public interface ICurrentUser
{
    long? UserId { get; }
    string? UserName { get; }
    long? UnitId { get; }

    /// <summary>الوحدات التي يسمح نطاق المستخدم برؤيتها (وحدته + شجرتها الفرعية).</summary>
    IReadOnlyCollection<long> UnitScope { get; }

    bool IsAuthenticated { get; }
    bool HasPermission(string permission);
}
