using Shared.Results;

namespace Application.Features.Auth;

public static class AuthErrors
{
    public static readonly Error InvalidCredentials =
        Error.Unauthorized("auth.invalid_credentials", "بيانات الدخول غير صحيحة.");

    public static readonly Error UserInactive =
        Error.Forbidden("auth.user_inactive", "الحساب غير مُفعّل.");

    public static readonly Error InvalidRefreshToken =
        Error.Unauthorized("auth.invalid_refresh_token", "رمز التحديث غير صالح أو منتهٍ.");
}
