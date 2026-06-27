# ADR-0001 — قفل الستاك التقني

- **الحالة:** مقبول (محسوم — لا يُعاد التفاوض)
- **التاريخ:** Phase 0

## السياق
نبني نظامًا مؤسسيًا يعيش 5+ سنوات بلا إعادة كتابة. نحتاج ستاكًا "مملًّا ومُجرّبًا" لا لامعًا.

## القرار
- **Backend:** ASP.NET Core على .NET 10 (LTS) · Clean Architecture · EF Core (كتابة + 90% قراءات) · Dapper (hot paths/تقارير) · FluentValidation.
- **Frontend:** React + TypeScript (strict) · Vite · TanStack Query/Table/Virtual · RHF + Zod · shadcn/ui + Tailwind.
- **DB:** SQL Server · Code-First Migrations.
- **Auth:** JWT + Refresh Rotation · RBAC + Permission-based.

## البدائل المرفوضة
- **Stored Procedures بدل Dapper** → تُخرج المنطق من version control والاختبار. (تُستخدم فقط إن أثبت profiling حاجة قصوى.)
- **Redux بدل TanStack Query + Zustand** → خلط server/client state، boilerplate أعلى.
- **كتابة virtualization/sorting يدويًا** → إعادة اختراع ما توفّره TanStack.
- **GraphQL** → تعقيد زائد لحالة وزارة واحدة بعقود REST مُصمّمة.

## العواقب
- فريق واحد يتقن الستاك كله. ترقيات LTS مدعومة. type-safety طرفية (Zod ↔ DTOs).
