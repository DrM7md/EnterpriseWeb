# Phase 0 — التأسيس والقرارات · Definition of Done

## الهدف
repo يبني ويعمل (hello-world end-to-end) + `brain/` مُهيّأ + قرارات محسومة موثّقة.

## DoD — مُحقَّق ✅
- [x] هيكل الحل (الطبقات) قائم ويبني بلا تحذيرات (`TreatWarningsAsErrors`).
- [x] Vite + TS strict قائم ويبني.
- [x] تدفّق end-to-end حقيقي: واجهة → API → خدمة → نتيجة.
- [x] Docker (multi-stage) + CI خام (GitHub Actions).
- [x] أعراف Git موثّقة (`brain/08-conventions.md`).
- [x] القرارات المحسومة موثّقة: ADR-0001 (الستاك)، ADR-0002 (العزل).
- [x] `brain/00–09` + `progress/*` مكتوبة.

## المخرجات (Artifacts)
- الكود: `src/` · `client/` · `tests/`.
- التشغيل: `Dockerfile`s · `docker-compose.yml` · `.github/workflows/ci.yml`.
- التوثيق: `brain/` · `progress/`.

## الإثبات (Verification log)
```
dotnet build  → Build succeeded. 0 Warning(s) 0 Error(s)
dotnet test   → Passed! Failed: 0, Passed: 3
npm run build → ✓ built
```

## التالي
Phase 1 (العمود الفقري) — يتطلّب اعتمادًا بشريًا (راجِع `BLOCKERS.md`).
