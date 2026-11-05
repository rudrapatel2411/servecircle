import { useState, useEffect } from 'react';
import {
  HiOutlinePhone, HiCheckCircle, HiXMark, HiOutlineUser,
  HiOutlineLifebuoy, HiOutlineMicrophone, HiOutlineSpeakerWave,
  HiOutlineChatBubbleLeftRight, HiOutlineClock, HiOutlineShieldCheck,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2';
import { socket } from '../socket';
import { getSession, API_BASE } from '../utils/authSession';
import { subscribeToCrossTabNotifications, broadcastNotificationToTabs } from '../utils/notificationSync';
import { getWorkerCategory, doesServiceMatchWorker } from '../utils/workerCategoryHelper';
import '../pages/worker/WorkerPages.css';

// ── 1. Modern Bottom-Right Incoming Request Alert Card ───────────────────────
const IncomingCallModal = ({ request, onAccept, onDismiss }) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    await onAccept(request.requestId, request.phone, request);
    setAccepted(true);
    setLoading(false);
  };

  return (
    <div
      style={{
        width: '360px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.35)',
        border: '2px solid #10b981',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
        marginBottom: '12px',
      }}
    >
      {/* Green Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <HiOutlinePhone style={{ color: 'white', fontSize: '1.2rem' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'white', fontWeight: 800, margin: 0, fontSize: '0.88rem' }}>
            📞 Incoming Service Request!
          </p>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Role: <strong>{request.category || request.serviceType || 'General'}</strong>
          </p>
        </div>
        <button
          onClick={() => onDismiss(request.requestId)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
          }}
          title="Dismiss"
        >
          <HiXMark size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        {accepted ? (
          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <HiCheckCircle style={{ fontSize: '2.4rem', color: '#10b981', display: 'block', margin: '0 auto 6px' }} />
            <p style={{ fontWeight: 800, color: '#065f46', margin: '0 0 2px', fontSize: '0.92rem' }}>
              Job Accepted & Dispatched!
            </p>
            <p style={{ color: '#475569', fontSize: '0.78rem', margin: '0 0 10px' }}>
              Admin has been updated. Please call customer:
            </p>
            <a
              href={`tel:${request.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                borderRadius: '10px',
                padding: '10px 18px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
              }}
            >
              <HiOutlinePhone />
              +91 {request.phone}
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Customer:</span>
                <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 800 }}>
                  {request.customerName || 'Customer'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Service:</span>
                <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 800 }}>
                  {request.serviceType || 'General Help'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Phone:</span>
                <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 800 }}>
                  +91 {request.phone}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onDismiss(request.requestId)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Skip
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                <HiOutlinePhone />
                {loading ? 'Accepting...' : 'Accept & Call Now'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── 2. Fully Functional Partner Communication & Support Modal ───────────────
const CallModal = ({ onClose, defaultPhone, defaultCustomerName }) => {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'support'
  const [targetPhone, setTargetPhone] = useState(defaultPhone || '9876543210');
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [consultNotes, setConsultNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    let timer = null;
    if (callActive) {
      timer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCall = () => {
    setCallActive(true);
    setNotesSaved(false);
    // Also trigger mobile device dialer
    if (typeof window !== 'undefined') {
      window.open(`tel:${targetPhone}`, '_self');
    }
  };

  const endCall = () => {
    setCallActive(false);
    setNotesSaved(true);
  };

  return (
    <div className="sos-modal-overlay" onClick={onClose}>
      <div
        className="sos-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          width: '92%',
          padding: '24px',
          borderRadius: '20px',
          background: 'white',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
        }}
      >
        {/* Header Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'customer' ? '#2563eb' : '#f1f5f9',
                color: activeTab === 'customer' ? 'white' : '#475569',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <HiOutlineUser /> Call Customer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'support' ? '#dc2626' : '#f1f5f9',
                color: activeTab === 'support' ? 'white' : '#475569',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <HiOutlineLifebuoy /> Support Desk
            </button>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <HiXMark size={18} />
          </button>
        </div>

        {/* ── TAB 1: Customer Consultation Console ── */}
        {activeTab === 'customer' && (
          <div>
            {!callActive ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      margin: '0 auto 10px',
                    }}
                  >
                    <HiOutlinePhone />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                    Customer Voice Consultation
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Speak directly with the customer to confirm location, problem details, and arrival time.
                  </p>
                </div>

                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Customer Contact Number:
                  </label>
                  <div style={{ display: 'flex', border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc' }}>
                    <span style={{ padding: '10px 12px', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontWeight: 700, background: 'transparent' }}
                    />
                  </div>
                  {defaultCustomerName && (
                    <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      Client: <strong>{defaultCustomerName}</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={startCall}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                  }}
                >
                  <HiOutlinePhone /> Start Live Consultation (+91 {targetPhone})
                </button>
              </>
            ) : (
              /* Active In-Call Console */
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.2s' }}>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'ping 1s infinite' }} />
                  Call In Progress • Secure Voice Link
                </span>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                  +91 {targetPhone}
                </h3>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563eb', letterSpacing: '1px', marginBottom: '16px' }}>
                  {formatTimer(callSeconds)}
                </div>

                {/* Call Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '1.5px solid #cbd5e1',
                      background: isMuted ? '#ef4444' : '#f8fafc',
                      color: isMuted ? 'white' : '#475569',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    <HiOutlineMicrophone />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '1.5px solid #cbd5e1',
                      background: isSpeaker ? '#2563eb' : '#f8fafc',
                      color: isSpeaker ? 'white' : '#475569',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Toggle Speaker"
                  >
                    <HiOutlineSpeakerWave />
                  </button>
                </div>

                {/* Consultation Notes */}
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Quick Problem / Arrival Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    placeholder="e.g. Needs brake wire change, arriving in 15 mins..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', resize: 'none' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={endCall}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#dc2626',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <HiOutlinePhone style={{ transform: 'rotate(135deg)' }} /> End Call &amp; Save Notes
                </button>
              </div>
            )}

            {notesSaved && (
              <div style={{ marginTop: '12px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px', fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>
                ✅ Consultation completed. Notes saved to your job ticket.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Platform Support Desk ── */}
        {activeTab === 'support' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.2s' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                margin: '0 auto 10px',
              }}
            >
              <HiOutlineLifebuoy />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
              ServeCircle Partner Support
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px' }}>
              24x7 Dedicated Partner Helpline for job assistance, payment queries &amp; safety emergencies.
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Toll-Free Hotline:</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>1800-889-SERVE</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Support Hours:</span>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800 }}>24 Hours / 7 Days Live</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Average Wait:</span>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>&lt; 30 Seconds</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="tel:18008897378"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#dc2626',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                }}
              >
                <HiOutlinePhone /> Dial Partner Hotline (1800-889-7378)
              </a>

              <a
                href="https://wa.me/919876543210?text=Hello%20ServeCircle%20Support%2C%20I%20am%20a%20partner%20and%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#16a34a',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <HiOutlineChatBubbleLeftRight /> Priority WhatsApp Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── 3. Main WorkerCallWidget Component ───────────────────────────────────────
const WorkerCallWidget = () => {
  const [showCall, setShowCall] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  const session = getSession();
  const workerCategory = getWorkerCategory(session?.user);

  // Accept a call request & broadcast to Admin with all details
  const acceptCallRequest = async (requestId, phone, requestObj = {}) => {
    const workerName = session?.user?.name || 'Assigned Worker';
    const workerEmail = session?.user?.email || '';
    const workerPhone = session?.user?.phone || '9876543210';
    const workerId = session?.user?._id || session?.user?.id || 'worker_id';

    const acceptPayload = {
      requestId,
      phone,
      workerId,
      workerName,
      workerEmail,
      workerPhone,
      workerCategory,
      service: requestObj.serviceType || workerCategory,
      customerName: requestObj.customerName || 'Customer',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('en-IN'),
    };

    // 1. Live socket broadcast so Admin receives full acceptance details
    try {
      socket.emit('worker_accepted_job', acceptPayload);
      socket.emit('call_request_taken', {
        requestId,
        acceptedByWorkerId: workerId,
        acceptedByWorkerName: workerName,
      });
    } catch {}

    // 2. Cross-tab sync to Admin panel with full worker details
    broadcastNotificationToTabs({
      id: `accepted_${requestId}_${Date.now()}`,
      title: '✅ Call Request Accepted by Worker',
      message: `Worker "${workerName}" (${workerEmail}) has accepted call request for ${acceptPayload.service}. Customer phone: +91 ${phone}`,
      type: 'alert',
      targetAudience: 'admin',
      ...acceptPayload,
    });

    // 3. Backend API call
    try {
      const token = session?.token;
      const res = await fetch(`${API_BASE}/call-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Accept API notice:', err.message);
    }
  };

  const dismissRequest = (requestId) => {
    setActiveRequests((prev) => prev.filter((r) => r.requestId !== requestId));
  };

  useEffect(() => {
    const handleIncoming = (data) => {
      if (!data || !data.requestId) return;

      // Filter: Only show if requested category matches this worker's category
      const isMatch = doesServiceMatchWorker(workerCategory, data.category, data.serviceType);
      if (!isMatch) return;

      setActiveRequests((prev) => {
        if (prev.find((r) => r.requestId === data.requestId)) return prev;
        return [data, ...prev].slice(0, 3);
      });
    };

    const handleCallTaken = (data) => {
      setActiveRequests((prev) =>
        prev.filter((r) => r.requestId !== data.requestId)
      );
    };

    socket.on('call_request', handleIncoming);
    socket.on('call_request_taken', handleCallTaken);

    // Cross-tab notification sync
    const unsubCrossTab = subscribeToCrossTabNotifications((crossData) => {
      if (crossData.type === 'call_request') {
        handleIncoming(crossData);
      }
    });

    return () => {
      socket.off('call_request', handleIncoming);
      socket.off('call_request_taken', handleCallTaken);
      unsubCrossTab();
    };
  }, [workerCategory]);

  return (
    <>
      {/* Sleek Floating Hotline Button in Bottom-Right */}
      <button
        className="call-floating-btn"
        onClick={() => setShowCall(true)}
        title={`Worker Hotline & Consultation Console (${workerCategory})`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99990,
        }}
      >
        <HiOutlinePhone size={24} />
        {activeRequests.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#10b981',
              color: 'white',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            {activeRequests.length}
          </span>
        )}
      </button>

      {/* Active Call / Support Modal */}
      {showCall && (
        <CallModal
          onClose={() => setShowCall(false)}
          defaultPhone={activeRequests[0]?.phone}
          defaultCustomerName={activeRequests[0]?.customerName}
        />
      )}

      {/* Incoming Call Request Popups (Resting at Bottom-Right above the floating button) */}
      <div
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          zIndex: 99995,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {activeRequests.map((req) => (
          <div key={req.requestId} style={{ pointerEvents: 'auto' }}>
            <IncomingCallModal
              request={req}
              onAccept={acceptCallRequest}
              onDismiss={dismissRequest}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default WorkerCallWidget;
