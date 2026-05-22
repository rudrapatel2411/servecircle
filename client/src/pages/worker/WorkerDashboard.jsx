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
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, respondToJobRequest } from './workerApi';
import { formatInr, isSameDay } from './workerHelpers';
import '../Dashboard.css';

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

  const proProgress = Math.min(100, Math.round((completedJobs.length / 50) * 100));

  const stats = [
    {
      icon: <HiOutlineBriefcase />,
      value: String(todayJobs.length),
      label: t('worker.todayJobs'),
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      icon: <HiOutlineBanknotes />,
      value: formatInr(weeklyEarnings),
      label: t('worker.weeklyEarnings'),
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      icon: <HiOutlineClipboardDocumentCheck />,
      value: String(pendingJobs.length),
      label: t('worker.pendingRequests'),
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      icon: <HiOutlineTrophy />,
      value: `${completedJobs.length}/50`,
      label: t('worker.proBadge'),
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
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

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} />;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('common.welcome')}, {user?.name || 'Worker'}</h1>
          <p className="page-subtitle">You have {pendingJobs.length} pending job requests.</p>
        </div>
        <Link to="/worker/jobs" className="btn btn-primary">Open Job Queue</Link>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 20, borderColor: '#fecaca', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="chart-placeholder" style={{ marginBottom: 24 }}>Loading dashboard...</div>
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

      <div className="dash-section">
        <h3 className="dash-section-title">{t('worker.proBadge')}</h3>
        <div className="card" style={{ maxWidth: 560 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: 8 }}>
            {completedJobs.length} of 50 jobs completed to earn{' '}
            <strong style={{ color: 'var(--primary-600)' }}>ServeCircle Verified Pro Badge</strong>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${proProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h3 className="dash-section-title">{t('worker.jobRequests')}</h3>
          <Link to="/worker/jobs" className="dash-view-all">{t('common.viewAll')} +</Link>
        </div>

        {pendingJobs.length === 0 && (
          <div className="card">No pending requests right now.</div>
        )}

        {pendingJobs.slice(0, 3).map((job) => (
          <div key={job._id} className="job-card">
            <div className="job-info">
              <h4>{job.service}</h4>
              <div className="job-meta">
                <span><HiOutlineMapPin /> {job.address}</span>
                <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
                <span><HiOutlineCurrencyRupee /> {formatInr(job.amount)}</span>
              </div>
            </div>
            <div className="job-actions">
              <button
                className="btn-accept"
                onClick={() => handleRespond(job._id, 'accept')}
                disabled={actionLoading === `${job._id}-accept`}
              >
                {actionLoading === `${job._id}-accept` ? '...' : t('worker.accept')}
              </button>
              <button
                className="btn-reject"
                onClick={() => handleRespond(job._id, 'reject')}
                disabled={actionLoading === `${job._id}-reject`}
              >
                {actionLoading === `${job._id}-reject` ? '...' : t('worker.reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerDashboard;
