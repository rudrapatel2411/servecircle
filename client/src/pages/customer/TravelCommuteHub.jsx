import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineCalendarDays, HiOutlineShieldCheck, HiOutlineTruck } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const TravelCommuteHub = () => {
  // Airport Transfer State
  const [carType, setCarType] = useState('sedan'); // 'sedan', 'suv'
  const [flightNo, setFlightNo] = useState('');
  const [transferDate, setTransferDate] = useState('');

  // Outstation Driver State
  const [travelDays, setTravelDays] = useState(2);
  const [destination, setDestination] = useState('Mysore');

  const calculateAirportPrice = () => {
    return carType === 'sedan' ? 799 : 1499;
  };

  const calculateOutstationPrice = () => {
    return travelDays * 999;
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
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #10b981',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🚗</span>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              ServeCircle Travel & Driver Commute 🛣️
            </h1>
            <p className="page-subtitle" style={{ color: '#ccfbf1', fontSize: '0.9rem', marginTop: '4px' }}>
              Guaranteed flight-delay buffered airport transfers and professional highway outstation chauffeurs.
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
        
        {/* Airport Transfer Scheduling */}
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
              ✈️ Guaranteed Airport Transfers
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Zero-cancellation premium rides. Our drivers track your flight status live for automatic delays buffer.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setCarType('sedan')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: carType === 'sedan' ? '#0f766e' : 'var(--gray-200)',
                  background: carType === 'sedan' ? 'rgba(15, 118, 110, 0.05)' : 'white',
                  color: carType === 'sedan' ? '#0f766e' : 'var(--gray-700)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Premium Sedan (₹799)
              </button>
              <button
                onClick={() => setCarType('suv')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: carType === 'suv' ? '#0f766e' : 'var(--gray-200)',
                  background: carType === 'suv' ? 'rgba(15, 118, 110, 0.05)' : 'white',
                  color: carType === 'suv' ? '#0f766e' : 'var(--gray-700)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Luxury SUV (₹1,499)
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Flight Number (e.g. 6E-2104)</label>
                <input
                  type="text"
                  placeholder="Enter flight number for live tracking"
                  value={flightNo}
                  onChange={(e) => setFlightNo(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Pickup Date & Time</label>
                <input
                  type="datetime-local"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 118, 110, 0.03)',
            border: '1px solid rgba(15, 118, 110, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Estimated Fare</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateAirportPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Guaranteed Airport Drop & Pick')}&price=${calculateAirportPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
            >
              Book Airport Transfer
            </Link>
          </div>
        </div>

        {/* Multi-Day Outstation Chauffeur Booking */}
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
              🛣️ Multi-Day Outstation Chauffeurs
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Hire highway-certified, safety-vetted professional drivers for family trips in your own vehicle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Destination City</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                />
              </div>

              {/* Days Slider */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Duration (Days):</span>
                  <span style={{ color: '#0f766e', fontWeight: 800 }}>{travelDays} Days</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={travelDays}
                  onChange={(e) => setTravelDays(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#0f766e', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '4px' }}>
                  <span>1 Day</span>
                  <span>10 Days</span>
                </div>
              </div>
            </div>

            {/* Drivers rate cards details */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--gray-200)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.72rem',
              color: 'var(--gray-600)',
              marginTop: '16px',
              lineHeight: 1.4
            }}>
              💡 <strong>Driver details:</strong> Includes highway tolls handling assistance, mechanical breakdown diagnostics support, and night driving allowances.
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 118, 110, 0.03)',
            border: '1px solid rgba(15, 118, 110, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Estimated Fare (Total)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateOutstationPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Multi-Day Outstation Chauffeur')}&price=${calculateOutstationPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
            >
              Book Chauffeur
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TravelCommuteHub;
