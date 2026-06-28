import type { ReactNode } from 'react';
import { useNavVisibilityStore } from '../store/navVisibilityStore';
import { isNavKeyHidden } from '../layouts/nav.config';
import { NoAccessPage } from './NoAccessPage';

/** يلفّ عنصر المسار: إن كان مفتاح القائمة (أو مجموعته) مخفيًّا إداريًا يعرض رسالة منع الوصول. */
export function NavGuard({ navKey, children }: { readonly navKey: string; readonly children: ReactNode }) {
  const hidden = useNavVisibilityStore((s) => s.hidden);
  return isNavKeyHidden(hidden, navKey) ? <NoAccessPage /> : <>{children}</>;
}
