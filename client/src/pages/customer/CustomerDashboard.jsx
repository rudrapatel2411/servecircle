import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineCalendarDays, HiOutlineWallet, HiOutlineClipboardDocumentCheck,
  HiOutlineStar, HiOutlineWrench, HiOutlineSparkles, HiOutlineTruck, HiOutlineBolt
} from 'react-icons/hi2';
import '../Dashboard.css';

const CustomerDashboard = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: <HiOutlineCalendarDays />, value: '3', label: t('customer.activeBookings'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineWallet />, value: '₹2,450', label: t('customer.walletBalance'), color: '#10b981', bg: '#d1fae5' },
    { icon: <HiOutlineClipboardDocumentCheck />, value: '27', label: t('customer.totalBookings'), color: '#8b5cf6', bg: '#ede9fe' },
    { icon: <HiOutlineStar />, value: 'Gold', label: t('customer.subscriptions'), color: '#f59e0b', bg: '#fef3c7' },
  ];

  const quickServices = [
    { icon: <HiOutlineWrench />, name: t('dashboardTable.electrician'), color: '#3b82f6' },
    { icon: <HiOutlineSparkles />, name: t('dashboardTable.cleaning'), color: '#06b6d4' },
    { icon: <HiOutlineTruck />, name: t('dashboardTable.carRepair'), color: '#8b5cf6' },
    { icon: <HiOutlineBolt />, name: t('dashboardTable.emergency'), color: '#ef4444' },
  ];

  const recentBookings = [
    { id: '#SC-2841', service: t('dashboardTable.acServicing'), worker: 'Ramesh Kumar', date: '14 May 2026', status: t('dashboardTable.completed'), statusColor: 'success' },
    { id: '#SC-2839', service: t('dashboardTable.deepCleaning'), worker: 'Priya Sharma', date: '12 May 2026', status: t('dashboardTable.active'), statusColor: 'primary' },
    { id: '#SC-2835', service: t('dashboardTable.plumbingFix'), worker: 'Ajay Patel', date: '10 May 2026', status: t('dashboardTable.completed'), statusColor: 'success' },
    { id: '#SC-2830', service: t('dashboardTable.carWashing'), worker: 'Deepak Singh', date: '8 May 2026', status: t('dashboardTable.completed'), statusColor: 'success' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('common.welcome')}, Rudra! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your services today.</p>
        </div>
        <Link to="/customer/services" className="btn btn-primary">{t('common.bookNow')}</Link>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Book */}
      <div className="dash-section">
        <h3 className="dash-section-title">{t('dashboardTable.quickBook')}</h3>
        <div className="quick-services-grid">
          {quickServices.map((svc, i) => (
            <Link to="/customer/services" key={i} className="quick-service-card">
              <div className="quick-service-icon" style={{ background: `${svc.color}15`, color: svc.color }}>
                {svc.icon}
              </div>
              <span className="quick-service-name">{svc.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3 className="dash-section-title">{t('customer.myBookings')}</h3>
          <Link to="/customer/bookings" className="dash-view-all">{t('common.viewAll')} →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('dashboardTable.bookingId')}</th>
              <th>{t('dashboardTable.service')}</th>
              <th>{t('dashboardTable.worker')}</th>
              <th>{t('dashboardTable.date')}</th>
              <th>{t('dashboardTable.status')}</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.id}</strong></td>
                <td>{b.service}</td>
                <td>{b.worker}</td>
                <td>{b.date}</td>
                <td><span className={`badge badge-${b.statusColor}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDashboard;
