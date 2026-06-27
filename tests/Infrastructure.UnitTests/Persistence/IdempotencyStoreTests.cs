using Application.Common.Abstractions;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Infrastructure.UnitTests.Persistence;

public class IdempotencyStoreTests
{
    private sealed class AnonUser : ICurrentUser
    {
        public long? UserId => null;
        public string? UserName => null;
        public long? UnitId => null;
        public IReadOnlyCollection<long> UnitScope => [];
        public bool IsAuthenticated => false;
        public bool HasPermission(string permission) => false;
    }

    private static AppDbContext NewDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options, new AnonUser());

    [Fact]
    public async Task Save_then_Get_returns_stored_response_for_same_key_and_user()
    {
        var db = NewDb();
        var store = new IdempotencyStore(db);

        var saved = await store.TrySaveAsync("k1", userId: 7, "POST", "/api/v1/users", 201, "application/json", "{\"id\":9}");
        var got = await store.GetAsync("k1", userId: 7);

        Assert.True(saved);
        Assert.NotNull(got);
        Assert.Equal(201, got!.StatusCode);
        Assert.Equal("{\"id\":9}", got.Body);
    }

    [Fact]
    public async Task Get_is_partitioned_by_user()
    {
        var db = NewDb();
        var store = new IdempotencyStore(db);
        await store.TrySaveAsync("k1", userId: 7, "POST", "/x", 200, null, "a");

        Assert.NotNull(await store.GetAsync("k1", userId: 7));
        Assert.Null(await store.GetAsync("k1", userId: 8)); // مستخدم آخر، نفس المفتاح ⇒ لا تصادم
    }

    [Fact]
    public async Task Get_returns_null_for_unknown_key()
    {
        var db = NewDb();
        Assert.Null(await new IdempotencyStore(db).GetAsync("missing", userId: 1));
    }
}
