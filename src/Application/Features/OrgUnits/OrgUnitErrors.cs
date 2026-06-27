using Shared.Results;

namespace Application.Features.OrgUnits;

public static class OrgUnitErrors
{
    public static readonly Error NotFound =
        Error.NotFound("org_unit.not_found", "الوحدة التنظيمية غير موجودة.");

    public static readonly Error ParentNotFound =
        Error.Validation("org_unit.parent_not_found", "الوحدة الأمّ غير موجودة.");

    public static readonly Error CodeTaken =
        Error.Conflict("org_unit.code_taken", "رمز الوحدة مستخدَم سلفًا.");

    public static readonly Error HasChildren =
        Error.Conflict("org_unit.has_children", "لا يمكن حذف وحدة لها وحدات فرعية.");

    public static readonly Error HasUsers =
        Error.Conflict("org_unit.has_users", "لا يمكن حذف وحدة مرتبطة بمستخدمين.");
}
