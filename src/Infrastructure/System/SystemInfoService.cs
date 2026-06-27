using System.Reflection;
using Application.Common.Abstractions;
using Microsoft.Extensions.Hosting;
using Shared.Results;

namespace Infrastructure.System;

internal sealed class SystemInfoService(IHostEnvironment environment) : ISystemInfoService
{
    public Result<SystemInfo> GetSystemInfo()
    {
        var version = Assembly.GetEntryAssembly()?
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
            ?? "0.1.0";

        return new SystemInfo(
            Name: "Enterprise Web System",
            Version: version,
            Environment: environment.EnvironmentName,
            ServerTimeUtc: DateTimeOffset.UtcNow,
            SupportedLanguages: ["ar", "en"]);
    }
}
