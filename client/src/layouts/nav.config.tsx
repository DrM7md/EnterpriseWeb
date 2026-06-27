import { Building2, Compass, FileBarChart, MapPin, Settings, ShieldCheck, UserCheck, Users, type LucideIcon } from 'lucide-react';

/**
 * شجرة التنقّل — تدعم عناصر مفردة ومجموعات بقوائم فرعية (submenu) لأي عنصر.
 * - leaf: له `to` (مسار).
 * - group: له `children` (يتوسّع/ينطوي).
 * - `moduleKey`: يظهر العنصر فقط إن كان الموديول مُفعّلًا (للموديولات الحقيقية).
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

  // مثال على مجموعة بقائمة فرعية (submenu) — هيكل جاهز لموديولات الأعمال المستقبلية.
  {
    key: 'guidance',
    labelKey: 'nav.guidance.title',
    icon: Compass,
    children: [
      { key: 'guidance-supervisors', labelKey: 'nav.guidance.supervisors', icon: UserCheck, to: '/guidance/supervisors' },
      { key: 'guidance-visits', labelKey: 'nav.guidance.visits', icon: MapPin, to: '/guidance/visits' },
      { key: 'guidance-reports', labelKey: 'nav.guidance.reports', icon: FileBarChart, to: '/guidance/reports' },
    ],
  },

  { key: 'settings', labelKey: 'nav.settings', icon: Settings, to: '/settings' },
];
