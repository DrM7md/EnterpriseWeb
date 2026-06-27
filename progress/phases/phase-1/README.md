# Phase 1 — العمود الفقري (Cross-Cutting) · Definition of Done

## الهدف
أساس آمن مُراقَب يطبّق العزل تلقائيًا — يرثه كل موديول لاحق.

## DoD — مُحقَّق ✅
- [x] EF Core + SQL Server + migration مُطبَّق.
- [x] Auth: JWT + Refresh Rotation + reuse-detection.
- [x] RBAC + Permission-based Authorization (policy لكل endpoint).
- [x] Org Units + RLS Global Query Filter (تصفية تلقائية حسب النطاق).
- [x] Audit (interceptor) + Soft Delete موحّد.
- [x] Serilog structured + Correlation ID عبر كل سجلّ.
- [x] معالجة أخطاء موحّدة (Problem Details).
- [x] Health `live` + `ready` (مع فحص DB).
- [x] اختبارات خضراء (10/10).
- [x] موثّق في `brain/05-rls-and-permissions` + ADR-0003.

## المخرجات (Artifacts)
- Domain: `Common/` + `Entities/`.
- Application: `Common/Abstractions` · `Common/Security` · `Features/Auth`.
- Infrastructure: `Persistence/` (DbContext · Configurations · Interceptors · Migrations · Seeder) · `Identity/` · `Time/`.
- API: `Endpoints/AuthEndpoints` · `Security/PermissionAuthorization` · `Middleware/` · `Common/ValidationFilter`.

## الإثبات (Verification log)
```
dotnet build  → 0 Warning(s) 0 Error(s)
dotnet test   → Passed! 10/10  (Application 3 + Infrastructure 7)
ef database update → Applied 20260627030948_InitialCreate
login/refresh/reuse/RLS → تم التحقّق بالتشغيل على LocalDB (انظر STATUS.md)
```

## ملاحظات للتالي
- واجهة تسجيل الدخول + إرفاق JWT/Correlation في `apiClient` تُبنى ضمن Phase 2/3 (UI primitives).
- اختبارات التكامل (WebApplicationFactory + Testcontainers SQL Server) مؤجّلة حتى توفّر Docker في البيئة.

## التالي
Phase 2 (الـ Primitives) — يتطلّب اعتمادًا بشريًا.
