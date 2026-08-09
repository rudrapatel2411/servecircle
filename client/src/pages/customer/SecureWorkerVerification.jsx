import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineStar,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineLanguage,
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlineUserCircle,
} from 'react-icons/hi2';

const API_BASE = import.meta.env.VITE_API_URL || 'https://theorize-energize-matted.ngrok-free.dev/api';

const SecureWorkerVerification = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const workerId = params.workerIdCode || searchParams.get('code') || searchParams.get('workerId') || 'SC-W-1001';
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `${API_BASE}/verify/${encodeURIComponent(workerId)}${bookingId ? `?bookingId=${encodeURIComponent(bookingId)}` : ''}`;
        const res = await fetch(url);
        const result = await res.json();

        if (!res.ok || !result.isAuthorized) {
          setError(result.message || 'Worker is NOT currently authorized by ServeCircle.');
          setData(result);
        } else {
          setData(result);
        }
      } catch (err) {
        setError('Worker is NOT currently authorized by ServeCircle.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [workerId, bookingId]);

  const handleContinueToOtp = () => {
    if (bookingId) {
      navigate(`/customer/ordered-services?bookingId=${encodeURIComponent(bookingId)}&verified=true`);
    } else {
      navigate('/customer/ordered-services');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <h3 style={{ color: '#1e3a5f', fontWeight: 700 }}>Verifying Worker Identity...</h3>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 🔴 CASE 1: WORKER IS SUSPENDED, DELETED, BLOCKED, EXPIRED, OR NOT AUTHORIZED
  if (error || (data && !data.isAuthorized)) {
    return (
      <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'white', borderRadius: '24px', padding: '36px 28px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)', border: '2px solid #fecaca',
          }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: '#fef2f2',
            color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', margin: '0 auto 20px', border: '3px solid #fca5a5',
          }}>
            <HiOutlineXCircle />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#991b1b', marginBottom: '12px' }}>
            Authorization Warning
          </h2>

          <div style={{
            background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: '14px',
            padding: '16px 20px', marginBottom: '24px', color: '#b91c1c', fontSize: '0.95rem',
            fontWeight: 800, lineHeight: 1.5,
          }}>
            Worker is NOT currently authorized by ServeCircle.
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
            Do not allow this person entry. If anyone claiming to be a ServeCircle partner arrives with this ID, please contact emergency support immediately.
          </p>

          <button
            disabled
            style={{
              width: '100%', padding: '14px', background: '#cbd5e1', color: '#64748b',
              border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem',
              cursor: 'not-allowed',
            }}
          >
            Continue Disabled
          </button>
        </motion.div>
      </div>
    );
  }

  const profile = data?.profile;

  // 🟢 CASE 2: NON-BOOKING QR SCAN (Random Person Scans Worker QR)
  if (data && !data.hasActiveBooking) {
    return (
      <div style={{ maxWidth: '460px', margin: '40px auto', padding: '0 20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white', borderRadius: '24px', padding: '32px 24px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)', border: '1.5px solid #e2e8f0',
          }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7',
            color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.4rem', margin: '0 auto 16px',
          }}>
            <HiOutlineCheckCircle />
          </div>

          <span style={{
            background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 800,
            padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Verified by ServeCircle
          </span>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '14px 0 4px' }}>
            {profile?.name}
          </h2>

          <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 800, marginBottom: '20px' }}>
            Worker ID: {profile?.workerId}
          </div>

          <div style={{
            background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0',
            fontSize: '0.85rem', color: '#475569', textAlign: 'left', marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: '#64748b' }}>Current Status:</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>{profile?.currentStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#64748b' }}>Verification Badge:</span>
              <span style={{ fontWeight: 800, color: '#1e3a5f' }}>{profile?.verificationBadge}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
            Privacy Protection: Detailed worker profile and active job credentials are only visible to the customer linked to today's assigned booking.
          </p>
        </motion.div>
      </div>
    );
  }

  // 🟢 CASE 3: ACTIVE WORKER LINKED TO TODAY'S BOOKING (Full Verification Profile)
  return (
    <div style={{ maxWidth: '580px', margin: '30px auto', padding: '0 20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white', borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)', border: '1.5px solid #e2e8f0',
        }}
      >
        {/* Verification Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #16a34a 100%)',
          color: 'white', padding: '24px', textAlign: 'center', position: 'relative',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)', padding: '4px 14px', borderRadius: '100px', fontSize: '0.78rem',
            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px',
          }}>
            <HiOutlineShieldCheck style={{ fontSize: '1rem' }} /> Verified Live by ServeCircle
          </div>

          {/* Photo & Identity */}
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 12px' }}>
            <img
              src={profile?.photo}
              alt={profile?.name}
              style={{
                width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              }}
            />
            <div style={{
              position: 'absolute', bottom: '0', right: '0', background: '#22c55e', color: 'white',
              width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.9rem', border: '2px solid white',
            }}>
              ✓
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px', color: 'white' }}>
            {profile?.name}
          </h2>
          <div style={{ fontSize: '0.88rem', opacity: 0.9, fontWeight: 700 }}>
            ID: <span style={{ color: '#fef08a' }}>{profile?.workerId}</span> · {profile?.role}
          </div>
        </div>

        {/* Details Content */}
        <div style={{ padding: '24px' }}>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
            marginBottom: '20px', textAlign: 'center',
          }}>
            <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Rating</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#d97706' }}>
                <HiOutlineStar style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                {profile?.rating}
              </span>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Completed Jobs</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a5f' }}>
                <HiOutlineBriefcase style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                {profile?.completedJobs}+
              </span>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Experience</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#16a34a' }}>
                {profile?.experience}
              </span>
            </div>
          </div>

          {/* Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Skills & Specializations
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {profile?.skills.map((skill, idx) => (
                  <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Verified Certificates
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {profile?.certificates.map((cert, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineAcademicCap style={{ color: '#16a34a', fontSize: '1rem' }} /> {cert}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Languages Spoken
              </span>
              <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineLanguage style={{ color: '#2563eb', fontSize: '1rem' }} /> {profile?.languages.join(', ')}
              </div>
            </div>

            {profile?.todaysBookingStatus && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  Today's Booking Linked
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#14532d' }}>
                  {profile.todaysBookingStatus.service} ({profile.todaysBookingStatus.bookingId})
                </div>
              </div>
            )}
          </div>

          {/* Action Button to Continue to OTP */}
          <button
            onClick={handleContinueToOtp}
            style={{
              width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
              color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            Press Continue to Proceed to OTP <HiOutlineArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SecureWorkerVerification;
