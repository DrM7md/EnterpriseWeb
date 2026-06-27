using Shared.Pagination;
using Xunit;

namespace Application.UnitTests.Pagination;

public class PagedResultTests
{
    [Theory]
    [InlineData(0, 20, 1, 20)]      // صفحة سالبة/صفر ⇒ 1
    [InlineData(-5, 20, 1, 20)]
    [InlineData(3, 0, 3, 20)]       // حجم غير صالح ⇒ 20
    [InlineData(3, 5000, 3, 20)]    // فوق الحد الأقصى ⇒ 20
    [InlineData(2, 50, 2, 50)]      // صالح ⇒ كما هو
    public void Normalizes_invalid_paging(int page, int size, int expPage, int expSize)
    {
        var request = new PagedRequest { Page = page, PageSize = size };

        Assert.Equal(expPage, request.NormalizedPage);
        Assert.Equal(expSize, request.NormalizedPageSize);
    }

    [Fact]
    public void Skip_is_computed_from_normalized_values()
    {
        Assert.Equal(40, new PagedRequest { Page = 3, PageSize = 20 }.Skip);
        Assert.Equal(0, new PagedRequest { Page = 0, PageSize = 20 }.Skip);
    }

    [Fact]
    public void Total_pages_and_navigation_flags()
    {
        var result = new PagedResult<int>([1, 2, 3], Page: 2, PageSize: 10, TotalCount: 25);

        Assert.Equal(3, result.TotalPages);
        Assert.True(result.HasNext);
        Assert.True(result.HasPrevious);
    }
}
