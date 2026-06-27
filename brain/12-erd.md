# 12 — مخطّط الكيانات (ERD)

> مُولَّد من الكيانات الفعلية (Phase 1–6). كل كيان قابل للحذف يحمل `IsDeleted/DeletedAtUtc/DeletedBy` + `RowVersion`، والمُدقَّق يحمل `CreatedBy/CreatedAtUtc/UpdatedBy/UpdatedAtUtc`. الحقول أدناه مختصرة على المفاتيح والأعمدة المميِّزة.

```mermaid
erDiagram
    OrgUnit ||--o{ OrgUnit : "parent/children"
    OrgUnit ||--o{ User : "owns (RLS)"
    OrgUnit ||--o{ ModuleSetting : "scoped"
    OrgUnit ||--o{ ReportRequest : "scoped"

    User ||--o{ UserRole : "has"
    Role ||--o{ UserRole : "assigned"
    Role ||--o{ RolePermission : "grants"
    Permission ||--o{ RolePermission : "in"
    User ||--o{ RefreshToken : "issues"
    Module ||--o{ ModuleSetting : "per-unit flag"

    OrgUnit {
        long Id PK
        long ParentId FK "nullable"
        string Name
        string Code UK
        string Path "materialized"
        bool IsActive
    }
    User {
        long Id PK
        long OwnerUnitId FK
        string Email UK "normalized"
        string PasswordHash
        bool IsActive
    }
    Role {
        long Id PK
        string NormalizedName UK
        bool IsSystem
    }
    Permission {
        long Id PK
        string Code UK
        string Module
    }
    RolePermission {
        long RoleId PK,FK
        long PermissionId PK,FK
    }
    UserRole {
        long UserId PK,FK
        long RoleId PK,FK
    }
    RefreshToken {
        long Id PK
        long UserId FK
        string TokenHash "indexed"
        datetime ExpiresAtUtc
        datetime RevokedAtUtc "nullable"
        string ReplacedByTokenHash "rotation"
    }
    AuditLog {
        long Id PK
        string EntityName
        string EntityId
        string Action "Created/Updated/Deleted"
        string ChangesJson
        long UserId "nullable"
        long OwnerUnitId "nullable"
        string CorrelationId
        datetime TimestampUtc
    }
    Module {
        long Id PK
        string Key UK
        bool IsCore
    }
    ModuleSetting {
        long Id PK
        long ModuleId FK
        long OwnerUnitId FK
        bool IsEnabled
        string ConfigJson "nullable"
    }
    ReportRequest {
        long Id PK
        long OwnerUnitId FK
        long RequestedBy
        string Type
        string Format
        string Status "Pending/Processing/Completed/Failed"
        string ScopeJson "scope at request time"
        string FileKey "nullable"
    }
```

## ملاحظات العزل والفهرسة
- **RLS:** الكيانات `IOwnedByUnit` (`User`, `ModuleSetting`, `ReportRequest`) تُصفّى تلقائيًا بـ `OwnerUnitId ∈ نطاق المستخدم`.
- **Soft Delete:** `OrgUnit`, `User`, `Role`, `ModuleSetting`, `ReportRequest` (يرثون `AuditableEntity`).
- **فهارس مميِّزة:** `OrgUnit.Code`/`Path` · `User.NormalizedEmail`(U)/`OwnerUnitId` · `Role.NormalizedName`(U) · `Permission.Code`(U) · `RefreshToken.TokenHash` · `Module.Key`(U) · `ModuleSetting(ModuleId,OwnerUnitId)`(U) · `AuditLog(EntityName,EntityId)`/`TimestampUtc` · `ReportRequest(OwnerUnitId,Status)`.
- جداول **Hangfire** تُدار في schema `HangFire` منفصل (لا تخصّ EF).
