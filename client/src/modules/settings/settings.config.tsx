import type { ReactNode } from 'react';
import { Bell, ListFilter, Palette, PanelLeft, UploadCloud, type LucideIcon } from 'lucide-react';
import { AppearanceSettings } from './sections/AppearanceSettings';
import { SidebarSettings } from './sections/SidebarSettings';
import { NotificationsSettings } from './sections/NotificationsSettings';
import { DropdownsSettings } from './sections/DropdownsSettings';
import { UploadsSettings } from './sections/UploadsSettings';

/**
 * سجلّ أقسام الإعدادات — مصدر واحد للحقيقة.
 * لإضافة قسم جديد: أنشئ مكوّنه في sections/، ثم أضف سطرًا هنا + مفاتيح الترجمة
 * (settings.sections.<key>.title / .desc). البطاقات والمسارات تُولَّد تلقائيًا.
 */
export interface SettingsSectionMeta {
  /** يُستخدم كجزء المسار /settings/<key> ومفتاح الترجمة. */
  key: string;
  /** أيقونة Lucide تُعرض على البطاقة. */
  icon: LucideIcon;
  /** المكوّن المعروض في الصفحة الفرعية. */
  element: ReactNode;
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  { key: 'appearance', icon: Palette, element: <AppearanceSettings /> },
  { key: 'sidebar', icon: PanelLeft, element: <SidebarSettings /> },
  { key: 'uploads', icon: UploadCloud, element: <UploadsSettings /> },
  { key: 'dropdowns', icon: ListFilter, element: <DropdownsSettings /> },
  { key: 'notifications', icon: Bell, element: <NotificationsSettings /> },
];
