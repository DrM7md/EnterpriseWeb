import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../SettingsSection';

/** إعدادات الإشعارات — هيكل جاهز يُملأ لاحقًا. */
export function NotificationsSettings() {
  const { t } = useTranslation();
  return (
    <SettingsSection titleKey="settings.sections.notifications.title" descKey="settings.sections.notifications.desc">
      <p className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-[0.8125rem] text-muted">{t('settings.comingSoon')}</p>
    </SettingsSection>
  );
}
