# 📝 CHANGELOG

## 2026-06-27 — محرّك التقارير (ReportEngine) — نقطة قوة .NET
**ماذا:** primitive توليد تقارير (Excel + PDF) بنمط Strategy، مُستهلَك في تصدير المستخدمين.
**لماذا:** فجوة وظيفية مطلوبة؛ وأي موديول يحتاج تصديرًا الآن يستهلك المحرّك بلا تكرار.

- **Application:** `Common/Reporting` — `TabularReport` (نموذج جدولي محايد للصيغة) + `IReportEngine` + `IReportWriter` (Strategy) + `ReportFormat`/`ReportFile`.
- **Infrastructure:** `ExcelReportWriter` (ClosedXML، رأس مُنسّق + تجميد) · `PdfReportWriter` (QuestPDF، RTL + رأس/تذييل + ترقيم) · `ReportEngine` (توزيع حسب الصيغة) + ترخيص QuestPDF Community.
- **Users:** `BuildExportAsync` يبني تقريرًا **معزولًا حسب النطاق** + endpoint `GET /users/export?format=xlsx|pdf` بصلاحية `users.export`.
- **Frontend:** أزرار تصدير Excel/PDF في شريط أدوات المستخدمين (تنزيل blob).
- اختبارات: +3 (بايتات صالحة: PK لـ xlsx · %PDF لـ pdf · صيغة غير مدعومة) → **34 إجمالًا**.

**التحقّق:** build 0 تحذير · 34/34 اختبار · e2e: xlsx (أكّده `file` = "Microsoft Excel 2007+") · pdf (%PDF، 47KB) · content-type/disposition صحيحان · 401 بلا رمز.
**لاحقًا:** التقارير الثقيلة → Hangfire background job (الآن متزامن للصغيرة).


## 2026-06-27 — Phase 5 (بدء): موديول الأدوار (Roles) — إثبات القالب
**ماذا:** موديول ثانٍ كامل (backend + frontend) مبنيٌّ بقالب `brain/10`.
**لماذا:** إثبات «نصف الوقت» — **بلا migration ولا أي تغيير بنية تحتية**، فقط كود ميزة.

- **Application:** `Features/Roles` (DTOs + Errors + Validators + `IRoleService`): List/Get/Create/Update/Delete + كتالوج الصلاحيات. أدوار النظام محميّة (system_locked).
- **API:** `RolesEndpoints` بصلاحيات `roles.*` + بوابة `RequireModule(roles)` + `/roles/permissions`.
- **Module:** `ModuleKeys.Roles` (core) — يُبذَّر تلقائيًا.
- **Frontend:** موديول `roles` (types/schema/service/hooks) + `RolesPage` + `RoleDrawer` بمنتقي صلاحيات مجمَّع حسب الموديول + عنصر تنقّل.
- اختبارات: +3 (Role validators) → **31 إجمالًا**.

**التحقّق:** build 0 تحذير · 31/31 اختبار · e2e: كتالوج 17 صلاحية · CRUD + ربط صلاحيات · 409 dup/system-locked · roles module=core/enabled.
**ملاحظة القالب:** لا migration، لا تعديل Infrastructure — أُعيد استخدام كيانات Phase 1 (`Role`/`Permission`/`RolePermission`).


## 2026-06-27 — Phase 4: Module Registry + Feature Flags + استخراج الـ Template
**ماذا:** جعل النظام configurable لكل قسم + تحويل slice Users إلى قالب متكرّر.
**لماذا:** كل قسم يُخصَّص بلا إعادة كتابة، وكل موديول جديد يُبنى بنصف الوقت.

- **Domain:** `Module` + `ModuleSetting` (Feature Flag لكل وحدة + `ConfigJson` لحقول القسم).
- **Application:** `IModuleRegistry` (GetEffective/IsEnabled/SetEnabled) + `ModuleKeys` (core vs opt-in) + `modules.*` صلاحيات.
- **Infrastructure:** EF configs + فلتر عزل لـ `ModuleSetting` + migration `AddModuleRegistry` + بذر الموديولات وتفعيل users للجذر.
- **API:** `/modules` (effective/toggle) + **`RequireModule` endpoint filter** (بوابة تفعيل) مطبّقة على Users.
- **Frontend:** `useModules` + بناء تنقّل `AppShell` من الموديولات المُفعّلة فقط.
- **التوثيق:** `brain/10-module-template.md` (القالب) + استخلاص قواعد كود حقيقية إلى `brain/08`.
- اختبارات: +5 لـ `ModuleRegistry` (core-always-on / opt-in / core-locked) → **28 إجمالًا**.

**التحقّق:** build 0 تحذير · 28/28 اختبار · e2e: toggle users → 200↔403 · تعطيل core → 409.


## 2026-06-27 — Vertical Slice الأول: إدارة المستخدمين (Users)
**ماذا:** أول موديول end-to-end (backend + frontend) يثبت المعمارية بكود حقيقي.
**لماذا:** الـ slice المُثبَت > المخطّط النظري؛ والـ primitives تُبنى وهي مُستهلَكة (ADR-0004).

### Backend
- `Shared.Pagination`: `PagedRequest`/`PagedResult<T>`.
- `Application.Features.Users`: DTOs + `IUserService` (List/Get/Create/Update/Delete) + validators + errors.
- `API`: `UsersEndpoints` بصلاحيات `users.*` + ربط query params اختياري.
- إصلاحات: `implicit Error→Result` · `AuditingInterceptor` تدقيق على مرحلتين (EntityId الصحيح للإنشاء).

### Frontend
- مصادقة: `authStore` (Zustand مُخزّن) + axios interceptors (JWT + Correlation ID + تدوير 401).
- primitives: `DataTable` · `Drawer` · نموذج RHF+Zod (`users.schema`).
- شاشة `UsersPage` (بحث/ترقيم/ترتيب/CRUD + إخفاء حسب الصلاحية) · `LoginPage` · `AppShell` · Router + حارس.

**التحقّق:** build 0 تحذير · 23/23 اختبار · CRUD e2e على LocalDB (RLS/soft-delete/audit/authz) · `npm run build` + lint · CORS للـ SPA مُتحقَّق.


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
