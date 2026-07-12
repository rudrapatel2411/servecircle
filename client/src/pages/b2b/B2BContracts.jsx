import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const contracts = [
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

const B2BContracts = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContracts = useMemo(
    () => contracts.filter((contract) => statusFilter === 'all' || contract.status === statusFilter),
    [statusFilter]
  );

  const totalValue = filteredContracts.reduce((sum, contract) => sum + contract.value, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.conTitle', 'Contracts')}</h1>
          <p className="page-subtitle">{t('b2bExtended.conSubtitle', 'Track SLAs, renewal windows, and active contract value.')}</p>
        </div>
      </div>

      <div className="tabs-bar">
        {[
          { key: 'all', label: t('b2bExtended.tabAll', 'All') },
          { key: 'active', label: t('b2bExtended.tabActive', 'Active') },
          { key: 'renewal_due', label: t('b2bExtended.tabRenewal', 'Renewal Due') },
          { key: 'expired', label: t('b2bExtended.tabExpired', 'Expired') },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.visibleContracts', 'Visible Contracts')}</span>
          <span className="b2b-kpi-value">{filteredContracts.length}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.totalContractValue', 'Total Contract Value')}</span>
          <span className="b2b-kpi-value">Rs {totalValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.activeSites', 'Active Sites')}</span>
          <span className="b2b-kpi-value">{filteredContracts.reduce((sum, contract) => sum + contract.locations, 0)}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.renewalsNeeded', 'Renewals Needed')}</span>
          <span className="b2b-kpi-value">{filteredContracts.filter((contract) => contract.status === 'renewal_due').length}</span>
        </div>
      </div>

      <div className="b2b-contract-grid">
        {filteredContracts.map((contract) => (
          <div key={contract.id} className="b2b-contract-card">
            <div className="b2b-contract-head">
              <div>
                <span className="b2b-contract-type">{contract.type}</span>
                <h3 style={{ marginTop: 4 }}>{contract.name}</h3>
              </div>
              <span className={`b2b-chip ${contract.status === 'active' ? 'active' : contract.status === 'renewal_due' ? 'pending' : 'completed'}`}>
                {contract.status === 'renewal_due' ? t('b2bExtended.renewalDue', 'renewal due') : contract.status}
              </span>
            </div>
            <div className="b2b-contract-value">Rs {contract.value.toLocaleString('en-IN')}</div>
            <div className="b2b-meta-list">
              <span><HiOutlineDocumentText /> {contract.id}</span>
              <span><HiOutlineMapPin /> {contract.locations} locations</span>
              <span><HiOutlineCalendarDays /> {contract.startDate} - {contract.endDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default B2BContracts;
