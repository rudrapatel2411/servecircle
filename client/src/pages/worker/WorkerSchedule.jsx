import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs } from './workerApi';
import { formatDate, isSameDay } from './workerHelpers';
import '../Dashboard.css';

const WorkerSchedule = () => {
  const { t } = useTranslation();
  const { token, isAuthenticated, signIn, authError, authLoading } = useWorkerAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSchedule = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorkerJobs(token);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const upcomingJobs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return jobs
      .filter((job) => ['pending', 'confirmed', 'active'].includes(job.status))
      .filter((job) => new Date(job.scheduledDate) >= today)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }, [jobs]);

  const todayJobs = useMemo(
    () => upcomingJobs.filter((job) => isSameDay(job.scheduledDate)),
    [upcomingJobs]
  );

  const monthlyCompleted = useMemo(() => {
    const now = new Date();
    return jobs.filter((job) => {
      if (job.status !== 'completed') return false;
      const date = new Date(job.scheduledDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [jobs]);

  const groupedByDate = useMemo(() => {
    return upcomingJobs.reduce((acc, job) => {
      const key = formatDate(job.scheduledDate);
      if (!acc[key]) acc[key] = [];
      acc[key].push(job);
      return acc;
    }, {});
  }, [upcomingJobs]);

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} />;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.mySchedule')}</h1>
          <p className="page-subtitle">Your daily and upcoming booking calendar.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <HiOutlineCalendarDays />
          </div>
          <div>
            <div className="stat-value">{todayJobs.length}</div>
            <div className="stat-label">Jobs Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <HiOutlineClock />
          </div>
          <div>
            <div className="stat-value">{upcomingJobs.length}</div>
            <div className="stat-label">Upcoming Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e1ebf5', color: '#224c82' }}>
            <HiOutlineCalendarDays />
          </div>
          <div>
            <div className="stat-value">{monthlyCompleted}</div>
            <div className="stat-label">Completed This Month</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {loading && <div className="chart-placeholder">Loading schedule...</div>}

      {!loading && upcomingJobs.length === 0 && (
        <div className="card">No upcoming jobs scheduled.</div>
      )}

      {!loading && Object.entries(groupedByDate).map(([dateKey, dateJobs]) => (
        <div key={dateKey} className="dash-section">
          <h3 className="dash-section-title">{dateKey}</h3>
          {dateJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-info">
                <h4>{job.service}</h4>
                <div className="job-meta" style={{ flexWrap: 'wrap' }}>
                  <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
                  <span><HiOutlineMapPin /> {job.address}</span>
                  <span className={`badge ${job.status === 'active' ? 'badge-primary' : 'badge-warning'}`}>{job.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WorkerSchedule;
