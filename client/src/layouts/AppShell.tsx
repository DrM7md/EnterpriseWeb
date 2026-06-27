import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, Languages, LogOut, Moon, Settings, ShieldCheck, Sun, Users, type LucideIcon } from 'lucide-react';
import { authService } from '../modules/auth/auth.service';
import { useModules } from '../modules/modules/modules.api';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

/** خريطة مفاتيح الموديولات إلى عناصر التنقّل (التسمية تُترجَم + أيقونة). */
const NAV: Record<string, { to: string; labelKey: string; icon: LucideIcon }> = {
  users: { to: '/users', labelKey: 'nav.users', icon: Users },
  roles: { to: '/roles', labelKey: 'nav.roles', icon: ShieldCheck },
  'org-units': { to: '/org-units', labelKey: 'nav.orgUnits', icon: Building2 },
};

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
    isActive ? 'bg-accent text-accent-fg font-medium' : 'text-muted hover:bg-hover hover:text-fg',
  );

export function AppShell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);
  const theme = usePreferencesStore((s) => s.theme);
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme);
  const { data: modules } = useModules();

  const onLogout = async () => {
    if (refreshToken) await authService.logout(refreshToken).catch(() => undefined);
    clear();
    navigate('/login', { replace: true });
  };
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  return (
    <div className="grid min-h-screen grid-cols-[230px_1fr] max-md:grid-cols-1">
      <aside className="flex flex-col gap-1 border-e border-border bg-panel p-4 max-md:hidden">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent">🏛️</span>
          {t('appName')}
        </div>
        <nav className="flex flex-col gap-1">
          {(modules ?? [])
            .filter((m) => m.isEnabled && NAV[m.key])
            .map((m) => {
              const Icon = NAV[m.key].icon;
              return (
                <NavLink key={m.key} to={NAV[m.key].to} className={navLink}>
                  <Icon size={17} strokeWidth={2} /> {t(NAV[m.key].labelKey)}
                </NavLink>
              );
            })}
          <div className="my-2 h-px bg-border" />
          <NavLink to="/settings" className={navLink}>
            <Settings size={17} strokeWidth={2} /> {t('nav.settings')}
          </NavLink>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-border px-7 py-3 max-md:px-4">
          <span className="truncate text-[0.8125rem] text-muted">
            {user?.fullName} · {user?.roles.join('، ')}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label={t('common.toggleTheme')} title={t('common.toggleTheme')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleLang}>
              <Languages size={15} /> {t('common.language')}
            </Button>
            <Button variant="subtle" size="sm" onClick={onLogout}>
              <LogOut size={15} /> {t('common.logout')}
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-7 max-md:p-4"><Outlet /></main>
      </div>
    </div>
  );
}
