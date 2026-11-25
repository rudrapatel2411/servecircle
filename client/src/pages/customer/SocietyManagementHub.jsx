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
  HiOutlineHomeModern,
  HiOutlineHeart,
  HiOutlineBolt
} from 'react-icons/hi2';
import { GlassCard, IconTile, PrimaryButton, StatusPill } from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';

const SocietyManagementHub = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content" style={{ minHeight: '92vh', background: 'var(--bg-page)', paddingBottom: '60px' }}>
      
      {/* Back Button */}
      <Link to="/customer/general-services" className="glass-sm" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--ink)', fontWeight: 600, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '22px', width: 'fit-content',
        padding: '10px 22px', borderRadius: '999px'
      }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>

      {/* Live Trackers & Dues Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '40px' }}>
        
        {/* Live Staff Tracker */}
        <GlassCard style={{ padding: '28px', borderRadius: '26px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineCheckCircle style={{ color: 'var(--blue)', fontSize: '1.5rem' }}/> {t('societyManagement.liveStaffTracker', 'Live Staff Tracker')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="sunken" style={{ padding: '14px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--ink)', display: 'block' }}>{t('societyManagement.sunita', 'Sunita (Housemaid)')}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink2)' }}>{t('societyManagement.enteredAt', 'Entered at 8:15 AM')}</span>
              </div>
              <StatusPill status="completed">{t('societyManagement.inside', 'Inside')}</StatusPill>
            </div>
            <div className="sunken" style={{ padding: '14px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--ink)', display: 'block' }}>{t('societyManagement.rajesh', 'Rajesh (Car Cleaner)')}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{t('societyManagement.lastSeen', 'Last seen yesterday 9:30 AM')}</span>
              </div>
              <StatusPill status="pending">{t('societyManagement.outside', 'Outside')}</StatusPill>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Core Society Services - Cards Design */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, paddingLeft: '12px', borderLeft: '4px solid var(--blue)', margin: 0 }}>
            {t('societyManagement.coreServices', 'Core Society Services')}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 600 }}>{t('societyManagement.discountedRates', 'Discounted Group Rates Applied')}</span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Service 1: RWA Collective Cleanups */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ marginBottom: '18px' }}>
                <IconTile icon={HiOutlineSparkles} tone="ok" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '10px' }}>
                {t('societyManagement.rwaCleanups', 'RWA Collective Cleanups')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.rwaCleanupsDesc', 'Book shared park cleanup, lift lobby pressure washing, or boundary wall paint touch-ups. Join with neighbors for discounts!')}
              </p>
              <div className="sunken" style={{ padding: '12px 14px', borderRadius: '16px', fontSize: '0.8rem', color: 'var(--ink2)', fontWeight: 600 }}>
                {t('societyManagement.oneHomeOff', '1 Home = 5% Off')}<br/>
                {t('societyManagement.twentyFiveHomes', '25 Homes =')} <span style={{ color: 'var(--status-danger-text)' }}>{t('societyManagement.twentyOff', '20% Off')}</span>
              </div>
            </div>
            <Link to="/customer/society-flow?type=cleanups" className="btn-primary" style={{ marginTop: '22px', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}>
              {t('societyManagement.startGroupBooking', 'Start Group Booking')}
            </Link>
          </div>

          {/* Service 2: Biometric Guard Roster */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ marginBottom: '18px' }}>
                <IconTile icon={HiOutlineShieldCheck} tone="info" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '10px' }}>
                {t('societyManagement.bioGuard', 'Biometric Guard Roster')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.bioGuardDesc', 'Deploy fully vetted, biometric-logged security personnel for gates and apartment blocks. Military veterans available.')}
              </p>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--ink2)', lineHeight: '1.8', margin: 0 }}>
                <li>{t('societyManagement.shift12', '12-hour daily shifts')}</li>
                <li>{t('societyManagement.monthlyDeploy', 'Monthly full deployment')}</li>
                <li>{t('societyManagement.fireSafety', 'Fire safety drill certified')}</li>
              </ul>
            </div>
            <Link to="/customer/society-flow?type=guards" className="btn-primary" style={{ marginTop: '22px', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}>
              {t('societyManagement.deployGuards', 'Deploy Guards')}
            </Link>
          </div>

          {/* Service 3: Society B2B Contracts */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ marginBottom: '18px' }}>
                <IconTile icon={HiOutlineDocumentText} tone="bad" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '10px' }}>
                {t('societyManagement.b2bContracts', 'Society B2B Contracts')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.b2bContractsDesc', 'Comprehensive monthly or quarterly maintenance contracts designed for the entire society campus.')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                <span className="pill s-slate">{t('societyManagement.pestControl', 'Pest Control')}</span>
                <span className="pill s-slate">{t('societyManagement.gardenMaint', 'Garden Maintenance')}</span>
                <span className="pill s-slate">{t('societyManagement.lobbyCleaning', 'Lobby Cleaning')}</span>
              </div>
            </div>
            <Link to="/customer/society-flow?type=contracts" className="btn-primary" style={{ marginTop: '22px', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}>
              {t('societyManagement.viewContracts', 'View Contracts')}
            </Link>
          </div>

          {/* Service 4: Packages by Society Size */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ marginBottom: '18px' }}>
                <IconTile icon={HiOutlineUserGroup} tone="violet" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '10px' }}>
                {t('societyManagement.customPackages', 'Customized Packages')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.customPackagesDesc', "Tailor-made service bundles based on your society's size. Enjoy scalable pricing and priority support.")}
              </p>
              <div className="sunken" style={{ padding: '12px 14px', borderRadius: '16px', fontSize: '0.8rem', color: 'var(--ink2)', fontWeight: 600 }}>
                {t('societyManagement.smallGroup', 'Small: 5+ Homes')}<br/>
                {t('societyManagement.mediumGroup', 'Medium: 10+ Homes')}<br/>
                {t('societyManagement.megaGroup', 'Mega: 15+ Homes')}
              </div>
            </div>
            <Link to="/customer/society-flow?type=packages" className="btn-primary" style={{ marginTop: '22px', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}>
              {t('societyManagement.explorePackages', 'Explore Packages')}
            </Link>
          </div>

        </div>
      </div>

      {/* Premium Society Experiences */}
      <div style={{ marginTop: '60px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '24px', paddingLeft: '12px', borderLeft: '4px solid var(--blue)' }}>
          {t('societyManagement.premiumExperiences', 'Premium Society Experiences')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Community Yoga & Zumba */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <IconTile icon={HiOutlineHeart} tone="violet" />
                <StatusPill status="in progress">Split with Neighbors</StatusPill>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '8px' }}>
                {t('societyManagement.yoga', 'Community Yoga & Zumba')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.yogaDesc', 'Hire a professional fitness instructor to come to your society park. Split costs with neighbors.')}
              </p>
              <div className="sunken" style={{ padding: '14px 16px', borderRadius: '16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginBottom: '4px' }}>Pricing &amp; Formats</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                  From ₹299/person <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink3)' }}>(or ₹1,499 private)</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#2B8663', fontWeight: 600, marginTop: '4px' }}>
                  Certified 500-HR Instructor • Sound System Included
                </div>
              </div>
            </div>
            <Link
              to="/customer/society-flow?type=community-fitness"
              className="btn-primary"
              style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}
            >
              {t('societyManagement.bookInstructor', 'Book Instructor')}
            </Link>
          </div>

          {/* EV Charger Installation */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <IconTile icon={HiOutlineBolt} tone="info" />
                <StatusPill status="confirmed">RWA NOC Facilitation</StatusPill>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '8px' }}>
                {t('societyManagement.evCharger', 'EV Charger Installation')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.evChargerDesc', 'Hassle-free Electric Vehicle charger setup at your personal parking spot with RWA NOC included.')}
              </p>
              <div className="sunken" style={{ padding: '14px 16px', borderRadius: '16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginBottom: '4px' }}>Setup &amp; Hardware</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                  From ₹4,999 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink3)' }}>(3.3kW to 7.4kW Fast Wallbox)</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#2B8663', fontWeight: 600, marginTop: '4px' }}>
                  Licensed EV Engineer • RFID Lock &amp; Shock MCB Included
                </div>
              </div>
            </div>
            <Link
              to="/customer/society-flow?type=ev-charger"
              className="btn-primary"
              style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}
            >
              {t('societyManagement.reqInstall', 'Request Installation')}
            </Link>
          </div>

          {/* Waterless Car Wash */}
          <div className="glass is-clickable" style={{
            borderRadius: '26px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <IconTile icon={HiOutlineSparkles} tone="teal" />
                <StatusPill status="completed">100% Waterless &amp; Eco</StatusPill>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '8px' }}>
                {t('societyManagement.waterWash', 'Waterless Car Wash')}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.55, marginBottom: '16px' }}>
                {t('societyManagement.waterWashDesc', 'Eco-friendly, RWA-approved daily car cleaning subscription right in your parking spot.')}
              </p>
              <div className="sunken" style={{ padding: '14px 16px', borderRadius: '16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginBottom: '4px' }}>Monthly Subscription</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                  ₹799/month onwards <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink3)' }}>(6 Days/Week Daily)</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#2B8663', fontWeight: 600, marginTop: '4px' }}>
                  Ultra-soft Microfiber • Scratch-Free &amp; Spill-Free
                </div>
              </div>
            </div>
            <Link
              to="/customer/society-flow?type=waterless-wash"
              className="btn-primary"
              style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px 20px', fontSize: '0.88rem' }}
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
