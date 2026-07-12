import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import './AuthPages.css';

const roleRoutes = {
  customer: '/customer',
  worker: '/worker',
  admin: '/admin',
  b2b: '/b2b',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError(t('login.validationError', 'Email and password are required'));
      return;
    }
    setError('');
    navigate(roleRoutes[role]);
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <section className="auth-panel">
          <span className="auth-kicker">{t('login.kicker', 'ServeCircle Access')}</span>
          <h1 className="auth-title">{t('login.title', 'Welcome back')}</h1>
          <p className="auth-subtitle">{t('login.subtitle', 'Sign in to access your panel and continue your workflow.')}</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-email"><HiOutlineEnvelope style={{ verticalAlign: 'middle' }} /> {t('login.email', 'Email')}</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="login-password"><HiOutlineLockClosed style={{ verticalAlign: 'middle' }} /> {t('login.password', 'Password')}</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder={t('login.enterPassword', 'Enter password')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="input-group">
              <label>{t('login.selectPanel', 'Select Panel Access')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setRole('customer')} className={`btn ${role === 'customer' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'customer' ? 'var(--primary-600)' : '#f8fafc', color: role === 'customer' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'customer' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}>{t('login.roleCustomer', '👤 Customer')}</button>
                <button type="button" onClick={() => setRole('worker')} className={`btn ${role === 'worker' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'worker' ? 'var(--primary-600)' : '#f8fafc', color: role === 'worker' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'worker' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}>{t('login.roleWorker', '👷 Worker')}</button>
                <button type="button" onClick={() => setRole('admin')} className={`btn ${role === 'admin' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'admin' ? 'var(--primary-600)' : '#f8fafc', color: role === 'admin' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'admin' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}>{t('login.roleAdmin', '🛡️ Admin')}</button>
                <button type="button" onClick={() => setRole('b2b')} className={`btn ${role === 'b2b' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'b2b' ? 'var(--primary-600)' : '#f8fafc', color: role === 'b2b' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'b2b' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}>{t('login.roleB2b', '🏢 B2B Partner')}</button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-form-footer">
              <button className="btn btn-primary" type="submit">
                {t('login.continueBtn', 'Continue')}
                <HiOutlineArrowRight />
              </button>
              <span className="auth-hint">
                {t('login.newHere', 'New here? ')} <Link to="/register" className="auth-alt-link">{t('login.createAccount', 'Create account')}</Link>
              </span>
            </div>
          </form>
        </section>

        <aside className="auth-panel">
          <h2 className="auth-side-title">{t('login.quickAccess', 'Quick panel access')}</h2>
          <div className="auth-role-grid">
            <Link className="auth-role-card" to="/customer">
              <div className="auth-role-head"><span className="auth-role-name">{t('login.customerPanel', 'Customer Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.customerPanelDesc', 'Book services, track jobs, and manage wallet.')}</p>
            </Link>
            <Link className="auth-role-card" to="/worker">
              <div className="auth-role-head"><span className="auth-role-name">{t('login.workerPanel', 'Worker Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.workerPanelDesc', 'Accept jobs, manage schedule, and track earnings.')}</p>
            </Link>
            <Link className="auth-role-card" to="/admin">
              <div className="auth-role-head"><span className="auth-role-name">{t('login.adminPanel', 'Admin Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.adminPanelDesc', 'Operate bookings, analytics, complaints, and partners.')}</p>
            </Link>
            <Link className="auth-role-card" to="/b2b">
              <div className="auth-role-head"><span className="auth-role-name">{t('login.b2bPanel', 'B2B Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.b2bPanelDesc', 'Handle contracts, team accounts, and invoices.')}</p>
            </Link>
          </div>
          <p className="auth-note">
            {t('login.demoNote', 'Demo mode: navigation is role-based UI access. Authentication APIs can be wired directly later.')}
          </p>
        </aside>
      </div>
    </div>
  );
};

export default LoginPage;
