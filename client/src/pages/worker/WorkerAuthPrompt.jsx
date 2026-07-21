import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineUserPlus,
} from 'react-icons/hi2';
import '../Dashboard.css';
import { useTranslation } from 'react-i18next';

const STATUS_SCREENS = {
  pending_interview: {
    emoji: '📅',
    title: 'Application Received!',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
    message: 'Your registration is submitted. Please visit your nearest ServeCircle Hub/Office for the in-person interview and skill test. Our team will contact you on your registered number to schedule your slot.',
    steps: [
      '✅ Registration submitted successfully.',
      '⏳ Visit ServeCircle Hub with your Aadhar Card.',
      '🔒 Complete the practical skill interview.',
      '🚀 Get approved and start earning!',
    ],
  },
  interview_done: {
    emoji: '✅',
    title: 'Interview Completed!',
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#bfdbfe',
    message: 'You have completed the in-person interview. Our admin team is reviewing your profile. You will receive a notification once your account is activated. This usually takes less than 24 hours.',
    steps: [
      '✅ Registration submitted.',
      '✅ Hub interview completed.',
      '⏳ Waiting for admin approval...',
      '🚀 Account will be activated soon!',
    ],
  },
  rejected: {
    emoji: '❌',
    title: 'Application Not Approved',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    message: 'Unfortunately, your application was not approved at this time. Please contact ServeCircle support for more details. You may be able to reapply after 3 months.',
    steps: null,
  },
};

const WorkerAuthPrompt = ({ onSignIn, loading, error, currentUser, workerStatus }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // If user is logged in but not approved, show a status screen instead of login form
  if (currentUser && workerStatus && workerStatus !== 'approved_rookie' && workerStatus !== 'approved_junior' && workerStatus !== 'approved_senior') {
    const screen = STATUS_SCREENS[workerStatus];
    if (screen) {
      return (
        <div className="page-content">
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div style={{
              background: screen.bg,
              border: `2px solid ${screen.border}`,
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>{screen.emoji}</div>
              <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--navy-900)', marginBottom: '10px' }}>
                {screen.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--navy-600)', lineHeight: 1.7, marginBottom: '24px' }}>
                {screen.message}
              </p>

              {screen.steps && (
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                  {screen.steps.map((step, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: 'var(--navy-700)', padding: '4px 0', fontWeight: 600 }}>
                      {step}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="tel:1800123456" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                  📞 Call ServeCircle Support
                </a>
                <button
                  className="btn btn-outline"
                  onClick={() => { localStorage.removeItem('servecircle_worker_session'); window.location.reload(); }}
                  style={{ fontSize: '0.9rem' }}
                >
                  Logout
                </button>
              </div>

              {workerStatus === 'pending_interview' && currentUser && (
                <div style={{ marginTop: '20px', fontSize: '0.78rem', color: 'var(--navy-500)' }}>
                  Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
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
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Worker Panel</h1>
            <p className="page-subtitle">Sign in to manage your jobs, schedule, and earnings.</p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '6px', fontWeight: 800 }}>Worker Login</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '20px', fontSize: '0.88rem' }}>
            Sign in with your registered worker account credentials.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="worker-email">Email</label>
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
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.85rem', color: '#dc2626' }}>
                {formError || error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginBottom: '14px' }}>
              {loading ? 'Signing in...' : 'Sign in as Worker'} {!loading && <HiOutlineArrowRight style={{ marginLeft: '6px' }} />}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/worker-register" className="btn btn-outline" style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <HiOutlineUserPlus /> New Worker? Apply to Join
            </Link>
          </div>
        </div>

        {/* Info about the onboarding process */}
        <div style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', fontSize: '0.8rem', color: '#166534', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <HiOutlineShieldCheck style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Verification Required:</strong> Only workers who have completed the in-person interview at a ServeCircle Hub and been approved by our team can access this panel.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerAuthPrompt;
