import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { translateApiError } from '../../lib/apiError';
import {
  createOrgUnitSchema, editOrgUnitSchema,
  useCreateOrgUnit, useUpdateOrgUnit,
  type CreateOrgUnitForm, type EditOrgUnitForm,
} from './orgunits.api';
import type { OrgUnitListItem } from './orgunits.types';

export function OrgUnitDrawer({
  open, editing, units, onClose,
}: {
  readonly open: boolean;
  readonly editing: OrgUnitListItem | null;
  readonly units: OrgUnitListItem[];
  readonly onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Drawer open={open} title={editing ? t('orgUnits.editTitle') : t('orgUnits.createTitle')} onClose={onClose}>
      {editing ? <EditForm key={editing.id} unit={editing} onDone={onClose} /> : <CreateForm units={units} onDone={onClose} />}
    </Drawer>
  );
}

function Field({ label, error, children }: { readonly label: string; readonly error?: string; readonly children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[0.8125rem] text-muted">
      {label}{children}
      {error && <em className="not-italic text-xs text-danger">{error}</em>}
    </label>
  );
}

function CreateForm({ units, onDone }: { readonly units: OrgUnitListItem[]; readonly onDone: () => void }) {
  const { t } = useTranslation();
  const create = useCreateOrgUnit();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateOrgUnitForm>({ resolver: zodResolver(createOrgUnitSchema), defaultValues: { parentId: null } });

  const onSubmit = handleSubmit(async (values) => {
    try { await create.mutateAsync({ ...values, parentId: values.parentId ? Number(values.parentId) : null }); onDone(); }
    catch (e) { setError('root', { message: translateApiError(e) }); }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label={t('orgUnits.field.name')} error={errors.name?.message}><Input {...register('name')} /></Field>
      <Field label={t('orgUnits.field.code')} error={errors.code?.message}><Input {...register('code')} /></Field>
      <Field label={t('orgUnits.field.parent')}>
        <Select {...register('parentId')}>
          <option value="">{t('orgUnits.noParent')}</option>
          {units.map((u) => <option key={u.id} value={u.id}>{'— '.repeat(u.level)}{u.name}</option>)}
        </Select>
      </Field>
      {errors.root && <p className="text-[0.8125rem] text-danger">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting} className="mt-1">{isSubmitting ? '…' : t('common.create')}</Button>
    </form>
  );
}

function EditForm({ unit, onDone }: { readonly unit: OrgUnitListItem; readonly onDone: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateOrgUnit();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<EditOrgUnitForm>({ resolver: zodResolver(editOrgUnitSchema), defaultValues: { name: unit.name, isActive: unit.isActive } });

  const onSubmit = handleSubmit(async (values) => {
    try { await update.mutateAsync({ id: unit.id, payload: values }); onDone(); }
    catch (e) { setError('root', { message: translateApiError(e) }); }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label={t('orgUnits.field.code')}><Input value={unit.code} disabled /></Field>
      <Field label={t('orgUnits.field.name')} error={errors.name?.message}><Input {...register('name')} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[var(--accent)]" {...register('isActive')} /> {t('orgUnits.field.active')}</label>
      {errors.root && <p className="text-[0.8125rem] text-danger">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting} className="mt-1">{isSubmitting ? '…' : t('common.save')}</Button>
    </form>
  );
}
