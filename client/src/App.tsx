import { useSystemInfo } from './modules/system/useSystemInfo';
import './App.css';

function App() {
  const { data, isLoading, isError, error, refetch } = useSystemInfo();

  return (
    <main className="shell" dir="rtl" lang="ar">
      <header className="hero">
        <span className="badge">Phase 0 · التأسيس</span>
        <h1>Enterprise Web System</h1>
        <p>هيكل مؤسسي end-to-end يثبت المعمارية (Clean Architecture · React · TanStack).</p>
      </header>

      <section className="card">
        <h2>اتصال الواجهة بالـ API</h2>

        {isLoading && <p className="state">⏳ جارٍ الاتصال بالخادم…</p>}

        {isError && (
          <div className="state error">
            <p>تعذّر الوصول للـ API.</p>
            <code>{error?.message}</code>
            <button onClick={() => refetch()}>إعادة المحاولة</button>
          </div>
        )}

        {data && (
          <dl className="info">
            <div><dt>النظام</dt><dd>{data.name}</dd></div>
            <div><dt>الإصدار</dt><dd>{data.version}</dd></div>
            <div><dt>البيئة</dt><dd>{data.environment}</dd></div>
            <div><dt>توقيت الخادم (UTC)</dt><dd>{new Date(data.serverTimeUtc).toLocaleString('ar')}</dd></div>
            <div><dt>اللغات المدعومة</dt><dd>{data.supportedLanguages.join('، ')}</dd></div>
          </dl>
        )}
      </section>
    </main>
  );
}

export default App;
