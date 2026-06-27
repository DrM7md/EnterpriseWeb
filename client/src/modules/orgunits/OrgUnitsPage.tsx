import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    <section className="page">
      <header className="page-head">
        <div>
          <h1>{t('orgUnits.title')}</h1>
          <p className="muted">{t('orgUnits.subtitle')}</p>
        </div>
        {can('org-units.create') && <button className="btn-primary" onClick={openCreate}>{t('orgUnits.new')}</button>}
      </header>

      <div className="tree">
        {isLoading && <p className="table-state">{t('common.loading')}</p>}
        {isError && <p className="table-state error">{t('common.loadError')}</p>}
        {!isLoading && !isError && units.length === 0 && <p className="table-state">{t('common.empty')}</p>}
        {units.map((u) => (
          <div key={u.id} className="tree-row" style={{ paddingInlineStart: `${u.level * 28 + 14}px` }}>
            <span className="tree-name">
              {u.level > 0 && <span className="tree-branch" aria-hidden>└</span>}
              {u.name}
              <code className="tree-code">{u.code}</code>
              {!u.isActive && <span className="badge off">{t('common.inactive')}</span>}
            </span>
            <span className="tree-meta">
              {t('orgUnits.childUser', { children: u.childCount, users: u.userCount })}
            </span>
            <span className="tree-actions">
              {can('org-units.update') && <button className="link" onClick={() => openEdit(u)}>{t('common.edit')}</button>}
              {can('org-units.delete') && u.parentId !== null && (
                <button className="link danger" onClick={() => onDelete(u)}>{t('common.delete')}</button>
              )}
            </span>
          </div>
        ))}
      </div>

      <OrgUnitDrawer open={drawerOpen} editing={editing} units={units} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
