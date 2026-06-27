namespace Application.Common.Modules;

/// <summary>
/// كتالوج الموديولات المعروفة. core منها دائمة التشغيل؛ البقية opt-in لكل قسم.
/// مصدر الحقيقة الوحيد — يُبذَّر إلى جدول Modules ويُستخدم في بوابة التفعيل.
/// </summary>
public static class ModuleKeys
{
    public const string Auth = "auth";
    public const string OrgUnits = "org-units";
    public const string Audit = "audit";
    public const string Users = "users";

    public sealed record ModuleDefinition(string Key, string Name, string Description, bool IsCore);

    public static IReadOnlyList<ModuleDefinition> All { get; } =
    [
        new(Auth, "المصادقة والصلاحيات", "تسجيل الدخول وRBAC", IsCore: true),
        new(OrgUnits, "الوحدات التنظيمية", "التسلسل الهرمي والعزل", IsCore: true),
        new(Audit, "سجل التدقيق", "تتبّع كل كتابة حسّاسة", IsCore: true),
        new(Users, "إدارة المستخدمين", "إنشاء وتعديل حسابات القسم", IsCore: false),
    ];
}
