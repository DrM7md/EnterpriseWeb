# 10 — قالب الموديول (Module Template)

> مُستخلَص من slice **Users** الحقيقي. اتبعه لبناء أي موديول CRUD جديد بنصف الوقت.
> المرجع الحيّ: `src/**/Features/Users/*` و `client/src/modules/users/*`.

## Backend — 6 خطوات

### 1) Domain — الكيان (`src/Domain/Entities/{Name}.cs`)
- يرث `AuditableEntity` (يمنحك audit + soft delete + RowVersion).
- ينفّذ `IOwnedByUnit` إن كان قابلًا للعزل (`OwnerUnitId`) — **افتراضيًا نعم**.

### 2) Application — الميزة (`src/Application/Features/{Name}/`)
- `*Dtos.cs`: `*ListItem` (للجدول) · `*Detail` · `Create*Request` · `Update*Request`.
- `*Errors.cs`: أخطاء المجال كـ `Error` (NotFound/Conflict/Forbidden…).
- `*Validators.cs`: `AbstractValidator<Create*Request>` (FluentValidation).
- `*Service.cs` (`internal sealed`, واجهة عامة `I*Service`):
  - `ListAsync(PagedRequest)` → `db.{Set}.AsNoTracking()` (معزول تلقائيًا) + بحث + `ApplySort` (whitelist) + `Count` + `Skip/Take` + **`.Select(...)` projection مباشرة** (لا N+1).
  - `GetByIdAsync` → projection إلى `*Detail`، NotFound إن null (يغطّي خارج النطاق).
  - `CreateAsync` → فحص النطاق (`currentUser.UnitScope.Contains(unit)`) + تفرّد (`IgnoreQueryFilters`) + إضافة.
  - `UpdateAsync` / `DeleteAsync` → جلب (RLS) ثم تعديل/`Remove` (يتحوّل لحذف ناعم).
- سجّل في `Application/DependencyInjection.cs`: `services.AddScoped<I*Service, *Service>();`

### 3) Infrastructure — التهيئة والترحيل
- `Persistence/Configurations/Configurations.cs`: `IEntityTypeConfiguration<{Name}>` (جدول، أطوال، فهارس، `IsRowVersion`).
- أضِف `DbSet` إلى `IAppDbContext` و `AppDbContext` + فلتر العزل إن `IOwnedByUnit`:
  `modelBuilder.Entity<{Name}>().HasQueryFilter(x => !x.IsDeleted && CurrentUnitScope.Contains(x.OwnerUnitId));`
- `dotnet ef migrations add Add{Name}` ثم `database update`.

### 4) API — المسارات (`src/API/Endpoints/{Name}Endpoints.cs`)
- `MapGroup("/{name}").RequireAuthorization().RequireModule(ModuleKeys.{Name})`.
- كل مسار: `.RequirePermission(Permissions.{Name}.{Action})` + `.WithValidation<T>()` للكتابات.
- ربط query params الاختيارية **صراحةً** (لا `[AsParameters]` — يجعل القيم required).
- سجّل في `Program.cs`: `v1.Map{Name}Endpoints();`

### 5) الصلاحيات والموديول
- أضِف `Permissions.{Name}.*` إلى الكتالوج + `ModuleKeys.{Name}` (core أم opt-in).
- ابذُر في `DbSeeder` (الصلاحيات تُزامَن تلقائيًا).

### 6) الاختبارات
- Validators (Application.UnitTests) + منطق حرج عبر InMemory (Infrastructure.UnitTests).

## Frontend — 5 خطوات (`client/src/modules/{name}/`)
1. `{name}.types.ts` — يطابق DTOs الخادم.
2. `{name}.schema.ts` — Zod (مصدر الحقيقة، يولّد types ويغذّي RHF، يطابق FluentValidation).
3. `{name}.service.ts` — يستهلك `apiClient` (per-resource).
4. `{name}.hooks.ts` — `useQuery`/`useMutation` (+ `invalidateQueries`).
5. الشاشة — `<DataTable>` + `<Drawer>` + نموذج RHF، وأخفِ الإجراءات بـ `hasPermission`.
6. أضِف عنصر التنقّل في `AppShell` (يُعرَض فقط إن كان الموديول مُفعّلًا — `useModules`).

## قواعد ذهبية (من الكود الحقيقي)
- **لا سجل بلا scope** — العزل تلقائي على الخادم، لا تعتمد الواجهة.
- **DTO projection مباشرة** — لا تحميل كيان كامل ثم mapping؛ لا N+1.
- **Result بدل الاستثناءات** — كل خدمة تُرجع `Result`/`Result<T>`.
- **تحقّق على الطرفين** — Zod (واجهة) + FluentValidation (خادم) من نفس القواعد.
- **الصلاحية + البوابة** — `RequirePermission` (ماذا تستطيع) و `RequireModule` (هل الموديول مُتاح لقسمك).
