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
      label: t('customer.activeBookings'), 
      trend: `${activeBookings.length} scheduled`,
      trendClass: 'positive'
    },
    { 
      icon: <HiOutlineWallet />, 
      value: '₹2,450', 
      label: t('customer.walletBalance'), 
      trend: '+₹150 cashback added',
      trendClass: 'positive'
    },
    { 
      icon: <HiOutlineClipboardDocumentCheck />, 
      value: String(displayBookings.length), 
      label: t('customer.totalBookings'), 
      trend: 'No cancellations',
      trendClass: 'neutral'
    },
    { 
      icon: <HiOutlineStar />, 
      value: 'Gold', 
      label: t('customer.subscriptions'), 
      trend: 'Expires in 5 months',
      trendClass: 'neutral'
    },
  ];

  const quickServices = [
    { icon: <HiOutlineWrench />, name: t('dashboardTable.electrician', 'Electrician'), link: '/customer/general-services/repair-services' },
    { icon: <HiOutlineSparkles />, name: t('dashboardTable.cleaning', 'Cleaning'), link: '/customer/general-services/cleaning-services' },
    { icon: <HiOutlineTruck />, name: t('dashboardTable.carRepair', 'Car Repair'), link: '/customer/services/vehicle-services' },
    { icon: <HiOutlineBolt />, name: t('dashboardTable.emergency', 'Emergency'), link: '/customer/emergency' },
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
            <div className="stat-icon" style={{ background: 'rgba(17,24,39,0.06)', color: 'var(--gray-800)' }}>
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
        
        <div>
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
                  <div>
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
