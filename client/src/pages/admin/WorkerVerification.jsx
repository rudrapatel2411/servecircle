import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineShieldCheck, HiOutlineXCircle, HiOutlineCheckCircle,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineStar
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const mockWorkers = [
  { id: 1, name: 'Deepak Singh', email: 'deepak@test.com', phone: '9876500004', skills: ['Car Repair', 'Car Washing'], idProof: 'Aadhar - XXXX-4567', appliedDate: '10 May 2026', experience: '3 years', city: 'Ahmedabad', status: 'pending' },
  { id: 2, name: 'Meena Devi', email: 'meena@test.com', phone: '9876500005', skills: ['Cooking', 'Tailoring'], idProof: 'Voter ID - ABC123', appliedDate: '12 May 2026', experience: '5 years', city: 'Ahmedabad', status: 'pending' },
  { id: 3, name: 'Ramesh Kumar', email: 'ramesh@test.com', phone: '9876500001', skills: ['Electrician', 'AC Repair'], idProof: 'Aadhar - XXXX-1234', appliedDate: '1 Jan 2026', experience: '7 years', city: 'Ahmedabad', status: 'verified', rating: 4.5, jobs: 38 },
  { id: 4, name: 'Sunita Mehra', email: 'sunita@test.com', phone: '9876500002', skills: ['Cleaning', 'Pest Control'], idProof: 'Aadhar - XXXX-5678', appliedDate: '15 Dec 2025', experience: '4 years', city: 'Ahmedabad', status: 'verified', rating: 4.8, jobs: 52 },
  { id: 5, name: 'Vikram Yadav', email: 'vikram@test.com', phone: '9876500006', skills: ['Plumber'], idProof: 'PAN - ABCDE1234F', appliedDate: '13 May 2026', experience: '2 years', city: 'Surat', status: 'rejected' },
];

const WorkerVerification = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('pending');
  const [workers, setWorkers] = useState(mockWorkers);

  const filtered = workers.filter((w) => w.status === tab);

  const handleAction = (id, action) => {
    setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, status: action === 'approve' ? 'verified' : 'rejected' } : w));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.workers')} 🛡️</h1>
          <p className="page-subtitle">{workers.filter((w) => w.status === 'pending').length} pending verifications</p>
        </div>
      </div>

      <div className="tabs-bar">
        {[{ key: 'pending', label: 'Pending' }, { key: 'verified', label: 'Verified' }, { key: 'rejected', label: 'Rejected' }].map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            <span className="tab-count">{workers.filter((w) => w.status === t.key).length}</span>
          </button>
        ))}
      </div>

      <div className="verification-grid">
        {filtered.map((worker) => (
          <div key={worker.id} className={`verification-card status-${worker.status}`}>
            <div className="vc-header">
              <div className="vc-avatar">{worker.name.split(' ').map((n) => n[0]).join('')}</div>
              <div>
                <h4 className="vc-name">{worker.name}</h4>
                <div className="vc-contact">
                  <span><HiOutlinePhone /> {worker.phone}</span>
                  <span><HiOutlineEnvelope /> {worker.email}</span>
                </div>
              </div>
            </div>
            <div className="vc-details">
              <div className="vc-detail"><span className="vc-label">Skills</span><div className="vc-skills">{worker.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}</div></div>
              <div className="vc-detail"><span className="vc-label">ID Proof</span><span className="vc-value">{worker.idProof}</span></div>
              <div className="vc-detail"><span className="vc-label">Experience</span><span className="vc-value">{worker.experience}</span></div>
              <div className="vc-detail"><span className="vc-label">City</span><span className="vc-value">{worker.city}</span></div>
              <div className="vc-detail"><span className="vc-label">Applied</span><span className="vc-value">{worker.appliedDate}</span></div>
              {worker.rating && (
                <div className="vc-detail"><span className="vc-label">Rating</span><span className="vc-value"><HiOutlineStar style={{ color: '#f59e0b' }} /> {worker.rating} ({worker.jobs} jobs)</span></div>
              )}
            </div>
            {worker.status === 'pending' && (
              <div className="vc-actions">
                <button className="btn btn-sm btn-primary" onClick={() => handleAction(worker.id, 'approve')}><HiOutlineCheckCircle /> Approve</button>
                <button className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: '#fecaca' }} onClick={() => handleAction(worker.id, 'reject')}><HiOutlineXCircle /> Reject</button>
              </div>
            )}
            {worker.status === 'verified' && <div className="vc-status-badge verified"><HiOutlineShieldCheck /> Verified</div>}
            {worker.status === 'rejected' && <div className="vc-status-badge rejected"><HiOutlineXCircle /> Rejected</div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state"><p>No {tab} workers</p></div>}
      </div>
    </div>
  );
};

export default WorkerVerification;
