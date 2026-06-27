import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Columns3, LayoutGrid, Table2, Check } from 'lucide-react';
import { useTablePrefs, type TableView } from '../lib/useTablePrefs';
import { Dropdown } from './ui/Dropdown';
import { cn } from '../lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  hideable?: boolean;
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
  /** معرّف لحفظ التفضيلات (العرض + الأعمدة المخفية) لكل جدول. */
  tableId?: string;
  /** العروض المتاحة (opt-in). الافتراضي: جدول فقط. */
  views?: TableView[];
}

export function DataTable<T>(props: DataTableProps<T>) {
  const { columns, rows, rowKey, isLoading, isError, sortBy, sortDescending, onSort, rowActions, tableId, views = ['table'] } = props;
  const { t } = useTranslation();
  const prefs = useTablePrefs(tableId ?? '_', views[0]);

  const view = views.includes(prefs.view) ? prefs.view : views[0];
  const visible = columns.filter((c) => !(c.hideable && tableId && prefs.hidden.has(c.key)));
  const hideable = columns.filter((c) => c.hideable);
  const showToolbar = views.length > 1 || (Boolean(tableId) && hideable.length > 0);

  return (
    <div className="flex flex-col gap-2">
      {showToolbar && (
        <div className="flex items-center justify-end gap-2">
          {views.length > 1 && (
            <div className="inline-flex overflow-hidden rounded-lg border border-border">
              <ViewBtn active={view === 'table'} onClick={() => prefs.setView('table')} label={t('table.viewTable')}><Table2 size={15} /></ViewBtn>
              <ViewBtn active={view === 'cards'} onClick={() => prefs.setView('cards')} label={t('table.viewCards')}><LayoutGrid size={15} /></ViewBtn>
            </div>
          )}
          {tableId && hideable.length > 0 && (
            <Dropdown trigger={({ toggle }) => (
              <button onClick={toggle} className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-1.5 text-[0.8125rem] text-muted hover:text-fg">
                <Columns3 size={15} /> {t('table.columns')}
              </button>
            )}>
              {hideable.map((c) => {
                const shown = !prefs.hidden.has(c.key);
                return (
                  <button key={c.key} onClick={() => prefs.toggleColumn(c.key)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-hover">
                    <span className={cn('grid size-4 place-items-center rounded border', shown ? 'border-accent bg-accent text-accent-fg' : 'border-border')}>
                      {shown && <Check size={11} />}
                    </span>
                    {c.header}
                  </button>
                );
              })}
            </Dropdown>
          )}
        </div>
      )}

      {view === 'cards'
        ? <Cards columns={visible} rows={rows} rowKey={rowKey} rowActions={rowActions} isLoading={isLoading} isError={isError} />
        : <Table columns={visible} rows={rows} rowKey={rowKey} rowActions={rowActions} isLoading={isLoading} isError={isError}
            sortBy={sortBy} sortDescending={sortDescending} onSort={onSort} />}
    </div>
  );
}

function ViewBtn({ active, onClick, label, children }: { readonly active: boolean; readonly onClick: () => void; readonly label: string; readonly children: ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      className={cn('px-3 py-1.5', active ? 'bg-accent text-accent-fg' : 'bg-panel text-muted hover:text-fg')}>
      {children}
    </button>
  );
}

function Table<T>({ columns, rows, rowKey, isLoading, isError, sortBy, sortDescending, onSort, rowActions }: Omit<DataTableProps<T>, 'tableId' | 'views'>) {
  const { t } = useTranslation();
  const colSpan = columns.length + (rowActions ? 1 : 0);
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-panel">
            {columns.map((col) => (
              <th key={col.key} onClick={() => col.sortable && onSort?.(col.key)}
                className={`border-b border-border px-3.5 py-2.5 text-start font-medium text-muted whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-fg' : ''}`}>
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

function Cards<T>({ columns, rows, rowKey, rowActions, isLoading, isError }: Omit<DataTableProps<T>, 'tableId' | 'views' | 'sortBy' | 'sortDescending' | 'onSort'>) {
  const { t } = useTranslation();
  if (isLoading) return <p className="rounded-xl border border-border px-3.5 py-7 text-center text-muted">{t('common.loading')}</p>;
  if (isError) return <p className="rounded-xl border border-border px-3.5 py-7 text-center text-danger">{t('common.loadError')}</p>;
  if (rows.length === 0) return <p className="rounded-xl border border-border px-3.5 py-7 text-center text-muted">{t('common.empty')}</p>;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
      {rows.map((row) => (
        <div key={rowKey(row)} className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
          {rowActions && <div className="flex justify-end gap-1">{rowActions(row)}</div>}
          {columns.map((col) => (
            <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-xs text-muted">{col.header}</span>
              <span className="truncate text-end">{col.render(row)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
