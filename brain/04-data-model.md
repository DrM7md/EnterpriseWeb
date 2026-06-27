# 04 — نموذج البيانات (Data Model)

> Phase 1: الجداول الأساسية مُنشأة (migration `InitialCreate`). كيانات الأعمال تُضاف في Phase 3+.

## العقود الإلزامية لكل كيان
| الجانب | القاعدة |
|---|---|
| العزل | كل كيان قابل للعزل يحمل `OwnerUnitId` (FK → OrgUnits)، إلزامي. واجهة `IOwnedByUnit`. |
| الحذف الناعم | `IsDeleted` (bool) + `DeletedAtUtc` + Global Query Filter يُخفي المحذوف. واجهة `ISoftDeletable`. |
| التدقيق | `CreatedBy/CreatedAtUtc` + `UpdatedBy/UpdatedAtUtc`. واجهة `IAuditable`. سجل تغييرات منفصل للكتابات الحسّاسة. |
| التزامن | `RowVersion` (`rowversion`/`timestamp`) — Optimistic Concurrency. |
| المفاتيح | `Id` (إما `int`/`bigint` identity أو `Guid` حسب الجدول — يُقرَّر في Phase 1). |

## الجداول الأساسية (Cross-Cutting — ✅ مُنشأة في Phase 1)
- **OrgUnits** — التسلسل الهرمي (`Id`, `ParentId`, `Name`, `Code`, `Path` مادي، `IsActive`). فهرس على `Code` (unique) و`Path`.
- **Users** — الحسابات (`Email`/`NormalizedEmail` unique، `PasswordHash`، `OwnerUnitId`). تخضع لفلتر العزل.
- **Roles** / **Permissions** / **RolePermissions** / **UserRoles** — RBAC (`Permission.Code` unique).
- **RefreshTokens** — `TokenHash` (مفهرس)، `ExpiresAtUtc`، `RevokedAtUtc`، `ReplacedByTokenHash`.
- **AuditLogs** — (EntityName, EntityId, Action, ChangesJson, UserId, OwnerUnitId, CorrelationId, TimestampUtc). فهارس على (EntityName,EntityId) و TimestampUtc.
- **Modules** — كتالوج الموديولات (`Key` unique، `IsCore`). ✅ Phase 4.
- **ModuleSettings** — علم تفعيل لكل وحدة (`ModuleId`+`OwnerUnitId` unique، `IsEnabled`، `ConfigJson`). معزول بـ RLS. ✅ Phase 4.

كل الكيانات القابلة للحذف تحمل `IsDeleted`/`DeletedAtUtc`/`DeletedBy` + `RowVersion` للتزامن.

## استراتيجية الفهرسة (مبدأ)
- فهرس على كل FK، وعلى `OwnerUnitId` (يدخل في كل استعلام معزول).
- فهارس مركّبة تتبع أنماط الاستعلام الفعلية (تُوثَّق لكل جدول عند إنشائه).
- لا `SELECT *`؛ Pagination دائمًا؛ DTO Projection مباشرة.

## ERD
يُولَّد ويُحدَّث في Phase 1 عند أول migration. (placeholder)
