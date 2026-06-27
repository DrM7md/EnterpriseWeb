import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../SettingsSection';

/** إعدادات القوائم المنسدلة — هيكل جاهز يُملأ لاحقًا. */
export function DropdownsSettings() {
  const { t } = useTranslation();
  return (
    <SettingsSection titleKey="settings.sections.dropdowns.title" descKey="settings.sections.dropdowns.desc">
      <p className="settings-empty">{t('settings.comingSoon')}</p>
    </SettingsSection>
  );
}
