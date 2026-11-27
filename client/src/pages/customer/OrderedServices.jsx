import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession, requestApi } from '../../utils/authSession';
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowLeft,
  HiOutlineStar,
  HiOutlineAcademicCap,
  HiOutlineQrCode,
  HiOutlineEyeSlash,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowUpRight,
} from 'react-icons/hi2';
import {
  GlassCard,
  StatusPill,
  PrimaryButton,
  GlassButton,
  IconTile,
  EmptyState,
} from '../../components/ui';
import WorkerVerifyModal from '../../components/WorkerVerifyModal';
import { getWorkflowBookings, subscribeWorkflowUpdates } from '../../utils/serviceWorkflowEngine';
import '../Dashboard.css';
import './CustomerPages.css';

// ── Mock active orders ──────────────────────────────────────────────
const mockOrders = [
  {
    id: '#SC-2841',
    service: 'AC Servicing (Deep Clean + Gas Refill)',
    category: 'Home Repairs',
    date: '20 Jul 2026',
    time: '3:00 PM',
    address: 'Satellite, Ahmedabad',
    amount: 799,
    status: 'en-route', // pending | confirmed | en-route | active | completed | cant-resolve
    startOtp: '8492',
    endOtp: '3751',
    worker: {
      name: 'Ramesh Kumar',
      tier: 'Senior Pro',
      rating: 4.9,
      jobsSolved: 1240,
      initials: 'RK',
    },
    trainee: {
      name: 'Karan Patel',
      tier: 'Rookie (Trainee)',
      rating: null,
      jobsSolved: 7,
      initials: 'KP',
    },
  },
  {
    id: '#SC-2840',
    service: 'Full Home Deep Cleaning',
    category: 'Cleaning & Hygiene',
    date: '21 Jul 2026',
    time: '10:00 AM',
    address: 'Prahlad Nagar, Ahmedabad',
    amount: 1200,
    status: 'confirmed',
    startOtp: '5523',
    endOtp: '9182',
    worker: {
      name: 'Sunita Mehra',
      tier: 'Junior Pro',
      rating: 4.7,
      jobsSolved: 312,
      initials: 'SM',
    },
    trainee: null,
  },
  {
    id: '#SC-2838',
    service: 'Electrical Wiring & Fan Installation',
    category: 'Home Repairs',
    date: '18 Jul 2026',
    time: '11:30 AM',
    address: 'SG Highway, Ahmedabad',
    amount: 600,
    status: 'completed',
    startOtp: null,
    endOtp: null,
    worker: {
      name: 'Ajay Patel',
      tier: 'Senior Pro',
      rating: 4.8,
      jobsSolved: 892,
      initials: 'AP',
    },
    trainee: null,
  },
];

const steps = ['Searching', 'Confirmed', 'En Route', 'Active', 'Completed'];
const stepKeys = ['pending', 'confirmed', 'en-route', 'active', 'completed'];

const OrderedServices = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('active');
  const [expandedId, setExpandedId] = useState('#SC-2841');
  const [endOtpInput, setEndOtpInput] = useState({});
  const [endOtpError, setEndOtpError] = useState({});
  const [realOrders, setRealOrders] = useState([]);

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
            category: b.category || 'Home Repairs',
            date: b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled',
            time: b.scheduledTime || '10:00 AM',
            address: b.address || 'Address provided',
            amount: b.amount || 299,
            status: b.status === 'in-progress' ? 'active' : b.status || 'pending',
            startOtp: b.startOtp || null,
            endOtp: b.endOtp || null,
            worker: b.worker ? {
              name: b.worker.name,
              tier: 'Verified Pro',
              rating: 4.9,
              jobsSolved: 240,
              initials: (b.worker.name || 'Pro').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
              phone: b.worker.phone,
            } : {
              name: 'Assigning Pro...',
              tier: 'Matching',
              rating: 5.0,
              jobsSolved: 0,
              initials: 'SC',
            },
            trainee: null,
          }));
          setRealOrders(mapped);
          if (mapped[0]) setExpandedId(mapped[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Trust & Safety QR Verification status tracker per booking
  const [verifiedBookings, setVerifiedBookings] = useState({
    '#SC-2841': searchParams.get('verified') === 'true',
  });
  const [verifyModalBookingId, setVerifyModalBookingId] = useState(null);

  const [workflowOrders, setWorkflowOrders] = useState([]);

  useEffect(() => {
    const loadWorkflowOrders = () => {
      try {
        const raw = getWorkflowBookings();
        const mapped = (raw || []).map((b) => ({
          id: b.id.startsWith('#') ? b.id : `#${b.id}`,
          rawId: b.id,
          service: b.service || b.serviceName,
          category: b.category,
          date: b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
          time: b.scheduledTime || 'Immediate',
          address: b.address,
          amount: b.finalAmount || b.amount || 499,
          status: b.status === 'in-progress' ? 'active' : (b.status === 'cancelled_visiting_fee' ? 'cancelled' : (b.status === 'verified' || b.status === 'before_photo_uploaded' ? 'active' : b.status)),
          startOtp: b.startOtp,
          endOtp: '9182',
          worker: b.worker ? {
            name: b.worker.name,
            tier: b.worker.tier || 'Verified Pro',
            rating: b.worker.rating || 4.9,
            jobsSolved: b.worker.jobsSolved || 240,
            initials: (b.worker.name || 'Pro').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
            phone: b.worker.phone,
          } : {
            name: 'Assigning Specialist...',
            tier: '15km Area Matching',
            rating: 5.0,
            jobsSolved: 0,
            initials: 'SC',
          },
          trainee: null,
        }));
        setWorkflowOrders(mapped);
      } catch (e) {}
    };

    loadWorkflowOrders();
    const unsub = subscribeWorkflowUpdates(() => {
      loadWorkflowOrders();
    });
    return unsub;
  }, []);

  const combinedOrders = [...workflowOrders, ...(realOrders.length > 0 ? realOrders : []), ...mockOrders];

  const activeOrders = activeTab === 'all' ? combinedOrders
    : activeTab === 'active' ? combinedOrders.filter((o) => !['completed', 'cancelled', 'cant-resolve'].includes(o.status))
    : combinedOrders.filter((o) => o.status === 'completed' || o.status === 'cant-resolve');

  const handleVerifyEndOtp = (order) => {
    const entered = endOtpInput[order.id] || '';
    if (entered === order.endOtp) {
      setEndOtpError((prev) => ({ ...prev, [order.id]: '' }));
      window.location.href = `/customer/reviews/post/${encodeURIComponent(order.rawId || order.id.replace('#', ''))}?worker=${encodeURIComponent(order.worker.name)}&service=${encodeURIComponent(order.service)}`;
    } else {
      setEndOtpError((prev) => ({ ...prev, [order.id]: 'Incorrect OTP. Please check and re-enter.' }));
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      {/* Worker Verify Modal */}
      <WorkerVerifyModal
        isOpen={Boolean(verifyModalBookingId)}
        onClose={() => setVerifyModalBookingId(null)}
        bookingId={verifyModalBookingId}
        onVerificationSuccess={() => {
          if (verifyModalBookingId) {
            setVerifiedBookings((prev) => ({ ...prev, [verifyModalBookingId]: true }));
          }
        }}
      />

      {/* Back Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="back-btn"
        >
          <HiOutlineArrowLeft /> Back to Previous
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Ordered Services
          </h1>
          <p style={{ color: 'var(--ink2)', fontSize: '0.92rem', margin: 0 }}>
            Track live status, view assigned workers, and confirm job completion.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {[
          { key: 'active', label: 'Active Orders' },
          { key: 'all', label: 'All Orders' },
          { key: 'past', label: 'Past Orders' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeOrders.length === 0 && (
        <GlassCard style={{ padding: '40px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={HiOutlineClipboardDocumentList}
            title="No orders here"
            description="You have no service orders in this tab right now."
            actionLabel="Browse Services"
            onAction={() => navigate('/customer/services')}
          />
        </GlassCard>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeOrders.map((order) => {
          const currentStepIdx = stepKeys.indexOf(order.status);
          const isExpanded = expandedId === order.id;

          return (
            <GlassCard
              key={order.id}
              clickable={false}
              style={{ padding: 0, overflow: 'hidden' }}
            >
              {/* ── Card Header ─────────────────── */}
              <div
                style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
                      {order.service}
                    </span>
                    <StatusPill status={order.status} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink2)', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{order.id}</span>
                    <span>{order.date} at {order.time}</span>
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>₹{order.amount}</span>
                  </div>
                </div>
                <span className="glass-sm" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(22, 70, 214, 0.08)' }}>

                      {/* ── Progress Stepper ─────────────── */}
                      {order.status !== 'cant-resolve' && (
                        <div style={{ paddingTop: '22px', marginBottom: '22px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '13px', left: '5%', right: '5%', height: '3px', background: 'rgba(22, 70, 214, 0.08)', borderRadius: '999px', zIndex: 0 }} />
                            <div style={{ position: 'absolute', top: '13px', left: '5%', width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 90}%`, height: '3px', background: 'var(--blue)', borderRadius: '999px', zIndex: 1, transition: 'width 0.5s var(--ease)' }} />
                            {steps.map((step, idx) => {
                              const done = idx <= currentStepIdx;
                              const active = idx === currentStepIdx;
                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                                  <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%', zIndex: 2,
                                    background: done ? 'linear-gradient(135deg, #4C86FF, #1646D6)' : 'rgba(255, 255, 255, 0.85)',
                                    color: done ? 'white' : 'var(--ink3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.72rem',
                                    border: active ? '3px solid rgba(22, 70, 214, 0.25)' : '1px solid rgba(22, 70, 214, 0.12)',
                                    boxShadow: done ? '0 4px 10px rgba(22, 70, 214, 0.35)' : 'none'
                                  }}>
                                    {done ? '' : idx + 1}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', fontWeight: active ? 700 : 500, color: active ? 'var(--blue)' : 'var(--ink2)', marginTop: '6px', textAlign: 'center' }}>
                                    {step}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── Can't Resolve banner ─────────── */}
                      {order.status === 'cant-resolve' && (
                        <div style={{ background: 'var(--status-danger-tint)', border: '1px solid var(--status-danger-soft)', borderRadius: '18px', padding: '16px', marginTop: '16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <HiOutlineExclamationTriangle style={{ color: 'var(--status-danger-text)', fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--status-danger-text)', fontSize: '0.92rem' }}>Issue Reported — Can't Resolve</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--status-danger-text)', marginTop: '4px' }}>The worker was unable to resolve this issue. Our support team has been notified and will contact you within 30 minutes.</div>
                            <button className="btn-primary btn-danger" style={{ marginTop: '12px', fontSize: '0.8rem', padding: '8px 18px' }}>
                              Call Support
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Trust & Safety QR Verification & OTP Section ─────────── */}
                      {order.status === 'en-route' && (
                        <div style={{ marginBottom: '18px' }}>
                          {!verifiedBookings[order.id] ? (
                            <div className="sunken" style={{ padding: '18px', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                Secure Worker Verification Required
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--ink2)', margin: '0 0 14px' }}>
                                Verify worker's ServeCircle physical ID Card QR code before releasing the Start OTP.
                              </p>
                              <PrimaryButton
                                onClick={() => setVerifyModalBookingId(order.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                <HiOutlineQrCode style={{ fontSize: '1.2rem' }} /> Verify Worker ID (Scan QR)
                              </PrimaryButton>
                            </div>
                          ) : (
                            <div className="sunken" style={{ padding: '18px', textAlign: 'center', borderColor: 'rgba(54, 160, 122, 0.4)' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--status-success-text)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Worker Identity Verified · Share Start OTP
                              </div>
                              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '10px', margin: '8px 0', fontFamily: 'Outfit, sans-serif' }}>
                                {order.startOtp}
                              </div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--ink2)', margin: 0 }}>
                                Worker identity verified live via physical QR ID Card.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── In-Progress Job Status Notice ─────────── */}
                      {order.status === 'active' && (
                        <div className="sunken" style={{ padding: '18px', marginBottom: '18px', borderColor: 'rgba(54, 160, 122, 0.35)' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                            Work is currently in progress at your premises. Your verified specialist will upload completion photos and mark the service complete once finished.
                          </div>
                          <a
                            href="tel:1800233911"
                            className="glass-sm"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', marginTop: '12px', textDecoration: 'none', fontSize: '0.82rem', color: 'var(--ink2)' }}
                          >
                            <HiOutlineExclamationTriangle /> Report / Emergency Support (1800-233-911)
                          </a>
                        </div>
                      )}

                      {/* ── Worker Privacy & Verification Panel ─────────── */}
                      {order.status !== 'pending' && (
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Assigned Worker Details</span>
                            {!verifiedBookings[order.id] && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--ink3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <HiOutlineEyeSlash /> Contact Hidden Before QR Scan
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>

                            {/* Worker Card */}
                            <div className="glass-sm" style={{ flex: 1, minWidth: '200px', padding: '18px', textAlign: 'center', cursor: 'default' }}>
                              <div className="tile s-info" style={{ width: '56px', height: '56px', borderRadius: '18px', fontSize: '1.2rem', fontWeight: 800, margin: '0 auto 10px' }}>
                                {order.worker.initials}
                              </div>
                              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>{order.worker.name}</div>
                              <div style={{ margin: '6px 0' }}>
                                <StatusPill status="verified" label="ServeCircle Verified Worker" />
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--ink2)', marginTop: '4px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <span>{order.worker.rating} rating</span>
                                <span>3+ Yrs Exp</span>
                                <span>ETA: {order.time}</span>
                              </div>

                              {!verifiedBookings[order.id] ? (
                                <div className="sunken" style={{ marginTop: '12px', padding: '8px 10px', fontSize: '0.72rem', color: 'var(--ink2)' }}>
                                  Scan physical ID Card QR upon worker arrival to unlock contact & profile.
                                </div>
                              ) : (
                                (order.status === 'en-route' || order.status === 'active') && (
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <a
                                      href="tel:+919876543210"
                                      className="glass-sm"
                                      style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none' }}
                                    >
                                      <HiOutlinePhone /> Call
                                    </a>
                                    <Link
                                      to={`/customer/live-tracking?bookingId=${encodeURIComponent(order.rawId || order.id.replace('#', ''))}`}
                                      className="btn-primary"
                                      style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none' }}
                                    >
                                      <HiOutlineChatBubbleLeftRight /> Chat
                                    </Link>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Trainee Card (if applicable) */}
                            {order.trainee && (
                              <div className="glass-sm" style={{ flex: 1, minWidth: '200px', padding: '18px', textAlign: 'center', cursor: 'default' }}>
                                <div className="tile s-warn" style={{ width: '56px', height: '56px', borderRadius: '18px', fontSize: '1.2rem', fontWeight: 800, margin: '0 auto 10px' }}>
                                  {order.trainee.initials}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>{order.trainee.name}</div>
                                <div style={{ margin: '6px 0' }}>
                                  <StatusPill status="pending" label={order.trainee.tier} />
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--ink2)', marginTop: '4px' }}>
                                  <span>{order.trainee.jobsSolved} shadow jobs done</span>
                                </div>
                                <div className="sunken" style={{ marginTop: '12px', padding: '8px 10px', fontSize: '0.72rem', color: 'var(--ink2)' }}>
                                  <HiOutlineAcademicCap style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                  Under supervision of senior
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Security Notice */}
                          <div className="sunken" style={{ marginTop: '14px', padding: '12px 16px', fontSize: '0.78rem', color: 'var(--ink2)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <HiOutlineShieldCheck style={{ flexShrink: 0, color: 'var(--blue)', fontSize: '1.2rem', marginTop: '1px' }} />
                            <span>If the person who arrives does not match the photo/name above, <strong>do not let them in</strong> and call ServeCircle support immediately.</span>
                          </div>
                        </div>
                      )}

                      {/* ── Address & Actions ─────────────── */}
                      <div style={{ marginTop: '18px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <HiOutlineMapPin style={{ color: 'var(--blue)' }} /> {order.address}
                        </span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {['pending', 'confirmed', 'en-route', 'active'].includes(order.status) && (
                            <Link
                              to={`/customer/live-tracking?bookingId=${encodeURIComponent(order.rawId || order.id.replace('#', ''))}&service=${encodeURIComponent(order.service)}&worker=${encodeURIComponent(order.worker?.name || '')}&price=${order.amount}`}
                              className="btn-primary"
                              style={{ fontSize: '0.82rem', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              Live Track <HiOutlineArrowUpRight />
                            </Link>
                          )}
                          {order.status === 'completed' && (
                            <Link
                              to={`/customer/review/${encodeURIComponent(order.rawId || order.id.replace('#', ''))}?service=${encodeURIComponent(order.service)}&worker=${encodeURIComponent(order.worker?.name || '')}&price=${order.amount}`}
                              className="btn-primary"
                              style={{ fontSize: '0.82rem', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <HiOutlineStar /> Rate & Review
                            </Link>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default OrderedServices;
