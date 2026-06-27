# ⚡ DECISIONS-LOG — قرارات سريعة أثناء التنفيذ

> ملخّصات سريعة. القرارات المعمارية الكبرى تُوثَّق كـ ADR في `brain/01-decisions/`.

## 2026-06-27 (Phase 0)
- **`.slnx` بدل `.sln`:** صيغة الحل الجديدة الافتراضية في .NET 10. مقبولة.
- **net10.0 كهدف:** أحدث LTS متوفّر على البيئة (SDK 10.0.301). يطابق "آخر .NET LTS".
- **`TreatWarningsAsErrors=true` من اليوم الأول:** يمنع تراكم الدَّيْن. (ADR-0001).
- **خدمة slice = System Info:** أبسط مسار يثبت end-to-end بلا حاجة لقاعدة بيانات في Phase 0.
- **TanStack Query + axios في Phase 0:** تأسيس طبقة بيانات الواجهة مبكرًا (boring/مُجرّب) بدل fetch يدوي.
- **مستودع Git مستقلّ داخل `c:/laragon/www`:** جذر الـ www كان repo عامًّا غير مناسب؛ أنشأنا `.git` خاصًّا بالمشروع.

## 2026-06-27 (Phase 1)
- **نطاق العزل في الـ JWT:** تجنّبًا لإعادة الدخول داخل Global Query Filter (ADR-0003).
- **FrameworkReference بدل حزم AspNetCore منفصلة:** Infrastructure يستخدم `Microsoft.AspNetCore.App` المشترك (PasswordHasher, IHttpContextAccessor) — حزمة `Microsoft.AspNetCore.Identity 2.x` كانت خاطئة لـ net10.
- **PBKDF2 (PasswordHasher من Identity) لكلمات المرور + SHA-256 لرموز التحديث:** الرموز عشوائية بطول كافٍ فلا تحتاج salt، ونحتاج تجزئة قابلة للبحث.
- **`MapInboundClaims=false` + مسح `DefaultInboundClaimTypeMap`:** قراءة أسماء claims الخام (`sub`, `permission`, `unit_scope`) بثبات بلا تحويل تلقائي.
- **سياسات تصريح ديناميكية `perm:{code}`:** عبر `IAuthorizationPolicyProvider` — بلا تسجيل سياسة لكل صلاحية.
- **معرّفات Identity (لا explicit ids في البذر):** تجنّب خطأ `IDENTITY_INSERT` 544.
- **LocalDB (`MSSQLLocalDB`) للتطوير:** متوفّر في البيئة؛ الإنتاج عبر docker-compose/Azure.
