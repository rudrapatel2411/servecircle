import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineStar,
  HiOutlineAcademicCap,
  HiOutlineQrCode,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import WorkerVerifyModal from '../../components/WorkerVerifyModal';
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

const statusMeta = {
  pending:       { label: 'Searching for Worker', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b', emoji: '🔍' },
  confirmed:     { label: 'Worker Assigned',      color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6', emoji: '✅' },
  'en-route':    { label: 'Worker En Route',       color: '#0891b2', bg: '#cffafe', dot: '#06b6d4', emoji: '🚗' },
  active:        { label: 'Work In Progress',      color: '#16a34a', bg: '#dcfce7', dot: '#22c55e', emoji: '🛠️' },
  completed:     { label: 'Completed',             color: '#7c3aed', bg: '#ede9fe', dot: '#8b5cf6', emoji: '🎉' },
  'cant-resolve': { label: "Can't Resolve",        color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', emoji: '⚠️' },
};

const tierConfig = {
  'Senior Pro':       { color: '#7c3aed', bg: '#ede9fe', emoji: '🏆' },
  'Junior Pro':       { color: '#2563eb', bg: '#dbeafe', emoji: '⭐' },
  'Rookie (Trainee)': { color: '#dc2626', bg: '#fee2e2', emoji: '🎓' },
};

const steps = ['Searching', 'Confirmed', 'En Route', 'Active', 'Completed'];
const stepKeys = ['pending', 'confirmed', 'en-route', 'active', 'completed'];

const OrderedServices = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('active');
  const [expandedId, setExpandedId] = useState('#SC-2841');
  const [endOtpInput, setEndOtpInput] = useState({});
  const [endOtpError, setEndOtpError] = useState({});

  // Trust & Safety QR Verification status tracker per booking
  const [verifiedBookings, setVerifiedBookings] = useState({
    '#SC-2841': searchParams.get('verified') === 'true',
  });
  const [verifyModalBookingId, setVerifyModalBookingId] = useState(null);

  const activeOrders = activeTab === 'all' ? mockOrders
    : activeTab === 'active' ? mockOrders.filter((o) => !['completed', 'cancelled', 'cant-resolve'].includes(o.status))
    : mockOrders.filter((o) => o.status === 'completed' || o.status === 'cant-resolve');

  const handleVerifyEndOtp = (order) => {
    const entered = endOtpInput[order.id] || '';
    if (entered === order.endOtp) {
      setEndOtpError((prev) => ({ ...prev, [order.id]: '' }));
      alert(`✅ Job confirmed done! Thank you for using ServeCircle. Please rate ${order.worker.name}.`);
    } else {
      setEndOtpError((prev) => ({ ...prev, [order.id]: '❌ Incorrect OTP. Please check and re-enter.' }));
    }
  };

  return (
    <div className="page-content">
      {/* Worker Verify Modal */}
      <WorkerVerifyModal
        isOpen={Boolean(verifyModalBookingId)}
        onClose={() => setVerifyModalBookingId(null)}
        bookingId={verifyModalBookingId}
        onVerificationSuccess={(data) => {
          if (verifyModalBookingId) {
            setVerifiedBookings((prev) => ({ ...prev, [verifyModalBookingId]: true }));
          }
        }}
      />

      <div className="page-header">
        <div>
          <h1 className="page-title">Ordered Services 📦</h1>
          <p className="page-subtitle">Track live status, view assigned workers, and confirm job completion.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{ marginBottom: '20px' }}>
        {[
          { key: 'active', label: '🔴 Active Orders' },
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
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
          <div style={{ fontWeight: 700, color: 'var(--navy-700)' }}>No orders here</div>
          <Link to="/customer/services" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>Browse Services</Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeOrders.map((order) => {
          const meta = statusMeta[order.status] || statusMeta.pending;
          const currentStepIdx = stepKeys.indexOf(order.status);
          const isExpanded = expandedId === order.id;
          const workerTier = tierConfig[order.worker.tier] || tierConfig['Junior Pro'];
          const traineeTier = order.trainee ? (tierConfig[order.trainee.tier] || tierConfig['Rookie (Trainee)']) : null;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--gray-200)' }}
            >
              {/* ── Card Header ─────────────────── */}
              <div
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: meta.dot, flexShrink: 0,
                  boxShadow: `0 0 0 4px ${meta.bg}`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{order.service}</span>
                    <span style={{ background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: '100px' }}>
                      {meta.emoji} {meta.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--navy-500)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>{order.id}</span>
                    <span>📅 {order.date} at {order.time}</span>
                    <span>₹{order.amount}</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', color: 'var(--navy-400)', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--gray-100)' }}>

                      {/* ── Progress Stepper ─────────────── */}
                      {order.status !== 'cant-resolve' && (
                        <div style={{ paddingTop: '20px', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '13px', left: '5%', right: '5%', height: '2px', background: 'var(--gray-200)', zIndex: 0 }} />
                            <div style={{ position: 'absolute', top: '13px', left: '5%', width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 90}%`, height: '2px', background: 'var(--primary-500)', zIndex: 1, transition: 'width 0.5s ease' }} />
                            {steps.map((step, idx) => {
                              const done = idx <= currentStepIdx;
                              const active = idx === currentStepIdx;
                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                                  <div style={{
                                    width: '26px', height: '26px', borderRadius: '50%', zIndex: 2,
                                    background: done ? 'var(--primary-500)' : '#e2e8f0',
                                    color: done ? 'white' : '#94a3b8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.7rem',
                                    border: active ? '3px solid var(--primary-100)' : 'none',
                                  }}>
                                    {done ? '✓' : idx + 1}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', fontWeight: active ? 800 : 600, color: active ? 'var(--navy-900)' : 'var(--navy-400)', marginTop: '6px', textAlign: 'center' }}>
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
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', marginTop: '16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <HiOutlineExclamationTriangle style={{ color: '#dc2626', fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem' }}>Issue Reported — Can't Resolve</div>
                            <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: '4px' }}>The worker was unable to resolve this issue. Our support team has been notified and will contact you within 30 minutes.</div>
                            <button className="btn btn-outline" style={{ marginTop: '10px', fontSize: '0.78rem', padding: '6px 14px', color: '#dc2626', borderColor: '#fecaca' }}>
                              📞 Call Support
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Trust & Safety QR Verification & OTP Section ─────────── */}
                      {order.status === 'en-route' && (
                        <div style={{ marginBottom: '16px' }}>
                          {!verifiedBookings[order.id] ? (
                            <div style={{
                              background: '#eff6ff', border: '1.5px dashed #3b82f6',
                              borderRadius: '14px', padding: '16px', textAlign: 'center',
                            }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                🛡️ Secure Worker Verification Required
                              </div>
                              <p style={{ fontSize: '0.78rem', color: '#1d4ed8', margin: '0 0 12px' }}>
                                Verify worker's ServeCircle physical ID Card QR code before releasing the Start OTP.
                              </p>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setVerifyModalBookingId(order.id)}
                                style={{ background: '#2563eb', padding: '10px 20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                <HiOutlineQrCode style={{ fontSize: '1.2rem' }} /> Verify Worker ID (Scan QR)
                              </button>
                            </div>
                          ) : (
                            <div style={{
                              background: '#fef2f2', border: '1px dashed #ef4444',
                              borderRadius: '10px', padding: '14px 16px', textAlign: 'center',
                            }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <HiOutlineCheckCircle style={{ color: '#16a34a', fontSize: '1rem' }} /> Worker Identity Verified · Share Start OTP
                              </div>
                              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#991b1b', letterSpacing: '10px', margin: '8px 0' }}>
                                {order.startOtp}
                              </div>
                              <p style={{ fontSize: '0.72rem', color: '#7f1d1d', margin: 0 }}>
                                Worker identity verified live via physical QR ID Card.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── End OTP for Active jobs ─────────── */}
                      {order.status === 'active' && (
                        <div style={{
                          background: '#f0fdf4', border: '1px dashed #22c55e',
                          borderRadius: '10px', padding: '14px 16px',
                          marginBottom: '16px',
                        }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '10px' }}>
                            ✅ Work is in progress. When done, the worker will ask for the End OTP.
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="number"
                              placeholder="Enter End OTP given by worker"
                              value={endOtpInput[order.id] || ''}
                              onChange={(e) => setEndOtpInput((prev) => ({ ...prev, [order.id]: e.target.value }))}
                              style={{
                                flex: 1, padding: '10px 14px', borderRadius: '8px',
                                border: '2px solid #e2e8f0', fontSize: '1.1rem',
                                fontWeight: 800, letterSpacing: '6px', textAlign: 'center',
                                outline: 'none',
                              }}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={() => handleVerifyEndOtp(order)}
                              style={{ background: '#16a34a', padding: '10px 18px' }}
                            >
                              Confirm Done
                            </button>
                          </div>
                          {endOtpError[order.id] && (
                            <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '8px', fontWeight: 600 }}>{endOtpError[order.id]}</p>
                          )}
                          <button
                            className="btn btn-outline"
                            style={{ width: '100%', marginTop: '10px', color: '#dc2626', borderColor: '#fecaca', fontSize: '0.8rem' }}
                            onClick={() => alert('📞 Connecting to ServeCircle support...')}
                          >
                            <HiOutlineExclamationTriangle style={{ marginRight: '6px' }} /> Report: Can't Resolve
                          </button>
                        </div>
                      )}

                      {/* ── Worker Privacy & Verification Panel ─────────── */}
                      {order.status !== 'pending' && (
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🛡️ Assigned Worker Details</span>
                            {!verifiedBookings[order.id] && (
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <HiOutlineEyeSlash /> Contact & Personal Details Hidden Before QR Scan
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

                            {/* Worker Card — Privacy Filter Applied Before Verification */}
                            <div style={{
                              flex: 1, minWidth: '180px', background: '#f8fafc',
                              border: '2px solid #e2e8f0', borderRadius: '12px',
                              padding: '16px', textAlign: 'center',
                            }}>
                              <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: verifiedBookings[order.id] ? 'var(--primary-700)' : '#475569', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem', fontWeight: 800, margin: '0 auto 10px',
                                border: '3px solid var(--primary-200)',
                              }}>
                                {order.worker.initials}
                              </div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{order.worker.name}</div>

                              {/* Allowed Pre-Verification Info ONLY */}
                              <div style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '2px 10px', borderRadius: '100px', display: 'inline-block', margin: '4px 0' }}>
                                ServeCircle Verified Worker
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--navy-500)', marginTop: '4px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <span>⭐ {order.worker.rating}</span>
                                <span>💼 3+ Yrs Exp</span>
                                <span>⏱️ ETA: {order.time}</span>
                              </div>

                              {/* Hide Phone / Contact / Photo before verification */}
                              {!verifiedBookings[order.id] ? (
                                <div style={{ marginTop: '10px', background: '#f1f5f9', padding: '6px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#64748b' }}>
                                  🔒 Scan physical ID Card QR upon worker arrival to unlock contact & full verification profile.
                                </div>
                              ) : (
                                (order.status === 'en-route' || order.status === 'active') && (
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                                    <button
                                      className="btn btn-outline"
                                      style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
                                      onClick={() => alert(`📞 Calling ${order.worker.name}...`)}
                                    >
                                      <HiOutlinePhone /> Call
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
                                      onClick={() => alert(`💬 Chat opened with ${order.worker.name}`)}
                                    >
                                      <HiOutlineChatBubbleLeftRight />
                                    </button>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Trainee Card (if applicable) */}
                            {order.trainee && (
                              <div style={{
                                flex: 1, minWidth: '180px', background: '#fffbeb',
                                border: '2px dashed #fde68a', borderRadius: '12px',
                                padding: '16px', textAlign: 'center',
                              }}>
                                <div style={{
                                  width: '56px', height: '56px', borderRadius: '50%',
                                  background: '#dc2626', color: 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '1.3rem', fontWeight: 800, margin: '0 auto 10px',
                                  border: '3px solid #fecaca',
                                }}>
                                  {order.trainee.initials}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{order.trainee.name}</div>
                                <div style={{ background: traineeTier.bg, color: traineeTier.color, fontSize: '0.68rem', fontWeight: 800, padding: '2px 10px', borderRadius: '100px', display: 'inline-block', margin: '4px 0' }}>
                                  {traineeTier.emoji} {order.trainee.tier}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--navy-500)', marginTop: '4px' }}>
                                  <span>🎓 {order.trainee.jobsSolved} shadow jobs done</span>
                                </div>
                                <div style={{ marginTop: '8px', background: '#fef3c7', borderRadius: '6px', padding: '6px 8px', fontSize: '0.7rem', color: '#92400e' }}>
                                  <HiOutlineAcademicCap style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                  Under supervision of senior
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Security Notice */}
                          <div style={{ marginTop: '12px', background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--navy-600)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <HiOutlineShieldCheck style={{ flexShrink: 0, color: 'var(--primary-500)', fontSize: '1rem', marginTop: '1px' }} />
                            <span>If the person who arrives does not match the photo/name above, <strong>do not let them in</strong> and call ServeCircle support immediately.</span>
                          </div>
                        </div>
                      )}

                      {/* ── Address & Actions ─────────────── */}
                      <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--navy-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineMapPin /> {order.address}
                        </span>
                        {order.status === 'en-route' && (
                          <Link
                            to={`/customer/live-tracking?bookingId=${order.id}&service=${encodeURIComponent(order.service)}&worker=${encodeURIComponent(order.worker.name)}&price=${order.amount}`}
                            className="btn btn-primary"
                            style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '8px 16px' }}
                          >
                            <HiOutlineArrowTopRightOnSquare style={{ marginRight: '4px' }} /> Live Track
                          </Link>
                        )}
                        {order.status === 'completed' && (
                          <Link
                            to={`/customer/review/${order.id}?service=${encodeURIComponent(order.service)}&worker=${encodeURIComponent(order.worker.name)}`}
                            className="btn btn-primary"
                            style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '8px 16px' }}
                          >
                            <HiOutlineStar style={{ marginRight: '4px' }} /> Rate & Review
                          </Link>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderedServices;
