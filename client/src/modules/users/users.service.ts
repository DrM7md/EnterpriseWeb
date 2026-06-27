import { apiClient } from '../../lib/apiClient';
import type { PagedResult } from '../../types/paged';
import type { CreateUserForm, EditUserForm } from './users.schema';
import type { ListUsersParams, UserDetail, UserListItem } from './users.types';

export const usersService = {
  async list(params: ListUsersParams): Promise<PagedResult<UserListItem>> {
    const { data } = await apiClient.get<PagedResult<UserListItem>>('/users', { params });
    return data;
  },
  async get(id: number): Promise<UserDetail> {
    const { data } = await apiClient.get<UserDetail>(`/users/${id}`);
    return data;
  },
  async create(payload: CreateUserForm): Promise<{ id: number }> {
    const { data } = await apiClient.post<{ id: number }>('/users', payload);
    return data;
  },
  async update(id: number, payload: EditUserForm & { roleIds?: number[] }): Promise<void> {
    await apiClient.put(`/users/${id}`, payload);
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
