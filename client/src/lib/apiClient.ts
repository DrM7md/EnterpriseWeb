import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5099/api/v1';

/** عميل HTTP مُهيّأ مرة واحدة. كل الخدمات تستهلكه. */
export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// إرفاق رمز الوصول + معرّف ارتباط لكل طلب.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
});

// تدوير الرمز عند 401 مرة واحدة، ثم إعادة الطلب الأصلي.
let refreshing: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const { refreshToken, setTokens, clear } = useAuthStore.getState();

    if (error.response?.status === 401 && original && !original._retried && refreshToken) {
      original._retried = true;
      refreshing ??= rotate(refreshToken);
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      clear();
    }
    return Promise.reject(error);

    async function rotate(token: string): Promise<string | null> {
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: token });
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken as string;
      } catch {
        return null;
      }
    }
  },
);
