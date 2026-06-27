# 06 — سجل الموديولات (Module Registry)

> كل موديول يُفعَّل/يُطفأ ويُضبَط **لكل قسم** عبر config في قاعدة البيانات (Phase 4). الحقول الخاصة بقسم → JSON column محكوم بـ schema validation (لا كل شيء ديناميكي).

| Module | الوصف | الحالة | أعلام التفعيل |
|---|---|---|---|
| system | معلومات النظام (slice إثبات Phase 0) | ✅ مُنفّذ | — (دائم) |
| auth | JWT + Refresh + RBAC | ✅ مُنفّذ (Phase 1) | core |
| org-units | الوحدات التنظيمية + RLS | ✅ أساس مُنفّذ (Phase 1) — CRUD في Phase 3+ | core |
| audit | سجل التدقيق (كتابة تلقائية) | ✅ مُنفّذ (Phase 1) — واجهة عرض لاحقًا | core |
| primitives | DataTable/Drawer/Form (نواة) | 🟡 جزئي — بُنيت أثناء slice الـ Users | — |
| **users** | إدارة المستخدمين (الـ slice الأول، المرجع/Template) | ✅ مُنفّذ end-to-end | per-department |

## قواعد التسجيل
- موديولات **core** لا تُطفأ (أساس النظام).
- موديولات الأعمال **opt-in لكل قسم**.
- عند إضافة موديول: سجّله هنا (الوصف/الحالة/الأعلام) + حدّث `progress/STATUS.md`.
