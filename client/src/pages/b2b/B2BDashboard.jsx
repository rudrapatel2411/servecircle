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
    { icon: <HiOutlineDocumentText />, value: '3', label: t('b2b.activeContracts', 'Active Contracts'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineMapPin />, value: '8', label: t('b2b.totalLocations', 'Total Locations'), color: '#3b7dc1', bg: '#e1ebf5' },
    { icon: <HiOutlineUserGroup />, value: '12', label: t('b2b.teamMembers', 'Team Members'), color: '#8b5cf6', bg: '#ede9fe' },
    { icon: <HiOutlineReceiptPercent />, value: 'Rs 1,25,000', label: t('b2b.pendingInvoices', 'Pending Invoices'), color: '#f59e0b', bg: '#fef3c7' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.dashTitle', 'B2B Partner Dashboard')}</h1>
          <p className="page-subtitle">{t('b2bExtended.dashSubtitle', 'Manage your enterprise service contracts and team.')}</p>
        </div>
        <button className="btn btn-primary">{t('b2b.bulkBooking', 'Bulk Booking')}</button>
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
          <span className="b2b-kpi-label">{t('b2bExtended.avgSla', 'Avg. SLA Compliance')}</span>
          <span className="b2b-kpi-value">96%</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.openRequests', 'Open Requests')}</span>
          <span className="b2b-kpi-value">5</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.upcomingRenewals', 'Upcoming Renewals')}</span>
          <span className="b2b-kpi-value">1</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.quarterSpend', 'Quarter Spend')}</span>
          <span className="b2b-kpi-value">Rs 2,34,800</span>
        </div>
      </div>

      <div className="dash-section">
        <h3 className="dash-section-title">{t('b2b.contracts', 'Contracts')}</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('b2bExtended.partner', 'Partner')}</th>
              <th>{t('b2bExtended.contractType', 'Contract Type')}</th>
              <th>{t('b2b.locations', 'Locations')}</th>
              <th>{t('b2bExtended.expires', 'Expires')}</th>
              <th>{t('b2bExtended.status', 'Status')}</th>
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
