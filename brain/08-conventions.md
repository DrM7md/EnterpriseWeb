# 08 — أعراف الكود (Conventions)

> Phase 0: الأساس. تُستخلَص قواعد إضافية من **كود حقيقي** في Phase 4.

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
