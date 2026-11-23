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
      title: `📞 New Call Request: ${chosenService}`,
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
          background: 'linear-gradient(135deg, #2D5A3C 0%, #1E3D29 100%)',
          color: '#FAF9F6',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(45, 90, 60, 0.4), 0 2px 6px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          userSelect: 'none',
          border: '1.5px solid rgba(226, 232, 240, 0.5)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(45, 90, 60, 0.48), 0 3px 8px rgba(0,0,0,0.24)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 90, 60, 0.4), 0 2px 6px rgba(0,0,0,0.2)';
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
            border: '2px solid rgba(83, 109, 87, 0.45)',
            animation: 'pulse 2s infinite',
            pointerEvents: 'none',
          }}
        />
        <HiOutlinePhone size={22} style={{ color: '#FAF9F6' }} />
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
              position: 'relative',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#FAF9F6',
                border: '1px solid #E2E8F0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F172A',
                transition: 'all 0.2s',
              }}
              title="Close"
            >
              <HiOutlineXMark size={18} />
            </button>

            {!requestSent ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(30, 64, 175, 0.12)',
                      color: '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                    }}
                  >
                    <HiOutlinePhone size={24} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.18rem',
                        fontWeight: 800,
                        color: '#0F172A',
                      }}
                    >
                      {t('callMeBack.title', 'Need Instant Help?')}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: '#475569',
                      }}
                    >
                      Enter number &amp; service — specialist will call you back!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: '6px',
                      }}
                    >
                      {t('callMeBack.phoneLabel', 'Your Mobile Number')} *
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#FAF9F6',
                      }}
                    >
                      <span
                        style={{
                          padding: '10px 14px',
                          background: '#F1F5F9',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          borderRight: '1px solid #CBD5E1',
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
                          padding: '10px 12px',
                          border: 'none',
                          outline: 'none',
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          background: 'transparent',
                          color: '#0F172A',
                        }}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: '6px',
                      }}
                    >
                      Select Service Category (19 Available)
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        outline: 'none',
                        background: '#FAF9F6',
                        color: '#0F172A',
                      }}
                    >
                      {SERVICE_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#1E40AF', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                      Notification will be dispatched to <strong>{serviceType}</strong> verified specialists &amp; Admin.
                    </span>
                  </div>

                  {error && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#dc2626',
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
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.75 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(30, 64, 175, 0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <HiOutlinePhone />
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
                    fontSize: '0.75rem',
                    color: '#64748B',
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
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(30, 64, 175, 0.12)',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1.5px solid rgba(30, 64, 175, 0.25)',
                  }}
                >
                  <HiOutlineCheckCircle size={36} />
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  {t('callMeBack.successTitle', 'Request Received!')}
                </h3>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                  }}
                >
                  Your callback request for <strong>{serviceType}</strong> has been dispatched to online specialists and Admin. A verified specialist will call you on{' '}
                  <strong style={{ color: '#0F172A' }}>+91 {phone}</strong> shortly.
                </p>

                {requestId && (
                  <div
                    style={{
                      background: '#FAF9F6',
                      border: '1px solid #E2E8F0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      color: '#475569',
                      marginBottom: '20px',
                    }}
                  >
                    Request ID: <strong style={{ color: '#0F172A' }}>{requestId}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleNewRequest}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#FAF9F6',
                      color: '#0F172A',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    New Request
                  </button>
                  <button
                    onClick={handleClose}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#1E40AF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
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
