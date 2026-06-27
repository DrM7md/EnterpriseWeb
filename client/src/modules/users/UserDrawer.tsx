import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/Drawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { translateApiError } from '../../lib/apiError';
import { useCreateUser, useUpdateUser } from './users.hooks';
import { createUserSchema, editUserSchema, type CreateUserForm, type EditUserForm } from './users.schema';
import type { UserListItem } from './users.types';

export function UserDrawer({
  open, editing, onClose,
}: {
  readonly open: boolean;
  readonly editing: UserListItem | null;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Drawer open={open} title={editing ? t('users.editTitle') : t('users.createTitle')} onClose={onClose}>
      {editing ? <EditForm key={editing.id} user={editing} onDone={onClose} /> : <CreateForm onDone={onClose} />}
    </Drawer>
  );
}

function Field({ label, error, children }: { readonly label: string; readonly error?: string; readonly children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[0.8125rem] text-muted">
      {label}
      {children}
      {error && <em className="not-italic text-xs text-danger">{error}</em>}
    </label>
  );
}

function CreateForm({ onDone }: { readonly onDone: () => void }) {
  const { t } = useTranslation();
  const create = useCreateUser();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try { await create.mutateAsync(values); onDone(); }
    catch (e) { setError('root', { message: translateApiError(e) }); }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label={t('users.field.userName')} error={errors.userName?.message}><Input {...register('userName')} /></Field>
      <Field label={t('users.field.email')} error={errors.email?.message}><Input type="email" {...register('email')} /></Field>
      <Field label={t('users.field.fullName')} error={errors.fullName?.message}><Input {...register('fullName')} /></Field>
      <Field label={t('users.field.password')} error={errors.password?.message}><Input type="password" {...register('password')} /></Field>
      {errors.root && <p className="text-[0.8125rem] text-danger">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting} className="mt-1">{isSubmitting ? '…' : t('common.create')}</Button>
    </form>
  );
}

function EditForm({ user, onDone }: { readonly user: UserListItem; readonly onDone: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateUser();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<EditUserForm>({ resolver: zodResolver(editUserSchema), defaultValues: { fullName: user.fullName, isActive: user.isActive } });

  const onSubmit = handleSubmit(async (values) => {
    try { await update.mutateAsync({ id: user.id, payload: values }); onDone(); }
    catch (e) { setError('root', { message: translateApiError(e) }); }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label={t('users.field.email')}><Input value={user.email} disabled /></Field>
      <Field label={t('users.field.fullName')} error={errors.fullName?.message}><Input {...register('fullName')} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[var(--accent)]" {...register('isActive')} /> {t('users.field.active')}</label>
      {errors.root && <p className="text-[0.8125rem] text-danger">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting} className="mt-1">{isSubmitting ? '…' : t('common.save')}</Button>
    </form>
  );
}
