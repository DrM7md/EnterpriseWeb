import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type Column } from '../../components/DataTable';
import { useAuthStore } from '../../store/authStore';
import { useDeleteUser, useUsers } from './users.hooks';
import { usersService } from './users.service';
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

  const can = useAuthStore((s) => s.hasPermission);
  const { data, isLoading, isError, isFetching } = useUsers({ page, pageSize: PAGE_SIZE, search: search || undefined, sortBy, sortDescending });
  const del = useDeleteUser();

  const onSort = (key: string) => {
    if (sortBy === key) setSortDescending((d) => !d);
    else { setSortBy(key); setSortDescending(false); }
  };

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (u: UserListItem) => { setEditing(u); setDrawerOpen(true); };
  const onDelete = (u: UserListItem) => {
    if (confirm(t('users.confirmDelete', { name: u.fullName }))) del.mutate(u.id);
  };

  const columns: Column<UserListItem>[] = [
    { key: 'fullName', header: t('users.col.name'), sortable: true, render: (u) => u.fullName },
    { key: 'email', header: t('users.col.email'), sortable: true, render: (u) => u.email },
    { key: 'unitName', header: t('users.col.unit'), render: (u) => u.unitName },
    { key: 'roles', header: t('users.col.roles'), render: (u) => u.roles.join(i18n.language === 'ar' ? '، ' : ', ') || '—' },
    { key: 'isActive', header: t('users.col.status'), render: (u) => (
        <span className={u.isActive ? 'badge ok' : 'badge off'}>{u.isActive ? t('common.active') : t('common.inactive')}</span>
      ) },
    { key: 'createdAtUtc', header: t('users.col.created'), sortable: true, render: (u) => new Date(u.createdAtUtc).toLocaleDateString(i18n.language) },
  ];

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <h1>{t('users.title')}</h1>
          <p className="muted">{data ? t('users.count', { count: data.totalCount }) : '…'}{isFetching && ` · ${t('common.refreshing')}`}</p>
        </div>
        {can('users.create') && <button className="btn-primary" onClick={openCreate}>{t('users.new')}</button>}
      </header>

      <div className="toolbar">
        <input className="search" placeholder={t('users.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {can('users.export') && (
          <div className="toolbar-actions">
            <button className="btn-ghost" onClick={() => usersService.export('xlsx', search || undefined)}>{t('users.exportExcel')}</button>
            <button className="btn-ghost" onClick={() => usersService.export('pdf', search || undefined)}>{t('users.exportPdf')}</button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        sortBy={sortBy}
        sortDescending={sortDescending}
        onSort={onSort}
        rowActions={(u) => (
          <div className="row-actions">
            {can('users.update') && <button className="link" onClick={() => openEdit(u)}>{t('common.edit')}</button>}
            {can('users.delete') && <button className="link danger" onClick={() => onDelete(u)}>{t('common.delete')}</button>}
          </div>
        )}
      />

      {data && data.totalPages > 1 && (
        <footer className="pager">
          <button disabled={!data.hasPrevious} onClick={() => setPage((p) => p - 1)}>{t('common.previous')}</button>
          <span>{t('common.pageOf', { page: data.page, total: data.totalPages })}</span>
          <button disabled={!data.hasNext} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</button>
        </footer>
      )}

      <UserDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
