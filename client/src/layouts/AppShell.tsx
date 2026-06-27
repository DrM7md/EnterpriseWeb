import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../modules/auth/auth.service';
import { useModules } from '../modules/modules/modules.api';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore } from '../store/preferencesStore';

/** خريطة مفاتيح الموديولات إلى عناصر التنقّل (التسمية تُترجَم). */
const NAV: Record<string, { to: string; labelKey: string }> = {
  users: { to: '/users', labelKey: 'nav.users' },
  roles: { to: '/roles', labelKey: 'nav.roles' },
};

/** الهيكل الرئيسي: شريط جانبي + رأس + منطقة المحتوى. */
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
    <div className="app">
      <aside className="sidebar">
        <div className="brand">🏛️ {t('appName')}</div>
        <nav>
          {(modules ?? [])
            .filter((m) => m.isEnabled && NAV[m.key])
            .map((m) => (
              <NavLink key={m.key} to={NAV[m.key].to} className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
                {t(NAV[m.key].labelKey)}
              </NavLink>
            ))}
          <div className="nav-sep" />
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
            {t('nav.settings')}
          </NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="muted">{user?.fullName} · {user?.roles.join(', ')}</span>
          <div className="topbar-actions">
            <button
              className="btn-ghost sm icon-only"
              onClick={toggleTheme}
              aria-label={t('common.toggleTheme')}
              title={t('common.toggleTheme')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="btn-ghost sm" onClick={toggleLang}>{t('common.language')}</button>
            <button className="link" onClick={onLogout}>{t('common.logout')}</button>
          </div>
        </header>
        <div className="content"><Outlet /></div>
      </div>
    </div>
  );
}
