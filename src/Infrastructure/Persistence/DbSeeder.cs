using Application.Common.Abstractions;
using Application.Common.Security;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence;

/// <summary>
/// يطبّق الـ migrations ويبذّر البيانات الأساسية: الصلاحيات، دور SuperAdmin،
/// وحدة الجذر، ومستخدم admin أوّلي. Idempotent — آمن للتشغيل المتكرّر.
/// </summary>
public static class DbSeeder
{
    public const string DefaultAdminEmail = "admin@ministry.gov";
    public const string DefaultAdminPassword = "Admin@12345";

    public static async Task SeedAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<AppDbContext>();
        var hasher = sp.GetRequiredService<IPasswordHasher>();
        var clock = sp.GetRequiredService<IDateTimeProvider>();
        var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        await db.Database.MigrateAsync(ct);

        var now = clock.UtcNow;

        // 1) الصلاحيات (مزامنة الكتالوج).
        var existingCodes = await db.Permissions.Select(p => p.Code).ToListAsync(ct);
        var missing = Permissions.All.Where(p => !existingCodes.Contains(p.Code)).ToList();
        if (missing.Count > 0)
        {
            foreach (var (code, module) in missing)
                db.Permissions.Add(new Permission { Code = code, Module = module });
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Seeded {Count} permissions", missing.Count);
        }

        // 2) وحدة الجذر.
        var rootUnit = await db.OrgUnits.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Code == "ROOT", ct);
        if (rootUnit is null)
        {
            rootUnit = new OrgUnit { Name = "الوزارة", Code = "ROOT", Path = "/", IsActive = true, CreatedAtUtc = now };
            db.OrgUnits.Add(rootUnit);
            await db.SaveChangesAsync(ct);
            rootUnit.Path = $"/{rootUnit.Id}/";
            await db.SaveChangesAsync(ct);
        }

        // 3) دور SuperAdmin (يملك كل الصلاحيات).
        var superAdmin = await db.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.NormalizedName == "SUPERADMIN", ct);
        if (superAdmin is null)
        {
            superAdmin = new Role { Name = "SuperAdmin", NormalizedName = "SUPERADMIN", Description = "مدير النظام", IsSystem = true, CreatedAtUtc = now };
            db.Roles.Add(superAdmin);
            await db.SaveChangesAsync(ct);
        }

        var allPermissionIds = await db.Permissions.Select(p => p.Id).ToListAsync(ct);
        var assignedIds = await db.RolePermissions.Where(rp => rp.RoleId == superAdmin.Id).Select(rp => rp.PermissionId).ToListAsync(ct);
        foreach (var pid in allPermissionIds.Except(assignedIds))
            db.RolePermissions.Add(new RolePermission { RoleId = superAdmin.Id, PermissionId = pid });
        await db.SaveChangesAsync(ct);

        // 4) مستخدم admin أوّلي.
        var adminExists = await db.Users.IgnoreQueryFilters().AnyAsync(u => u.NormalizedEmail == DefaultAdminEmail.ToUpperInvariant(), ct);
        if (!adminExists)
        {
            var admin = new User
            {
                UserName = "admin",
                Email = DefaultAdminEmail,
                NormalizedEmail = DefaultAdminEmail.ToUpperInvariant(),
                FullName = "مدير النظام",
                PasswordHash = hasher.Hash(DefaultAdminPassword),
                OwnerUnitId = rootUnit.Id,
                IsActive = true,
                CreatedAtUtc = now,
            };
            db.Users.Add(admin);
            await db.SaveChangesAsync(ct);
            db.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = superAdmin.Id });
            await db.SaveChangesAsync(ct);
            logger.LogWarning("Seeded default admin {Email} — غيّر كلمة المرور فورًا في الإنتاج", DefaultAdminEmail);
        }
    }
}
