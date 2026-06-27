import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from '../../components/Drawer';
import { translateApiError } from '../../lib/apiError';
import { useCreateRole, usePermissionCatalog, useRole, useUpdateRole } from './roles.hooks';
import type { PermissionItem, RoleListItem } from './roles.types';

/** نموذج إنشاء/تعديل دور مع منتقي صلاحيات مجمَّع حسب الموديول. */
export function RoleDrawer({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: RoleListItem | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isSystem = editing?.isSystem ?? false;
  const { data: catalog } = usePermissionCatalog();
  const { data: detail } = useRole(open && editing ? editing.id : null);
  const create = useCreateRole();
  const update = useUpdateRole();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(editing?.name ?? '');
    setDescription(editing?.description ?? '');
    setSelected(new Set(detail?.permissionIds ?? []));
  }, [open, editing, detail]);

  const grouped = useMemo(() => groupByModule(catalog ?? []), [catalog]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { name, description, permissionIds: [...selected] };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else await create.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(translateApiError(err));
    }
  };

  return (
    <Drawer open={open} title={editing ? t('roles.editTitle') : t('roles.createTitle')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {isSystem && <p className="muted">{t('roles.systemReadonly')}</p>}
        <label className="field">
          <span>{t('roles.field.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} disabled={isSystem} required />
        </label>
        <label className="field">
          <span>{t('roles.field.description')}</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSystem} />
        </label>

        <div className="perm-picker">
          <span className="field-label">{t('roles.permissionsCount', { count: selected.size })}</span>
          {grouped.map(([moduleName, perms]) => (
            <fieldset key={moduleName} className="perm-group">
              <legend>{moduleName}</legend>
              {perms.map((p) => (
                <label key={p.id} className="check">
                  <input type="checkbox" checked={selected.has(p.id)} disabled={isSystem} onChange={() => toggle(p.id)} />
                  {p.code}
                </label>
              ))}
            </fieldset>
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}
        {!isSystem && <button type="submit" className="btn-primary">{editing ? t('common.save') : t('common.create')}</button>}
      </form>
    </Drawer>
  );
}

function groupByModule(items: PermissionItem[]): [string, PermissionItem[]][] {
  const map = new Map<string, PermissionItem[]>();
  for (const p of items) {
    const list = map.get(p.module) ?? [];
    list.push(p);
    map.set(p.module, list);
  }
  return [...map.entries()];
}
