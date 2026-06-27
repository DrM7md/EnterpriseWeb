# 📍 STATUS — الحالة الحالية

- **المرحلة الحالية:** توسعة + primitives — موديولان (Users/Roles) + **محرّك تقارير** (Excel/PDF).
- **آخر تحديث:** 2026-06-27
- **التغطية:** Phase 0 ✅ · 1 ✅ · 2 (primitives) 🟡 (DataTable/Drawer/Form + **ReportEngine**) · 3 (Users) ✅ · 4 (Module Registry) ✅ · 5 🟡 (Roles)

## i18n (AR/EN + RTL) — مُنجَز
- react-i18next + موارد ar/en (78 مفتاحًا متطابقًا) + تبديل لغة/اتجاه فوري + حفظ التفضيل.
- **ترجمة أخطاء الخادم عبر رمزها** (الخادم يُرجع رمز i18n) — تصميم نظيف end-to-end.
- كل الشاشات مُترجَمة (Login/Users/Roles/التنقّل/الجداول/النماذج).

## محرّك التقارير (ReportEngine) — مُنجَز
- primitive `IReportEngine` (Strategy) بصيغتي **Excel (ClosedXML)** و**PDF (QuestPDF، RTL)**.
- مُستهلَك في **تصدير المستخدمين** (`GET /users/export`) معزولًا حسب النطاق، بصلاحية `users.export`.
- مُتحقَّق بملفات فعلية صالحة (أكّدها `file` = Excel 2007+ · %PDF). التقارير الثقيلة لاحقًا عبر Hangfire.

## Phase 5 — إثبات القالب (Roles)
- موديول **الأدوار والصلاحيات** كامل (backend + frontend) مبنيٌّ بقالب `brain/10`.
- **الدليل على «نصف الوقت»:** بلا migration، بلا تغيير Infrastructure — فقط كود ميزة فوق كيانات Phase 1.
- يشمل: CRUD + ربط صلاحيات (منتقي مجمَّع حسب الموديول) + حماية أدوار النظام + كتالوج الصلاحيات.
- يُكمل دورة RBAC: الآن يمكن تعريف الأدوار وربطها بالصلاحيات عبر الواجهة.

## Phase 4 — ما أُنجِز
- **Module Registry + Feature Flags لكل قسم (حيّ):** `Modules`/`ModuleSettings` + `IModuleRegistry` + `/modules` (effective/toggle) + بوابة `RequireModule` على endpoints.
- **القاعدة:** core دائمًا مُفعّل؛ غير core opt-in لكل قسم. الواجهة تبني التنقّل من المُفعّل فقط.
- **القالب:** `brain/10-module-template.md` (نمط الموديول backend+frontend) + قواعد كود مُستخلَصة في `brain/08`.
- **e2e مُثبَت:** toggle users → 200↔403 · تعطيل core (audit) → 409.

## ما أُنجِز (Slice: إدارة المستخدمين)
### Backend
- `PagedRequest`/`PagedResult<T>` primitive (تطبيع آمن).
- `IUserService`: List (مُرقّم/مُفلتر/مُرتّب، **معزول تلقائيًا بـ RLS**، DTO projection بلا N+1) + Get + Create + Update + Delete (حذف ناعم).
- صلاحيات `users.*` لكل endpoint + FluentValidation + audit صحيح (إصلاح: سجل الإنشاء بعد الحفظ).

### Frontend (يستهلك primitives بُنيت أثناء السلايس)
- مصادقة: Zustand store (مُخزّن) + axios interceptors (إرفاق JWT + Correlation ID + **تدوير تلقائي عند 401**).
- primitives: `DataTable` (table view + ترتيب + حالات) · `Drawer` · نموذج RHF+Zod.
- شاشة المستخدمين: بحث + ترقيم + ترتيب + إنشاء/تعديل/حذف + إخفاء الأزرار حسب الصلاحية.
- Router + حارس مصادقة + AppShell + Login.

## التحقّق
| الطبقة | النتيجة |
|---|---|
| `dotnet build` (Release) | 0 تحذير |
| `dotnet test` | **23/23** خضراء |
| CRUD e2e على LocalDB | list/get/create/update/delete + RLS + soft-delete + audit صحيح + 409/400/401/403 ✅ |
| `npm run build` (tsc strict + vite) | نجاح |
| `npm run lint` | نجاح (تحذير HMR وحيد) |
| CORS للـ SPA (preflight + login) | 204 + 200 مع ACAO ✅ |

## ⏭️ التالي (يتطلّب قرارك)
1. **Phase 5 — توسعة الموديولات:** بناء موديول ثانٍ بالقالب (مثل Roles/Org-Units) لإثبات «نصف الوقت».
2. **تصليب الـ Primitives (Phase 2 كامل):** shadcn/ui + Tailwind tokens · DataGrid (TanStack virtualization) · Command Palette · ReportEngine (QuestPDF) · i18n (AR/EN + RTL).
3. **Phase 6 — التصليب للإنتاج:** caching للبوابة، benchmarks، rate limiting، Hangfire، Testcontainers.

## فجوات معروفة (موثّقة بصدق)
- الواجهة وظيفية لكن **بلا shadcn/Tailwind بعد** (CSS مباشر) — تصليب التصميم في Phase 2 الكامل.
- **E2E بالمتصفّح (Playwright)** و**اختبارات تكامل (Testcontainers)** مؤجّلة حتى توفّر بيئة Docker/متصفّح.
- إدارة أدوار المستخدم في النموذج مبسّطة (RoleIds=[] في التعديل) — تُستكمل مع شاشة الأدوار.

## تشغيل
```bash
# API (نافذة):
ASPNETCORE_URLS=http://localhost:5099 dotnet run --project src/API
# الواجهة (نافذة أخرى):
cd client && cp .env.example .env && npm run dev    # http://localhost:5173
# دخول: admin@ministry.gov / Admin@12345
```
