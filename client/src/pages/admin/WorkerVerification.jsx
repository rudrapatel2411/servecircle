import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineXCircle, HiOutlineCheckCircle,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineStar,
  HiOutlineMapPin, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineTrophy, HiOutlineClipboardDocumentCheck,
  HiOutlineCalendarDays,
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

const WorkerVerification = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('pending_interview');
  const [workers, setWorkers] = useState(mockWorkers);
  const [expandedId, setExpandedId] = useState(null);
  const [approvalModal, setApprovalModal] = useState(null); // { workerId, action }
  const [adminNote, setAdminNote] = useState('');

  const filtered = workers.filter((w) => w.workerStatus === tab);

  const openApproval = (worker, action) => {
    setApprovalModal({ workerId: worker.id, action });
    setAdminNote('');
  };

  const submitApproval = () => {
    const { workerId, action } = approvalModal;
    setWorkers((prev) => prev.map((w) =>
      w.id === workerId ? { ...w, workerStatus: action, workerAdminNote: adminNote } : w
    ));
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
    </div>
  );
};

export default WorkerVerification;
