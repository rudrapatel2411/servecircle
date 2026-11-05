import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineBanknotes, HiOutlineUsers, HiOutlineShieldCheck,
  HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp,
  HiOutlinePhone, HiOutlineBell, HiOutlineClock,
} from 'react-icons/hi2';
import { socket } from '../../socket';
import { getSession } from '../../utils/authSession';
import { subscribeToCrossTabNotifications, getCachedNotifications } from '../../utils/notificationSync';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [liveAlerts, setLiveAlerts] = useState(() => {
    try {
      const cached = getCachedNotifications();
      return cached.slice(0, 5);
    } catch {
      return [];
    }
  });

  const stats = [
    { icon: <HiOutlineBanknotes />, value: '₹4,82,500', label: t('admin.totalRevenue'), color: '#3b7dc1', bg: '#e1ebf5' },
    { icon: <HiOutlineUsers />, value: '12,450', label: t('admin.activeUsers'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineShieldCheck />, value: '18', label: t('admin.pendingVerifications'), color: '#f59e0b', bg: '#fef3c7' },
    { icon: <HiOutlineExclamationTriangle />, value: '7', label: t('admin.openComplaints'), color: '#ef4444', bg: '#fee2e2' },
  ];

  const recentBookings = [
    { id: '#SC-2841', service: 'AC Servicing', customer: 'Rudra S.', worker: 'Ramesh K.', status: 'Completed', statusColor: 'success' },
    { id: '#SC-2840', service: 'Deep Cleaning', customer: 'Priya D.', worker: 'Sunita M.', status: 'Active', statusColor: 'primary' },
    { id: '#SC-2839', service: 'Plumbing', customer: 'Amit P.', worker: 'Rajesh V.', status: 'Active', statusColor: 'primary' },
    { id: '#SC-2838', service: 'Birthday Event', customer: 'Neha S.', worker: 'Team A', status: 'Pending', statusColor: 'warning' },
    { id: '#SC-2837', service: 'Car Wash', customer: 'Deepak K.', worker: 'Suresh T.', status: 'Completed', statusColor: 'success' },
  ];

  useEffect(() => {
    const handleNewAlert = (data) => {
      setLiveAlerts((prev) => [
        {
          id: data.id || `alert_${Date.now()}`,
          title: data.title || 'New Alert',
          message: data.message || '',
          type: data.type || 'alert',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.filter((a) => a.id !== data.id),
      ].slice(0, 8));
    };

    socket.on('admin_notification', handleNewAlert);
    socket.on('call_request', handleNewAlert);

    const unsubscribeCrossTab = subscribeToCrossTabNotifications((crossData) => {
      handleNewAlert(crossData);
    });

    return () => {
      socket.off('admin_notification', handleNewAlert);
      socket.off('call_request', handleNewAlert);
      unsubscribeCrossTab();
    };
  }, []);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management tools.</p>
        </div>
        <Link to="/admin/notifications" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <HiOutlineBell /> View All Notifications
        </Link>
      </div>

      {/* ── LIVE REAL-TIME INCOMING ACTIVITY TICKER ── */}
      {liveAlerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 12px #10b981',
                animation: 'pulse 1.5s infinite',
              }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'white', letterSpacing: '0.02em' }}>
                Live Customer Activity & Requests (Real-Time)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Auto-updating via Socket.IO
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liveAlerts.slice(0, 3).map((alert, idx) => (
              <div
                key={alert.id || idx}
                style={{
                  background: alert.type === 'call_request' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  border: `1px solid ${alert.type === 'call_request' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {alert.type === 'call_request' ? '📞' : '📋'}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'white', display: 'block' }}>
                      {alert.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {alert.message}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HiOutlineClock /> {alert.time || alert.date || 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-container">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div className="stat-details">
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
