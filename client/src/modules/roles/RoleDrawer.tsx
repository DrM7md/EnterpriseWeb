import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from '../../components/Drawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { translateApiError } from '../../lib/apiError';
import { useCreateRole, usePermissionCatalog, useRole, useUpdateRole } from './roles.hooks';
import type { PermissionItem, RoleListItem } from './roles.types';

export function RoleDrawer({
  open, editing, onClose,
}: {
  readonly open: boolean;
  readonly editing: RoleListItem | null;
  readonly onClose: () => void;
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
      if (next.has(id)) next.delete(id); else next.add(id);
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
    } catch (err) { setError(translateApiError(err)); }
  };

  return (
    <Drawer open={open} title={editing ? t('roles.editTitle') : t('roles.createTitle')} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {isSystem && <p className="text-[0.8125rem] text-muted">{t('roles.systemReadonly')}</p>}
        <label className="flex flex-col gap-1.5 text-[0.8125rem] text-muted">{t('roles.field.name')}
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isSystem} required /></label>
        <label className="flex flex-col gap-1.5 text-[0.8125rem] text-muted">{t('roles.field.description')}
          <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSystem} /></label>

        <div className="flex flex-col gap-3">
          <span className="text-[0.8125rem] text-muted">{t('roles.permissionsCount', { count: selected.size })}</span>
          {grouped.map(([moduleName, perms]) => (
            <fieldset key={moduleName} className="flex flex-col gap-2 rounded-xl border border-border p-3">
              <legend className="px-1.5 text-xs text-accent">{moduleName}</legend>
              {perms.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-[var(--accent)]" checked={selected.has(p.id)} disabled={isSystem} onChange={() => toggle(p.id)} />
                  <code className="text-[0.8125rem]">{p.code}</code>
                </label>
              ))}
            </fieldset>
          ))}
        </div>

        {error && <p className="text-[0.8125rem] text-danger">{error}</p>}
        {!isSystem && <Button type="submit" className="mt-1">{editing ? t('common.save') : t('common.create')}</Button>}
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
