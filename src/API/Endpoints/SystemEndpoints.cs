using API.Common;
using Application.Common.Abstractions;

namespace API.Endpoints;

/// <summary>
/// نمط تعريف الـ endpoints: كل موديول يجمع مساراته في امتداد واحد ويُسجّله في Program.
/// </summary>
public static class SystemEndpoints
{
    public static IEndpointRouteBuilder MapSystemEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/system").WithTags("System");

        group.MapGet("/info", (ISystemInfoService service) => service.GetSystemInfo().ToHttpResult())
            .WithName("GetSystemInfo")
            .WithSummary("معلومات النظام (slice إثبات end-to-end في Phase 0).");

        return app;
    }
}
