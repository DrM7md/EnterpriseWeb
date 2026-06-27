import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesService } from './roles.service';
import type { RoleForm } from './roles.schema';
import type { ListRolesParams } from './roles.types';

const KEY = ['roles'] as const;

export function useRoles(params: ListRolesParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => rolesService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: rolesService.permissions,
    staleTime: 10 * 60_000,
  });
}

export function useRole(id: number | null) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => rolesService.get(id!),
    enabled: id !== null,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleForm) => rolesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoleForm }) => rolesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
