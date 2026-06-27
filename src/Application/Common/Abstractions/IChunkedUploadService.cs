using Shared.Results;

namespace Application.Common.Abstractions;

/// <summary>
/// رفع الملفات الكبيرة على دفعات: تهيئة جلسة، رفع كل جزء، ثم تجميعها في ملف واحد.
/// يتجنّب تحميل ملف ضخم كاملًا في طلب واحد.
/// </summary>
public interface IChunkedUploadService
{
    Task<string> InitAsync(string fileName, int totalChunks, CancellationToken ct = default);
    Task<Result> SaveChunkAsync(string uploadId, int index, Stream chunk, CancellationToken ct = default);
    Task<Result<UploadResult>> CompleteAsync(string uploadId, CancellationToken ct = default);
}

public sealed record UploadResult(string FileKey, string FileName, long Size);

public static class UploadErrors
{
    public static readonly Error NotFound = Error.NotFound("upload.not_found", "جلسة الرفع غير موجودة.");
    public static readonly Error Incomplete = Error.Validation("upload.incomplete", "بعض الأجزاء مفقودة.");
    public static readonly Error BadIndex = Error.Validation("upload.bad_index", "رقم الجزء غير صالح.");
}
