import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from './users.service';
import type { CreateUserForm, EditUserForm } from './users.schema';
import type { ListUsersParams } from './users.types';

const KEY = ['users'] as const;

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => usersService.list(params),
    placeholderData: (prev) => prev, // إبقاء البيانات أثناء التنقّل بين الصفحات
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserForm) => usersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditUserForm }) =>
      usersService.update(id, { ...payload, roleIds: [] }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
