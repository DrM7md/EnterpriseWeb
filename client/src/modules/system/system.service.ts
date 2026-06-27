import { apiClient } from '../../lib/apiClient';
import type { SystemInfo } from './system.types';

/** خدمة مُكتَّبة لكل مورد (نمط services/ per-resource). */
export const systemService = {
  async getInfo(): Promise<SystemInfo> {
    const { data } = await apiClient.get<SystemInfo>('/system/info');
    return data;
  },
};
