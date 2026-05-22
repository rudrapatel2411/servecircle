import { useState, useEffect } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineMapPin, HiOutlinePhone, HiOutlineBellSnooze } from 'react-icons/hi2';

const SOSAlertSystem = ({ bookingId = 'SC-840620' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isTriggered, setIsTriggered] = useState(false);
  const [coords, setCoords] = useState({ lat: '12.9716° N', lng: '77.5946° E' }); // Mock Bangalore coords
  const [dispatchStatus, setDispatchStatus] = useState('Resolving location...');

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0 && !isTriggered) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !isTriggered) {
      triggerEmergency();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isTriggered]);

  const triggerEmergency = () => {
    setIsTriggered(true);
    setDispatchStatus('Locating Dispatch Unit...');
    // Simulate real-time dispatch progress steps
    setTimeout(() => {
      setDispatchStatus('🚨 Emergency Signal Dispatched: ServeCircle Quick Response Unit (QRU) enroute.');
    }, 1500);
    setTimeout(() => {
      setDispatchStatus('🚨 Local Authorities alerted. QRU vehicle (KA-03-EM-8824) dispatched. ETA: 4 mins.');
    }, 3500);
  };

  const cancelCountdown = () => {
    setIsOpen(false);
    setCountdown(5);
    setIsTriggered(false);
  };

  return (
    <>
      {/* Floating Pulse Panic SOS Button */}
      <div
        onClick={() => {
          setIsOpen(true);
          setCountdown(5);
          setIsTriggered(false);
        }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
          background: 'radial-gradient(circle, #ff0000 0%, #cc0000 100%)',
          color: 'white',
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.9rem',
          boxShadow: '0 8px 30px rgba(255, 0, 0, 0.4), inset 0 0 10px rgba(255,255,255,0.4)',
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: '0.5px'
        }}
      >
        <span style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid #ff0000',
          animation: 'ping 1.2s infinite'
        }} />
        <span style={{ fontSize: '1rem', marginBottom: '-2px' }}>🚨</span>
        SOS
      </div>

      {/* SOS EXPANDED MODAL OVERLAY */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b1b 0%, #110e0e 100%)',
            border: '2px solid #ef4444',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '500px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.25)',
            position: 'relative'
          }}>
            {!isTriggered ? (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid #ef4444',
                  color: '#ef4444',
                  fontSize: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <HiOutlineExclamationTriangle />
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                  ServeCircle SafeGuard SOS
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
                  Triggering emergency broadcast to **ServeCircle Emergency Response Center** & Local Patrol.
                </p>

                {/* Big Animated Countdown */}
                <div style={{
                  fontSize: '6.5rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#ef4444',
                  lineHeight: 1,
                  margin: '20px 0',
                  textShadow: '0 0 20px rgba(239,68,68,0.3)',
                  animation: 'pulse 1s infinite'
                }}>
                  {countdown}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
                  <button
                    onClick={triggerEmergency}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 20px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    Trigger Immediately 🚨
                  </button>
                  <button
                    onClick={cancelCountdown}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Alert
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  fontSize: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  animation: 'pulse 1s infinite'
                }}>
                  🚨
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                  EMERGENCY SIGNAL ACTIVE
                </h2>
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  padding: '4px 14px',
                  borderRadius: '50px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}>
                  ID: {bookingId}-SOS
                </span>

                {/* Geo Coordinates */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <HiOutlineMapPin /> Live GPS Broadcast Coordinates
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontFamily: 'monospace', marginTop: '8px', color: '#cbd5e1' }}>
                    <span>Latitude: {coords.lat}</span>
                    <span>Longitude: {coords.lng}</span>
                  </div>
                </div>

                {/* Dispatch Status Log */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '80px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: '#10b981'
                }}>
                  {dispatchStatus}
                </div>

                {/* Hotlines */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a
                    href="tel:112"
                    style={{
                      background: 'linear-gradient(90deg, #1e293b, #0f172a)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <HiOutlinePhone /> Call Police (Dial 112)
                  </a>
                  <button
                    onClick={cancelCountdown}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <HiOutlineBellSnooze /> False Alarm: Cancel Alert
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

export default SOSAlertSystem;
