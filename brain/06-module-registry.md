# 06 — سجل الموديولات (Module Registry)

> كل موديول يُفعَّل/يُطفأ ويُضبَط **لكل قسم** عبر config في قاعدة البيانات (Phase 4). الحقول الخاصة بقسم → JSON column محكوم بـ schema validation (لا كل شيء ديناميكي).

| Module | الوصف | الحالة | أعلام التفعيل |
|---|---|---|---|
| system | معلومات النظام (slice إثبات Phase 0) | ✅ مُنفّذ | — (دائم) |
| auth | JWT + Refresh + RBAC | ⏳ Phase 1 | core |
| org-units | الوحدات التنظيمية + RLS | ⏳ Phase 1 | core |
| audit | سجل التدقيق | ⏳ Phase 1 | core |
| primitives | DataGrid/Drawer/Modal/FormBuilder/ReportEngine | ⏳ Phase 2 | — |
| *(الموديول الأول للـ slice)* | يُحدَّد قبل Phase 3 | ⏳ Phase 3 | per-department |

## قواعد التسجيل
- موديولات **core** لا تُطفأ (أساس النظام).
- موديولات الأعمال **opt-in لكل قسم**.
- عند إضافة موديول: سجّله هنا (الوصف/الحالة/الأعلام) + حدّث `progress/STATUS.md`.
