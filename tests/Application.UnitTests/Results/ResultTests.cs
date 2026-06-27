using Shared.Results;
using Xunit;

namespace Application.UnitTests.Results;

public class ResultTests
{
    [Fact]
    public void Success_WithValue_ExposesValue()
    {
        Result<int> result = Result.Success(42);

        Assert.True(result.IsSuccess);
        Assert.Equal(42, result.Value);
    }

    [Fact]
    public void Failure_ReadingValue_Throws()
    {
        Result<int> result = Error.NotFound("x.not_found", "غير موجود");

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
        Assert.Throws<InvalidOperationException>(() => result.Value);
    }

    [Fact]
    public void ImplicitConversion_FromError_ProducesFailure()
    {
        static Result<string> Get() => Error.Validation("name.required", "الاسم مطلوب");

        var result = Get();

        Assert.True(result.IsFailure);
        Assert.Equal("name.required", result.Error.Code);
    }
}
