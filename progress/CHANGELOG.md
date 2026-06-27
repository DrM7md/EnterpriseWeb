# 📝 CHANGELOG

## 2026-06-27 — Caching على مستوى التطبيق + invalidation + عدّادات OTel
**ماذا:** تخزين مؤقت آمن للقراءات العامّة مع إبطال واضح.
**لماذا:** آخر بند أداء في الوثيقة (Caching مع invalidation واضح) — بأمان دون تجاوز التصريح.

- `IAppCache` (Application) + `AppCache` (Infrastructure): IMemoryCache + عدّادات OTel (`app_cache_hits`/`misses`، Meter `EnterpriseSystem.Cache`).
- **على مستوى التطبيق لا HTTP** — التصريح يبقى فعّالًا، يُخزَّن ناتج الاستعلام فقط (لا ثغرة output-cache).
- المُخزَّن: شجرة الوحدات (TTL 5د، تُبطَل عند الكتابة) + كتالوج الصلاحيات (TTL 1س، ثابت).
- تسجيل Meter الكاش في OTel metrics.

**التحقّق:** build 0 تحذير · 44/44 اختبار · e2e: `/metrics` يُظهر hits=4/miss=1 لكل كاش؛ بعد create تظهر الوحدة فورًا (إبطال صحيح).


## 2026-06-27 — Load test تحت تزامن + حدود معدّل قابلة للضبط
**ماذا:** قياس الأداء تحت حمل متزامن حقيقي (إغلاق فجوة «Measure, don't guess»).
**لماذا:** الوثيقة تشترط إثبات الأداء **برقم وتحت حمل**، لا عميل واحد.

- جعل حدود الـ rate limiting قابلة للضبط من config (`RateLimit:GlobalPermitPerMinute` / `AuthPermitPerMinute`، الافتراضيات بلا تغيير).
- driver حمل متزامن (`scratchpad/loadtest.mjs`): pool عمّال، قياس rps + p50/p95/p99 + نسبة الأخطاء.
- نتائج (Release/Production، LocalDB، تزامن 50 و100): **~900K طلب · صفر أخطاء**؛ p95 للقراءة المُركّبة ~10–20ms مقابل SLO 400ms (**هامش 20×**). مُسجّلة في `brain/11`.

**التحقّق:** build 0 تحذير · 44/44 اختبار · أرقام الحمل أعلاه.


## 2026-06-27 — موديول الوحدات التنظيمية (Org Units) — نمط شجري بالقالب
**ماذا:** موديول ثالث (backend + frontend) يدير هيكل الوزارة الشجري.
**لماذا:** الوحدات أساس العزل (تملك السجلات)؛ ويُثبت القالب على نمط شجري لا CRUD مسطّح.

- **Application:** `Features/OrgUnits` (DTOs/Errors/Validators/`IOrgUnitService`): شجرة (مرتّبة بالمسار + مستوى + عدّ الأبناء/المستخدمين) · إنشاء يحسب **المسار المادي** من الأمّ · تعديل · حذف **محميّ** (لا وحدة لها أبناء أو مستخدمون).
- **API:** `OrgUnitsEndpoints` بصلاحيات `org-units.*` + بوابة `RequireModule(org-units)`. (لا migration — كيان موجود من Phase 1.)
- **Frontend:** موديول `orgunits` (types/schema/service/hooks) + صفحة **شجرة مُزاحة بالمستوى** + drawer (اختيار الأمّ) + عنصر تنقّل.
- ترجمات AR/EN (parity 115/115). اختبارات: +6 (validators).

**التحقّق:** build 0 تحذير · 44/44 اختبار · e2e: إنشاء قطاع→قسم (المسار `/1/2/`)، شجرة مُزاحة L0/L1/L2، 409 dup-code، 409 حذف-وحدة-لها-أبناء.


## 2026-06-27 — Idempotency-Keys على الكتابات الحرجة
**ماذا:** منع تكرار العمليات عند إعادة الإرسال (نقر مزدوج / إعادة محاولة الشبكة).
**لماذا:** متطلّب صريح في الوثيقة (#106) لسلامة الكتابات الحرجة.

- `IdempotencyRecord` entity (مفتاح فريد لكل مستخدم) + migration `AddIdempotencyRecords`.
- `IIdempotencyStore` (Application) + تنفيذ EF (Infrastructure) — حفظ ذرّي مع التقاط تصادم الفهرس الفريد.
- `IdempotencyMiddleware`: إن حمل الطلب `Idempotency-Key` + كتابة + مستخدم مُصادَق → يُنفَّذ مرة، وإعادة الإرسال تُرجع الاستجابة المخزّنة (2xx فقط) + رأس `Idempotency-Replayed`.
- اختبارات: +3 (store: roundtrip · تجزئة حسب المستخدم · مفتاح مجهول).

**التحقّق:** build 0 تحذير · 38/38 اختبار · e2e: POST بنفس المفتاح مرتين → نفس `{id}` + `Idempotency-Replayed: true`، وعدد المستخدمين +1 فقط (لا تكرار)؛ وبلا مفتاح → سلوك عادي (409 للمكرّر).


## 2026-06-27 — الإعدادات والتفضيلات: سمة (فاتح/داكن) + نمط النماذج
**ماذا:** ميزة تفضيلات واجهة (client-state) + صفحة إعدادات قابلة للتوسعة.
**لماذا:** «dark mode أول درجة» + tokens موحّدة + تخصيص تجربة المستخدم.

- `lib/theme.ts` (data-theme على `<html>` + متغيّرات CSS لكل سمة) + `store/preferencesStore.ts` (Zustand مُخزّن، تطبيق السمة قبل أوّل رسم).
- `modules/settings/`: صفحة بطاقات + سجلّ أقسام (Appearance: السمة + نمط الإضافة · Dropdowns/Notifications هياكل).
- `Drawer` يحترم نمط الإضافة (لوح جانبي/نافذة منبثقة) · زر تبديل السمة في `AppShell` · مسارات `/settings/*`.
- ترجمات AR/EN (parity 102/102).

**التحقّق:** build · lint نظيف · parity 102/102.


## 2026-06-27 — OpenTelemetry (traces + metrics) — إكمال المراقبة
**ماذا:** مراقبة موزّعة قياسية (OTel) للـ API.
**لماذا:** إغلاق فجوة Observability في Production Checklist؛ والـ Health Check وحده غير كافٍ.

- `API/Observability/TelemetryExtensions.cs`: traces (AspNetCore + HttpClient + SqlClient) + metrics (AspNetCore + HttpClient + Runtime).
- مُصدِّر: **OTLP** إن ضُبط `Otel:OtlpEndpoint` (إنتاج)، وإلا **Console** (تطوير) · مقاييس عبر **Prometheus** على `/metrics`.
- المورد `service.name=EnterpriseSystem.Api` · **Correlation ID مربوط بالـ TraceId** (نفس Activity) · استبعاد `/metrics` و`/health` من التتبّع.

**التحقّق:** build 0 تحذير · 35/35 اختبار · e2e: `/metrics` يُرجع `http_server_request_duration` + `dotnet_*`؛ console يُظهر spans (HTTP route + SQL `db.system.name=microsoft.sql_server`).


## 2026-06-27 — Phase 7: التوثيق النهائي والتسليم
**ماذا:** استكمال `brain/` ليُسلَّم النظام لأي فريق دون شرح شفهي.
**لماذا:** «ما لا يُوثَّق = غير موجود» — التسليم عقد.

- `brain/12-erd.md` — ERD (Mermaid) من الكيانات الفعلية + ملاحظات العزل/الفهرسة.
- `brain/13-deployment.md` — البيئات · متغيّرات الإنتاج · Docker · الهجرات · Hangfire · CI/CD.
- `brain/14-testing-strategy.md` — التغطية (35 اختبارًا) · التشغيل · الفجوات (Testcontainers/Playwright).
- `brain/07` — سطح الـ API الكامل المحدَّث (auth/users/roles/modules/reports/system + الصلاحيات والبوابات).
- **`progress/PRODUCTION-CHECKLIST.md`** — قائمة جاهزية إنتاج صادقة (✅/🟡/⬜) + خطوات Go-Live.
- فهرس `brain/` الكامل في دليل الـ onboarding.

**المخرج:** نظام قابل للتسليم — كل متطلّب مربوط بحالته وموقعه في الكود.


## 2026-06-27 — تقارير غير متزامنة (Hangfire) + IFileStorage — إغلاق متطلّب Phase 6
**ماذا:** توليد التقارير الثقيلة كـ background job بدل داخل الـ request.
**لماذا:** «لا تُولّد PDF/Excel ضخمًا داخل الـ request» (متطلّب صريح).

- **`IFileStorage`** (تجريد) + `LocalFileStorage` (تطوير) — Azure Blob لاحقًا لنفس الواجهة.
- **`ReportRequest`** entity (معزول، يحمل نطاق صاحبه وقت الطلب) + migration `AddReportRequests`.
- **Hangfire (SqlServer)** + `ReportService` (enqueue/status/download) + `ReportJobRunner` (يعمل بنطاق صريح بلا سياق HTTP).
- إعادة هيكلة `UserService`: `BuildExportForScopeAsync` (نطاق صريح) يشارك المنطق مع التصدير المتزامن.
- **API:** `POST /users/export/async` (202+id) · `GET /reports` · `GET /reports/{id}` · `GET /reports/{id}/download` — كلها معزولة.
- **Frontend:** زر «تصدير ضخم (بالخلفية)» يجدول، يستطلع، ثم ينزّل تلقائيًا + إشعار (i18n).

**التحقّق:** build 0 تحذير · 35/35 اختبار · e2e: enqueue 202 → poll Processing→Completed(rows=3) → download (Excel صالح، `file`=Microsoft Excel 2007+) · قائمة التقارير ✅.


## 2026-06-27 — Phase 6 (جزئي): التصليب للإنتاج
**ماذا:** حزمة تصليب أمني/أدائي قابلة للتحقّق عبر HTTP + قياس latency.
**لماذا:** «Measure, don't guess» — رفع النظام نحو جاهزية الإنتاج بأدلّة.

- **Rate Limiting:** حدّ عام 200/دقيقة لكل IP + سياسة `auth` صارمة 10/دقيقة على login/refresh (منع تخمين) + `Retry-After`.
- **Response Compression:** Brotli + Gzip لـ JSON.
- **Security Headers:** nosniff · X-Frame-Options DENY · Referrer-Policy · Cross-Domain none (middleware).
- **Module Gate Caching:** `IMemoryCache` لفحص البوابة (TTL 60s) + إبطال فوري عند التبديل (إصلاح أداء — كان استعلامًا لكل طلب).
- توثيق `brain/11-performance-and-hardening.md` (التطبيق + قياسات + المتبقّي).

**التحقّق:** build 0 تحذير · 35/35 اختبار (+1 إبطال كاش) · e2e: br ✅ · 4 رؤوس أمان ✅ · flood 10×200→4×429+Retry-After ✅ · latency p95: بسيط ~3ms / مُركّب ~7ms (حِمل خفيف، LocalDB — ليس load test).
**المتبقّي:** Hangfire للتقارير الثقيلة · Output Caching · load test حقيقي · Idempotency-Keys.


## 2026-06-27 — i18n (AR/EN كامل + RTL switching)
**ماذا:** ترجمة الواجهة بالكامل ودعم تبديل اللغة والاتجاه (متطلّب DoD لكل موديول).
**لماذا:** الواجهة كانت عربية مثبّتة؛ النظام مؤسسي يتطلّب AR/EN كاملًا.

- **react-i18next + i18next** (مُجرَّب) + كشف/حفظ اللغة (localStorage).
- موارد `locales/ar.json` + `en.json` (78 مفتاحًا متطابقًا — تحقّق parity آليًّا) شاملةً namespace **errors** (يطابق رموز أخطاء الخادم).
- `lib/i18n.ts`: تهيئة + **تبديل اتجاه المستند** (RTL للعربية / LTR للإنجليزية) عند تغيير اللغة.
- `lib/apiError.ts`: ترجمة أخطاء الخادم عبر رمزها (الخادم يُرجع رمز i18n في `title`) → fallback لرسالة الخادم.
- زر تبديل اللغة في `AppShell` + استبدال كل النصوص المثبّتة بـ `t()` عبر Login/Users/Roles/DataTable/Drawer/التنقّل.

**التحقّق:** build · lint نظيف · parity مفاتيح AR/EN (78/78، لا نقص) · كلا الملفّين مُضمَّنان في الحزمة.


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
