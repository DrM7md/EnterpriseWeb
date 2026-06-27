using Shared.Results;

namespace Application.Features.Roles;

public static class RoleErrors
{
    public static readonly Error NotFound =
        Error.NotFound("role.not_found", "الدور غير موجود.");

    public static readonly Error NameTaken =
        Error.Conflict("role.name_taken", "اسم الدور مستخدَم سلفًا.");

    public static readonly Error SystemRoleLocked =
        Error.Conflict("role.system_locked", "لا يمكن تعديل أو حذف دور النظام.");

    public static Error PermissionNotFound(long id) =>
        Error.Validation("role.permission_not_found", $"الصلاحية {id} غير موجودة.");
}
