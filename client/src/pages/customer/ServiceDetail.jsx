import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import {
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineStar,
  HiOutlineClock, HiOutlineCalendar,
  HiOutlineShieldCheck, HiOutlineSparkles
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const ServiceDetail = () => {
  const { category, serviceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const service = servicesRegistry.find((s) => s.id === serviceId);
  const [activeTier, setActiveTier] = useState('standard'); // 'standard' or 'premium'
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [portfolioView, setPortfolioView] = useState('after'); // 'before' or 'after'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!service) {
    return (
      <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Service not found</h3>
        <Link to="/customer/services" className="btn btn-primary">Back to Directory</Link>
      </div>
    );
  }

  const categoryName = category ? category.replace('-', ' ') : 'Category';
  const price = activeTier === 'standard' ? service.standardPrice : service.premiumPrice;

  const mockReviews = [
    { name: 'Rohan Sharma', rating: 5, date: '2 days ago', text: `Superb! The worker arrived on time, was fully professional, and completed the work cleanly. Highly recommended.` },
    { name: 'Neha Patel', rating: 4, date: '1 week ago', text: `Good service. Kept the place tidy, very polite, and explained what parts were changed. Standard package was totally worth it.` },
    { name: 'Amit Verma', rating: 5, date: '2 weeks ago', text: `Very impressed with the portfolio items shown beforehand. The actual work was just as good. 10/10.` }
  ];

  const handleBookNow = (e) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      showToast('Please select a time slot!');
      return;
    }
    navigate(`/customer/book?service=${encodeURIComponent(t(service.nameKey))}&tier=${activeTier}&price=${price}&date=${selectedDate}&slot=${selectedTimeSlot}`);
  };

  const getBackgroundImage = (categoryId) => {
    switch (categoryId) {
      case 'home-repairs': return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
      case 'cleaning': return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';
      case 'vehicle-services': return 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=800&q=80';
      case 'furniture-decor': return 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80';
      case 'garden-outdoor': return 'https://images.unsplash.com/photo-1585320806052-a1f9435b671a?auto=format&fit=crop&w=800&q=80';
      case 'health-wellness': return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80';
      case 'pet-services': return 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80';
      case 'food-kitchen': return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80';
      case 'travel-commute': return 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80';
      default: return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
    }
  };

  return (
    <div className="page-content" style={{ position: 'relative' }}>
      
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: 'white', borderLeft: '4px solid var(--danger, #ef4444)',
          padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>!</div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-900)' }}>{toastMessage}</span>
        </div>
      )}
      
      {/* Back Button */}
      <Link to={`/customer/services/${category}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> {t('serviceDetail.backTo')} {categoryName.toUpperCase()}
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* TOP SECTION: Grid for Cards 1, 2 (Left) and Card 3 (Right) */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '28px' }}>
          
          {/* LEFT COLUMN: Card 1 (Info) & Card 2 (Portfolio) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* CARD 1: Main Info */}
            <div className="card" style={{ 
              padding: '28px', border: '1px solid var(--gray-200)',
              background: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url("${getBackgroundImage(category)}")`,
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)', textTransform: 'uppercase', background: 'var(--primary-50)', padding: '3px 8px', borderRadius: '4px' }}>
                    {categoryName}
                  </span>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy-800)', marginTop: '8px' }}>
                    {t(service.nameKey)}
                  </h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    ⭐ {service.rating} ({service.jobsDone}+ Done)
                  </span>
                </div>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '12px', lineHeight: 1.5 }}>
                {t(service.descKey)}
              </p>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '12px' }}>
                  {t('serviceDetail.whatIsIncluded')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {t(service.featuresKey, { returnObjects: true }).map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--navy-700)' }}>
                      <HiOutlineCheckCircle style={{ color: 'var(--primary-500)', fontSize: '1.05rem', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 2: Portfolio / Trust Builder */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)', background: 'white' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineSparkles style={{ color: 'var(--primary-500)' }} /> {t('serviceDetail.workPortfolio')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '18px' }}>
                {t('serviceDetail.portfolioDesc')}
              </p>

              <div style={{
                background: 'var(--navy-800)',
                borderRadius: 'var(--radius-lg)',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid var(--primary-100)'
              }}>
                {/* Inner content representing state */}
                <div style={{ padding: '24px', textAlign: 'center', zIndex: 2 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: portfolioView === 'before' ? 'var(--danger)' : 'var(--primary-500)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {portfolioView === 'before' ? t('serviceDetail.beforeState') : t('serviceDetail.afterState')}
                  </span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'white', marginTop: '14px' }}>
                    {portfolioView === 'before' ? t(`${service.beforeAfterKey}.before`) : t(`${service.beforeAfterKey}.after`)}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                    {t('serviceDetail.clickTabs')}
                  </p>
                </div>

                {/* Decorative background grids */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, opacity: 0.1, background: 'linear-gradient(45deg, #10b981 25%, transparent 25%), linear-gradient(-45deg, #10b981 25%, transparent 25%)', backgroundSize: '20px 20px' }} />
              </div>

              {/* Switch Toggle */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
                <button
                  onClick={() => setPortfolioView('before')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: portfolioView === 'before' ? '2px solid var(--danger)' : '1px solid var(--gray-200)',
                    background: portfolioView === 'before' ? 'var(--danger-50)' : 'white',
                    color: portfolioView === 'before' ? 'var(--danger-700)' : 'var(--gray-500)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    transition: 'all 0.15s'
                  }}
                >
                  {t('serviceDetail.showBefore')}
                </button>
                <button
                  onClick={() => setPortfolioView('after')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: portfolioView === 'after' ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                    background: portfolioView === 'after' ? 'var(--primary-50)' : 'white',
                    color: portfolioView === 'after' ? 'var(--primary-700)' : 'var(--gray-500)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    transition: 'all 0.15s'
                  }}
                >
                  {t('serviceDetail.showAfter')}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Card 3 (Tier Pricing & Time Slot Scheduling) */}
          <div>
            <div className="card" style={{ padding: '28px', border: '1.5px solid var(--primary-200)', background: 'white', position: 'sticky', top: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 850, marginBottom: '16px' }}>
                {t('serviceDetail.choosePackage')}
              </h3>
              
              {/* Tiers selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', background: 'var(--gray-100)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTier('standard')}
                  style={{
                    padding: '10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 750,
                    fontSize: '0.8rem',
                    background: activeTier === 'standard' ? 'white' : 'transparent',
                    color: activeTier === 'standard' ? 'var(--navy-800)' : 'var(--gray-500)',
                    boxShadow: activeTier === 'standard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {t('serviceDetail.standard')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTier('premium')}
                  style={{
                    padding: '10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 750,
                    fontSize: '0.8rem',
                    background: activeTier === 'premium' ? 'white' : 'transparent',
                    color: activeTier === 'premium' ? 'var(--navy-800)' : 'var(--gray-500)',
                    boxShadow: activeTier === 'premium' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {t('serviceDetail.premiumPro')}
                </button>
              </div>

              {/* Pricing details */}
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase' }}>{t('serviceDetail.tierPrice')}</span>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                    ₹{price}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  {activeTier === 'premium' ? (
                    <span style={{ color: 'var(--primary-600)', fontWeight: 800, display: 'block' }}>★ {t('serviceDetail.includesWarranty90')}</span>
                  ) : (
                    <span>{t('serviceDetail.includesWarranty30')}</span>
                  )}
                  <span>{t('serviceDetail.noHiddenFees')}</span>
                </div>
              </div>

              {/* Features specifically highlighted by Tier */}
              <div style={{ marginBottom: '24px', background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '8px' }}>
                  {activeTier === 'standard' ? t('serviceDetail.standardFeatures') : t('serviceDetail.premiumFeatures')}
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeTier === 'standard' ? (
                    <>
                      <li>• Vetted certified professional worker dispatched</li>
                      <li>• Standard quality repair materials and tools</li>
                      <li>• 30-day direct service assurance warranty</li>
                    </>
                  ) : (
                    <>
                      <li style={{ color: 'var(--primary-700)', fontWeight: 700 }}>• Priority matching (Dispatches in under 30-mins)</li>
                      <li style={{ color: 'var(--primary-700)', fontWeight: 700 }}>• Premium, high-durability original spare parts</li>
                      <li style={{ color: 'var(--primary-700)', fontWeight: 700 }}>• Extended 90-day comprehensive service warranty</li>
                      <li style={{ color: 'var(--primary-700)', fontWeight: 700 }}>• Senior Level-3 Certified Technician assignment</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Interactive inline scheduling */}
              <form onSubmit={handleBookNow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}><HiOutlineCalendar /> {t('serviceDetail.chooseDate')}</label>
                    <select
                      className="input-field"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <option value="Today">{t('serviceDetail.todayAvailable')}</option>
                      <option value="Tomorrow">{t('serviceDetail.tomorrow')}</option>
                      <option value="Day after tomorrow">{t('serviceDetail.dayAfterTomorrow')}</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}><HiOutlineClock /> {t('serviceDetail.selectTimeSlot')}</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '7:00 PM'].map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  {t('serviceDetail.proceedToCheckout')}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Card 4 (Reviews) Full Width or just placed nicely */}
        <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)', background: 'white' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px' }}>
            {t('serviceDetail.verifiedReviews')} (★ {service.rating})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {mockReviews.map((r, i) => (
              <div key={i} style={{ border: '1px solid var(--gray-100)', padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--gray-50)' }}>
                <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{r.name}</h5>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', fontSize: '0.75rem', marginTop: '3px' }}>
                  {Array.from({ length: r.rating }).map((_, idx) => <span key={idx}>★</span>)}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '8px', lineHeight: 1.5 }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ServiceDetail;
