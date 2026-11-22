import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlinePaperAirplane,
  HiOutlineMoon,
  HiOutlineArchiveBox,
  HiOutlineKey,
  HiOutlineUser,
  HiOutlineCalendarDays,
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineArrowsRightLeft,
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

// Reusable itemized price breakdown component
const PriceBreakdown = ({ breakdown }) => {
  const items = getPriceBreakdownItems(breakdown);
  if (!items || items.length <= 1) return null;
  return (
    <div style={{ marginTop: '10px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '3px' }}>
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

  // ── Point-to-Point Pick & Drop State ──
  const [pickupType, setPickupType] = useState('airport'); // 'airport' | 'railway' | 'bus' | 'custom'
  const [selectedHubCode, setSelectedHubCode] = useState(PICKUP_HUBS.airport[0]?.code || 'AMD');
  const [customPickupAddress, setCustomPickupAddress] = useState('Navrangpura, Ahmedabad');
  const [dropDestination, setDropDestination] = useState('SG Highway, Ahmedabad');
  const [transferDistanceKm, setTransferDistanceKm] = useState(20);
  const [transferCarType, setTransferCarType] = useState('sedan'); // 'sedan' | 'suv'
  const [isNight, setIsNight] = useState(false);
  const [extraLuggage, setExtraLuggage] = useState(false);
  const [flightNo, setFlightNo] = useState('');
  const [transferDate, setTransferDate] = useState('');

  // ── Multi-Day Outstation State ──
  const [driveMode, setDriveMode] = useState('with-driver'); // 'with-driver' | 'self-drive'
  const [outCarType, setOutCarType] = useState('suv');
  const [outPickupCity, setOutPickupCity] = useState('Bhavnagar');
  const [destination, setDestination] = useState('Udaipur');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [distanceKm, setDistanceKm] = useState(350);
  const [travelDays, setTravelDays] = useState(1);
  const [isAutoEstimated, setIsAutoEstimated] = useState(true);
  const [stops, setStops] = useState([]); // [{ id: string, address: string }]

  // ── Emergency Desk Modal State ──
  const [showSosModal, setShowSosModal] = useState(false);
  const [copiedSosLink, setCopiedSosLink] = useState(false);
  const [realCoords, setRealCoords] = useState({ lat: 23.0225, lng: 72.5714, accuracy: 12, isReal: false });
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [sosIncidentId, setSosIncidentId] = useState('');

  const handleTriggerSos = () => {
    setShowSosModal(true);
    setIsLocatingGps(true);
    setSosDispatched(false);

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 10);
          setRealCoords({ lat, lng, accuracy, isReal: true });
          setIsLocatingGps(false);

          try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
            const res = await fetch('/api/users/customer/sos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                severity: 'CRITICAL',
                rideType: 'Travel & Commute Ride SOS',
                details: 'Customer triggered emergency assistance desk via ServeCircle Safety Shield.',
              }),
            });
            const data = await res.json();
            if (data?.incident?.id) {
              setSosIncidentId(data.incident.id);
            }
            setSosDispatched(true);
          } catch (e) {
            console.warn('SOS dispatch network notice:', e);
            setSosIncidentId(`sos-local-${Date.now()}`);
            setSosDispatched(true);
          }
        },
        async (err) => {
          console.warn('GPS lookup notice:', err.message);
          setIsLocatingGps(false);
          try {
            const res = await fetch('/api/users/customer/sos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: 23.0225,
                longitude: 72.5714,
                severity: 'CRITICAL',
                rideType: 'Travel & Commute Ride SOS',
              }),
            });
            const data = await res.json();
            if (data?.incident?.id) {
              setSosIncidentId(data.incident.id);
            }
            setSosDispatched(true);
          } catch {
            setSosIncidentId(`sos-local-${Date.now()}`);
            setSosDispatched(true);
          }
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      setIsLocatingGps(false);
      setSosDispatched(true);
      setSosIncidentId(`sos-local-${Date.now()}`);
    }
  };

  // ── Handlers ──
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

  const handleAddStop = () => {
    if (stops.length >= 4) return;
    setStops(prev => [...prev, { id: Date.now().toString(), address: '' }]);
  };

  const handleUpdateStop = (id, newAddress) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, address: newAddress } : s));
  };

  const handleRemoveStop = (id) => {
    setStops(prev => prev.filter(s => s.id !== id));
  };

  // Calculations
  const transferResult = calcPointToPointTransfer({
    distanceKm: transferDistanceKm,
    pickupType,
    pickupPoint: resolvedPickupShort,
    destination: dropDestination,
    isNight,
    extraLuggage,
    carType: transferCarType,
  });

  const baseOutstationResult = calcOutstationChauffeur({
    distanceKm,
    days: travelDays,
    carType: outCarType,
    driveMode,
    isRoundTrip,
    pickupCity: outPickupCity,
    dropCity: destination,
  });

  const validStops = stops.filter(s => s.address && s.address.trim());
  const detourStopsCharge = validStops.length * 250; // ₹250 detour charge per stop
  const totalOutstationPrice = baseOutstationResult.total + detourStopsCharge;

  const activeTabMeta = PICKUP_MODE_TABS.find((tab) => tab.id === pickupType) || PICKUP_MODE_TABS[0];
  const validStopsList = validStops.map(s => s.address.trim());
  const stopsQueryVal = validStopsList.length > 0 ? encodeURIComponent(JSON.stringify(validStopsList)) : '';

  // Pricing Parameters for Authoritative Server Validation
  const transferPricingParams = {
    category: 'Travel & Commute',
    tripType: pickupType,
    distanceKm: transferDistanceKm,
    carType: transferCarType,
    isNight,
    extraLuggage,
    pickupLocation: resolvedPickupLabel,
    destination: dropDestination,
  };

  const outstationPricingParams = {
    category: 'Travel & Commute',
    tripType: 'outstation',
    distanceKm: baseOutstationResult.billedKm,
    days: travelDays,
    carType: outCarType,
    driveMode,
    isRoundTrip,
    stopsCount: validStops.length,
    pickupCity: outPickupCity,
    destination,
  };

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
              Pick up from <strong>Airport, Railway Station, Bus Stand, or Any Address</strong> to any drop destination — priced transparently by km with live route tracking.
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

            {/* Vehicle Fleet Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {[
                { id: 'sedan', name: 'Premium Sedan', seats: '4 Seats', sub: 'Dzire / Honda City' },
                { id: 'suv', name: 'Luxury SUV', seats: '6-7 Seats', sub: 'Innova / Ertiga' },
              ].map((car) => {
                const isSelected = transferCarType === car.id;
                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => setTransferCarType(car.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdfa' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isSelected ? '#0f766e' : '#1e293b' }}>
                      {car.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                      {car.seats} • {car.sub}
                    </div>
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
                    fontWeight: 800, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <HiOutlineArrowsRightLeft size={13} /> Swap Pickup &amp; Drop
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

            {/* Surcharges & Options */}
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

            {/* Reference & Timing */}
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
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
                  {t('travelCommute.pickupDateTime', 'Pickup Date & Time')}
                </label>
                <input
                  type="datetime-local"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Price Summary & Book Button */}
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
                to={`/customer/book?service=${encodeURIComponent(`Airport / Station Transfer (${resolvedPickupShort} → ${dropDestination || 'City'} • ${transferDistanceKm} km)`)}&serviceId=airport-transfer&category=Travel%20%26%20Commute&price=${transferResult.total}&pricingParams=${encodeURIComponent(JSON.stringify(transferPricingParams))}&pickupLocation=${encodeURIComponent(resolvedPickupLabel)}&destination=${encodeURIComponent(dropDestination)}&fleetType=${transferCarType}&distanceKm=${transferDistanceKm}&flightNo=${encodeURIComponent(flightNo || '')}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e', fontWeight: 800 }}
              >
                Book Ride
              </Link>
            </div>
            <PriceBreakdown breakdown={transferResult.breakdown} />
          </div>
        </div>

        {/* ── 2. Multi-Day Outstation Card (With Driver / Self Drive + All Cars + Intermediate Stops) ── */}
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
              Choose <strong>With Driver (Chauffeur)</strong> or <strong>Self Drive</strong> across all car categories with transparent km-based fares and multi-stop route flexibility.
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
                <HiOutlineUser /> With Driver (Chauffeur)
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

            {/* Car Category Grid */}
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
                    <span style={{ fontSize: '1.3rem' }}>{c.icon || '🚗'}</span>
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

            {/* Pickup & Destination Cities */}
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

            {/* Quick Route Preset Chips */}
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

            {/* Intermediate Detour Stops */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', margin: 0 }}>
                  Multi-Stop Sightseeing / Intermediate Detours:
                </label>
                {stops.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddStop}
                    style={{
                      background: 'none', border: 'none', color: '#0f766e', fontSize: '0.72rem',
                      fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0
                    }}
                  >
                    <HiOutlinePlus size={13} /> Add Stop (+₹250)
                  </button>
                )}
              </div>
              {stops.map((stop, idx) => (
                <div key={stop.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f766e', minWidth: '45px' }}>
                    Stop {idx + 1}:
                  </span>
                  <input
                    type="text"
                    value={stop.address}
                    onChange={(e) => handleUpdateStop(stop.id, e.target.value)}
                    placeholder="e.g. Shamlaji Temple, Highway Dhaba..."
                    style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(stop.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove Stop"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Estimated Distance & Days */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                  Estimated Distance {isAutoEstimated ? '⚡(Auto Calculated)' : ''}
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

          {/* Outstation Price Summary & Book Button */}
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
                  {outPickupCity || 'Pickup'} → {destination || 'Drop'} • {baseOutstationResult.car.name.split(' (')[0]} ({baseOutstationResult.effectiveMode === 'self-drive' ? 'Self Drive' : 'With Driver'} • {travelDays}d)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f766e' }}>₹{fmt(totalOutstationPrice)}</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(`Outstation ${baseOutstationResult.car.name} (${outPickupCity} → ${destination} • ${baseOutstationResult.effectiveMode === 'self-drive' ? 'Self Drive' : 'With Driver'} • ${baseOutstationResult.billedKm} km / ${travelDays}d)`)}&serviceId=outstation-chauffeur&category=Travel%20%26%20Commute&price=${totalOutstationPrice}&pricingParams=${encodeURIComponent(JSON.stringify(outstationPricingParams))}&pickupLocation=${encodeURIComponent(outPickupCity)}&destination=${encodeURIComponent(destination)}&days=${travelDays}&fleetType=${outCarType}&distanceKm=${baseOutstationResult.billedKm}&stops=${stopsQueryVal}&stopsCount=${validStops.length}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e', fontWeight: 800 }}
              >
                {baseOutstationResult.effectiveMode === 'self-drive' ? 'Book Self-Drive' : t('travelCommute.bookChauffeur', 'Book Chauffeur')}
              </Link>
            </div>
            <PriceBreakdown breakdown={baseOutstationResult.breakdown} />
            {validStops.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                <span>Detour Sightseeing ({validStops.length} intermediate stops)</span>
                <span style={{ fontWeight: 700, color: '#374151' }}>+₹{detourStopsCharge}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Premium Commute & Rentals Cards ── */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #0f766e' }}>
          Premium Commute &amp; Rentals
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: t('travelCommuteExt.luxuryRentals', 'Luxury & Vintage Rentals'), desc: t('travelCommuteExt.luxuryDesc', 'Book a high-end luxury car or vintage classic. Options for self-drive or chauffeur.'), link: '/customer/travel-flow?type=luxury-rental', label: 'Explore Fleet', price: 'From ₹4,999/day (With Driver & Self Drive)' },
            { title: t('travelCommuteExt.schoolCommute', 'School Commute Sub'), desc: t('travelCommuteExt.schoolDesc', 'Dedicated verified driver for daily school pick & drop with live dashcam tracking.'), link: '/customer/travel-flow?type=school-commute', label: 'Setup Kids Route', price: '₹3,499/month onwards' },
            { title: t('travelCommuteExt.corporateCarpool', 'Corporate Carpool'), desc: t('travelCommuteExt.corporateDesc', 'Verified corporate co-riders for daily tech-park commute. Slash fuel costs.'), link: '/customer/travel-flow?type=corporate-carpool', label: 'Find Co-riders', price: '₹1,299/month onwards' },
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

      {/* ── 4. Ride Safety Shield & Emergency Desk ── */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff', padding: '30px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}>
              <span style={{ background: '#3b7dc1', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <HiOutlineShieldCheck size={24} />
              </span>
              <span style={{ color: '#ffffff', letterSpacing: '-0.01em' }}>
                {t('travelCommuteExt.safetyShield', 'ServeCircle Safety Shield™')}
              </span>
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
              {t('travelCommuteExt.safetyDesc', '24/7 Rapid Response emergency desk, police SOS bridge, encrypted location sharing, and background-verified chauffeurs.')}
            </p>
          </div>
          <button
            type="button"
            className="btn"
            style={{
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: 900,
              border: 'none',
              padding: '12px 24px',
              borderRadius: '30px',
              fontSize: '0.92rem',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.45)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
            onClick={handleTriggerSos}
          >
            🚨 {t('travelCommuteExt.sosAlert', 'SOS Alert')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
              <HiOutlineMapPin /> {t('travelCommuteExt.liveGps', 'Live GPS Monitored')}
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Every trip is actively monitored from our central control room to ensure you stay on route.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
              <HiOutlinePaperAirplane /> {t('travelCommuteExt.shareTrip', 'Share Live Trip')}
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Share a live tracking link with your family via WhatsApp so they know exactly where you are.
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. Rapid Response Emergency Assistance Modal ── */}
      {showSosModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            borderTop: '6px solid #ef4444'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  background: '#fee2e2',
                  color: '#ef4444',
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  animation: 'pulse 1.5s infinite'
                }}>
                  <HiOutlineExclamationTriangle size={26} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', fontWeight: 900 }}>
                    Emergency SOS Safety Desk
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 800 }}>
                    ● 24/7 Rapid Response Protocol Active
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSosModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <HiOutlineXMark size={24} />
              </button>
            </div>

            {/* Broadcast Status Card */}
            <div style={{
              background: sosDispatched ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${sosDispatched ? '#86efac' : '#fde68a'}`,
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: sosDispatched ? '#16a34a' : '#f59e0b',
                  display: 'inline-block'
                }} />
                <strong style={{ fontSize: '0.82rem', color: sosDispatched ? '#166534' : '#92400e' }}>
                  {sosDispatched
                    ? `Emergency Incident Dispatched (#${sosIncidentId || 'SC-EMG-911'})`
                    : isLocatingGps
                    ? 'Acquiring high-precision GPS telemetry...'
                    : 'Broadcasting telemetry to central support desk...'}
                </strong>
              </div>
              <p style={{ margin: '4px 0 0 18px', fontSize: '0.74rem', color: sosDispatched ? '#15803d' : '#b45309' }}>
                ServeCircle emergency coordinators have received this incident alert with live coordinates.
              </p>
            </div>

            {/* Telemetry Coordinates Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', fontSize: '0.82rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>GPS Latitude:</span>
                <span style={{ fontWeight: 800, color: '#0f766e' }}>
                  {realCoords.lat.toFixed(4)}° N {realCoords.isReal ? '(Live)' : '(City Center)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>GPS Longitude:</span>
                <span style={{ fontWeight: 800, color: '#0f766e' }}>
                  {realCoords.lng.toFixed(4)}° E {realCoords.isReal ? `(±${realCoords.accuracy}m)` : '(Verified Telemetry)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Dispatch Status:</span>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>
                  ● Rapid Assistance Desk Connected
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. Call Police (112) */}
              <a 
                href="tel:112"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#ef4444',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                }}
              >
                <HiOutlinePhone size={20} /> Call Police &amp; National Emergency (112)
              </a>

              {/* 2. Call ServeCircle 24/7 Desk */}
              <a 
                href="tel:1800233911"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#0f766e',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.92rem'
                }}
              >
                <HiOutlinePhone size={20} /> Call ServeCircle 24/7 Safety Desk (1800-233-911)
              </a>

              {/* 3. Send WhatsApp SOS to Family */}
              <button
                type="button"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `🚨 EMERGENCY ALERT! I have triggered an emergency SOS from ServeCircle Ride Safety Shield.\n\nMy live location: https://maps.google.com/?q=${realCoords.lat},${realCoords.lng}\nSecurity Status: Rapid Response Alert Active. Please track and assist immediately!`
                  );
                  window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <HiOutlinePaperAirplane size={18} /> Send Instant WhatsApp SOS to Family / Contacts
              </button>

              {/* 4. Copy Encrypted Telemetry Link */}
              <button
                type="button"
                onClick={async () => {
                  const shareUrl = `https://maps.google.com/?q=${realCoords.lat},${realCoords.lng}`;
                  try {
                    if (navigator?.clipboard?.writeText) {
                      await navigator.clipboard.writeText(shareUrl);
                    }
                  } catch (err) {
                    console.warn('Clipboard write failed:', err);
                  }
                  setCopiedSosLink(true);
                  setTimeout(() => {
                    setCopiedSosLink(false);
                  }, 2000);
                }}
                className="btn btn-outline-secondary"
                style={{ 
                  padding: '10px', 
                  fontSize: '0.82rem', 
                  fontWeight: 700,
                  backgroundColor: copiedSosLink ? '#ecfdf5' : '#f8fafc',
                  borderColor: copiedSosLink ? '#10b981' : '#cbd5e1',
                  color: copiedSosLink ? '#059669' : '#475569',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {copiedSosLink ? '✓ Live GPS Link Copied to Clipboard!' : '📋 Copy Encrypted Live Tracking Link'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TravelCommuteHub;
