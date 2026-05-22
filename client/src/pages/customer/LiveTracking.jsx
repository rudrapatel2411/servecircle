import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMapPin, HiOutlinePhone, HiOutlineChatBubbleLeftRight,
  HiOutlineClock, HiOutlineShieldCheck, HiOutlineExclamationTriangle,
  HiOutlinePhoneArrowUpRight, HiOutlineXMark
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const LiveTracking = () => {
  const { t } = useTranslation();
  
  const [eta, setEta] = useState(14);
  const [workerPos, setWorkerPos] = useState({ x: 10, y: 80 }); // start coordinates in percentage on mock map
  const [activeStep, setActiveStep] = useState(1); // 0: Dispatched, 1: Arriving, 2: Arrived, 3: Job Started, 4: Finished
  const [sosActive, setSosActive] = useState(false);
  const [mockAlertSent, setMockAlertSent] = useState(false);

  // Animate mock worker approaching along a path
  useEffect(() => {
    const timer = setInterval(() => {
      setWorkerPos((prev) => {
        // Move worker towards home icon (centered at x: 85, y: 25)
        const targetX = 85;
        const targetY = 25;
        
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;
        
        // Calculate remaining distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
          clearInterval(timer);
          setActiveStep(2); // Arrived!
          setEta(0);
          
          // Simulate job progressing
          setTimeout(() => setActiveStep(3), 3000); // Job Started
          setTimeout(() => setActiveStep(4), 6000); // Finished
          
          return { x: targetX, y: targetY };
        }
        
        // Progressive ETA reduction
        setEta((currentEta) => Math.max(1, Math.round(distance / 5)));
        
        return {
          x: prev.x + (dx / distance) * 2.5,
          y: prev.y + (dy / distance) * 2.5
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const triggerSos = () => {
    setSosActive(true);
    setMockAlertSent(false);
  };

  const sendMockSosAlert = () => {
    setMockAlertSent(true);
    setTimeout(() => {
      alert('🚨 Mock alert successfully dispatched to ServeCircle Safety Response HQ! A safety officer is monitoring this session live.');
    }, 300);
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', position: 'relative' }}>
      
      {/* Immersive SOS Safety Alert Modal */}
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card"
              style={{
                width: '100%',
                maxWidth: '520px',
                background: '#1e293b',
                border: '2.5px solid var(--danger)',
                padding: '32px',
                color: 'white',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(239,68,68,0.3)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSosActive(false)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'none', border: 'none', color: '#94a3b8',
                  cursor: 'pointer', fontSize: '1.5rem'
                }}
              >
                <HiOutlineXMark />
              </button>

              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)', border: '3px solid var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'pulse 1.2s infinite'
              }}>
                <HiOutlineExclamationTriangle style={{ fontSize: '2.5rem', color: 'var(--danger)' }} />
              </div>

              <h2 style={{ fontSize: '1.6rem', color: '#fca5a5', fontWeight: 900, marginBottom: '8px' }}>
                SOS SAFETY ALARM
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
                Do you feel unsafe? Activating the SOS mode will instantly notify the ServeCircle Emergency Response HQ and transmit your live location details.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                <button
                  onClick={sendMockSosAlert}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--danger)', borderColor: 'var(--danger)',
                    padding: '14px', width: '100%', fontSize: '1rem', fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                  }}
                  disabled={mockAlertSent}
                >
                  {mockAlertSent ? '✓ Emergency Alert Transmitted' : '🚨 Trigger Safety Alert Now'}
                </button>

                <a
                  href="tel:100"
                  className="btn btn-outline"
                  style={{
                    borderColor: '#cbd5e1', color: 'white',
                    padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <HiOutlinePhoneArrowUpRight /> Call National Emergency Police (100)
                </a>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px' }}>
                <button
                  className="btn btn-sm btn-outline"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8' }}
                  onClick={() => setSosActive(false)}
                >
                  All Safe - Cancel Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('liveTracking.title')} 📍</h1>
          <p className="page-subtitle">{t('liveTracking.subtitle')}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr', gap: '24px' }}>
        
        {/* Left Side: Mock Live Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Map canvas container */}
          <div className="card" style={{
            height: '420px',
            border: '1px solid var(--gray-200)',
            position: 'relative',
            background: '#e0f2fe',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)'
          }}>
            
            {/* Elegant vector layout details: roads and parks */}
            {/* Road grid lines */}
            <div style={{ position: 'absolute', top: '100px', left: 0, width: '100%', height: '30px', background: '#f1f5f9', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', top: 0, left: '30%', width: '35px', height: '100%', background: '#f1f5f9', borderLeft: '2px solid #cbd5e1', borderRight: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', top: 0, left: '80%', width: '35px', height: '100%', background: '#f1f5f9', borderLeft: '2px solid #cbd5e1', borderRight: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', top: '280px', left: 0, width: '100%', height: '30px', background: '#f1f5f9', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }} />

            {/* Park zones */}
            <div style={{ position: 'absolute', top: '20px', left: '40px', width: '120px', height: '60px', background: '#dcfce7', borderRadius: 'var(--radius-md)', border: '1px dashed #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontSize: '0.65rem', fontWeight: 600 }}>
              🌳 Victoria Park
            </div>
            <div style={{ position: 'absolute', top: '330px', left: '400px', width: '140px', height: '70px', background: '#dcfce7', borderRadius: 'var(--radius-md)', border: '1px dashed #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontSize: '0.65rem', fontWeight: 600 }}>
              ⛲ Lake View Gardens
            </div>

            {/* Target Home Icon */}
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '85%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--navy-800)', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                🏠
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'white', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', color: 'var(--navy-800)', display: 'block', marginTop: '4px', whiteSpace: 'nowrap' }}>
                Your Home
              </span>
            </div>

            {/* Worker Approaching Icon (Animated Position) */}
            <div style={{
              position: 'absolute',
              top: `${workerPos.y}%`,
              left: `${workerPos.x}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 20,
              transition: 'top 1s linear, left 1s linear'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'var(--gradient-primary)', border: '2.5px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(16,185,129,0.4)',
                animation: 'pulse 1.5s infinite'
              }}>
                👷
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--gradient-dark)', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-sm)', display: 'block', marginTop: '4px', whiteSpace: 'nowrap' }}>
                {eta === 0 ? 'Arrived' : t('liveTracking.approaching')}
              </span>
            </div>

            {/* Floating Top Info Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 30
            }}>
              <HiOutlineClock style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>{t('liveTracking.status')}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {eta === 0 ? t('liveTracking.arrivedDoorstep') : t('liveTracking.approaching')} ({eta} mins)
                </span>
              </div>
            </div>

            {/* Prominent Red SOS safety button */}
            <button
              onClick={triggerSos}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'var(--danger)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                zIndex: 30,
                animation: 'pulse 1.5s infinite'
              }}
              title="Click in case of any security concerns"
            >
              🚨
              <span style={{ fontSize: '0.55rem', fontWeight: 900, marginTop: '2px' }}>SOS</span>
            </button>
            
          </div>

          {/* Service Progress tracker timeline */}
          <div className="card" style={{ marginTop: '24px', padding: '24px', background: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '24px' }}>{t('liveTracking.serviceSessionStatus')}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--navy-100)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${(activeStep / 4) * 80}%`, height: '2px', background: 'var(--primary-500)', zIndex: 1, transition: 'width 1s ease' }} />
              
              {['Dispatched', 'Arriving', 'Arrived', 'Job Started', 'Completed'].map((step, idx) => {
                const isPassed = idx <= activeStep;
                const isActive = idx === activeStep;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isPassed ? 'var(--primary-500)' : '#e2e8f0',
                      color: isPassed ? 'white' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8rem', zIndex: 2,
                      border: isActive ? '3px solid var(--primary-100)' : 'none'
                    }}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--navy-900)' : 'var(--navy-400)', marginTop: '12px' }}>
                      {t(`liveTracking.${step.toLowerCase().replace(' ', '')}`)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <AnimatePresence>
              {activeStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '24px', textAlign: 'center' }}
                >
                  <a href="/customer/review/SC-10294" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                    Service Complete — Proceed to Review & Pay
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Professional Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '24px', background: 'white' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('liveTracking.assignedProfessional')}
            </span>   
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#334155', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, margin: '16px auto 12px'
            }}>
              RK
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)' }}>Ramesh Kumar</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
              AC Specialist & Electrician
            </span>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '18px 0', fontSize: '0.85rem' }}>
              <span>⭐ <strong>4.8</strong> (210 reviews)</span>
              <span>💼 <strong>Pro</strong> (2,400+ jobs)</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <a
                href="tel:+919876543210"
                className="btn btn-outline"
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('📞 Simulating masked secure phone call to +91 98765 43210 (Customer call mask active).');
                }}
              >
                <HiOutlinePhone /> {t('liveTracking.callWorker')}
              </a>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                onClick={() => alert('💬 secure Chat channel initiated with Ramesh Kumar.')}
              >
                <HiOutlineChatBubbleLeftRight /> {t('liveTracking.secureChat')}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <HiOutlineShieldCheck style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }} /> {t('liveTracking.verifiedSafetyShield')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem', color: 'var(--navy-600)' }}>
              <li><strong style={{ color: 'var(--navy-800)' }}>{t('liveTracking.kycCompleted')}</strong> Ramesh has successfully completed background checks and registered an active ITI electrical certificate.</li>
              <li><strong style={{ color: 'var(--navy-800)' }}>{t('liveTracking.liveSessionLogs')}</strong> Your active tracking and coordinates are logged securely at the dispatcher center.</li>
              <li><strong style={{ color: 'var(--navy-800)' }}>{t('liveTracking.warrantyCover')}</strong> Booking remains fully insured by ServeCircle damage cover of up to ₹10,000.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveTracking;
