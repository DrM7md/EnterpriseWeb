import axios from 'axios';

/**
 * عميل HTTP مُهيّأ مرة واحدة (singleton). كل الخدمات تستهلكه.
 * Phase 1: سيُضاف interceptor لإرفاق JWT و Correlation ID وتدوير الـ refresh token.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});
