import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react';

/** صفحة هيكلية «قيد الإنشاء» لموديولات الأعمال المستقبلية (مثل التوجيه التربوي). */
export function PlaceholderPage({ titleKey, descKey }: { readonly titleKey: string; readonly descKey?: string }) {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-[1.375rem] font-semibold tracking-tight">{t(titleKey)}</h1>
        {descKey && <p className="mt-0.5 text-[0.8125rem] text-muted">{t(descKey)}</p>}
      </header>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <Construction size={34} className="text-muted" />
        <p className="text-sm text-muted">{t('common.comingSoon')}</p>
      </div>
    </section>
  );
}
