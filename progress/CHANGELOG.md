# 📝 CHANGELOG

## 2026-06-27 — Phase 1: العمود الفقري (Cross-Cutting)
**ماذا:** أساس آمن مُراقَب يطبّق العزل تلقائيًا.
**لماذا:** كل موديول لاحق يرث الأمان والعزل والتدقيق دون إعادة كتابة.

- **Domain:** كيانات أساسية (`Entity`/`AuditableEntity`) + واجهات `IOwnedByUnit`/`ISoftDeletable`/`IAuditable` + `OrgUnit`/`User`/`Role`/`Permission`/`RolePermission`/`UserRole`/`RefreshToken`/`AuditLog`.
- **Application:** `ICurrentUser` · `IAppDbContext` · `IJwtTokenGenerator` · `IPasswordHasher` · `IDateTimeProvider` · كتالوج `Permissions` · `AuthService` (login/refresh/logout) + validators + `JwtOptions`.
- **Infrastructure:** `AppDbContext` بفلاتر عزل/حذف-ناعم · `AuditingInterceptor` · entity configs · `JwtTokenGenerator` · `PasswordHasher` (PBKDF2 + SHA-256 للرموز) · `CurrentUser` (claims) · `DbSeeder` · design-time factory.
- **API:** endpoints المصادقة · `PermissionPolicyProvider` ديناميكي + handler · `CorrelationIdMiddleware` · `GlobalExceptionHandler` · `ValidationFilter` · Serilog · JWT bearer · DB health check.
- **DB:** migration `InitialCreate` مُطبَّق على LocalDB + بذر أوّلي.
- قرار معماري جديد: **ADR-0003** (تضمين نطاق العزل في الـ JWT).
- اختبارات: +7 (PasswordHasher · JwtTokenGenerator · CurrentUser) → 10 إجمالًا خضراء.

**التحقّق:** `dotnet build` (0 تحذير) · `dotnet test` (10/10) · تشغيل end-to-end فعلي لتدفّق login/refresh/reuse-detection/RLS على LocalDB.


## 2026-06-27 — Phase 0: التأسيس
**ماذا:** بناء هيكل النظام الكامل end-to-end.
**لماذا:** إثبات المعمارية بكود حقيقي قبل أي توسعة (Vertical Slice أولًا).

- إنشاء مستودع Git مستقلّ + `.gitignore` + `Directory.Build.props` (nullable/strict/warnings-as-errors).
- Clean Architecture: `Domain` · `Application` · `Infrastructure` · `API` · `Shared` + مشروع اختبارات.
- `Shared`: `Result<T>` + `Error` + `ErrorType`.
- `Application`: `ISystemInfoService` + `SystemInfo` DTO + امتداد DI.
- `Infrastructure`: `SystemInfoService` + امتداد DI.
- `API`: composition root + `/api/v1/system/info` + health checks + OpenAPI + CORS + `ResultExtensions`.
- Frontend (Vite + React + TS strict): `apiClient` · `queryClient` · موديول `system` (types/service/hook) + شاشة بحالات Loading/Error.
- اختبارات: 3 وحدات لـ `Result` (خضراء).
- Docker multi-stage (API + client + nginx) + `docker-compose` (مع SQL Server) + GitHub Actions CI.
- توثيق: `brain/00–09` + `progress/*`.

**التحقّق:** `dotnet build` (0 تحذير) · `dotnet test` (3/3) · `npm run build` (نجاح).
