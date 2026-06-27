# 06 — سجل الموديولات (Module Registry)

> ✅ **مُنفّذ (Phase 4).** كل موديول يُفعَّل/يُطفأ **لكل قسم** عبر `ModuleSettings` في قاعدة البيانات. الحقول الخاصة بقسم → `ConfigJson` (schema validation لاحقًا). الجداول: `Modules` (الكتالوج) + `ModuleSettings` (علم تفعيل لكل وحدة). الخدمة: `IModuleRegistry`. البوابة: `RequireModule` على الـ endpoints. القاعدة: **core دائمًا مُفعّل؛ غير core opt-in لكل قسم**.

| Module | الوصف | الحالة | أعلام التفعيل |
|---|---|---|---|
| system | معلومات النظام (slice إثبات Phase 0) | ✅ مُنفّذ | — (دائم) |
| auth | JWT + Refresh + RBAC | ✅ مُنفّذ (Phase 1) | core |
| org-units | الوحدات التنظيمية + RLS | ✅ أساس مُنفّذ (Phase 1) — CRUD في Phase 3+ | core |
| audit | سجل التدقيق (كتابة تلقائية) | ✅ مُنفّذ (Phase 1) — واجهة عرض لاحقًا | core |
| primitives | DataTable/Drawer/Form (نواة) | 🟡 جزئي — بُنيت أثناء slice الـ Users | — |
| reporting | محرّك التقارير (Excel/PDF، Strategy) + تقارير غير متزامنة (Hangfire + IFileStorage) | ✅ مُنفّذ — تصدير متزامن وغير متزامن للمستخدمين | — |
| **users** | إدارة المستخدمين (الـ slice الأول، المرجع/Template) | ✅ مُنفّذ end-to-end | per-department |
| **roles** | الأدوار والصلاحيات (موديول ثانٍ بالقالب) | ✅ مُنفّذ end-to-end | core |

## قواعد التسجيل
- موديولات **core** لا تُطفأ (أساس النظام).
- موديولات الأعمال **opt-in لكل قسم**.
- عند إضافة موديول: سجّله هنا (الوصف/الحالة/الأعلام) + حدّث `progress/STATUS.md`.
