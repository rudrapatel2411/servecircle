import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineBolt
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs } from './workerApi';
import { formatDate, formatInr } from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';

const WorkerEarnings = () => {
  const { t } = useTranslation();
  const { token, isAuthenticated, signIn, authError, authLoading } = useWorkerAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const loadJobs = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorkerJobs(token);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Could not load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'completed'),
    [jobs]
  );

  const grossEarnings = useMemo(
    () => completedJobs.reduce((sum, job) => sum + (job.amount || 0), 0),
    [completedJobs]
  );

  const weeklyGross = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    return completedJobs
      .filter((job) => new Date(job.scheduledDate) >= weekAgo && new Date(job.scheduledDate) <= now)
      .reduce((sum, job) => sum + (job.amount || 0), 0);
  }, [completedJobs]);

  const receivedPayout = useMemo(
    () => completedJobs
      .filter((job) => job.paymentStatus === 'paid')
      .reduce((sum, job) => sum + (job.amount || 0), 0),
    [completedJobs]
  );

  const pendingPayout = useMemo(
    () => completedJobs
      .filter((job) => job.paymentStatus !== 'paid')
      .reduce((sum, job) => sum + (job.amount || 0), 0),
    [completedJobs]
  );

  const estimatedPlatformFee = Math.round(grossEarnings * 0.2);
  const estimatedTakeHome = grossEarnings - estimatedPlatformFee;

  const monthlyRows = useMemo(() => {
    const bucket = {};
    completedJobs.forEach((job) => {
      const date = new Date(job.scheduledDate);
      const key = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!bucket[key]) {
        bucket[key] = { amount: 0, count: 0 };
      }
      bucket[key].amount += job.amount || 0;
      bucket[key].count += 1;
    });

    return Object.entries(bucket).map(([month, value]) => ({
      month,
      ...value,
    }));
  }, [completedJobs]);

  const handleInstantWithdraw = () => {
    if (pendingPayout <= 0) return;
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 5000);
  };

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} />;
  }

  return (
    <div className="page-content worker-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.earnings', 'Earnings')}</h1>
          <p className="page-subtitle">Track payouts, completed jobs, and estimated take-home.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e1ebf5', color: '#224c82' }}>
            <HiOutlineBanknotes />
          </div>
          <div>
            <div className="stat-value">{formatInr(weeklyGross)}</div>
            <div className="stat-label">{t('worker.weeklyEarnings', 'Weekly Earnings')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <HiOutlineArrowTrendingUp />
          </div>
          <div>
            <div className="stat-value">{formatInr(receivedPayout)}</div>
            <div className="stat-label">Payout Received</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <HiOutlineClock />
          </div>
          <div>
            <div className="stat-value">{formatInr(pendingPayout)}</div>
            <div className="stat-label">Pending Payout</div>
          </div>
        </div>
      </div>

      {withdrawSuccess && (
        <div className="card" style={{ borderColor: '#86efac', background: '#f0fdf4', color: '#166534', padding: '16px' }}>
          ✅ <strong>Success!</strong> Your instant withdrawal request of {formatInr(pendingPayout)} has been processed. The amount will reflect in your registered bank account within 2 hours.
        </div>
      )}

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {loading && <div className="chart-placeholder">Loading earnings...</div>}

      {!loading && (
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Earnings Breakdown</h3>
            <button 
              className="btn btn-primary" 
              style={{ background: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleInstantWithdraw}
              disabled={pendingPayout <= 0 || withdrawSuccess}
            >
              <HiOutlineBolt /> Instant Withdrawal
            </button>
          </div>
          
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ marginBottom: 10 }}>
              <strong>Gross earnings:</strong> {formatInr(grossEarnings)}
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Estimated platform fee (20%):</strong> {formatInr(estimatedPlatformFee)}
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Estimated take-home:</strong> {formatInr(estimatedTakeHome)}
            </p>
          </div>
          <p className="page-subtitle">Fee percentage is estimated from platform tier and zero-commission bonuses.</p>
        </div>
      )}

      {!loading && monthlyRows.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-title">Monthly Performance</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Completed Jobs</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{row.count}</td>
                  <td>{formatInr(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && completedJobs.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-title">Recent Completed Jobs</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {completedJobs.slice(0, 8).map((job) => (
                <tr key={job._id}>
                  <td>{job.bookingId}</td>
                  <td>{job.service}</td>
                  <td>{formatDate(job.scheduledDate)}</td>
                  <td><HiOutlineCurrencyRupee style={{ verticalAlign: 'middle' }} /> {formatInr(job.amount)}</td>
                  <td>
                    <span className={`badge ${job.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {job.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerEarnings;
