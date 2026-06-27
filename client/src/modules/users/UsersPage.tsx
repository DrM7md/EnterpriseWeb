import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileSpreadsheet, FileText, Layers, Pencil, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useDeleteUser, useUsers } from './users.hooks';
import { usersService } from './users.service';
import { runAsyncUsersExport } from '../reports/reports.service';
import { UserDrawer } from './UserDrawer';
import type { UserListItem } from './users.types';

const PAGE_SIZE = 10;

export function UsersPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAtUtc');
  const [sortDescending, setSortDescending] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [asyncMsg, setAsyncMsg] = useState<string | null>(null);

  const can = useAuthStore((s) => s.hasPermission);
  const { data, isLoading, isError, isFetching } = useUsers({ page, pageSize: PAGE_SIZE, search: search || undefined, sortBy, sortDescending });
  const del = useDeleteUser();

  const onAsyncExport = () =>
    runAsyncUsersExport('xlsx', search || undefined, (state) =>
      setAsyncMsg(state === 'queued' ? t('users.exportQueued') : state === 'failed' ? t('users.exportFailed') : null));

  const onSort = (key: string) => {
    if (sortBy === key) setSortDescending((d) => !d);
    else { setSortBy(key); setSortDescending(false); }
  };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (u: UserListItem) => { setEditing(u); setDrawerOpen(true); };
  const onDelete = (u: UserListItem) => { if (confirm(t('users.confirmDelete', { name: u.fullName }))) del.mutate(u.id); };

  const columns: Column<UserListItem>[] = [
    { key: 'fullName', header: t('users.col.name'), sortable: true, render: (u) => <span className="font-medium">{u.fullName}</span> },
    { key: 'email', header: t('users.col.email'), sortable: true, render: (u) => <span className="text-muted">{u.email}</span> },
    { key: 'unitName', header: t('users.col.unit'), render: (u) => u.unitName },
    { key: 'roles', header: t('users.col.roles'), render: (u) => u.roles.join(i18n.language === 'ar' ? '، ' : ', ') || '—' },
    { key: 'isActive', header: t('users.col.status'), render: (u) => (
        <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? t('common.active') : t('common.inactive')}</Badge>
      ) },
    { key: 'createdAtUtc', header: t('users.col.created'), sortable: true, render: (u) => new Date(u.createdAtUtc).toLocaleDateString(i18n.language) },
  ];

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight">{t('users.title')}</h1>
          <p className="mt-0.5 text-[0.8125rem] text-muted">{data ? t('users.count', { count: data.totalCount }) : '…'}{isFetching && ` · ${t('common.refreshing')}`}</p>
        </div>
        {can('users.create') && <Button onClick={openCreate}><Plus size={16} /> {t('users.new')}</Button>}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input className="w-80 max-w-full" placeholder={t('users.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {can('users.export') && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => usersService.export('xlsx', search || undefined)}><FileSpreadsheet size={15} /> {t('users.exportExcel')}</Button>
            <Button variant="ghost" size="sm" onClick={() => usersService.export('pdf', search || undefined)}><FileText size={15} /> {t('users.exportPdf')}</Button>
            <Button variant="ghost" size="sm" onClick={onAsyncExport}><Layers size={15} /> {t('users.exportAsync')}</Button>
          </div>
        )}
      </div>

      {asyncMsg && <p className="rounded-lg border border-accent bg-[var(--notice-bg)] px-3.5 py-2.5 text-[0.8125rem]">{asyncMsg}</p>}

      <DataTable
        columns={columns} rows={data?.items ?? []} rowKey={(u) => u.id}
        isLoading={isLoading} isError={isError} sortBy={sortBy} sortDescending={sortDescending} onSort={onSort}
        rowActions={(u) => (
          <div className="flex gap-1">
            {can('users.update') && (
              <Button variant="subtle" size="icon-sm" title={t('common.edit')} aria-label={t('common.edit')} onClick={() => openEdit(u)}><Pencil size={15} /></Button>
            )}
            {can('users.delete') && (
              <Button variant="subtle" size="icon-sm" className="text-muted hover:text-danger" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => onDelete(u)}><Trash2 size={15} /></Button>
            )}
          </div>
        )}
      />

      {data && data.totalPages > 1 && (
        <footer className="flex items-center justify-center gap-4 text-[0.8125rem] text-muted">
          <Button variant="ghost" size="sm" disabled={!data.hasPrevious} onClick={() => setPage((p) => p - 1)}>{t('common.previous')}</Button>
          <span>{t('common.pageOf', { page: data.page, total: data.totalPages })}</span>
          <Button variant="ghost" size="sm" disabled={!data.hasNext} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</Button>
        </footer>
      )}

      <UserDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
