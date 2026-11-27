import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineBanknotes,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerActivity } from './workerApi';
import { formatInr } from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';

function formatDuration(totalSeconds = 0) {
  const sec = Math.max(0, Number(totalSeconds) || 0);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const rem = sec % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${rem}s`;
  return `${rem}s`;
}

function formatDateTime(value) {
  if (!value) return 'Active now';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}

const WorkerActivity = () => {
  const { token, isAuthenticated, signIn, authError, authLoading } = useWorkerAuth();

  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalDurationSeconds: 0,
    totalJobsCompleted: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadActivity = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorkerActivity(token);
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
      setSummary(
        data?.summary || {
          totalSessions: 0,
          totalDurationSeconds: 0,
          totalJobsCompleted: 0,
          totalEarnings: 0,
        }
      );
    } catch (err) {
      setError(err.message || 'Could not load activity from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Refresh automatically whenever duty changes
  useEffect(() => {
    const handleDutyChanged = () => {
      setTimeout(() => {
        loadActivity();
      }, 300);
    };
    window.addEventListener('servecircle:duty-changed', handleDutyChanged);
    return () => window.removeEventListener('servecircle:duty-changed', handleDutyChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!isAuthenticated) {
    return (
      <WorkerAuthPrompt
        onSignIn={signIn}
        authError={authError}
        authLoading={authLoading}
      />
    );
  }

  return (
    <div className="worker-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Link
              to="/worker/profile"
              className="btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              <HiOutlineArrowLeft /> Back to Profile
            </Link>
          </div>
          <h1>Your Activity</h1>
          <p>Online to Offline duty sessions and work completed during each shift (live database log)</p>
        </div>

        <button
          type="button"
          className="btn-outline"
          onClick={loadActivity}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <HiOutlineArrowPath className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Summary KPIs (DB only) */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <HiOutlineClock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Duty Sessions</span>
            <strong className="stat-value">{summary.totalSessions}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <HiOutlineClock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Online Time</span>
            <strong className="stat-value">{formatDuration(summary.totalDurationSeconds)}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <HiOutlineBriefcase />
          </div>
          <div className="stat-info">
            <span className="stat-label">Work Done (Jobs)</span>
            <strong className="stat-value">{summary.totalJobsCompleted}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <HiOutlineBanknotes />
          </div>
          <div className="stat-info">
            <span className="stat-label">Session Earnings</span>
            <strong className="stat-value">{formatInr(summary.totalEarnings)}</strong>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card" style={{ padding: '24px', borderRadius: '22px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.08rem', fontWeight: 700 }}>
          Duty Session History
        </h3>

        {loading && sessions.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>Loading your activity from database...</p>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--gray-500)' }}>
            No duty sessions recorded in database yet. Turn your duty status to <strong>Online</strong> to start tracking.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sessions.map((session) => {
              const isOnline = session.status === 'online';
              const isPaused = session.status === 'paused';
              const badgeBg = isOnline ? '#dcfce7' : isPaused ? '#fef3c7' : '#f1f5f9';
              const badgeColor = isOnline ? '#15803d' : isPaused ? '#b45309' : '#475569';
              const hasWork = Array.isArray(session.jobs) && session.jobs.length > 0;

              return (
                <div
                  key={session.id}
                  style={{
                    border: '1px solid rgba(203, 213, 225, 0.7)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    background: 'rgba(255, 255, 255, 0.78)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: hasWork ? '12px' : 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {session.status}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                        {formatDateTime(session.startedAt)} → {formatDateTime(session.endedAt)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      <span>
                        Duration: <strong>{formatDuration(session.durationSeconds)}</strong>
                      </span>
                      {hasWork && (
                        <>
                          <span>
                            Jobs: <strong>{session.jobsCompleted}</strong>
                          </span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>
                            {formatInr(session.earnings)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Only show work details if work was actually done between Online and Offline */}
                  {hasWork && (
                    <div
                      style={{
                        borderTop: '1px dashed rgba(203, 213, 225, 0.8)',
                        paddingTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {session.jobs.map((job) => (
                        <div
                          key={job.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            fontSize: '0.84rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineCheckCircle style={{ color: '#16a34a', fontSize: '1.05rem' }} />
                            <strong>#{job.bookingId}</strong>
                            <span>{job.service}</span>
                            <span style={{ color: 'var(--gray-500)' }}>({job.customerName})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                              {formatDateTime(job.completedAt)}
                            </span>
                            <strong style={{ color: '#059669' }}>{formatInr(job.amount)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerActivity;
