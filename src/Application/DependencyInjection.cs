using Microsoft.Extensions.DependencyInjection;

namespace Application;

/// <summary>
/// نقطة تسجيل خدمات طبقة Application. كل طبقة تملك امتداد DI خاصًّا بها،
/// ويُركّبها composition root في API. (Phase 1 سيضيف MediatR/FluentValidation هنا.)
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Phase 1: MediatR pipeline behaviors + FluentValidation validators.
        return services;
    }
}
