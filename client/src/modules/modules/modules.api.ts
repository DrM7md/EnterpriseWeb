import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

export interface ModuleInfo {
  key: string;
  name: string;
  description: string | null;
  isCore: boolean;
  isEnabled: boolean;
}

/** الموديولات الفعّالة لوحدة المستخدم — تُبنى منها عناصر التنقّل. */
export function useModules() {
  return useQuery({
    queryKey: ['modules', 'effective'],
    queryFn: async () => (await apiClient.get<ModuleInfo[]>('/modules')).data,
    staleTime: 5 * 60_000,
  });
}
