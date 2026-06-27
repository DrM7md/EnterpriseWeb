namespace Application.Common.Abstractions;

/// <summary>
/// تجريد تخزين الملفات (محلي للتطوير، Azure Blob للإنتاج). يفصل المنطق عن مكان التخزين.
/// </summary>
public interface IFileStorage
{
    /// <summary>يحفظ المحتوى ويُعيد مفتاحًا مُعتمًا لاسترجاعه لاحقًا.</summary>
    Task<string> SaveAsync(byte[] content, string fileName, CancellationToken ct = default);

    /// <summary>يقرأ المحتوى بالمفتاح، أو null إن لم يوجد.</summary>
    Task<byte[]?> ReadAsync(string key, CancellationToken ct = default);

    Task DeleteAsync(string key, CancellationToken ct = default);
}
