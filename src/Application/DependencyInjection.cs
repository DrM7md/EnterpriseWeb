using Application.Features.Auth;
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
        return services;
    }
}
