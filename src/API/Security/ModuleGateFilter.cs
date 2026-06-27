using API.Common;
using Application.Common.Abstractions;
using Application.Features.Modules;
using Shared.Results;

namespace API.Security;

/// <summary>
/// بوابة تفعيل الموديول: ترفض الطلب (403) إن كان الموديول غير مُفعّل لوحدة المستخدم.
/// تُكمّل التصريح بالصلاحية (الصلاحية = "ماذا تستطيع"، البوابة = "هل الموديول مُتاح لقسمك").
/// </summary>
public sealed class ModuleGateFilter(string moduleKey, IModuleRegistry registry, ICurrentUser currentUser) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var unitId = currentUser.UnitId;
        if (unitId is null || !await registry.IsEnabledAsync(moduleKey, unitId.Value))
            return Result.Failure(ModuleErrors.Disabled(moduleKey)).ToHttpResult();

        return await next(context);
    }
}

public static class ModuleGateExtensions
{
    /// <summary>يشترط تفعيل الموديول لوحدة المستخدم على كل مسارات المجموعة.</summary>
    public static TBuilder RequireModule<TBuilder>(this TBuilder builder, string moduleKey)
        where TBuilder : IEndpointConventionBuilder
        => builder.AddEndpointFilterFactory((factoryContext, next) => async invocationContext =>
        {
            var registry = invocationContext.HttpContext.RequestServices.GetRequiredService<IModuleRegistry>();
            var currentUser = invocationContext.HttpContext.RequestServices.GetRequiredService<ICurrentUser>();
            var filter = new ModuleGateFilter(moduleKey, registry, currentUser);
            return await filter.InvokeAsync(invocationContext, next);
        });
}
