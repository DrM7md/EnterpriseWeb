using System.Reflection;
using Application.Common.Abstractions;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Module = Domain.Entities.Module;

namespace Infrastructure.Persistence;

/// <summary>
/// سياق البيانات. يطبّق تلقائيًا:
/// - الحذف الناعم (Global Query Filter يُخفي IsDeleted).
/// - العزل RLS (تصفية IOwnedByUnit حسب نطاق المستخدم الحالي).
/// التدقيق وضبط حقول الـ audit يتمّان عبر AuditingInterceptor.
/// </summary>
public sealed class AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser currentUser)
    : DbContext(options), IAppDbContext
{
    public DbSet<OrgUnit> OrgUnits => Set<OrgUnit>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<ModuleSetting> ModuleSettings => Set<ModuleSetting>();
    public DbSet<ReportRequest> ReportRequests => Set<ReportRequest>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    /// <summary>نطاق العزل الحالي — يُقرأ داخل Global Query Filter (يُعاد تقييمه لكل استعلام).</summary>
    public IReadOnlyCollection<long> CurrentUnitScope => currentUser.UnitScope;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // الحذف الناعم + العزل: مدمجان في فلتر واحد لكل كيان (EF يسمح بفلتر واحد فقط).
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted && CurrentUnitScope.Contains(u.OwnerUnitId));
        modelBuilder.Entity<OrgUnit>().HasQueryFilter(o => !o.IsDeleted);
        modelBuilder.Entity<Role>().HasQueryFilter(r => !r.IsDeleted);
        modelBuilder.Entity<ModuleSetting>().HasQueryFilter(m => !m.IsDeleted && CurrentUnitScope.Contains(m.OwnerUnitId));
        modelBuilder.Entity<ReportRequest>().HasQueryFilter(r => !r.IsDeleted && CurrentUnitScope.Contains(r.OwnerUnitId));

        base.OnModelCreating(modelBuilder);
    }
}
