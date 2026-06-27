# 🗺️ ROADMAP

| Phase | العنوان | الحالة | المخرج |
|---|---|---|---|
| 0 | التأسيس والقرارات | ✅ مكتملة | repo يبني ويعمل end-to-end + `brain/` مُهيّأ |
| 1 | العمود الفقري (Cross-Cutting) | ✅ مكتملة | Auth · RBAC · Org Units + RLS · Audit · Soft Delete · Serilog · Health |
| 2 | الـ Primitives | 🟡 جزئيًّا | DataTable · Drawer · Form · **ReportEngine** · **i18n (AR/EN + RTL)** ✅ · الباقي: DataGrid virtualization/CommandPalette/shadcn |
| 3 | Vertical Slice الأولى ⭐ | ✅ مكتملة | موديول Users كامل end-to-end (backend + frontend) يثبت المعمارية |
| 4 | استخراج Template + Module Registry | ✅ مكتملة | Module Registry + Feature Flags لكل قسم (حيّ) + قالب موديول موثّق (`brain/10`) |
| 5 | توسعة الموديولات | 🟡 جارية | موديول Roles مُنجَز بالقالب (بلا migration/infra — أثبت «نصف الوقت») · المزيد عند الحاجة |
| 6 | التصليب للإنتاج (Hardening) | 🟡 شبه مكتملة | ✅ rate limiting · compression · security headers · gate caching · **Hangfire async reports + IFileStorage** · latency sanity · المتبقّي: output caching · load test · OpenTelemetry · Idempotency |
| 7 | التوثيق النهائي والتسليم | ✅ مكتملة | `brain/` كامل (00–14) + ERD + Deployment + Testing Strategy + **Production Checklist** |

## القاعدة
نفّذ مرحلةً مرحلة. **بعد كل مرحلة: حدّث `progress/` و`brain/` وقِف للاعتماد البشري قبل التالية.** لا قفز للأمام.

## القرارات المعلّقة المؤثّرة على المسار
- **الموديول الأول للـ slice (Phase 3):** يُحدَّد قبل Phase 3 (سُجِّل في `BLOCKERS.md`).
