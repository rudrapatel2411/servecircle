import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
 HiOutlineCalendarDays, HiOutlineWallet, HiOutlineClipboardDocumentCheck,
 HiOutlineStar, HiOutlineWrench, HiOutlineSparkles, HiOutlineTruck, HiOutlineBolt,
 HiOutlineClock, HiOutlineArrowRight, HiOutlineArrowUpRight, HiOutlineMapPin, HiOutlineInbox,
 HiOutlineHome
} from 'react-icons/hi2';
import { getSession, requestApi } from '../../utils/authSession';
import '../Dashboard.css';

const CustomerDashboard = () => {
 const { t } = useTranslation();
 const [realBookings, setRealBookings] = useState([]);

 useEffect(() => {
 const session = getSession();
 if (!session?.token) return;
 requestApi('/bookings/my', { token: session.token })
 .then((data) => {
 if (Array.isArray(data) && data.length > 0) {
 const mapped = data.map((b) => ({
 id: b.bookingId ? `#${b.bookingId}` : `#SC-${String(b.id || b._id).slice(0, 6)}`,
 rawId: b.id || b._id,
 service: b.service || b.serviceName || 'Home Service',
 worker: b.worker?.name || 'Assigning Pro...',
 date: b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN') : 'Scheduled',
 status: ['completed', 'closed'].includes(b.status) ? t('dashboardTable.completed', 'Completed') : t('dashboardTable.active', 'Active'),
 statusColor: ['completed', 'closed'].includes(b.status) ? 'success' : 'primary',
 }));
 setRealBookings(mapped);
 }
 })
 .catch(() => {});
 }, []);

 // Dynamic time-based greeting
 const getGreeting = () => {
 const hr = new Date().getHours();
 if (hr < 12) return t('common.goodMorning', 'Good Morning');
 if (hr < 17) return t('common.goodAfternoon', 'Good Afternoon');
 return t('common.goodEvening', 'Good Evening');
 };

 const recentBookings = [
 { id: '#SC-2841', service: t('dashboardTable.acServicing', 'AC Servicing'), worker: 'Ramesh Kumar', date: '14 May 2026', status: t('dashboardTable.completed', 'Completed'), statusColor: 'success' },
 { id: '#SC-2839', service: t('dashboardTable.deepCleaning', 'Deep Cleaning'), worker: 'Priya Sharma', date: '12 May 2026', status: t('dashboardTable.active', 'Active'), statusColor: 'primary' },
 { id: '#SC-2835', service: t('dashboardTable.plumbingFix', 'Plumbing Fix'), worker: 'Ajay Patel', date: '10 May 2026', status: t('dashboardTable.completed', 'Completed'), statusColor: 'success' },
 { id: '#SC-2830', service: t('dashboardTable.carWashing', 'Car Washing'), worker: 'Deepak Singh', date: '8 May 2026', status: t('dashboardTable.completed', 'Completed'), statusColor: 'success' },
 ];

 const displayBookings = realBookings.length > 0 ? [...realBookings, ...recentBookings] : recentBookings;
 const activeBookings = displayBookings.filter(
 (b) => b.status === t('dashboardTable.active', 'Active') || b.statusColor === 'primary'
 );

   const stats = [
    { 
      icon: <HiOutlineCalendarDays />, 
      value: String(activeBookings.length), 
      label: 'Upcoming',
      iconBg: '#dcfce7',
      iconColor: '#15803d'
    },
    { 
      icon: <HiOutlineClipboardDocumentCheck />, 
      value: String(displayBookings.length || 5), 
      label: 'Completed',
      iconBg: '#dcfce7',
      iconColor: '#15803d'
    },
    { 
      icon: <HiOutlineWallet />, 
      value: '₹1,250', 
      label: 'Wallet Balance',
      iconBg: 'var(--sc-surface-secondary, #E2E8F0)',
      iconColor: 'var(--sc-dark-accent, #1E40AF)'
    },
  ];

 const quickServices = [
 { icon: <HiOutlineWrench />, name: t('dashboardTable.electrician', 'Electrician'), link: '/customer/general-services/repair-services' },
 { icon: <HiOutlineSparkles />, name: t('dashboardTable.cleaning', 'Cleaning'), link: '/customer/general-services/cleaning-services' },
 { icon: <HiOutlineTruck />, name: t('dashboardTable.carRepair', 'Car Repair'), link: '/customer/services/vehicle-services' },
 { icon: <HiOutlineBolt />, name: t('dashboardTable.emergency', 'Emergency'), link: '/customer/emergency' },
 ];

 const session = getSession();
 const userName = session?.user?.name || 'Rudra';

 return (
 <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
  
  {/* Welcome Header (Master Artboard Match) */}
  <div className="dash-welcome-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
    <div>
      <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sc-dark-accent, #1E40AF)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Welcome back, {userName}! <span style={{ fontSize: '1.6rem' }}>👋</span>
      </h1>
      <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--sc-text-secondary, #6B665C)', margin: 0 }}>
        Here's what's happening with your services.
      </p>
    </div>
  </div>

  {/* 1. Master Artboard 3-Card Stat Row */}
  <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: 0 }}>
    {stats.map((stat, i) => (
      <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E2E8F0)', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.iconBg, color: stat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0 }}>
          {stat.icon}
        </div>
        <div className="stat-details" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="stat-value" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--sc-dark-accent, #1E40AF)', lineHeight: 1.1 }}>{stat.value}</span>
          <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sc-text-secondary, #6B665C)', marginTop: '2px' }}>{stat.label}</span>
        </div>
      </div>
    ))}
  </div>

  {/* 2. Track Your Service in Real-Time Card (Master Artboard Match) */}
  <div className="track-realtime-card" style={{
    background: 'linear-gradient(135deg, #242D26 0%, #1A221C 100%)',
    borderRadius: '20px',
    padding: '24px 28px',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -4px rgba(26, 34, 28, 0.3)',
    border: '1px solid rgba(226, 232, 240, 0.15)',
    gap: '24px',
    flexWrap: 'wrap'
  }}>
    <div style={{ flex: '1 1 320px', zIndex: 2 }}>
      <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
        Track your service in real-time
      </h3>
      <p style={{ color: '#C5BFB5', fontSize: '0.88rem', margin: '0 0 18px 0', lineHeight: 1.45, maxWidth: '380px' }}>
        Know exactly where your worker is and get updates instantly.
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          background: 'rgba(250, 249, 246, 0.12)',
          color: '#E2E8F0',
          borderRadius: '100px',
          fontWeight: 700,
          fontSize: '0.84rem',
          border: '1px solid rgba(226, 232, 240, 0.22)',
          letterSpacing: '0.02em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86efac', display: 'inline-block' }} />
        Live GPS Simulation (Demo)
      </div>
    </div>

    {/* Mini Map Graphic (Reference Artboard Match) */}
    <div style={{
      width: '240px',
      height: '130px',
      borderRadius: '16px',
      background: '#EAE5DB',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
      border: '2px solid rgba(255, 255, 255, 0.25)',
      flexShrink: 0
    }}>
      <svg width="240" height="130" viewBox="0 0 240 130" style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect width="240" height="130" fill="#E8E2D5" />
        <path d="M-10 40 Q 60 70, 120 45 T 250 80" stroke="#FFFFFF" strokeWidth="8" fill="none" />
        <path d="M40 -10 L 100 140" stroke="#FFFFFF" strokeWidth="6" fill="none" />
        <path d="M150 -10 L 170 140" stroke="#FFFFFF" strokeWidth="6" fill="none" />
        <path d="M30 65 Q 90 35, 140 70 T 195 50" stroke="#536D57" strokeWidth="3" strokeDasharray="4 3" fill="none" />
      </svg>
      <div style={{
        position: 'absolute',
        right: '42px',
        top: '36px',
        color: '#dc2626',
        fontSize: '1.4rem',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      }}>
        <HiOutlineMapPin />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        background: 'rgba(15, 23, 42, 0.92)',
        color: '#FFFFFF',
        padding: '5px 10px',
        borderRadius: '8px',
        fontSize: '0.68rem',
        fontWeight: 700,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)'
      }}>
        <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Arriving in</span>
        <span style={{ color: '#86efac', fontWeight: 800 }}>5 min</span>
      </div>
    </div>
  </div>

  {/* Upcoming Bookings Section */}
 <div className="dash-section" style={{ margin: 0 }}>
 <div className="dash-section-header">
 <h3 className="dash-section-title">Upcoming Bookings</h3>
 <Link to="/customer/bookings" className="dash-view-all">
 View All →
 </Link>
 </div>
  <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg, 18px)', border: '1px solid var(--sc-surface-secondary, #E2E8F0)' }}>
  {activeBookings.length > 0 ? (
  activeBookings.slice(0, 1).map((b) => (
  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--sc-surface-secondary, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sc-primary-accent, #536D57)' }}>
  <HiOutlineWrench size={22} />
  </div>
  <div>
  <strong style={{ fontSize: '0.95rem', color: 'var(--sc-dark-accent, #1E40AF)', display: 'block' }}>{b.service}</strong>
  <span style={{ fontSize: '0.78rem', color: 'var(--sc-text-secondary, #6B665C)' }}>Tomorrow • 10:30 AM • {b.worker}</span>
  </div>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(83, 109, 87, 0.12)', color: 'var(--sc-primary-accent, #536D57)' }}>
  Confirmed
  </span>
  <Link
  to="/customer/bookings"
  title="View Booking Details"
  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sc-bg-primary, #FAF9F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sc-dark-accent, #1E40AF)', textDecoration: 'none' }}
  >
  <HiOutlineArrowRight size={14} />
  </Link>
  </div>
  </div>
  ))
  ) : (
  <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--sc-text-secondary, #6B665C)' }}>
  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--sc-bg-primary, #FAF9F6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sc-text-secondary, #6B665C)', marginBottom: '8px' }}>
  <HiOutlineCalendarDays size={22} />
  </div>
  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--sc-dark-accent, #1E40AF)', marginBottom: '4px' }}>
  No upcoming bookings
  </div>
  <div style={{ fontSize: '0.8rem' }}>
  You have no active bookings right now. Explore services to schedule your next visit.
  </div>
  </div>
  )}
  </div>
 </div>

 {/* Smart Home Cockpit Feature Banner */}
 <div className="card animate-fade-in-up" style={{
 background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
 border: '1px solid #334155',
 borderRadius: '16px',
 padding: '20px 24px',
 color: 'white',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 flexWrap: 'wrap',
 gap: '16px',
 boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
 margin: '0'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
 <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
 <HiOutlineHome />
 </div>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
 <span style={{ background: '#2563eb', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>SMART FEATURE</span>
 <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>● Home Health Score: 85/100 Protected</span>
 </div>
 <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>My Home Cockpit & Digital Warranty Vault</h4>
 <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
 Track 5 appliances, AI-scan invoices, routine maintenance timeline & Prime AMC coverage.
 </p>
 </div>
 </div>

 <Link
 to="/customer/my-home"
 className="btn btn-primary"
 style={{ background: '#2563eb', color: 'white', padding: '10px 22px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}
 >
 Open My Home <HiOutlineArrowRight />
 </Link>
 </div>

 {/* 2. Express Booking Carousel */}
 <div className="dash-section" style={{ margin: 0 }}>
 <div className="dash-section-header">
 <div>
 <h3 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineBolt style={{ color: 'var(--primary-700)' }} /> Express Booking
 </h3>
 <p style={{ margin: '4px 0 0 0', color: 'var(--navy-500)', fontSize: '0.85rem', fontWeight: 500 }}>
 Book instant-matching services in under 15 seconds.
 </p>
 </div>
 </div>

 <div className="express-carousel">
 {[
 { id: 'ac', name: 'AC Servicing', serviceId: 'ac-repair', category: 'home-repairs', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80', price: 499 },
 { id: 'clean', name: 'Home Cleaning', serviceId: 'deep-clean', category: 'cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80', price: 999 },
 { id: 'plumb', name: 'Plumber', serviceId: 'plumbing-fix', category: 'home-repairs', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=200&q=80', price: 299 },
 { id: 'salon', name: 'Salon at Home', serviceId: 'beauty-home', category: 'care-family', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80', price: 799 }
 ].map((svc) => (
 <Link 
 to={`/customer/book?service=${encodeURIComponent(svc.name)}&serviceId=${svc.serviceId}&category=${svc.category}&price=${svc.price}&expressMode=true`} 
 key={svc.id} 
 className="express-card"
 >
 <div className="express-image-wrapper">
 <img src={svc.img} alt={svc.name} />
 <span className="express-badge">
 <HiOutlineClock /> 15s Match
 </span>
 </div>
 <div className="express-info">
 <h4 className="express-title">{svc.name}</h4>
 <div className="express-footer">
 <span className="express-price">
 Starts <strong>₹{svc.price}</strong>
 </span>
 <span className="express-arrow-btn">
 <HiOutlineArrowRight />
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>

 {/* 3. Quick Booking */}
 <div className="dash-section" style={{ margin: 0 }}>
 <h3 className="dash-section-title" style={{ marginBottom: '16px' }}>
 {t('dashboardTable.quickBook', 'Quick Book')}
 </h3>
 <div className="quick-services-grid">
 {quickServices.map((svc, i) => (
 <Link to={svc.link || '/customer/services'} key={i} className="quick-service-card">
 <div className="quick-service-icon">
 {svc.icon}
 </div>
 <span className="quick-service-name">{svc.name}</span>
 <span className="quick-service-action">
 Book <HiOutlineArrowRight size={13} />
 </span>
 </Link>
 ))}
 </div>
 </div>

 {/* 4. Active Tracking Alerts */}
 <div className="dash-section" style={{ margin: 0 }}>
 <div className="dash-section-header">
 <h3 className="dash-section-title">Active Tracking Alerts</h3>
 <Link to="/customer/bookings" className="dash-view-all">
 {t('common.viewAll', 'View All')} →
 </Link>
 </div>
 
 <div className="active-tracking-grid">
 {activeBookings.length > 0 ? (
 activeBookings.map((b) => (
 <Link 
 key={b.id} 
 to={`/customer/live-tracking?bookingId=${encodeURIComponent(b.rawId || b.id.replace('#', ''))}&service=${encodeURIComponent(b.service)}&worker=${encodeURIComponent(b.worker)}`} 
 className="active-tracking-pass"
 >
 <div className="tracking-header">
 <span className="tracking-badge">
 <span className="radar-dot" /> Live Map Tracking
 </span>
 <span className="tracking-id">
 {b.id}
 </span>
 </div>
 
 <h4 className="tracking-title">{b.service}</h4>
 
 <div className="ticket-divider">
 <div className="ticket-line" />
 </div>
 
 <div className="tracking-worker-profile">
 <img 
 src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.worker)}&background=eff6ff&color=1d4ed8&bold=true`} 
 alt={b.worker} 
 className="tracking-worker-avatar"
 />
 <div className="tracking-worker-details">
 <div className="tracking-worker-name">{b.worker}</div>
 <div className="tracking-worker-eta">
 <HiOutlineMapPin /> Arriving in 15 mins
 </div>
 </div>
 <span className="tracking-track-btn">
 Track Live <HiOutlineArrowUpRight size={14} />
 </span>
 </div>
 </Link>
 ))
 ) : (
 <div className="empty-tracking-card">
 <span className="empty-tracking-icon">
 <HiOutlineInbox size={34} />
 </span>
 <span className="empty-tracking-text">No active tracking alerts right now.</span>
 </div>
 )}
 </div>
 </div>

 </div>
 );
};

export default CustomerDashboard;
