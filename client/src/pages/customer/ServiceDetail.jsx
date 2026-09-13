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
    navigate(`/customer/book?service=${encodeURIComponent(t(service.nameKey))}&serviceId=${encodeURIComponent(service.id)}&category=${encodeURIComponent(service.category)}&tier=${activeTier}&price=${price}&date=${selectedDate}&slot=${selectedTimeSlot}`);
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
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100000,
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
              background: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url("${getServiceImage(service.id)}")`,
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
 
            {/* NEW: Trust & Safety / How It Works Card */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)', background: 'white' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineShieldCheck style={{ color: 'var(--primary-500)', fontSize: '1.4rem' }} /> ServeCircle Promise & Process
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-50)', padding: '10px', borderRadius: '50%', color: 'var(--primary-600)' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '4px' }}>Verified Professionals</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', lineHeight: 1.4 }}>100% background checked and skilled experts only.</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-50)', padding: '10px', borderRadius: '50%', color: 'var(--primary-600)' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '4px' }}>On-Time Arrival</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', lineHeight: 1.4 }}>Strict adherence to your selected time slot.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-50)', padding: '10px', borderRadius: '50%', color: 'var(--primary-600)' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '4px' }}>Transparent Pricing</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', lineHeight: 1.4 }}>No hidden charges. You pay what you see.</p>
                  </div>
                </div>
              </div>

              {/* Simple Timeline */}
              <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-100)' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '16px' }}>How it works</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', background: 'var(--primary-200)', zIndex: 1 }}></div>
                  
                  {['Book', 'Assign', 'Service', 'Relax'].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '8px', background: 'var(--gray-50)', padding: '0 10px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, border: '4px solid var(--gray-50)' }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-700)' }}>{step}</span>
                    </div>
                  ))}
                </div>
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
                    <input
                      type="date"
                      required
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '10px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}><HiOutlineClock /> {t('serviceDetail.selectTimeSlot')}</label>
                    <select
                      required
                      className="input-field"
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '10px', marginTop: '6px', width: '100%' }}
                    >
                      <option value="" disabled>Select a slot</option>
                      <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                      <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                      <option value="Flexible (Anytime)">Flexible (Anytime)</option>
                    </select>
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
