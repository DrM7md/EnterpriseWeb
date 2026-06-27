using Infrastructure.Identity;
using Xunit;

namespace Infrastructure.UnitTests.Identity;

public class PasswordHasherTests
{
    private readonly PasswordHasher _sut = new();

    [Fact]
    public void Hash_then_Verify_succeeds_for_correct_password()
    {
        var hash = _sut.Hash("Admin@12345");

        Assert.NotEqual("Admin@12345", hash);
        Assert.True(_sut.Verify("Admin@12345", hash));
    }

    [Fact]
    public void Verify_fails_for_wrong_password()
    {
        var hash = _sut.Hash("Admin@12345");

        Assert.False(_sut.Verify("wrong-password", hash));
    }

    [Fact]
    public void HashToken_is_deterministic_and_hides_raw_token()
    {
        const string token = "raw-refresh-token-value";

        var a = _sut.HashToken(token);
        var b = _sut.HashToken(token);

        Assert.Equal(a, b);                       // قابل للبحث بالـ hash
        Assert.NotEqual(token, a);                // لا نخزّن الرمز الخام
        Assert.NotEqual(a, _sut.HashToken("other"));
    }
}
