import { useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { useAuthStore } from '../../store/authStore';
import { useDeleteUser, useUsers } from './users.hooks';
import { usersService } from './users.service';
import { UserDrawer } from './UserDrawer';
import type { UserListItem } from './users.types';

const PAGE_SIZE = 10;

export function UsersPage() {
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
    if (confirm(`حذف المستخدم «${u.fullName}»؟`)) del.mutate(u.id);
  };

  const columns: Column<UserListItem>[] = [
    { key: 'fullName', header: 'الاسم', sortable: true, render: (u) => u.fullName },
    { key: 'email', header: 'البريد', sortable: true, render: (u) => u.email },
    { key: 'unitName', header: 'الوحدة', render: (u) => u.unitName },
    { key: 'roles', header: 'الأدوار', render: (u) => u.roles.join('، ') || '—' },
    { key: 'isActive', header: 'الحالة', render: (u) => (
        <span className={u.isActive ? 'badge ok' : 'badge off'}>{u.isActive ? 'مُفعّل' : 'معطّل'}</span>
      ) },
    { key: 'createdAtUtc', header: 'أُنشئ', sortable: true, render: (u) => new Date(u.createdAtUtc).toLocaleDateString('ar') },
  ];

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <h1>المستخدمون</h1>
          <p className="muted">{data ? `${data.totalCount} مستخدم ضمن نطاقك` : '…'}{isFetching && ' · تحديث'}</p>
        </div>
        {can('users.create') && <button className="btn-primary" onClick={openCreate}>+ مستخدم جديد</button>}
      </header>

      <div className="toolbar">
        <input
          className="search"
          placeholder="بحث بالاسم أو البريد…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {can('users.export') && (
          <div className="toolbar-actions">
            <button className="btn-ghost" onClick={() => usersService.export('xlsx', search || undefined)}>تصدير Excel</button>
            <button className="btn-ghost" onClick={() => usersService.export('pdf', search || undefined)}>تصدير PDF</button>
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
            {can('users.update') && <button className="link" onClick={() => openEdit(u)}>تعديل</button>}
            {can('users.delete') && <button className="link danger" onClick={() => onDelete(u)}>حذف</button>}
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

      <UserDrawer open={drawerOpen} editing={editing} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
