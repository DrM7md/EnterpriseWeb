import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { usePreferencesStore } from '../store/preferencesStore';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

/** لوح جانبي / نافذة منبثقة (حسب تفضيل المستخدم) — primitive مشترك للتفاصيل/التعديل. */
export function Drawer({
  open, title, onClose, children,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  const { t } = useTranslation();
  const addPattern = usePreferencesStore((s) => s.addPattern);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const modal = addPattern === 'modal';

  return (
    <div
      className={cn('fixed inset-0 z-50 flex bg-[var(--overlay)]', modal ? 'items-center justify-center' : 'justify-start')}
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex flex-col border-border bg-panel shadow-2xl',
          modal ? 'max-h-[85vh] w-[460px] max-w-[92vw] rounded-2xl border' : 'h-full w-[420px] max-w-[92vw] border-e',
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button variant="subtle" size="icon-sm" onClick={onClose} aria-label={t('common.close')}><X size={16} /></Button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
