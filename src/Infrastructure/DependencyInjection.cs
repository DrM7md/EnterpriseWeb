using Application.Common.Abstractions;
using Application.Common.Reporting;
using Application.Common.Security;
using Infrastructure.Identity;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Interceptors;
using Infrastructure.Reporting;
using Infrastructure.System;
using Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using QuestPDF.Infrastructure;

namespace Infrastructure;

/// <summary>
/// تسجيل خدمات طبقة Infrastructure: قاعدة البيانات (مع فلاتر العزل والتدقيق)،
/// المصادقة، تجزئة كلمات المرور، وتوليد الرموز.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("ConnectionStrings:Default غير مُعرّف.");

        services.AddHttpContextAccessor();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        services.AddScoped<AuditingInterceptor>();
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());
            options.AddInterceptors(sp.GetRequiredService<AuditingInterceptor>());
        });
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<ISystemInfoService, SystemInfoService>();

        // محرّك التقارير (Strategy: كاتب لكل صيغة).
        QuestPDF.Settings.License = LicenseType.Community;
        services.AddSingleton<IReportWriter, ExcelReportWriter>();
        services.AddSingleton<IReportWriter, PdfReportWriter>();
        services.AddSingleton<IReportEngine, ReportEngine>();

        return services;
    }
}
