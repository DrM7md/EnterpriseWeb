import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../modules/auth/auth.service';
import { useAuthStore } from '../store/authStore';

/** الهيكل الرئيسي: شريط جانبي + رأس + منطقة المحتوى. */
export function AppShell() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  const onLogout = async () => {
    if (refreshToken) await authService.logout(refreshToken).catch(() => undefined);
    clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app" dir="rtl">
      <aside className="sidebar">
        <div className="brand">🏛️ EWS</div>
        <nav>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>المستخدمون</NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="muted">{user?.fullName} · {user?.roles.join('، ')}</span>
          <button className="link" onClick={onLogout}>خروج</button>
        </header>
        <div className="content"><Outlet /></div>
      </div>
    </div>
  );
}
