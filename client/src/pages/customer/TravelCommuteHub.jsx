import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft, HiOutlineMapPin,
  HiOutlineShieldCheck, HiOutlinePaperAirplane,
  HiOutlineMoon, HiOutlineArchiveBox, HiOutlineKey, HiOutlineUser,
} from 'react-icons/hi2';
import {
  PICKUP_HUBS,
  OUTSTATION_CARS,
  estimateOutstationRoute,
  calcPointToPointTransfer,
  calcOutstationChauffeur,
  fmt,
  getPriceBreakdownItems,
} from '../../utils/pricingEngine';
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

const QUICK_ROUTES = [
  { label: 'City Center', km: 10 },
  { label: 'SG Highway', km: 20 },
  { label: 'GIFT City', km: 25 },
  { label: 'Bopal / South', km: 28 },
  { label: 'Inter-City Hub', km: 110 },
];

const PICKUP_MODE_TABS = [
  { id: 'airport', label: '✈️ Airport', refLabel: 'Flight No (Optional)', refPlaceholder: 'e.g. 6E-204' },
  { id: 'railway', label: '🚆 Railway', refLabel: 'Train / PNR (Optional)', refPlaceholder: 'e.g. 12934 / Coach B2' },
  { id: 'bus',     label: '🚌 Bus Stand', refLabel: 'Bus Operator (Optional)', refPlaceholder: 'e.g. GSRTC Volvo' },
  { id: 'custom',  label: '📍 Any Place', refLabel: 'Landmark Note (Optional)', refPlaceholder: 'e.g. Gate No. 2' },
];

const TravelCommuteHub = () => {
  const { t } = useTranslation();

  // ── Point-to-Point Pick & Drop State (Airport / Railway / Bus Terminal / Any Location) ──
  const [pickupType, setPickupType] = useState('airport'); // 'airport' | 'railway' | 'bus' | 'custom'
  const [selectedHubCode, setSelectedHubCode] = useState(PICKUP_HUBS.airport[0].code);
  const [customPickupAddress, setCustomPickupAddress] = useState('Navrangpura, Ahmedabad');
  const [dropDestination, setDropDestination] = useState('SG Highway, Ahmedabad');
  const [transferDistanceKm, setTransferDistanceKm] = useState(20);
  const [isNight, setIsNight] = useState(false);
  const [extraLuggage, setExtraLuggage] = useState(false);
  const [flightNo, setFlightNo] = useState('');
  const [transferDate, setTransferDate] = useState('');

  // ── Multi-Day Outstation State (Pickup & Drop Cities -> Auto-Estimated Km/Days + Drive Mode + All Cars) ──
  const [driveMode, setDriveMode] = useState('with-driver'); // 'with-driver' | 'self-drive'
  const [outCarType, setOutCarType] = useState('suv');
  const [outPickupCity, setOutPickupCity] = useState('Bhavnagar');
  const [destination, setDestination] = useState('Udaipur');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [distanceKm, setDistanceKm] = useState(350);
  const [travelDays, setTravelDays] = useState(1);
  const [isAutoEstimated, setIsAutoEstimated] = useState(true);

  const handleOutstationRouteChange = (nextPickup, nextDrop) => {
    setOutPickupCity(nextPickup);
    setDestination(nextDrop);
    const est = estimateOutstationRoute(nextPickup, nextDrop);
    if (est.matched) {
      setDistanceKm(est.distanceKm);
      setTravelDays(est.recommendedDays);
      setIsAutoEstimated(true);
    } else {
      setIsAutoEstimated(false);
    }
  };

  const activeHubList = PICKUP_HUBS[pickupType] || [];
  const activeHubObj = activeHubList.find((h) => h.code === selectedHubCode) || activeHubList[0];
  const resolvedPickupLabel = pickupType === 'custom'
    ? (customPickupAddress || 'Custom Pickup')
    : (activeHubObj?.name || selectedHubCode);
  const resolvedPickupShort = pickupType === 'custom'
    ? (customPickupAddress || 'Custom Pickup')
    : (activeHubObj?.code || selectedHubCode);

  const handlePickupTypeChange = (nextType) => {
    setPickupType(nextType);
    if (PICKUP_HUBS[nextType]?.length) {
      setSelectedHubCode(PICKUP_HUBS[nextType][0].code);
    }
  };

  const handleSwapLocations = () => {
    if (pickupType === 'custom') {
      const prevPickup = customPickupAddress;
      setCustomPickupAddress(dropDestination);
      setDropDestination(prevPickup);
    } else {
      setDropDestination(resolvedPickupLabel);
      setPickupType('custom');
      setCustomPickupAddress(dropDestination);
    }
  };

  const transferResult = calcPointToPointTransfer({
    distanceKm: transferDistanceKm,
    pickupType,
    pickupPoint: resolvedPickupShort,
    destination: dropDestination,
    isNight,
    extraLuggage,
  });

  const outstationResult = calcOutstationChauffeur({
    distanceKm,
    days: travelDays,
    carType: outCarType,
    driveMode,
    isRoundTrip,
  });

  const activeTabMeta = PICKUP_MODE_TABS.find((tab) => tab.id === pickupType) || PICKUP_MODE_TABS[0];

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>

        {/* ── 1. City, Station & Airport Pick & Drop Card ── */}
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
              <HiOutlineMapPin style={{ color: '#0f766e' }} /> City, Station &amp; Airport Pick &amp; Drop
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '14px' }}>
              Pick up from <strong>Airport, Railway Station, Bus Stand, or Any Address</strong> to any drop destination — priced transparently by km (₹18/km).
            </p>

            {/* Pickup Type Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
              {PICKUP_MODE_TABS.map((tab) => {
                const isSelected = pickupType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handlePickupTypeChange(tab.id)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdfa' : 'white',
                      color: isSelected ? '#0f766e' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Pickup Location Selector or Custom Input */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', margin: 0 }}>
                  {pickupType === 'custom' ? 'Pickup Address / Location *' : `Select ${activeTabMeta.label.replace(/^[^ ]+ /, '')} Pickup *`}
                </label>
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  style={{
                    background: 'none', border: 'none', color: '#0f766e', fontSize: '0.72rem',
                    fontWeight: 800, cursor: 'pointer', padding: 0,
                  }}
                >
                  ⇅ Swap Pickup &amp; Drop
                </button>
              </div>
              {pickupType !== 'custom' ? (
                <select
                  value={selectedHubCode}
                  onChange={(e) => setSelectedHubCode(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 10px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700, background: '#f8fafc',
                  }}
                >
                  {activeHubList.map((hub) => (
                    <option key={hub.code} value={hub.code}>
                      {hub.code} — {hub.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customPickupAddress}
                  onChange={(e) => setCustomPickupAddress(e.target.value)}
                  placeholder="Enter any home, office, mall, or street..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #0f766e', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              )}
            </div>

            {/* Destination Input */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
                Drop Destination (Anywhere) *
              </label>
              <input
                type="text"
                value={dropDestination}
                onChange={(e) => setDropDestination(e.target.value)}
                placeholder="Enter home, hotel, railway station, bus stand, or area..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
              {/* Quick Destination Distance Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                {QUICK_ROUTES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const cityName = activeHubObj?.city || 'Ahmedabad';
                      setDropDestination(`${preset.label}, ${cityName}`);
                      setTransferDistanceKm(preset.km);
                    }}
                    style={{
                      fontSize: '0.68rem',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: `1px solid ${transferDistanceKm === preset.km ? '#0f766e' : '#cbd5e1'}`,
                      background: transferDistanceKm === preset.km ? '#f0fdfa' : 'white',
                      color: transferDistanceKm === preset.km ? '#0f766e' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label} ({preset.km} km)
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider & Number Input */}
            <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0 }}>
                  Route Distance (Pickup → Drop):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="number"
                    min="2"
                    max="250"
                    value={transferDistanceKm}
                    onChange={(e) => setTransferDistanceKm(Math.max(2, Math.min(250, Number(e.target.value) || 2)))}
                    style={{ width: '64px', padding: '4px 6px', borderRadius: '6px', border: '1.5px solid #0f766e', textAlign: 'center', fontWeight: 900, color: '#0f766e', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f766e' }}>km</span>
                </div>
              </div>
              <input
                type="range"
                min="2"
                max="150"
                step="1"
                value={Math.min(150, transferDistanceKm)}
                onChange={(e) => setTransferDistanceKm(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#0f766e', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                <span>2 km</span><span>75 km</span><span>150+ km</span>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={isNight} onChange={(e) => setIsNight(e.target.checked)} />
                <HiOutlineMoon style={{ color: '#6366f1' }} /> Night Pickup (+25%)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={extraLuggage} onChange={(e) => setExtraLuggage(e.target.checked)} />
                <HiOutlineArchiveBox style={{ color: '#f59e0b' }} /> Extra Luggage (+₹200)
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
                  {activeTabMeta.refLabel}
                </label>
                <input
                  type="text"
                  placeholder={activeTabMeta.refPlaceholder}
                  value={flightNo}
                  onChange={(e) => setFlightNo(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('travelCommute.pickupDateTime')}</label>
                <input
                  type="datetime-local"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', boxSizing: 'border-box' }}
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
            marginTop: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>
                  {resolvedPickupShort} → {dropDestination || 'Destination'} ({transferDistanceKm} km)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f766e' }}>₹{fmt(transferResult.total)}</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(`Pick & Drop (${resolvedPickupShort} → ${dropDestination || 'City'} • ${transferDistanceKm} km)`)}&serviceId=airport-transfer&category=travel-commute&price=${transferResult.total}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
              >
                Book Ride
              </Link>
            </div>
            <PriceBreakdown breakdown={transferResult.breakdown} />
          </div>
        </div>

        {/* ── 2. Multi-Day Outstation Card (With Driver / Self Drive + All Cars + km Pricing) ── */}
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
              Multi-Day Outstation &amp; Rentals
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '14px' }}>
              Choose <strong>With Driver</strong> or <strong>Self Drive</strong> across all car categories with transparent km-based fares.
            </p>

            {/* Drive Mode Selector: With Driver vs Self Drive */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setDriveMode('with-driver')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: `1.5px solid ${driveMode === 'with-driver' ? '#0f766e' : '#e2e8f0'}`,
                  background: driveMode === 'with-driver' ? '#f0fdfa' : 'white',
                  color: driveMode === 'with-driver' ? '#0f766e' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <HiOutlineUser /> With Driver
              </button>
              <button
                type="button"
                onClick={() => setDriveMode('self-drive')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: `1.5px solid ${driveMode === 'self-drive' ? '#2563eb' : '#e2e8f0'}`,
                  background: driveMode === 'self-drive' ? '#eff6ff' : 'white',
                  color: driveMode === 'self-drive' ? '#1d4ed8' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <HiOutlineKey /> Self Drive (No Driver)
              </button>
            </div>

            {/* All Cars Grid for Outstation */}
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>
              Select Car Category ({driveMode === 'self-drive' ? 'Self-Drive Rates' : 'Chauffeur Rates'}):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {OUTSTATION_CARS.map((c) => {
                const disabledSelfDrive = driveMode === 'self-drive' && c.driverOnly;
                const activeRate = driveMode === 'self-drive' && !c.driverOnly ? c.selfDriveRate : c.withDriverRate;
                const isSelected = outCarType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={disabledSelfDrive}
                    onClick={() => setOutCarType(c.id)}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                      background: disabledSelfDrive ? '#f8fafc' : isSelected ? '#f0fdfa' : 'white',
                      cursor: disabledSelfDrive ? 'not-allowed' : 'pointer',
                      opacity: disabledSelfDrive ? 0.55 : 1,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? '#0f766e' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name.split(' (')[0]}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600 }}>
                        {disabledSelfDrive ? 'Chauffeur only' : `${c.seats} • ₹${activeRate}/km`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pickup & Drop Cities (Auto-estimates km & days) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
                  Pickup City / Point *
                </label>
                <input
                  type="text"
                  value={outPickupCity}
                  onChange={(e) => handleOutstationRouteChange(e.target.value, destination)}
                  placeholder="e.g. Bhavnagar, Ahmedabad"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
                  Drop / Destination City *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleOutstationRouteChange(outPickupCity, e.target.value)}
                  placeholder="e.g. Udaipur, Mount Abu"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Quick Route Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
              {[
                { from: 'Bhavnagar', to: 'Udaipur' },
                { from: 'Ahmedabad', to: 'Udaipur' },
                { from: 'Ahmedabad', to: 'Mount Abu' },
                { from: 'Ahmedabad', to: 'Dwarka' },
                { from: 'Surat', to: 'Mumbai' },
              ].map((rt) => {
                const isActiveRoute = outPickupCity.toLowerCase() === rt.from.toLowerCase() && destination.toLowerCase() === rt.to.toLowerCase();
                return (
                  <button
                    key={`${rt.from}-${rt.to}`}
                    type="button"
                    onClick={() => handleOutstationRouteChange(rt.from, rt.to)}
                    style={{
                      fontSize: '0.68rem', padding: '3px 8px', borderRadius: '999px',
                      border: `1px solid ${isActiveRoute ? '#0f766e' : '#cbd5e1'}`,
                      background: isActiveRoute ? '#f0fdfa' : 'white',
                      color: isActiveRoute ? '#0f766e' : '#475569',
                      fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {rt.from} → {rt.to}
                  </button>
                );
              })}
            </div>

            {/* One-Way vs Round-Trip Switch */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setIsRoundTrip(false)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  border: `1.5px solid ${!isRoundTrip ? '#0f766e' : '#e2e8f0'}`,
                  background: !isRoundTrip ? '#f0fdfa' : 'white',
                  color: !isRoundTrip ? '#0f766e' : '#64748b',
                }}
              >
                One-Way Drop ({distanceKm} km)
              </button>
              <button
                type="button"
                onClick={() => setIsRoundTrip(true)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  border: `1.5px solid ${isRoundTrip ? '#0f766e' : '#e2e8f0'}`,
                  background: isRoundTrip ? '#f0fdfa' : 'white',
                  color: isRoundTrip ? '#0f766e' : '#64748b',
                }}
              >
                Round Trip (×2 = {distanceKm * 2} km)
              </button>
            </div>

            {/* Estimated Distance & Days (Auto-filled from cities, adjustable) */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                  Estimated Distance {isAutoEstimated ? '⚡(Auto)' : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="number" min="20" max="2500"
                    value={distanceKm}
                    onChange={(e) => {
                      setIsAutoEstimated(false);
                      setDistanceKm(Math.max(20, Math.min(2500, Number(e.target.value) || 20)));
                    }}
                    style={{ width: '68px', padding: '3px 6px', borderRadius: '6px', border: '1px solid #0f766e', textAlign: 'center', fontWeight: 900, color: '#0f766e', fontSize: '0.82rem' }}
                  />
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f766e' }}>km</span>
                </div>
              </div>
              <input
                type="range" min="20" max="1000" step="10"
                value={Math.min(1000, distanceKm)}
                onChange={(e) => {
                  setIsAutoEstimated(false);
                  setDistanceKm(parseInt(e.target.value, 10));
                }}
                style={{ width: '100%', accentColor: '#0f766e', cursor: 'pointer', marginBottom: '8px' }}
              />

              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Estimated Trip Days {isAutoEstimated ? '(Recommended)' : ''}</span>
                <span style={{ color: '#0f766e', fontWeight: 900 }}>{travelDays} day{travelDays > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range" min="1" max="15"
                value={travelDays}
                onChange={(e) => setTravelDays(parseInt(e.target.value, 10))}
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
            marginTop: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>
                  {outPickupCity || 'Pickup'} → {destination || 'Drop'} • {outstationResult.car.name.split(' (')[0]} ({outstationResult.effectiveMode === 'self-drive' ? 'Self Drive' : 'With Driver'} • {travelDays}d)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f766e' }}>₹{fmt(outstationResult.total)}</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(`Outstation ${outstationResult.car.name} (${outPickupCity} → ${destination} • ${outstationResult.effectiveMode === 'self-drive' ? 'Self Drive' : 'With Driver'} • ${outstationResult.billedKm} km / ${travelDays}d)`)}&serviceId=outstation-chauffeur&category=travel-commute&price=${outstationResult.total}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
              >
                {outstationResult.effectiveMode === 'self-drive' ? 'Book Self-Drive' : t('travelCommute.bookChauffeur')}
              </Link>
            </div>
            <PriceBreakdown breakdown={outstationResult.breakdown} />
          </div>
        </div>
      </div>

      {/* Premium Commute Rentals */}
      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #0f766e' }}>
          Premium Commute &amp; Rentals
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: t('travelCommuteExt.luxuryRentals'), desc: t('travelCommuteExt.luxuryDesc'), link: '/customer/travel-flow?type=luxury-rental', label: 'Explore Fleet', price: 'From ₹4,999/day (With Driver & Self Drive)' },
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
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', background: '#f0fdfa', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
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
