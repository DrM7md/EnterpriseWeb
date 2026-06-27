# 🗺️ ROADMAP

| Phase | العنوان | الحالة | المخرج |
|---|---|---|---|
| 0 | التأسيس والقرارات | ✅ مكتملة | repo يبني ويعمل end-to-end + `brain/` مُهيّأ |
| 1 | العمود الفقري (Cross-Cutting) | ✅ مكتملة | Auth · RBAC · Org Units + RLS · Audit · Soft Delete · Serilog · Health |
| 2 | الـ Primitives | 🟡 جزئيًّا | بُنيت النواة (DataTable · Drawer · Form) أثناء السلايس · الباقي: DataGrid/CommandPalette/ReportEngine/i18n/shadcn |
| 3 | Vertical Slice الأولى ⭐ | ✅ مكتملة | موديول Users كامل end-to-end (backend + frontend) يثبت المعمارية |
| 4 | استخراج Template + Module Registry | ✅ مكتملة | Module Registry + Feature Flags لكل قسم (حيّ) + قالب موديول موثّق (`brain/10`) |
| 5 | توسعة الموديولات | 🟡 جارية | موديول Roles مُنجَز بالقالب (بلا migration/infra — أثبت «نصف الوقت») · المزيد عند الحاجة |
| 6 | التصليب للإنتاج (Hardening) | ⬜ | benchmarks · caching · rate limiting · security review · load test · Hangfire |
| 7 | التوثيق النهائي والتسليم | ⬜ | `brain/` كامل + Production Checklist |

## القاعدة
نفّذ مرحلةً مرحلة. **بعد كل مرحلة: حدّث `progress/` و`brain/` وقِف للاعتماد البشري قبل التالية.** لا قفز للأمام.

## القرارات المعلّقة المؤثّرة على المسار
- **الموديول الأول للـ slice (Phase 3):** يُحدَّد قبل Phase 3 (سُجِّل في `BLOCKERS.md`).
