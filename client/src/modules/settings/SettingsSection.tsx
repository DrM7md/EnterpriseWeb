import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/** غلاف موحّد لصفحات الإعدادات الفرعية: زر رجوع + عنوان + وصف. */
export function SettingsSection({
  titleKey, descKey, children,
}: {
  readonly titleKey: string;
  readonly descKey: string;
  readonly children: ReactNode;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="flex max-w-2xl flex-col gap-5">
      <header>
        <Button variant="link" size="sm" className="mb-2 px-0" onClick={() => navigate('/settings')}>
          <ChevronRight size={15} className="rtl:rotate-180" /> {t('settings.back')}
        </Button>
        <h1 className="text-[1.375rem] font-semibold tracking-tight">{t(titleKey)}</h1>
        <p className="mt-0.5 text-[0.8125rem] text-muted">{t(descKey)}</p>
      </header>
      {children}
    </section>
  );
}
