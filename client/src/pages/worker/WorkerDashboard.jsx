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
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, respondToJobRequest } from './workerApi';
import { formatInr, isSameDay } from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';



const WorkerDashboard = () => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated, signIn, authError, authLoading } = useWorkerAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

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

  // Determine current step for growth path (1 to 5)
  let currentStep = 1;
  if (completedJobs.length >= 1) currentStep = 2; // Completed first job
  if (completedJobs.length >= 10) currentStep = 3; // Got reviews
  if (completedJobs.length >= 50) currentStep = 4; // Pro Badge unlocked
  if (completedJobs.length >= 100) currentStep = 5; // Premium Listing unlocked

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} />;
  }

  return (
    <div className="page-content worker-page-content" style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('common.welcome', 'Welcome')}, {user?.name || 'Worker'}</h1>
          <p className="page-subtitle">You have {pendingJobs.length} new job requests waiting for you.</p>
        </div>
        <Link to="/worker/jobs" className="btn btn-primary">Open Job Queue</Link>
      </div>

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



    </div>
  );
};

export default WorkerDashboard;
