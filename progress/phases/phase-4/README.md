# Phase 4 — استخراج Template + Module Registry · Definition of Done

## الهدف
كل موديول جديد بنصف الوقت، وكل قسم يُخصَّص بلا إعادة كتابة.

## DoD — مُحقَّق ✅
- [x] **Module Registry** (`Modules`) + **Feature Flags لكل قسم** (`ModuleSettings`) في قاعدة البيانات.
- [x] `IModuleRegistry`: GetEffective / IsEnabled / SetEnabled (core-always-on، opt-in لغير core، core-locked).
- [x] **بوابة `RequireModule`** endpoint filter مطبّقة على Users (تكمّل صلاحيات RBAC).
- [x] API `/modules` (effective + toggle بصلاحية `modules.manage`).
- [x] الواجهة تبني التنقّل من الموديولات المُفعّلة (`useModules`).
- [x] **قالب الموديول** موثّق (`brain/10-module-template.md`) + قواعد كود مُستخلَصة (`brain/08`).
- [x] اختبارات خضراء (28/28، منها 5 لـ ModuleRegistry).

## الإثبات (Verification log)
```
dotnet build  → 0 Warning(s)
dotnet test   → Passed! 28/28
ef migration  → AddModuleRegistry مُطبَّق
e2e: GET /modules ✓ · users 200 (مُفعّل) → toggle off → 403 module.disabled → on → 200
     تعطيل core (audit) → 409 module.core_locked
```

## فجوات/لاحقًا
- `ConfigJson` لكل قسم: العمود موجود، تفعيل schema-validation عليه لاحقًا.
- **caching** لفحص البوابة (الآن استعلام لكل طلب) — Phase 6.
- وراثة التفعيل عبر الهرم (تفعيل للأب يسري للأبناء) — قرار لاحق.

## التالي
Phase 5 (موديول ثانٍ بالقالب) أو تصليب الـ Primitives — يتطلّب اعتمادًا بشريًا.
