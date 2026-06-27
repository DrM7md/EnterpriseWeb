# 14 — استراتيجية الاختبار (Testing Strategy)

## الطبقات
| الطبقة | الأداة | ما يُختبَر | الحالة |
|---|---|---|---|
| Domain/Application | xUnit | `Result<T>` · Pagination · Validators (Users/Roles) | ✅ |
| Infrastructure | xUnit + EF InMemory | PasswordHasher · JwtTokenGenerator · CurrentUser (RLS claims) · ModuleRegistry (core/opt-in/cache) · ReportEngine (بايتات صالحة) | ✅ |
| API (Integration) | WebApplicationFactory + Testcontainers (SQL Server) | المسارات end-to-end ضد DB حقيقي | ⏳ مؤجّل (يحتاج Docker) |
| Frontend logic | Vitest + RTL | hooks/مكوّنات | ⏳ |
| E2E | Playwright | المسارات الحرجة (login → CRUD) | ⏳ مؤجّل (يحتاج متصفّح) |

**الإجمالي الحالي:** 35 اختبارًا أخضر (19 Application + 16 Infrastructure).

## التشغيل
```bash
dotnet test                       # كل اختبارات الـ backend
cd client && npm run build        # type-check + bundle
cd client && npm run lint         # oxlint
```

## التحقّق اليدوي المُوثَّق (e2e عبر HTTP)
أُثبتت المسارات الحرجة بالتشغيل الفعلي على LocalDB (مُسجَّلة في `progress/CHANGELOG.md`):
- Auth: login/refresh/**reuse-detection**/RLS-scope-in-token.
- Users/Roles: CRUD كامل + عزل RLS + soft-delete + audit صحيح + 400/401/403/409.
- Module gate: toggle → 200↔403 · تعطيل core → 409.
- Reports: تصدير متزامن (xlsx/pdf صالح، أكّده `file`) + **غير متزامن** (enqueue→Completed→download).
- Hardening: 429+Retry-After · `Content-Encoding: br` · رؤوس أمان.

## بوّابة الجودة (CI)
`TreatWarningsAsErrors=true` + فشل البناء عند فشل أي اختبار. أضِف عتبة تغطية عند نضج suite التكامل.

## الفجوات (بصدق)
- اختبارات التكامل (Testcontainers) و E2E (Playwright) **مؤجّلة** لعدم توفّر Docker/متصفّح في بيئة التطوير الحالية — أُثبتت يدويًّا بدلًا منها.
- لا load test بعد (راجِع `brain/11`).
