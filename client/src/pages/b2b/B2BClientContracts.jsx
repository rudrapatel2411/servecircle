import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const PRE_SEEDED_CONTRACTS = [
  { id: 'AMC-10024', name: 'Elevator Comprehensive AMC', type: 'AMC', vendor: 'Otis Elevator Co.', startDate: '01 Jan 2026', endDate: '31 Dec 2026', frequency: 'Monthly Checkup', value: 240000, status: 'active', locations: 4 },
  { id: 'AMC-10025', name: '24/7 Campus Security Security', type: 'AMC', vendor: 'SIS Security', startDate: '01 Apr 2026', endDate: '31 Mar 2027', frequency: 'Daily Deployment', value: 850000, status: 'active', locations: 5 },
  { id: 'AMC-10026', name: 'Pest Control (Common Areas)', type: 'AMC', vendor: 'Rentokil PCI', startDate: '15 Feb 2026', endDate: '14 Aug 2026', frequency: 'Monthly Service', value: 45000, status: 'renewal_due', locations: 4 },
  { id: 'AMC-10027', name: 'Swimming Pool Maintenance', type: 'AMC', vendor: 'AquaCare Systems', startDate: '01 May 2026', endDate: '30 Apr 2027', frequency: 'Weekly Cleaning', value: 120000, status: 'active', locations: 1 },
  { id: 'AMC-10028', name: 'Garden & Landscaping AMC', type: 'AMC', vendor: 'GreenScape Services', startDate: '01 Jan 2026', endDate: '31 Dec 2026', frequency: 'Bi-weekly Service', value: 180000, status: 'active', locations: 2 },
  { id: 'AMC-10029', name: 'Fire Safety Equipment Audit', type: 'Ad-hoc', vendor: 'SafeFire India', startDate: '10 Aug 2026', endDate: '12 Aug 2026', frequency: 'One Time', value: 35000, status: 'pending', locations: 4 },
  { id: 'AMC-10030', name: 'CCTV Network Maintenance', type: 'AMC', vendor: 'CP Plus Services', startDate: '01 Jun 2025', endDate: '31 May 2026', frequency: 'Quarterly Checkup', value: 95000, status: 'completed', locations: 5 },
  { id: 'AMC-10031', name: 'Water Tank Cleaning', type: 'Ad-hoc', vendor: 'Aquatech Cleaning', startDate: '20 Jul 2026', endDate: '21 Jul 2026', frequency: 'One Time', value: 15000, status: 'completed', locations: 4 },
];

const B2BClientContracts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('b2bClientContracts');
    if (!saved) {
      localStorage.setItem('b2bClientContracts', JSON.stringify(PRE_SEEDED_CONTRACTS));
      setContracts(PRE_SEEDED_CONTRACTS);
    } else {
      setContracts(JSON.parse(saved));
    }
  }, []);

  const filteredContracts = useMemo(() => 
    statusFilter === 'all' ? contracts : contracts.filter(c => c.status === statusFilter),
    [contracts, statusFilter]
  );

  const statusColors = {
    active: { bg: '#dcfce7', color: '#166534', label: t('b2bClient.common.active') },
    renewal_due: { bg: '#fee2e2', color: '#991b1b', label: t('b2bClient.contracts.renewalDue') },
    pending: { bg: '#fef9c3', color: '#854d0e', label: t('b2bClient.common.pending') },
    completed: { bg: '#f3f4f6', color: '#374151', label: t('b2bClient.common.completed') },
  };

  const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.contracts.title')}</h1>
          <p className="page-subtitle">{t('b2bClient.contracts.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/b2b/services')}>
          {t('b2bClient.common.bookService')}
        </button>
      </div>

      {/* KPIs */}
      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('active')}>
          <span className="b2b-kpi-label">{t('b2bClient.dashboard.kpis.activeAmcs')}</span>
          <span className="b2b-kpi-value">{contracts.filter(c => c.status === 'active').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('renewal_due')}>
          <span className="b2b-kpi-label">{t('b2bClient.contracts.renewalDue')}</span>
          <span className="b2b-kpi-value">{contracts.filter(c => c.status === 'renewal_due').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/invoices')}>
          <span className="b2b-kpi-label">{t('b2bClient.contracts.annualValue')}</span>
          <span className="b2b-kpi-value">{t('b2bClient.common.rupees')}{totalValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('all')}>
          <span className="b2b-kpi-label">{t('b2bClient.contracts.totalAgreements')}</span>
          <span className="b2b-kpi-value">{contracts.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {[
          { key: 'all', label: t('b2bClient.common.all') },
          { key: 'active', label: t('b2bClient.common.active') },
          { key: 'renewal_due', label: t('b2bClient.contracts.renewalDue') },
          { key: 'pending', label: t('b2bClient.common.pending') },
          { key: 'completed', label: t('b2bClient.common.completed') },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${statusFilter === tab.key ? 'tab-btn-active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contracts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {filteredContracts.map((contract) => {
          const sc = statusColors[contract.status] || statusColors.active;
          return (
            <div
              key={contract.id}
              className="b2b-card hover-lift"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setSelectedContract(contract)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{contract.id}</div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', marginTop: '2px' }}>{contract.name}</h3>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
              </div>
              {contract.vendor && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '8px' }}>
                  {t('b2bClient.common.vendor')}: <strong>{contract.vendor}</strong>
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '8px' }}>
                <span><HiOutlineCalendarDays style={{ verticalAlign: 'middle' }} /> {contract.startDate} - {contract.endDate}</span>
                {contract.frequency && <span>⏱️ {contract.frequency}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                  {t('b2bClient.common.rupees')}{contract.value.toLocaleString('en-IN')}/yr
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                  {contract.locations} {contract.locations === 1 ? t('b2bClient.dashboard.profile.towers').slice(0,-1) : t('b2bClient.dashboard.profile.towers')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="b2b-mini-btn" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate('/b2b/invoices', { state: { contractId: contract.id } }); }}>
                  {t('b2bClient.contracts.invoicesBtn')}
                </button>
                <button className="b2b-mini-btn" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate('/b2b/locations'); }}>
                  {t('b2bClient.contracts.towersBtn')}
                </button>
                {contract.status === 'renewal_due' && (
                  <button className="b2b-mini-btn" style={{ flex: 1, background: '#fef9c3', color: '#854d0e' }} onClick={(e) => { e.stopPropagation(); alert(`${t('b2bClient.contracts.renewalRequestSent')} "${contract.name}". ${t('b2bClient.contracts.salesTeamContact')}`); }}>
                    {t('b2bClient.contracts.renewBtn')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
          <p>{t('b2bClient.contracts.noContracts')}</p>
        </div>
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative',
          }}>
            <button onClick={() => setSelectedContract(null)} style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--gray-400)'
            }}>
              <HiOutlineXMark />
            </button>

            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '4px' }}>{selectedContract.id}</div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--navy-800)', marginBottom: '16px' }}>{selectedContract.name}</h2>

            <div style={{ display: 'grid', gap: '12px', fontSize: '0.9rem' }}>
              <div><strong>{t('b2bClient.contracts.detail.serviceType')}:</strong> {selectedContract.type}</div>
              {selectedContract.vendor && <div><strong>{t('b2bClient.common.vendor')}:</strong> {selectedContract.vendor}</div>}
              <div><strong>{t('b2bClient.contracts.detail.contractPeriod')}:</strong> {selectedContract.startDate} → {selectedContract.endDate}</div>
              {selectedContract.frequency && <div><strong>{t('b2bClient.contracts.detail.frequency')}:</strong> {selectedContract.frequency}</div>}
              <div><strong>{t('b2bClient.contracts.detail.towersCovered')}:</strong> {selectedContract.locations}</div>
              <div><strong>{t('b2bClient.contracts.annualValue')}:</strong> <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{t('b2bClient.common.rupees')}{selectedContract.value.toLocaleString('en-IN')}</span></div>
              <div><strong>{t('b2bClient.contracts.detail.monthlyCost')}:</strong> {t('b2bClient.common.rupees')}{Math.round(selectedContract.value / 12).toLocaleString('en-IN')}</div>
              <div>
                <strong>{t('b2bClient.common.status')}:</strong>{' '}
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                  background: (statusColors[selectedContract.status] || statusColors.active).bg,
                  color: (statusColors[selectedContract.status] || statusColors.active).color,
                }}>
                  {(statusColors[selectedContract.status] || statusColors.active).label}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={() => {
                setSelectedContract(null);
                navigate('/b2b/invoices', { state: { contractId: selectedContract.id } });
              }}>
                <HiOutlineBanknotes style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('b2bClient.contracts.invoicesBtn').replace('💰 ', '')}
              </button>
              <button className="btn btn-outline" onClick={() => {
                setSelectedContract(null);
                navigate('/b2b/locations');
              }}>
                {t('b2bClient.contracts.towersBtn')}
              </button>
              <button className="btn btn-outline" onClick={() => {
                setSelectedContract(null);
                navigate('/b2b/history');
              }}>
                {t('b2bClient.contracts.detail.serviceHistory')}
              </button>
              <button className="btn btn-outline" onClick={() => alert(`📄 ${t('b2bClient.contracts.detail.pdfGenerating').replace('Contract PDF', `"${selectedContract.name}" PDF`)}`)}>
                {t('b2bClient.contracts.detail.downloadPdf')}
              </button>
              {selectedContract.vendor && (
                <button className="btn btn-outline" onClick={() => alert(`📞 ${t('b2bClient.contracts.detail.connectingVendor').replace('Connecting you to vendor', `Connecting you to ${selectedContract.vendor}`)}`)}>
                  {t('b2bClient.contracts.detail.contactVendor')}
                </button>
              )}
              {selectedContract.status === 'renewal_due' && (
                <button className="btn btn-primary" style={{ background: '#eab308' }} onClick={() => alert(`🔄 ${t('b2bClient.contracts.renewalRequestSent')} "${selectedContract.name}". ${t('b2bClient.contracts.salesTeamContact')}`)}>
                  {t('b2bClient.contracts.detail.renewContract')}
                </button>
              )}
              {selectedContract.status === 'active' && (
                <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => alert(`⚠️ ${t('b2bClient.contracts.detail.cancelRequest')} ("${selectedContract.name}")`)}>
                  {t('b2bClient.contracts.detail.requestCancellation')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BClientContracts;
