using Application.Common.Abstractions;
using Application.Common.Reporting;
using Application.Common.Security;
using Application.Features.Reports;
using Infrastructure.Caching;
using Infrastructure.Identity;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Interceptors;
using Infrastructure.Reporting;
using Infrastructure.Storage;
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
        services.AddScoped<IIdempotencyStore, IdempotencyStore>();
        services.AddSingleton<IAppCache, AppCache>();

        services.AddScoped<ISystemInfoService, SystemInfoService>();

        // محرّك التقارير (Strategy: كاتب لكل صيغة).
        QuestPDF.Settings.License = LicenseType.Community;
        services.AddSingleton<IReportWriter, ExcelReportWriter>();
        services.AddSingleton<IReportWriter, PdfReportWriter>();
        services.AddSingleton<IReportEngine, ReportEngine>();

        // التقارير غير المتزامنة (Hangfire jobs) + تخزين الملفات.
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IReportJobRunner, ReportJobRunner>();

        return services;
    }
}
