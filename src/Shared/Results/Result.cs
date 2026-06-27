namespace Shared.Results;

/// <summary>
/// نتيجة عملية بلا قيمة. لا نستخدم الاستثناءات للتحكّم في التدفّق — نُرجع Result.
/// </summary>
public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
            throw new InvalidOperationException("نتيجة ناجحة لا يمكن أن تحمل خطأً.");
        if (!isSuccess && error == Error.None)
            throw new InvalidOperationException("نتيجة فاشلة يجب أن تحمل خطأً.");

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);

    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);
    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);

    public static implicit operator Result(Error error) => Failure(error);
}

/// <summary>
/// نتيجة عملية تحمل قيمة عند النجاح.
/// </summary>
public sealed class Result<TValue> : Result
{
    private readonly TValue? _value;

    internal Result(TValue? value, bool isSuccess, Error error) : base(isSuccess, error)
        => _value = value;

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("لا يمكن قراءة قيمة نتيجة فاشلة.");

    public static implicit operator Result<TValue>(TValue value) => Success(value);
    public static implicit operator Result<TValue>(Error error) => Failure<TValue>(error);
}
