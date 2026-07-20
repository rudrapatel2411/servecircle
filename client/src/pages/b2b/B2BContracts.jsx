import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
    name: 'Reliance Retail Chain',
    type: 'Comprehensive Facility Management',
    value: 1250000,
    locations: 12,
    startDate: '01 Jan 2026',
    endDate: '31 Dec 2026',
    status: 'active',
  },
  {
    id: 'CON-1002',
    name: 'TechPark IT Solutions',
    type: 'HVAC & Deep Cleaning AMC',
    value: 450000,
    locations: 2,
    startDate: '01 Apr 2026',
    endDate: '31 Mar 2027',
    status: 'renewal_due',
  },
  {
    id: 'CON-1003',
    name: 'HDFC Bank Branches',
    type: 'Corporate Security & Janitorial',
    value: 890000,
    locations: 8,
    startDate: '15 Feb 2026',
    endDate: '14 Feb 2027',
    status: 'active',
  },
  {
    id: 'CON-1004',
    name: 'Apollo Hospitals',
    type: 'Bio-Hazard Cleaning & Sanitization',
    value: 2100000,
    locations: 3,
    startDate: '01 Jun 2026',
    endDate: '31 May 2028',
    status: 'active',
  },
  {
    id: 'CON-1005',
    name: 'Prestige Residential Complex',
    type: 'Annual Maintenance Package',
    value: 320000,
    locations: 5,
    startDate: '10 Mar 2025',
    endDate: '09 Mar 2026',
    status: 'completed',
  },
  {
    id: 'CON-1006',
    name: 'Nexus Shopping Mall',
    type: 'Pest Control & Common Area Maintenance',
    value: 750000,
    locations: 1,
    startDate: '01 Jul 2026',
    endDate: '30 Jun 2027',
    status: 'active',
  }
];

const B2BContracts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [localContracts, setLocalContracts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('b2bContracts');
    if (saved) {
      let parsed = JSON.parse(saved);
      // Merge new realistic mock data seamlessly
      const missingContracts = contracts.filter(c => !parsed.some(p => p.id === c.id));
      if (missingContracts.length > 0) {
        parsed = [...parsed, ...missingContracts];
        localStorage.setItem('b2bContracts', JSON.stringify(parsed));
      }
      // Update name changes for old mock data (e.g. Green Valley -> Reliance)
      parsed = parsed.map(p => {
        const fresh = contracts.find(c => c.id === p.id);
        return fresh ? { ...p, name: fresh.name, type: fresh.type, value: fresh.value, locations: fresh.locations } : p;
      });
      localStorage.setItem('b2bContracts', JSON.stringify(parsed));
      setLocalContracts(parsed);
    } else {
      localStorage.setItem('b2bContracts', JSON.stringify(contracts));
      setLocalContracts(contracts);
    }
  }, []);

  const [activeContract, setActiveContract] = useState(null);

  const filteredContracts = useMemo(
    () => localContracts.filter((contract) => statusFilter === 'all' || contract.status === statusFilter),
    [localContracts, statusFilter]
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
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/contracts')}>
          <span className="b2b-kpi-label">{t('b2bExtended.visibleContracts', 'Visible Contracts')}</span>
          <span className="b2b-kpi-value">{filteredContracts.length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/invoices')}>
          <span className="b2b-kpi-label">{t('b2bExtended.totalContractValue', 'Total Contract Value')}</span>
          <span className="b2b-kpi-value">Rs {totalValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/locations')}>
          <span className="b2b-kpi-label">{t('b2bExtended.activeSites', 'Active Sites')}</span>
          <span className="b2b-kpi-value">{filteredContracts.reduce((sum, contract) => sum + contract.locations, 0)}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('renewal_due')}>
          <span className="b2b-kpi-label">{t('b2bExtended.renewalsNeeded', 'Renewals Needed')}</span>
          <span className="b2b-kpi-value">{filteredContracts.filter((contract) => contract.status === 'renewal_due').length}</span>
        </div>
      </div>

      <div className="b2b-contract-grid">
        {filteredContracts.map((contract) => (
          <div 
            key={contract.id} 
            className="b2b-contract-card hover-lift" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => setActiveContract(contract)}
          >
            <div className="b2b-contract-head" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px', marginBottom: '12px' }}>
              <div>
                <span className="b2b-contract-type" style={{ background: 'var(--primary-100)', color: 'var(--primary-800)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineDocumentText /> {contract.id}
                </span>
                <span className={`b2b-chip ${contract.status === 'active' ? 'active' : contract.status === 'renewal_due' ? 'pending' : 'completed'}`} style={{ marginLeft: '8px' }}>
                  {contract.status === 'renewal_due' ? t('b2bExtended.renewalDue', 'renewal due') : contract.status}
                </span>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client / Site</div>
              <h3 style={{ margin: '4px 0 12px 0', fontSize: '1.2rem', color: 'var(--navy-800)' }}>{contract.name}</h3>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Plan</div>
              <div style={{ margin: '4px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-700)' }}>{contract.type}</div>
            </div>

            <div className="b2b-contract-value" style={{ fontSize: '1.4rem', color: 'var(--primary-700)', marginBottom: '16px' }}>
              Rs {contract.value.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 400 }}>/ total</span>
            </div>

            <div className="b2b-meta-list" style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)' }}><HiOutlineMapPin /> {contract.locations} locations covered</span>
              <span style={{ color: 'var(--gray-600)' }}><HiOutlineCalendarDays /> {contract.startDate} to {contract.endDate}</span>
            </div>
            <div className="b2b-mini-actions" style={{ marginTop: '16px' }}>
              <button 
                className="b2b-mini-btn" 
                onClick={(e) => { e.stopPropagation(); navigate('/b2b/invoices', { state: { contractId: contract.id } }); }}
              >
                {t('b2bExtended.viewInvoices', 'View Invoices')}
              </button>
              <button 
                className="b2b-mini-btn" 
                onClick={(e) => { e.stopPropagation(); navigate('/b2b/locations', { state: { filterBranch: contract.name } }); }}
              >
                View Sites
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeContract && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="card animate-scale-in" style={{
            width: '100%', maxWidth: '500px', background: 'white',
            borderRadius: '16px', padding: '30px', boxShadow: 'var(--shadow-xl)', position: 'relative'
          }}>
            <button 
              onClick={() => setActiveContract(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'var(--gray-100)',
                border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <span className="b2b-contract-type" style={{ display: 'inline-block', marginBottom: '8px' }}>{activeContract.type}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy-800)', margin: '0 0 16px 0' }}>{activeContract.name}</h2>
            
            <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Contract ID</span>
                <span style={{ fontWeight: 700 }}>{activeContract.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Status</span>
                <span className={`b2b-chip ${activeContract.status === 'active' ? 'active' : activeContract.status === 'renewal_due' ? 'pending' : 'completed'}`}>
                  {activeContract.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Total Value</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-700)' }}>Rs {activeContract.value.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Locations Covered</span>
                <span style={{ fontWeight: 700 }}>{activeContract.locations} sites</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Valid From</span>
                <span style={{ fontWeight: 700 }}>{activeContract.startDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Valid To</span>
                <span style={{ fontWeight: 700 }}>{activeContract.endDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/b2b/invoices', { state: { contractId: activeContract.id } })}>View Invoices</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/b2b/locations', { state: { filterBranch: activeContract.name } })}>View Sites</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BContracts;
