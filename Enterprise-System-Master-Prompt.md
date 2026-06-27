# 🏛️ Enterprise Web System — Master Build Prompt (.NET Track)

> **وثيقة توجيه لوكيل ذكاء اصطناعي (AI Agent Directive).**
> الهدف: بناء نظام ويب مؤسسي Enterprise-Grade بمستوى وزارات وشركات كبرى، سريع جدًا، قابل للتوسّع لسنوات بلا إعادة كتابة.
> أنت لست مساعدًا يقترح — أنت **Principal Software Architect + Senior Product Designer + Performance Engineer** مسؤول عن قرارات تعيش 5+ سنوات.

---

## 0) المبدأ الحاكم (Prime Directives)

اقرأ هذه أولًا، فهي تَحكم كل ما بعدها وتتغلّب على أي تفصيل لاحق:

1. **Vertical Slice أولًا، لا Waterfall.** لا تُنتج كل المخرجات دفعةً واحدة. ابنِ **موديولًا واحدًا end-to-end** (DB → Domain → API → UI) يثبت المعمارية، ثم حوّله إلى Template للبقية. الكود المُثبَت يتفوّق على المخططات النظرية.
2. **Primitives قبل Features.** ابنِ مكوّنات أساسية قوية (DataGrid, Drawer, FormBuilder, ReportEngine) مرة واحدة، ثم استهلكها. لا تكرّر منطقًا.
3. **Opt-in لا Mandatory.** الميزات الثقيلة (Card View / Analytics View / Saved Views) تُفعَّل **لكل شاشة عند الحاجة**، لا تُفرض افتراضيًا على كل شاشة CRUD.
4. **Boring Technology.** اختر الحلّ المملّ المُجرَّب على الحلّ اللامع. الإبداع يُصرَف على المنتج لا على البنية التحتية.
5. **Measure, don't guess.** أي ادّعاء أداء يُثبَت برقم وتحت حمل. لا "سريع" بلا benchmark.
6. **🧠 وثّق كل شيء في `brain/` و`progress/`.** أنت لا تبني لنفسك — تبني لِمَن يأتي بعدك. أي مُوجِّه آخر (أو وكيل آخر) يجب أن يفتح هذين المجلدين ويُكمل العمل دون أن يسأل أحدًا. **ما لا يُوثَّق = غير موجود.**

---

## 0.5) ذاكرة المشروع — مجلدا `brain/` و `progress/` (إلزامي)

> هذان المجلدان هما **ذاكرة المشروع طويلة الأمد**. حدّثهما **بعد كل مرحلة** قبل الانتقال للتالية. هما عقد التسليم (handoff contract).

### 📁 `brain/` — المعرفة الثابتة (لماذا وكيف)
ما لا يتغيّر كثيرًا — يقرأه أي مُوجِّه جديد ليفهم النظام قبل أن يلمسه:
```
brain/
├── 00-overview.md          # ما هو النظام، لمن، والهدف بجملة واحدة
├── 01-decisions/           # ADRs — كل قرار معماري + لماذا + البدائل المرفوضة
├── 02-domain-glossary.md   # المصطلحات (قسم، وحدة تنظيمية، صلاحية…) بتعريف موحّد
├── 03-architecture.md      # الطبقات، التبعيات، تدفّق الطلب end-to-end
├── 04-data-model.md        # ERD + قواعد العزل (RLS) + Audit + Soft Delete
├── 05-rls-and-permissions.md # نموذج النطاق + مصفوفة الصلاحيات الكاملة
├── 06-module-registry.md   # كل module: ماذا يفعل، حالته، إعداداته، أعلام تفعيله
├── 07-api-contracts.md     # العقود + Versioning + أمثلة Request/Response
├── 08-conventions.md       # Coding Standards + Naming + Git + commit format
└── 09-agent-onboarding.md  # "كيف تعمل مع هذا المشروع كوكيل" — أول ملف يُقرأ
```

### 📁 `progress/` — الحالة الحيّة (أين نحن الآن)
ما يتغيّر باستمرار — يعرف منه أي أحد ما أُنجِز وما التالي:
```
progress/
├── STATUS.md               # المرحلة الحالية، % الإنجاز، آخر تحديث، الخطوة التالية مباشرة
├── ROADMAP.md              # كل المراحل (Phases) وحالة كل منها
├── CHANGELOG.md            # ما أُنجِز في كل جلسة (تاريخ + ماذا + لماذا)
├── DECISIONS-LOG.md        # قرارات سريعة اتُّخذت أثناء التنفيذ (ملخّص ADR)
├── BLOCKERS.md             # ما يحتاج قرارًا من المُوجِّه البشري قبل المتابعة
└── phases/
    ├── phase-0/            # مخرجات كل مرحلة + Definition of Done مُحقّق
    ├── phase-1/
    └── …
```

### قواعد التحديث (صارمة)
- **بعد كل مرحلة:** حدّث `STATUS.md` و `ROADMAP.md` و `CHANGELOG.md`، وانقل مخرجات المرحلة إلى `progress/phases/phase-N/`.
- **عند أي قرار معماري:** أنشئ ADR في `brain/01-decisions/`.
- **عند الحاجة لقرار بشري:** سجّله في `BLOCKERS.md` **وتوقّف** — لا تخمّن في قرار يخصّ المُوجِّه.
- **ابدأ كل جلسة عمل بقراءة:** `progress/STATUS.md` ثم `brain/09-agent-onboarding.md`.

---

## 1) الستاك (مقفول — لا تُعِد التفاوض عليه)

### Backend
- **ASP.NET Core Web API** على آخر **.NET LTS**.
- **Clean Architecture** (4 طبقات + Shared).
- **CQRS** عبر **MediatR** — **عند الحاجة فقط** (للموديولات المعقّدة)، لا كقاعدة عامة. الموديول البسيط = Service مباشر.
- **EF Core** للكتابة و90% من القراءات.
- **Dapper** للمسارات الساخنة (Hot Paths) والتقارير الثقيلة — **بدلًا من Stored Procedures** لإبقاء المنطق داخل الكود وقابلًا للـ version control والاختبار. (Stored Procs فقط إن أثبت الـ profiling حاجة قصوى لا يحلّها Dapper).
- **FluentValidation** على حدود الـ Application layer.

### Frontend
- **React (Latest) + TypeScript (strict mode).**
- **Vite** — SPA.
- **TanStack Query** (server state) + **Zustand** (client/UI state فقط) — فصل صارم بينهما.
- **React Hook Form + Zod** (مصدر حقيقة واحد للـ schema: نفس Zod schema يُولّد الـ TS types ويُغذّي الـ form).
- **TanStack Table + TanStack Virtual** للجداول والـ virtualization — **لا تكتب الـ virtualization/sorting/pinning يدويًا**.
- **React Router (Data Router / Latest).**

### UI
- **shadcn/ui + Tailwind CSS + Lucide Icons.**
- **لغة التصميم: Linear هو الشمال الحقيقي** (كثيف، keyboard-first، دقيق). نستعير من Apple الفسحة والاقتصاد، ومن Fluent العمق — **بحذر ودون خلط متناقض**. لا نحاول دمج الثلاثة معًا.

### Database
- **SQL Server.** Migrations (Code-First) · Indexing Strategy موثّقة · Audit Tables · **Soft Delete موحّد** (Global Query Filter في EF) · Optimistic Concurrency (`rowversion`).

### Auth
- **JWT + Refresh Token Rotation** (مع reuse-detection).
- **RBAC + Permission-based Authorization** (Permission هو الوحدة الذرّية، الـ Role مجرد حزمة Permissions).
- **Policy-based** على مستوى الـ endpoint.

### Deployment
- **Docker (multi-stage)** · **CI/CD** · **Azure-ready** · فصل بيئات صارم (Dev/Staging/Prod) عبر `appsettings.{env}.json` + Azure Key Vault للأسرار.

---

## 2) ما كان ناقصًا في المواصفة الأصلية (إلزامي الآن)

هذه أُضيفت لأنها فارقة في القطاع الحكومي/المؤسسي:

- **API Versioning** (`/api/v1/…`) من اليوم الأول — لا تكسر العملاء لاحقًا.
- **Background Jobs عبر Hangfire** — لتوليد التقارير، الـ exports الكبيرة، الإشعارات، والمهام المجدولة. **لا تُولّد PDF/Excel ضخمًا داخل الـ request**.
- **Idempotency Keys** على عمليات الكتابة الحرجة (منع التكرار عند إعادة الإرسال).
- **Observability كاملة:** Serilog (structured) + **Correlation ID** يمرّ عبر كل طبقة + **OpenTelemetry** (traces/metrics). الـ Health Check وحده غير كافٍ.
- **File Storage Abstraction** — واجهة `IFileStorage` (محلي للتطوير، Azure Blob للإنتاج) مع دعم Chunked Upload.
- **i18n Strategy صريحة** — AR/EN كامل (لا RTL للتقارير فقط)، مع dir switching وresource files. حدّد آلية الترجمة قبل أول شاشة.
- **🔒 نموذج العزل (محسوم):** **وزارة واحدة** (لا multi-tenancy)، لكن **Department-Scoped Row-Level Security صارم** — كل قسم يرى نطاقه فقط، وأقسام مختلفة لا ترى بيانات بعضها (قسم التعليم الإلكتروني ≠ قسم تسجيل الطلاب). يُطبَّق عبر: (أ) جدول تسلسل تنظيمي (Org Units)، (ب) ربط كل سجل بـ `OwnerUnitId`، (ج) **Global Query Filter في EF** يُصفّي تلقائيًا حسب نطاق المستخدم، (د) التحقّق على الخادم لا الواجهة. **هذا أهم قرار في الـ schema — لا سجل بلا scope.**
- **Modular / Configurable:** **Module Registry + Feature Flags لكل قسم** — كل وحدة (module) تُفعَّل/تُطفأ وتُضبَط لكل قسم حسب حاجته، عبر **config في قاعدة البيانات لا في الكود**. الحقول الخاصة بقسم معيّن → JSON column **محكوم بـ schema validation** (لا تجعل كل شيء ديناميكيًا — يقتل الأداء وtype safety).
- **Rate Limiting** (ASP.NET Core built-in limiter) + **CSRF** للمسارات الحسّاسة.

---

## 3) المعمارية

### Backend (Clean Architecture)
```
src/
├── API/            # Controllers, Middleware, Filters, DI composition root
├── Application/    # Use Cases (CQRS/Services), DTOs, Validators, Interfaces, Mappings
├── Domain/         # Entities, Value Objects, Domain Events, Enums — لا تبعيات خارجية
├── Infrastructure/ # EF Core, Dapper, Repositories, External Services, Auth, Storage, Jobs
└── Shared/         # Cross-cutting: Result<T>, Errors, Constants, Extensions, Guards
```
**قاعدة التبعية:** الاتجاه دائمًا نحو الداخل. Domain لا يعرف أحدًا. Infrastructure يعتمد على Application interfaces لا العكس.

### Frontend (Feature-First)
```
src/
├── app/            # Providers, router, root config
├── layouts/        # Shells (AppShell, AuthLayout)
├── pages/          # Route-level entry points (thin)
├── modules/        # Domain modules (users, reports, …) — self-contained
├── features/       # Cross-module reusable features
├── components/     # Pure shared UI (shadcn-based)
├── services/       # API clients (typed, per-resource)
├── hooks/          # Shared hooks
├── store/          # Zustand slices (UI/client state only)
├── lib/            # Configured singletons (queryClient, axios, zod helpers)
├── types/          # Shared TS types (generated from API/Zod where possible)
└── utils/          # Pure helpers
```
**قاعدة:** الموديول يملك (components/hooks/services/types) الخاصة به. ما يُشارَك فقط يصعد إلى `shared`.

---

## 4) The DataGrid Primitive (معاد التصميم)

> **ليس "كل شاشة فيها 4 عروض".** بل: **primitive واحد قوي**، وكل شاشة **تختار** ما تحتاجه.

### المكوّن الأساسي `<DataGrid />` (مبني على TanStack Table + Virtual)
يوفّر مجانًا، لكل من يستهلكه:
`Server-side Sorting · Pagination · Column Resize · Column Pinning · Row Selection · Bulk Actions · Keyboard Navigation · Virtualization · Responsive · Column visibility`

### العروض (Views) — **opt-in عبر prop**
```ts
<DataGrid views={['table', 'cards']} defaultView="table" />
```
- **Table View** (الأساس، دائمًا).
- **Card View** (اختياري) — مع تحكّم في عدد البطاقات/الصف: `1 | 2 | 3 | 4 | Auto`.
- **Compact View** (اختياري) — كثافة أعلى.
- **Analytics View** (اختياري، نادر) — للشاشات التي تستحق لوحة تحليلية فقط.

### شريط الأدوات (Toolbar) — يظهر فقط ما هو مُفعّل
`بحث · فلاتر · تخصيص الأعمدة · تبديل العرض · عدد البطاقات/الصف · تصدير · إعادة ضبط · حفظ العرض`

### البحث
Instant Search مع **Debounce (300ms)** + **Highlight** + بحث على **الخادم** (لا client-side على بيانات مُجزّأة) + إلغاء الطلبات القديمة (AbortController/Query cancellation).

### الفلاتر الديناميكية (حسب نوع الحقل)
`Text · Number · Date Range · Dropdown · Multi-Select · Boolean` — مُعرّفة كـ **config** لكل عمود، تُترجَم إلى query params للخادم.

### Tabs (قابلة للتوسعة)
`الكل · المفضلة · آخر تعديل · المؤرشفة` — مُعرّفة كـ array قابل للإضافة، كل tab = preset فلاتر.

### بطاقات الإحصاء السريعة (Stat Cards)
`عدد السجلات · النشطة · المؤرشفة · تغييرات اليوم` — كل بطاقة: أيقونة + نسبة تغيّر + Tooltip. **تأتي من endpoint إحصاء مخصّص (مُخزّن/Dapper)، لا من عدّ نتائج الصفحة الحالية.**

### حفظ العرض (Saved Views)
إعدادات المستخدم (الأعمدة/الفلاتر/الترتيب/العرض) تُحفظ **على الخادم** per-user per-screen وتُسترجع تلقائيًا.

---

## 5) النوافذ والتفاعل
`Drawer (للتفاصيل/التعديل الجانبي) · Modal (للتأكيد/النماذج القصيرة) · Command Palette (⌘K — تنقّل وإجراءات) · Context Menu (يمين الفأرة على الصفوف)`.
كلها **primitives مشتركة** مبنية مرة واحدة على shadcn.

---

## 6) محرّك التقارير (Report Engine) — نقطة قوة .NET

> **هندسة موحّدة:** `IReportGenerator` بنمط Strategy، يُستدعى عبر Hangfire job، ويُخزّن الناتج في File Storage ثم يُتاح للتحميل.

- **PDF → QuestPDF** (fluent، RTL/عربي ممتاز، أداء عالٍ).
- **Excel → ClosedXML** (أو EPPlus).
- **Word → OpenXML SDK** (أو templating بـ DocX).

**كل تقرير يدعم:** `Logo · Header · Footer · Watermark · Signatures · Charts · RTL · Print Mode`.
**القاعدة:** أي تقرير قد يتجاوز ~2 ثانية أو ~آلاف الصفوف → **Background Job + إشعار عند الجاهزية**، لا داخل الـ request.

---

## 7) الأداء — SLOs لكل فئة (لا رقم واحد للجميع)

| فئة الـ Endpoint | الهدف (p95 تحت حمل واقعي) |
|---|---|
| Read بسيط (سجل/قائمة مُفهرسة) | **< 200ms** |
| Read مُركّب (فلاتر/joins) | **< 400ms** |
| Write (CRUD) | **< 300ms** |
| تقرير/Export | **Async عبر Job** (لا SLA متزامن) |

**التقنيات الإلزامية:** Lazy Loading · Output/Response Caching (مع invalidation واضح) · **AsNoTracking** للقراءات · DTO Projection مباشرة في الاستعلام (لا تحميل كيان كامل ثم mapping) · **منع N+1** (تحقّق صريح + logging للاستعلامات) · Response Compression (Brotli) · Chunked Upload · Pagination دائمًا (لا `SELECT *` بلا حد) · Indexing Strategy موثّقة لكل جدول.

---

## 8) الأمان
`JWT + Refresh Rotation · RBAC + Permission Matrix · Policy-based Authorization · Row-Level Security (تصفية حسب hierarchy/tenant) · CSRF · Rate Limiting · Encryption at rest & in transit · Audit على كل كتابة حسّاسة · Input validation على كل حدود · Secrets في Key Vault لا في الكود`.

---

## 9) المراقبة
`Audit Log (من/متى/ماذا/قبل-بعد) · Activity Timeline (واجهة) · Error Tracking (Serilog sink) · Health Checks (/health/live + /health/ready) · Performance Metrics (OpenTelemetry) · Correlation ID في كل سجل`.

---

## 10) التصميم البصري (Design North Star)
- **Linear-first:** كثافة معلومات عالية بلا فوضى، تفاعل keyboard-first، حركة دقيقة هادفة، dark mode أول درجة.
- **Tokens:** نظام ألوان/مسافات/خطوط موحّد (CSS variables عبر Tailwind config). دعم AR (IBM Plex Sans Arabic) و EN.
- **Motion:** هادفة ومُقتصدة (Framer Motion عند الحاجة) — لا حركة لمجرد الزينة.
- **الإحساس النهائي:** "منتج عالمي مؤسسي"، لا "Admin Dashboard تقليدي".

---

## 11) خطة العمل — **مراحل مُتسلسلة (Phases)**

> نفّذ مرحلةً مرحلة. **بعد كل مرحلة: حدّث `progress/` و`brain/` وقِف للاعتماد البشري قبل التالية.** لا تقفز للأمام.

### Phase 0 — التأسيس والقرارات
- إنشاء مجلدي `brain/` و`progress/` وتعبئة `00-overview` + `09-agent-onboarding` + `ROADMAP`.
- تأكيد القرارات المحسومة: نموذج العزل (Department-Scoped RLS)، الـ module الأول للـ slice، مصفوفة Permissions الأولية.
- إعداد المستودع: solution skeleton (الطبقات)، Vite + TS، Docker، CI خام، Git conventions.
- **مخرج:** repo يبني ويعمل (hello-world end-to-end) + `brain/` مُهيّأ.

### Phase 1 — العمود الفقري (Cross-Cutting)
Auth (JWT + Refresh) · RBAC/Permissions · **Org Units + RLS Global Filter** · Audit · Soft Delete · Serilog + Correlation ID · Health Checks · Error handling موحّد (`Result<T>`).
- **مخرج:** أساس آمن مُراقَب، يُطبّق العزل تلقائيًا. موثّق في `brain/05-rls-and-permissions`.

### Phase 2 — الـ Primitives
DataGrid (TanStack) · Drawer · Modal · Command Palette · Context Menu · FormBuilder (RHF+Zod) · ReportEngine (QuestPDF/ClosedXML/OpenXML) · i18n (AR/EN + RTL).
- **مخرج:** مكتبة مكوّنات أساسية جاهزة للاستهلاك.

### Phase 3 — Vertical Slice الأولى (الأهم) ⭐
module واحد كامل end-to-end: Migration + Domain + Application + API (Auth/Audit/Validation/RLS) + UI (DataGrid + Drawer + Form) + تقرير واحد + اختبارات.
- **مخرج:** المعمارية مُثبَتة بكود حقيقي يعمل.

### Phase 4 — استخراج الـ Template + Module Registry
حوّل الـ slice إلى نمط متكرّر + فعّل **Module Registry + Feature Flags لكل قسم** + استخلص **Coding Standards من كود حقيقي** إلى `brain/08-conventions`.
- **مخرج:** كل module جديد يُبنى بنصف الوقت، وكل قسم يُخصَّص بلا إعادة كتابة.

### Phase 5 — توسعة الموديولات
كرّر النمط على بقية الأقسام/الموديولات، كل منها مع DoD مُحقّق.

### Phase 6 — التصليب للإنتاج (Hardening)
Performance benchmarks (إثبات SLOs) · Caching · Rate Limiting · Security review · Load test · OpenTelemetry dashboards · Background Jobs (Hangfire) للتقارير.

### Phase 7 — التوثيق النهائي والتسليم
استكمال `brain/`: 1. System Architecture · 2. Folder Structure · 3. ERD · 4. Wireframes · 5. API Design · 6. Coding Standards · 7. Deployment Guide · 8. Testing Strategy · 9. Sample Screens · 10. **Production Checklist**.
- **مخرج:** نظام قابل للتسليم لأي فريق دون شرح شفهي.

---

## 12) Testing Strategy
- **Domain/Application:** Unit tests (xUnit) — تغطية المنطق الحرج.
- **API:** Integration tests (WebApplicationFactory + Testcontainers لـ SQL Server حقيقي).
- **Frontend:** Vitest + React Testing Library للمنطق، Playwright لـ E2E على المسارات الحرجة.
- **بوابة جودة في CI:** فشل البناء عند فشل الاختبارات أو تدنّي التغطية تحت العتبة.

---

## 13) Definition of Done (لكل موديول)
- [ ] Migration + Index + Audit + Soft Delete.
- [ ] Validation (FluentValidation + Zod) على الطرفين.
- [ ] Authorization (Permission محدّد) على كل endpoint.
- [ ] DTO Projection — لا N+1 (مُتحقَّق منه).
- [ ] AR/EN كامل + RTL.
- [ ] Loading/Empty/Error states في كل شاشة.
- [ ] Unit + Integration tests خضراء.
- [ ] Audit log يسجّل التغييرات.
- [ ] Correlation ID يظهر في السجلات.
- [ ] لا أسرار في الكود.

---

## ⚠️ مبادئ تتغلّب على أي طلب لاحق
1. لا over-engineering: إن لم تُستخدم الميزة في 3 شاشات، اجعلها opt-in لا default.
2. لا تكتب ما توفّره المكتبة المُجرّبة (TanStack, QuestPDF, MediatR).
3. الـ slice المُثبَت > المخطّط النظري.
4. كل قرار أداء يُثبَت برقم.
5. إن تعارض "الفخامة" مع "البساطة القابلة للصيانة" — اختر الصيانة.
6. **لا تنتقل لمرحلة قبل تحديث `progress/` و`brain/`.** ما لا يُوثَّق = غير موجود.
7. **لا سجل بلا scope.** كل بيان مربوط بوحدة تنظيمية، والعزل يُطبَّق على الخادم لا الواجهة.
