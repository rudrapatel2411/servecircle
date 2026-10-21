import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineExclamationCircle,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { requestAuth, roleHome, saveSession } from '../../utils/authSession.js';
import './AuthPages.css';

const DEMO_ACCOUNTS = {
  customer: {
    token: 'demo-token-customer',
    user: {
      id: '6a5f4c90437c4810f45fe0e9',
      _id: '6a5f4c90437c4810f45fe0e9',
      name: 'Rudra Shah',
      email: 'rudra@test.com',
      phone: '9876543210',
      role: 'customer',
      subscription: 'gold',
      walletBalance: 2450,
    },
  },
  worker: {
    token: 'demo-token-worker',
    user: {
      id: '6a5f4c90437c4810f45fe0eb',
      _id: '6a5f4c90437c4810f45fe0eb',
      name: 'Ramesh Kumar',
      email: 'ramesh@test.com',
      phone: '9876500001',
      role: 'worker',
      skills: ['Electrician', 'AC Repair & Service'],
      serviceCategory: 'Home Repairs',
      workerStatus: 'approved_senior',
      isVerified: true,
      walletBalance: 3200,
    },
  },
  admin: {
    token: 'demo-token-admin',
    user: {
      id: '6a5f4c90437c4810f45fe0e7',
      _id: '6a5f4c90437c4810f45fe0e7',
      name: 'Admin',
      email: 'admin@servecircle.in',
      phone: '9999900000',
      role: 'admin',
      isVerified: true,
    },
  },
  b2b: {
    token: 'demo-token-b2b',
    user: {
      id: '6a5f4c90437c4810f45fe0ee',
      _id: '6a5f4c90437c4810f45fe0ee',
      name: 'Green Valley Manager',
      email: 'gv@test.com',
      phone: '9876600001',
      role: 'b2b',
      companyName: 'Green Valley Society',
    },
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(
    searchParams.get('expired') === 'true'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setSessionExpiredNotice(true);
    };
    window.addEventListener('servecircle:session-expired', handleExpired);
    return () => window.removeEventListener('servecircle:session-expired', handleExpired);
  }, []);

  const handleQuickAccess = (panelRole) => {
    const demoSession = DEMO_ACCOUNTS[panelRole];
    if (demoSession) {
      saveSession(demoSession);
    }
    navigate(roleHome[panelRole] || `/${panelRole}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError(t('login.validationError', 'Email and password are required'));
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const data = await requestAuth('/auth/login', { email, password });
      if (data?.user?.role !== role) {
        throw new Error(`This account is not a ${role} account`);
      }
      saveSession({ token: data.token, user: data.user });
      navigate(roleHome[data.user.role], { replace: true });
    } catch (submitError) {
      setError(submitError.message || t('login.error', 'Unable to sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <section className="auth-panel">
          {sessionExpiredNotice && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <HiOutlineExclamationCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>Your session has expired. Please sign in again to continue.</span>
            </div>
          )}
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
                <button type="button" onClick={() => setRole('customer')} className={`btn ${role === 'customer' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'customer' ? 'var(--primary-600)' : '#f8fafc', color: role === 'customer' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'customer' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}><HiOutlineUser style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {t('login.roleCustomer', 'Customer')}</button>
                <button type="button" onClick={() => setRole('worker')} className={`btn ${role === 'worker' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'worker' ? 'var(--primary-600)' : '#f8fafc', color: role === 'worker' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'worker' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}><HiOutlineBriefcase style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {t('login.roleWorker', 'Worker')}</button>
                <button type="button" onClick={() => setRole('admin')} className={`btn ${role === 'admin' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'admin' ? 'var(--primary-600)' : '#f8fafc', color: role === 'admin' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'admin' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}><HiOutlineShieldCheck style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {t('login.roleAdmin', 'Admin')}</button>
                <button type="button" onClick={() => setRole('b2b')} className={`btn ${role === 'b2b' ? 'btn-primary' : ''}`} style={{ padding: '10px', fontSize: '0.85rem', background: role === 'b2b' ? 'var(--primary-600)' : '#f8fafc', color: role === 'b2b' ? 'white' : 'var(--navy-800)', border: `1px solid ${role === 'b2b' ? 'var(--primary-600)' : 'var(--gray-300)'}` }}><HiOutlineBuildingOffice2 style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {t('login.roleB2b', 'B2B Partner')}</button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-form-footer">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('login.signingIn', 'Signing in...') : t('login.continueBtn', 'Continue')}
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
            <button
              type="button"
              className="auth-role-card"
              onClick={() => handleQuickAccess('customer')}
              style={{ textAlign: 'left', background: 'none', border: '1px solid var(--gray-200)', cursor: 'pointer', width: '100%' }}
            >
              <div className="auth-role-head"><span className="auth-role-name">{t('login.customerPanel', 'Customer Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.customerPanelDesc', 'Book services, track jobs, and manage wallet.')}</p>
            </button>
            <button
              type="button"
              className="auth-role-card"
              onClick={() => handleQuickAccess('worker')}
              style={{ textAlign: 'left', background: 'none', border: '1px solid var(--gray-200)', cursor: 'pointer', width: '100%' }}
            >
              <div className="auth-role-head"><span className="auth-role-name">{t('login.workerPanel', 'Worker Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.workerPanelDesc', 'Accept jobs, manage schedule, and track earnings.')}</p>
            </button>
            <button
              type="button"
              className="auth-role-card"
              onClick={() => handleQuickAccess('admin')}
              style={{ textAlign: 'left', background: 'none', border: '1px solid var(--gray-200)', cursor: 'pointer', width: '100%' }}
            >
              <div className="auth-role-head"><span className="auth-role-name">{t('login.adminPanel', 'Admin Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.adminPanelDesc', 'Operate bookings, analytics, complaints, and partners.')}</p>
            </button>
            <button
              type="button"
              className="auth-role-card"
              onClick={() => handleQuickAccess('b2b')}
              style={{ textAlign: 'left', background: 'none', border: '1px solid var(--gray-200)', cursor: 'pointer', width: '100%' }}
            >
              <div className="auth-role-head"><span className="auth-role-name">{t('login.b2bPanel', 'B2B Panel')}</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">{t('login.b2bPanelDesc', 'Handle contracts, team accounts, and invoices.')}</p>
            </button>
          </div>
          <p className="auth-note">
            {t('login.authNote', 'Sign in uses your ServeCircle account and opens the matching role panel.')}
          </p>
        </aside>
      </div>
    </div>
  );
};

export default LoginPage;
