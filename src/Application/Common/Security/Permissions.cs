namespace Application.Common.Security;

/// <summary>
/// كتالوج الصلاحيات الذرّية. الصيغة: {module}.{action}.
/// مصدر الحقيقة الوحيد — يُبذَّر إلى جدول Permissions ويُستخدم في سياسات التصريح.
/// </summary>
public static class Permissions
{
    public static class Users
    {
        public const string Read = "users.read";
        public const string Create = "users.create";
        public const string Update = "users.update";
        public const string Delete = "users.delete";
        public const string Export = "users.export";
    }

    public static class Roles
    {
        public const string Read = "roles.read";
        public const string Create = "roles.create";
        public const string Update = "roles.update";
        public const string Delete = "roles.delete";
    }

    public static class OrgUnits
    {
        public const string Read = "org-units.read";
        public const string Create = "org-units.create";
        public const string Update = "org-units.update";
        public const string Delete = "org-units.delete";
    }

    public static class Audit
    {
        public const string Read = "audit.read";
        public const string Export = "audit.export";
    }

    public static class Modules
    {
        public const string Read = "modules.read";
        public const string Manage = "modules.manage";
    }

    /// <summary>كل الصلاحيات المعروفة (تُستخدم للبذر والتحقّق).</summary>
    public static IReadOnlyList<(string Code, string Module)> All { get; } =
    [
        (Users.Read, "users"), (Users.Create, "users"), (Users.Update, "users"), (Users.Delete, "users"), (Users.Export, "users"),
        (Roles.Read, "roles"), (Roles.Create, "roles"), (Roles.Update, "roles"), (Roles.Delete, "roles"),
        (OrgUnits.Read, "org-units"), (OrgUnits.Create, "org-units"), (OrgUnits.Update, "org-units"), (OrgUnits.Delete, "org-units"),
        (Audit.Read, "audit"), (Audit.Export, "audit"),
        (Modules.Read, "modules"), (Modules.Manage, "modules"),
    ];
}
