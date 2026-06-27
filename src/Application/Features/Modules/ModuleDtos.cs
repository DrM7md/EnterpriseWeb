namespace Application.Features.Modules;

/// <summary>حالة موديول فعليًّا لوحدة معيّنة.</summary>
public sealed record ModuleInfo(
    string Key,
    string Name,
    string? Description,
    bool IsCore,
    bool IsEnabled);

public sealed record ToggleModuleRequest(long UnitId, bool Enabled);
