import { apiClient } from '../../lib/apiClient';
import type { AuthResult, LoginRequest } from './auth.types';

export const authService = {
  async login(request: LoginRequest): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/login', request);
    return data;
  },
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
