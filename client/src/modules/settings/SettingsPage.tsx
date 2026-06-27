import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SETTINGS_SECTIONS } from './settings.config';

/** حاوية الإعدادات: شبكة بطاقات، كل بطاقة تفتح صفحتها الفرعية. */
export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-[1.375rem] font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-0.5 text-[0.8125rem] text-muted">{t('settings.subtitle')}</p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {SETTINGS_SECTIONS.map((s) => (
          <Link key={s.key} to={`/settings/${s.key}`}>
            <Card className="group flex h-full flex-col gap-1.5 p-5 transition-colors hover:border-accent">
              <div className="flex items-center justify-between">
                <span className="text-2xl" aria-hidden>{s.icon}</span>
                <ChevronLeft size={16} className="text-muted transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
              </div>
              <h3 className="text-[0.9375rem] font-semibold">{t(`settings.sections.${s.key}.title`)}</h3>
              <p className="text-[0.8125rem] leading-relaxed text-muted">{t(`settings.sections.${s.key}.desc`)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
