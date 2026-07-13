import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineCalendarDays, HiOutlineWallet, HiOutlineClipboardDocumentCheck,
  HiOutlineStar, HiOutlineWrench, HiOutlineSparkles, HiOutlineTruck, HiOutlineBolt,
  HiOutlineClock, HiOutlineArrowRight, HiOutlineArrowUpRight, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';

const CustomerDashboard = () => {
  const { t } = useTranslation();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return t('common.goodMorning', 'Good Morning');
    if (hr < 17) return t('common.goodAfternoon', 'Good Afternoon');
    return t('common.goodEvening', 'Good Evening');
  };

  const stats = [
    { 
      icon: <HiOutlineCalendarDays />, 
      value: '3', 
      label: t('customer.activeBookings'), 
      color: '#3b82f6', 
      bg: 'rgba(59, 130, 246, 0.12)',
      trend: '1 scheduled today',
      trendClass: 'positive'
    },
    { 
      icon: <HiOutlineWallet />, 
      value: '₹2,450', 
      label: t('customer.walletBalance'), 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.12)',
      trend: '+₹150 cashback added',
      trendClass: 'positive'
    },
    { 
      icon: <HiOutlineClipboardDocumentCheck />, 
      value: '27', 
      label: t('customer.totalBookings'), 
      color: '#8b5cf6', 
      bg: 'rgba(139, 92, 246, 0.12)',
      trend: 'No cancellations',
      trendClass: 'neutral'
    },
    { 
      icon: <HiOutlineStar />, 
      value: 'Gold', 
      label: t('customer.subscriptions'), 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.12)',
      trend: 'Expires in 5 months',
      trendClass: 'neutral'
    },
  ];

  const quickServices = [
    { icon: <HiOutlineWrench />, name: t('dashboardTable.electrician'), color: '#3b82f6' },
    { icon: <HiOutlineSparkles />, name: t('dashboardTable.cleaning'), color: '#06b6d4' },
    { icon: <HiOutlineTruck />, name: t('dashboardTable.carRepair'), color: '#8b5cf6' },
    { icon: <HiOutlineBolt />, name: t('dashboardTable.emergency'), color: '#ef4444' },
  ];

  const recentBookings = [
    { id: '#SC-2841', service: t('dashboardTable.acServicing'), worker: 'Ramesh Kumar', date: '14 May 2026', status: t('dashboardTable.completed'), statusColor: 'success' },
    { id: '#SC-2839', service: t('dashboardTable.deepCleaning'), worker: 'Priya Sharma', date: '12 May 2026', status: t('dashboardTable.active'), statusColor: 'primary' },
    { id: '#SC-2835', service: t('dashboardTable.plumbingFix'), worker: 'Ajay Patel', date: '10 May 2026', status: t('dashboardTable.completed'), statusColor: 'success' },
    { id: '#SC-2830', service: t('dashboardTable.carWashing'), worker: 'Deepak Singh', date: '8 May 2026', status: t('dashboardTable.completed'), statusColor: 'success' },
  ];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      


      {/* 1. User Bookings & Stats (Grid spanning full screen width) */}
      <div className="stats-container">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="stat-card animate-fade-in-up" 
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-details">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className={`stat-trend ${stat.trendClass}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Express Booking Carousel */}
      <div className="dash-section" style={{ margin: 0 }}>
        <div className="dash-section-header">
          <div>
            <h3 className="dash-section-title">
              <span style={{ fontSize: '1.4rem' }}>⚡</span> Express Booking
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--navy-500)', fontSize: '0.85rem', fontWeight: 500 }}>
              Book instant-matching services in under 15 seconds.
            </p>
          </div>
        </div>

        <div className="express-carousel">
          {[
            { id: 'ac', name: 'AC Servicing', color: '#0ea5e9', bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80', price: 499 },
            { id: 'clean', name: 'Home Cleaning', color: '#8b5cf6', bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80', price: 999 },
            { id: 'plumb', name: 'Plumber', color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=200&q=80', price: 299 },
            { id: 'salon', name: 'Salon at Home', color: '#ec4899', bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80', price: 799 }
          ].map((svc) => (
            <Link 
              to={`/customer/book?service=${encodeURIComponent(svc.name)}&price=${svc.price}&expressMode=true`} 
              key={svc.id} 
              className="express-card"
            >
              <div className="express-image-wrapper" style={{ background: svc.bg }}>
                <img src={svc.img} alt={svc.name} style={{ opacity: 0.7, mixBlendMode: 'overlay' }} />
                <span className="express-badge" style={{ color: svc.color }}>
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
          {t('dashboardTable.quickBook')}
        </h3>
        <div className="quick-services-grid">
          {quickServices.map((svc, i) => (
            <Link to="/customer/services" key={i} className="quick-service-card">
              <div className="quick-service-icon" style={{ background: `${svc.color}12`, color: svc.color }}>
                {svc.icon}
              </div>
              <span className="quick-service-name">{svc.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Active Tracking Alerts */}
      <div className="dash-section" style={{ margin: 0 }}>
        <div className="dash-section-header">
          <h3 className="dash-section-title">Active Tracking Alerts</h3>
          <Link to="/customer/bookings" className="dash-view-all">
            {t('common.viewAll')} →
          </Link>
        </div>
        
        <div>
          {recentBookings.filter(b => b.status === t('dashboardTable.active') || b.statusColor === 'primary').length > 0 ? (
            recentBookings.filter(b => b.status === t('dashboardTable.active') || b.statusColor === 'primary').map((b) => (
              <Link 
                key={b.id} 
                to={`/customer/live-tracking?bookingId=${b.id.replace('#', '')}&service=${encodeURIComponent(b.service)}&worker=${encodeURIComponent(b.worker)}`} 
                className="active-tracking-pass"
                style={{ maxWidth: '640px' }}
              >
                <div className="tracking-header">
                  <span className="tracking-badge">
                    <span className="radar-dot" /> Live Map Tracking
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--navy-400)', fontWeight: 800 }}>
                    {b.id}
                  </span>
                </div>
                
                <h4 className="tracking-title">{b.service}</h4>
                
                <div className="ticket-divider">
                  <div className="ticket-line" />
                </div>
                
                <div className="tracking-worker-profile">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.worker)}&background=eef2ff&color=4f46e5`} 
                    alt={b.worker} 
                    className="tracking-worker-avatar"
                  />
                  <div>
                    <div className="tracking-worker-name">{b.worker}</div>
                    <div className="tracking-worker-eta">
                      <HiOutlineMapPin /> Arriving in 15 mins
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-tracking-card" style={{ maxWidth: '640px' }}>
              <span className="empty-tracking-icon">📭</span>
              <span className="empty-tracking-text">No active tracking alerts right now.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
