import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBell, HiOutlinePaperAirplane, HiOutlineTrash,
  HiOutlineUsers, HiOutlineMegaphone, HiOutlineSparkles,
  HiOutlineCog6Tooth, HiOutlinePhone, HiOutlineArrowPath,
} from 'react-icons/hi2';
import { socket } from '../../socket';
import { getSession, API_BASE } from '../../utils/authSession';
import {
  subscribeToCrossTabNotifications,
  getCachedNotifications,
  dismissCachedNotification,
} from '../../utils/notificationSync';
import '../Dashboard.css';
import './AdminPages.css';

const renderTypeIcon = (type) => {
  switch (type) {
    case 'broadcast': return <HiOutlineMegaphone size={18} />;
    case 'promotion': return <HiOutlineSparkles size={18} />;
    case 'alert': return <HiOutlineBell size={18} />;
    case 'system': return <HiOutlineCog6Tooth size={18} />;
    case 'call_request': return <HiOutlinePhone size={18} />;
    default: return <HiOutlineBell size={18} />;
  }
};

const audienceLabels = {
  all: 'All Users',
  customers: 'Customers',
  workers: 'Workers',
  b2b: 'B2B Partners',
};

const typeColors = {
  broadcast: '#3b82f6',
  promotion: '#ec4899',
  alert: '#ef4444',
  system: '#8b5cf6',
  call_request: '#10b981',
  personal: '#f59e0b',
};

const AdminNotifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [liveNotifs, setLiveNotifs] = useState([]); // Real-time from socket
  const [callRequests, setCallRequests] = useState([]); // Active call requests
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'broadcast', audience: 'all' });

  const session = getSession();

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/all`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch {
      // Use live notifications if API fails
    } finally {
      setLoading(false);
    }
  };

  // Fetch active call requests
  const fetchCallRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/call-requests`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (res.ok) setCallRequests(data.requests || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchCallRequests();

    // Pre-seed live notifications and call requests from cross-tab cache
    try {
      const cached = getCachedNotifications();
      if (cached.length > 0) {
        setLiveNotifs(cached.map((c) => ({ ...c, _isLive: true, audience: c.targetAudience || 'all' })).slice(0, 25));
        const cachedCalls = cached
          .filter((c) => c.type === 'call_request' && c.requestId)
          .map((c) => ({
            requestId: c.requestId,
            customerName: c.customerName || 'Customer',
            serviceType: c.serviceType || 'Service',
            phone: c.phone,
            status: 'pending',
            createdAt: c.timestamp || new Date().toISOString(),
          }));
        if (cachedCalls.length > 0) {
          setCallRequests((prev) => {
            const merged = [...prev];
            for (const cc of cachedCalls) {
              if (!merged.find((r) => r.requestId === cc.requestId)) merged.push(cc);
            }
            return merged;
          });
        }
      }
    } catch {}

    // Listen to admin_notification events for real-time updates
    const handleLiveNotif = (data) => {
      setLiveNotifs((prev) => [
        {
          ...data,
          _isLive: true,
          audience: data.targetAudience || 'all',
          reads: data.reads || 0,
        },
        ...prev.filter((item) => (item._id || item.id) !== (data._id || data.id)),
      ].slice(0, 25));
    };

    const handleCallRequest = (data) => {
      setCallRequests((prev) => {
        if (prev.find((r) => r.requestId === data.requestId)) return prev;
        return [{ ...data, status: 'pending' }, ...prev];
      });
    };

    const handleCallTaken = (data) => {
      setCallRequests((prev) =>
        prev.map((r) =>
          r.requestId === data.requestId
            ? {
                ...r,
                status: data.cancelled ? 'cancelled' : 'accepted',
                acceptedByWorkerName: data.acceptedByWorkerName || data.workerName,
                acceptedByWorkerEmail: data.workerEmail || '',
              }
            : r
        )
      );
    };

    socket.on('admin_notification', handleLiveNotif);
    socket.on('call_request', handleCallRequest);
    socket.on('call_request_taken', handleCallTaken);

    // Cross-tab broadcast listener for immediate synchronization
    const unsubscribeCrossTab = subscribeToCrossTabNotifications((crossData) => {
      handleLiveNotif(crossData);
      if (crossData.type === 'call_request') {
        handleCallRequest(crossData);
      } else if (crossData.requestId && crossData.workerName) {
        handleCallTaken({
          requestId: crossData.requestId,
          acceptedByWorkerName: crossData.workerName,
          workerEmail: crossData.workerEmail,
        });
      }
    });

    return () => {
      socket.off('admin_notification', handleLiveNotif);
      socket.off('call_request', handleCallRequest);
      socket.off('call_request_taken', handleCallTaken);
      unsubscribeCrossTab();
    };
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) return;
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: form.type,
          targetAudience: form.audience,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        // Also emit via socket for real-time delivery
        // (The route handler should do this, but we update local state too)
        const newNotif = {
          ...data,
          _id: data._id || `notif_${Date.now()}`,
          reads: 0,
          audience: form.audience,
          date: new Date().toLocaleString('en-IN'),
        };
        setNotifications((p) => [newNotif, ...p]);
        setShowForm(false);
        setForm({ title: '', message: '', type: 'broadcast', audience: 'all' });
      }
    } catch {
      // Fallback: add locally
      const newNotif = {
        _id: `notif_${Date.now()}`,
        ...form,
        audience: form.audience,
        date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        reads: 0,
      };
      setNotifications((p) => [newNotif, ...p]);
      setShowForm(false);
      setForm({ title: '', message: '', type: 'broadcast', audience: 'all' });
    } finally {
      setSending(false);
    }
  };

  const deleteNotif = async (id) => {
    dismissCachedNotification(id);
    try {
      await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
    } catch { /* ignore */ }
    setNotifications((p) => p.filter((n) => (n._id || n.id) !== id));
    setLiveNotifs((p) => p.filter((n) => (n._id || n.id) !== id));
  };

  const allNotifs = [...liveNotifs, ...notifications].filter(
    (v, i, a) => a.findIndex((tItem) => (tItem._id || tItem.id) === (v._id || v.id)) === i
  );
  const activeOrAcceptedCalls = callRequests.filter((r) => r.status === 'pending' || r.status === 'accepted');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.notifications')}</h1>
          <p className="page-subtitle">
            Manage broadcast notifications &amp; monitor call requests
            {liveNotifs.length > 0 && (
              <span
                style={{
                  marginLeft: '10px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {liveNotifs.length} new live
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={() => { fetchNotifications(); fetchCallRequests(); }}
            title="Refresh"
          >
            <HiOutlineArrowPath />
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <HiOutlineMegaphone /> New Broadcast
          </button>
        </div>
      </div>

      {/* Active & Accepted Call Requests Panel */}
      {activeOrAcceptedCalls.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1.5px solid #bbf7d0',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#065f46', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlinePhone style={{ color: '#10b981' }} />
            Live Call Requests ({activeOrAcceptedCalls.filter((r) => r.status === 'pending').length} pending · {activeOrAcceptedCalls.filter((r) => r.status === 'accepted').length} accepted)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeOrAcceptedCalls.map((req) => (
              <div
                key={req.requestId}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 2px', fontSize: '0.88rem' }}>
                    {req.customerName} — {req.serviceType}
                  </p>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                    📞 +91 {req.phone} · {new Date(req.createdAt).toLocaleTimeString('en-IN')}
                  </p>
                </div>
                {req.status === 'accepted' ? (
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    ✅ Accepted by {req.acceptedByWorkerName || 'Worker'}{req.acceptedByWorkerEmail ? ` (${req.acceptedByWorkerEmail})` : ''}
                  </span>
                ) : (
                  <span
                    style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Waiting for worker...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Form */}
      {showForm && (
        <div className="admin-form-card animate-fade-in-up">
          <h3>Send Broadcast Notification</h3>
          <div className="input-group">
            <label>Title</label>
            <input className="input-field" placeholder="Notification title..." value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Message</label>
            <textarea className="input-field" rows={3} placeholder="Write your message here..." value={form.message} onChange={(e) => update('message', e.target.value)} />
          </div>
          <div className="form-grid" style={{ marginBottom: 0 }}>
            <div className="input-group">
              <label>Type</label>
              <select className="input-field" value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option value="broadcast">Broadcast</option>
                <option value="promotion">Promotion</option>
                <option value="alert">Alert</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="input-group">
              <label>Target Audience</label>
              <select className="input-field" value={form.audience} onChange={(e) => update('audience', e.target.value)}>
                <option value="all">All Users</option>
                <option value="customers">Customers Only</option>
                <option value="workers">Workers Only</option>
                <option value="b2b">B2B Partners</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!form.title || !form.message || sending}
            >
              <HiOutlinePaperAirplane /> {sending ? 'Sending...' : 'Send Now'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-list">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
            Loading notifications...
          </div>
        )}
        {allNotifs.map((n) => {
          const id = n._id || n.id;
          const color = typeColors[n.type] || '#6b7280';
          return (
            <div key={id} className="notif-card" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="notif-icon" style={{ color }}>{renderTypeIcon(n.type)}</div>
              <div className="notif-content">
                <h4 className="notif-title">
                  {n.title}
                  {n._isLive && (
                    <span
                      style={{
                        marginLeft: '8px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '1px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        verticalAlign: 'middle',
                      }}
                    >
                      LIVE
                    </span>
                  )}
                </h4>
                <p className="notif-message">{n.message}</p>
                <div className="notif-meta">
                  <span className="notif-audience">
                    <HiOutlineUsers /> {audienceLabels[n.audience || n.targetAudience] || 'All'}
                  </span>
                  <span className="notif-date">{n.date || (n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : '')}</span>
                  <span className="notif-reads">{(n.reads || 0).toLocaleString()} reads</span>
                </div>
              </div>
              <button className="btn-icon-sm danger" onClick={() => deleteNotif(id)}>
                <HiOutlineTrash />
              </button>
            </div>
          );
        })}
        {!loading && allNotifs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
            <HiOutlineBell style={{ fontSize: '3rem', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>No notifications yet</p>
            <p style={{ fontSize: '0.85rem' }}>Send a broadcast to notify users</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
