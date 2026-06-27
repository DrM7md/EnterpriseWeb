using Domain.Entities;

namespace Application.Common.Abstractions;

/// <summary>توليد رموز JWT الوصول. التنفيذ في Infrastructure.</summary>
public interface IJwtTokenGenerator
{
    /// <summary>يُنشئ access token موقّعًا يحمل المعرّف والوحدة والصلاحيات ونطاق العزل.</summary>
    AccessToken Generate(User user, IReadOnlyCollection<string> permissions, IReadOnlyCollection<long> unitScope);
}

public sealed record AccessToken(string Value, DateTimeOffset ExpiresAtUtc);

/// <summary>تجزئة وتحقّق كلمات المرور (وتجزئة رموز التحديث).</summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);

    /// <summary>تجزئة ثابتة (SHA-256) لتخزين رموز التحديث (نبحث عنها بالـ hash).</summary>
    string HashToken(string token);
}

/// <summary>مزوّد الوقت — قابل للحقن لتسهيل الاختبار.</summary>
public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}
