import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { LoginPage } from '../modules/auth/LoginPage';
import { RolesPage } from '../modules/roles/RolesPage';
import { OrgUnitsPage } from '../modules/orgunits/OrgUnitsPage';
import { UsersPage } from '../modules/users/UsersPage';
import { SettingsPage } from '../modules/settings/SettingsPage';
import { SETTINGS_SECTIONS } from '../modules/settings/settings.config';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { NavGuard } from '../components/NavGuard';
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
      { path: 'users', element: <NavGuard navKey="users"><UsersPage /></NavGuard> },
      { path: 'roles', element: <NavGuard navKey="roles"><RolesPage /></NavGuard> },
      { path: 'org-units', element: <NavGuard navKey="org-units"><OrgUnitsPage /></NavGuard> },
      {
        path: 'guidance',
        children: [
          { index: true, element: <Navigate to="/guidance/sections" replace /> },
          { path: 'sections', element: <NavGuard navKey="guidance-sections"><PlaceholderPage titleKey="nav.guidance.sections" descKey="guidance.sectionsDesc" /></NavGuard> },
          { path: 'schools', element: <NavGuard navKey="guidance-schools"><PlaceholderPage titleKey="nav.guidance.schools" descKey="guidance.schoolsDesc" /></NavGuard> },
          { path: 'coordinators', element: <NavGuard navKey="guidance-coordinators"><PlaceholderPage titleKey="nav.guidance.coordinators" descKey="guidance.coordinatorsDesc" /></NavGuard> },
        ],
      },
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
