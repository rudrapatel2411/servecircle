import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineExclamationTriangle, HiOutlineCheckCircle,
  HiOutlineArrowUpCircle, HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const mockComplaints = [
  { id: 'CMP-1001', subject: 'AC making noise after servicing', desc: 'After the AC servicing was done, the AC is making a buzzing noise.', category: 'service_quality', priority: 'medium', status: 'open', filedBy: 'Rudra Shah', against: 'Ramesh Kumar', booking: '#SC-2841', date: '13 May 2026' },
  { id: 'CMP-1002', subject: 'Worker arrived 45 mins late', desc: 'The worker was 45 minutes late for the scheduled appointment.', category: 'delay', priority: 'low', status: 'resolved', filedBy: 'Priya Desai', against: 'Ajay Patel', booking: '#SC-2839', date: '11 May 2026', resolution: 'Refund of ₹100 issued. Worker warned.' },
  { id: 'CMP-1003', subject: 'Damage to kitchen counter', desc: 'During deep cleaning, the worker scratched the kitchen counter top.', category: 'damage', priority: 'high', status: 'in_progress', filedBy: 'Amit Patel', against: 'Sunita Mehra', booking: '#SC-2836', date: '12 May 2026' },
  { id: 'CMP-1004', subject: 'Wrong amount charged', desc: 'I was charged ₹800 instead of ₹500 for the service.', category: 'payment', priority: 'high', status: 'open', filedBy: 'Priya Desai', against: '', booking: '#SC-2837', date: '9 May 2026' },
  { id: 'CMP-1005', subject: 'Rude behaviour by worker', desc: 'The worker was very rude and unprofessional during the service.', category: 'worker_behaviour', priority: 'critical', status: 'escalated', filedBy: 'Amit Patel', against: 'Deepak Singh', booking: '', date: '14 May 2026' },
];

const priorityConfig = { low: { color: '#6b7280', bg: '#f3f4f6' }, medium: { color: '#f59e0b', bg: '#fef3c7' }, high: { color: '#ef4444', bg: '#fee2e2' }, critical: { color: '#991b1b', bg: '#fecaca' } };
const statusConfig = { open: { label: 'Open', color: 'warning' }, in_progress: { label: 'In Progress', color: 'primary' }, resolved: { label: 'Resolved', color: 'success' }, escalated: { label: 'Escalated', color: 'danger' }, closed: { label: 'Closed', color: 'default' } };

const AdminComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState(mockComplaints);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const updateStatus = (id, status) => {
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.complaints')} ⚠️</h1>
          <p className="page-subtitle">{complaints.filter((c) => ['open', 'in_progress', 'escalated'].includes(c.status)).length} active complaints</p>
        </div>
      </div>

      <div className="tabs-bar">
        {[{ key: 'all', label: 'All' }, { key: 'open', label: 'Open' }, { key: 'in_progress', label: 'In Progress' }, { key: 'escalated', label: 'Escalated' }, { key: 'resolved', label: 'Resolved' }].map((tab) => (
          <button key={tab.key} className={`tab-btn ${filter === tab.key ? 'active' : ''}`} onClick={() => setFilter(tab.key)}>
            {tab.label}<span className="tab-count">{tab.key === 'all' ? complaints.length : complaints.filter((c) => c.status === tab.key).length}</span>
          </button>
        ))}
      </div>

      <div className="complaints-list">
        {filtered.map((c) => {
          const pCfg = priorityConfig[c.priority];
          const sCfg = statusConfig[c.status];
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} className="complaint-card" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
              <div className="complaint-header">
                <div className="complaint-left">
                  <div className="complaint-id-row">
                    <span className="complaint-id">{c.id}</span>
                    <span className="priority-badge" style={{ color: pCfg.color, background: pCfg.bg }}>{c.priority}</span>
                    <span className={`badge badge-${sCfg.color}`}>{sCfg.label}</span>
                  </div>
                  <h4 className="complaint-subject">{c.subject}</h4>
                  <div className="complaint-meta">
                    <span>Filed by: <strong>{c.filedBy}</strong></span>
                    {c.against && <span>Against: <strong>{c.against}</strong></span>}
                    <span>{c.date}</span>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="complaint-body animate-fade-in-up">
                  <p className="complaint-desc">{c.desc}</p>
                  {c.booking && <p className="complaint-booking">Related booking: <strong>{c.booking}</strong></p>}
                  {c.resolution && <div className="complaint-resolution"><HiOutlineCheckCircle /> <span>{c.resolution}</span></div>}
                  {c.status !== 'resolved' && c.status !== 'closed' && (
                    <div className="complaint-actions">
                      {c.status === 'open' && <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'in_progress'); }}><HiOutlineChatBubbleLeftRight /> Start Investigation</button>}
                      {c.status === 'in_progress' && <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'resolved'); }}><HiOutlineCheckCircle /> Mark Resolved</button>}
                      {c.status !== 'escalated' && <button className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: '#fecaca' }} onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'escalated'); }}><HiOutlineArrowUpCircle /> Escalate</button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state"><p>No complaints found</p></div>}
      </div>
    </div>
  );
};

export default AdminComplaints;
