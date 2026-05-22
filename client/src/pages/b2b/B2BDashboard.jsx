import { useTranslation } from 'react-i18next';
import {
  HiOutlineDocumentText,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';
import { b2bContractRows } from './B2BDashboardData';

const B2BDashboard = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: <HiOutlineDocumentText />, value: '3', label: t('b2b.activeContracts'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineMapPin />, value: '8', label: t('b2b.totalLocations'), color: '#10b981', bg: '#d1fae5' },
    { icon: <HiOutlineUserGroup />, value: '12', label: t('b2b.teamMembers'), color: '#8b5cf6', bg: '#ede9fe' },
    { icon: <HiOutlineReceiptPercent />, value: 'Rs 1,25,000', label: t('b2b.pendingInvoices'), color: '#f59e0b', bg: '#fef3c7' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">B2B Partner Dashboard</h1>
          <p className="page-subtitle">Manage your enterprise service contracts and team.</p>
        </div>
        <button className="btn btn-primary">{t('b2b.bulkBooking')}</button>
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

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Avg. SLA Compliance</span>
          <span className="b2b-kpi-value">96%</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Open Requests</span>
          <span className="b2b-kpi-value">5</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Upcoming Renewals</span>
          <span className="b2b-kpi-value">1</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Quarter Spend</span>
          <span className="b2b-kpi-value">Rs 2,34,800</span>
        </div>
      </div>

      <div className="dash-section">
        <h3 className="dash-section-title">{t('b2b.contracts')}</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Contract Type</th>
              <th>Locations</th>
              <th>Expires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {b2bContractRows.map((row, i) => (
              <tr key={i}>
                <td><strong>{row.name}</strong></td>
                <td>{row.type}</td>
                <td>{row.locations}</td>
                <td>{row.expires}</td>
                <td><span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default B2BDashboard;
