import { useState } from 'react';
import '../Dashboard.css';
import { useTranslation } from 'react-i18next';

const WorkerAuthPrompt = ({ onSignIn, loading, error }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('ramesh@test.com');
  const [password, setPassword] = useState('test123');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError(t('workerAuth.emailReq', 'Email and password are required'));
      return;
    }

    try {
      await onSignIn(email, password);
    } catch {
      // Error is shown from parent state
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('workerAuth.workerPanel', 'Worker Panel')}</h1>
          <p className="page-subtitle">{t('workerAuth.workerSubtitle', 'Sign in to manage jobs, schedule, and earnings.')}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <h3 style={{ marginBottom: 8 }}>{t('workerAuth.workerLogin', 'Worker Login')}</h3>
        <p style={{ color: 'var(--gray-500)', marginBottom: 18, fontSize: '0.9rem' }}>
          {t('workerAuth.demoCreds', 'Demo credentials are prefilled from the seeded database.')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="worker-email">{t('workerAuth.emailLabel', 'Email')}</label>
            <input
              id="worker-email"
              className="input-field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="worker-password">{t('workerAuth.passwordLabel', 'Password')}</label>
            <input
              id="worker-password"
              className="input-field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {(formError || error) && (
            <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.88rem' }}>
              {formError || error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('workerAuth.signingIn', 'Signing in...') : t('workerAuth.signInWorker', 'Sign in as Worker')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerAuthPrompt;
