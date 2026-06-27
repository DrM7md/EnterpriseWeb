using Application.Features.Auth;
using Application.Features.Modules;
using Application.Features.OrgUnits;
using Application.Features.Roles;
using Application.Features.Users;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

/// <summary>
/// نقطة تسجيل خدمات طبقة Application. كل طبقة تملك امتداد DI خاصًّا بها،
/// ويُركّبها composition root في API.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IModuleRegistry, ModuleRegistry>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IOrgUnitService, OrgUnitService>();
        return services;
    }
}
