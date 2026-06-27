import { QueryClient } from '@tanstack/react-query';

/** server-state واحد عبر التطبيق. الـ UI/client state يعيش في Zustand (Phase 2). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
