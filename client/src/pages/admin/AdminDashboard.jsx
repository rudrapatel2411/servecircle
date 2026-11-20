import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineBanknotes, HiOutlineUsers, HiOutlineShieldCheck,
  HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp,
  HiOutlinePhone, HiOutlineMapPin, HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { socket } from '../../socket';
import { getSession, requestApi } from '../../utils/authSession';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const session = getSession();
  const token = session?.token;

  const [activeSosList, setActiveSosList] = useState([]);
  const [resolvingId, setResolvingId] = useState('');

  const loadActiveSos = async () => {
    if (!token) return;
    try {
      const data = await requestApi('/users/worker/sos/active', { token });
      if (Array.isArray(data)) {
        setActiveSosList(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadActiveSos();
    const handleSos = (alertData) => {
      setActiveSosList((prev) => [alertData, ...prev.filter((item) => item.id !== alertData.id)]);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch {}
    };

    socket.on('emergency:sos_alert', handleSos);
    return () => {
      socket.off('emergency:sos_alert', handleSos);
    };
  }, [token]);

  const handleResolveSos = async (sosId) => {
    const note = prompt('Enter resolution summary / action taken:', 'Contacted worker, verified safe');
    if (note === null) return;
    setResolvingId(sosId);
    try {
      await requestApi(`/users/worker/sos/${sosId}/resolve`, {
        method: 'PATCH',
        body: { resolutionNote: note },
        token,
      });
      setActiveSosList((prev) => prev.filter((item) => item.id !== sosId));
      alert('SOS incident marked as resolved.');
    } catch (err) {
      alert(err.message || 'Failed to resolve SOS incident');
    } finally {
      setResolvingId('');
    }
  };

  const stats = [
    { icon: <HiOutlineBanknotes />, value: '₹4,82,500', label: t('admin.totalRevenue'), color: '#3b7dc1', bg: '#e1ebf5' },
    { icon: <HiOutlineUsers />, value: '12,450', label: t('admin.activeUsers'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineShieldCheck />, value: '18', label: t('admin.pendingVerifications'), color: '#f59e0b', bg: '#fef3c7' },
    { icon: <HiOutlineExclamationTriangle />, value: String(activeSosList.length + 7), label: t('admin.openComplaints'), color: '#ef4444', bg: '#fee2e2' },
  ];

  const recentBookings = [
    { id: '#SC-2841', service: 'AC Servicing', customer: 'Rudra S.', worker: 'Ramesh K.', status: 'Completed', statusColor: 'success' },
    { id: '#SC-2840', service: 'Deep Cleaning', customer: 'Priya D.', worker: 'Sunita M.', status: 'Active', statusColor: 'primary' },
    { id: '#SC-2839', service: 'Plumbing', customer: 'Amit P.', worker: 'Rajesh V.', status: 'Active', statusColor: 'primary' },
    { id: '#SC-2838', service: 'Birthday Event', customer: 'Neha S.', worker: 'Team A', status: 'Pending', statusColor: 'warning' },
    { id: '#SC-2837', service: 'Car Wash', customer: 'Deepak K.', worker: 'Suresh T.', status: 'Completed', statusColor: 'success' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management tools.</p>
        </div>
      </div>

      {/* M6 Active Emergency SOS Alert Desk */}
      {activeSosList.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {activeSosList.map((sos) => (
            <div
              key={sos.id}
              style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: '2px solid #dc2626',
                borderRadius: '12px',
                padding: '20px',
                color: '#991b1b',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)',
                marginBottom: '12px',
                animation: 'pulse 2s infinite',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#7f1d1d' }}>
                    🚨 WORKER EMERGENCY SOS TRIGGERED
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 700 }}>
                    Worker: {sos.worker?.name || 'Assigned Worker'} ({sos.worker?.phone || 'No phone'}) | Booking ID: {sos.bookingId || 'On-duty'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Trigger Reason:</strong> {sos.reason || 'Panic button pressed'}
                  </p>
                  {sos.latitude && sos.longitude && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HiOutlineMapPin /> GPS Location: {sos.latitude.toFixed(5)}, {sos.longitude.toFixed(5)}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${sos.latitude},${sos.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '6px' }}
                      >
                        Open in Google Maps ↗
                      </a>
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {sos.worker?.phone && (
                    <a
                      href={`tel:${sos.worker.phone}`}
                      className="btn btn-outline"
                      style={{ background: 'white', borderColor: '#b91c1c', color: '#b91c1c' }}
                    >
                      <HiOutlinePhone /> Call Worker
                    </a>
                  )}
                  <button
                    className="btn btn-primary"
                    style={{ background: '#dc2626' }}
                    disabled={resolvingId === sos.id}
                    onClick={() => handleResolveSos(sos.id)}
                  >
                    <HiOutlineCheckCircle /> {resolvingId === sos.id ? 'Resolving...' : 'Mark Incident Resolved'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="dash-section">
        <h3 className="dash-section-title"><HiOutlineArrowTrendingUp style={{ verticalAlign: 'middle' }} /> Revenue Trend</h3>
        <div className="chart-placeholder">
          <p>Revenue chart will render here with Recharts integration</p>
        </div>
      </div>

      {/* All Bookings */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3 className="dash-section-title">{t('admin.bookings')}</h3>
          <Link to="/admin/bookings" className="dash-view-all">{t('common.viewAll')} →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Worker</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.id}</strong></td>
                <td>{b.service}</td>
                <td>{b.customer}</td>
                <td>{b.worker}</td>
                <td><span className={`badge badge-${b.statusColor}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
