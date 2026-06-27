import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
}

/**
 * DataTable — primitive الجدول (Table View فقط، opt-in للبقية لاحقًا).
 * يعطي: ترتيب على الخادم، حالات loading/empty/error، ترقيم.
 * Phase 2 سيوسّعه إلى DataGrid كامل (TanStack Table + Virtual) — هذه النواة المستهلَكة.
 */
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

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  sortBy,
  sortDescending,
  onSort,
  rowActions,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : undefined}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.header}
                {sortBy === col.key && <span className="sort-ind">{sortDescending ? ' ↓' : ' ↑'}</span>}
              </th>
            ))}
            {rowActions && <th className="actions-col">{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={columns.length + 1} className="table-state">{t('common.loading')}</td></tr>
          )}
          {isError && !isLoading && (
            <tr><td colSpan={columns.length + 1} className="table-state error">{t('common.loadError')}</td></tr>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <tr><td colSpan={columns.length + 1} className="table-state">{t('common.empty')}</td></tr>
          )}
          {!isLoading && !isError && rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => <td key={col.key}>{col.render(row)}</td>)}
              {rowActions && <td className="actions-col">{rowActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
