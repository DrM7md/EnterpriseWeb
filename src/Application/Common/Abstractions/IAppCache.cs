namespace Application.Common.Abstractions;

/// <summary>
/// تخزين مؤقت على مستوى التطبيق (لا HTTP) — يُبقي التصريح فعّالًا ويُخزّن ناتج الاستعلام فقط.
/// يُستخدم للقراءات العامّة غير المُجزّأة بالمستخدم (شجرة الوحدات، كتالوج الصلاحيات).
/// </summary>
public interface IAppCache
{
    /// <summary>يُعيد القيمة من الكاش أو ينشئها عبر factory ويخزّنها (مع تسجيل hit/miss).</summary>
    Task<T> GetOrCreateAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken ct = default);

    /// <summary>يُبطل مفتاحًا (يُستدعى بعد الكتابات لإبقاء البيانات حديثة).</summary>
    void Remove(string key);
}
