# 11 — الأداء والتصليب (Performance & Hardening)

## التصليب المُطبَّق (Phase 6 — جزئي)
| البند | التطبيق | التحقّق |
|---|---|---|
| **Rate Limiting** | حدّ عام 200/دقيقة لكل IP + سياسة `auth` صارمة 10/دقيقة على login/refresh (منع تخمين) | flood 14 → 10×200 ثم 4×429 + `Retry-After: 60` ✅ |
| **Response Compression** | Brotli (أولًا) + Gzip لـ JSON والـ MIME الافتراضية | `Accept-Encoding: br` → `Content-Encoding: br` + `Vary` ✅ |
| **Security Headers** | nosniff · X-Frame-Options DENY · Referrer-Policy no-referrer · Cross-Domain none | حاضرة على كل استجابة ✅ |
| **Module Gate Caching** | `IMemoryCache` لـ `IsEnabled` (TTL 60s) + إبطال فوري عند التبديل | اختبار وحدة للإبطال ✅ |

### ترتيب الـ pipeline (مهم)
`ResponseCompression → ExceptionHandler → SerilogRequestLogging → CorrelationId → SecurityHeaders → HttpsRedirect → CORS → RateLimiter → AuthN → AuthZ → Endpoints`

## قياس latency (سلامة SLO — لا حِمل حقيقي بعد)
بيئة: build Production، LocalDB، عميل واحد، 40 طلبًا، دافئ.
| الفئة | المقيس (p95) | SLO | الحالة |
|---|---|---|---|
| Read بسيط (`system/info`) | ~3ms | < 200ms | ✅ |
| Read مُركّب (`users` RLS+join+projection) | ~7ms | < 400ms | ✅ |
| Read مُركّب (`roles`) | ~6ms | < 400ms | ✅ |

> **صدق:** هذه أرقام حِمل خفيف على عميل واحد و LocalDB — تُثبت أن النمط (AsNoTracking + DTO projection + RLS) لا يحمل تكلفة باهظة، لكنها **ليست load test**. إثبات الـ SLOs تحت تزامن حقيقي (k6/NBomber + SQL Server إنتاجي) يبقى ضمن Phase 6 المتبقّي.

## المتبقّي في Phase 6
- **Hangfire** — نقل توليد التقارير الثقيلة إلى background job (الآن متزامن للصغيرة) + إشعار عند الجاهزية + تخزين الملف عبر `IFileStorage`.
- **Output/Response Caching** مع invalidation للقراءات القابلة للتخزين.
- **Load test** فعلي لإثبات الـ SLOs تحت حِمل + لوحات OpenTelemetry.
- **Idempotency-Keys** على الكتابات الحرجة.
- توزيع caching للبوابة عبر عدّة نسخ (Redis) إن لزم التوسّع الأفقي.
