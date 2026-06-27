using System.Security.Cryptography;
using Application.Common.Abstractions;
using Application.Common.Security;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Shared.Results;

namespace Application.Features.Auth;

public interface IAuthService
{
    Task<Result<AuthResult>> LoginAsync(LoginRequest request, string ipAddress, CancellationToken ct = default);
    Task<Result<AuthResult>> RefreshAsync(RefreshRequest request, string ipAddress, CancellationToken ct = default);
    Task<Result> LogoutAsync(string refreshToken, CancellationToken ct = default);
}

/// <summary>
/// مصادقة بـ JWT + تدوير رموز التحديث مع كشف إعادة الاستخدام.
/// مسارات المصادقة تتجاوز فلتر العزل صراحةً (IgnoreQueryFilters) — عملية نظام مُبرَّرة.
/// </summary>
internal sealed class AuthService(
    IAppDbContext db,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtGenerator,
    IDateTimeProvider clock,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public async Task<Result<AuthResult>> LoginAsync(LoginRequest request, string ipAddress, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();

        var user = await db.Users
            .IgnoreQueryFilters()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail && !u.IsDeleted, ct);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            return AuthErrors.InvalidCredentials;

        if (!user.IsActive)
            return AuthErrors.UserInactive;

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task<Result<AuthResult>> RefreshAsync(RefreshRequest request, string ipAddress, CancellationToken ct = default)
    {
        var tokenHash = passwordHasher.HashToken(request.RefreshToken);

        var stored = await db.RefreshTokens
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        if (stored is null)
            return AuthErrors.InvalidRefreshToken;

        // كشف إعادة الاستخدام: رمز مُبطَل سبق استبداله ⇒ تسريب ⇒ أبطِل كل سلسلة المستخدم.
        if (stored.RevokedAtUtc is not null)
        {
            await RevokeAllActiveAsync(stored.UserId, ct);
            await db.SaveChangesAsync(ct);
            return AuthErrors.InvalidRefreshToken;
        }

        if (clock.UtcNow >= stored.ExpiresAtUtc)
            return AuthErrors.InvalidRefreshToken;

        var user = await db.Users
            .IgnoreQueryFilters()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == stored.UserId && !u.IsDeleted, ct);

        if (user is null || !user.IsActive)
            return AuthErrors.InvalidRefreshToken;

        // تدوير: أبطِل القديم واربطه بالجديد.
        var result = await IssueTokensAsync(user, ipAddress, ct, persist: false);
        var issued = result.Value;
        stored.RevokedAtUtc = clock.UtcNow;
        stored.ReplacedByTokenHash = passwordHasher.HashToken(issued.RefreshToken);
        await db.SaveChangesAsync(ct);

        return issued;
    }

    public async Task<Result> LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var tokenHash = passwordHasher.HashToken(refreshToken);
        var stored = await db.RefreshTokens.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        if (stored is { RevokedAtUtc: null })
        {
            stored.RevokedAtUtc = clock.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return Result.Success();
    }

    private async Task<Result<AuthResult>> IssueTokensAsync(User user, string ipAddress, CancellationToken ct, bool persist = true)
    {
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToArray();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToArray();

        // نطاق العزل = وحدة المستخدم + شجرتها الفرعية (يُحسب عبر المسار المادي).
        var unitScope = await ComputeUnitScopeAsync(user.OwnerUnitId, ct);

        var access = jwtGenerator.Generate(user, permissions, unitScope);

        var rawRefresh = GenerateRefreshToken();
        var refreshExpires = clock.UtcNow.AddDays(_jwt.RefreshTokenDays);

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = passwordHasher.HashToken(rawRefresh),
            ExpiresAtUtc = refreshExpires,
            CreatedAtUtc = clock.UtcNow,
            CreatedByIp = ipAddress,
        });

        if (persist)
            await db.SaveChangesAsync(ct);

        var authUser = new AuthUser(user.Id, user.UserName, user.Email, user.FullName, user.OwnerUnitId, roles, permissions);
        return new AuthResult(access.Value, access.ExpiresAtUtc, rawRefresh, refreshExpires, authUser);
    }

    /// <summary>وحدة المستخدم وكل أحفادها (Path يبدأ بمسار وحدته). يتجاوز فلتر العزل (عملية نظام).</summary>
    private async Task<long[]> ComputeUnitScopeAsync(long unitId, CancellationToken ct)
    {
        var unit = await db.OrgUnits.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == unitId, ct);

        if (unit is null)
            return [unitId];

        return await db.OrgUnits.IgnoreQueryFilters()
            .Where(u => u.Path.StartsWith(unit.Path))
            .Select(u => u.Id)
            .ToArrayAsync(ct);
    }

    private async Task RevokeAllActiveAsync(long userId, CancellationToken ct)
    {
        var active = await db.RefreshTokens.IgnoreQueryFilters()
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ToListAsync(ct);

        foreach (var token in active)
            token.RevokedAtUtc = clock.UtcNow;
    }

    private static string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
