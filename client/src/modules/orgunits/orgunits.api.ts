import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '../../lib/apiClient';
import type { OrgUnitListItem } from './orgunits.types';

export const createOrgUnitSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200),
  code: z.string().min(1, 'الرمز مطلوب').max(50).regex(/^[A-Za-z0-9_-]+$/, 'حروف/أرقام/شرطة فقط'),
  parentId: z.number().nullable(),
});
export const editOrgUnitSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200),
  isActive: z.boolean(),
});
export type CreateOrgUnitForm = z.infer<typeof createOrgUnitSchema>;
export type EditOrgUnitForm = z.infer<typeof editOrgUnitSchema>;

const KEY = ['org-units'] as const;

export const orgUnitsService = {
  async tree(): Promise<OrgUnitListItem[]> {
    return (await apiClient.get<OrgUnitListItem[]>('/org-units')).data;
  },
  async create(payload: CreateOrgUnitForm): Promise<{ id: number }> {
    return (await apiClient.post<{ id: number }>('/org-units', payload)).data;
  },
  async update(id: number, payload: EditOrgUnitForm): Promise<void> {
    await apiClient.put(`/org-units/${id}`, payload);
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/org-units/${id}`);
  },
};

export function useOrgUnitTree() {
  return useQuery({ queryKey: KEY, queryFn: orgUnitsService.tree });
}
export function useCreateOrgUnit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: orgUnitsService.create, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
export function useUpdateOrgUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditOrgUnitForm }) => orgUnitsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
export function useDeleteOrgUnit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: orgUnitsService.remove, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
