import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
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
        <span className="inline-flex items-center gap-2 font-medium">{r.name}{r.isSystem && <Badge variant="system">{t('common.system')}</Badge>}</span>
      ) },
    { key: 'description', header: t('roles.col.description'), hideable: true, render: (r) => <span className="text-muted">{r.description || '—'}</span> },
    { key: 'permissionCount', header: t('roles.col.permissions'), hideable: true, render: (r) => r.permissionCount },
    { key: 'createdAtUtc', header: t('roles.col.created'), sortable: true, hideable: true, render: (r) => new Date(r.createdAtUtc).toLocaleDateString(i18n.language) },
  ];

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight">{t('roles.title')}</h1>
          <p className="mt-0.5 text-[0.8125rem] text-muted">{data ? t('roles.count', { count: data.totalCount }) : '…'}{isFetching && ` · ${t('common.refreshing')}`}</p>
        </div>
        {can('roles.create') && <Button onClick={openCreate}><Plus size={16} /> {t('roles.new')}</Button>}
      </header>

      <Input className="w-80 max-w-full" placeholder={t('roles.searchPlaceholder')} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }} />

      <DataTable
        tableId="roles" views={['table', 'cards']}
        columns={columns} rows={data?.items ?? []} rowKey={(r) => r.id} isLoading={isLoading} isError={isError}
        rowActions={(r) => (
          <div className="flex gap-1">
            {can('roles.update') && (
              <Button variant="subtle" size="icon-sm" title={r.isSystem ? t('common.view') : t('common.edit')} aria-label={r.isSystem ? t('common.view') : t('common.edit')} onClick={() => openEdit(r)}>
                {r.isSystem ? <Eye size={15} /> : <Pencil size={15} />}
              </Button>
            )}
            {can('roles.delete') && !r.isSystem && (
              <Button variant="subtle" size="icon-sm" className="text-muted hover:text-danger" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => onDelete(r)}><Trash2 size={15} /></Button>
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

      <RoleDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
