# ✅ Production Checklist — قائمة جاهزية الإنتاج

> الحالة الصادقة لكل متطلّب. ✅ مُنفّذ ومُتحقَّق · 🟡 جزئي · ⬜ لم يبدأ. هذا عقد التسليم: يعرف أي فريق منه ما الجاهز وما المتبقّي قبل الإطلاق.

## المعمارية والأساس
- ✅ Clean Architecture (Domain/Application/Infrastructure/API/Shared) — قاعدة التبعية نحو الداخل.
- ✅ `.NET 10 LTS` · `TreatWarningsAsErrors` · `Result<T>` بدل الاستثناءات.
- ✅ API Versioning (`/api/v1`) من اليوم الأول.
- ✅ Composition root + امتداد DI لكل طبقة.

## الأمان
- ✅ JWT + Refresh Token Rotation + **reuse-detection** (إبطال السلسلة).
- ✅ RBAC + Permission-based Authorization (سياسات `perm:{code}` ديناميكية).
- ✅ **Row-Level Security** (Global Query Filter لكل `IOwnedByUnit`) — التحقّق على الخادم.
- ✅ Rate Limiting (عام + auth صارم) · Security Headers · CORS مضبوط.
- ✅ تجزئة كلمات المرور (PBKDF2) · رموز التحديث بـ hash.
- ✅ لا أسرار في الكود (`.gitignore` للأسرار · مفتاح dev فقط في appsettings).
- 🟡 **CSRF** للمسارات الحسّاسة (نستخدم Bearer لا cookies؛ يُراجَع عند إضافة cookie auth).
- ✅ **Idempotency-Keys** على الكتابات (رأس `Idempotency-Key` → middleware يعيد الاستجابة المخزّنة بلا تكرار، مُجزّأ حسب المستخدم).
- ⬜ Encryption at rest (يُضبَط على مستوى Azure SQL) · أسرار في **Key Vault** (موثّق، يُطبَّق عند النشر).

## البيانات
- ✅ EF Core + SQL Server · Code-First Migrations (3 هجرات) · Soft Delete موحّد · Optimistic Concurrency (`RowVersion`).
- ✅ Audit Log (من/متى/ماذا/قبل-بعد + CorrelationId) — تدقيق على مرحلتين (مفتاح صحيح للإنشاء).
- ✅ DTO Projection مباشرة (لا N+1) · `AsNoTracking` للقراءات · Pagination دائمًا.
- ✅ استراتيجية فهرسة موثّقة (`brain/12-erd.md`).

## المراقبة (Observability)
- ✅ Serilog (structured) · Correlation ID عبر كل طبقة · Health Checks (`live`/`ready` مع DB).
- ✅ معالج استثناءات موحّد (Problem Details) دون تسريب.
- ✅ **OpenTelemetry** — traces (AspNetCore + HttpClient + SqlClient) + metrics (Prometheus `/metrics`)؛ OTLP للإنتاج. Correlation ID مربوط بالـ TraceId.
- ⬜ لوحات/تنبيهات (Grafana/Azure Monitor) — اربط الـ collector بالمُصدِّر OTLP.

## الميزات المؤسسية
- ✅ Module Registry + **Feature Flags لكل قسم** (config في DB) + بوابة `RequireModule` (+ caching).
- ✅ **ReportEngine** (Strategy) — Excel (ClosedXML) + PDF (QuestPDF RTL).
- ✅ **Background Jobs (Hangfire)** للتقارير الثقيلة + `IFileStorage` (محلي؛ Azure Blob للإنتاج).
- ✅ **i18n** AR/EN كامل + RTL/LTR switching + ترجمة رموز أخطاء الخادم.
- ✅ **Chunked Upload** (رفع على دفعات: init/chunk/complete + تجميع) — مُتحقَّق e2e. 🟡 يتبقّى تنفيذ Azure Blob لـ `IFileStorage`.

## الأداء (SLOs)
- ✅ Response Compression (Brotli) · Lazy/Projection · منع N+1.
- ✅ **Load test تحت تزامن** (50/100): ~900K طلب · 0 أخطاء · p95 مُركّب ~10–20ms (هامش 20× عن SLO 400ms) — LocalDB/جهاز تطوير. التفاصيل: `brain/11`.
- ✅ حدود معدّل قابلة للضبط (`RateLimit:*`).
- ✅ **Caching على مستوى التطبيق** (شجرة الوحدات + كتالوج الصلاحيات) مع **invalidation عند الكتابة** + عدّادات OTel (hits/misses في `/metrics`). آمن (يبقى التصريح فعّالًا).
- ⬜ إعادة قياس الأداء على Azure SQL إنتاجي · توسيع caching حسب الحاجة (مع keying للبيانات المُجزّأة).

## الواجهة (Frontend)
- ✅ React + TS strict · TanStack Query · Zustand · RHF + Zod · Router + حارس مصادقة.
- ✅ Primitives مُستهلَكة: DataTable · Drawer · FormBuilder (RHF+Zod) · async export.
- ✅ Loading/Empty/Error states · إخفاء الإجراءات حسب الصلاحية · i18n + RTL.
- ✅ **سمات (فاتح/داكن)** عبر `data-theme` + tokens CSS · تفضيلات (نمط النماذج drawer/modal) · صفحة إعدادات قابلة للتوسعة.
- ✅ **Tailwind v4 + shadcn-style primitives** (Button/Input/Badge/Card بـ cva) + **Lucide icons** — مدمجة مع نظام السمة (tokens تشير لمتغيّرات `data-theme`).
- ✅ **Command Palette (⌘K)** (cmdk) · ✅ **Virtualization** (TanStack Virtual) · ✅ **DataGrid: تخصيص الأعمدة + عرض جدول/بطاقات + حفظ التفضيل** · ✅ **سايدبار قابل للطي + قوائم فرعية (submenu)**.

## الجودة والتسليم
- ✅ 35 اختبارًا أخضر · CI (GitHub Actions) · Docker multi-stage · docker-compose.
- ✅ توثيق `brain/` (00–14) + `progress/` محدَّث + قالب موديول (`brain/10`).
- 🟡 اختبارات تكامل (Testcontainers) + E2E (Playwright) — مؤجّلة (Docker/متصفّح)، أُثبتت يدويًّا.

## خطوات الإطلاق (Go-Live)
1. ضبط أسرار الإنتاج في **Key Vault** (`Jwt:SigningKey`, connection string).
2. **غيّر كلمة مرور admin الأوّلية** (`admin@ministry.gov`) أو عطّل البذر في الإنتاج.
3. طبّق الهجرات كخطوة نشر مستقلّة (لا migrate-on-startup).
4. عطّل OpenAPI + أمّن لوحة Hangfire (إن فُعّلت).
5. اضبط `Cors:AllowedOrigins` على أصل الإنتاج فقط.
6. استبدل `IFileStorage` بتنفيذ Azure Blob.
7. شغّل load test وأكّد الـ SLOs قبل فتح الحركة.
