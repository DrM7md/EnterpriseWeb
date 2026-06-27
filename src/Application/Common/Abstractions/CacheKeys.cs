namespace Application.Common.Abstractions;

/// <summary>مفاتيح الكاش — مصدر واحد لتجنّب التضارب بين الكتابة (الإبطال) والقراءة.</summary>
public static class CacheKeys
{
    public const string OrgUnitTree = "org-units:tree";
    public const string PermissionCatalog = "roles:permissions:catalog";
}
