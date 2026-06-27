using API.Common;
using Application.Common.Abstractions;
using Application.Features.Auth;

namespace API.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // سياسة معدّل صارمة على المصادقة (منع تخمين كلمات المرور).
        var group = app.MapGroup("/auth").WithTags("Auth").RequireRateLimiting("auth");

        group.MapPost("/login", async (LoginRequest request, IAuthService auth, HttpContext http, CancellationToken ct) =>
                (await auth.LoginAsync(request, Ip(http), ct)).ToHttpResult())
            .WithValidation<LoginRequest>()
            .WithName("Login")
            .WithSummary("تسجيل الدخول وإصدار access + refresh tokens.");

        group.MapPost("/refresh", async (RefreshRequest request, IAuthService auth, HttpContext http, CancellationToken ct) =>
                (await auth.RefreshAsync(request, Ip(http), ct)).ToHttpResult())
            .WithValidation<RefreshRequest>()
            .WithName("Refresh")
            .WithSummary("تدوير رمز التحديث وإصدار رموز جديدة.");

        group.MapPost("/logout", async (RefreshRequest request, IAuthService auth, CancellationToken ct) =>
                (await auth.LogoutAsync(request.RefreshToken, ct)).ToHttpResult())
            .WithValidation<RefreshRequest>()
            .WithName("Logout")
            .WithSummary("إبطال رمز التحديث.");

        group.MapGet("/me", (ICurrentUser user) => Results.Ok(new
            {
                user.UserId,
                user.UserName,
                user.UnitId,
                user.UnitScope,
                IsAuthenticated = user.IsAuthenticated,
            }))
            .RequireAuthorization()
            .WithName("Me")
            .WithSummary("معلومات المستخدم الحالي من الرمز.");

        return app;
    }

    private static string Ip(HttpContext http) =>
        http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
