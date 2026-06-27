using Application.Features.Roles;
using Xunit;

namespace Application.UnitTests.Roles;

public class RoleValidatorsTests
{
    private readonly CreateRoleRequestValidator _create = new();

    [Fact]
    public void Valid_role_passes()
    {
        var request = new CreateRoleRequest("مدير القسم", "إدارة قسم", [1, 2, 3]);
        Assert.True(_create.Validate(request).IsValid);
    }

    [Fact]
    public void Empty_name_fails()
    {
        var request = new CreateRoleRequest("", null, null);
        Assert.False(_create.Validate(request).IsValid);
    }

    [Fact]
    public void Too_long_name_fails()
    {
        var request = new CreateRoleRequest(new string('x', 101), null, null);
        Assert.False(_create.Validate(request).IsValid);
    }
}
