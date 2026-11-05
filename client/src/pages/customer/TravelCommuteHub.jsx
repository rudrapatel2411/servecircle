import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineCalendarDays,
  HiOutlineShieldCheck, HiOutlineTruck, HiOutlinePaperAirplane,
  HiOutlineUserCircle, HiOutlineStar, HiOutlineInformationCircle,
  HiOutlineCurrencyRupee, HiOutlineMoon, HiOutlineArchiveBox,
} from 'react-icons/hi2';
import { calcAirportTransfer, calcOutstationChauffeur, fmt, getPriceBreakdownItems } from '../../utils/pricingEngine';
import '../Dashboard.css';
import './CustomerPages.css';

// Reusable price breakdown component
const PriceBreakdown = ({ breakdown }) => {
  const items = getPriceBreakdownItems(breakdown);
  if (items.length <= 1) return null;
  return (
    <div style={{ marginTop: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
          <span>{item.label}</span>
          <span style={{ fontWeight: 700, color: item.amount < 0 ? '#16a34a' : '#374151' }}>
            {item.amount < 0 ? '−' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

const TravelCommuteHub = () => {
  const { t } = useTranslation();

  // Airport Transfer State
  const [carType, setCarType] = useState('sedan');       // 'sedan' | 'suv' | 'luxury'
  const [isNight, setIsNight] = useState(false);
  const [extraLuggage, setExtraLuggage] = useState(false);
  const [flightNo, setFlightNo] = useState('');
  const [transferDate, setTransferDate] = useState('');

  // Outstation Driver State
  const [outCarType, setOutCarType] = useState('sedan'); // 'sedan' | 'suv' | 'luxury'
  const [distanceKm, setDistanceKm] = useState(150);
  const [travelDays, setTravelDays] = useState(2);
  const [destination, setDestination] = useState('Mysore');

  // Compute prices dynamically
  const airportResult = calcAirportTransfer({ carType, isNight, extraLuggage });
  const outstationResult = calcOutstationChauffeur({ distanceKm, days: travelDays, carType: outCarType });

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>

      {/* Back Button */}
      <Link to="/customer/general-services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>

        {/* ── Airport Transfer Card ── */}
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
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {t('travelCommute.guaranteedAirport')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              {t('travelCommute.zeroCancellation')}
            </p>

            {/* Car Type Selection */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { id: 'sedan',  name: t('travelCommute.premiumSedan'), seats: '4', icon: '🚗', tags: ['WiFi', 'Water'],         baseNote: '₹799 base' },
                { id: 'suv',    name: t('travelCommute.luxurySuv'),    seats: '6', icon: '🚙', tags: ['Extra Legroom', 'TV'],   baseNote: '₹1,499 base' },
                { id: 'luxury', name: 'Luxury Sedan',                  seats: '4', icon: '🏎️', tags: ['Champagne', 'Privacy'], baseNote: '₹2,499 base' },
              ].map((car) => (
                <div
                  key={car.id}
                  onClick={() => setCarType(car.id)}
                  style={{
                    flex: 1, minWidth: '110px',
                    border: '1.5px solid',
                    borderColor: carType === car.id ? '#0f766e' : 'var(--gray-200)',
                    borderRadius: '12px', padding: '10px',
                    background: carType === car.id ? '#f0fdfa' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '2rem', textAlign: 'center' }}>{car.icon}</div>
                  <h4 style={{ margin: '4px 0 2px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', color: 'var(--navy-800)' }}>{car.name}</h4>
                  <p style={{ fontSize: '0.62rem', color: '#64748b', textAlign: 'center', margin: 0 }}>{car.baseNote}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {car.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: '0.52rem', background: 'var(--gray-100)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, color: 'var(--gray-700)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={isNight} onChange={(e) => setIsNight(e.target.checked)} />
                <HiOutlineMoon style={{ color: '#6366f1' }} /> Night Pickup (+25%)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={extraLuggage} onChange={(e) => setExtraLuggage(e.target.checked)} />
                <HiOutlineArchiveBox style={{ color: '#f59e0b' }} /> Extra Luggage (+₹200)
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('travelCommute.flightNoLabel')}</label>
                <input
                  type="text"
                  placeholder={t('travelCommute.flightNoPlaceholder')}
                  value={flightNo}
                  onChange={(e) => setFlightNo(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('travelCommute.pickupDateTime')}</label>
                <input
                  type="datetime-local"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div style={{
            background: 'rgba(15, 118, 110, 0.04)',
            border: '1px solid rgba(15, 118, 110, 0.12)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('travelCommute.estFare')}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f766e' }}>₹{fmt(airportResult.total)}</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent('Guaranteed Airport Drop & Pick')}&serviceId=airport-transfer&category=travel-commute&price=${airportResult.total}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
              >
                {t('travelCommute.bookAirport')}
              </Link>
            </div>
            <PriceBreakdown breakdown={airportResult.breakdown} />
          </div>
        </div>

        {/* ── Outstation Chauffeur Card ── */}
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
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '6px' }}>
              {t('travelCommute.outstationChauffeurs')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              {t('travelCommute.outstationDesc')}
            </p>

            {/* Car Type for Outstation */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'sedan',  label: '🚗 Sedan',   rate: '₹12/km' },
                { id: 'suv',    label: '🚙 SUV',     rate: '₹18/km' },
                { id: 'luxury', label: '🏎️ Luxury',  rate: '₹28/km' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setOutCarType(c.id)}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    border: `1.5px solid ${outCarType === c.id ? '#0f766e' : '#e2e8f0'}`,
                    background: outCarType === c.id ? '#f0fdfa' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: outCarType === c.id ? '#0f766e' : '#374151',
                    textAlign: 'center',
                  }}
                >
                  <div>{c.label}</div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>{c.rate}</div>
                </button>
              ))}
            </div>

            {/* Destination */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Destination City</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Mysore, Coorg, Jaipur..."
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Distance Slider */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>One-way Distance</span>
                <span style={{ color: '#0f766e', fontWeight: 900 }}>{distanceKm} km</span>
              </label>
              <input
                type="range" min="20" max="1000" step="10"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#0f766e', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                <span>20 km</span><span>500 km</span><span>1000 km</span>
              </div>
            </div>

            {/* Days Slider */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>{t('travelCommute.daysSliderLabel')}</span>
                <span style={{ color: '#0f766e', fontWeight: 900 }}>{travelDays} day{travelDays > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range" min="1" max="10"
                value={travelDays}
                onChange={(e) => setTravelDays(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#0f766e', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Price Summary */}
          <div style={{
            background: 'rgba(15, 118, 110, 0.04)',
            border: '1px solid rgba(15, 118, 110, 0.12)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('travelCommute.estFareTotal')}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f766e' }}>₹{fmt(outstationResult.total)}</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent('Multi-Day Outstation Chauffeur')}&serviceId=outstation-chauffeur&category=travel-commute&price=${outstationResult.total}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
              >
                {t('travelCommute.bookChauffeur')}
              </Link>
            </div>
            <PriceBreakdown breakdown={outstationResult.breakdown} />
          </div>
        </div>
      </div>

      {/* Premium Commute Rentals */}
      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #0f766e' }}>
          Premium Commute & Rentals
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: t('travelCommuteExt.luxuryRentals'), desc: t('travelCommuteExt.luxuryDesc'), link: '/customer/travel-flow?type=luxury-rental', label: 'Explore Fleet', price: '₹4,999/day onwards' },
            { title: t('travelCommuteExt.schoolCommute'), desc: t('travelCommuteExt.schoolDesc'), link: '/customer/travel-flow?type=school-commute', label: 'Setup Kids Route', price: '₹3,499/month onwards' },
            { title: t('travelCommuteExt.corporateCarpool'), desc: t('travelCommuteExt.corporateDesc'), link: '/customer/travel-flow?type=corporate-carpool', label: 'Find Co-riders', price: '₹1,299/month onwards' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '12px' }}>{item.desc}</p>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f766e', background: '#f0fdfa', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
                  {item.price}
                </span>
              </div>
              <Link
                to={item.link}
                className="btn btn-primary btn-sm"
                style={{ padding: '12px 16px', background: '#0f766e', borderColor: '#0f766e', fontWeight: 800, textAlign: 'center' }}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Ride Safety Shield */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white', padding: '30px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#3b7dc1', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <HiOutlineShieldCheck size={24} />
              </span>
              {t('travelCommuteExt.safetyShield')}
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
              {t('travelCommuteExt.safetyDesc')}
            </p>
          </div>
          <button
            className="btn"
            style={{ background: '#ef4444', color: 'white', fontWeight: 900, border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}
            onClick={() => alert('SOS Alert Triggered! Our emergency team is connecting with you now.')}
          >
            {t('travelCommuteExt.sosAlert')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineMapPin /> {t('travelCommuteExt.liveGps')}
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>{t('travelCommuteExt.gpsDesc')}</p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlinePaperAirplane /> {t('travelCommuteExt.shareTrip')}
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>{t('travelCommuteExt.shareDesc')}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TravelCommuteHub;
