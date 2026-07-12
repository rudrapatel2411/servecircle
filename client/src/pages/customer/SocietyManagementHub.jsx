import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HiOutlineArrowLeft, 
  HiOutlineShieldCheck, 
  HiOutlineUserGroup, 
  HiOutlineWallet, 
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineHomeModern
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const SocietyManagementHub = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content" style={{ minHeight: '92vh', background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* Back Button */}
      <Link to="/customer/services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> {t('societyManagement.backToDirectory', 'Back to Directory')}
      </Link>

      {/* Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #3b82f6',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '16px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <HiOutlineHomeModern style={{ fontSize: '2.5rem', color: '#60a5fa' }} />
          </div>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              {t('societyManagement.title', 'ServeCircle Society & RWA Portals 🤝')}
            </h1>
            <p className="page-subtitle" style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px', maxWidth: '600px', lineHeight: '1.5' }}>
              {t('societyManagement.subtitle', 'Exclusive maintenance, security, and cleaning solutions designed for residential societies with heavy group discounts.')}
            </p>
          </div>
        </div>
      </div>

      {/* Live Trackers & Dues Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '40px' }}>
        
        {/* Live Staff Tracker */}
        <div className="card" style={{ background: 'white', padding: '28px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: '1.5rem' }}/> {t('societyManagement.liveStaffTracker', 'Live Staff Tracker')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#166534', display: 'block' }}>{t('societyManagement.sunita', 'Sunita (Housemaid)')}</strong>
                <span style={{ fontSize: '0.75rem', color: '#15803d' }}>{t('societyManagement.enteredAt', 'Entered at 8:15 AM')}</span>
              </div>
              <span style={{ background: '#16a34a', color: 'white', padding: '6px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>🟢 {t('societyManagement.inside', 'Inside')}</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--gray-200)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--navy-700)', display: 'block' }}>{t('societyManagement.rajesh', 'Rajesh (Car Cleaner)')}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{t('societyManagement.lastSeen', 'Last seen yesterday 9:30 AM')}</span>
              </div>
              <span style={{ background: 'var(--gray-300)', color: 'var(--gray-700)', padding: '6px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>⚪ {t('societyManagement.outside', 'Outside')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Core Society Services - Cards Design */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', fontWeight: 900, paddingLeft: '12px', borderLeft: '4px solid #3b82f6', margin: 0 }}>
            {t('societyManagement.coreServices', 'Core Society Services')}
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{t('societyManagement.discountedRates', 'Discounted Group Rates Applied')}</span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Service 1: RWA Collective Cleanups */}
          <div className="service-card-hover" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--gray-100)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px' }}>
                <HiOutlineSparkles />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '12px' }}>
                {t('societyManagement.rwaCleanups', 'RWA Collective Cleanups')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.rwaCleanupsDesc', 'Book shared park cleanup, lift lobby pressure washing, or boundary wall paint touch-ups. Join with neighbors for discounts!')}
              </p>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--navy-700)', fontWeight: 600, border: '1px dashed #cbd5e1' }}>
                💡 {t('societyManagement.oneHomeOff', '1 Home = 5% Off')}<br/>
                🔥 {t('societyManagement.twentyFiveHomes', '25 Homes =')} <span style={{ color: '#ef4444' }}>{t('societyManagement.twentyOff', '20% Off')}</span>
              </div>
            </div>
            <Link to="/customer/society-flow?type=cleanups" className="btn" style={{ marginTop: '24px', background: '#16a34a', color: 'white', fontWeight: 700, padding: '12px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>
              {t('societyManagement.startGroupBooking', 'Start Group Booking')}
            </Link>
          </div>

          {/* Service 2: Biometric Guard Roster */}
          <div className="service-card-hover" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--gray-100)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px' }}>
                <HiOutlineShieldCheck />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '12px' }}>
                {t('societyManagement.bioGuard', 'Biometric Guard Roster')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.bioGuardDesc', 'Deploy fully vetted, biometric-logged security personnel for gates and apartment blocks. Military veterans available.')}
              </p>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.8', margin: 0 }}>
                <li>{t('societyManagement.shift12', '12-hour daily shifts')}</li>
                <li>{t('societyManagement.monthlyDeploy', 'Monthly full deployment')}</li>
                <li>{t('societyManagement.fireSafety', 'Fire safety drill certified')}</li>
              </ul>
            </div>
            <Link to="/customer/society-flow?type=guards" className="btn" style={{ marginTop: '24px', background: '#2563eb', color: 'white', fontWeight: 700, padding: '12px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>
              {t('societyManagement.deployGuards', 'Deploy Guards')}
            </Link>
          </div>

          {/* Service 3: Society B2B Contracts */}
          <div className="service-card-hover" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--gray-100)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px' }}>
                <HiOutlineDocumentText />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '12px' }}>
                {t('societyManagement.b2bContracts', 'Society B2B Contracts')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.b2bContractsDesc', 'Comprehensive monthly or quarterly maintenance contracts designed for the entire society campus.')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>{t('societyManagement.pestControl', 'Pest Control')}</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>{t('societyManagement.gardenMaint', 'Garden Maintenance')}</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>{t('societyManagement.lobbyCleaning', 'Lobby Cleaning')}</span>
              </div>
            </div>
            <Link to="/customer/society-flow?type=contracts" className="btn" style={{ marginTop: '24px', background: '#dc2626', color: 'white', fontWeight: 700, padding: '12px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>
              {t('societyManagement.viewContracts', 'View Contracts')}
            </Link>
          </div>

          {/* Service 4: Packages by Society Size */}
          <div className="service-card-hover" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--gray-100)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px' }}>
                <HiOutlineUserGroup />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '12px' }}>
                {t('societyManagement.customPackages', 'Customized Packages')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.customPackagesDesc', "Tailor-made service bundles based on your society's size. Enjoy scalable pricing and priority support.")}
              </p>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--navy-700)', fontWeight: 600, border: '1px dashed #cbd5e1' }}>
                🏢 {t('societyManagement.smallGroup', 'Small: 5+ Homes')}<br/>
                🏘️ {t('societyManagement.mediumGroup', 'Medium: 10+ Homes')}<br/>
                🏙️ {t('societyManagement.megaGroup', 'Mega: 15+ Homes')}
              </div>
            </div>
            <Link to="/customer/society-flow?type=packages" className="btn" style={{ marginTop: '24px', background: '#c026d3', color: 'white', fontWeight: 700, padding: '12px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>
              {t('societyManagement.explorePackages', 'Explore Packages')}
            </Link>
          </div>

        </div>
      </div>

      {/* Premium Society Experiences */}
      <div style={{ marginTop: '60px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '24px', paddingLeft: '12px', borderLeft: '4px solid #10b981' }}>
          {t('societyManagement.premiumExperiences', 'Premium Society Experiences')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Community Yoga & Zumba */}
          <div className="service-card-hover" style={{
            background: 'white',
            border: '1px solid var(--gray-100)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t('societyManagement.yoga', 'Community Yoga & Zumba')} 🧘‍♀️
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.yogaDesc', 'Hire a professional fitness instructor to come to your society park. Split costs with neighbors.')}
              </p>
            </div>
            <Link
              to="/customer/society-flow?type=community-fitness"
              className="btn"
              style={{ padding: '12px 16px', background: '#0f172a', color: 'white', fontWeight: 800, textAlign: 'center', borderRadius: '12px', textDecoration: 'none' }}
            >
              {t('societyManagement.bookInstructor', 'Book Instructor')}
            </Link>
          </div>

          {/* EV Charger Installation */}
          <div className="service-card-hover" style={{
            background: 'white',
            border: '1px solid var(--gray-100)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t('societyManagement.evCharger', 'EV Charger Installation')} ⚡
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.evChargerDesc', 'Hassle-free Electric Vehicle charger setup at your personal parking spot with RWA NOC included.')}
              </p>
            </div>
            <Link
              to="/customer/society-flow?type=ev-charger"
              className="btn"
              style={{ padding: '12px 16px', background: '#0f172a', color: 'white', fontWeight: 800, textAlign: 'center', borderRadius: '12px', textDecoration: 'none' }}
            >
              {t('societyManagement.reqInstall', 'Request Installation')}
            </Link>
          </div>

          {/* Waterless Car Wash */}
          <div className="service-card-hover" style={{
            background: 'white',
            border: '1px solid var(--gray-100)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t('societyManagement.waterWash', 'Waterless Car Wash')} 🚗✨
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                {t('societyManagement.waterWashDesc', 'Eco-friendly, RWA-approved daily car cleaning subscription right in your parking spot.')}
              </p>
            </div>
            <Link
              to="/customer/society-flow?type=waterless-wash"
              className="btn"
              style={{ padding: '12px 16px', background: '#0f172a', color: 'white', fontWeight: 800, textAlign: 'center', borderRadius: '12px', textDecoration: 'none' }}
            >
              {t('societyManagement.setupSub', 'Setup Subscription')}
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SocietyManagementHub;
