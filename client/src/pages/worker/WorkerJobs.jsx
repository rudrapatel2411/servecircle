import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowPath,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineTruck,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import {
  fetchWorkerJobs,
  respondToJobRequest,
  updateWorkerJobStatus,
  verifyWorkerOtp,
} from './workerApi';
import {
  formatDate,
  formatInr,
  getStatusBadgeClass,
} from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'en-route', label: 'En-Route' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'started', label: 'Started' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// Generate a random 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const DEMO_JOBS = [
  {
    _id: 'demo-job-001',
    service: 'AC Servicing (Deep Clean)',
    category: 'Home Repairs',
    scheduledDate: new Date().toISOString(),
    scheduledTime: '3:00 PM',
    address: 'Satellite, Ahmedabad',
    amount: 799,
    status: 'pending',
    isEmergency: false,
    customer: { name: 'Rudra Shah' },
  },
  {
    _id: 'demo-job-002',
    service: 'Emergency Plumbing — Pipe Leak',
    category: 'Home Repairs',
    scheduledDate: new Date().toISOString(),
    scheduledTime: 'Immediate',
    address: 'Prahlad Nagar, Ahmedabad',
    amount: 1200,
    status: 'accepted',
    isEmergency: true,
    customer: { name: 'Priya Desai' },
  },
  {
    _id: 'demo-job-003',
    service: 'Electrical Fan Installation',
    category: 'Home Repairs',
    scheduledDate: new Date().toISOString(),
    scheduledTime: '11:00 AM',
    address: 'SG Highway, Ahmedabad',
    amount: 450,
    status: 'arrived',
    isEmergency: false,
    customer: { name: 'Amit Patel' },
  },
  {
    _id: 'demo-job-004',
    service: 'Deep Cleaning (3BHK)',
    category: 'Cleaning & Hygiene',
    scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    scheduledTime: '10:00 AM',
    address: 'Bopal, Ahmedabad',
    amount: 1500,
    status: 'completed',
    isEmergency: false,
    customer: { name: 'Rudra Shah' },
  },
];

const WorkerJobs = () => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated, signIn, authError, authLoading, isDemoMode, workerStatus } = useWorkerAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  // OTP verification UI state
  const [otpInput, setOtpInput] = useState({}); // { [jobId]: '1234' }
  const [otpError, setOtpError] = useState({}); // { [jobId]: 'Wrong OTP' }
  const [cantResolveModal, setCantResolveModal] = useState(null); // jobId or null
  const [cantResolveReason, setCantResolveReason] = useState('');

  const loadJobs = async (status = activeTab) => {
    if (isDemoMode) {
      // Demo mode: filter mock jobs
      const filtered = status === 'all'
        ? DEMO_JOBS
        : DEMO_JOBS.filter((j) => j.status === status);
      setJobs(filtered);
      return;
    }
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

  const handleVerifyStartOtp = async (jobId) => {
    const entered = otpInput[jobId] || '';
    if (!entered) return;
    setActionLoading(`${jobId}-start`);
    try {
      await verifyWorkerOtp(token, jobId, 'start', entered);
      setOtpError((prev) => ({ ...prev, [jobId]: '' }));
      await loadJobs(activeTab);
    } catch (err) {
      setOtpError((prev) => ({ ...prev, [jobId]: err.message || 'Unable to verify Start OTP.' }));
    } finally {
      setActionLoading('');
    }
  };

  const handleVerifyEndOtp = async (jobId) => {
    const entered = otpInput[jobId] || '';
    if (!entered) return;
    setActionLoading(`${jobId}-end`);
    try {
      await verifyWorkerOtp(token, jobId, 'end', entered);
      setOtpError((prev) => ({ ...prev, [jobId]: '' }));
      await loadJobs(activeTab);
    } catch (err) {
      setOtpError((prev) => ({ ...prev, [jobId]: err.message || 'Unable to verify End OTP.' }));
    } finally {
      setActionLoading('');
    }
  };

  const handleCantResolve = (jobId) => {
    setCantResolveModal(jobId);
    setCantResolveReason('');
  };

  const submitCantResolve = () => {
    if (!cantResolveReason.trim()) return;
    // In production: send to backend with reason
    alert(`📞 Support team notified. Reason: "${cantResolveReason}". You can now leave the premises.`);
    setCantResolveModal(null);
    loadJobs(activeTab);
  };

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} currentUser={user} workerStatus={workerStatus} />;
  }

  return (
    <div className="page-content worker-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.jobRequests', 'Job Requests')}</h1>
          <p className="page-subtitle">Accept, track, and complete jobs with OTP verification.</p>
        </div>
        <button className="btn btn-outline" onClick={() => loadJobs(activeTab)}>
          <HiOutlineArrowPath /> Refresh
        </button>
      </div>

      {/* Rapido-style broadcast notice */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
      }}>
        <span style={{ fontSize: '1.5rem' }}>📡</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Live Job Broadcast Active</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>New jobs within 15 km radius will appear here. Accept fast — first come, first served!</div>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '4px 14px', fontSize: '0.8rem', fontWeight: 800 }}>
          🟢 Online
        </div>
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

      {!loading && jobs.map((job) => {
        const isEmergency = job.service?.toLowerCase().includes('emergency') || job.service?.toLowerCase().includes('leak');

        return (
          <AnimatePresence key={job._id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="job-card"
              style={isEmergency ? { borderLeft: '4px solid #ef4444' } : {}}
            >
              <div className="job-info">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {job.service}
                  {isEmergency && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>🚨 EMERGENCY: 2x PAY</span>}
                </h4>
                <div className="job-meta" style={{ flexWrap: 'wrap' }}>
                  <span><HiOutlineCalendarDays /> {formatDate(job.scheduledDate)}</span>
                  <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
                  <span><HiOutlineMapPin /> {job.address}</span>
                  <span style={{ color: '#3b7dc1', fontWeight: 800 }}><HiOutlineCurrencyRupee /> {formatInr(job.amount)}</span>
                  <span><HiOutlineUser /> {job.customer?.name || 'Customer'}</span>
                  <span className={`badge ${getStatusBadgeClass(job.status)}`}>{job.status}</span>
                  {job.trainee && (
                    <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                      🎓 Training: {job.trainee?.name || 'Trainee'}
                    </span>
                  )}
                </div>
              </div>

              <div className="worker-action-buttons" style={{ flexDirection: 'column', gap: '10px' }}>

                {/* ===== STEP 1: PENDING — Accept / Decline ===== */}
                {job.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => handleRespond(job._id, 'accept')}
                      disabled={actionLoading === `${job._id}-accept`}
                    >
                      {actionLoading === `${job._id}-accept` ? '...' : '✅ Accept Job'}
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                      onClick={() => handleRespond(job._id, 'reject')}
                      disabled={actionLoading === `${job._id}-reject`}
                    >
                      {actionLoading === `${job._id}-reject` ? '...' : 'Decline'}
                    </button>
                  </div>
                )}

                {/* ===== STEP 2: ACCEPTED — Ready to Go ===== */}
                {job.status === 'accepted' && (
                  <div>
                    <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '0.8rem', color: '#1e40af', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <HiOutlinePhone style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>Once you click <strong>"Ready to Go"</strong>, your phone number will be shared with the customer so they can guide you.</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => handleStatus(job._id, 'en-route')}
                      disabled={actionLoading === `${job._id}-en-route`}
                    >
                      <HiOutlineTruck style={{ marginRight: '6px' }} />
                      {actionLoading === `${job._id}-en-route` ? 'Updating...' : '🚗 Ready to Go — Start Journey'}
                    </button>
                  </div>
                )}

                {/* ===== STEP 3: EN-ROUTE — Mark arrival before Start OTP ===== */}
                {job.status === 'en-route' && (
                  <div>
                    <div style={{ background: '#fefce8', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '0.8rem', color: '#854d0e', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <HiOutlineShieldCheck style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>You are en-route. Mark arrival first, then ask the customer for the <strong>Start OTP</strong>.</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleStatus(job._id, 'arrived')} disabled={actionLoading === `${job._id}-arrived`} style={{ width: '100%', marginBottom: '10px' }}>
                      {actionLoading === `${job._id}-arrived` ? 'Updating...' : '📍 Mark Arrived'}
                    </button>
                  </div>
                )}

                {/* ===== STEP 4: ARRIVED — Verify Start OTP ===== */}
                {job.status === 'arrived' && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        maxLength={4}
                        placeholder="Enter Start OTP"
                        value={otpInput[job._id] || ''}
                        onChange={(e) => setOtpInput((prev) => ({ ...prev, [job._id]: e.target.value }))}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: '8px',
                          border: '2px solid #e2e8f0', fontSize: '1.2rem',
                          fontWeight: 800, letterSpacing: '8px', textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleVerifyStartOtp(job._id)}
                        disabled={actionLoading === `${job._id}-start`}
                        style={{ padding: '10px 20px' }}
                      >
                        {actionLoading === `${job._id}-start` ? '...' : 'Verify & Start'}
                      </button>
                    </div>
                    {otpError[job._id] && (
                      <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>{otpError[job._id]}</p>
                    )}
                  </div>
                )}

                {/* ===== STEP 5: STARTED — Work in progress, Enter End OTP ===== */}
                {job.status === 'started' && (
                  <div>
                    <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '0.8rem', color: '#166534', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <HiOutlineCheckCircle style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>Job is in progress 🛠️. When work is done, get the <strong>End OTP</strong> from the customer to close this job.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="number"
                        maxLength={4}
                        placeholder="Enter End OTP"
                        value={otpInput[job._id] || ''}
                        onChange={(e) => setOtpInput((prev) => ({ ...prev, [job._id]: e.target.value }))}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: '8px',
                          border: '2px solid #e2e8f0', fontSize: '1.2rem',
                          fontWeight: 800, letterSpacing: '8px', textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleVerifyEndOtp(job._id)}
                        disabled={actionLoading === `${job._id}-end`}
                        style={{ padding: '10px 20px', background: '#16a34a' }}
                      >
                        {actionLoading === `${job._id}-end` ? '...' : '✅ Done'}
                      </button>
                    </div>
                    {otpError[job._id] && (
                      <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontWeight: 600 }}>{otpError[job._id]}</p>
                    )}
                    {/* Can't Resolve option */}
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', color: '#b45309', borderColor: '#fde68a', background: '#fffbeb', fontSize: '0.8rem' }}
                      onClick={() => handleCantResolve(job._id)}
                    >
                      <HiOutlineExclamationTriangle style={{ marginRight: '6px' }} />
                      Can't Resolve — Contact Support
                    </button>
                  </div>
                )}

                {/* Quick contact buttons for en-route and active */}
                {(job.status === 'en-route' || job.status === 'started') && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                      onClick={() => alert(`📞 Calling ${job.customer?.name || 'Customer'}...`)}
                    >
                      <HiOutlinePhone /> Call
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                      onClick={() => alert(`💬 Opening chat with ${job.customer?.name || 'Customer'}...`)}
                    >
                      <HiOutlineChatBubbleLeftRight /> Chat
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        );
      })}

      {/* ===== Can't Resolve Modal ===== */}
      <AnimatePresence>
        {cantResolveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: 'white', borderRadius: 'var(--radius-xl)',
                padding: '28px', maxWidth: '420px', width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineExclamationTriangle style={{ color: '#f59e0b' }} /> Report Issue
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px' }}>
                Please describe the issue. ServeCircle support will be notified immediately. Once submitted, you are authorized to leave.
              </p>
              <textarea
                placeholder="Describe the problem (e.g. part unavailable, customer unresponsive, safety concern...)"
                value={cantResolveReason}
                onChange={(e) => setCantResolveReason(e.target.value)}
                rows={4}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  border: '2px solid #e2e8f0', fontSize: '0.9rem', resize: 'none',
                  outline: 'none', marginBottom: '16px', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setCantResolveModal(null)}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#dc2626' }}
                  onClick={submitCantResolve}
                  disabled={!cantResolveReason.trim()}
                >
                  📞 Notify Support & Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerJobs;
