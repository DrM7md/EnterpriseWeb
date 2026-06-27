import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Drawer جانبي — primitive مشترك للتفاصيل/التعديل. (Phase 2 سيُعاد بناؤه على shadcn/Radix
 * لإدارة focus-trap وaccessibility كاملة؛ هذه نسخة وظيفية مبكرة.)
 */
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('common.close')}>✕</button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
