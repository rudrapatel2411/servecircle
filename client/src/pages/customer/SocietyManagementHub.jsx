import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineClock } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const SocietyManagementHub = () => {
  // RWA collective state
  const [neighborCount, setNeighborCount] = useState(3);
  const [guardDuration, setGuardDuration] = useState('monthly'); // 'daily', 'monthly'

  const calculateCollectiveDiscount = (count) => {
    if (count >= 15) return 20; // 20% max discount
    if (count >= 10) return 15;
    if (count >= 5) return 10;
    return 5;
  };

  const calculateCleanPrice = () => {
    const base = 3999;
    const discount = calculateCollectiveDiscount(neighborCount);
    return Math.round(base * (1 - discount / 100));
  };

  const calculateGuardPrice = () => {
    return guardDuration === 'daily' ? 899 : 24999;
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button */}
      <Link to="/customer/services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      {/* Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #0f172a',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🏢</span>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              ServeCircle Society & RWA Portals 🤝
            </h1>
            <p className="page-subtitle" style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '4px' }}>
              Collective neighborhood booking discounts, lobby jet-washers, and biometric guard roster placement.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        
        {/* Collective Neighborhood Cleanups */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineUserGroup style={{ color: '#3b82f6' }} /> RWA Collective Cleanups
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Book shared park cleanups, elevator lobby pressure washing, or boundary wall paint touch-ups.
              <strong> The more neighbors join the booking pool, the higher the discount!</strong>
            </p>

            {/* Neighbors counter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Joined Neighbors:</span>
                <span style={{ color: '#3b82f6', fontWeight: 900 }}>{neighborCount} Homes</span>
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={neighborCount}
                onChange={(e) => setNeighborCount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '4px' }}>
                <span>1 Home (5% Off)</span>
                <span>25 Homes (20% Off)</span>
              </div>
            </div>

            {/* Discount display */}
            <div style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.8rem',
              color: '#065f46',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '20px'
            }}>
              🎉 Collective Discount Applied: {calculateCollectiveDiscount(neighborCount)}% OFF
            </div>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.03)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Collective Price per Home</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateCleanPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('RWA Lobby & Pathway Cleaning')}&price=${calculateCleanPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Book Collective Clean
            </Link>
          </div>
        </div>

        {/* Security Guard Placements */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineShieldCheck style={{ color: '#10b981' }} /> Biometric Guard Roster
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Deploy fully verified, biometric-logged security personnel for gates, apartment blocks, or event protection sweeps.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setGuardDuration('daily')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: guardDuration === 'daily' ? '#10b981' : 'var(--gray-200)',
                  background: guardDuration === 'daily' ? 'rgba(16, 185, 129, 0.05)' : 'white',
                  color: guardDuration === 'daily' ? '#10b981' : 'var(--gray-700)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                12-Hour Roster (Daily)
              </button>
              <button
                onClick={() => setGuardDuration('monthly')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: guardDuration === 'monthly' ? '#10b981' : 'var(--gray-200)',
                  background: guardDuration === 'monthly' ? 'rgba(16, 185, 129, 0.05)' : 'white',
                  color: guardDuration === 'monthly' ? '#10b981' : 'var(--gray-700)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Monthly Full Deployment
              </button>
            </div>

            {/* Features check list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: 'var(--navy-750)' }}>
              <span>👮🏼 Vetted military veteran personnel available</span>
              <span>🔒 Direct sync with biometric logging tablet</span>
              <span>🔥 Fire Marshall isolation & safety drill certified</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.03)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Guard Cost Fee</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateGuardPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Vetted Security Guard Roster')}&price=${calculateGuardPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#10b981', borderColor: '#10b981' }}
            >
              Deploy Guards
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocietyManagementHub;
