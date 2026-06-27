import { useQuery } from '@tanstack/react-query';
import { systemService } from './system.service';

export function useSystemInfo() {
  return useQuery({
    queryKey: ['system', 'info'],
    queryFn: systemService.getInfo,
  });
}
