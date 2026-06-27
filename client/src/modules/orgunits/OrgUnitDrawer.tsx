import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/Drawer';
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
  open: boolean;
  editing: OrgUnitListItem | null;
  units: OrgUnitListItem[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Drawer open={open} title={editing ? t('orgUnits.editTitle') : t('orgUnits.createTitle')} onClose={onClose}>
      {editing
        ? <EditForm key={editing.id} unit={editing} onDone={onClose} />
        : <CreateForm units={units} onDone={onClose} />}
    </Drawer>
  );
}

function CreateForm({ units, onDone }: { units: OrgUnitListItem[]; onDone: () => void }) {
  const { t } = useTranslation();
  const create = useCreateOrgUnit();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateOrgUnitForm>({ resolver: zodResolver(createOrgUnitSchema), defaultValues: { parentId: null } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({ ...values, parentId: values.parentId ? Number(values.parentId) : null });
      onDone();
    } catch (e) {
      setError('root', { message: translateApiError(e) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="form">
      <label className="field"><span>{t('orgUnits.field.name')}</span><input {...register('name')} /></label>
      {errors.name && <em className="field-error">{errors.name.message}</em>}
      <label className="field"><span>{t('orgUnits.field.code')}</span><input {...register('code')} /></label>
      {errors.code && <em className="field-error">{errors.code.message}</em>}
      <label className="field">
        <span>{t('orgUnits.field.parent')}</span>
        <select {...register('parentId')}>
          <option value="">{t('orgUnits.noParent')}</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{'— '.repeat(u.level)}{u.name}</option>
          ))}
        </select>
      </label>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '…' : t('common.create')}</button>
    </form>
  );
}

function EditForm({ unit, onDone }: { unit: OrgUnitListItem; onDone: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateOrgUnit();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<EditOrgUnitForm>({ resolver: zodResolver(editOrgUnitSchema), defaultValues: { name: unit.name, isActive: unit.isActive } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: unit.id, payload: values });
      onDone();
    } catch (e) {
      setError('root', { message: translateApiError(e) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="form">
      <label className="field"><span>{t('orgUnits.field.code')}</span><input value={unit.code} disabled /></label>
      <label className="field"><span>{t('orgUnits.field.name')}</span><input {...register('name')} /></label>
      {errors.name && <em className="field-error">{errors.name.message}</em>}
      <label className="check"><input type="checkbox" {...register('isActive')} /> {t('orgUnits.field.active')}</label>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '…' : t('common.save')}</button>
    </form>
  );
}
