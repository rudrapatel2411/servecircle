import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineBanknotes,
  HiOutlineClipboardDocumentCheck,
  HiOutlineTrophy,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineShieldCheck,
  HiOutlinePlayCircle,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineAcademicCap,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import WorkerIDCardModal from '../../components/WorkerIDCardModal';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, respondToJobRequest } from './workerApi';
import { formatInr, isSameDay } from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';



const WorkerDashboard = () => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated, workerStatus, workerTier, signIn, authError, authLoading } = useWorkerAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  const loadJobs = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorkerJobs(token);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Could not load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const pendingJobs = useMemo(() => jobs.filter((job) => job.status === 'pending'), [jobs]);
  const todayJobs = useMemo(
    () => jobs.filter((job) => job.status !== 'completed' && job.status !== 'cancelled' && isSameDay(job.scheduledDate)),
    [jobs]
  );

  const completedJobs = useMemo(() => jobs.filter((job) => job.status === 'completed'), [jobs]);
  
  const weeklyEarnings = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    return completedJobs
      .filter((job) => new Date(job.scheduledDate) >= weekAgo && new Date(job.scheduledDate) <= now)
      .reduce((sum, job) => sum + (job.amount || 0), 0);
  }, [completedJobs]);

  const stats = [
    { icon: <HiOutlineBriefcase />, value: String(todayJobs.length), label: t('worker.todayJobs', 'Today\'s Jobs'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineBanknotes />, value: formatInr(weeklyEarnings), label: t('worker.weeklyEarnings', 'Weekly Earnings'), color: '#3b7dc1', bg: '#e1ebf5' },
    { icon: <HiOutlineClipboardDocumentCheck />, value: String(pendingJobs.length), label: t('worker.pendingRequests', 'Pending Requests'), color: '#f59e0b', bg: '#fef3c7' },
    { icon: <HiOutlineTrophy />, value: `${completedJobs.length}/50`, label: t('worker.proBadge', 'Pro Badge'), color: '#8b5cf6', bg: '#ede9fe' },
  ];

  const handleRespond = async (bookingId, action) => {
    if (!token) return;
    setActionLoading(`${bookingId}-${action}`);
    setError('');
    try {
      await respondToJobRequest(token, bookingId, action);
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  // Derive tier info from useWorkerAuth (workerTier is computed there based on workerStatus)
  const tier = workerTier || { label: 'Junior Pro', color: '#2563eb', bg: '#dbeafe', emoji: '⭐', canSoloJob: true };
  const isRookie = workerStatus === 'approved_rookie';
  const isSenior = workerStatus === 'approved_senior';
  // Shadow jobs done: from user profile in real app
  const shadowJobsDone = user?.shadowJobsDone ?? 8;
  const shadowJobsTarget = 15;

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} currentUser={user} workerStatus={workerStatus} />;
  }

  return (
    <div className="page-content worker-page-content" style={{ paddingBottom: '100px' }}>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div style={{
          background: 'linear-gradient(135deg, #422006, #92400e)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'white',
          fontSize: '0.82rem',
        }}>
          <span style={{ fontSize: '1rem' }}>🔧</span>
          <span><strong>Demo Mode:</strong> Showing mock data. Login with <code style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '4px' }}>ramesh@test.com / test123</code> to use real data.</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {t('common.welcome', 'Welcome')}, {user?.name || 'Worker'}
            <span style={{ background: tier.bg, color: tier.color, fontSize: '0.7rem', padding: '3px 12px', borderRadius: '100px', fontWeight: 800, letterSpacing: '0.04em' }}>
              {tier.emoji} {tier.label}
            </span>
          </h1>
          <p className="page-subtitle">You have {pendingJobs.length} new job requests waiting for you.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowIdCardModal(true)}>
            🪪 View ID Card
          </button>
          <Link to="/worker/jobs" className="btn btn-primary">Open Job Queue</Link>
        </div>
      </div>

      {/* ===== TIER STATUS CARD ===== */}
      {isRookie && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          marginBottom: '16px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineAcademicCap style={{ fontSize: '1.8rem', opacity: 0.9 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🎓 Rookie Mode — Shadow Training Active</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>You will be sent with a Senior Pro for your first {shadowJobsTarget} jobs. Complete them to unlock Solo Jobs.</div>
            </div>
          </div>
          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.9, marginBottom: '4px' }}>
              <span>Shadow Jobs Completed</span>
              <span>{shadowJobsDone} / {shadowJobsTarget}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '100px', height: '8px' }}>
              <div style={{
                background: '#4ade80',
                borderRadius: '100px',
                height: '8px',
                width: `${(shadowJobsDone / shadowJobsTarget) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', opacity: 0.85, alignItems: 'center' }}>
            <HiOutlineLockClosed style={{ fontSize: '0.9rem' }} />
            <span>Solo jobs are locked until training is complete + ServeCircle Hub Interview passed.</span>
          </div>
        </div>
      )}

      {!isRookie && !isSenior && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem',
          color: '#1e40af',
        }}>
          <HiOutlineLockOpen style={{ fontSize: '1.4rem', flexShrink: 0 }} />
          <div>
            <strong>⭐ Junior Pro — Solo Jobs Unlocked!</strong>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>Complete 50 jobs to reach Senior Pro status and earn a bonus on each job + trainee bonus.</div>
          </div>
          <div style={{ marginLeft: 'auto', fontWeight: 800, color: '#3b82f6', fontSize: '0.9rem' }}>{completedJobs.length}/50</div>
        </div>
      )}

      {isSenior && (
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          fontSize: '0.85rem',
        }}>
          <HiOutlineTrophy style={{ fontSize: '1.6rem', flexShrink: 0 }} />
          <div>
            <strong>🏆 Senior Pro — Top Tier!</strong>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>You can now mentor Rookies and earn ₹50 extra per shadow job. Keep your rating above 4.5.</div>
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: '#fecaca', color: '#991b1b', padding: '16px' }}>
          {error}
        </div>
      )}

      {/* --- WOMEN EMPOWERMENT HUD --- */}
      <div className="empowerment-card">
        <div className="empowerment-content">
          <span className="empowerment-tag">Women Empowerment Initiative</span>
          <h3>Verified & Safe Workplaces 🛡️</h3>
          <p>
            You are enrolled in our safe zone program. You will only receive job requests from Aadhar-verified customers, ensuring 100% safety and dignity. Perfect for home tutors, beauticians, and tailors.
          </p>
          <Link to="/worker/jobs?filter=safe" className="btn" style={{ background: 'white', color: '#be185d', fontWeight: 800 }}>
            View Safe Zone Jobs
          </Link>
        </div>
        <HiOutlineHeart className="empowerment-icon-bg" />
      </div>

      {loading ? (
        <div className="chart-placeholder">Loading dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- WORKER GROWTH PATH (PDF Page 14) --- */}
      <div className="dash-section" style={{ margin: 0 }}>
        <h3 className="dash-section-title" style={{ marginBottom: 0 }}>Your Growth Journey</h3>
        <p className="page-subtitle" style={{ marginBottom: '16px' }}>Complete jobs to unlock higher earnings and zero commission slots.</p>
        
        <div className="worker-stepper">
          <div className={`stepper-item ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}`}>
            <div className="stepper-icon"><HiOutlinePlayCircle /></div>
            <div className="stepper-label">Free Training</div>
            <div className="stepper-sub">Govt Certified</div>
          </div>
          <div className={`stepper-item ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}`}>
            <div className="stepper-icon"><HiOutlineBriefcase /></div>
            <div className="stepper-label">First 5 Jobs</div>
            <div className="stepper-sub">0% Commission</div>
          </div>
          <div className={`stepper-item ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}`}>
            <div className="stepper-icon"><HiOutlineStar /></div>
            <div className="stepper-label">Reviews</div>
            <div className="stepper-sub">Build Portfolio</div>
          </div>
          <div className={`stepper-item ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : ''}`}>
            <div className="stepper-icon"><HiOutlineShieldCheck /></div>
            <div className="stepper-label">Pro Badge</div>
            <div className="stepper-sub">50 Jobs</div>
          </div>
          <div className={`stepper-item ${currentStep >= 5 ? (currentStep === 5 ? 'active' : 'completed') : ''}`}>
            <div className="stepper-icon"><HiOutlineSparkles /></div>
            <div className="stepper-label">Premium Listing</div>
            <div className="stepper-sub">Top Visibility</div>
          </div>
        </div>
      </div>

      <div className="dash-section" style={{ margin: 0 }}>
        <div className="dash-section-header">
          <h3 className="dash-section-title">{t('worker.jobRequests', 'Pending Job Requests')}</h3>
          <Link to="/worker/jobs" className="dash-view-all">{t('common.viewAll', 'View All')} +</Link>
        </div>

        {pendingJobs.length === 0 && (
          <div className="card">No pending requests right now.</div>
        )}

        {pendingJobs.slice(0, 3).map((job) => (
          <div key={job._id} className="job-card">
            <div className="job-info">
              <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{job.service}</h4>
              <div className="job-meta">
                <span><HiOutlineMapPin /> {job.address}</span>
                <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
                <span style={{ color: '#3b7dc1', fontWeight: 800 }}><HiOutlineCurrencyRupee /> {formatInr(job.amount)}</span>
              </div>
            </div>
            <div className="worker-action-buttons">
              <button
                className="btn btn-primary"
                onClick={() => handleRespond(job._id, 'accept')}
                disabled={actionLoading === `${job._id}-accept`}
              >
                {actionLoading === `${job._id}-accept` ? '...' : t('worker.accept', 'Accept Job')}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleRespond(job._id, 'reject')}
                disabled={actionLoading === `${job._id}-reject`}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                {actionLoading === `${job._id}-reject` ? '...' : t('worker.reject', 'Decline')}
              </button>
            </div>
          </div>
        ))}
      </div>



      {showIdCardModal && (
        <WorkerIDCardModal
          worker={user}
          onClose={() => setShowIdCardModal(false)}
        />
      )}
    </div>
  );
};

export default WorkerDashboard;
