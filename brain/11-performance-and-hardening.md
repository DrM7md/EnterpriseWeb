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

## Load test (تحت تزامن حقيقي) — ✅ مُجرى
بيئة: build **Release/Production**، LocalDB، جهاز تطوير واحد، driver متزامن (`scratchpad/loadtest.mjs`)، حدّ المعدّل مرفوع للقياس.

### تزامن 50 (12s لكل endpoint)
| الفئة | rps | p50 | p95 | p99 | أخطاء | SLO p95 |
|---|---|---|---|---|---|---|
| Read بسيط (`system/info`) | ~10,200 | 4.5ms | **6.9ms** | 9.0ms | 0 | < 200ms ✅ |
| Read مُركّب (`users` RLS+join+proj) | ~7,100 | 6.6ms | **10.7ms** | 13.0ms | 0 | < 400ms ✅ |
| Read مُركّب (`org-units` شجري) | ~8,000 | 5.8ms | **9.7ms** | 12.0ms | 0 | < 400ms ✅ |
| Read مُركّب (`roles`) | ~7,800 | 6.1ms | **9.9ms** | 12.2ms | 0 | < 400ms ✅ |

### تزامن 100 (10s لكل endpoint)
| الفئة | rps | p95 | p99 | أخطاء |
|---|---|---|---|---|
| `system/info` | ~10,200 | 12.7ms | 16.6ms | 0 |
| `users` | ~6,900 | 20.3ms | 24.3ms | 0 |
| `org-units` | ~7,900 | 17.3ms | 20.4ms | 0 |
| `roles` | ~7,500 | 18.3ms | 21.6ms | 0 |

**النتيجة:** ~900 ألف طلب إجمالًا، **صفر أخطاء**، وكل p95/p99 ضمن الـ SLOs بهامش ضخم (القراءة المُركّبة عند تزامن 100: p95 ~20ms مقابل SLO 400ms = **هامش 20×**). النمط (AsNoTracking + DTO projection + RLS عبر فلتر) لا يحمل تكلفة باهظة تحت الحمل.

> **حدود الصدق:** LocalDB على جهاز تطوير واحد (لا SQL Server إنتاجي ولا شبكة). الأرقام المطلقة ستختلف في الإنتاج، لكن الاتجاه والهامش يثبتان سلامة المعمارية تحت تزامن. للإنتاج: أعد التشغيل مقابل Azure SQL تحت حمل الإنتاج المتوقّع.

## التقارير غير المتزامنة (Hangfire) — ✅ مُنفّذ
- **Hangfire (SqlServer storage)** + `IFileStorage` (محلي للتطوير، Azure Blob للإنتاج لاحقًا).
- تدفّق: `POST /users/export/async` → ينشئ `ReportRequest` (Pending) + **يخزّن نطاق صاحبه** → 202 + id
  → Hangfire job (`ReportJobRunner`) يولّد بالخلفية بنطاق صريح (بلا سياق HTTP) → يخزّن الملف → Completed.
- المتابعة: `GET /reports` (تقاريري) · `GET /reports/{id}` (polling) · `GET /reports/{id}/download` (الملف).
- **معزول حسب النطاق** على كل الخطوات. الفشل يُسجَّل (Status=Failed + Error) ويُعاد المحاولة عبر Hangfire.
- مُتحقَّق e2e: enqueue 202 → poll Processing→Completed(rows=3) → download (Excel صالح، أكّده `file`).
- **إشعار عند الجاهزية:** حاليًا polling؛ إشعار لحظي (SignalR) لاحقًا.

## المراقبة (OpenTelemetry) — ✅ مُنفّذ
- **Traces:** instrumentation لـ AspNetCore (HTTP server spans + route) · HttpClient · SqlClient (DB spans).
- **Metrics:** AspNetCore + HttpClient + Runtime عبر **Prometheus** على `/metrics` (سحب).
- **المُصدِّر:** OTLP إن ضُبط `Otel:OtlpEndpoint` (الإنتاج)، وإلا Console في التطوير.
- المورد `service.name=EnterpriseSystem.Api`؛ والـ **Correlation ID مربوط بالـ TraceId** (نفس `Activity`).
- مُتحقَّق: `/metrics` يُرجع `http_server_request_duration` + `dotnet_*`؛ والـ console يُظهر spans (HTTP + SQL).
- المتبقّي: ربط collector + لوحات/تنبيهات (Grafana/Azure Monitor).

## المتبقّي في Phase 6
- **Output/Response Caching** مع invalidation للقراءات القابلة للتخزين.
- **Load test** فعلي لإثبات الـ SLOs تحت حِمل + لوحات OpenTelemetry.
- **Idempotency-Keys** على الكتابات الحرجة.
- توزيع caching للبوابة عبر عدّة نسخ (Redis) إن لزم التوسّع الأفقي.
