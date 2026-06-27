using System.Security.Cryptography;
using System.Text;
using Application.Common.Abstractions;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

/// <summary>
/// تجزئة كلمات المرور عبر مُجزّئ ASP.NET Core (PBKDF2). رموز التحديث تُجزّأ بـ SHA-256
/// (نبحث عنها بالـ hash؛ لا حاجة لـ salt لأنها عشوائية بطول كافٍ).
/// </summary>
internal sealed class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<object> _hasher = new();
    private static readonly object Dummy = new();

    public string Hash(string password) => _hasher.HashPassword(Dummy, password);

    public bool Verify(string password, string hash) =>
        _hasher.VerifyHashedPassword(Dummy, hash, password) is not PasswordVerificationResult.Failed;

    public string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
