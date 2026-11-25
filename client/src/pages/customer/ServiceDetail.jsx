import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import {
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineStar,
  HiOutlineClock, HiOutlineCalendar,
  HiOutlineShieldCheck, HiOutlineSparkles
} from 'react-icons/hi2';
import {
  GlassCard,
  PrimaryButton,
  StatusPill,
  IconTile,
  GlassButton
} from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';
import { getServiceImage } from '../../utils/imageHelpers';

const ServiceDetail = () => {
  const { category, serviceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const service = servicesRegistry.find((s) => s.id === serviceId);
  const [activeTier, setActiveTier] = useState('standard'); // 'standard' or 'premium'
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!service) {
    return (
      <div className="page-content" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <GlassCard style={{ padding: '40px', borderRadius: '26px' }}>
          <h3 style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>Service not found</h3>
          <Link to="/customer/services" className="btn-primary" style={{ display: 'inline-flex', marginTop: '16px', textDecoration: 'none' }}>
            Back to Directory
          </Link>
        </GlassCard>
      </div>
    );
  }

  const categoryName = category ? category.replace('-', ' ') : 'Category';
  const price = activeTier === 'standard' ? service.standardPrice : service.premiumPrice;

  const mockReviews = [
    { name: 'Rohan Sharma', rating: 5, date: '2 days ago', text: 'Superb! The worker arrived on time, was fully professional, and completed the work cleanly. Highly recommended.' },
    { name: 'Neha Patel', rating: 4, date: '1 week ago', text: 'Good service. Kept the place tidy, very polite, and explained what parts were changed. Standard package was totally worth it.' },
    { name: 'Amit Verma', rating: 5, date: '2 weeks ago', text: 'Very impressed with the portfolio items shown beforehand. The actual work was just as good. 10/10.' }
  ];

  const handleBookNow = (e) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      showToast('Please select a time slot!');
      return;
    }
    navigate(`/customer/book?service=${encodeURIComponent(t(service.nameKey))}&serviceId=${encodeURIComponent(service.id)}&category=${encodeURIComponent(service.category)}&tier=${activeTier}&price=${price}&date=${selectedDate}&slot=${selectedTimeSlot}`);
  };

  return (
    <div className="page-content" style={{ position: 'relative', maxWidth: '1240px', margin: '0 auto', width: '100%', minHeight: '92vh', padding: '8px 4px 32px' }}>
      
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100000,
          background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(255, 255, 255, 0.95)',
          borderLeft: '4px solid #B64D47',
          padding: '14px 24px', borderRadius: '20px', boxShadow: '0 20px 48px -12px rgba(22, 70, 214, 0.28)',
          backdropFilter: 'blur(18px) saturate(150%)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span className="pill s-bad" style={{ fontWeight: 800 }}>!</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)' }}>{toastMessage}</span>
        </div>
      )}
      
      {/* Back Button */}
      <Link to={`/customer/services/${category}`} className="glass-sm" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '999px',
        color: 'var(--ink)', fontWeight: 600, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '22px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> {t('serviceDetail.backTo')} {categoryName.toUpperCase()}
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* TOP SECTION: Grid for Cards 1, 2 (Left) and Card 3 (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Card 1 (Info) & Card 2 (Process) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* CARD 1: Main Info */}
            <GlassCard style={{ 
              padding: '28px', borderRadius: '26px',
              background: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url("${getServiceImage(service.id)}")`,
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <StatusPill status="in progress">
                    {categoryName}
                  </StatusPill>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', marginTop: '10px', margin: '10px 0 0 0' }}>
                    {t(service.nameKey)}
                  </h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <StatusPill status="confirmed">
                    {service.rating} Rating ({service.jobsDone}+ Done)
                  </StatusPill>
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--ink2)', marginTop: '14px', lineHeight: 1.6 }}>
                {t(service.descKey)}
              </p>
              
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', marginBottom: '14px' }}>
                  {t('serviceDetail.whatIsIncluded')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {t(service.featuresKey, { returnObjects: true }).map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--ink2)' }}>
                      <HiOutlineCheckCircle style={{ color: 'var(--blue)', fontSize: '1.2rem', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
            
            {/* Card 2: Trust & Safety / How It Works */}
            <GlassCard style={{ padding: '28px', borderRadius: '26px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineShieldCheck style={{ color: 'var(--blue)', fontSize: '1.4rem' }} /> ServeCircle Promise & Process
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <IconTile icon={HiOutlineShieldCheck} tone="info" />
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>Verified Professionals</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', lineHeight: 1.4, margin: 0 }}>100% background checked and skilled experts only.</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <IconTile icon={HiOutlineClock} tone="teal" />
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>On-Time Arrival</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', lineHeight: 1.4, margin: 0 }}>Strict adherence to your selected time slot.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <IconTile icon={HiOutlineSparkles} tone="ok" />
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>Transparent Pricing</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', lineHeight: 1.4, margin: 0 }}>No hidden charges. You pay what you see.</p>
                  </div>
                </div>
              </div>

              {/* Simple Timeline */}
              <div style={{ background: 'rgba(255, 255, 255, 0.45)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(22, 70, 214, 0.08)' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.04em' }}>How it works</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '2px', background: 'rgba(22, 70, 214, 0.15)', zIndex: 1 }}></div>
                  
                  {['Book', 'Assign', 'Service', 'Relax'].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '8px', background: 'transparent', padding: '0 10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4C86FF, #1646D6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink)' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

          </div>

          {/* RIGHT COLUMN: Card 3 (Tier Pricing & Time Slot Scheduling) */}
          <div>
            <GlassCard style={{ padding: '28px', borderRadius: '26px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>
                {t('serviceDetail.choosePackage')}
              </h3>
              
              {/* Tiers selectors */}
              <div className="sunken" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px', padding: '6px', borderRadius: '999px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTier('standard')}
                  style={{
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: activeTier === 'standard' ? 'linear-gradient(135deg, #4C86FF, #1646D6)' : 'transparent',
                    color: activeTier === 'standard' ? '#ffffff' : 'var(--ink2)',
                    boxShadow: activeTier === 'standard' ? '0 8px 18px -4px rgba(22, 70, 214, 0.45)' : 'none',
                    transition: 'all 0.25s'
                  }}
                >
                  {t('serviceDetail.standard')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTier('premium')}
                  style={{
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: activeTier === 'premium' ? 'linear-gradient(135deg, #4C86FF, #1646D6)' : 'transparent',
                    color: activeTier === 'premium' ? '#ffffff' : 'var(--ink2)',
                    boxShadow: activeTier === 'premium' ? '0 8px 18px -4px rgba(22, 70, 214, 0.45)' : 'none',
                    transition: 'all 0.25s'
                  }}
                >
                  {t('serviceDetail.premiumPro')}
                </button>
              </div>

              {/* Pricing details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(22, 70, 214, 0.08)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase' }}>{t('serviceDetail.tierPrice')}</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{price}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--ink2)' }}>
                  {activeTier === 'premium' ? (
                    <span style={{ color: 'var(--blue)', fontWeight: 700, display: 'block' }}>{t('serviceDetail.includesWarranty90')}</span>
                  ) : (
                    <span>{t('serviceDetail.includesWarranty30')}</span>
                  )}
                  <span>{t('serviceDetail.noHiddenFees')}</span>
                </div>
              </div>

              {/* Features specifically highlighted by Tier */}
              <div style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.45)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(22, 70, 214, 0.08)', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                  {activeTier === 'standard' ? t('serviceDetail.standardFeatures') : t('serviceDetail.premiumFeatures')}
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeTier === 'standard' ? (
                    <>
                      <li style={{ color: 'var(--ink2)' }}>• Vetted certified professional worker dispatched</li>
                      <li style={{ color: 'var(--ink2)' }}>• Standard quality repair materials and tools</li>
                      <li style={{ color: 'var(--ink2)' }}>• 30-day direct service assurance warranty</li>
                    </>
                  ) : (
                    <>
                      <li style={{ color: 'var(--blue)', fontWeight: 600 }}>• Priority matching (Dispatches in under 30-mins)</li>
                      <li style={{ color: 'var(--blue)', fontWeight: 600 }}>• Premium, high-durability original spare parts</li>
                      <li style={{ color: 'var(--blue)', fontWeight: 600 }}>• Extended 90-day comprehensive service warranty</li>
                      <li style={{ color: 'var(--blue)', fontWeight: 600 }}>• Senior Level-3 Certified Technician assignment</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Interactive inline scheduling */}
              <form onSubmit={handleBookNow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}><HiOutlineCalendar /> {t('serviceDetail.chooseDate')}</label>
                    <div className="sunken" style={{ padding: '4px 14px', borderRadius: '16px' }}>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem', height: '40px', color: 'var(--ink)' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}><HiOutlineClock /> {t('serviceDetail.selectTimeSlot')}</label>
                    <div className="sunken" style={{ padding: '4px 14px', borderRadius: '16px' }}>
                      <select
                        required
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem', height: '40px', color: 'var(--ink)', cursor: 'pointer' }}
                      >
                        <option value="" disabled>Select a slot</option>
                        <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                        <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                        <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                        <option value="Flexible (Anytime)">Flexible (Anytime)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}>
                  {t('serviceDetail.proceedToCheckout')}
                </button>
              </form>
            </GlassCard>
          </div>

        </div>

        {/* BOTTOM SECTION: Card 4 (Reviews) */}
        <GlassCard style={{ padding: '28px', borderRadius: '26px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '18px' }}>
            {t('serviceDetail.verifiedReviews')} ({service.rating})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {mockReviews.map((r, i) => (
              <div key={i} style={{ border: '1px solid rgba(22, 70, 214, 0.08)', padding: '20px', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.45)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{r.name}</h5>
                  <span style={{ fontSize: '0.74rem', color: 'var(--ink3)' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', color: '#98691F', fontSize: '0.8rem', marginTop: '4px' }}>
                  {Array.from({ length: r.rating }).map((_, idx) => <HiOutlineStar key={idx} />)}
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', marginTop: '8px', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};

export default ServiceDetail;
