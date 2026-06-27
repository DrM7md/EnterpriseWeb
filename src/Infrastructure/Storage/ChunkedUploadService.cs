using System.Text.Json;
using Application.Common.Abstractions;
using Microsoft.Extensions.Configuration;
using Shared.Results;

namespace Infrastructure.Storage;

/// <summary>
/// رفع على دفعات إلى مجلد مؤقّت، ثم تجميع في IFileStorage عند الاكتمال.
/// كل جلسة لها مجلد {root}/_chunks/{uploadId} يحوي الأجزاء + ملف meta.
/// </summary>
internal sealed class ChunkedUploadService : IChunkedUploadService
{
    private readonly string _chunkRoot;
    private readonly IFileStorage _storage;

    public ChunkedUploadService(IConfiguration configuration, IFileStorage storage)
    {
        var root = configuration["FileStorage:LocalRoot"] ?? Path.Combine(AppContext.BaseDirectory, "App_Data", "files");
        _chunkRoot = Path.Combine(root, "_chunks");
        Directory.CreateDirectory(_chunkRoot);
        _storage = storage;
    }

    private sealed record Meta(string FileName, int TotalChunks);

    public async Task<string> InitAsync(string fileName, int totalChunks, CancellationToken ct = default)
    {
        var uploadId = Guid.NewGuid().ToString("N");
        var dir = SessionDir(uploadId);
        Directory.CreateDirectory(dir);
        await File.WriteAllTextAsync(Path.Combine(dir, "meta.json"),
            JsonSerializer.Serialize(new Meta(Path.GetFileName(fileName), totalChunks)), ct);
        return uploadId;
    }

    public async Task<Result> SaveChunkAsync(string uploadId, int index, Stream chunk, CancellationToken ct = default)
    {
        var dir = SessionDir(uploadId);
        if (!Directory.Exists(dir))
            return UploadErrors.NotFound;
        if (index < 0)
            return UploadErrors.BadIndex;

        await using var file = File.Create(Path.Combine(dir, $"{index}.part"));
        await chunk.CopyToAsync(file, ct);
        return Result.Success();
    }

    public async Task<Result<UploadResult>> CompleteAsync(string uploadId, CancellationToken ct = default)
    {
        var dir = SessionDir(uploadId);
        var metaPath = Path.Combine(dir, "meta.json");
        if (!File.Exists(metaPath))
            return UploadErrors.NotFound;

        var meta = JsonSerializer.Deserialize<Meta>(await File.ReadAllTextAsync(metaPath, ct))!;

        // تجميع الأجزاء بالترتيب.
        using var assembled = new MemoryStream();
        for (var i = 0; i < meta.TotalChunks; i++)
        {
            var part = Path.Combine(dir, $"{i}.part");
            if (!File.Exists(part))
                return Result.Failure<UploadResult>(UploadErrors.Incomplete);
            await using var ps = File.OpenRead(part);
            await ps.CopyToAsync(assembled, ct);
        }

        var bytes = assembled.ToArray();
        var key = await _storage.SaveAsync(bytes, meta.FileName, ct);

        Directory.Delete(dir, recursive: true); // تنظيف الأجزاء المؤقّتة.
        return new UploadResult(key, meta.FileName, bytes.LongLength);
    }

    // اسم الملف فقط (يمنع تجاوز المجلد).
    private string SessionDir(string uploadId) => Path.Combine(_chunkRoot, Path.GetFileName(uploadId));
}
