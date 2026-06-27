# 08 — أعراف الكود (Conventions)

> مُستخلَصة من كود حقيقي (Phase 4). للنمط الكامل خطوةً بخطوة: `brain/10-module-template.md`.

## أنماط مُثبَتة (من slice Users)
- **بنية الميزة:** `Features/{Name}/` يجمع DTOs + Errors + Validators + Service في مجلد واحد.
- **الخدمة:** واجهة عامة `I{Name}Service` + تنفيذ `internal sealed` يُحقَن عبر امتداد DI للطبقة.
- **الأخطاء:** ثابتة كـ `static readonly Error` (أو دوال) في `{Name}Errors` — رموز قابلة للترجمة `{module}.{reason}`.
- **القراءة:** `AsNoTracking()` + `.Select(...)` projection مباشرة (لا N+1). الترتيب عبر whitelist لا سلسلة خام.
- **الكتابة:** فحص النطاق صراحةً قبل الإضافة؛ التفرّد عبر `IgnoreQueryFilters` (عالمي)؛ الحذف عبر `Remove` (يتحوّل ناعمًا).
- **endpoints:** minimal APIs مُجمَّعة في امتداد، query params اختيارية صريحة (لا `[AsParameters]`)، `RequirePermission` + `RequireModule` + `WithValidation`.
- **العزل:** فلتر EF عام لكل `IOwnedByUnit`؛ النطاق من الـ JWT (لا استعلام داخل الفلتر — ADR-0003).
- **التدقيق:** interceptor على مرحلتين (سجل الإنشاء بعد الحفظ ليُلتقَط المفتاح المُولَّد).


## C# / .NET
- `Nullable` + `ImplicitUsings` مفعّلان · `TreatWarningsAsErrors=true` (في `Directory.Build.props`).
- لا استثناءات للتحكّم بالتدفّق → `Result`/`Result<T>`.
- القراءات: `AsNoTracking` + **DTO Projection مباشرة** (لا تحميل كيان كامل ثم mapping).
- منع N+1 صراحةً (لا lazy loading أعمى — تحقّق + logging).
- خدمات Infrastructure داخلية (`internal sealed`) تُسجَّل عبر امتداد DI للطبقة.
- التسمية: `PascalCase` للأنواع/الأعضاء العامة، `camelCase` للمحلّيات، `_camelCase` للحقول الخاصة.
- ملف واحد لكل نوع عام. مجلدات حسب الميزة لا حسب النوع التقني.

## TypeScript / React
- `strict` مفعّل. لا `any` بلا مبرّر موثّق.
- server-state → TanStack Query فقط. client/UI-state → Zustand فقط. لا خلط.
- مصدر حقيقة واحد للـ schema: Zod (يولّد TS types ويغذّي RHF).
- الموديول يملك (`*.types.ts` / `*.service.ts` / `use*.ts` / components). ما يُشارَك يصعد لـ `components/` أو `lib/`.
- خدمة مُكتَّبة لكل مورد تستهلك `apiClient` المشترك.

## Git
- صيغة الـ commit: `type(scope): subject`
  - الأنواع: `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `perf` · `build` · `ci`.
  - مثال: `feat(auth): add refresh token rotation`.
- الفروع: `main` (مستقر دائمًا) · `feat/*` · `fix/*`.
- لا commit يكسر البناء أو الاختبارات (بوابة CI تفرض ذلك).
- بعد كل مرحلة: تحديث `progress/` + `brain/` ضمن نفس الـ PR.

## التوثيق
- ما لا يُوثَّق = غير موجود. أي قرار معماري → ADR في `brain/01-decisions/`.
- علّق بالعربية أو الإنجليزية بثبات داخل الملف، اشرح **لماذا** لا **ماذا**.
