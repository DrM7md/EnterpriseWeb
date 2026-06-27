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

### عقود المصادقة (Phase 1) — `/api/v1/auth`
| المسار | الوصف | التصريح |
|---|---|---|
| `POST /auth/login` | `{email, password}` → `{accessToken, refreshToken, user{roles,permissions,unitId}}` | عام |
| `POST /auth/refresh` | `{refreshToken}` → رموز جديدة (تدوير) | عام |
| `POST /auth/logout` | `{refreshToken}` → 204 (إبطال) | عام |
| `GET /auth/me` | معلومات المستخدم الحالي من الرمز | مُصادَق |

- **access token** قصير العمر (15د) يحمل: `sub` · `unit_id` · `unit_scope[]` · `permission[]`.
- **refresh token** (7 أيام) يُخزَّن بـ hash؛ التدوير يُبطل القديم؛ إعادة استخدام رمز مُبطَل ⇒ **إبطال السلسلة كلها**.
- التصريح على endpoints الأعمال عبر سياسة `perm:{code}` (مثال: `.RequirePermission(Permissions.Users.Read)`).

### سطح الـ API الكامل (محدَّث) — `/api/v1`
كل مسارات الأعمال: `RequireAuthorization` + `RequirePermission(perm)`؛ بعضها خلف بوابة `RequireModule`.

| المجموعة | المسار | التصريح | بوابة |
|---|---|---|---|
| auth | `POST /auth/login` · `/refresh` · `/logout` | عام (rate-limit صارم 10/د) | — |
| auth | `GET /auth/me` | مُصادَق | — |
| users | `GET /users` · `GET /users/{id}` | `users.read` | `users` |
| users | `POST /users` · `PUT /users/{id}` · `DELETE /users/{id}` | create/update/delete | `users` |
| users | `GET /users/export?format=` (متزامن) · `POST /users/export/async` (202) | `users.export` | `users` |
| roles | `GET /roles` · `GET /roles/{id}` · `GET /roles/permissions` | `roles.read` | `roles` |
| roles | `POST /roles` · `PUT /roles/{id}` · `DELETE /roles/{id}` | create/update/delete | `roles` |
| modules | `GET /modules` (الفعّالة لي) | مُصادَق | — |
| modules | `GET /modules/unit/{id}` · `PUT /modules/{key}` | `modules.read` / `modules.manage` | — |
| reports | `GET /reports` · `GET /reports/{id}` · `GET /reports/{id}/download` | مُصادَق (معزول) | — |
| system | `GET /system/info` | عام | — |

### `GET /health/live` · `GET /health/ready`
فحوص صحّة. `ready` يفحص الاتصال بقاعدة البيانات (`AddDbContextCheck`).

## مثال خطأ (Problem Details)
```json
{
  "title": "user.not_found",
  "detail": "المستخدم غير موجود",
  "status": 404
}
```

> عند إضافة endpoint: وثّق العقد هنا (المسار/الصلاحية/Request/Response/الأخطاء).
