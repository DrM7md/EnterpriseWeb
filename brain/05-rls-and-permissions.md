# 05 — العزل والصلاحيات (Row-Level Security + RBAC)

> **أهم قرار في الـ schema. لا سجل بلا scope.** هذا الملف عقد ملزم لكل موديول.

## نموذج العزل — Department-Scoped RLS
- **وزارة واحدة**، لا multi-tenancy.
- جدول **Org Units** (تسلسل هرمي: وزارة → قطاع → إدارة → قسم).
- كل سجل قابل للعزل يحمل **`OwnerUnitId`** (FK إلى Org Unit) — **إلزامي، لا nullable**.
- المستخدم مربوط بوحدة تنظيمية (وربما نطاق فرعي).
- **EF Global Query Filter** يُصفّي تلقائيًا كل استعلام حسب نطاق المستخدم الحالي.
- **التحقّق على الخادم لا الواجهة.** الواجهة لا تُعتمَد أبدًا لقرار عزل.

### كيف يُطبَّق (Phase 1)
1. `ICurrentUser` (في Application) يكشف `UserId` + `UnitScope` (قائمة الوحدات المسموح بها).
2. `AppDbContext` يطبّق `HasQueryFilter` على كل كيان يرث `IOwnedByUnit`.
3. عند الكتابة: `OwnerUnitId` يُضبَط من سياق المستخدم تلقائيًا (لا من المُدخَل).
4. الوصول عبر الهرم: مدير الإدارة يرى أقسامه (تصفية بـ subtree من Org Units).

## RBAC — الصلاحية هي الوحدة الذرّية
- **Permission** = إذن ذرّي (مثل `users.create`, `reports.export`).
- **Role** = مجرد حزمة Permissions (لا منطق في الـ Role نفسه).
- **Policy-based Authorization** على مستوى كل endpoint (`[Authorize(Permissions.UsersCreate)]`).
- صلاحية مستقلّة عن العزل: الصلاحية تقول "ماذا يمكنك أن تفعل"، العزل يقول "على أي بيانات".

### تنسيق مفاتيح الصلاحيات
`{module}.{action}` — أمثلة: `users.read` · `users.create` · `users.update` · `users.delete` · `users.export`.

## مصفوفة الصلاحيات الأولية (تُستكمل في Phase 1)
| Module | read | create | update | delete | export |
|---|---|---|---|---|---|
| users | ✅ | ✅ | ✅ | ✅ | ✅ |
| roles | ✅ | ✅ | ✅ | ✅ | — |
| org-units | ✅ | ✅ | ✅ | ✅ | — |
| audit | ✅ | — | — | — | ✅ |

## قواعد ملزمة
- [ ] كل كيان قابل للعزل يرث `IOwnedByUnit` (`OwnerUnitId`).
- [ ] لا استعلام يتجاوز Global Query Filter إلا عبر مسار صريح مُصرّح (`IgnoreQueryFilters`) ومُبرَّر ومُدقَّق.
- [ ] كل endpoint مكتوب يحمل Permission محدّدًا.
- [ ] لا قرار عزل/صلاحية في الواجهة — الواجهة تُخفي UI فقط، الخادم يفرض.
