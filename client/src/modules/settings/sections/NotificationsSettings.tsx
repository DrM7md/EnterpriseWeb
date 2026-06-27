import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../SettingsSection';

/** إعدادات الإشعارات — هيكل جاهز يُملأ لاحقًا. */
export function NotificationsSettings() {
  const { t } = useTranslation();
  return (
    <SettingsSection titleKey="settings.sections.notifications.title" descKey="settings.sections.notifications.desc">
      <p className="settings-empty">{t('settings.comingSoon')}</p>
    </SettingsSection>
  );
}
