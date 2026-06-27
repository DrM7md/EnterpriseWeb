import { apiClient } from '../../lib/apiClient';
import type { PagedResult } from '../../types/paged';
import type { RoleForm } from './roles.schema';
import type { ListRolesParams, PermissionItem, RoleDetail, RoleListItem } from './roles.types';

export const rolesService = {
  async list(params: ListRolesParams): Promise<PagedResult<RoleListItem>> {
    const { data } = await apiClient.get<PagedResult<RoleListItem>>('/roles', { params });
    return data;
  },
  async get(id: number): Promise<RoleDetail> {
    const { data } = await apiClient.get<RoleDetail>(`/roles/${id}`);
    return data;
  },
  async permissions(): Promise<PermissionItem[]> {
    const { data } = await apiClient.get<PermissionItem[]>('/roles/permissions');
    return data;
  },
  async create(payload: RoleForm): Promise<{ id: number }> {
    const { data } = await apiClient.post<{ id: number }>('/roles', payload);
    return data;
  },
  async update(id: number, payload: RoleForm): Promise<void> {
    await apiClient.put(`/roles/${id}`, payload);
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};
