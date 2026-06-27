using Application.Features.OrgUnits;
using Xunit;

namespace Application.UnitTests.OrgUnits;

public class OrgUnitValidatorsTests
{
    private readonly CreateOrgUnitRequestValidator _create = new();

    [Theory]
    [InlineData("قطاع التعليم", "EDU", true)]
    [InlineData("قسم", "DEP-01", true)]
    [InlineData("", "EDU", false)]            // اسم فارغ
    [InlineData("قطاع", "", false)]           // رمز فارغ
    [InlineData("قطاع", "bad code", false)]   // مسافة في الرمز
    [InlineData("قطاع", "رمز", false)]        // رمز غير لاتيني
    public void Validates_create_request(string name, string code, bool expectedValid)
    {
        var result = _create.Validate(new CreateOrgUnitRequest(name, code, ParentId: null));
        Assert.Equal(expectedValid, result.IsValid);
    }
}
