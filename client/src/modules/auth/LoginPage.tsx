import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from './auth.service';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('admin@ministry.gov');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await authService.login({ email, password });
      setSession(result);
      navigate('/users', { replace: true });
    } catch (err) {
      setError(err instanceof AxiosError && err.response?.status === 401
        ? t('errors.auth.invalid_credentials')
        : t('auth.connectError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <span className="badge">{t('appName')}</span>
        <h1>{t('auth.title')}</h1>
        <label className="field">
          <span>{t('auth.email')}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>{t('auth.password')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? '…' : t('auth.submit')}</button>
      </form>
    </main>
  );
}
