# 🗺️ ROADMAP

| Phase | العنوان | الحالة | المخرج |
|---|---|---|---|
| 0 | التأسيس والقرارات | ✅ مكتملة | repo يبني ويعمل end-to-end + `brain/` مُهيّأ |
| 1 | العمود الفقري (Cross-Cutting) | ✅ مكتملة | Auth · RBAC · Org Units + RLS · Audit · Soft Delete · Serilog · Health |
| 2 | الـ Primitives | ⏳ التالية | DataGrid · Drawer · Modal · Command Palette · FormBuilder · ReportEngine · i18n |
| 3 | Vertical Slice الأولى ⭐ | ⬜ | موديول كامل end-to-end يثبت المعمارية |
| 4 | استخراج Template + Module Registry | ⬜ | كل موديول جديد بنصف الوقت + Feature Flags لكل قسم |
| 5 | توسعة الموديولات | ⬜ | بقية الأقسام، كل منها DoD مُحقَّق |
| 6 | التصليب للإنتاج (Hardening) | ⬜ | benchmarks · caching · rate limiting · security review · load test · Hangfire |
| 7 | التوثيق النهائي والتسليم | ⬜ | `brain/` كامل + Production Checklist |

## القاعدة
نفّذ مرحلةً مرحلة. **بعد كل مرحلة: حدّث `progress/` و`brain/` وقِف للاعتماد البشري قبل التالية.** لا قفز للأمام.

## القرارات المعلّقة المؤثّرة على المسار
- **الموديول الأول للـ slice (Phase 3):** يُحدَّد قبل Phase 3 (سُجِّل في `BLOCKERS.md`).
