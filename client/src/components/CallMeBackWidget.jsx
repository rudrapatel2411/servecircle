import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePhone, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2';
import { getSession, API_BASE } from '../utils/authSession';
import { socket } from '../socket';
import { broadcastNotificationToTabs } from '../utils/notificationSync';

// ── 19 Main Canonical Service Roles ─────────────────────────────────
const SERVICE_TYPES = [
  { value: '', label: 'Select Service (or General Help)' },
  { value: 'Vehicle Services', label: '🚗 2. Vehicle Services (Mechanic, Puncture, Detailing)' },
  { value: 'Home Repairs', label: '🔧 1. Home Repairs (Plumbing, Electrical, AC, Carpentry)' },
  { value: 'Cleaning & Hygiene', label: '🧹 3. Cleaning & Hygiene (Deep Clean, Sofa, Pest Control)' },
  { value: 'Home IT & Smart Devices', label: '💻 4. Home IT & Smart Devices (WiFi, CCTV, Laptop)' },
  { value: 'Care & Family', label: '🤝 5. Care & Family (Patient & Senior Caretaker)' },
  { value: 'Utility & Daily Help', label: '🏠 6. Utility & Daily Help (Maid, Laundry, Errand)' },
  { value: 'Learning & Support', label: '📚 7. Learning & Support (Tutor, Language, Guitar, Yoga)' },
  { value: 'Property & Society', label: '🏢 8. Property & Society (Security, Supervisor, Maintenance)' },
  { value: 'Seasonal & Festive', label: '🎉 9. Seasonal & Festive (Diwali Lights, Waterproofing)' },
  { value: 'Furniture & Decor', label: '🛋️ 10. Furniture & Decor (Assembly, Carpenter, Wallpaper)' },
  { value: 'Garden & Outdoor', label: '🌱 11. Garden & Outdoor (Gardener, Lawn Mowing)' },
  { value: 'Packers & Movers', label: '📦 12. Packers & Movers (Shifting, Loading, Truck)' },
  { value: 'Health & Wellness', label: '🩺 13. Health & Wellness (Physio, Home Nurse, Blood Sample)' },
  { value: 'Kids & Elderly Care', label: '👶 14. Kids & Elderly Care (Nanny, Babysitter, Bedside)' },
  { value: 'Pet Services', label: '🐾 15. Pet Services (Grooming, Vet Visit, Dog Walking)' },
  { value: 'Food Kitchen', label: '🍲 16. Food Kitchen (Home Chef, Tiffin, Custom Cake)' },
  { value: 'Travel & Commute', label: '🚖 17. Travel & Commute (Outstation Chauffeur, Airport Cab)' },
  { value: 'Society Management', label: '🏘️ 18. Society Management (RWA, Gate Pass, Security)' },
  { value: 'Events Hub', label: '🎈 19. Events Hub (Theme Decor, Birthday, Sound & DJ)' },
];

const CallMeBackWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('Vehicle Services');
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [error, setError] = useState('');

  const session = getSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError(t('callMeBack.invalidPhone', 'Please enter a valid 10-digit mobile number!'));
      return;
    }
    setError('');
    setLoading(true);

    const generatedId = `CR-${Date.now()}`;
    const customerName = session?.user?.name || 'Customer';
    const chosenService = serviceType || 'General Help';
    const assignedCategory = serviceType || 'General Help';

    const callPayload = {
      id: `notif_call_${Date.now()}`,
      title: `📞 New Call Request: ${chosenService}`,
      message: `${customerName} (+91 ${phone}) requested an immediate callback for ${chosenService}.`,
      type: 'call_request',
      requestId: generatedId,
      phone,
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

    // 2. Emit live socket event to server
    try {
      socket.emit('call_request_direct', {
        requestId: generatedId,
        phone,
        serviceType: chosenService,
        category: assignedCategory,
        customerName,
        customerId: session?.user?._id || session?.user?.id || 'guest',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    } catch {}

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
          phone,
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
    } catch (err) {
      setRequestId(generatedId);
      setRequestSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    if (!requestSent) {
      setPhone('');
    }
  };

  const handleNewRequest = () => {
    setRequestSent(false);
    setRequestId(null);
    setPhone('');
    setError('');
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setIsOpen(true)}
        className="call-me-back-float"
        style={{
          background: 'linear-gradient(135deg, #3b7dc1 0%, #2960a0 100%)',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(59, 125, 193, 0.4)',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="Call Me Back"
      >
        <span
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border: '2px solid rgba(59, 125, 193, 0.4)',
            animation: 'pulse 2s infinite',
          }}
        />
        <HiOutlinePhone size={26} />
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
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
              background: 'white',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
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
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--gray-600, #475569)',
                transition: 'all 0.2s',
              }}
            >
              <HiOutlineXMark size={18} />
            </button>

            {!requestSent ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(59, 125, 193, 0.12)',
                      color: '#2960a0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <HiOutlinePhone size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: 'var(--navy-900, #0f172a)',
                      }}
                    >
                      {t('callMeBack.title', 'Need Instant Help?')}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'var(--gray-500, #64748b)',
                      }}
                    >
                      Enter number & service — target worker + admin get notified!
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
                        color: 'var(--navy-800, #1e293b)',
                        marginBottom: '6px',
                      }}
                    >
                      {t('callMeBack.phoneLabel', 'Your Mobile Number')} *
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid var(--gray-300, #cbd5e1)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#f8fafc',
                      }}
                    >
                      <span
                        style={{
                          padding: '10px 12px',
                          background: '#f1f5f9',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#475569',
                          borderRight: '1px solid #cbd5e1',
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
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          background: 'transparent',
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
                        color: 'var(--navy-800, #1e293b)',
                        marginBottom: '6px',
                      }}
                    >
                      Select Service (19 Services Available)
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid #93c5fd',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        outline: 'none',
                        background: '#eff6ff',
                        color: '#1e3a8a',
                      }}
                    >
                      {SERVICE_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.7rem', color: '#0369a1', marginTop: '4px', display: 'block' }}>
                      ⚡ Notification will be sent directly to <strong>{serviceType || 'all'}</strong> workers and Admin!
                    </span>
                  </div>

                  {error && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#ef4444',
                        marginBottom: '16px',
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
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(22, 163, 74, 0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <HiOutlinePhone />
                    {loading ? t('common.sending', 'Sending Request...') : 'Request Call Back from Worker'}
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
                    color: 'var(--gray-400, #94a3b8)',
                  }}
                >
                  <HiOutlineClock />
                  <span>{t('callMeBack.promise', 'Average response time: under 3 minutes')}</span>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <HiOutlineCheckCircle size={38} />
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--navy-900, #0f172a)',
                    marginBottom: '8px',
                  }}
                >
                  {t('callMeBack.successTitle', 'Request Received!')}
                </h3>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--gray-600, #475569)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                  }}
                >
                  Your call-back request for <strong>{serviceType}</strong> has been dispatched to <strong>{serviceType}</strong> workers and Admin. A specialist will call you on{' '}
                  <strong style={{ color: '#0f172a' }}>+91 {phone}</strong> shortly.
                </p>

                {requestId && (
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginBottom: '20px',
                    }}
                  >
                    Request ID: <strong style={{ color: '#0f172a' }}>{requestId}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleNewRequest}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
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
                      background: '#16a34a',
                      color: 'white',
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
