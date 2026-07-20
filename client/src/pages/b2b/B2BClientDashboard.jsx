import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineMapPin,
  HiOutlineBanknotes,
  HiOutlineBolt,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const B2BClientDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('b2bClient.dashboard.morning'));
    else if (hour < 17) setGreeting(t('b2bClient.dashboard.afternoon'));
    else setGreeting(t('b2bClient.dashboard.evening'));

    const saved = localStorage.getItem('b2bClientContracts');
    if (saved) setContracts(JSON.parse(saved));
  }, [t]);

  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalSpent = contracts.reduce((sum, c) => sum + (c.value || 0), 0);

  const upcomingServices = [
    { id: 'SRV-201', service: t('b2bClient.services.servicesList.s1'), tower: 'Tower A', date: '22 Jul 2026', time: '09:00 AM', status: 'confirmed', workers: 4 },
    { id: 'SRV-202', service: t('b2bClient.services.servicesList.s7'), tower: 'All Towers', date: '25 Jul 2026', time: '07:00 AM', status: 'confirmed', workers: 6 },
    { id: 'SRV-203', service: t('b2bClient.services.servicesList.s26'), tower: 'Common Area', date: '28 Jul 2026', time: '06:30 AM', status: 'pending', workers: 3 },
    { id: 'SRV-204', service: t('b2bClient.services.servicesList.s2'), tower: 'Tower B & D', date: '01 Aug 2026', time: '05:00 AM', status: 'pending', workers: 5 },
    { id: 'SRV-205', service: t('b2bClient.services.servicesList.s18'), tower: 'Tower C', date: '03 Aug 2026', time: '10:00 AM', status: 'confirmed', workers: 2 },
  ];

  const recentActivity = [
    { text: 'AC Maintenance completed for Tower A - 3rd Floor', time: '2 hours ago', type: 'success' },
    { text: 'Invoice INV-7023 generated for July Pest Control', time: '5 hours ago', type: 'info' },
    { text: 'New worker assigned for Swimming Pool Cleaning', time: '1 day ago', type: 'info' },
    { text: 'Fire Safety Audit completed - All Clear', time: '2 days ago', type: 'success' },
    { text: 'Plumbing emergency resolved - Tower D Basement', time: '3 days ago', type: 'success' },
    { text: 'Monthly SLA report generated & shared', time: '4 days ago', type: 'info' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.6rem' }}>
            {t('b2bClient.dashboard.greeting')} {greeting}, Rajesh 👋
          </h1>
          <p className="page-subtitle">
            {t('b2bClient.dashboard.welcomeTo')} <strong>Green Valley Society</strong> {t('b2bClient.dashboard.servicePortal')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/b2b/services')}>
          <HiOutlineBolt style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {t('b2bClient.common.bookService')}
        </button>
      </div>

      {/* KPI Strip */}
      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/contracts')}>
          <span className="b2b-kpi-label">{t('b2bClient.dashboard.kpis.activeAmcs')}</span>
          <span className="b2b-kpi-value">{activeContracts || 5}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/locations')}>
          <span className="b2b-kpi-label">{t('b2bClient.dashboard.kpis.towersBlocks')}</span>
          <span className="b2b-kpi-value">4</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/invoices')}>
          <span className="b2b-kpi-label">{t('b2bClient.dashboard.kpis.totalSpent')}</span>
          <span className="b2b-kpi-value">{t('b2bClient.common.rupees')}{totalSpent > 0 ? totalSpent.toLocaleString('en-IN') : '4,85,000'}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/history')}>
          <span className="b2b-kpi-label">{t('b2bClient.dashboard.kpis.servicesCompleted')}</span>
          <span className="b2b-kpi-value">47</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: t('b2bClient.dashboard.quickActions.bookCleaning'), path: '/b2b/services' },
          { label: t('b2bClient.dashboard.quickActions.bookPestControl'), path: '/b2b/services' },
          { label: t('b2bClient.dashboard.quickActions.viewContracts'), path: '/b2b/contracts' },
          { label: t('b2bClient.dashboard.quickActions.myTowers'), path: '/b2b/locations' },
          { label: t('b2bClient.dashboard.quickActions.payBills'), path: '/b2b/invoices' },
          { label: t('b2bClient.dashboard.quickActions.getSupport'), path: '/b2b/support' },
        ].map((action) => (
          <button
            key={action.label}
            className="b2b-card hover-lift"
            style={{ cursor: 'pointer', textAlign: 'center', padding: '14px', border: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-800)' }}
            onClick={() => navigate(action.path)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="b2b-two-col">
        {/* Upcoming Services */}
        <section className="b2b-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3><HiOutlineCalendarDays style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary-600)' }} />{t('b2bClient.dashboard.upcomingServices')}</h3>
            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/b2b/history')}>
              {t('b2bClient.common.viewAll')}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingServices.map((svc) => (
              <div
                key={svc.id}
                className="hover-lift"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderRadius: '10px',
                  border: '1px solid var(--gray-200)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => navigate('/b2b/history')}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-800)', fontSize: '0.95rem' }}>{svc.service}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                    <HiOutlineMapPin style={{ verticalAlign: 'middle' }} /> {svc.tower} &middot; {svc.workers} workers
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-700)' }}>{svc.date}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{svc.time}</div>
                  <span style={{
                    display: 'inline-block', marginTop: '4px',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                    background: svc.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                    color: svc.status === 'confirmed' ? '#166534' : '#854d0e',
                  }}>
                    {svc.status === 'confirmed' ? `✓ ${t('b2bClient.common.confirmed')}` : `⏳ ${t('b2bClient.common.pending')}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Society Profile Card */}
          <section className="b2b-card hover-lift" style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))', cursor: 'pointer' }} onClick={() => navigate('/b2b/locations')}>
            <h3 style={{ marginBottom: '12px' }}>{t('b2bClient.dashboard.societyProfile')}</h3>
            <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
              <div><strong>{t('b2bClient.dashboard.profile.name')}:</strong> Green Valley Society</div>
              <div><strong>{t('b2bClient.dashboard.profile.type')}:</strong> Residential Complex</div>
              <div><strong>{t('b2bClient.dashboard.profile.towers')}:</strong> 4 &middot; <strong>{t('b2bClient.dashboard.profile.flats')}:</strong> 192</div>
              <div><strong>{t('b2bClient.dashboard.profile.contact')}:</strong> Rajesh Mehta</div>
              <div><strong>{t('b2bClient.dashboard.profile.phone')}:</strong> +91 98765 43210</div>
              <div><strong>{t('b2bClient.dashboard.profile.registered')}:</strong> 15 Jan 2025</div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}>{t('b2bClient.dashboard.viewTowers')}</div>
          </section>

          {/* Recent Activity */}
          <section className="b2b-card">
            <h3 style={{ marginBottom: '12px' }}>
              <HiOutlineSparkles style={{ verticalAlign: 'middle', marginRight: '8px', color: '#eab308' }} />
              {t('b2bClient.dashboard.recentActivity')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="hover-lift"
                  style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                  onClick={() => navigate(item.text.includes('Invoice') ? '/b2b/invoices' : '/b2b/history')}
                >
                  {item.type === 'success' ? (
                    <HiOutlineCheckCircle style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <HiOutlineClock style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div>
                    <div style={{ color: 'var(--navy-700)' }}>{item.text}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '2px' }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default B2BClientDashboard;
