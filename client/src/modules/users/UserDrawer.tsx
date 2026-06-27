import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/Drawer';
import { translateApiError } from '../../lib/apiError';
import { useCreateUser, useUpdateUser } from './users.hooks';
import { createUserSchema, editUserSchema, type CreateUserForm, type EditUserForm } from './users.schema';
import type { UserListItem } from './users.types';

/** نموذج إنشاء/تعديل مستخدم — RHF + Zod (نفس schema الخادم). */
export function UserDrawer({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: UserListItem | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Drawer open={open} title={editing ? t('users.editTitle') : t('users.createTitle')} onClose={onClose}>
      {editing
        ? <EditForm key={editing.id} user={editing} onDone={onClose} />
        : <CreateForm onDone={onClose} />}
    </Drawer>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const create = useCreateUser();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      onDone();
    } catch (e) {
      setError('root', { message: translateApiError(e) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="form">
      <Field label={t('users.field.userName')} error={errors.userName?.message}><input {...register('userName')} /></Field>
      <Field label={t('users.field.email')} error={errors.email?.message}><input type="email" {...register('email')} /></Field>
      <Field label={t('users.field.fullName')} error={errors.fullName?.message}><input {...register('fullName')} /></Field>
      <Field label={t('users.field.password')} error={errors.password?.message}><input type="password" {...register('password')} /></Field>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '…' : t('common.create')}</button>
    </form>
  );
}

function EditForm({ user, onDone }: { user: UserListItem; onDone: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateUser();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<EditUserForm>({ resolver: zodResolver(editUserSchema), defaultValues: { fullName: user.fullName, isActive: user.isActive } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: user.id, payload: values });
      onDone();
    } catch (e) {
      setError('root', { message: translateApiError(e) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="form">
      <Field label={t('users.field.email')}><input value={user.email} disabled /></Field>
      <Field label={t('users.field.fullName')} error={errors.fullName?.message}><input {...register('fullName')} /></Field>
      <label className="check"><input type="checkbox" {...register('isActive')} /> {t('users.field.active')}</label>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '…' : t('common.save')}</button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <em className="field-error">{error}</em>}
    </label>
  );
}
