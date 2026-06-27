# 07 — عقود الـ API

## المبادئ
- كل المسارات تحت `/api/v{n}` (يبدأ بـ `v1`). كسر العقد ⇒ `v2`، لا تعديل `v1` القائم.
- استجابات الخطأ بصيغة **Problem Details** (RFC 7807) عبر `ResultExtensions`.
- Pagination دائمًا للقوائم (`page`, `pageSize`, ترتيب وفلاتر كـ query params).
- Idempotency-Key على الكتابات الحرجة (Phase 1+).

## خريطة الأخطاء (ErrorType → HTTP)
| ErrorType | HTTP |
|---|---|
| Validation | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| NotFound | 404 |
| Conflict | 409 |
| Failure | 500 |

## العقود الحالية (Phase 0)

### `GET /api/v1/system/info`
إثبات end-to-end. لا يتطلّب مصادقة (Phase 1 سيؤمّن البقية).

**200 OK**
```json
{
  "name": "Enterprise Web System",
  "version": "0.1.0",
  "environment": "Development",
  "serverTimeUtc": "2026-06-27T10:00:00+00:00",
  "supportedLanguages": ["ar", "en"]
}
```

### `GET /health/live` · `GET /health/ready`
فحوص صحّة (liveness/readiness). Phase 1 يضيف فحص قاعدة البيانات للـ ready.

## مثال خطأ (Problem Details)
```json
{
  "title": "user.not_found",
  "detail": "المستخدم غير موجود",
  "status": 404
}
```

> عند إضافة endpoint: وثّق العقد هنا (المسار/الصلاحية/Request/Response/الأخطاء).
