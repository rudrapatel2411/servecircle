import React, { useState } from 'react';
import { HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlinePhone } from 'react-icons/hi2';
import { triggerWorkerSos } from '../pages/worker/workerApi';

export default function WorkerSosModal({
  isOpen,
  onClose,
  token,
  bookingId,
}) {
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTrigger = async () => {
    setLoading(true);
    setError('');

    let coords = {};
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (geoErr) {
        // Location optional in extreme emergency
      }
    }

    try {
      await triggerWorkerSos(token, {
        bookingId: bookingId || null,
        severity: 'CRITICAL',
        ...coords,
      });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Emergency trigger failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(153, 27, 27, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            <HiOutlineXMark />
          </button>
        </div>

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
          }}
        >
          <HiOutlineExclamationTriangle />
        </div>

        {sent ? (
          <div>
            <h3 style={{ color: '#991b1b', margin: '0 0 10px', fontSize: '1.25rem', fontWeight: 800 }}>
              EMERGENCY BROADCAST ACTIVE
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', marginBottom: '20px' }}>
              Your emergency signal and GPS coordinates have been sent to the ServeCircle Safety Desk and on-call emergency coordinators. A supervisor is attempting direct contact now.
            </p>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#991b1b',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <HiOutlinePhone /> Emergency Police Helpline: 112 / 100
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Dismiss Notice
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ color: '#1e293b', margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800 }}>
              Trigger Worker SOS Alert
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
              Are you in immediate danger or facing harassment? Clicking below will immediately alert our emergency response team and dispatch supervisors with your active coordinates.
            </p>

            {error && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleTrigger}
                disabled={loading}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: loading ? 'default' : 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  letterSpacing: '0.5px',
                }}
              >
                {loading ? 'BROADCASTING SOS...' : '🚨 CONFIRM & SEND SOS ALERT NOW'}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel / False Alarm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
