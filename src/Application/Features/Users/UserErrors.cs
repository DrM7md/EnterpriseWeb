using Shared.Results;

namespace Application.Features.Users;

public static class UserErrors
{
    public static readonly Error NotFound =
        Error.NotFound("user.not_found", "المستخدم غير موجود أو خارج نطاقك.");

    public static readonly Error EmailTaken =
        Error.Conflict("user.email_taken", "البريد الإلكتروني مستخدَم سلفًا.");

    public static readonly Error UnitOutOfScope =
        Error.Forbidden("user.unit_out_of_scope", "الوحدة المحدّدة خارج نطاقك.");

    public static readonly Error CannotDeleteSelf =
        Error.Conflict("user.cannot_delete_self", "لا يمكنك حذف حسابك.");

    public static Error RoleNotFound(long id) =>
        Error.Validation("user.role_not_found", $"الدور {id} غير موجود.");
}
