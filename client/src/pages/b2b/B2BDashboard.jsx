import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';
import { b2bContractRows } from './B2BDashboardData';

const initialContracts = [
  {
    id: 'CON-1001',
    name: 'Green Valley Society',
    type: 'Monthly Cleaning',
    value: 25000,
    locations: 4,
    startDate: '01 Jan 2026',
    endDate: '31 Dec 2026',
    status: 'active',
  },
  {
    id: 'CON-1002',
    name: 'TechPark Offices',
    type: 'Quarterly Maintenance',
    value: 20000,
    locations: 2,
    startDate: '01 Apr 2026',
    endDate: '31 Mar 2027',
    status: 'renewal_due',
  },
  {
    id: 'CON-1003',
    name: 'Sunrise Residency',
    type: 'Annual Package',
    value: 89000,
    locations: 6,
    startDate: '10 Feb 2026',
    endDate: '09 Feb 2027',
    status: 'active',
  },
];

const B2BDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [localContracts, setLocalContracts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('b2bContracts');
    if (saved) {
      setLocalContracts(JSON.parse(saved));
    } else {
      localStorage.setItem('b2bContracts', JSON.stringify(initialContracts));
      setLocalContracts(initialContracts);
    }
  }, []);

  const stats = [
    { icon: <HiOutlineDocumentText />, value: '3', label: t('b2b.activeContracts', 'Active Contracts'), color: '#3b82f6', bg: '#dbeafe' },
    { icon: <HiOutlineMapPin />, value: '8', label: t('b2b.totalLocations', 'Total Locations'), color: '#10b981', bg: '#d1fae5' },
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
        <button className="btn btn-primary" onClick={() => navigate('/b2b/booking')}>{t('b2b.bulkBooking', 'Bulk Booking')}</button>
      </div>

      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, cursor: 'pointer' }} onClick={() => navigate(i === 3 ? '/b2b/invoices' : (i === 2 ? '/b2b/team' : (i === 1 ? '/b2b/locations' : '/b2b/contracts')))}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/contracts')}>
          <span className="b2b-kpi-label">{t('b2bExtended.avgSla', 'Avg. SLA Compliance')}</span>
          <span className="b2b-kpi-value">96%</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/booking')}>
          <span className="b2b-kpi-label">{t('b2bExtended.openRequests', 'Open Requests')}</span>
          <span className="b2b-kpi-value">5</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/contracts')}>
          <span className="b2b-kpi-label">{t('b2bExtended.upcomingRenewals', 'Upcoming Renewals')}</span>
          <span className="b2b-kpi-value">1</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/invoices')}>
          <span className="b2b-kpi-label">{t('b2bExtended.quarterSpend', 'Quarter Spend')}</span>
          <span className="b2b-kpi-value">Rs 2,34,800</span>
        </div>
      </div>

      <div className="dash-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="dash-section-title" style={{ margin: 0 }}>{t('b2b.contracts', 'Contracts')}</h3>
          <span style={{ color: 'var(--primary-600)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => navigate('/b2b/contracts')}>View All</span>
        </div>
        <div className="table-responsive-wrapper">
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
              {localContracts.map((row, i) => (
                <tr key={i}>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.type}</td>
                  <td>{row.locations}</td>
                  <td>{row.endDate || row.startDate}</td>
                  <td><span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;
