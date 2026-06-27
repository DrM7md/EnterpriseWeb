using System.Security.Claims;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Infrastructure.UnitTests.Identity;

public class CurrentUserTests
{
    private static CurrentUser WithClaims(params Claim[] claims)
    {
        var ctx = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims, authenticationType: "Test")),
        };
        return new CurrentUser(new HttpContextAccessor { HttpContext = ctx });
    }

    [Fact]
    public void Reads_identity_unit_scope_and_permissions_from_claims()
    {
        var user = WithClaims(
            new Claim("sub", "42"),
            new Claim(ClaimTypes.Name, "admin"),
            new Claim(AppClaimTypes.UnitId, "7"),
            new Claim(AppClaimTypes.UnitScope, "7"),
            new Claim(AppClaimTypes.UnitScope, "8"),
            new Claim(AppClaimTypes.Permission, "users.read"));

        Assert.Equal(42, user.UserId);
        Assert.Equal("admin", user.UserName);
        Assert.Equal(7, user.UnitId);
        Assert.Equal([7L, 8L], user.UnitScope);
        Assert.True(user.IsAuthenticated);
        Assert.True(user.HasPermission("users.read"));
        Assert.False(user.HasPermission("users.delete"));
    }

    [Fact]
    public void Anonymous_user_has_empty_scope_and_no_permissions()
    {
        var user = new CurrentUser(new HttpContextAccessor { HttpContext = null });

        Assert.Null(user.UserId);
        Assert.Empty(user.UnitScope);   // fail-closed: لا نطاق ⇒ لا صفوف
        Assert.False(user.IsAuthenticated);
        Assert.False(user.HasPermission("users.read"));
    }
}
