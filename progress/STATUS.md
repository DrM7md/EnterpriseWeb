# 📍 STATUS — الحالة الحالية

- **المرحلة الحالية:** Vertical Slice الأول (Users) ✅ **مكتمل end-to-end** — يثبت المعمارية بكود حقيقي.
- **آخر تحديث:** 2026-06-27
- **التغطية:** Phase 0 ✅ · Phase 1 ✅ · Phase 2 (primitives) جزئيًّا via-slice · Phase 3 (الـ slice الأول) ✅

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

## ⏭️ التالي
**تقسيمان مقترحان (يتطلّبان قرارك):**
1. **Phase 4 — استخراج Template + Module Registry:** تعميم نمط Users (Backend + Frontend) + Feature Flags لكل قسم.
2. **تصليب الـ Primitives (Phase 2 كامل):** shadcn/ui + Tailwind tokens · DataGrid (TanStack virtualization) · Command Palette · ReportEngine (QuestPDF) · i18n (AR/EN + RTL switching).

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
