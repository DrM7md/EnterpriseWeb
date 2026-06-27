import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SETTINGS_SECTIONS } from './settings.config';

/** حاوية الإعدادات: شبكة بطاقات، كل بطاقة تفتح صفحتها الفرعية. */
export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <h1>{t('settings.title')}</h1>
          <p className="muted">{t('settings.subtitle')}</p>
        </div>
      </header>

      <div className="settings-grid">
        {SETTINGS_SECTIONS.map((s) => (
          <Link key={s.key} to={`/settings/${s.key}`} className="settings-card">
            <span className="ico" aria-hidden>{s.icon}</span>
            <h3>{t(`settings.sections.${s.key}.title`)}</h3>
            <p>{t(`settings.sections.${s.key}.desc`)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
