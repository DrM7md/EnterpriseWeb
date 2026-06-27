import { useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { useAuthStore } from '../../store/authStore';
import { useDeleteRole, useRoles } from './roles.hooks';
import { RoleDrawer } from './RoleDrawer';
import type { RoleListItem } from './roles.types';

const PAGE_SIZE = 10;

export function RolesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RoleListItem | null>(null);

  const can = useAuthStore((s) => s.hasPermission);
  const { data, isLoading, isError, isFetching } = useRoles({ page, pageSize: PAGE_SIZE, search: search || undefined });
  const del = useDeleteRole();

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (r: RoleListItem) => { setEditing(r); setDrawerOpen(true); };
  const onDelete = (r: RoleListItem) => { if (confirm(`حذف الدور «${r.name}»؟`)) del.mutate(r.id); };

  const columns: Column<RoleListItem>[] = [
    { key: 'name', header: 'الدور', sortable: true, render: (r) => (
        <span>{r.name}{r.isSystem && <span className="badge sys"> نظام</span>}</span>
      ) },
    { key: 'description', header: 'الوصف', render: (r) => r.description || '—' },
    { key: 'permissionCount', header: 'الصلاحيات', render: (r) => r.permissionCount },
    { key: 'createdAtUtc', header: 'أُنشئ', sortable: true, render: (r) => new Date(r.createdAtUtc).toLocaleDateString('ar') },
  ];

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <h1>الأدوار والصلاحيات</h1>
          <p className="muted">{data ? `${data.totalCount} دور` : '…'}{isFetching && ' · تحديث'}</p>
        </div>
        {can('roles.create') && <button className="btn-primary" onClick={openCreate}>+ دور جديد</button>}
      </header>

      <div className="toolbar">
        <input className="search" placeholder="بحث باسم الدور…" value={search}
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
            {can('roles.update') && <button className="link" onClick={() => openEdit(r)}>{r.isSystem ? 'عرض' : 'تعديل'}</button>}
            {can('roles.delete') && !r.isSystem && <button className="link danger" onClick={() => onDelete(r)}>حذف</button>}
          </div>
        )}
      />

      {data && data.totalPages > 1 && (
        <footer className="pager">
          <button disabled={!data.hasPrevious} onClick={() => setPage((p) => p - 1)}>السابق</button>
          <span>صفحة {data.page} من {data.totalPages}</span>
          <button disabled={!data.hasNext} onClick={() => setPage((p) => p + 1)}>التالي</button>
        </footer>
      )}

      <RoleDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
