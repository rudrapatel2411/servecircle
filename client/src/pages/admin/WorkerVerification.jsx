import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineXCircle, HiOutlineCheckCircle,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineStar,
  HiOutlineMapPin, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineTrophy, HiOutlineClipboardDocumentCheck,
  HiOutlineCalendarDays, HiOutlineQrCode, HiOutlineArrowDownTray,
  HiOutlineEye, HiOutlineArrowPath, HiXMark,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

// Mock data reflecting the new workerStatus flow
const mockWorkers = [
  {
    id: 1, name: 'Karan Patel', email: 'karan@test.com', phone: '9876500010',
    skills: ['AC Repair & Service', 'Electrician'],
    serviceCategory: 'Home Repairs', experience: '🎓 Fresher (No experience — will learn)',
    city: 'Ahmedabad', appliedDate: '21 Jul 2026',
    workerStatus: 'pending_interview', workerAdminNote: '',
  },
  {
    id: 2, name: 'Deepak Singh', email: 'deepak@test.com', phone: '9876500004',
    skills: ['Car Washing & Detailing', 'Car Mechanic'],
    serviceCategory: 'Vehicle Services', experience: '⭐ 1–2 Years Experience',
    city: 'Ahmedabad', appliedDate: '20 Jul 2026',
    workerStatus: 'pending_interview', workerAdminNote: '',
  },
  {
    id: 3, name: 'Meena Devi', email: 'meena@test.com', phone: '9876500005',
    skills: ['Home Deep Cleaning', 'Pest Control'],
    serviceCategory: 'Cleaning & Hygiene', experience: '💼 3–5 Years Experience',
    city: 'Ahmedabad', appliedDate: '19 Jul 2026',
    workerStatus: 'interview_done', workerAdminNote: 'Visited hub on 20 Jul. Good practical skills.',
  },
  {
    id: 4, name: 'Ramesh Kumar', email: 'ramesh@test.com', phone: '9876500001',
    skills: ['Electrician', 'AC Repair & Service'],
    serviceCategory: 'Home Repairs', experience: '🏆 5+ Years (Expert Level)',
    city: 'Ahmedabad', appliedDate: '1 Jan 2026',
    workerStatus: 'approved_senior', workerAdminNote: 'Passed with excellent rating.',
    rating: 4.5, completedJobs: 38,
  },
  {
    id: 5, name: 'Sunita Mehra', email: 'sunita@test.com', phone: '9876500002',
    skills: ['Home Deep Cleaning', 'Sofa / Carpet Cleaning'],
    serviceCategory: 'Cleaning & Hygiene', experience: '💼 3–5 Years Experience',
    city: 'Ahmedabad', appliedDate: '15 Dec 2025',
    workerStatus: 'approved_junior', workerAdminNote: 'Completed rookie phase.',
    rating: 4.8, completedJobs: 52,
  },
  {
    id: 6, name: 'Vikram Yadav', email: 'vikram@test.com', phone: '9876500006',
    skills: ['Plumber'],
    serviceCategory: 'Home Repairs', experience: '⭐ 1–2 Years Experience',
    city: 'Surat', appliedDate: '13 Jul 2026',
    workerStatus: 'rejected', workerAdminNote: 'Failed practical test. Can reapply in 3 months.',
  },
];

const STATUS_CONFIG = {
  pending_interview: { label: 'Awaiting Hub Visit',  color: '#d97706', bg: '#fef3c7', icon: '📅' },
  interview_done:    { label: 'Interview Done',       color: '#2563eb', bg: '#dbeafe', icon: '✅' },
  approved_rookie:   { label: 'Approved — Rookie',    color: '#7c3aed', bg: '#ede9fe', icon: '🎓' },
  approved_junior:   { label: 'Approved — Junior',    color: '#0891b2', bg: '#cffafe', icon: '⭐' },
  approved_senior:   { label: 'Approved — Senior',    color: '#16a34a', bg: '#dcfce7', icon: '🏆' },
  rejected:          { label: 'Rejected',             color: '#dc2626', bg: '#fef2f2', icon: '❌' },
};

const TABS = [
  { key: 'pending_interview', label: '📅 Awaiting Visit' },
  { key: 'interview_done',    label: '✅ Interview Done' },
  { key: 'approved_rookie',   label: '🎓 Rookie' },
  { key: 'approved_junior',   label: '⭐ Junior' },
  { key: 'approved_senior',   label: '🏆 Senior' },
  { key: 'rejected',          label: '❌ Rejected' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WorkerVerification = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('pending_interview');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [approvalModal, setApprovalModal] = useState(null); // { workerId, action }
  const [adminNote, setAdminNote] = useState('');
  const [adminToken, setAdminToken] = useState(localStorage.getItem('servecircle_admin_token') || '');
  const [previewCardWorker, setPreviewCardWorker] = useState(null);

  const handleRegenerateQr = async (worker) => {
    try {
      const isMongoId = typeof worker.id === 'string' && worker.id.length === 24;
      if (isMongoId && adminToken) {
        const res = await fetch(`${API_BASE}/admin/worker/${worker.id}/regenerate-qr`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        if (!res.ok) throw new Error('Failed to regenerate QR');
        const data = await res.json();
        alert(`✅ QR Code regenerated for ${worker.name}. New QR Token: ${data.qrCodeData}`);
        fetchWorkers(adminToken);
      } else {
        const newQr = `SCQR-${Math.random().toString(36).substring(2, 10)}`;
        setWorkers((prev) => prev.map((w) => (w.id === worker.id ? { ...w, qrToken: newQr, qrActive: true } : w)));
        alert(`✅ QR Code regenerated for ${worker.name}. New QR Token: ${newQr}`);
      }
    } catch (err) {
      alert(err.message || 'Error regenerating QR');
    }
  };

  const handleDownloadIdCardData = async (worker) => {
    const workerIdCode = worker.workerIdCode || `SC-W-${(worker.id || '').toString().slice(-4).toUpperCase() || '1001'}`;
    const cardData = {
      brand: 'ServeCircle',
      logoUrl: 'https://servecircle.in/logo.png',
      workerName: worker.name,
      workerId: workerIdCode,
      role: worker.serviceCategory || 'Service Professional',
      qrCodeData: worker.qrToken || `SCQR-DEMO-${workerIdCode}`,
      qrActive: worker.qrActive !== false,
      disclaimer: 'Permanent ServeCircle ID Card. No sensitive personal information printed.',
      specs: {
        format: 'CR-80 ISO Standard ID Card',
        resolution: '300 DPI CMYK',
        printedFields: ['ServeCircle Logo', 'Worker Name', 'Worker ID', 'Worker Role', 'QR Code'],
        hiddenPrivacyFields: ['Photo', 'Phone', 'Email', 'Address', 'Aadhaar', 'PAN', 'Bank Details'],
      },
    };

    const blob = new Blob([JSON.stringify(cardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ServeCircle_ID_Card_${workerIdCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleQr = async (worker) => {
    const newStatus = worker.qrActive === false ? true : false;
    try {
      const isMongoId = typeof worker.id === 'string' && worker.id.length === 24;
      if (isMongoId && adminToken) {
        await fetch(`${API_BASE}/admin/worker/${worker.id}/toggle-qr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ qrActive: newStatus }),
        });
      }
      setWorkers((prev) => prev.map((w) => (w.id === worker.id ? { ...w, qrActive: newStatus } : w)));
      alert(`QR Code ${newStatus ? 'reactivated' : 'deactivated'} for ${worker.name}.`);
    } catch (err) {
      alert('Error updating QR status');
    }
  };

  // 1. Authenticate Admin and Fetch Workers
  const fetchWorkers = async (tokenToUse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/workers/pending`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch workers');
      const data = await res.json();
      
      // Map MongoDB _id to id, format date, and set defaults
      const mapped = data.map(w => ({
        ...w,
        id: w._id,
        skills: w.skills || [],
        appliedDate: w.createdAt 
          ? new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Today',
        workerStatus: w.workerStatus || 'pending_interview'
      }));

      // Merge with mock workers (removing duplicates by email to avoid losing initial set for demo)
      const mockFiltered = mockWorkers.filter(mw => !mapped.some(w => w.email === mw.email));
      setWorkers([...mapped, ...mockFiltered]);
    } catch (err) {
      console.error('Error fetching real workers:', err);
      // Fallback to mock workers if API fails
      setWorkers(mockWorkers);
    } finally {
      setLoading(false);
    }
  };

  const getAdminToken = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@servecircle.in', password: 'admin123' })
      });
      if (!res.ok) throw new Error('Admin login failed');
      const data = await res.json();
      localStorage.setItem('servecircle_admin_token', data.token);
      setAdminToken(data.token);
      return data.token;
    } catch (err) {
      console.error('Failed to auto-login admin:', err);
      return '';
    }
  };

  useEffect(() => {
    const init = async () => {
      let token = adminToken;
      if (!token) {
        token = await getAdminToken();
      }
      if (token) {
        await fetchWorkers(token);
      } else {
        setWorkers(mockWorkers);
      }
    };
    init();
  }, [adminToken]);

  const filtered = workers.filter((w) => w.workerStatus === tab);

  const openApproval = (worker, action) => {
    setApprovalModal({ workerId: worker.id || worker._id, action });
    setAdminNote('');
  };

  const submitApproval = async () => {
    const { workerId, action } = approvalModal;
    setError('');

    // If it's a real worker from DB (indicated by a 24-character hex ID typical of Mongo)
    const isMongoId = typeof workerId === 'string' && workerId.length === 24;

    if (isMongoId && adminToken) {
      try {
        const res = await fetch(`${API_BASE}/users/${workerId}/worker-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            workerStatus: action,
            workerAdminNote: adminNote
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update worker status');
        }

        // Successfully updated on backend, now reload
        await fetchWorkers(adminToken);
      } catch (err) {
        console.error('Backend status update failed:', err);
        setError(err.message || 'Failed to update status on server');
        // Update locally anyway as fallback
        setWorkers((prev) => prev.map((w) =>
          (w.id === workerId || w._id === workerId) ? { ...w, workerStatus: action, workerAdminNote: adminNote } : w
        ));
      }
    } else {
      // Local mock worker update
      setWorkers((prev) => prev.map((w) =>
        w.id === workerId ? { ...w, workerStatus: action, workerAdminNote: adminNote } : w
      ));
    }

    setApprovalModal(null);
    setExpandedId(null);
  };

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = workers.filter((w) => w.workerStatus === t.key).length;
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Worker Onboarding 🛡️</h1>
          <p className="page-subtitle">
            {workers.filter((w) => ['pending_interview', 'interview_done'].includes(w.workerStatus)).length} pending actions
            &nbsp;·&nbsp;
            {workers.filter((w) => w.workerStatus.startsWith('approved')).length} active workers
          </p>
        </div>
      </div>

      {/* Process Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
        borderRadius: 'var(--radius-lg)', padding: '14px 20px', marginBottom: '20px',
        display: 'flex', gap: '24px', flexWrap: 'wrap', color: 'white', fontSize: '0.8rem',
      }}>
        {[
          { icon: '📝', label: 'Registered', key: 'pending_interview' },
          { icon: '→' },
          { icon: '🏢', label: 'Hub Visit + Interview', key: 'interview_done' },
          { icon: '→' },
          { icon: '✅', label: 'Admin Approves as Rookie / Junior', key: 'approved_rookie' },
          { icon: '→' },
          { icon: '🏆', label: 'Upgrades to Senior (50+ jobs)', key: 'approved_senior' },
        ].map((item, idx) => (
          item.icon === '→'
            ? <span key={idx} style={{ opacity: 0.5, alignSelf: 'center' }}>→</span>
            : <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{item.icon}</span>
                <span style={{ fontWeight: 700, opacity: 0.95 }}>{item.label}</span>
              </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {tabCounts[t.key] > 0 && (
              <span className="tab-count">{tabCounts[t.key]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="verification-grid">
        {filtered.map((worker) => {
          const statusConf = STATUS_CONFIG[worker.workerStatus];
          const isExpanded = expandedId === worker.id;

          return (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`verification-card status-${worker.workerStatus}`}
              style={{ border: `1.5px solid ${isExpanded ? '#3b82f6' : '#e2e8f0'}` }}
            >
              <div className="vc-header" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : worker.id)}>
                <div className="vc-avatar">{worker.name.split(' ').map((n) => n[0]).join('')}</div>
                <div style={{ flex: 1 }}>
                  <h4 className="vc-name">{worker.name}</h4>
                  <div className="vc-contact">
                    <span><HiOutlinePhone /> {worker.phone}</span>
                    <span><HiOutlineEnvelope /> {worker.email}</span>
                  </div>
                </div>
                <div style={{ background: statusConf.bg, color: statusConf.color, fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', flexShrink: 0 }}>
                  {statusConf.icon} {statusConf.label}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="vc-details" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <div className="vc-detail">
                        <span className="vc-label">Service Category</span>
                        <span className="vc-value">{worker.serviceCategory}</span>
                      </div>
                      <div className="vc-detail">
                        <span className="vc-label">Skills</span>
                        <div className="vc-skills">
                          {worker.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                      </div>
                      <div className="vc-detail">
                        <span className="vc-label">Experience</span>
                        <span className="vc-value">{worker.experience}</span>
                      </div>
                      <div className="vc-detail">
                        <span className="vc-label">City</span>
                        <span className="vc-value"><HiOutlineMapPin style={{ verticalAlign: 'middle' }} /> {worker.city}</span>
                      </div>
                      <div className="vc-detail">
                        <span className="vc-label">Applied</span>
                        <span className="vc-value"><HiOutlineCalendarDays style={{ verticalAlign: 'middle' }} /> {worker.appliedDate}</span>
                      </div>
                      {worker.workerAdminNote && (
                        <div className="vc-detail">
                          <span className="vc-label">Admin Note</span>
                          <span className="vc-value" style={{ fontStyle: 'italic', color: '#6b7280' }}>"{worker.workerAdminNote}"</span>
                        </div>
                      )}
                      {worker.rating > 0 && (
                        <div className="vc-detail">
                          <span className="vc-label">Performance</span>
                          <span className="vc-value">
                            <HiOutlineStar style={{ color: '#f59e0b', verticalAlign: 'middle' }} /> {worker.rating} · {worker.completedJobs} jobs
                          </span>
                        </div>
                      )}
                    </div>

                      {/* Trust & Safety: Admin Permanent ID Card Management Actions */}
                      <div style={{
                        marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0',
                        display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
                      }}>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ color: '#1e3a5f', borderColor: '#cbd5e1' }}
                          onClick={() => setPreviewCardWorker(worker)}
                        >
                          <HiOutlineEye /> Preview ID Card
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                          onClick={() => handleRegenerateQr(worker)}
                        >
                          <HiOutlineArrowPath /> Regenerate QR
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ color: '#16a34a', borderColor: '#bbf7d0' }}
                          onClick={() => handleDownloadIdCardData(worker)}
                        >
                          <HiOutlineArrowDownTray /> Download Printable ID Card
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{
                            color: worker.qrActive === false ? '#16a34a' : '#dc2626',
                            borderColor: worker.qrActive === false ? '#bbf7d0' : '#fecaca',
                          }}
                          onClick={() => handleToggleQr(worker)}
                        >
                          {worker.qrActive === false ? 'Reactivate QR' : 'Deactivate QR'}
                        </button>
                      </div>

                      {/* Action Buttons based on status */}
                      <div className="vc-actions" style={{ marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        {worker.workerStatus === 'pending_interview' && (
                          <>
                            <button className="btn btn-sm btn-outline" style={{ color: '#2563eb', borderColor: '#bfdbfe' }} onClick={() => openApproval(worker, 'interview_done')}>
                              <HiOutlineClipboardDocumentCheck /> Mark Interview Done
                            </button>
                            <button className="btn btn-sm btn-outline" style={{ color: '#dc2626', borderColor: '#fecaca' }} onClick={() => openApproval(worker, 'rejected')}>
                              <HiOutlineXCircle /> Reject
                            </button>
                          </>
                        )}
                        {worker.workerStatus === 'interview_done' && (
                          <>
                            <button className="btn btn-sm btn-primary" style={{ background: '#7c3aed' }} onClick={() => openApproval(worker, 'approved_rookie')}>
                              <HiOutlineAcademicCap /> Approve as Rookie
                            </button>
                            <button className="btn btn-sm btn-primary" onClick={() => openApproval(worker, 'approved_junior')}>
                              <HiOutlineBriefcase /> Approve as Junior (Experienced)
                            </button>
                            <button className="btn btn-sm btn-outline" style={{ color: '#dc2626', borderColor: '#fecaca' }} onClick={() => openApproval(worker, 'rejected')}>
                              <HiOutlineXCircle /> Reject
                            </button>
                          </>
                        )}
                        {worker.workerStatus === 'approved_rookie' && (
                          <button className="btn btn-sm btn-primary" onClick={() => openApproval(worker, 'approved_junior')}>
                            <HiOutlineBriefcase /> Upgrade to Junior Pro
                          </button>
                        )}
                        {worker.workerStatus === 'approved_junior' && (
                          <button className="btn btn-sm btn-primary" style={{ background: '#16a34a' }} onClick={() => openApproval(worker, 'approved_senior')}>
                            <HiOutlineTrophy /> Upgrade to Senior Pro
                          </button>
                        )}
                        {worker.workerStatus === 'rejected' && (
                          <button className="btn btn-sm btn-outline" style={{ color: '#2563eb', borderColor: '#bfdbfe' }} onClick={() => openApproval(worker, 'pending_interview')}>
                            Reopen Application
                          </button>
                        )}
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No workers in this stage.</p>
          </div>
        )}
      </div>

      {/* Approval Confirmation Modal */}
      <AnimatePresence>
        {approvalModal && (() => {
          const worker = workers.find((w) => w.id === approvalModal.workerId);
          const actionConf = STATUS_CONFIG[approvalModal.action];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                  background: 'white', borderRadius: 'var(--radius-xl)',
                  padding: '28px', maxWidth: '440px', width: '100%',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              >
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
                  {actionConf.icon} Confirm: {actionConf.label}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px' }}>
                  You are changing <strong>{worker?.name}</strong>'s status to <strong>{actionConf.label}</strong>.
                </p>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Admin Note (Optional)</label>
                  <textarea
                    placeholder="e.g. Passed practical AC repair test. Good communication."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', resize: 'none', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setApprovalModal(null)}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, background: approvalModal.action === 'rejected' ? '#dc2626' : undefined }}
                    onClick={submitApproval}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ID Card Preview Modal */}
      <AnimatePresence>
        {previewCardWorker && (() => {
          const w = previewCardWorker;
          const workerIdCode = w.workerIdCode || `SC-W-${(w.id || '').toString().slice(-4).toUpperCase() || '1001'}`;
          const role = w.serviceCategory || 'Certified Professional';
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: 'white', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Permanent ServeCircle ID Card Preview
                  </h3>
                  <button onClick={() => setPreviewCardWorker(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>
                    <HiXMark />
                  </button>
                </div>

                {/* Visual CR80 Card Rendering */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                  borderRadius: '16px', padding: '24px', color: 'white', border: '2px solid #38bdf8',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)', position: 'relative', overflow: 'hidden',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#2563eb', color: 'white', width: '32px', height: '32px', borderRadius: '8px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                        SC
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.03em' }}>ServeCircle</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: '#22c55e', color: 'white', fontWeight: 800, padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>
                      Official ID
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worker Name</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '10px' }}>{w.name}</div>

                      <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worker ID</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fef08a', marginBottom: '10px' }}>{workerIdCode}</div>

                      <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd' }}>{role}</div>
                    </div>

                    {/* QR Code Container */}
                    <div style={{
                      background: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', flexShrink: 0, width: '90px',
                    }}>
                      <HiOutlineQrCode style={{ fontSize: '70px', color: '#0f172a' }} />
                      <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, display: 'block', marginTop: '2px' }}>
                        SCAN TO VERIFY
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.65rem', opacity: 0.7, textAlign: 'center' }}>
                    Permanent ServeCircle Card · No sensitive personal data printed
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPreviewCardWorker(null)}>Close</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleDownloadIdCardData(w)}>
                    Download Printable Data
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default WorkerVerification;
