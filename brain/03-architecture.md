# 03 — المعمارية

## Backend — Clean Architecture (4 طبقات + Shared)
```
src/
├── Domain/         # Entities, Value Objects, Domain Events, Enums — لا تبعيات خارجية
├── Application/    # Use Cases (Services/CQRS), DTOs, Validators, Interfaces, Mappings
├── Infrastructure/ # EF Core, Dapper, Repositories, Auth, Storage, Jobs
├── API/            # Endpoints, Middleware, Filters, composition root (DI)
└── Shared/         # Result<T>, Error, Constants, Extensions, Guards
```

### قاعدة التبعية
الاتجاه دائمًا **نحو الداخل**:
- `Domain` لا يعرف أحدًا (يعتمد فقط على `Shared`).
- `Application` يعرف `Domain` + `Shared`، ويُعرّف **واجهات** لما تحتاجه من الخارج.
- `Infrastructure` يُنفّذ واجهات `Application` (عكس الاعتماد — Dependency Inversion).
- `API` يُركّب الكل (composition root) ولا يحوي منطق أعمال.

### تركيب DI (composition root)
كل طبقة تملك امتداد DI خاصًّا:
```csharp
builder.Services.AddApplication();     // Application/DependencyInjection.cs
builder.Services.AddInfrastructure();  // Infrastructure/DependencyInjection.cs
```

### معالجة الأخطاء
لا استثناءات للتحكّم بالتدفّق. كل عملية تُرجع `Result` / `Result<T>` (في `Shared`)،
وتُحوَّل لاستجابة HTTP عبر `API/Common/ResultExtensions.cs` (خريطة `ErrorType → HTTP status`).

### CQRS — عند الحاجة فقط
الموديول البسيط = Service مباشر يُحقن. الموديول المعقّد = MediatR (Phase 1+). لا CQRS كقاعدة عامة.

## تدفّق الطلب end-to-end (Phase 0)
```
React (useSystemInfo) → axios (apiClient) → GET /api/v1/system/info
  → SystemEndpoints → ISystemInfoService (Application interface)
  → SystemInfoService (Infrastructure) → Result<SystemInfo>
  → ResultExtensions.ToHttpResult() → 200 OK JSON → TanStack Query cache → UI
```

## Frontend — Feature-First
```
client/src/
├── app/         # Providers (Query/Router/Theme/i18n)
├── lib/         # singletons مُهيّأة (apiClient, queryClient)
├── modules/     # موديولات المجال — كل واحد يملك (types/service/hooks/components)
├── components/  # UI مشترك (shadcn-based) — Phase 2
├── store/       # Zustand (UI/client state فقط)
└── ...
```
**فصل صارم:** server-state في TanStack Query، client/UI-state في Zustand. لا خلط.

## Versioning
كل المسارات تحت `/api/v1` من اليوم الأول. كسر العقد ⇒ `/api/v2`، لا تعديل `v1`.
