using Application.Common.Abstractions;
using Infrastructure.System;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

/// <summary>
/// نقطة تسجيل خدمات طبقة Infrastructure (EF Core, Dapper, Auth, Storage, Jobs…).
/// Phase 0: خدمة معلومات النظام فقط. Phase 1: DbContext + RLS + Audit + Auth.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<ISystemInfoService, SystemInfoService>();
        return services;
    }
}
