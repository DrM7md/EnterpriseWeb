using Application.Features.Users;
using Xunit;

namespace Application.UnitTests.Users;

public class UserValidatorsTests
{
    private readonly CreateUserRequestValidator _create = new();

    [Fact]
    public void Valid_create_request_passes()
    {
        var request = new CreateUserRequest("jdoe", "jdoe@ministry.gov", "John Doe", "Passw0rd", null, null);

        Assert.True(_create.Validate(request).IsValid);
    }

    [Theory]
    [InlineData("", "jdoe@ministry.gov", "John", "Passw0rd")]        // username فارغ
    [InlineData("jdoe", "not-an-email", "John", "Passw0rd")]         // بريد غير صالح
    [InlineData("jdoe", "jdoe@ministry.gov", "John", "short1")]      // كلمة مرور قصيرة
    [InlineData("jdoe", "jdoe@ministry.gov", "John", "onlyletters")] // بلا أرقام
    [InlineData("jdoe", "jdoe@ministry.gov", "John", "12345678")]    // بلا حروف
    public void Invalid_create_request_fails(string userName, string email, string fullName, string password)
    {
        var request = new CreateUserRequest(userName, email, fullName, password, null, null);

        Assert.False(_create.Validate(request).IsValid);
    }
}
