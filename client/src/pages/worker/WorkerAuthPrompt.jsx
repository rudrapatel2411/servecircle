import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineNoSymbol,
  HiOutlineUserPlus,
  HiOutlinePhone,
} from 'react-icons/hi2';
import '../Dashboard.css';
import { useTranslation } from 'react-i18next';

const STATUS_SCREENS = {
  pending_interview: {
    icon: <HiOutlineClock size={40} />,
    title: 'Application Received',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    message: 'Your registration is submitted. Please visit your nearest ServeCircle Hub for the in-person interview and practical skill test. Our team will contact you to schedule your slot.',
    steps: [
      '1. Registration submitted successfully.',
      '2. Visit ServeCircle Hub with your Aadhaar Card.',
      '3. Complete the practical skill interview.',
      '4. Get approved and start receiving service requests.',
    ],
  },
  interview_done: {
    icon: <HiOutlineCheckCircle size={40} />,
    title: 'Interview Completed',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    message: 'You have completed the in-person interview. Our verification team is reviewing your profile. You will receive a notification once your account is activated.',
    steps: [
      '1. Registration submitted.',
      '2. Hub interview completed.',
      '3. Verification under review.',
      '4. Account will be activated shortly.',
    ],
  },
  rejected: {
    icon: <HiOutlineXCircle size={40} />,
    title: 'Application Not Approved',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    message: 'Your application was not approved at this time. Please contact ServeCircle support for more details.',
    steps: null,
  },
  suspended: {
    icon: <HiOutlineExclamationTriangle size={40} />,
    title: 'Account Suspended',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    message: 'Your worker account has been temporarily suspended. Please contact support to review compliance issues and restore standing.',
    steps: null,
  },
  blocked: {
    icon: <HiOutlineNoSymbol size={40} />,
    title: 'Account Blocked',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    message: 'Your worker account has been blocked due to policy violations. Please reach out to support if you believe this was an error.',
    steps: null,
  },
  expired: {
    icon: <HiOutlineClock size={40} />,
    title: 'Verification Expired',
    color: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0',
    message: 'Your verification credentials have expired. Please submit updated identification to renew your standing.',
    steps: null,
  },
};

const WorkerAuthPrompt = ({ onSignIn, loading, error, currentUser, workerStatus }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // If user is logged in but not approved, show a status screen instead of login form
  if (currentUser && workerStatus && !['approved_rookie', 'approved_junior', 'approved_senior', 'approved', 'active'].includes(workerStatus)) {
    const screen = STATUS_SCREENS[workerStatus] || {
      icon: <HiOutlineClock size={40} />,
      title: 'Application Under Review',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      message: `Your account status is "${workerStatus}". Our administration team is reviewing your profile.`,
      steps: null,
    };
    return (
      <div className="page-content">
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: screen.bg,
            border: `1px solid ${screen.border}`,
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            textAlign: 'center',
          }}>
            <div style={{ color: screen.color, display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              {screen.icon}
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy-900)', marginBottom: '10px' }}>
              {screen.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--navy-600)', lineHeight: 1.6, marginBottom: '24px' }}>
              {screen.message}
            </p>

            {screen.steps && (
              <div style={{ background: '#ffffff', border: '1px solid var(--navy-200)', borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'left', marginBottom: '24px' }}>
                {screen.steps.map((step, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: 'var(--navy-800)', padding: '5px 0', fontWeight: 500 }}>
                    {step}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:1800123456" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                <HiOutlinePhone style={{ marginRight: '6px' }} /> Call ServeCircle Support
              </a>
              <button
                className="btn btn-outline"
                onClick={() => {
                  localStorage.removeItem('servecircle_worker_session');
                  localStorage.removeItem('servecircle_session');
                  window.location.href = '/login';
                }}
                style={{ fontSize: '0.875rem' }}
              >
                Logout
              </button>
            </div>

            {workerStatus === 'pending_interview' && currentUser && (
              <div style={{ marginTop: '20px', fontSize: '0.8125rem', color: 'var(--navy-500)' }}>
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: Login form for workers
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    try {
      await onSignIn(email, password);
    } catch {
      // Error shown from parent state
    }
  };

  return (
    <div className="page-content">
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <div>
            <h1 className="page-title">Worker Panel</h1>
            <p className="page-subtitle">Sign in to manage your jobs, schedule, and earnings.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '6px', fontWeight: 700 }}>Worker Sign In</h3>
          <p style={{ color: 'var(--navy-500)', marginBottom: '20px', fontSize: '0.875rem' }}>
            Enter your registered service professional credentials.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="worker-email">Email Address</label>
              <input
                id="worker-email"
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="worker-password">Password</label>
              <input
                id="worker-password"
                className="input-field"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            {(formError || error) && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '14px', fontSize: '0.85rem', color: '#dc2626' }}>
                {formError || error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginBottom: '14px' }}>
              {loading ? 'Signing in...' : 'Sign In as Worker'} {!loading && <HiOutlineArrowRight style={{ marginLeft: '6px' }} />}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--navy-200)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/worker-register" className="btn btn-outline" style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <HiOutlineUserPlus /> New Worker? Apply to Join
            </Link>
          </div>
        </div>

        {/* Verification info note */}
        <div style={{ marginTop: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.8125rem', color: '#1e40af', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <HiOutlineShieldCheck style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Verification Policy:</strong> Only registered professionals who have completed the in-person skill interview and been approved by ServeCircle Administration can access active job dispatches.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerAuthPrompt;
