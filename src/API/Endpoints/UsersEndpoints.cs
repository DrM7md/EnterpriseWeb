using API.Common;
using API.Security;
using Application.Common.Security;
using Application.Features.Users;
using Shared.Pagination;

namespace API.Endpoints;

/// <summary>
/// موديول المستخدمين — أول Vertical Slice. كل مسار مُصرّح عليه بصلاحية محدّدة،
/// والكتابات مُتحقَّق منها عبر ValidationFilter. العزل يُطبَّق تلقائيًا في الخدمة.
/// </summary>
public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").WithTags("Users").RequireAuthorization();

        group.MapGet("/", async (
                int? page, int? pageSize, string? search, string? sortBy, bool? sortDescending,
                IUserService service, CancellationToken ct) =>
            {
                var request = new PagedRequest
                {
                    Page = page ?? 1,
                    PageSize = pageSize ?? 20,
                    Search = search,
                    SortBy = sortBy,
                    SortDescending = sortDescending ?? false,
                };
                return (await service.ListAsync(request, ct)).ToHttpResult();
            })
            .RequirePermission(Permissions.Users.Read)
            .WithName("ListUsers")
            .WithSummary("قائمة المستخدمين (مُرقّمة/مُفلترة، معزولة حسب النطاق).");

        group.MapGet("/{id:long}", async (long id, IUserService service, CancellationToken ct) =>
                (await service.GetByIdAsync(id, ct)).ToHttpResult())
            .RequirePermission(Permissions.Users.Read)
            .WithName("GetUser");

        group.MapPost("/", async (CreateUserRequest request, IUserService service, CancellationToken ct) =>
            {
                var result = await service.CreateAsync(request, ct);
                return result.IsSuccess
                    ? Results.Created($"/api/v1/users/{result.Value}", new { id = result.Value })
                    : result.ToHttpResult();
            })
            .WithValidation<CreateUserRequest>()
            .RequirePermission(Permissions.Users.Create)
            .WithName("CreateUser");

        group.MapPut("/{id:long}", async (long id, UpdateUserRequest request, IUserService service, CancellationToken ct) =>
                (await service.UpdateAsync(id, request, ct)).ToHttpResult())
            .WithValidation<UpdateUserRequest>()
            .RequirePermission(Permissions.Users.Update)
            .WithName("UpdateUser");

        group.MapDelete("/{id:long}", async (long id, IUserService service, CancellationToken ct) =>
                (await service.DeleteAsync(id, ct)).ToHttpResult())
            .RequirePermission(Permissions.Users.Delete)
            .WithName("DeleteUser");

        return app;
    }
}
