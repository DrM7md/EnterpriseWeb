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
  async export(format: 'xlsx' | 'pdf', search?: string): Promise<void> {
    const response = await apiClient.get('/users/export', {
      params: { format, search },
      responseType: 'blob',
    });
    const disposition = response.headers['content-disposition'] as string | undefined;
    const fileName = /filename="?([^"]+)"?/.exec(disposition ?? '')?.[1] ?? `users.${format}`;
    triggerDownload(response.data as Blob, fileName);
  },
};

/** ينزّل blob كملف عبر رابط مؤقّت. */
function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
