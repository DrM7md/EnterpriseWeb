import type { ReactNode } from 'react';
import { AppearanceSettings } from './sections/AppearanceSettings';
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
  /** أيقونة (إيموجي) تُعرض على البطاقة. */
  icon: string;
  /** المكوّن المعروض في الصفحة الفرعية. */
  element: ReactNode;
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  { key: 'appearance', icon: '🎨', element: <AppearanceSettings /> },
  { key: 'uploads', icon: '📤', element: <UploadsSettings /> },
  { key: 'dropdowns', icon: '📑', element: <DropdownsSettings /> },
  { key: 'notifications', icon: '🔔', element: <NotificationsSettings /> },
];
