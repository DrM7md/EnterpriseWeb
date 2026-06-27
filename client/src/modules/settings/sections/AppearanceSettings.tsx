import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { THEMES } from '../../../lib/theme';
import type { AddPattern } from '../../../store/preferencesStore';
import { SettingsSection } from '../SettingsSection';

const ADD_PATTERNS: AddPattern[] = ['drawer', 'modal'];

/** إعدادات الواجهة: السمة (فاتح/داكن) ونمط الإضافة (لوح جانبي/نافذة منبثقة). */
export function AppearanceSettings() {
  const { t } = useTranslation();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const addPattern = usePreferencesStore((s) => s.addPattern);
  const setAddPattern = usePreferencesStore((s) => s.setAddPattern);

  return (
    <SettingsSection titleKey="settings.sections.appearance.title" descKey="settings.sections.appearance.desc">
      <div className="setting-list">
        <div className="setting-row">
          <div className="label">
            <h4>{t('settings.appearance.theme')}</h4>
            <p>{t('settings.appearance.themeDesc')}</p>
          </div>
          <div className="segmented" role="group" aria-label={t('settings.appearance.theme')}>
            {THEMES.map((th) => (
              <button key={th} className={theme === th ? 'active' : ''} onClick={() => setTheme(th)}>
                {t(`settings.appearance.themeOption.${th}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <div className="label">
            <h4>{t('settings.appearance.addPattern')}</h4>
            <p>{t('settings.appearance.addPatternDesc')}</p>
          </div>
          <div className="segmented" role="group" aria-label={t('settings.appearance.addPattern')}>
            {ADD_PATTERNS.map((p) => (
              <button key={p} className={addPattern === p ? 'active' : ''} onClick={() => setAddPattern(p)}>
                {t(`settings.appearance.addPatternOption.${p}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
