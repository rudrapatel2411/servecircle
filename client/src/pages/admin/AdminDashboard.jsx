import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineBanknotes, HiOutlineUsers, HiOutlineShieldCheck,
  HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp
} from 'react-icons/hi2';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();

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

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard 🏢</h1>
          <p className="page-subtitle">Platform overview and management tools.</p>
        </div>
      </div>

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
          <p>📊 Revenue chart will render here with Recharts integration</p>
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
