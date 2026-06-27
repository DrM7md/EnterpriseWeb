import { AxiosError } from 'axios';
import i18n from './i18n';

/**
 * يحوّل خطأ API إلى رسالة مُترجَمة. أخطاء الخادم رموز i18n (title=code)،
 * فنترجمها عبر namespace errors؛ وإلا نعود لرسالة الخادم أو رسالة عامة.
 */
export function translateApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const code = error.response?.data?.title as string | undefined;
    if (code && i18n.exists(`errors.${code}`)) return i18n.t(`errors.${code}`);
    return (error.response?.data?.detail as string | undefined) ?? i18n.t('common.saveError');
  }
  return i18n.t('common.saveError');
}
