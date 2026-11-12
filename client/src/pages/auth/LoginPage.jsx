import { useEffect, useState, useMemo } from 'react';
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
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { requestAuth, roleHome, saveSession } from '../../utils/authSession.js';
import './AuthPages.css';

// ── 5 Customer Accounts ─────────────────────────────────────────────
const CUSTOMER_OPTIONS = [
  { name: 'Rahul Shah', email: 'rahul.shah@gmail.com', password: 'customer123' },
  { name: 'Priya Patel', email: 'priya.patel@gmail.com', password: 'customer123' },
  { name: 'Amit Mehta', email: 'amit.mehta@gmail.com', password: 'customer123' },
  { name: 'Neha Desai', email: 'neha.desai@gmail.com', password: 'customer123' },
  { name: 'Krunal Joshi', email: 'krunal.joshi@gmail.com', password: 'customer123' },
];

// ── 19 Worker Accounts (All 19 Services) ────────────────────────────
const WORKER_OPTIONS = [
  { num: 1, service: 'Home Repairs', email: 'homerepairs.worker@gmail.com', password: 'worker123' },
  { num: 2, service: 'Vehicle Services', email: 'vehicleservices.worker@gmail.com', password: 'worker123' },
  { num: 3, service: 'Cleaning & Hygiene', email: 'cleaninghygiene.worker@gmail.com', password: 'worker123' },
  { num: 4, service: 'Home IT & Smart Devices', email: 'homeit.worker@gmail.com', password: 'worker123' },
  { num: 5, service: 'Care & Family', email: 'carefamily.worker@gmail.com', password: 'worker123' },
  { num: 6, service: 'Utility & Daily Help', email: 'dailyhelp.worker@gmail.com', password: 'worker123' },
  { num: 7, service: 'Learning & Support', email: 'learningsupport.worker@gmail.com', password: 'worker123' },
  { num: 8, service: 'Property & Society', email: 'propertysociety.worker@gmail.com', password: 'worker123' },
  { num: 9, service: 'Seasonal & Festive', email: 'seasonalworker@gmail.com', password: 'worker123' },
  { num: 10, service: 'Furniture & Decor', email: 'furnituredecor.worker@gmail.com', password: 'worker123' },
  { num: 11, service: 'Garden & Outdoor', email: 'gardenoutdoor.worker@gmail.com', password: 'worker123' },
  { num: 12, service: 'Packers & Movers', email: 'packersmovers.worker@gmail.com', password: 'worker123' },
  { num: 13, service: 'Health & Wellness', email: 'healthwellness.worker@gmail.com', password: 'worker123' },
  { num: 14, service: 'Kids & Elderly Care', email: 'familycare.worker@gmail.com', password: 'worker123' },
  { num: 15, service: 'Pet Services', email: 'petservices.worker@gmail.com', password: 'worker123' },
  { num: 16, service: 'Food Kitchen', email: 'foodkitchen.worker@gmail.com', password: 'worker123' },
  { num: 17, service: 'Travel & Commute', email: 'travelcommute.worker@gmail.com', password: 'worker123' },
  { num: 18, service: 'Society Management', email: 'societymanagement.worker@gmail.com', password: 'worker123' },
  { num: 19, service: 'Events Hub', email: 'eventshub.worker@gmail.com', password: 'worker123' },
];

const ADMIN_OPTION = { name: 'Admin', email: 'admin2@gmail.com', password: 'Admin@123' };
const B2B_OPTION = { name: 'B2B Partner', email: 'b2b@gmail.com', password: 'B2B@123' };

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(
    searchParams.get('expired') === 'true'
  );

  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState(CUSTOMER_OPTIONS[0].email);
  const [password, setPassword] = useState(CUSTOMER_OPTIONS[0].password);
  const [selectedWorkerId, setSelectedWorkerId] = useState(WORKER_OPTIONS[0].email);
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMER_OPTIONS[0].email);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setSessionExpiredNotice(true);
    };
    window.addEventListener('servecircle:session-expired', handleExpired);
    return () => window.removeEventListener('servecircle:session-expired', handleExpired);
  }, []);

  // When panel changes, select initial credential option for that panel
  const handleSelectPanel = (panelRole) => {
    setRole(panelRole);
    setError('');
    if (panelRole === 'customer') {
      const c = CUSTOMER_OPTIONS.find((item) => item.email === selectedCustomerId) || CUSTOMER_OPTIONS[0];
      setEmail(c.email);
      setPassword(c.password);
    } else if (panelRole === 'worker') {
      const w = WORKER_OPTIONS.find((item) => item.email === selectedWorkerId) || WORKER_OPTIONS[0];
      setEmail(w.email);
      setPassword(w.password);
    } else if (panelRole === 'admin') {
      setEmail(ADMIN_OPTION.email);
      setPassword(ADMIN_OPTION.password);
    } else if (panelRole === 'b2b') {
      setEmail(B2B_OPTION.email);
      setPassword(B2B_OPTION.password);
    }
  };

  const handleCustomerOptionChange = (selectedEmail) => {
    setSelectedCustomerId(selectedEmail);
    const item = CUSTOMER_OPTIONS.find((c) => c.email === selectedEmail);
    if (item) {
      setEmail(item.email);
      setPassword(item.password);
    }
  };

  const handleWorkerOptionChange = (selectedEmail) => {
    setSelectedWorkerId(selectedEmail);
    const item = WORKER_OPTIONS.find((w) => w.email === selectedEmail);
    if (item) {
      setEmail(item.email);
      setPassword(item.password);
    }
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
      const userRole = data?.user?.role || role;
      saveSession({ token: data.token, user: data.user });
      const redirectTo = searchParams.get('redirect');
      if (redirectTo && redirectTo.startsWith('/')) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(roleHome[userRole] || `/${userRole}`, { replace: true });
      }
    } catch (submitError) {
      setError(submitError.message || t('login.error', 'Unable to sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">

        {/* ── Left: Login Form with Dynamic ID Options ── */}
        <section className="auth-panel">
          {sessionExpiredNotice && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
              padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <HiOutlineExclamationCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>Your session has expired. Please sign in again to continue.</span>
            </div>
          )}

          <span className="auth-kicker">{t('login.kicker', 'ServeCircle Access')}</span>
          <h1 className="auth-title">{t('login.title', 'Sign In')}</h1>
          <p className="auth-subtitle">{t('login.subtitle', 'Select a panel to pick your pre-configured role account, or enter custom credentials.')}</p>

          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {/* Panel Selector (Customer, Worker, Admin, B2B) */}
            <div className="input-group">
              <label style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{t('login.selectPanel', '1. Select Panel Role')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectPanel('customer')}
                  className={`btn ${role === 'customer' ? 'btn-primary' : ''}`}
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: role === 'customer' ? 'var(--primary-600)' : '#f8fafc',
                    color: role === 'customer' ? 'white' : 'var(--navy-800)',
                    border: `1.5px solid ${role === 'customer' ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <HiOutlineUser /> Customer Panel
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPanel('worker')}
                  className={`btn ${role === 'worker' ? 'btn-primary' : ''}`}
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: role === 'worker' ? 'var(--primary-600)' : '#f8fafc',
                    color: role === 'worker' ? 'white' : 'var(--navy-800)',
                    border: `1.5px solid ${role === 'worker' ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <HiOutlineBriefcase /> Worker Panel
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPanel('admin')}
                  className={`btn ${role === 'admin' ? 'btn-primary' : ''}`}
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: role === 'admin' ? 'var(--primary-600)' : '#f8fafc',
                    color: role === 'admin' ? 'white' : 'var(--navy-800)',
                    border: `1.5px solid ${role === 'admin' ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <HiOutlineShieldCheck /> Admin Panel
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPanel('b2b')}
                  className={`btn ${role === 'b2b' ? 'btn-primary' : ''}`}
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: role === 'b2b' ? 'var(--primary-600)' : '#f8fafc',
                    color: role === 'b2b' ? 'white' : 'var(--navy-800)',
                    border: `1.5px solid ${role === 'b2b' ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <HiOutlineBuildingOffice2 /> B2B Panel
                </button>
              </div>
            </div>

            {/* ── CUSTOMER ID OPTIONS (5 Customers) ── */}
            {role === 'customer' && (
              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', margin: 0 }}>
                    Select Customer Account (5 Options):
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700 }}>Pass: customer123</span>
                </div>
                <select
                  className="input-field"
                  value={email}
                  onChange={(e) => handleCustomerOptionChange(e.target.value)}
                  style={{ background: 'white', fontWeight: 700, borderColor: '#93c5fd' }}
                >
                  {CUSTOMER_OPTIONS.map((c, i) => (
                    <option key={c.email} value={c.email}>
                      Customer {i + 1}: {c.name} ({c.email})
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {CUSTOMER_OPTIONS.map((c) => (
                    <button
                      key={c.email}
                      type="button"
                      onClick={() => handleCustomerOptionChange(c.email)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: `1px solid ${email === c.email ? '#2563eb' : '#cbd5e1'}`,
                        background: email === c.email ? '#2563eb' : 'white',
                        color: email === c.email ? 'white' : '#1e293b',
                        cursor: 'pointer',
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── WORKER ID OPTIONS (All 19 Services) ── */}
            {role === 'worker' && (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                    Select Worker Service ID (19 Services):
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 700 }}>Pass: worker123</span>
                </div>
                <select
                  className="input-field"
                  value={email}
                  onChange={(e) => handleWorkerOptionChange(e.target.value)}
                  style={{ background: 'white', fontWeight: 700, borderColor: '#86efac' }}
                >
                  {WORKER_OPTIONS.map((w) => (
                    <option key={w.email} value={w.email}>
                      {w.num}. {w.service} — {w.email}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                  Selected: <strong>{WORKER_OPTIONS.find((w) => w.email === email)?.service}</strong> ({email})
                </div>
              </div>
            )}

            {/* ── ADMIN ID OPTION ── */}
            {role === 'admin' && (
              <div style={{
                background: '#faf5ff',
                border: '1.5px solid #ddd6fe',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#581c87',
              }}>
                <strong>Admin ID:</strong> <code>admin2@gmail.com</code> | <strong>Password:</strong> <code>Admin@123</code>
              </div>
            )}

            {/* ── B2B ID OPTION ── */}
            {role === 'b2b' && (
              <div style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#78350f',
              }}>
                <strong>B2B Partner ID:</strong> <code>b2b@gmail.com</code> | <strong>Password:</strong> <code>B2B@123</code>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="login-email"><HiOutlineEnvelope style={{ verticalAlign: 'middle' }} /> {t('login.email', 'Email Address')}</label>
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

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-form-footer">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('login.signingIn', 'Signing in...') : 'Sign In to ' + (role.charAt(0).toUpperCase() + role.slice(1)) + ' Panel'}
                <HiOutlineArrowRight />
              </button>
              <span className="auth-hint">
                {t('login.newHere', 'New here? ')} <Link to="/register" className="auth-alt-link">{t('login.createAccount', 'Create an Account')}</Link>
              </span>
            </div>
          </form>
        </section>

        {/* ── Right: Quick Overview of 19 Services & Credentials ── */}
        <aside className="auth-panel">
          <h2 className="auth-side-title">19 Worker Services Quick Index</h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
            Direct email IDs for all 19 service domains (Password: <code style={{ color: '#059669', fontWeight: 800 }}>worker123</code>):
          </p>
          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
            {WORKER_OPTIONS.map((w) => (
              <div
                key={w.email}
                onClick={() => {
                  setRole('worker');
                  handleWorkerOptionChange(w.email);
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: email === w.email ? '#dcfce7' : '#f8fafc',
                  border: `1px solid ${email === w.email ? '#86efac' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ color: '#1e293b' }}>{w.num}. {w.service}</strong>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>{w.email}</span>
                </div>
                {email === w.email && <HiOutlineCheckCircle style={{ color: '#16a34a', fontSize: '1rem' }} />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.74rem', color: '#1e40af' }}>
            💡 <strong>1-Click Selection</strong>: Click any worker service above or select from the dropdown to log into that worker's dashboard instantly.
          </div>
        </aside>

      </div>
    </div>
  );
};

export default LoginPage;
