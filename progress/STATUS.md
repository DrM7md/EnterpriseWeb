# 📍 STATUS — الحالة الحالية

- **المرحلة الحالية:** Phase 1 — العمود الفقري ✅ **مكتملة**
- **آخر تحديث:** 2026-06-27
- **نسبة الإنجاز الكلية:** Phase 0 + 1 من 7 منجزتان

## ما أُنجِز في Phase 1 (Cross-Cutting)
- ✅ **EF Core + SQL Server** (LocalDB محليًّا) + أول migration (`InitialCreate`) مُطبَّق.
- ✅ **Auth: JWT + Refresh Token Rotation** مع **كشف إعادة الاستخدام** (إبطال السلسلة عند التسريب).
- ✅ **RBAC + Permission-based Authorization** — سياسات ديناميكية `perm:{code}` لكل endpoint.
- ✅ **Org Units + RLS** — Global Query Filter يُصفّي `IOwnedByUnit` حسب نطاق المستخدم (مُضمَّن في الرمز).
- ✅ **Audit + Soft Delete** — interceptor يضبط حقول التدقيق، يحوّل الحذف لناعم، ويكتب `AuditLog`.
- ✅ **Serilog (structured) + Correlation ID** middleware يمرّ عبر كل سجلّ.
- ✅ **معالج استثناءات موحّد** (Problem Details) + **FluentValidation** عبر endpoint filter.
- ✅ **Health `ready`** يفحص قاعدة البيانات فعليًّا.
- ✅ بذر أوّلي: 15 صلاحية + دور SuperAdmin + وحدة جذر + مستخدم admin.
- ✅ اختبارات: 10 خضراء (Result · PasswordHasher · JWT · CurrentUser/RLS-claims).

## التحقّق end-to-end (مُثبَت بالتشغيل على LocalDB)
| السيناريو | النتيجة |
|---|---|
| `POST /auth/login` (admin) | 200 — SuperAdmin · 15 صلاحية · scope في الرمز |
| `GET /auth/me` برمز صالح | 200 — يقرأ الهوية والنطاق |
| `GET /auth/me` بلا رمز | 401 |
| كلمة مرور خاطئة | 401 |
| `POST /auth/refresh` | 200 — تدوير الرموز |
| إعادة استخدام رمز قديم | 401 + إبطال السلسلة |
| `GET /health/ready` (DB) | 200 |

## ⏭️ الخطوة التالية — Phase 2 (الـ Primitives)
**يتطلّب اعتمادًا بشريًا.** DataGrid (TanStack) · Drawer · Modal · Command Palette · Context Menu · FormBuilder (RHF+Zod) · ReportEngine (QuestPDF/ClosedXML/OpenXML) · i18n (AR/EN + RTL).

> blocker مفتوح: تحديد **الموديول الأول للـ Vertical Slice** (Phase 3) — راجِع `BLOCKERS.md`.

## تشغيل سريع
```bash
dotnet ef database update --project src/Infrastructure --startup-project src/API
dotnet run --project src/API            # يبذّر admin@ministry.gov / Admin@12345 (Development)
```
