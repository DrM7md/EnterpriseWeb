import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/** غلاف موحّد لصفحات الإعدادات الفرعية: زر رجوع + عنوان + وصف. */
export function SettingsSection({
  titleKey,
  descKey,
  children,
}: {
  titleKey: string;
  descKey: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="page">
      <header className="section-head">
        <button className="back-link" onClick={() => navigate('/settings')}>
          ← {t('settings.back')}
        </button>
        <h1>{t(titleKey)}</h1>
        <p className="muted">{t(descKey)}</p>
      </header>
      {children}
    </section>
  );
}
