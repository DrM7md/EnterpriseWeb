using Shared.Results;

namespace API.Common;

/// <summary>
/// تحويل موحّد من Result إلى استجابة HTTP. كل endpoint يستخدمه — لا منطق mapping مكرّر.
/// </summary>
public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result) =>
        result.IsSuccess
            ? Results.Ok(result.Value)
            : result.Error.ToProblem();

    public static IResult ToHttpResult(this Result result) =>
        result.IsSuccess
            ? Results.NoContent()
            : result.Error.ToProblem();

    private static IResult ToProblem(this Error error)
    {
        var status = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        return Results.Problem(
            title: error.Code,
            detail: error.Message,
            statusCode: status);
    }
}
