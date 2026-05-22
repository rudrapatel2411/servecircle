import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowPath,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineMapPin,
  HiOutlineUser,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import {
  fetchWorkerJobs,
  respondToJobRequest,
  updateWorkerJobStatus,
} from './workerApi';
import {
  formatDate,
  formatInr,
  getStatusBadgeClass,
} from './workerHelpers';
import '../Dashboard.css';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const WorkerJobs = () => {
  const { t } = useTranslation();
  const { token, isAuthenticated, signIn, authError, authLoading } = useWorkerAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const loadJobs = async (status = activeTab) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorkerJobs(token, status);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab]);

  const handleRespond = async (bookingId, action) => {
    if (!token) return;
    setActionLoading(`${bookingId}-${action}`);
    setError('');
    try {
      await respondToJobRequest(token, bookingId, action);
      await loadJobs(activeTab);
    } catch (err) {
      setError(err.message || 'Could not update request');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatus = async (bookingId, nextStatus) => {
    if (!token) return;
    setActionLoading(`${bookingId}-${nextStatus}`);
    setError('');
    try {
      await updateWorkerJobStatus(token, bookingId, nextStatus);
      await loadJobs(activeTab);
    } catch (err) {
      setError(err.message || 'Could not update job status');
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
          <h1 className="page-title">{t('worker.jobRequests')}</h1>
          <p className="page-subtitle">Accept, reject, start, and complete worker jobs.</p>
        </div>
        <button className="btn btn-outline" onClick={() => loadJobs(activeTab)}>
          <HiOutlineArrowPath /> Refresh
        </button>
      </div>

      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {loading && <div className="chart-placeholder">Loading jobs...</div>}

      {!loading && jobs.length === 0 && <div className="card">No jobs found for this filter.</div>}

      {!loading && jobs.map((job) => (
        <div key={job._id} className="job-card">
          <div className="job-info">
            <h4>{job.service}</h4>
            <div className="job-meta" style={{ flexWrap: 'wrap' }}>
              <span><HiOutlineCalendarDays /> {formatDate(job.scheduledDate)}</span>
              <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
              <span><HiOutlineMapPin /> {job.address}</span>
              <span><HiOutlineCurrencyRupee /> {formatInr(job.amount)}</span>
              <span><HiOutlineUser /> {job.customer?.name || 'Customer'}</span>
              <span className={`badge ${getStatusBadgeClass(job.status)}`}>{job.status}</span>
            </div>
          </div>

          <div className="job-actions">
            {job.status === 'pending' && (
              <>
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
              </>
            )}

            {job.status === 'confirmed' && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatus(job._id, 'active')}
                disabled={actionLoading === `${job._id}-active`}
              >
                {actionLoading === `${job._id}-active` ? 'Updating...' : 'Start Job'}
              </button>
            )}

            {job.status === 'active' && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatus(job._id, 'completed')}
                disabled={actionLoading === `${job._id}-completed`}
              >
                {actionLoading === `${job._id}-completed` ? 'Updating...' : 'Mark Completed'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkerJobs;
