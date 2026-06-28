import { Building2, Compass, FolderTree, School, Settings, ShieldCheck, UsersRound, Users, type LucideIcon } from 'lucide-react';

/**
 * شجرة التنقّل — تدعم عناصر مفردة ومجموعات بقوائم فرعية (submenu) لأي عنصر.
 * - leaf: له `to` (مسار).
 * - group: له `children` (يتوسّع/ينطوي).
 * - `moduleKey`: يظهر العنصر فقط إن كان الموديول مُفعّلًا (للموديولات الحقيقية).
 * الإخفاء الإداري عبر [[navVisibilityStore]] يعمل على `key`.
 */
export interface NavNode {
  key: string;
  labelKey: string;
  icon: LucideIcon;
  to?: string;
  moduleKey?: string;
  children?: NavNode[];
}

export const NAV_TREE: NavNode[] = [
  // الموديولات الحقيقية (مرتبطة بتفعيل الموديول).
  { key: 'users', labelKey: 'nav.users', icon: Users, to: '/users', moduleKey: 'users' },
  { key: 'roles', labelKey: 'nav.roles', icon: ShieldCheck, to: '/roles', moduleKey: 'roles' },
  { key: 'org-units', labelKey: 'nav.orgUnits', icon: Building2, to: '/org-units', moduleKey: 'org-units' },

  // وحدة أعمال بقائمة فرعية (submenu) — صفحات وظيفية تُنسَّق يدويًا هنا.
  {
    key: 'guidance',
    labelKey: 'nav.guidance.title',
    icon: Compass,
    children: [
      { key: 'guidance-sections', labelKey: 'nav.guidance.sections', icon: FolderTree, to: '/guidance/sections' },
      { key: 'guidance-schools', labelKey: 'nav.guidance.schools', icon: School, to: '/guidance/schools' },
      { key: 'guidance-coordinators', labelKey: 'nav.guidance.coordinators', icon: UsersRound, to: '/guidance/coordinators' },
    ],
  },

  { key: 'settings', labelKey: 'nav.settings', icon: Settings, to: '/settings' },
];

/** خريطة: مفتاح العنصر الفرعي ⇒ مفتاح مجموعته الأمّ (لحارس الوصول). */
export const NAV_PARENT: Record<string, string> = Object.fromEntries(
  NAV_TREE.flatMap((n) => (n.children ?? []).map((c) => [c.key, n.key])),
);

/** كل عناصر القائمة القابلة للإخفاء (مجموعات + أوراق)، عدا «الإعدادات» تفاديًا لحبس المستخدم. */
export const HIDEABLE_NODES: { key: string; labelKey: string; icon: LucideIcon; parentKey?: string }[] =
  NAV_TREE.filter((n) => n.key !== 'settings').flatMap((n) => [
    { key: n.key, labelKey: n.labelKey, icon: n.icon },
    ...(n.children ?? []).map((c) => ({ key: c.key, labelKey: c.labelKey, icon: c.icon, parentKey: n.key })),
  ]);

/** هل العنصر (أو مجموعته الأمّ) مخفيّ؟ يُستخدم في حارس المسار. */
export function isNavKeyHidden(hidden: Iterable<string>, key: string): boolean {
  const set = hidden instanceof Set ? hidden : new Set(hidden);
  return set.has(key) || (NAV_PARENT[key] !== undefined && set.has(NAV_PARENT[key]));
}
