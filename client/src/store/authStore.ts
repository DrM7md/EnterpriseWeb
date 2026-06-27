import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResult, AuthUser } from '../modules/auth/auth.types';

/**
 * حالة المصادقة (client-state) — في Zustand لا في TanStack Query (فصل صارم).
 * تُحفظ في localStorage ليبقى المستخدم مسجّلًا بين الجلسات.
 */
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (result: AuthResult) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (result) =>
        set({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
      hasPermission: (permission) => get().user?.permissions.includes(permission) ?? false,
    }),
    { name: 'ews-auth' },
  ),
);
