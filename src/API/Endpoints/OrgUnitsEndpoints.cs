using API.Common;
using API.Security;
using Application.Common.Modules;
using Application.Common.Security;
using Application.Features.OrgUnits;

namespace API.Endpoints;

/// <summary>موديول الوحدات التنظيمية — نمط شجري، مبنيٌّ بقالب الموديول (brain/10).</summary>
public static class OrgUnitsEndpoints
{
    public static IEndpointRouteBuilder MapOrgUnitsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/org-units").WithTags("OrgUnits")
            .RequireAuthorization()
            .RequireModule(ModuleKeys.OrgUnits);

        group.MapGet("/", async (IOrgUnitService service, CancellationToken ct) =>
                Results.Ok(await service.GetTreeAsync(ct)))
            .RequirePermission(Permissions.OrgUnits.Read)
            .WithName("GetOrgUnitTree")
            .WithSummary("شجرة الوحدات التنظيمية (قائمة مرتّبة بالمسار + المستوى).");

        group.MapGet("/{id:long}", async (long id, IOrgUnitService service, CancellationToken ct) =>
                (await service.GetByIdAsync(id, ct)).ToHttpResult())
            .RequirePermission(Permissions.OrgUnits.Read)
            .WithName("GetOrgUnit");

        group.MapPost("/", async (CreateOrgUnitRequest request, IOrgUnitService service, CancellationToken ct) =>
            {
                var result = await service.CreateAsync(request, ct);
                return result.IsSuccess
                    ? Results.Created($"/api/v1/org-units/{result.Value}", new { id = result.Value })
                    : result.ToHttpResult();
            })
            .WithValidation<CreateOrgUnitRequest>()
            .RequirePermission(Permissions.OrgUnits.Create)
            .WithName("CreateOrgUnit");

        group.MapPut("/{id:long}", async (long id, UpdateOrgUnitRequest request, IOrgUnitService service, CancellationToken ct) =>
                (await service.UpdateAsync(id, request, ct)).ToHttpResult())
            .WithValidation<UpdateOrgUnitRequest>()
            .RequirePermission(Permissions.OrgUnits.Update)
            .WithName("UpdateOrgUnit");

        group.MapDelete("/{id:long}", async (long id, IOrgUnitService service, CancellationToken ct) =>
                (await service.DeleteAsync(id, ct)).ToHttpResult())
            .RequirePermission(Permissions.OrgUnits.Delete)
            .WithName("DeleteOrgUnit");

        return app;
    }
}
