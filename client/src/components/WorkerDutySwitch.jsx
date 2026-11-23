import React, { useState } from 'react';
import {
  HiOutlineBolt,
  HiOutlinePauseCircle,
  HiOutlinePower,
  HiOutlineMapPin,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { updateDutyStatus } from '../pages/worker/workerApi';

export default function WorkerDutySwitch({
  token,
  currentStatus = 'offline',
  lastUpdated,
  isVerified = true,
  workerStatus,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationNote, setLocationNote] = useState('');

  const status = (currentStatus || 'offline').toLowerCase();

  // Synchronize if duty changed from top Navbar or another component
  React.useEffect(() => {
    const handleSync = (e) => {
      if (e.detail?.dutyStatus && e.detail.dutyStatus.toLowerCase() !== status) {
        if (onStatusChange) {
          onStatusChange(e.detail.dutyStatus.toLowerCase(), e.detail.user);
        }
      }
    };
    window.addEventListener('servecircle:duty-changed', handleSync);
    return () => window.removeEventListener('servecircle:duty-changed', handleSync);
  }, [status, onStatusChange]);

  const handleToggle = async (targetStatus) => {
    if (loading || status === targetStatus) return;
    setError('');
    setLocationNote('');

    if (targetStatus === 'online' && !isVerified) {
      setError('Your worker profile is pending verification. Only approved pros can go online.');
      return;
    }

    setLoading(true);

    let coords = {};
    if (targetStatus === 'online' && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
          });
        });
        coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocationNote('GPS location updated for dispatch.');
      } catch (geoErr) {
        // As per spec: permission denial does not block manual online status
        setLocationNote('Location optional. Dispatch will use registered service city.');
      }
    }

    try {
      const updatedUser = await updateDutyStatus(token, {
        dutyStatus: targetStatus,
        ...coords,
      });
      if (onStatusChange) {
        onStatusChange(targetStatus, updatedUser);
      }
      window.dispatchEvent(
        new CustomEvent('servecircle:duty-changed', {
          detail: { dutyStatus: targetStatus, user: updatedUser },
        })
      );
    } catch (err) {
      setError(err.message || 'Could not update duty status');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    online: {
      label: 'Online & Available',
      desc: 'You are eligible to receive customer booking dispatches.',
      color: '#536D57',
      bg: 'rgba(83, 109, 87, 0.12)',
      border: '#C7D7CA',
    },
    paused: {
      label: 'On Break / Paused',
      desc: 'Temporarily paused. You will not receive new jobs until resumed.',
      color: '#B87B2E',
      bg: '#FEF3C7',
      border: '#FDE68A',
    },
    offline: {
      label: 'Off Duty',
      desc: 'You are offline. Toggle online when you are ready to work.',
      color: '#475569',
      bg: '#F1F5F9',
      border: '#E2E8F0',
    },
  };

  const currentCfg = statusConfig[status] || statusConfig.offline;

  return (
    <div
      className="worker-duty-switch-card"
      style={{
        background: '#ffffff',
        border: `1.5px solid ${currentCfg.border}`,
        borderRadius: 'var(--radius-lg, 18px)',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: currentCfg.color,
              boxShadow: status === 'online' ? `0 0 0 4px ${currentCfg.bg}` : 'none',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--sc-dark-accent, #1E40AF)' }}>
                Duty Status:
              </span>
              <span
                style={{
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  backgroundColor: currentCfg.bg,
                  color: currentCfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {status}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--sc-text-secondary, #475569)' }}>
              {currentCfg.desc}
            </p>
          </div>
        </div>

        {/* Action Toggle Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleToggle('online')}
            disabled={loading || status === 'online'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: status === 'online' || loading ? 'default' : 'pointer',
              border: status === 'online' ? '1.5px solid #16a34a' : '1px solid #CBD5E1',
              backgroundColor: status === 'online' ? '#16a34a' : '#ffffff',
              color: status === 'online' ? '#ffffff' : '#0F172A',
              transition: 'all 0.2s ease',
            }}
          >
            <HiOutlineBolt /> Go Online
          </button>

          <button
            type="button"
            onClick={() => handleToggle('paused')}
            disabled={loading || status === 'paused'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: status === 'paused' || loading ? 'default' : 'pointer',
              border: status === 'paused' ? '1.5px solid #B87B2E' : '1px solid #CBD5E1',
              backgroundColor: status === 'paused' ? '#B87B2E' : '#ffffff',
              color: status === 'paused' ? '#ffffff' : '#0F172A',
              transition: 'all 0.2s ease',
            }}
          >
            <HiOutlinePauseCircle /> Pause
          </button>

          <button
            type="button"
            onClick={() => handleToggle('offline')}
            disabled={loading || status === 'offline'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: status === 'offline' || loading ? 'default' : 'pointer',
              border: status === 'offline' ? '1.5px solid #1E293B' : '1px solid #CBD5E1',
              backgroundColor: status === 'offline' ? '#1E293B' : '#ffffff',
              color: status === 'offline' ? '#ffffff' : '#0F172A',
              transition: 'all 0.2s ease',
            }}
          >
            <HiOutlinePower /> Go Offline
          </button>
        </div>
      </div>

      {/* Status Info / Errors */}
      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <HiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {locationNote && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '0.8rem',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <HiOutlineMapPin /> {locationNote}
        </div>
      )}

      {lastUpdated && (
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
          Status updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}
