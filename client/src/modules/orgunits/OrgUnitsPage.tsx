import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CornerDownLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VirtualList } from '../../components/VirtualList';
import { useAuthStore } from '../../store/authStore';
import { useDeleteOrgUnit, useOrgUnitTree } from './orgunits.api';
import { OrgUnitDrawer } from './OrgUnitDrawer';
import type { OrgUnitListItem } from './orgunits.types';

export function OrgUnitsPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.hasPermission);
  const { data, isLoading, isError } = useOrgUnitTree();
  const del = useDeleteOrgUnit();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<OrgUnitListItem | null>(null);

  const units = data ?? [];
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (u: OrgUnitListItem) => { setEditing(u); setDrawerOpen(true); };
  const onDelete = (u: OrgUnitListItem) => { if (confirm(t('orgUnits.confirmDelete', { name: u.name }))) del.mutate(u.id); };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight">{t('orgUnits.title')}</h1>
          <p className="mt-0.5 text-[0.8125rem] text-muted">{t('orgUnits.subtitle')}</p>
        </div>
        {can('org-units.create') && <Button onClick={openCreate}><Plus size={16} /> {t('orgUnits.new')}</Button>}
      </header>

      <div className="overflow-hidden rounded-xl border border-border">
        {isLoading && <p className="px-3.5 py-7 text-center text-muted">{t('common.loading')}</p>}
        {isError && <p className="px-3.5 py-7 text-center text-danger">{t('common.loadError')}</p>}
        {!isLoading && !isError && units.length === 0 && <p className="px-3.5 py-7 text-center text-muted">{t('common.empty')}</p>}
        {!isLoading && !isError && units.length > 0 && (
          <VirtualList
            items={units}
            getKey={(u) => u.id}
            rowHeight={45}
            maxHeight={Math.min(units.length * 45, 600)}
            renderRow={(u) => (
              <div className="flex h-[45px] items-center gap-3 border-b border-border px-3.5 text-sm hover:bg-hover/50"
                style={{ paddingInlineStart: `${u.level * 26 + 14}px` }}>
                <span className="flex flex-1 items-center gap-2 truncate">
                  {u.level > 0 && <CornerDownLeft size={13} className="shrink-0 text-muted/60 -scale-x-100" />}
                  <span className="truncate font-medium">{u.name}</span>
                  <code className="rounded-md bg-[var(--code-bg)] px-1.5 py-0.5 text-[0.6875rem] text-muted">{u.code}</code>
                  {!u.isActive && <Badge variant="danger">{t('common.inactive')}</Badge>}
                </span>
                <span className="whitespace-nowrap text-xs text-muted max-md:hidden">{t('orgUnits.childUser', { children: u.childCount, users: u.userCount })}</span>
                <span className="flex gap-1">
                  {can('org-units.update') && (
                    <Button variant="subtle" size="icon-sm" title={t('common.edit')} aria-label={t('common.edit')} onClick={() => openEdit(u)}><Pencil size={15} /></Button>
                  )}
                  {can('org-units.delete') && u.parentId !== null && (
                    <Button variant="subtle" size="icon-sm" className="text-muted hover:text-danger" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => onDelete(u)}><Trash2 size={15} /></Button>
                  )}
                </span>
              </div>
            )}
          />
        )}
      </div>

      <OrgUnitDrawer open={drawerOpen} editing={editing} units={units} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
