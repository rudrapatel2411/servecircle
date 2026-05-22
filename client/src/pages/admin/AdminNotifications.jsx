import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBell, HiOutlinePaperAirplane, HiOutlineTrash,
  HiOutlineUsers, HiOutlineMegaphone
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const mockNotifications = [
  { id: 1, title: 'Welcome to ServeCircle!', message: 'Thank you for joining ServeCircle. Book your first service and get 50% off!', type: 'broadcast', audience: 'all', date: '14 May 2026, 10:00 AM', reads: 8420 },
  { id: 2, title: 'Summer Cleaning Offer', message: 'Get 20% off on all cleaning services this month. Use code CLEAN20.', type: 'promotion', audience: 'customers', date: '12 May 2026, 3:00 PM', reads: 5230 },
  { id: 3, title: 'New Jobs Available', message: 'There are 5 new job requests in your area. Check them out!', type: 'alert', audience: 'workers', date: '13 May 2026, 9:00 AM', reads: 1890 },
  { id: 4, title: 'System Maintenance', message: 'Platform will be under maintenance on 18 May from 2-4 AM IST.', type: 'system', audience: 'all', date: '10 May 2026, 11:00 AM', reads: 12400 },
];

const typeIcons = { broadcast: '📢', promotion: '🎁', alert: '🔔', system: '⚙️' };
const audienceLabels = { all: 'All Users', customers: 'Customers', workers: 'Workers', b2b: 'B2B Partners' };

const AdminNotifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'broadcast', audience: 'all' });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSend = () => {
    const newNotif = { ...form, id: Date.now(), date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), reads: 0 };
    setNotifications((p) => [newNotif, ...p]);
    setShowForm(false);
    setForm({ title: '', message: '', type: 'broadcast', audience: 'all' });
  };

  const deleteNotif = (id) => setNotifications((p) => p.filter((n) => n.id !== id));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.notifications')} 🔔</h1>
          <p className="page-subtitle">Manage broadcast notifications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><HiOutlineMegaphone /> New Broadcast</button>
      </div>

      {showForm && (
        <div className="admin-form-card animate-fade-in-up">
          <h3>Send Broadcast Notification</h3>
          <div className="input-group"><label>Title</label><input className="input-field" placeholder="Notification title..." value={form.title} onChange={(e) => update('title', e.target.value)} /></div>
          <div className="input-group"><label>Message</label><textarea className="input-field" rows={3} placeholder="Write your message here..." value={form.message} onChange={(e) => update('message', e.target.value)} /></div>
          <div className="form-grid" style={{ marginBottom: 0 }}>
            <div className="input-group"><label>Type</label>
              <select className="input-field" value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option value="broadcast">Broadcast</option><option value="promotion">Promotion</option><option value="alert">Alert</option><option value="system">System</option>
              </select>
            </div>
            <div className="input-group"><label>Target Audience</label>
              <select className="input-field" value={form.audience} onChange={(e) => update('audience', e.target.value)}>
                <option value="all">All Users</option><option value="customers">Customers Only</option><option value="workers">Workers Only</option><option value="b2b">B2B Partners</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSend} disabled={!form.title || !form.message}><HiOutlinePaperAirplane /> Send Now</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="notifications-list">
        {notifications.map((n) => (
          <div key={n.id} className="notif-card">
            <div className="notif-icon">{typeIcons[n.type] || '📢'}</div>
            <div className="notif-content">
              <h4 className="notif-title">{n.title}</h4>
              <p className="notif-message">{n.message}</p>
              <div className="notif-meta">
                <span className="notif-audience"><HiOutlineUsers /> {audienceLabels[n.audience]}</span>
                <span className="notif-date">{n.date}</span>
                <span className="notif-reads">{n.reads.toLocaleString()} reads</span>
              </div>
            </div>
            <button className="btn-icon-sm danger" onClick={() => deleteNotif(n.id)}><HiOutlineTrash /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;
