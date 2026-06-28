import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

/** تُعرض عند محاولة الوصول لمسار عنصرُه مخفيّ إداريًا — رسالة تواصل مع الإدارة. */
export function NoAccessPage() {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-danger/10 text-danger">
        <ShieldAlert size={32} />
      </span>
      <h1 className="text-[1.375rem] font-semibold tracking-tight">{t('noAccess.title')}</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">{t('noAccess.message')}</p>
    </section>
  );
}
