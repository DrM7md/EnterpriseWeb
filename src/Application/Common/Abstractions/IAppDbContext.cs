using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Abstractions;

/// <summary>
/// واجهة سياق البيانات التي تستهلكها طبقة Application (لا تعرف EF مباشرةً سوى DbSet).
/// التنفيذ في Infrastructure يطبّق فلاتر العزل والحذف الناعم والتدقيق.
/// </summary>
public interface IAppDbContext
{
    DbSet<OrgUnit> OrgUnits { get; }
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<Module> Modules { get; }
    DbSet<ModuleSetting> ModuleSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
