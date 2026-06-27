import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  onSort?: (key: string) => void;
  rowActions?: (row: T) => ReactNode;
}

/**
 * DataTable — primitive الجدول (Table View). يعطي: ترتيب على الخادم، حالات
 * loading/empty/error. Phase لاحق: virtualization عبر TanStack Virtual عند الحاجة.
 */
export function DataTable<T>({
  columns, rows, rowKey, isLoading, isError, sortBy, sortDescending, onSort, rowActions,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const colSpan = columns.length + (rowActions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-panel">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={`border-b border-border px-3.5 py-2.5 text-start font-medium text-muted whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-fg' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortBy === col.key && (sortDescending ? <ChevronDown size={13} className="text-accent" /> : <ChevronUp size={13} className="text-accent" />)}
                </span>
              </th>
            ))}
            {rowActions && <th className="w-px border-b border-border px-3.5 py-2.5 text-start font-medium text-muted whitespace-nowrap">{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={colSpan} className="px-3.5 py-7 text-center text-muted">{t('common.loading')}</td></tr>}
          {isError && !isLoading && <tr><td colSpan={colSpan} className="px-3.5 py-7 text-center text-danger">{t('common.loadError')}</td></tr>}
          {!isLoading && !isError && rows.length === 0 && <tr><td colSpan={colSpan} className="px-3.5 py-7 text-center text-muted">{t('common.empty')}</td></tr>}
          {!isLoading && !isError && rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-hover/50">
              {columns.map((col) => <td key={col.key} className="px-3.5 py-2.5">{col.render(row)}</td>)}
              {rowActions && <td className="w-px px-3.5 py-2.5 whitespace-nowrap">{rowActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
