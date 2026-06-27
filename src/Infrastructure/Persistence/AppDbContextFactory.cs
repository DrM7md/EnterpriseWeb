using Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Infrastructure.Persistence;

/// <summary>
/// مصنع وقت-التصميم لإنشاء الـ migrations (dotnet ef). يستخدم LocalDB افتراضيًا.
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=EnterpriseSystem;Trusted_Connection=True;TrustServerCertificate=True";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new AppDbContext(options, new DesignTimeCurrentUser());
    }

    /// <summary>مستخدم وهمي لوقت التصميم فقط (الـ migrations لا تنفّذ استعلامات معزولة).</summary>
    private sealed class DesignTimeCurrentUser : ICurrentUser
    {
        public long? UserId => null;
        public string? UserName => null;
        public long? UnitId => null;
        public IReadOnlyCollection<long> UnitScope => [];
        public bool IsAuthenticated => false;
        public bool HasPermission(string permission) => false;
    }
}
