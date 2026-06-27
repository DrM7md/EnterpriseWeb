# 🏛️ Enterprise Web System

نظام ويب مؤسسي Enterprise-Grade (وزارة واحدة، عزل صارم على مستوى الأقسام) — مبني بمنهجية **Vertical Slice** على ستاك مقفول.

| الطبقة | التقنية |
|---|---|
| Backend | ASP.NET Core (.NET 10 LTS) · Clean Architecture · EF Core + Dapper · FluentValidation |
| Frontend | React + TypeScript (strict) · Vite · TanStack Query/Table/Virtual · RHF + Zod · shadcn/ui |
| Database | SQL Server · Code-First Migrations · Soft Delete · Row-Level Security |
| Auth | JWT + Refresh Rotation · RBAC + Permission-based |
| Ops | Docker (multi-stage) · GitHub Actions CI · Serilog + OpenTelemetry |

## البنية

```
Enterprise-Web-System/
├── src/
│   ├── Domain/          # الكيانات وقواعد المجال — لا تبعيات خارجية
│   ├── Application/     # Use Cases · DTOs · Interfaces · Validators
│   ├── Infrastructure/  # EF Core · Dapper · Auth · Storage · Jobs
│   ├── API/             # Controllers/Endpoints · Middleware · composition root
│   └── Shared/          # Result<T> · Errors · Constants · Extensions
├── tests/               # Unit + Integration
├── client/              # تطبيق React (Vite)
├── brain/               # 🧠 المعرفة الثابتة (لماذا/كيف) — يُقرأ أولًا
└── progress/            # 📍 الحالة الحيّة (أين نحن الآن)
```

## التشغيل محليًا

### المتطلبات
- .NET SDK 10
- Node.js 22+

### Backend
```bash
dotnet run --project src/API
# Swagger/OpenAPI: https://localhost:7001/openapi/v1.json
# Health: /health/live · /health/ready
# Slice: GET /api/v1/system/info
```

### Frontend
```bash
cd client
cp .env.example .env        # اضبط VITE_API_BASE_URL إن لزم
npm install
npm run dev                 # http://localhost:5173
```

### عبر Docker
```bash
docker compose up --build
```

## الاختبارات
```bash
dotnet test          # backend
cd client && npm run build
```

## للمُوجِّهين / الوكلاء الجدد
ابدأ دائمًا بقراءة **`progress/STATUS.md`** ثم **`brain/09-agent-onboarding.md`**. ما لا يُوثَّق = غير موجود.

> الحالة الحالية: **Phase 0 (التأسيس) مكتملة** — هيكل يبني ويعمل end-to-end. التالي: Phase 1 (العمود الفقري).
