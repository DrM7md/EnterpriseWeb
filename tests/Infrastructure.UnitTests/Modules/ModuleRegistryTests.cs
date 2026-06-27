using Application.Common.Abstractions;
using Application.Features.Modules;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Infrastructure.UnitTests.Modules;

/// <summary>
/// منطق العزل أمنيٌّ: core دائمًا مُفعّل؛ غير core مُعطّل افتراضيًا حتى يُفعَّل صراحةً.
/// نختبره على مزوّد InMemory (لا حاجة لـ SQL Server).
/// </summary>
public class ModuleRegistryTests
{
    private sealed class FullScopeUser : ICurrentUser
    {
        public long? UserId => 1;
        public string? UserName => "tester";
        public long? UnitId => 10;
        public IReadOnlyCollection<long> UnitScope => [10, 20];
        public bool IsAuthenticated => true;
        public bool HasPermission(string permission) => true;
    }

    private static AppDbContext NewDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options, new FullScopeUser());

    private static async Task SeedAsync(AppDbContext db)
    {
        db.Modules.AddRange(
            new Module { Key = "audit", Name = "audit", IsCore = true },
            new Module { Key = "users", Name = "users", IsCore = false });
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task Core_is_enabled_even_without_setting()
    {
        var db = NewDb();
        await SeedAsync(db);

        Assert.True(await new ModuleRegistry(db).IsEnabledAsync("audit", unitId: 10));
    }

    [Fact]
    public async Task Non_core_is_disabled_by_default()
    {
        var db = NewDb();
        await SeedAsync(db);

        Assert.False(await new ModuleRegistry(db).IsEnabledAsync("users", unitId: 10));
    }

    [Fact]
    public async Task Non_core_enabled_only_for_the_unit_it_was_turned_on()
    {
        var db = NewDb();
        await SeedAsync(db);
        var registry = new ModuleRegistry(db);

        await registry.SetEnabledAsync("users", unitId: 10, enabled: true);

        Assert.True(await registry.IsEnabledAsync("users", unitId: 10));
        Assert.False(await registry.IsEnabledAsync("users", unitId: 20)); // وحدة أخرى ⇒ ما زال معطّلًا
    }

    [Fact]
    public async Task Core_cannot_be_disabled()
    {
        var db = NewDb();
        await SeedAsync(db);

        var result = await new ModuleRegistry(db).SetEnabledAsync("audit", unitId: 10, enabled: false);

        Assert.True(result.IsFailure);
        Assert.Equal("module.core_locked", result.Error.Code);
    }

    [Fact]
    public async Task Effective_list_reflects_core_and_opt_in()
    {
        var db = NewDb();
        await SeedAsync(db);
        var registry = new ModuleRegistry(db);
        await registry.SetEnabledAsync("users", unitId: 10, enabled: true);

        var effective = (await registry.GetEffectiveAsync(unitId: 10)).Value;

        Assert.True(effective.Single(m => m.Key == "audit").IsEnabled);
        Assert.True(effective.Single(m => m.Key == "users").IsEnabled);
    }
}
