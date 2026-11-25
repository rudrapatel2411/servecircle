import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlinePhone, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2';
import { getSession, API_BASE } from '../utils/authSession';
import { socket } from '../socket';
import { broadcastNotificationToTabs } from '../utils/notificationSync';

// ── 19 Main Canonical Service Roles ─────────────────────────────────
const SERVICE_TYPES = [
  { value: 'Home Repairs', label: '1. Home Repairs (Plumbing, Electrical, AC, Carpentry)' },
  { value: 'Vehicle Services', label: '2. Vehicle Services (Mechanic, Puncture, Detailing)' },
  { value: 'Cleaning & Hygiene', label: '3. Cleaning & Hygiene (Deep Clean, Sofa, Pest Control)' },
  { value: 'Home IT & Smart Devices', label: '4. Home IT & Smart Devices (WiFi, CCTV, Laptop)' },
  { value: 'Care & Family', label: '5. Care & Family (Patient & Senior Caretaker)' },
  { value: 'Utility & Daily Help', label: '6. Utility & Daily Help (Maid, Laundry, Errand)' },
  { value: 'Learning & Support', label: '7. Learning & Support (Tutor, Language, Guitar, Yoga)' },
  { value: 'Property & Society', label: '8. Property & Society (Security, Supervisor, Maintenance)' },
  { value: 'Seasonal & Festive', label: '9. Seasonal & Festive (Diwali Lights, Waterproofing)' },
  { value: 'Furniture & Decor', label: '10. Furniture & Decor (Assembly, Carpenter, Wallpaper)' },
  { value: 'Garden & Outdoor', label: '11. Garden & Outdoor (Gardener, Lawn Mowing)' },
  { value: 'Packers & Movers', label: '12. Packers & Movers (Shifting, Loading, Truck)' },
  { value: 'Health & Wellness', label: '13. Health & Wellness (Physio, Home Nurse, Blood Sample)' },
  { value: 'Kids & Elderly Care', label: '14. Kids & Elderly Care (Nanny, Babysitter, Bedside)' },
  { value: 'Pet Services', label: '15. Pet Services (Grooming, Vet Visit, Dog Walking)' },
  { value: 'Food Kitchen', label: '16. Food Kitchen (Home Chef, Tiffin, Custom Cake)' },
  { value: 'Travel & Commute', label: '17. Travel & Commute (Outstation Chauffeur, Airport Cab)' },
  { value: 'Society Management', label: '18. Society Management (RWA, Gate Pass, Security)' },
  { value: 'Events Hub', label: '19. Events Hub (Theme Decor, Birthday, Sound & DJ)' },
];

const detectCategoryFromPath = (pathname) => {
  if (!pathname) return 'Home Repairs';
  const path = pathname.toLowerCase();
  if (path.includes('travel-commute')) return 'Travel & Commute';
  if (path.includes('food-kitchen')) return 'Food Kitchen';
  if (path.includes('pet-services') || path.includes('pet')) return 'Pet Services';
  if (path.includes('health-wellness') || path.includes('health')) return 'Health & Wellness';
  if (path.includes('society-management') || path.includes('society')) return 'Society Management';
  if (path.includes('relocation') || path.includes('packers')) return 'Packers & Movers';
  if (path.includes('repair-services') || path.includes('repair')) return 'Home Repairs';
  if (path.includes('cleaning-services') || path.includes('cleaning')) return 'Cleaning & Hygiene';
  if (path.includes('vehicle')) return 'Vehicle Services';
  if (path.includes('events')) return 'Events Hub';
  return 'Home Repairs';
};

const CATEGORY_ROUTES = [
  '/customer/general-services',
  '/customer/travel-commute',
  '/customer/food-kitchen',
  '/customer/pet-services',
  '/customer/health-wellness',
  '/customer/society-management',
  '/customer/relocation',
];

const CallMeBackWidget = ({ hasSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const session = getSession();

  const isCategoryRoute = CATEGORY_ROUTES.some((route) => location.pathname.startsWith(route));
  const withSidebar = hasSidebar !== undefined ? hasSidebar : isCategoryRoute;

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(session?.user?.phone || '');
  const [serviceType, setServiceType] = useState(() => detectCategoryFromPath(location.pathname));
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [error, setError] = useState('');

  // Update default service category when user navigates to a specific service hub
  useEffect(() => {
    if (!isOpen) {
      setServiceType(detectCategoryFromPath(location.pathname));
    }
  }, [location.pathname, isOpen]);

  // Pre-fill phone if session loads after initial render
  useEffect(() => {
    if (!phone && session?.user?.phone) {
      setPhone(session.user.phone);
    }
  }, [session?.user?.phone, phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError(t('callMeBack.invalidPhone', 'Please enter a valid 10-digit mobile number!'));
      return;
    }
    setError('');
    setLoading(true);

    const generatedId = `CR-${Date.now()}`;
    const customerName = session?.user?.name || 'Customer';
    const chosenService = serviceType || 'Home Repairs';
    const assignedCategory = serviceType || 'Home Repairs';

    const callPayload = {
      id: `notif_call_${Date.now()}`,
      title: `New Call Request: ${chosenService}`,
      message: `${customerName} (+91 ${cleanDigits}) requested an immediate callback for ${chosenService}.`,
      type: 'call_request',
      requestId: generatedId,
      phone: cleanDigits,
      serviceType: chosenService,
      category: assignedCategory,
      customerName,
      canAccept: true,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('en-IN'),
    };

    // 1. Broadcast across open browser tabs immediately (Admin + Target Worker receive it)
    broadcastNotificationToTabs({
      ...callPayload,
      targetAudience: 'all',
    });

    // 2. Emit live socket events to server (broadcasts to workers and admin)
    try {
      socket.emit('call_request_direct', {
        requestId: generatedId,
        phone: cleanDigits,
        serviceType: chosenService,
        category: assignedCategory,
        customerName,
        customerId: session?.user?._id || session?.user?.id || 'guest',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      socket.emit('customer_call_request', {
        requestId: generatedId,
        phone: cleanDigits,
        serviceType: chosenService,
        category: assignedCategory,
        customerName,
        customerId: session?.user?._id || session?.user?.id || 'guest',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    } catch (sockErr) {
      console.warn('Socket emit call_request error:', sockErr);
    }

    // 3. Post to backend API
    try {
      const token = session?.token;
      const res = await fetch(`${API_BASE}/call-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: cleanDigits,
          serviceType: chosenService,
          category: assignedCategory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRequestId(data.requestId || generatedId);
        setRequestSent(true);
      } else {
        setRequestId(generatedId);
        setRequestSent(true);
      }
    } catch {
      setRequestId(generatedId);
      setRequestSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
  };

  const handleNewRequest = () => {
    setRequestSent(false);
    setRequestId(null);
    setPhone(session?.user?.phone || '');
    setError('');
  };

  return (
    <>
      {/* Floating Call Button — Strictly Bottom-Right corner without element obstruction */}
      <div
        onClick={() => setIsOpen(true)}
        className="call-me-back-float"
        style={{
          background: 'linear-gradient(135deg, var(--blue-hi) 0%, var(--blue) 100%)',
          color: '#ffffff',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 24px -6px rgba(22, 70, 214, 0.45)',
          cursor: 'pointer',
          userSelect: 'none',
          border: '1px solid var(--glass-edge)',
          transition: 'transform 0.3s var(--ease), box-shadow 0.3s var(--ease)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 16px 30px -6px rgba(22, 70, 214, 0.55)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(22, 70, 214, 0.45)';
        }}
        title="Need Help? Request Instant Call Back"
        role="button"
        aria-label="Request Instant Call Back"
      >
        <span
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border: '2px solid rgba(76, 134, 255, 0.45)',
            animation: 'pulse 2s infinite',
            pointerEvents: 'none',
          }}
        />
        <HiOutlinePhone size={24} style={{ color: '#ffffff' }} />
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div
          className="modal-glass-overlay"
          onClick={handleClose}
        >
          <div
            className="glass"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              borderRadius: '28px',
              boxShadow: 'var(--sh-card)',
              border: '1px solid var(--glass-edge)',
              position: 'relative',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="glass-sm"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink)',
                border: '1px solid var(--glass-edge)',
              }}
              title="Close"
            >
              <HiOutlineXMark size={20} />
            </button>

            {!requestSent ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div
                    className="tile tile-blue"
                  >
                    <HiOutlinePhone size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {t('callMeBack.title', 'Need Instant Help?')}
                    </h3>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.82rem',
                        color: 'var(--ink-2)',
                      }}
                    >
                      Enter number &amp; service — specialist will call you back!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--ink-2)',
                        marginBottom: '6px',
                      }}
                    >
                      {t('callMeBack.phoneLabel', 'Your Mobile Number')} *
                    </label>
                    <div
                      className="sunken"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        height: '48px',
                      }}
                    >
                      <span
                        style={{
                          padding: '0 14px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          borderRight: '1px solid var(--glass-edge)',
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        style={{
                          flex: 1,
                          padding: '0 14px',
                          border: 'none',
                          outline: 'none',
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          background: 'transparent',
                          color: 'var(--ink)',
                        }}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--ink-2)',
                        marginBottom: '6px',
                      }}
                    >
                      Select Service Category (19 Available)
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="sunken"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 14px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        outline: 'none',
                        color: 'var(--ink)',
                      }}
                    >
                      {SERVICE_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.74rem', color: 'var(--blue)', marginTop: '6px', display: 'block', fontWeight: 500 }}>
                      Notification will be dispatched to <strong>{serviceType}</strong> verified specialists &amp; Admin.
                    </span>
                  </div>

                  {error && (
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--status-danger-text)',
                        marginBottom: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                    }}
                  >
                    <HiOutlinePhone size={18} />
                    {loading ? t('common.sending', 'Sending Request...') : 'Request Instant Call Back'}
                  </button>
                </form>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '16px',
                    fontSize: '0.78rem',
                    color: 'var(--ink-3)',
                  }}
                >
                  <HiOutlineClock />
                  <span>{t('callMeBack.promise', 'Average response time: under 3 minutes')}</span>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
                <div
                  className="tile tile-green"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    margin: '0 auto 16px',
                  }}
                >
                  <HiOutlineCheckCircle size={36} />
                </div>

                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '8px',
                  }}
                >
                  {t('callMeBack.successTitle', 'Request Received!')}
                </h3>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--ink-2)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                  }}
                >
                  Your callback request for <strong>{serviceType}</strong> has been dispatched to online specialists and Admin. A verified specialist will call you on{' '}
                  <strong style={{ color: 'var(--ink)' }}>+91 {phone}</strong> shortly.
                </p>

                {requestId && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid var(--glass-edge)',
                      padding: '8px 18px',
                      borderRadius: '999px',
                      display: 'inline-block',
                      fontSize: '0.78rem',
                      color: 'var(--ink-2)',
                      marginBottom: '20px',
                      boxShadow: 'var(--sh-small)',
                    }}
                  >
                    Request ID: <strong style={{ color: 'var(--ink)' }}>{requestId}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleNewRequest}
                    className="btn-glass"
                    style={{
                      flex: 1,
                    }}
                  >
                    New Request
                  </button>
                  <button
                    onClick={handleClose}
                    className="btn-primary"
                    style={{
                      flex: 1,
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CallMeBackWidget;
