# 09 — دليل الوكيل (Agent Onboarding)

> **أول ملف يقرأه أي وكيل/مُوجِّه جديد.** كيف تعمل مع هذا المشروع دون أن تسأل أحدًا.

## 1. اقرأ بهذا الترتيب
1. `progress/STATUS.md` — أين نحن الآن والخطوة التالية مباشرة.
2. `brain/00-overview.md` — ما النظام ولمن.
3. `brain/03-architecture.md` — الطبقات وتدفّق الطلب.
4. `brain/05-rls-and-permissions.md` — نموذج العزل (أهم قرار في الـ schema).
5. `progress/ROADMAP.md` — المراحل وحالتها.

### فهرس `brain/` الكامل
`00`overview · `01`decisions(ADRs) · `02`glossary · `03`architecture · `04`data-model · `05`rls-and-permissions · `06`module-registry · `07`api-contracts · `08`conventions · `09`onboarding · `10`module-template · `11`performance-and-hardening · `12`erd · `13`deployment · `14`testing-strategy.
وللتسليم: `progress/PRODUCTION-CHECKLIST.md`.

## 2. المبادئ التي تتغلّب على أي طلب لاحق
- لا over-engineering: ميزة لا تُستخدم في 3 شاشات → opt-in لا default.
- لا تكتب ما توفّره مكتبة مُجرّبة (TanStack, QuestPDF, MediatR).
- الـ slice المُثبَت > المخطّط النظري.
- كل قرار أداء يُثبَت برقم.
- **لا سجل بلا scope** — كل بيان مربوط بوحدة تنظيمية، والعزل على الخادم.
- **ما لا يُوثَّق = غير موجود.**

## 3. عقد التسليم (إلزامي بعد كل مرحلة)
قبل الانتقال لأي مرحلة جديدة، حدّث:
- `progress/STATUS.md` · `progress/ROADMAP.md` · `progress/CHANGELOG.md`
- انقل مخرجات المرحلة إلى `progress/phases/phase-N/`
- أنشئ ADR في `brain/01-decisions/` لأي قرار معماري
- سجّل أي حاجة لقرار بشري في `progress/BLOCKERS.md` **وتوقّف**

## 4. كيف تبني موديولًا جديدًا (بعد Phase 4 — Template)
1. Migration + Index + Audit + Soft Delete + `OwnerUnitId`.
2. Domain entity → Application (service/CQRS حسب التعقيد) + DTO Projection + Validator.
3. Endpoint مُصرّح عليه بـ Permission محدّد.
4. UI: استهلك `<DataGrid />` + `<Drawer />` + `<FormBuilder />` — لا تعيد كتابتها.
5. تقرير عبر `IReportGenerator` + Hangfire job إن كان ثقيلًا.
6. اختبارات Unit + Integration خضراء. راجِع `brain/13`/DoD.

## 5. أوامر سريعة
```bash
dotnet build                    # بناء الحل
dotnet test                     # الاختبارات
dotnet run --project src/API    # تشغيل الـ API
cd client && npm run dev        # تشغيل الواجهة
```

## 6. أعراف Git
`type(scope): subject` — أمثلة: `feat(auth): add refresh rotation` · `chore(phase-0): scaffold`.
الفروع: `main` (مستقر) · `feat/*` · `fix/*`. راجِع `brain/08-conventions.md`.
