# 📝 CHANGELOG

## 2026-06-27 — Phase 0: التأسيس
**ماذا:** بناء هيكل النظام الكامل end-to-end.
**لماذا:** إثبات المعمارية بكود حقيقي قبل أي توسعة (Vertical Slice أولًا).

- إنشاء مستودع Git مستقلّ + `.gitignore` + `Directory.Build.props` (nullable/strict/warnings-as-errors).
- Clean Architecture: `Domain` · `Application` · `Infrastructure` · `API` · `Shared` + مشروع اختبارات.
- `Shared`: `Result<T>` + `Error` + `ErrorType`.
- `Application`: `ISystemInfoService` + `SystemInfo` DTO + امتداد DI.
- `Infrastructure`: `SystemInfoService` + امتداد DI.
- `API`: composition root + `/api/v1/system/info` + health checks + OpenAPI + CORS + `ResultExtensions`.
- Frontend (Vite + React + TS strict): `apiClient` · `queryClient` · موديول `system` (types/service/hook) + شاشة بحالات Loading/Error.
- اختبارات: 3 وحدات لـ `Result` (خضراء).
- Docker multi-stage (API + client + nginx) + `docker-compose` (مع SQL Server) + GitHub Actions CI.
- توثيق: `brain/00–09` + `progress/*`.

**التحقّق:** `dotnet build` (0 تحذير) · `dotnet test` (3/3) · `npm run build` (نجاح).
