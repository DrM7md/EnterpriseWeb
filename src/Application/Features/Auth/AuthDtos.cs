namespace Application.Features.Auth;

public sealed record LoginRequest(string Email, string Password);

public sealed record RefreshRequest(string RefreshToken);

public sealed record AuthResult(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAtUtc,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAtUtc,
    AuthUser User);

public sealed record AuthUser(
    long Id,
    string UserName,
    string Email,
    string FullName,
    long UnitId,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions);
