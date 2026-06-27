using API.Common;
using API.Security;
using Application.Common.Modules;
using Application.Common.Security;
using Application.Features.Roles;
using Shared.Pagination;

namespace API.Endpoints;

/// <summary>موديول الأدوار — مبنيٌّ بقالب الموديول (brain/10). يُكمل دورة RBAC.</summary>
public static class RolesEndpoints
{
    public static IEndpointRouteBuilder MapRolesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/roles").WithTags("Roles")
            .RequireAuthorization()
            .RequireModule(ModuleKeys.Roles);

        group.MapGet("/", async (
                int? page, int? pageSize, string? search, string? sortBy, bool? sortDescending,
                IRoleService service, CancellationToken ct) =>
            {
                var request = new PagedRequest
                {
                    Page = page ?? 1, PageSize = pageSize ?? 20,
                    Search = search, SortBy = sortBy, SortDescending = sortDescending ?? false,
                };
                return (await service.ListAsync(request, ct)).ToHttpResult();
            })
            .RequirePermission(Permissions.Roles.Read)
            .WithName("ListRoles");

        // كتالوج الصلاحيات (للاختيار عند إنشاء/تعديل دور).
        group.MapGet("/permissions", async (IRoleService service, CancellationToken ct) =>
                Results.Ok(await service.GetPermissionCatalogAsync(ct)))
            .RequirePermission(Permissions.Roles.Read)
            .WithName("GetPermissionCatalog");

        group.MapGet("/{id:long}", async (long id, IRoleService service, CancellationToken ct) =>
                (await service.GetByIdAsync(id, ct)).ToHttpResult())
            .RequirePermission(Permissions.Roles.Read)
            .WithName("GetRole");

        group.MapPost("/", async (CreateRoleRequest request, IRoleService service, CancellationToken ct) =>
            {
                var result = await service.CreateAsync(request, ct);
                return result.IsSuccess
                    ? Results.Created($"/api/v1/roles/{result.Value}", new { id = result.Value })
                    : result.ToHttpResult();
            })
            .WithValidation<CreateRoleRequest>()
            .RequirePermission(Permissions.Roles.Create)
            .WithName("CreateRole");

        group.MapPut("/{id:long}", async (long id, UpdateRoleRequest request, IRoleService service, CancellationToken ct) =>
                (await service.UpdateAsync(id, request, ct)).ToHttpResult())
            .WithValidation<UpdateRoleRequest>()
            .RequirePermission(Permissions.Roles.Update)
            .WithName("UpdateRole");

        group.MapDelete("/{id:long}", async (long id, IRoleService service, CancellationToken ct) =>
                (await service.DeleteAsync(id, ct)).ToHttpResult())
            .RequirePermission(Permissions.Roles.Delete)
            .WithName("DeleteRole");

        return app;
    }
}
