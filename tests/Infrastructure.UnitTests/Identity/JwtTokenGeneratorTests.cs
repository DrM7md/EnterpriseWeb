using System.IdentityModel.Tokens.Jwt;
using Application.Common.Abstractions;
using Application.Common.Security;
using Domain.Entities;
using Infrastructure.Identity;
using Microsoft.Extensions.Options;
using Xunit;

namespace Infrastructure.UnitTests.Identity;

public class JwtTokenGeneratorTests
{
    private sealed class FixedClock : IDateTimeProvider
    {
        public DateTimeOffset UtcNow => new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
    }

    private static JwtTokenGenerator CreateSut() => new(
        Options.Create(new JwtOptions
        {
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            SigningKey = "test-signing-key-at-least-32-bytes-long!!",
            AccessTokenMinutes = 15,
        }),
        new FixedClock());

    [Fact]
    public void Generate_embeds_subject_unit_permissions_and_scope()
    {
        var user = new User { Email = "a@b.gov", UserName = "admin", OwnerUnitId = 7 };
        typeof(Domain.Common.Entity).GetProperty("Id")!.SetValue(user, 42L);

        var token = CreateSut().Generate(user, ["users.read", "users.create"], [7, 8, 9]);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token.Value);

        Assert.Equal("42", jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("7", jwt.Claims.First(c => c.Type == AppClaimTypes.UnitId).Value);
        Assert.Equal(2, jwt.Claims.Count(c => c.Type == AppClaimTypes.Permission));
        Assert.Equal(3, jwt.Claims.Count(c => c.Type == AppClaimTypes.UnitScope));
        Assert.Equal("TestIssuer", jwt.Issuer);
    }

    [Fact]
    public void Generate_sets_expiry_from_clock_plus_lifetime()
    {
        var token = CreateSut().Generate(new User(), [], []);

        Assert.Equal(new DateTimeOffset(2026, 1, 1, 0, 15, 0, TimeSpan.Zero), token.ExpiresAtUtc);
    }
}
