using System.Security.Claims;
using Application.Common.Abstractions;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Identity;

/// <summary>
/// سياق المستخدم الحالي مقروءًا من claims الرمز. النطاق (UnitScope) مُضمَّن في الرمز
/// عند الدخول — لا استعلام قاعدة بيانات هنا (تُستخدم داخل فلتر العزل نفسه).
/// </summary>
internal sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal? Principal => accessor.HttpContext?.User;

    public long? UserId =>
        long.TryParse(Principal?.FindFirstValue("sub") ?? Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id : null;

    public string? UserName => Principal?.FindFirstValue(ClaimTypes.Name);

    public long? UnitId =>
        long.TryParse(Principal?.FindFirstValue(AppClaimTypes.UnitId), out var id) ? id : null;

    public IReadOnlyCollection<long> UnitScope =>
        Principal?.FindAll(AppClaimTypes.UnitScope)
            .Select(c => long.TryParse(c.Value, out var id) ? id : (long?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToArray() ?? [];

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

    public bool HasPermission(string permission) =>
        Principal?.HasClaim(AppClaimTypes.Permission, permission) ?? false;
}
