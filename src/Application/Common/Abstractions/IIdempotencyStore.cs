namespace Application.Common.Abstractions;

/// <summary>تخزين/استرجاع استجابات العمليات ذات مفتاح idempotency (منع التكرار).</summary>
public interface IIdempotencyStore
{
    Task<StoredResponse?> GetAsync(string key, long userId, CancellationToken ct = default);

    /// <summary>يحفظ الاستجابة. يُعيد false إن كان المفتاح موجودًا سلفًا (سباق متزامن).</summary>
    Task<bool> TrySaveAsync(string key, long userId, string method, string path,
        int statusCode, string? contentType, string responseBody, CancellationToken ct = default);
}

public sealed record StoredResponse(int StatusCode, string? ContentType, string Body);
