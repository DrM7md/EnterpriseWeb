using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Common.Abstractions;
using Application.Common.Security;
using Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Identity;

internal sealed class JwtTokenGenerator(IOptions<JwtOptions> options, IDateTimeProvider clock) : IJwtTokenGenerator
{
    private readonly JwtOptions _options = options.Value;

    public AccessToken Generate(User user, IReadOnlyCollection<string> permissions, IReadOnlyCollection<long> unitScope)
    {
        var expires = clock.UtcNow.AddMinutes(_options.AccessTokenMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, user.UserName),
            new(AppClaimTypes.Email, user.Email),
            new(AppClaimTypes.UnitId, user.OwnerUnitId.ToString()),
        };
        claims.AddRange(permissions.Select(p => new Claim(AppClaimTypes.Permission, p)));
        claims.AddRange(unitScope.Select(u => new Claim(AppClaimTypes.UnitScope, u.ToString())));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: clock.UtcNow.UtcDateTime,
            expires: expires.UtcDateTime,
            signingCredentials: creds);

        var value = new JwtSecurityTokenHandler().WriteToken(token);
        return new AccessToken(value, expires);
    }
}

/// <summary>أسماء الـ claims المخصّصة — مصدر حقيقة واحد لتوليد الرموز وقراءتها.</summary>
public static class AppClaimTypes
{
    public const string Email = "email";
    public const string UnitId = "unit_id";
    public const string UnitScope = "unit_scope";
    public const string Permission = "permission";
}
