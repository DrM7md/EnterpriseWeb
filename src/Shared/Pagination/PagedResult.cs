namespace Shared.Pagination;

/// <summary>طلب صفحة موحّد: ترقيم + بحث + ترتيب. يُترجَم إلى query params.</summary>
public sealed record PagedRequest
{
    private const int MaxPageSize = 200;

    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = false;

    /// <summary>قيم مُطهَّرة (تمنع SELECT بلا حد أو صفحات سالبة).</summary>
    public int NormalizedPage => Page < 1 ? 1 : Page;
    public int NormalizedPageSize => PageSize is < 1 or > MaxPageSize ? 20 : PageSize;
    public int Skip => (NormalizedPage - 1) * NormalizedPageSize;
}

/// <summary>نتيجة صفحة: العناصر + بيانات الترقيم الكلية.</summary>
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;

    public static PagedResult<T> Empty(int pageSize) => new([], 1, pageSize, 0);
}
