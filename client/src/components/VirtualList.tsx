import { useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * قائمة افتراضية (TanStack Virtual) — تُصيّر العناصر المرئية فقط مهما كبر العدد.
 * تُستخدم للقوائم غير المُرقّمة الكبيرة (شجرة الوحدات). الجداول المُرقّمة لا تحتاجها.
 */
export function VirtualList<T>({
  items, renderRow, getKey, rowHeight = 44, maxHeight = 560, overscan = 10, className,
}: {
  readonly items: T[];
  readonly renderRow: (item: T, index: number) => ReactNode;
  readonly getKey: (item: T) => string | number;
  readonly rowHeight?: number;
  readonly maxHeight?: number;
  readonly overscan?: number;
  readonly className?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div ref={parentRef} className={className} style={{ maxHeight, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
        {virtualizer.getVirtualItems().map((vi) => (
          <div
            key={getKey(items[vi.index])}
            style={{ position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0, top: 0, transform: `translateY(${vi.start}px)` }}
          >
            {renderRow(items[vi.index], vi.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
