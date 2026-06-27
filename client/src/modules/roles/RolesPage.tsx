import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type Column } from '../../components/DataTable';
import { useAuthStore } from '../../store/authStore';
import { useDeleteRole, useRoles } from './roles.hooks';
import { RoleDrawer } from './RoleDrawer';
import type { RoleListItem } from './roles.types';

const PAGE_SIZE = 10;

export function RolesPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RoleListItem | null>(null);

  const can = useAuthStore((s) => s.hasPermission);
  const { data, isLoading, isError, isFetching } = useRoles({ page, pageSize: PAGE_SIZE, search: search || undefined });
  const del = useDeleteRole();

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (r: RoleListItem) => { setEditing(r); setDrawerOpen(true); };
  const onDelete = (r: RoleListItem) => { if (confirm(t('roles.confirmDelete', { name: r.name }))) del.mutate(r.id); };

  const columns: Column<RoleListItem>[] = [
    { key: 'name', header: t('roles.col.role'), sortable: true, render: (r) => (
        <span>{r.name}{r.isSystem && <span className="badge sys"> {t('common.system')}</span>}</span>
      ) },
    { key: 'description', header: t('roles.col.description'), render: (r) => r.description || '—' },
    { key: 'permissionCount', header: t('roles.col.permissions'), render: (r) => r.permissionCount },
    { key: 'createdAtUtc', header: t('roles.col.created'), sortable: true, render: (r) => new Date(r.createdAtUtc).toLocaleDateString(i18n.language) },
  ];

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <h1>{t('roles.title')}</h1>
          <p className="muted">{data ? t('roles.count', { count: data.totalCount }) : '…'}{isFetching && ` · ${t('common.refreshing')}`}</p>
        </div>
        {can('roles.create') && <button className="btn-primary" onClick={openCreate}>{t('roles.new')}</button>}
      </header>

      <div className="toolbar">
        <input className="search" placeholder={t('roles.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        rowActions={(r) => (
          <div className="row-actions">
            {can('roles.update') && <button className="link" onClick={() => openEdit(r)}>{r.isSystem ? t('common.view') : t('common.edit')}</button>}
            {can('roles.delete') && !r.isSystem && <button className="link danger" onClick={() => onDelete(r)}>{t('common.delete')}</button>}
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

      <RoleDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
