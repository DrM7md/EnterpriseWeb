import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { apiClient } from '../../lib/apiClient';
import type { OrgUnitListItem } from './orgunits.types';

export const createOrgUnitSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200),
  parentId: z.number().nullable(),
});
export const editOrgUnitSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200),
  isActive: z.boolean(),
});
export type CreateOrgUnitForm = z.infer<typeof createOrgUnitSchema>;
export type EditOrgUnitForm = z.infer<typeof editOrgUnitSchema>;
export interface CreateOrgUnitPayload { name: string; code: string; parentId: number | null }

/**
 * يولّد رمزًا هرميًا فريدًا تلقائيًا: رمز الأمّ + تسلسل (مثل OU-01-03).
 * المستخدم لا يكتب الرمز؛ الباك-إند يبقى الحَكَم النهائي على التفرّد.
 */
export function genOrgUnitCode(parentId: number | null, units: OrgUnitListItem[], bump = 0): string {
  const parent = parentId == null ? null : units.find((u) => u.id === parentId);
  const base = parent ? parent.code : 'OU';
  const taken = new Set(units.map((u) => u.code.toLowerCase()));
  let n = units.filter((u) => u.parentId === parentId).length + 1 + bump;
  let code: string;
  do {
    code = `${base}-${String(n).padStart(2, '0')}`.slice(0, 50);
    n++;
  } while (taken.has(code.toLowerCase()));
  return code;
}

const isCodeTaken = (e: unknown) =>
  e instanceof AxiosError && e.response?.data?.title === 'org_unit.code_taken';

const KEY = ['org-units'] as const;

export const orgUnitsService = {
  async tree(): Promise<OrgUnitListItem[]> {
    return (await apiClient.get<OrgUnitListItem[]>('/org-units')).data;
  },
  async create(payload: CreateOrgUnitPayload): Promise<{ id: number }> {
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
/**
 * إنشاء وحدة برمز هرمي تلقائي. يعيد المحاولة برمز أعلى إن اصطدم الرمز المُولّد
 * بوحدة محذوفة (الفهرس الفريد يشمل المحذوف وهي غير مرئية للعميل).
 */
export function useCreateOrgUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, parentId, units }: { name: string; parentId: number | null; units: OrgUnitListItem[] }) => {
      for (let bump = 0; bump < 50; bump++) {
        try {
          return await orgUnitsService.create({ name, code: genOrgUnitCode(parentId, units, bump), parentId });
        } catch (e) {
          if (isCodeTaken(e) && bump < 49) continue;
          throw e;
        }
      }
      throw new Error('unreachable');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
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
