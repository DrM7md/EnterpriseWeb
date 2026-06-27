import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { LoginPage } from '../modules/auth/LoginPage';
import { RolesPage } from '../modules/roles/RolesPage';
import { UsersPage } from '../modules/users/UsersPage';
import { SettingsPage } from '../modules/settings/SettingsPage';
import { SETTINGS_SECTIONS } from '../modules/settings/settings.config';
import { useAuthStore } from '../store/authStore';

/** يحرس المسارات الخاصّة: غير المُصادق يُعاد للدخول. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/users" replace /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'roles', element: <RolesPage /> },
      {
        path: 'settings',
        children: [
          { index: true, element: <SettingsPage /> },
          ...SETTINGS_SECTIONS.map((s) => ({ path: s.key, element: s.element })),
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
