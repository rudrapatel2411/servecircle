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
import {
  GlassCard,
  PrimaryButton,
  StatusPill,
  IconTile,
  IconButton,
  EmptyState,
} from '../../components/ui';
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
      .catch(() => { });
  }, [t]);

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
      iconComponent: HiOutlineCalendarDays,
      value: String(activeBookings.length),
      label: 'Upcoming',
      tone: 'teal'
    },
    {
      iconComponent: HiOutlineClipboardDocumentCheck,
      value: String(displayBookings.length || 5),
      label: 'Completed',
      tone: 'ok'
    },
    {
      iconComponent: HiOutlineWallet,
      value: '₹1,250',
      label: 'Wallet Balance',
      tone: 'info'
    },
  ];

  const quickServices = [
    { iconComponent: HiOutlineWrench, name: t('dashboardTable.electrician', 'Electrician'), link: '/customer/general-services/repair-services', tone: 'info' },
    { iconComponent: HiOutlineSparkles, name: t('dashboardTable.cleaning', 'Cleaning'), link: '/customer/general-services/cleaning-services', tone: 'teal' },
    { iconComponent: HiOutlineTruck, name: t('dashboardTable.carRepair', 'Car Repair'), link: '/customer/services/vehicle-services', tone: 'violet' },
    { iconComponent: HiOutlineBolt, name: t('dashboardTable.emergency', 'Emergency'), link: '/customer/emergency', tone: 'bad' },
  ];

  const session = getSession();
  const userName = session?.user?.name || 'Rudra';

  return (
    <div className="page-content customer-dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '8px 4px 32px' }}>

      {/* Welcome Header */}
      <div className="dash-welcome-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Outfit, sans-serif' }}>
            {getGreeting()}, {userName}!
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(22, 70, 214, 0.08)', color: 'var(--blue)' }}>
              <HiOutlineSparkles style={{ width: '20px', height: '20px' }} />
            </span>
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--ink2)', margin: 0 }}>
            Here's what's happening with your services.
          </p>
        </div>
      </div>

      {/* 1. Master 3-Card Stat Row */}
      <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: 0 }}>
        {stats.map((stat, i) => (
          <GlassCard key={i} clickable={true} index={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px' }}>
            <IconTile icon={stat.iconComponent} tone={stat.tone} />
            <div className="stat-details" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</span>
              <span className="stat-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink2)', marginTop: '4px' }}>{stat.label}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 2. Track Your Service in Real-Time Card */}
      <GlassCard className="track-realtime-card" style={{
        background: 'linear-gradient(135deg, rgba(15, 30, 75, 0.94) 0%, rgba(11, 20, 55, 0.98) 100%)',
        padding: '24px 28px',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 16px 36px -12px rgba(22, 70, 214, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.26)',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 320px', zIndex: 2 }}>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
            Track your service in real-time
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.88rem', margin: '0 0 18px 0', lineHeight: 1.45, maxWidth: '380px' }}>
            Know exactly where your worker is and get updates instantly.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              borderRadius: '100px',
              fontWeight: 600,
              fontSize: '0.82rem',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              userSelect: 'none'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Live GPS Simulation (Demo)
          </div>
        </div>

        {/* Mini Map Graphic */}
        <div style={{
          width: '240px',
          height: '130px',
          borderRadius: '18px',
          background: 'rgba(227, 235, 250, 0.7)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(22, 70, 214, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          flexShrink: 0
        }}>
          <svg width="240" height="130" viewBox="0 0 240 130" style={{ position: 'absolute', top: 0, left: 0 }}>
            <rect width="240" height="130" fill="rgba(227, 235, 250, 0.6)" />
            <path d="M-10 40 Q 60 70, 120 45 T 250 80" stroke="#FFFFFF" strokeWidth="8" fill="none" />
            <path d="M40 -10 L 100 140" stroke="#FFFFFF" strokeWidth="6" fill="none" />
            <path d="M150 -10 L 170 140" stroke="#FFFFFF" strokeWidth="6" fill="none" />
            <path d="M30 65 Q 90 35, 140 70 T 195 50" stroke="var(--blue)" strokeWidth="3" strokeDasharray="4 3" fill="none" />
          </svg>
          <div style={{
            position: 'absolute',
            right: '42px',
            top: '36px',
            color: 'var(--blue)',
            fontSize: '1.4rem',
            filter: 'drop-shadow(0 2px 4px rgba(22, 70, 214, 0.3))'
          }}>
            <HiOutlineMapPin />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(11, 30, 79, 0.88)',
            color: '#FFFFFF',
            padding: '5px 10px',
            borderRadius: '10px',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Arriving in</span>
            <span style={{ color: '#4ade80', fontWeight: 800 }}>5 min</span>
          </div>
        </div>
      </GlassCard>

      {/* Upcoming Bookings Section */}
      <div className="dash-section" style={{ margin: 0 }}>
        <div className="dash-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="dash-section-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            Upcoming Bookings
          </h3>
          <Link to="/customer/bookings" className="dash-view-all" style={{ color: 'var(--blue)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            View All <HiOutlineArrowRight size={14} />
          </Link>
        </div>
        <GlassCard style={{ padding: '18px 22px' }}>
          {activeBookings.length > 0 ? (
            activeBookings.slice(0, 1).map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <IconTile icon={HiOutlineWrench} tone="info" />
                  <div>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--ink)', display: 'block', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{b.service}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink2)' }}>Tomorrow • 10:30 AM • {b.worker}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StatusPill status="confirmed">Confirmed</StatusPill>
                  <Link
                    to="/customer/bookings"
                    title="View Booking Details"
                    className="glass-sm"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <HiOutlineArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={HiOutlineCalendarDays}
              title="No upcoming bookings"
              description="You have no active bookings right now. Explore services to schedule your next visit."
            />
          )}
        </GlassCard>
      </div>

      {/* Smart Home Cockpit Feature Banner */}
      <GlassCard style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(235, 243, 255, 0.8) 100%)',
        border: '1px solid rgba(22, 70, 214, 0.16)',
        padding: '22px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IconTile icon={HiOutlineHome} tone="info" style={{ width: '48px', height: '48px', fontSize: '22px' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="pill s-info" style={{ fontSize: '0.68rem', fontWeight: 700 }}>SMART FEATURE</span>
              <span className="pill s-ok" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Home Health Score: 85/100 Protected</span>
            </div>
            <h4 style={{ color: 'var(--ink)', margin: 0, fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>My Home Cockpit & Digital Warranty Vault</h4>
            <p style={{ color: 'var(--ink2)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Track 5 appliances, AI-scan invoices, routine maintenance timeline & Prime AMC coverage.
            </p>
          </div>
        </div>

        <Link
          to="/customer/my-home"
          className="btn-primary"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.88rem' }}
        >
          Open My Home <HiOutlineArrowRight />
        </Link>
      </GlassCard>

      {/* 3. Express Booking Carousel */}
      <div className="dash-section" style={{ margin: 0 }}>
        <div className="dash-section-header" style={{ marginBottom: '14px' }}>
          <div>
            <h3 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              <HiOutlineBolt style={{ color: 'var(--blue)' }} /> Express Booking
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--ink2)', fontSize: '0.85rem', fontWeight: 500 }}>
              Book instant-matching services in under 15 seconds.
            </p>
          </div>
        </div>

        <div className="express-carousel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { id: 'ac', name: 'AC Servicing', serviceId: 'ac-repair', category: 'home-repairs', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80', price: 499 },
            { id: 'clean', name: 'Home Cleaning', serviceId: 'deep-clean', category: 'cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80', price: 999 },
            { id: 'plumb', name: 'Plumber', serviceId: 'plumbing-fix', category: 'home-repairs', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=200&q=80', price: 299 },
            { id: 'salon', name: 'Salon at Home', serviceId: 'beauty-home', category: 'care-family', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80', price: 799 }
          ].map((svc) => (
            <Link
              to={`/customer/book?service=${encodeURIComponent(svc.name)}&serviceId=${svc.serviceId}&category=${svc.category}&price=${svc.price}&expressMode=true`}
              key={svc.id}
              className="express-card glass is-clickable"
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '26px' }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', height: '140px', width: '100%' }}>
                <img src={svc.img} alt={svc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="pill s-teal" style={{ position: 'absolute', top: '10px', right: '10px', backdropFilter: 'blur(12px)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineClock size={12} /> 15s Match
                </span>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--ink)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>{svc.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                  <span style={{ color: 'var(--ink2)', fontSize: '0.82rem' }}>
                    Starts <strong style={{ color: 'var(--blue)', fontSize: '1.05rem', fontWeight: 800 }}>₹{svc.price}</strong>
                  </span>
                  <span className="glass-sm" style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HiOutlineArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Quick Booking */}
      <div className="dash-section" style={{ margin: 0 }}>
        <h3 className="dash-section-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '14px' }}>
          {t('dashboardTable.quickBook', 'Quick Book')}
        </h3>
        <div className="quick-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {quickServices.map((svc, i) => (
            <Link
              to={svc.link || '/customer/services'}
              key={i}
              className="quick-service-card glass is-clickable"
              style={{
                textDecoration: 'none',
                padding: '24px 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '12px',
                borderRadius: '26px'
              }}
            >
              <IconTile icon={svc.iconComponent} tone={svc.tone} />
              <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif' }}>{svc.name}</span>
              <span style={{ color: 'var(--blue)', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Book <HiOutlineArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Active Tracking Alerts */}
      <div className="dash-section" style={{ margin: 0 }}>
        <div className="dash-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="dash-section-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            Active Tracking Alerts
          </h3>
          <Link to="/customer/bookings" className="dash-view-all" style={{ color: 'var(--blue)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {t('common.viewAll', 'View All')} <HiOutlineArrowRight size={14} />
          </Link>
        </div>

        <div className="active-tracking-grid">
          {activeBookings.length > 0 ? (
            activeBookings.map((b) => (
              <Link
                key={b.id}
                to={`/customer/live-tracking?bookingId=${encodeURIComponent(b.rawId || b.id.replace('#', ''))}&service=${encodeURIComponent(b.service)}&worker=${encodeURIComponent(b.worker)}`}
                className="active-tracking-pass"
                style={{ textDecoration: 'none', padding: '18px 22px', display: 'block' }}
              >
                <div className="tracking-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <StatusPill status="in-progress" label="Live Map Tracking" />
                  <span className="tracking-id" style={{ color: 'var(--ink3)', fontSize: '0.78rem', fontWeight: 600 }}>
                    {b.id}
                  </span>
                </div>

                <h4 className="tracking-title" style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 700, margin: '8px 0' }}>{b.service}</h4>

                <div style={{ height: '1px', background: 'rgba(22, 70, 214, 0.08)', margin: '12px 0' }} />

                <div className="tracking-worker-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.worker)}&background=eff6ff&color=1d4ed8&bold=true`}
                      alt={b.worker}
                      className="tracking-worker-avatar"
                      style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                    />
                    <div className="tracking-worker-details">
                      <div className="tracking-worker-name" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '0.88rem' }}>{b.worker}</div>
                      <div className="tracking-worker-eta" style={{ color: 'var(--status-success-text)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiOutlineMapPin size={13} /> Arriving in 15 mins
                      </div>
                    </div>
                  </div>
                  <span className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Track Live <HiOutlineArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <GlassCard style={{ padding: '24px' }}>
              <EmptyState
                icon={HiOutlineInbox}
                title="No active tracking alerts right now"
                description="When your booked service is in transit, live updates and ETA will appear right here."
              />
            </GlassCard>
          )}
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
