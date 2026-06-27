import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from './auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

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
    <main className="grid min-h-screen place-items-center bg-bg p-6">
      <Card className="w-[360px] max-w-full p-8 shadow-xl">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent px-3 py-1 text-xs text-accent">
            🏛️ {t('appName')}
          </span>
          <h1 className="mt-1 text-xl font-semibold">{t('auth.title')}</h1>
          <label className="flex flex-col gap-1.5 text-[0.8125rem] text-muted">
            {t('auth.email')}
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5 text-[0.8125rem] text-muted">
            {t('auth.password')}
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="text-[0.8125rem] text-danger">{error}</p>}
          <Button type="submit" disabled={busy} className="mt-1 w-full">
            {busy ? '…' : t('auth.submit')}
          </Button>
        </form>
      </Card>
    </main>
  );
}
