import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { Drawer } from '../../components/Drawer';
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
  return (
    <Drawer open={open} title={editing ? 'تعديل مستخدم' : 'مستخدم جديد'} onClose={onClose}>
      {editing
        ? <EditForm key={editing.id} user={editing} onDone={onClose} />
        : <CreateForm onDone={onClose} />}
    </Drawer>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const create = useCreateUser();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      onDone();
    } catch (e) {
      setError('root', { message: apiError(e) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="form">
      <Field label="اسم المستخدم" error={errors.userName?.message}><input {...register('userName')} /></Field>
      <Field label="البريد الإلكتروني" error={errors.email?.message}><input type="email" {...register('email')} /></Field>
      <Field label="الاسم الكامل" error={errors.fullName?.message}><input {...register('fullName')} /></Field>
      <Field label="كلمة المرور" error={errors.password?.message}><input type="password" {...register('password')} /></Field>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '…' : 'إنشاء'}</button>
    </form>
  );
}

function EditForm({ user, onDone }: { user: UserListItem; onDone: () => void }) {
  const update = useUpdateUser();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<EditUserForm>({ resolver: zodResolver(editUserSchema), defaultValues: { fullName: user.fullName, isActive: user.isActive } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: user.id, payload: values });
      onDone();
    } catch (e) {
      setError('root', { message: apiError(e) });
    }
  });

  return (
    <form onSubmit={onSubmit} className="form">
      <Field label="البريد الإلكتروني"><input value={user.email} disabled /></Field>
      <Field label="الاسم الكامل" error={errors.fullName?.message}><input {...register('fullName')} /></Field>
      <label className="check"><input type="checkbox" {...register('isActive')} /> حساب مُفعّل</label>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '…' : 'حفظ'}</button>
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

function apiError(e: unknown): string {
  if (e instanceof AxiosError) return e.response?.data?.detail ?? e.response?.data?.title ?? 'فشل الحفظ.';
  return 'فشل الحفظ.';
}
