import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineQrCode,
  HiOutlineCamera,
  HiOutlineIdentification,
  HiXMark,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const WorkerVerifyModal = ({ isOpen, onClose, bookingId = null, onVerificationSuccess = null }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [workerIdInput, setWorkerIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleVerify = async (identifierToVerify) => {
    const id = identifierToVerify || workerIdInput;
    if (!id || !id.trim()) {
      setError('Please enter a valid Worker ID or scan a QR Code.');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const res = await fetch(`${API_BASE}/verify/worker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: id.trim(),
          bookingId: bookingId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.isAuthorized) {
        throw new Error(data.message || 'Worker is NOT currently authorized by ServeCircle.');
      }

      setVerificationResult(data);
      if (onVerificationSuccess) {
        onVerificationSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Worker is NOT currently authorized by ServeCircle.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedScan = (sampleId) => {
    setWorkerIdInput(sampleId);
    handleVerify(sampleId);
  };

  const extractWorkerIdentifier = (rawValue) => {
    const value = rawValue.trim();
    try {
      const url = new URL(value);
      const pathMatch = url.pathname.match(/\/verify\/worker\/([^/]+)/i);
      return decodeURIComponent(pathMatch?.[1] || url.searchParams.get('workerId') || url.searchParams.get('code') || value);
    } catch {
      return value;
    }
  };

  const handleQrFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setScanLoading(true);
    setError('');
    setVerificationResult(null);
    try {
      const scanResult = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      const rawValue = typeof scanResult === 'string' ? scanResult : scanResult.data;
      const identifier = extractWorkerIdentifier(rawValue);
      setWorkerIdInput(identifier);
      await handleVerify(identifier);
    } catch {
      setError('QR code could not be read from this image. Use a clear ID-card photo or enter the Worker ID manually.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleProceedToVerificationPage = () => {
    if (verificationResult?.workerProfile?.workerId) {
      const targetWorkerId = verificationResult.workerProfile.workerId;
      onClose();
      navigate(`/customer/verify-worker?workerId=${encodeURIComponent(targetWorkerId)}${bookingId ? `&bookingId=${encodeURIComponent(bookingId)}` : ''}`);
    }
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '20px',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          style={{
            background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            /* Mobile: limit height to viewport so keyboard doesn't clip content */
            maxHeight: '90dvh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            color: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#3b82f6', width: '36px', height: '36px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              }}>
                <HiOutlineShieldCheck />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Verify Worker</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>ServeCircle Trust & Safety</span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white',
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem',
              }}
            >
              <HiXMark />
            </button>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px',
              marginBottom: '20px', gap: '4px',
            }}>
              <button
                onClick={() => { setActiveTab('camera'); setError(''); setVerificationResult(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: activeTab === 'camera' ? 'white' : 'transparent',
                  color: activeTab === 'camera' ? '#1e3a5f' : '#64748b',
                  boxShadow: activeTab === 'camera' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <HiOutlineCamera style={{ fontSize: '1.1rem' }} /> Camera Scanner
              </button>
              <button
                onClick={() => { setActiveTab('manual'); setError(''); setVerificationResult(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: activeTab === 'manual' ? 'white' : 'transparent',
                  color: activeTab === 'manual' ? '#1e3a5f' : '#64748b',
                  boxShadow: activeTab === 'manual' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <HiOutlineIdentification style={{ fontSize: '1.1rem' }} /> Enter Worker ID
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b',
                  borderRadius: '12px', padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600,
                  marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <HiOutlineExclamationTriangle style={{ fontSize: '1.4rem', flexShrink: 0, color: '#dc2626' }} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Verification Result Preview */}
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px',
                  padding: '16px', marginBottom: '20px', textAlign: 'center',
                }}
              >
                <HiOutlineCheckCircle style={{ fontSize: '2.5rem', color: '#16a34a', margin: '0 auto 8px' }} />
                <h4 style={{ color: '#166534', fontWeight: 800, margin: '0 0 4px', fontSize: '1.05rem' }}>
                  Worker Verified Live!
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#15803d', margin: '0 0 14px' }}>
                  {verificationResult.workerProfile.name} ({verificationResult.workerProfile.workerId})
                </p>
                <button
                  onClick={handleProceedToVerificationPage}
                  style={{
                    width: '100%', padding: '12px', background: '#16a34a', color: 'white',
                    border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  Open Verification Profile <HiOutlineArrowRight />
                </button>
              </motion.div>
            )}

            {/* Tab 1: Camera Scanner */}
            {activeTab === 'camera' && !verificationResult && (
              <div>
                <div style={{
                  position: 'relative', width: '100%', height: '220px', background: '#0f172a',
                  borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', border: '2px dashed #3b82f6',
                }}>
                  {/* Scanner overlay effect */}
                  <div style={{
                    position: 'absolute', inset: '25px', border: '2px solid rgba(59, 130, 246, 0.8)',
                    borderRadius: '12px', boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.45)',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                      background: '#3b82f6', boxShadow: '0 0 12px #3b82f6',
                      animation: 'scanLine 2s infinite ease-in-out',
                    }} />
                  </div>

                  <HiOutlineQrCode style={{ fontSize: '3rem', color: '#60a5fa', marginBottom: '8px', zIndex: 1 }} />
                  <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600, zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.8)', textAlign: 'center', padding: '0 24px' }}>
                    Upload a clear ID-card photo to scan its QR code
                  </span>
                </div>

                <label
                  htmlFor="worker-id-card-image"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    marginTop: '14px', padding: '12px 16px', borderRadius: '10px', cursor: scanLoading ? 'wait' : 'pointer',
                    background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: 'white', fontWeight: 800,
                    opacity: scanLoading ? 0.7 : 1,
                  }}
                >
                  <HiOutlineCamera /> {scanLoading ? 'Scanning ID card...' : 'Upload ID Card Photo / Scan QR'}
                </label>
                <input
                  id="worker-id-card-image"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleQrFile}
                  disabled={scanLoading || loading}
                  style={{ display: 'none' }}
                />
                <p style={{ fontSize: '0.74rem', color: '#64748b', textAlign: 'center', margin: '8px 0 0' }}>
                  Works with a saved image or camera capture. The QR must be visible and in focus.
                </p>

                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Demo Quick Scan:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleSimulatedScan('SC-W-1001')}
                      style={{
                        padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', cursor: 'pointer',
                      }}
                    >
                      Scan SC-W-1001
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatedScan('SC-W-8921')}
                      style={{
                        padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', cursor: 'pointer',
                      }}
                    >
                      Scan SC-W-8921
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Manual Worker ID Entry */}
            {activeTab === 'manual' && !verificationResult && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Worker ID Code or QR Token
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="e.g. SC-W-1001 or SCQR-..."
                    value={workerIdInput}
                    onChange={(e) => setWorkerIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    style={{
                      flex: 1, padding: '12px 14px', borderRadius: '10px',
                      border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 700,
                      outline: 'none', color: '#0f172a',
                    }}
                  />
                  <button
                    onClick={() => handleVerify()}
                    disabled={loading}
                    style={{
                      padding: '12px 20px', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                      color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800,
                      fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>
                  Tip: Worker ID is printed on the physical ServeCircle permanent ID Card (e.g. SC-W-1001).
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Scan animation stylesheet */}
        <style>{`
          @keyframes scanLine {
            0% { top: 0%; }
            50% { top: 95%; }
            100% { top: 0%; }
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

export default WorkerVerifyModal;
