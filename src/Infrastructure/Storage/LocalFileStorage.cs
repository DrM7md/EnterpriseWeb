using Application.Common.Abstractions;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Storage;

/// <summary>
/// تخزين ملفات محلي للتطوير. الإنتاج يستبدله بتنفيذ Azure Blob لنفس الواجهة.
/// المفتاح = اسم ملف مُعشّى (لا مسارات يتحكّم بها المستخدم — أمان).
/// </summary>
internal sealed class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(IConfiguration configuration)
    {
        _root = configuration["FileStorage:LocalRoot"]
            ?? Path.Combine(AppContext.BaseDirectory, "App_Data", "files");
        Directory.CreateDirectory(_root);
    }

    public async Task<string> SaveAsync(byte[] content, string fileName, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(fileName);
        var key = $"{Guid.NewGuid():N}{ext}";
        await File.WriteAllBytesAsync(Path.Combine(_root, key), content, ct);
        return key;
    }

    public async Task<byte[]?> ReadAsync(string key, CancellationToken ct = default)
    {
        var path = SafePath(key);
        return File.Exists(path) ? await File.ReadAllBytesAsync(path, ct) : null;
    }

    public Task DeleteAsync(string key, CancellationToken ct = default)
    {
        var path = SafePath(key);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }

    // يمنع تجاوز المجلد (path traversal): نستخدم اسم الملف فقط.
    private string SafePath(string key) => Path.Combine(_root, Path.GetFileName(key));
}
