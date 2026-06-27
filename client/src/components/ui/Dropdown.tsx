import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

/** قائمة منسدلة بسيطة (popover) مع إغلاق عند النقر خارجها. */
export function Dropdown({ trigger, children, align = 'end' }: {
  readonly trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  readonly children: ReactNode;
  readonly align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onEsc); };
  }, []);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={cn(
          'absolute z-30 mt-1 min-w-52 rounded-lg border border-border bg-panel p-1 shadow-xl',
          align === 'end' ? 'end-0' : 'start-0',
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
