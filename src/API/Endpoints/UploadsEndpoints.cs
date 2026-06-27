using API.Common;
using Application.Common.Abstractions;

namespace API.Endpoints;

/// <summary>رفع الملفات الكبيرة على دفعات (init → chunks → complete).</summary>
public static class UploadsEndpoints
{
    public sealed record InitRequest(string FileName, int TotalChunks);

    public static IEndpointRouteBuilder MapUploadsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/uploads").WithTags("Uploads").RequireAuthorization();

        group.MapPost("/init", async (InitRequest request, IChunkedUploadService svc, CancellationToken ct) =>
            {
                var id = await svc.InitAsync(request.FileName, request.TotalChunks, ct);
                return Results.Ok(new { uploadId = id });
            })
            .WithName("InitUpload")
            .WithSummary("بدء جلسة رفع على دفعات.");

        // رفع جزء واحد (الجسم بايتات خام).
        group.MapPut("/{uploadId}/chunks/{index:int}", async (string uploadId, int index, HttpRequest http, IChunkedUploadService svc, CancellationToken ct) =>
                (await svc.SaveChunkAsync(uploadId, index, http.Body, ct)).ToHttpResult())
            .WithName("UploadChunk");

        group.MapPost("/{uploadId}/complete", async (string uploadId, IChunkedUploadService svc, CancellationToken ct) =>
                (await svc.CompleteAsync(uploadId, ct)).ToHttpResult())
            .WithName("CompleteUpload")
            .WithSummary("تجميع الأجزاء في ملف واحد.");

        return app;
    }
}
