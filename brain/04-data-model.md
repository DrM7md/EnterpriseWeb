# 04 — نموذج البيانات (Data Model)

> Phase 0: المبادئ والعقود فقط (لا جداول بعد). الـ schema الفعلي يبدأ في Phase 1.

## العقود الإلزامية لكل كيان
| الجانب | القاعدة |
|---|---|
| العزل | كل كيان قابل للعزل يحمل `OwnerUnitId` (FK → OrgUnits)، إلزامي. واجهة `IOwnedByUnit`. |
| الحذف الناعم | `IsDeleted` (bool) + `DeletedAtUtc` + Global Query Filter يُخفي المحذوف. واجهة `ISoftDeletable`. |
| التدقيق | `CreatedBy/CreatedAtUtc` + `UpdatedBy/UpdatedAtUtc`. واجهة `IAuditable`. سجل تغييرات منفصل للكتابات الحسّاسة. |
| التزامن | `RowVersion` (`rowversion`/`timestamp`) — Optimistic Concurrency. |
| المفاتيح | `Id` (إما `int`/`bigint` identity أو `Guid` حسب الجدول — يُقرَّر في Phase 1). |

## الجداول الأساسية (Cross-Cutting — Phase 1)
- **OrgUnits** — التسلسل الهرمي (`Id`, `ParentId`, `Name`, `Path`/`HierarchyId`).
- **Users** — الحسابات + ربط بوحدة تنظيمية.
- **Roles** / **Permissions** / **RolePermissions** / **UserRoles** — RBAC.
- **RefreshTokens** — مع تدوير وكشف إعادة الاستخدام.
- **AuditLogs** — (Entity, EntityId, Action, Before, After, UserId, AtUtc, CorrelationId).
- **Modules** / **FeatureFlags** — Module Registry لكل قسم (config في DB).

## استراتيجية الفهرسة (مبدأ)
- فهرس على كل FK، وعلى `OwnerUnitId` (يدخل في كل استعلام معزول).
- فهارس مركّبة تتبع أنماط الاستعلام الفعلية (تُوثَّق لكل جدول عند إنشائه).
- لا `SELECT *`؛ Pagination دائمًا؛ DTO Projection مباشرة.

## ERD
يُولَّد ويُحدَّث في Phase 1 عند أول migration. (placeholder)
