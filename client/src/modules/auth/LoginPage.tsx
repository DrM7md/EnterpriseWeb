import { useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from './auth.service';

export function LoginPage() {
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
        ? 'بيانات الدخول غير صحيحة.'
        : 'تعذّر الاتصال بالخادم.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell" dir="rtl">
      <form className="auth-card" onSubmit={onSubmit}>
        <span className="badge">Enterprise Web System</span>
        <h1>تسجيل الدخول</h1>
        <label className="field">
          <span>البريد الإلكتروني</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>كلمة المرور</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? '…' : 'دخول'}</button>
      </form>
    </main>
  );
}
