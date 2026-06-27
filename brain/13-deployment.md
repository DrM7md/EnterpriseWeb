# 13 — دليل النشر (Deployment Guide)

## البيئات
فصل صارم عبر `appsettings.{Environment}.json` + متغيّرات بيئة. الأسرار في **Azure Key Vault** للإنتاج (لا في الكود ولا في git).

| البيئة | قاعدة البيانات | الأسرار | OpenAPI |
|---|---|---|---|
| Development | LocalDB | appsettings.Development | مفعّل + بذر admin |
| Staging | SQL Server (container/Azure) | Key Vault | حسب الحاجة |
| Production | Azure SQL | Key Vault | مُعطّل |

## المتغيّرات الإلزامية (Production)
| المفتاح | الوصف |
|---|---|
| `ConnectionStrings__Default` | سلسلة اتصال SQL Server (تُستخدم لـ EF و Hangfire) |
| `Jwt__SigningKey` | مفتاح توقيع ≥ 32 بايت — **من Key Vault** |
| `Jwt__Issuer` / `Jwt__Audience` | مُصدِر/جمهور الرموز |
| `Cors__AllowedOrigins__0` | أصل واجهة الإنتاج |
| `FileStorage__LocalRoot` | (تطوير) مجلد الملفات؛ الإنتاج → Azure Blob |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

## التشغيل عبر Docker
```bash
docker compose up --build       # db + api + client
# api:    http://localhost:7001
# client: http://localhost:5173
```
- `src/API/Dockerfile` — multi-stage (sdk build → aspnet runtime، منفذ 8080).
- `client/Dockerfile` — build ثم nginx ثابت (SPA fallback في `client/nginx.conf`).
- أسرار الإنتاج تُمرَّر كـ env/secret لا في `docker-compose` (الملف للتطوير).

## الهجرات (Migrations)
```bash
# إنشاء:
dotnet ef migrations add <Name> --project src/Infrastructure --startup-project src/API
# تطبيق (يدويًا أو عبر CI/CD قبل بدء الخدمة):
dotnet ef database update --project src/Infrastructure --startup-project src/API
```
- التطوير: `DbSeeder` يطبّق الهجرات ويبذر تلقائيًا عند الإقلاع.
- الإنتاج: طبّق الهجرات كخطوة نشر مستقلّة (لا migrate-on-startup للأمان).

## Hangfire
- يستخدم نفس `ConnectionStrings:Default` (schema `HangFire` يُنشأ تلقائيًا).
- خادم الـ jobs يعمل داخل عملية الـ API. للتوسّع: افصل worker مستقلًّا يقرأ نفس المخزن.
- لوحة Hangfire غير مُفعّلة؛ عند تفعيلها أمّنها بـ authorization filter (Admin فقط).

## CI/CD
`.github/workflows/ci.yml`: بناء + اختبار backend، و lint + build frontend على كل push/PR إلى `main`. أضِف خطوة نشر (Azure Web App / Container) بعد نجاح البوّابة.

## ما قبل الإنتاج
راجِع **`progress/PRODUCTION-CHECKLIST.md`** — كل بند مع حالته.
