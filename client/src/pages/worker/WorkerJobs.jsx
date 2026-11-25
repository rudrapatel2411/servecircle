import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
 HiOutlineCamera,
 HiOutlineArrowTopRightOnSquare,
 HiOutlineDocumentText,
 HiOutlineStar,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import BookingChatModal from '../../components/BookingChatModal';
import WorkerEstimateRevisionModal from '../../components/WorkerEstimateRevisionModal';
import WorkerRateCustomerModal from '../../components/WorkerRateCustomerModal';
import WorkerSosModal from '../../components/WorkerSosModal';
import Pagination from '../../components/Pagination';
import {
 fetchWorkerJobs,
 respondToJobRequest,
 updateWorkerJobStatus,
 verifyWorkerOtp,
 uploadBookingProof,
 collectCodPayment,
 initiateBookingCall,
 updateDutyStatus,
} from './workerApi';
import {
 formatDate,
 formatInr,
 getStatusBadgeClass,
} from './workerHelpers';
import { getWorkerCategory } from '../../utils/workerCategoryHelper';
import '../Dashboard.css';
import './WorkerPages.css';

const SPECIALIZED_JOB_SHORTCUTS = {
 'Travel & Commute': { path: '/worker/travel-commute', label: 'Travel Operations Cockpit', icon: '🚖', color: '#0d9488' },
 'Food Kitchen': { path: '/worker/food-kitchen', label: 'Culinary Operations Cockpit', icon: '🍳', color: '#ea580c' },
 'Pet Services': { path: '/worker/pet-services', label: 'Pet Operations Cockpit', icon: '🐾', color: '#db2777' },
 'Health & Wellness': { path: '/worker/health-wellness', label: 'Health Clinical Cockpit', icon: '🩺', color: '#0284c7' },
 'Society Management': { path: '/worker/society-management', label: 'Society Operations Cockpit', icon: '🏢', color: '#16a34a' },
 'Property & Society': { path: '/worker/society-management', label: 'Society Operations Cockpit', icon: '🏢', color: '#16a34a' },
 'Packers & Movers': { path: '/worker/relocation', label: 'Relocation Cockpit', icon: '🚚', color: '#2563eb' },
 'Events Hub': { path: '/worker/events', label: 'Event Production Cockpit', icon: '🎭', color: '#6366f1' },
};

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
 const { token, user, isAuthenticated, signIn, authError, authLoading, isDemoMode, workerStatus, dutyStatus, dutyStatusUpdatedAt, updateDuty } = useWorkerAuth();
 const workerCategory = getWorkerCategory(user);
 const specializedShortcut = SPECIALIZED_JOB_SHORTCUTS[workerCategory] || null;

 const [activeTab, setActiveTab] = useState('all');
 const [currentPage, setCurrentPage] = useState(1);
 const [pageSize, setPageSize] = useState(5);
 const [jobs, setJobs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [actionLoading, setActionLoading] = useState('');

 // OTP verification UI state
 const [otpInput, setOtpInput] = useState({}); // { [jobId]: '1234' }
 const [otpError, setOtpError] = useState({}); // { [jobId]: 'Wrong OTP' }
 const [cantResolveModal, setCantResolveModal] = useState(null); // jobId or null
 const [cantResolveReason, setCantResolveReason] = useState('');

 // Operations Modals (M2–M6)
 const [activeChatJob, setActiveChatJob] = useState(null);
 const [activeRevisionJob, setActiveRevisionJob] = useState(null);
 const [activeRateJob, setActiveRateJob] = useState(null);
 const [showSosModal, setShowSosModal] = useState(false);
 const [uploadingProof, setUploadingProof] = useState({});

 // In-App Toast & Evidence Modals (Replacing native prompt/alert/confirm)
 const [toastMessage, setToastMessage] = useState('');
 const [proofModal, setProofModal] = useState({ open: false, jobId: null, type: 'BEFORE_WORK', previewUrl: '', notes: '' });
 const [codModal, setCodModal] = useState({ open: false, jobId: null, amount: 0 });

 const showToast = (msg) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(''), 4500);
 };

 const openProofModal = (jobId, type) => {
 const defaultImg = type === 'BEFORE_WORK'
 ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
 : 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800';
 setProofModal({
 open: true,
 jobId,
 type,
 previewUrl: defaultImg,
 notes: type === 'BEFORE_WORK' ? 'Inspected pre-existing wear and setup' : 'Repairs verified and tested with customer',
 });
 };

 const confirmUploadProof = async () => {
 const { jobId, type, previewUrl, notes } = proofModal;
 if (!previewUrl || !jobId) return;
 setUploadingProof((prev) => ({ ...prev, [`${jobId}-${type}`]: true }));
 try {
 await uploadBookingProof(token, jobId, { type, imageUrl: previewUrl, notes });
 showToast(` ${type === 'BEFORE_WORK' ? 'Before-Work' : 'After-Work'} proof photo uploaded successfully!`);
 setProofModal({ open: false, jobId: null, type: 'BEFORE_WORK', previewUrl: '', notes: '' });
 await loadJobs(activeTab);
 } catch (err) {
 showToast(err.message || 'Proof upload failed');
 } finally {
 setUploadingProof((prev) => ({ ...prev, [`${jobId}-${type}`]: false }));
 }
 };

 const openCodModal = (jobId, amount) => {
 setCodModal({ open: true, jobId, amount });
 };

 const confirmCollectCod = async () => {
 const { jobId, amount } = codModal;
 if (!jobId) return;
 setActionLoading(`${jobId}-cod`);
 try {
 await collectCodPayment(token, jobId, amount);
 showToast(` ₹${amount} Cash Collection Confirmed! Commission adjusted.`);
 setCodModal({ open: false, jobId: null, amount: 0 });
 await loadJobs(activeTab);
 } catch (err) {
 showToast(err.message || 'COD collection failed');
 } finally {
 setActionLoading('');
 }
 };

 const handleUploadProof = (jobId, type) => {
 openProofModal(jobId, type);
 };

 const handleCollectCod = (jobId, amount) => {
 openCodModal(jobId, amount);
 };

 const updateB2BWorkOrderStatus = (jobId, nextStatus) => {
 try {
 const raw = localStorage.getItem('b2bWorkOrders');
 if (raw) {
 const parsed = JSON.parse(raw);
 const updated = parsed.map(o => (o.id === jobId || o.rawId === jobId ? { ...o, status: nextStatus } : o));
 localStorage.setItem('b2bWorkOrders', JSON.stringify(updated));
 window.dispatchEvent(new CustomEvent('servecircle:b2b-status-updated', { detail: { jobId, status: nextStatus } }));
 }
 } catch (e) {
 console.warn('B2B work order sync warning:', e);
 }
 };

 const loadJobs = async (status = activeTab) => {
 let b2bJobs = [];
 try {
 const raw = localStorage.getItem('b2bWorkOrders');
 if (raw) {
 const parsed = JSON.parse(raw);
 b2bJobs = parsed.map(o => ({
 _id: o.rawId || o.id,
 id: o.id,
 service: o.service,
 category: o.category || 'Society Management',
 scheduledDate: o.date ? new Date(o.date).toISOString() : new Date().toISOString(),
 scheduledTime: o.time || '10:00 AM',
 address: `${o.tower || 'Central Campus'}, Green Valley Society, Ahmedabad`,
 amount: o.amount || o.cost || 2500,
 workerEarnings: Math.round((o.amount || o.cost || 2500) * 0.9),
 status: o.status || 'confirmed',
 isEmergency: Boolean(o.urgency && o.urgency.includes('Emergency')),
 isB2B: true,
 societyName: o.societyName || 'Green Valley Society',
 tower: o.tower,
 gatePassPin: o.gatePassPin,
 customer: { name: 'Rajesh Mehta (RWA Secretary)', phone: '+91 98765 43210' },
 description: `Specs: [Society: ${o.societyName || 'Green Valley Society'}, Wing: ${o.tower || 'All Towers'}, GatePIN: ${o.gatePassPin || '4892'}]`,
 }));
 }
 } catch (e) {
 console.warn('Error reading local B2B work orders:', e);
 }

 if (isDemoMode) {
 // Demo mode: filter mock jobs + B2B jobs
 const allDemo = [...b2bJobs, ...DEMO_JOBS];
 const filtered = status === 'all'
 ? allDemo
 : allDemo.filter((j) => j.status === status);
 setJobs(filtered);
 return;
 }
 if (!token) {
 if (b2bJobs.length > 0) {
 const filtered = status === 'all' ? b2bJobs : b2bJobs.filter(j => j.status === status);
 setJobs(filtered);
 }
 return;
 }
 setLoading(true);
 setError('');
 try {
 const data = await fetchWorkerJobs(token, status);
 const merged = Array.isArray(data) ? [...data] : [];
 b2bJobs.forEach(bj => {
 if (!merged.some(m => m._id === bj._id || m.bookingId === bj.id)) {
 if (status === 'all' || bj.status === status) {
 merged.unshift(bj);
 }
 }
 });
 setJobs(merged);
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
 if (action === 'accept' && dutyStatus !== 'online') {
 const confirmOnline = window.confirm(
 `You are currently ${dutyStatus.toUpperCase()}. Would you like to switch to ONLINE to accept this job?`
 );
 if (!confirmOnline) return;
 try {
 await updateDutyStatus(token, { dutyStatus: 'online' });
 updateDuty('online');
 window.dispatchEvent(
 new CustomEvent('servecircle:duty-changed', {
 detail: { dutyStatus: 'online' },
 })
 );
 } catch (err) {
 console.warn('Auto go online before accept warning:', err);
 }
 }
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
 updateB2BWorkOrderStatus(bookingId, nextStatus);
 if (!token) {
 await loadJobs(activeTab);
 return;
 }
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
 alert(`Support team notified. Reason: "${cantResolveReason}". You can now leave the premises.`);
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
 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
 <button
 className="btn btn-outline"
 style={{ borderColor: '#ef4444', color: '#dc2626', background: '#fef2f2', fontWeight: 700 }}
 onClick={() => setShowSosModal(true)}
 >
 Emergency SOS
 </button>
 <button className="btn btn-outline" onClick={() => loadJobs(activeTab)}>
 <HiOutlineArrowPath /> Refresh
 </button>
 </div>
 </div>

 {/* ===== WORKER DUTY SWITCH (ONLINE / PAUSED / OFFLINE) ===== */}
 <WorkerDutySwitch
 token={token}
 currentStatus={dutyStatus}
 lastUpdated={dutyStatusUpdatedAt}
 isVerified={user?.isVerified}
 workerStatus={workerStatus}
 onStatusChange={(newStatus, updatedUser) => updateDuty(updatedUser || newStatus)}
 />

 {/* Duty Status Information Banner */}
 {dutyStatus === 'offline' && (
 <div
 style={{
 background: '#fef2f2',
 border: '1.5px solid #fecaca',
 borderRadius: '12px',
 padding: '12px 18px',
 marginBottom: '16px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 gap: '12px',
 flexWrap: 'wrap',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ fontSize: '1.25rem' }}></span>
 <div>
 <strong style={{ color: '#991b1b', fontSize: '0.92rem' }}>You are currently Off Duty (Offline)</strong>
 <div style={{ color: '#7f1d1d', fontSize: '0.8rem', marginTop: '2px' }}>
 New customer booking requests will not be dispatched to you while offline. Switch to Online to receive jobs.
 </div>
 </div>
 </div>
 <button
 type="button"
 className="btn btn-primary"
 style={{ padding: '6px 16px', fontSize: '0.82rem', background: '#16a34a', borderColor: '#16a34a' }}
 onClick={async () => {
 try {
 if (token && token !== 'demo-token-worker') {
 await updateDutyStatus(token, { dutyStatus: 'online' });
 }
 updateDuty('online');
 window.dispatchEvent(
 new CustomEvent('servecircle:duty-changed', { detail: { dutyStatus: 'online' } })
 );
 } catch (e) {
 setError(e.message || 'Could not go online');
 }
 }}
 >
 Go Online Now
 </button>
 </div>
 )}

 {dutyStatus === 'paused' && (
 <div
 style={{
 background: '#fef3c7',
 border: '1.5px solid #fde68a',
 borderRadius: '12px',
 padding: '12px 18px',
 marginBottom: '16px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 gap: '12px',
 flexWrap: 'wrap',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ fontSize: '1.25rem' }}></span>
 <div>
 <strong style={{ color: '#92400e', fontSize: '0.92rem' }}>You are currently on Break (Paused)</strong>
 <div style={{ color: '#78350f', fontSize: '0.8rem', marginTop: '2px' }}>
 New incoming dispatches are temporarily held. You can still view and complete your accepted ongoing jobs.
 </div>
 </div>
 </div>
 <button
 type="button"
 className="btn btn-primary"
 style={{ padding: '6px 16px', fontSize: '0.82rem', background: '#16a34a', borderColor: '#16a34a' }}
 onClick={async () => {
 try {
 if (token && token !== 'demo-token-worker') {
 await updateDutyStatus(token, { dutyStatus: 'online' });
 }
 updateDuty('online');
 window.dispatchEvent(
 new CustomEvent('servecircle:duty-changed', { detail: { dutyStatus: 'online' } })
 );
 } catch (e) {
 setError(e.message || 'Could not resume duty');
 }
 }}
 >
 Resume (Go Online)
 </button>
 </div>
 )}

 {dutyStatus === 'online' && (
 <div
 style={{
 background: '#f0fdf4',
 border: '1px solid #bbf7d0',
 borderRadius: '12px',
 padding: '10px 16px',
 marginBottom: '16px',
 display: 'flex',
 alignItems: 'center',
 gap: '10px',
 }}
 >
 <span style={{ fontSize: '1.1rem' }}></span>
 <div style={{ fontSize: '0.82rem', color: '#166534' }}>
 <strong>Auto-Dispatch Active:</strong> You are Online and eligible to receive customer job requests in your service city.
 </div>
 </div>
 )}

 {specializedShortcut && (
  <div
   style={{
    background: 'white',
    border: `1.5px solid ${specializedShortcut.color}`,
    borderRadius: '12px',
    padding: '12px 18px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    boxShadow: `0 2px 10px ${specializedShortcut.color}15`
   }}
  >
   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontSize: '1.4rem' }}>{specializedShortcut.icon}</span>
    <div>
     <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
      {specializedShortcut.label}
     </strong>
     <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '1px' }}>
      You are assigned to {workerCategory}. Open your dedicated operations console for advance booking workflows.
     </div>
    </div>
   </div>
   <Link
    to={specializedShortcut.path}
    className="btn"
    style={{
     background: specializedShortcut.color,
     color: 'white',
     padding: '7px 16px',
     fontSize: '0.82rem',
     fontWeight: 700,
     borderRadius: '8px',
     textDecoration: 'none'
    }}
   >
    Launch Console →
   </Link>
  </div>
 )}

 <div className="tabs-bar">
 {tabs.map((tab) => (
 <button
 key={tab.key}
 className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
 onClick={() => {
 setActiveTab(tab.key);
 setCurrentPage(1);
 }}
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

 {!loading && jobs
 .slice((currentPage - 1) * pageSize, currentPage * pageSize)
 .map((job) => {
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
 <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
 {job.service}
 {isEmergency && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>EMERGENCY: 2x PAY</span>}
 {job.isB2B && (
 <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #ddd6fe' }}>
 🏢 Society Work Order: {job.societyName} ({job.tower || 'Common Area'})
 </span>
 )}
 {job.gatePassPin && (
 <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
 Gate PIN: {job.gatePassPin}
 </span>
 )}
 </h4>
 <div className="job-meta" style={{ flexWrap: 'wrap' }}>
 <span><HiOutlineCalendarDays /> {formatDate(job.scheduledDate)}</span>
 <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
 <span><HiOutlineMapPin /> {job.address}</span>
 <span style={{ color: '#16a34a', fontWeight: 900, background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
 <HiOutlineCurrencyRupee /> <strong>Net Payout: ₹{formatInr(job.workerEarnings || Math.round(job.amount * 0.9))}</strong>
 </span>
 <span style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>
 (Customer Bill: ₹{formatInr(job.amount)} | Platform Fee: -₹{formatInr(job.platformCommission || Math.round(job.amount * 0.1))})
 </span>
 {job.pricingBreakdown?.passThroughSubtotal > 0 && (
 <span style={{ color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
 Includes ₹{job.pricingBreakdown.passThroughSubtotal} 100% Pass-Through (0% Commission)
 </span>
 )}
 <span><HiOutlineUser /> {job.customer?.name || 'Customer'}</span>
 <span className={`badge ${getStatusBadgeClass(job.status)}`}>{job.status}</span>
 {job.trainee && (
 <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
 Training: {job.trainee?.name || 'Trainee'}
 </span>
 )}
 {['accepted', 'en-route', 'arrived'].includes(job.status) && (
 <a
 href={job.navigationUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address + ', ' + (job.city || 'Ahmedabad'))}`}
 target="_blank"
 rel="noopener noreferrer"
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 gap: '4px',
 fontSize: '0.75rem',
 fontWeight: 700,
 color: '#2563eb',
 backgroundColor: '#eff6ff',
 padding: '2px 10px',
 borderRadius: '6px',
 textDecoration: 'none',
 border: '1px solid #bfdbfe',
 }}
 >
 Navigate <HiOutlineArrowTopRightOnSquare style={{ fontSize: '0.85rem' }} />
 </a>
 )}
 </div>

 {/* Job Specifications & Requirements Badge */}
 {job.description && (job.description.includes('Specs:') || job.description.includes('[')) && (
 <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.78rem', color: '#0369a1', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
 <span style={{ fontSize: '1rem', marginTop: '1px' }}></span>
 <div style={{ wordBreak: 'break-word', lineHeight: '1.4' }}>
 <strong style={{ color: '#0369a1' }}>Job Specifications: </strong>
 <span style={{ color: '#0c4a6e', fontWeight: 500 }}>{job.description.includes('Specs:') ? job.description.split('Specs:')[1]?.replace(/[\[\]]/g, '').trim() : job.description}</span>
 </div>
 </div>
 )}
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
 {actionLoading === `${job._id}-accept` ? '...' : 'Accept Job'}
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
 {actionLoading === `${job._id}-en-route` ? 'Updating...' : 'Ready to Go — Start Journey'}
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
 {actionLoading === `${job._id}-arrived` ? 'Updating...' : 'Mark Arrived'}
 </button>
 </div>
 )}

 {/* ===== STEP 4: ARRIVED — Verify Start OTP & Photo Proof ===== */}
 {job.status === 'arrived' && (
 <div>
 <div style={{ marginBottom: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => handleUploadProof(job._id, 'BEFORE_WORK')}
 disabled={uploadingProof[`${job._id}-BEFORE_WORK`]}
 style={{
 width: '100%',
 fontSize: '0.82rem',
 padding: '8px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '6px',
 borderColor: job.hasBeforeProof ? '#16a34a' : '#cbd5e1',
 color: job.hasBeforeProof ? '#16a34a' : '#1e293b',
 background: job.hasBeforeProof ? '#f0fdf4' : '#ffffff',
 fontWeight: 600,
 }}
 >
 <HiOutlineCamera />
 {job.hasBeforeProof ? ' Before Work Photo Uploaded' : ' Upload Before Work Photo'}
 </button>
 </div>
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

 {/* ===== STEP 5: STARTED — Work in progress, Enter End OTP & Proof ===== */}
 {job.status === 'started' && (
 <div>
 <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '0.8rem', color: '#166534', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
 <HiOutlineCheckCircle style={{ flexShrink: 0, marginTop: '2px' }} />
 <span>Job is in progress. Upload after-work photo and get the <strong>End OTP</strong> from the customer to close this job.</span>
 </div>

 <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => handleUploadProof(job._id, 'AFTER_WORK')}
 disabled={uploadingProof[`${job._id}-AFTER_WORK`]}
 style={{
 flex: 1,
 fontSize: '0.8rem',
 padding: '8px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '6px',
 borderColor: job.hasAfterProof ? '#16a34a' : '#cbd5e1',
 color: job.hasAfterProof ? '#16a34a' : '#1e293b',
 background: job.hasAfterProof ? '#f0fdf4' : '#ffffff',
 fontWeight: 600,
 }}
 >
 <HiOutlineCamera />
 {job.hasAfterProof ? ' After Photo' : ' After Photo'}
 </button>
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => setActiveRevisionJob(job)}
 style={{
 flex: 1,
 fontSize: '0.8rem',
 padding: '8px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '6px',
 borderColor: '#3b82f6',
 color: '#2563eb',
 background: '#eff6ff',
 fontWeight: 600,
 }}
 >
 <HiOutlineDocumentText /> Revise Estimate
 </button>
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
 {actionLoading === `${job._id}-end` ? '...' : 'Done'}
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

 {/* ===== STEP 6: COMPLETED — COD & Rating ===== */}
 {job.status === 'completed' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {job.paymentMethod === 'COD' && !job.isCodCollected && (
 <button
 type="button"
 className="btn btn-primary"
 onClick={() => handleCollectCod(job._id, job.amount)}
 disabled={actionLoading === `${job._id}-cod`}
 style={{ width: '100%', backgroundColor: '#059669', fontSize: '0.85rem' }}
 >
 <HiOutlineCurrencyRupee style={{ marginRight: '4px' }} />
 Confirm Cash Collection (₹{job.amount})
 </button>
 )}
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => setActiveRateJob(job)}
 style={{ width: '100%', fontSize: '0.82rem', borderColor: '#facc15', color: '#a16207', backgroundColor: '#fefce8', fontWeight: 600 }}
 >
 <HiOutlineStar style={{ marginRight: '4px' }} /> Rate Customer Experience
 </button>
 </div>
 )}

 {/* Quick contact buttons for en-route, arrived, and started */}
 {['en-route', 'arrived', 'started'].includes(job.status) && (
 <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
 <button
 className="btn btn-outline"
 style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
 onClick={async () => {
 try {
 const res = await initiateBookingCall(token, job._id);
 alert(res.message);
 } catch (err) {
 alert(err.message);
 }
 }}
 >
 <HiOutlinePhone /> Call
 </button>
 <button
 className="btn btn-outline"
 style={{ flex: 1, fontSize: '0.8rem', padding: '8px', background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
 onClick={() => setActiveChatJob(job)}
 >
 <HiOutlineChatBubbleLeftRight /> In-App Chat
 </button>
 </div>
 )}

 </div>
 </motion.div>
 </AnimatePresence>
 );
 })}

 {jobs.length > 0 && (
 <Pagination
 currentPage={currentPage}
 totalItems={jobs.length}
 pageSize={pageSize}
 pageSizeOptions={[5, 10, 20]}
 onPageChange={(page) => setCurrentPage(page)}
 onPageSizeChange={(size) => {
 setPageSize(size);
 setCurrentPage(1);
 }}
 itemName="jobs"
 />
 )}

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
 Notify Support & Exit
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* M2 In-App Booking Chat & Relay */}
 <BookingChatModal
 isOpen={Boolean(activeChatJob)}
 onClose={() => setActiveChatJob(null)}
 token={token}
 bookingId={activeChatJob?._id || activeChatJob?.id}
 customerName={activeChatJob?.customer?.name}
 currentUserRole="worker"
 />

 {/* M4 Quote Revision Modal */}
 <WorkerEstimateRevisionModal
 isOpen={Boolean(activeRevisionJob)}
 onClose={() => setActiveRevisionJob(null)}
 token={token}
 bookingId={activeRevisionJob?._id || activeRevisionJob?.id}
 originalAmount={activeRevisionJob?.amount}
 onSuccess={() => loadJobs(activeTab)}
 />

 {/* M6 Rate Customer Modal */}
 <WorkerRateCustomerModal
 isOpen={Boolean(activeRateJob)}
 onClose={() => setActiveRateJob(null)}
 token={token}
 bookingId={activeRateJob?._id || activeRateJob?.id}
 customerName={activeRateJob?.customer?.name}
 onSuccess={() => loadJobs(activeTab)}
 />

 {/* M6 SOS Emergency Modal */}
 <WorkerSosModal
 isOpen={showSosModal}
 onClose={() => setShowSosModal(false)}
 token={token}
 bookingId={jobs.find((j) => ['en-route', 'arrived', 'started'].includes(j.status))?._id || jobs[0]?._id}
 />

 {/* Floating In-App Toast */}
 {toastMessage && (
 <div className="sc-toast success">
 <HiOutlineCheckCircle style={{ fontSize: '1.3rem', color: '#22c55e' }} />
 <span>{toastMessage}</span>
 </div>
 )}

 {/* In-App Photo Evidence Upload Modal */}
 <AnimatePresence>
 {proofModal.open && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 style={{
 position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
 padding: '20px',
 }}
 >
 <motion.div
 initial={{ scale: 0.9, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 style={{
 background: 'white', borderRadius: '18px',
 padding: '28px', maxWidth: '480px', width: '100%',
 boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
 }}
 >
 <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineCamera style={{ color: '#2563eb' }} />
 {proofModal.type === 'BEFORE_WORK' ? ' Before-Work Photo Proof' : ' After-Work Photo Proof'}
 </h3>
 <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px 0' }}>
 Capture or select verification evidence. Photos are stamped with date, time, and GPS watermark.
 </p>

 {/* Photo Preview */}
 <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '180px', background: '#f1f5f9', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
 <img
 src={proofModal.previewUrl}
 alt="Proof preview"
 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
 />
 <div style={{
 position: 'absolute', bottom: '8px', left: '8px', right: '8px',
 background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)',
 color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem',
 display: 'flex', justifyContent: 'space-between',
 }}>
 <span> GPS Verified • Doorstep</span>
 <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 </div>
 </div>

 {/* Quick Preset Buttons */}
 <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => setProofModal((prev) => ({ ...prev, previewUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800' }))}
 style={{ fontSize: '0.75rem', padding: '4px 8px' }}
 >
 AC/Appliance
 </button>
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => setProofModal((prev) => ({ ...prev, previewUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800' }))}
 style={{ fontSize: '0.75rem', padding: '4px 8px' }}
 >
 Plumbing Pipe
 </button>
 <button
 type="button"
 className="btn btn-outline"
 onClick={() => setProofModal((prev) => ({ ...prev, previewUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800' }))}
 style={{ fontSize: '0.75rem', padding: '4px 8px' }}
 >
 Electrical Wiring
 </button>
 </div>

 {/* Custom Image URL or Notes */}
 <div style={{ marginBottom: '14px' }}>
 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
 Photo Evidence URL:
 </label>
 <input
 type="text"
 value={proofModal.previewUrl}
 onChange={(e) => setProofModal((prev) => ({ ...prev, previewUrl: e.target.value }))}
 style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
 />
 </div>

 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 style={{ flex: 1 }}
 onClick={() => setProofModal({ open: false, jobId: null, type: 'BEFORE_WORK', previewUrl: '', notes: '' })}
 >
 Cancel
 </button>
 <button
 type="button"
 className="btn btn-primary"
 style={{ flex: 1.5, background: '#16a34a' }}
 onClick={confirmUploadProof}
 disabled={uploadingProof[`${proofModal.jobId}-${proofModal.type}`]}
 >
 {uploadingProof[`${proofModal.jobId}-${proofModal.type}`] ? 'Uploading...' : 'Confirm Upload'}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* In-App COD Confirmation Modal */}
 <AnimatePresence>
 {codModal.open && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 style={{
 position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
 padding: '20px',
 }}
 >
 <motion.div
 initial={{ scale: 0.9, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 style={{
 background: 'white', borderRadius: '18px',
 padding: '28px', maxWidth: '420px', width: '100%',
 boxShadow: '0 25px 60px rgba(0,0,0,0.3)', textAlign: 'center',
 }}
 >
 <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem' }}>
 <HiOutlineCurrencyRupee />
 </div>
 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
 Confirm Cash Collection
 </h3>
 <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
 Have you physically received <strong>₹{codModal.amount}</strong> in cash from the customer?
 </p>
 <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', marginBottom: '20px', textAlign: 'left' }}>
 ℹ Platform commission (10–20%) will be automatically reconciled with your wallet ledger.
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 style={{ flex: 1 }}
 onClick={() => setCodModal({ open: false, jobId: null, amount: 0 })}
 >
 Cancel
 </button>
 <button
 type="button"
 className="btn btn-primary"
 style={{ flex: 1.5, background: '#059669' }}
 onClick={confirmCollectCod}
 disabled={actionLoading === `${codModal.jobId}-cod`}
 >
 {actionLoading === `${codModal.jobId}-cod` ? 'Updating...' : 'Yes, Cash Received'}
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
