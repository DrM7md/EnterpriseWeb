using API.Common;
using API.Security;
using Application.Common.Abstractions;
using Application.Common.Security;
using Application.Features.Modules;

namespace API.Endpoints;

public static class ModulesEndpoints
{
    public static IEndpointRouteBuilder MapModulesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/modules").WithTags("Modules").RequireAuthorization();

        // الموديولات الفعّالة لوحدة المستخدم الحالي — تستهلكها الواجهة لبناء التنقّل.
        group.MapGet("/", async (ICurrentUser user, IModuleRegistry registry, CancellationToken ct) =>
                (await registry.GetEffectiveAsync(user.UnitId ?? 0, ct)).ToHttpResult())
            .WithName("GetEffectiveModules")
            .WithSummary("الموديولات وحالة تفعيلها لوحدة المستخدم.");

        // حالة موديولات وحدة محدّدة (لشاشة إدارة الأقسام).
        group.MapGet("/unit/{unitId:long}", async (long unitId, IModuleRegistry registry, CancellationToken ct) =>
                (await registry.GetEffectiveAsync(unitId, ct)).ToHttpResult())
            .RequirePermission(Permissions.Modules.Read)
            .WithName("GetUnitModules");

        // تفعيل/تعطيل موديول لوحدة.
        group.MapPut("/{key}", async (string key, ToggleModuleRequest request, IModuleRegistry registry, CancellationToken ct) =>
                (await registry.SetEnabledAsync(key, request.UnitId, request.Enabled, ct)).ToHttpResult())
            .RequirePermission(Permissions.Modules.Manage)
            .WithName("ToggleModule")
            .WithSummary("تفعيل/تعطيل موديول لوحدة تنظيمية.");

        return app;
    }
}
