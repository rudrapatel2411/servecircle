import React, { useState, useEffect } from 'react';
import {
  HiOutlineBolt,
  HiOutlinePauseCircle,
  HiOutlinePower,
  HiOutlineMapPin,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { updateDutyStatus, getWorkerSession, setWorkerSession } from '../pages/worker/workerApi';
import { getSession, saveSession } from '../utils/authSession';

export default function WorkerDutySwitch({
  token,
  currentStatus = 'offline',
  lastUpdated,
  isVerified = true,
  workerStatus,
  onStatusChange,
}) {
  const [localStatus, setLocalStatus] = useState(() => (currentStatus || 'offline').toLowerCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationNote, setLocationNote] = useState('');

  // Keep in sync with parent prop
  useEffect(() => {
    if (currentStatus) {
      setLocalStatus(currentStatus.toLowerCase());
    }
  }, [currentStatus]);

  // Listen to cross-component duty switch events (e.g. from top header navbar)
  useEffect(() => {
    const handleDutySync = (e) => {
      if (e.detail?.dutyStatus) {
        setLocalStatus(e.detail.dutyStatus.toLowerCase());
      }
    };
    window.addEventListener('servecircle:duty-status-changed', handleDutySync);
    return () => {
      window.removeEventListener('servecircle:duty-status-changed', handleDutySync);
    };
  }, []);

  const status = localStatus;

  const handleToggle = async (targetStatus) => {
    if (loading || status === targetStatus) return;
    setError('');
    setLocationNote('');
    setLoading(true);

    // Optimistic UI update
    setLocalStatus(targetStatus);

    let coords = {};
    if (targetStatus === 'online' && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 4000,
            maximumAge: 60000,
          });
        });
        coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocationNote('GPS location updated for dispatch.');
      } catch (geoErr) {
        setLocationNote('Location optional. Dispatch will use registered service area.');
      }
    }

    const activeToken = token || getWorkerSession()?.token || getSession()?.token;

    try {
      let updatedUser = null;
      if (activeToken && activeToken !== 'demo-token-worker') {
        try {
          updatedUser = await updateDutyStatus(activeToken, {
            dutyStatus: targetStatus,
            ...coords,
          });
        } catch (apiErr) {
          console.warn('[DutySwitch] API notice:', apiErr.message);
        }
      }

      // Sync local storage sessions
      const curWorker = getWorkerSession();
      if (curWorker?.user) {
        const next = { ...curWorker, user: { ...curWorker.user, dutyStatus: targetStatus, ...updatedUser } };
        setWorkerSession(next);
      }
      const curGeneral = getSession();
      if (curGeneral?.user && curGeneral.user.role === 'worker') {
        const nextGen = { ...curGeneral, user: { ...curGeneral.user, dutyStatus: targetStatus, ...updatedUser } };
        saveSession(nextGen);
      }

      // Broadcast to top navbar & other listening components
      window.dispatchEvent(
        new CustomEvent('servecircle:duty-status-changed', {
          detail: { dutyStatus: targetStatus, user: updatedUser },
        })
      );

      if (onStatusChange) {
        onStatusChange(targetStatus, updatedUser);
      }
    } catch (err) {
      setError(err.message || 'Could not update duty status');
      setLocalStatus(currentStatus.toLowerCase()); // revert on error
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    online: {
      label: 'Online & Available',
      desc: 'You are eligible to receive live customer booking dispatches.',
      color: '#16a34a',
      bg: '#dcfce7',
      border: '#86efac',
    },
    paused: {
      label: 'On Break / Paused',
      desc: 'Temporarily paused. You will not receive new jobs until resumed.',
      color: '#d97706',
      bg: '#fef3c7',
      border: '#fde68a',
    },
    offline: {
      label: 'Off Duty',
      desc: 'You are offline. Toggle online when you are ready to receive jobs.',
      color: '#475569',
      bg: '#f1f5f9',
      border: '#cbd5e1',
    },
  };

  const currentCfg = statusConfig[status] || statusConfig.offline;

  return (
    <div
      className="worker-duty-switch-card"
      style={{
        background: '#ffffff',
        border: `1.5px solid ${currentCfg.border}`,
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
              transition: 'all 0.3s ease',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>
                Duty Status:
              </span>
              <span
                style={{
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  backgroundColor: currentCfg.bg,
                  color: currentCfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                }}
              >
                {status}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
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
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: status === 'online' || loading ? 'default' : 'pointer',
              border: status === 'online' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
              backgroundColor: status === 'online' ? '#16a34a' : '#ffffff',
              color: status === 'online' ? '#ffffff' : '#334155',
              transition: 'all 0.2s ease',
              boxShadow: status === 'online' ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none',
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
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: status === 'paused' || loading ? 'default' : 'pointer',
              border: status === 'paused' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
              backgroundColor: status === 'paused' ? '#d97706' : '#ffffff',
              color: status === 'paused' ? '#ffffff' : '#334155',
              transition: 'all 0.2s ease',
              boxShadow: status === 'paused' ? '0 2px 6px rgba(217, 119, 6, 0.25)' : 'none',
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
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: status === 'offline' || loading ? 'default' : 'pointer',
              border: status === 'offline' ? '1.5px solid #64748b' : '1px solid #e2e8f0',
              backgroundColor: status === 'offline' ? '#64748b' : '#ffffff',
              color: status === 'offline' ? '#ffffff' : '#334155',
              transition: 'all 0.2s ease',
              boxShadow: status === 'offline' ? '0 2px 6px rgba(100, 116, 139, 0.2)' : 'none',
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
