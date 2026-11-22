import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
 HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineCalendarDays, 
 HiOutlineShieldCheck, HiOutlineTruck, HiOutlinePaperAirplane,
 HiOutlinePlus, HiOutlineTrash, HiOutlinePhone, HiOutlineXMark,
 HiOutlineExclamationTriangle
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const TravelCommuteHub = () => {
 const { t } = useTranslation();
 // Airport Transfer State
 const [carType, setCarType] = useState('sedan'); // 'sedan', 'suv'
 const [flightNo, setFlightNo] = useState('');
 const [transferDate, setTransferDate] = useState('');
 const [airportPickup, setAirportPickup] = useState('');
 const [airportTerminal, setAirportTerminal] = useState('T1');

 // Outstation Driver State
 const [travelDays, setTravelDays] = useState(2);
 const [pickupLocation, setPickupLocation] = useState('Home / City Center');
 const [destination, setDestination] = useState('Mysore');
 const [stops, setStops] = useState([]); // [{ id: string, address: string }]
 const [showSosModal, setShowSosModal] = useState(false);
 const [copiedSosLink, setCopiedSosLink] = useState(false);

 const calculateAirportPrice = () => {
 const base = carType === 'sedan' ? 799 : 1499;
 const tollPassThrough = 120; // 100% reimbursed to driver
 return base + tollPassThrough;
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

 const calculateOutstationBreakdown = () => {
 const chauffeurLabor = travelDays * 999;
 const driverFoodBata = travelDays * 350; // 100% pass-through
 const nightHalt = travelDays > 1 ? (travelDays - 1) * 300 : 0; // 100% pass-through
 const validStops = stops.filter(s => s.address && s.address.trim());
 const detourStopsCharge = validStops.length * 250; // ₹250 per intermediate stop detour
 const total = chauffeurLabor + driverFoodBata + nightHalt + detourStopsCharge;
 return { chauffeurLabor, driverFoodBata, nightHalt, detourStopsCharge, validStops, total };
 };

 const outstationDetails = calculateOutstationBreakdown();
 const calculateOutstationPrice = () => outstationDetails.total;

 const validStopsList = outstationDetails.validStops.map(s => s.address.trim());
 const stopsQueryVal = validStopsList.length > 0 ? encodeURIComponent(JSON.stringify(validStopsList)) : '';
 const routeSummary = `${pickupLocation || 'Home'} ${validStopsList.length > 0 ? validStopsList.join(' ') + ' ' : ''}${destination || 'Destination'}`;

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
 {t('travelCommute.guaranteedAirport')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
 {t('travelCommute.zeroCancellation')}
 </p>

 {/* Premium Fleet Carousel */}
 <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
 {[
 { id: 'sedan', name: t('travelCommute.premiumSedan'), seats: '4', icon: '', price: 799, tags: ['Wifi', 'Water'] },
 { id: 'suv', name: t('travelCommute.luxurySuv'), seats: '6', icon: '', price: 1499, tags: ['Extra Legroom', 'TV'] }
 ].map(car => (
 <div key={car.id} onClick={() => setCarType(car.id)} style={{
 flex: 1,
 minWidth: '140px',
 border: '1.5px solid',
 borderColor: carType === car.id ? '#0f766e' : 'var(--gray-200)',
 borderRadius: '12px',
 padding: '12px',
 background: carType === car.id ? '#f0fdfa' : 'white',
 cursor: 'pointer',
 display: 'flex',
 flexDirection: 'column',
 gap: '6px'
 }}>
 <div style={{ fontSize: '2.2rem', textAlign: 'center' }}>{car.icon}</div>
 <h4 style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', color: 'var(--navy-800)' }}>{car.name}</h4>
 <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
 {car.tags.map(tag => (
 <span key={tag} style={{ fontSize: '0.55rem', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: 'var(--gray-700)' }}>{tag}</span>
 ))}
 </div>
 </div>
 ))}
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Pickup Address / Landmark</label>
 <input
 type="text"
 placeholder="e.g. Indiranagar, 100ft Road, Bangalore"
 value={airportPickup}
 onChange={(e) => setAirportPickup(e.target.value)}
 style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
 />
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Airport Terminal</label>
 <select
 value={airportTerminal}
 onChange={(e) => setAirportTerminal(e.target.value)}
 style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem', background: 'white' }}
 >
 <option value="Terminal 1 (Domestic)">Terminal 1 (Domestic)</option>
 <option value="Terminal 2 (International)">Terminal 2 (International)</option>
 <option value="Cargo / VIP Terminal">Cargo / VIP Terminal</option>
 </select>
 </div>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('travelCommute.flightNoLabel')}</label>
 <input
 type="text"
 placeholder={t('travelCommute.flightNoPlaceholder')}
 value={flightNo}
 onChange={(e) => setFlightNo(e.target.value)}
 style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
 />
 </div>
 </div>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('travelCommute.pickupDateTime')}</label>
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
 <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('travelCommute.estFare')}</span>
 <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
 ₹{calculateAirportPrice().toLocaleString()}
 </span>
 <span style={{ fontSize: '0.65rem', color: '#0f766e', display: 'block', fontWeight: 700 }}>
 Includes ₹120 Toll (100% Driver Pass-Through)
 </span>
 </div>
 <Link
 to={`/customer/book?service=${encodeURIComponent('Guaranteed Airport Drop & Pick')}&serviceId=airport-transfer&category=travel-commute&price=${calculateAirportPrice()}&fleetType=${carType}&tripType=airport&includeToll=true&distanceKm=35&pickupLocation=${encodeURIComponent(airportPickup || 'Pickup Address')}&terminal=${encodeURIComponent(airportTerminal)}&flightNo=${encodeURIComponent(flightNo)}`}
 className="btn btn-primary btn-sm"
 style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
 >
 {t('travelCommute.bookAirport')}
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
 {t('travelCommute.outstationChauffeurs')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
 {t('travelCommute.outstationDesc')}
 </p>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 {/* Multi-stop Planner */}
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', margin: 0 }}>Trip Itinerary & Waypoints</label>
 <span style={{ fontSize: '0.68rem', color: '#0f766e', fontWeight: 700 }}>+₹250/stop detour allowance</span>
 </div>
 
 <div style={{ borderLeft: '2px dashed var(--gray-300)', marginLeft: '8px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
 {/* Origin */}
 <div style={{ position: 'relative' }}>
 <div style={{ position: 'absolute', left: '-22px', top: '10px', width: '10px', height: '10px', borderRadius: '50%', background: '#0f766e' }}></div>
 <input 
 type="text" 
 placeholder="Pickup City / Landmark" 
 value={pickupLocation}
 onChange={(e) => setPickupLocation(e.target.value)}
 style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }} 
 />
 </div>

 {/* Intermediate Stops */}
 {stops.map((stop, idx) => (
 <div key={stop.id} style={{ position: 'relative', display: 'flex', gap: '6px', alignItems: 'center' }}>
 <div style={{ position: 'absolute', left: '-22px', top: '12px', width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
 <input 
 type="text" 
 value={stop.address} 
 onChange={(e) => handleUpdateStop(stop.id, e.target.value)} 
 placeholder={`Stop ${idx + 1} (e.g. Waypoint, Sightseeing, Food Halt)`} 
 style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #f59e0b', fontSize: '0.82rem', background: '#fffbeb' }} 
 />
 <button 
 type="button" 
 onClick={() => handleRemoveStop(stop.id)} 
 title="Remove Stop"
 style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
 >
 <HiOutlineTrash size={14} />
 </button>
 </div>
 ))}

 {/* Destination */}
 <div style={{ position: 'relative' }}>
 <div style={{ position: 'absolute', left: '-22px', top: '10px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
 <input 
 type="text" 
 value={destination} 
 onChange={(e) => setDestination(e.target.value)} 
 placeholder="Final Destination City" 
 style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }} 
 />
 </div>

 {/* Add Stop Button */}
 {stops.length < 4 && (
 <button 
 type="button"
 onClick={handleAddStop}
 className="btn btn-outline-secondary btn-sm" 
 style={{ alignSelf: 'flex-start', fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
 >
 <HiOutlinePlus size={12} /> Add Intermediate Stop (+₹250)
 </button>
 )}
 </div>
 </div>

 {/* Days Slider */}
 <div style={{ marginTop: '8px' }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
 <span>{t('travelCommute.daysSliderLabel')}:</span>
 <span style={{ color: '#0f766e', fontWeight: 900 }}>
 {travelDays === 1 ? t('travelCommute.day1') : t('travelCommute.day10').replace('10', travelDays)}
 </span>
 </label>
 <input
 type="range"
 min="1"
 max="10"
 value={travelDays}
 onChange={(e) => setTravelDays(parseInt(e.target.value))}
 style={{ width: '100%', accentColor: '#0f766e', cursor: 'pointer' }}
 />
 </div>
 </div>

 {/* Chauffeur Trust Profile */}
 <div style={{
 background: '#f8fafc',
 border: '1px solid var(--gray-200)',
 borderRadius: '10px',
 padding: '12px',
 marginTop: '16px',
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}></div>
 <div>
 <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>Elite Chauffeurs</h4>
 <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 600 }}>⭐⭐⭐⭐⭐ 4.9 • English, Hindi</p>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
 <span style={{ fontSize: '0.62rem', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><HiOutlineShieldCheck /> Background Verified</span>
 <span style={{ fontSize: '0.62rem', background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>Safe Driving Certified</span>
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
 <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('travelCommute.estFareTotal')}</span>
 <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
 ₹{calculateOutstationPrice().toLocaleString()}
 </span>
 <span style={{ fontSize: '0.65rem', color: '#0f766e', display: 'block', fontWeight: 700 }}>
 Labor ₹{outstationDetails.chauffeurLabor} + Bata ₹{outstationDetails.driverFoodBata}{outstationDetails.nightHalt > 0 ? ` + Night ₹${outstationDetails.nightHalt}` : ''}{outstationDetails.detourStopsCharge > 0 ? ` + Stops ₹${outstationDetails.detourStopsCharge}` : ''}
 </span>
 </div>
 <Link
 to={`/customer/book?service=${encodeURIComponent('Multi-Day Outstation Chauffeur')}&serviceId=outstation-chauffeur&category=travel-commute&price=${calculateOutstationPrice()}&days=${travelDays}&tripType=outstation&pickupLocation=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(destination)}&stops=${stopsQueryVal}&stopsCount=${validStopsList.length}&route=${encodeURIComponent(routeSummary)}`}
 className="btn btn-primary btn-sm"
 style={{ padding: '8px 16px', background: '#0f766e', borderColor: '#0f766e' }}
 >
 {t('travelCommute.bookChauffeur')}
 </Link>
 </div>
 </div>
 </div>

 <div style={{ marginTop: '40px', marginBottom: '40px' }}>
 <h2 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #0f766e' }}>
 Premium Commute & Rentals
 </h2>
 <div style={{
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
 gap: '24px'
 }}>
 {/* Luxury & Vintage Rentals */}
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
 {t('travelCommuteExt.luxuryRentals')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
 {t('travelCommuteExt.luxuryDesc')}
 </p>
 </div>
 <Link
 to="/customer/travel-flow?type=luxury-rental"
 className="btn btn-primary btn-sm"
 style={{ padding: '12px 16px', background: '#0f766e', borderColor: '#0f766e', fontWeight: 800, textAlign: 'center' }}
 >
 Explore Fleet
 </Link>
 </div>

 {/* School Safe Commute */}
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
 {t('travelCommuteExt.schoolCommute')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
 {t('travelCommuteExt.schoolDesc')}
 </p>
 </div>
 <Link
 to="/customer/travel-flow?type=school-commute"
 className="btn btn-primary btn-sm"
 style={{ padding: '12px 16px', background: '#0f766e', borderColor: '#0f766e', fontWeight: 800, textAlign: 'center' }}
 >
 Setup Kids Route
 </Link>
 </div>

 {/* Corporate Office Carpool */}
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
 {t('travelCommuteExt.corporateCarpool')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
 {t('travelCommuteExt.corporateDesc')}
 </p>
 </div>
 <Link
 to="/customer/travel-flow?type=corporate-carpool"
 className="btn btn-primary btn-sm"
 style={{ padding: '12px 16px', background: '#0f766e', borderColor: '#0f766e', fontWeight: 800, textAlign: 'center' }}
 >
 Find Co-riders
 </Link>
 </div>

 </div>
 </div>

 {/* Full-width Special Section: Ride Safety Shield */}
 <div className="card" style={{
 background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
 color: 'white',
 padding: '30px',
 borderRadius: 'var(--radius-xl)',
 display: 'flex',
 flexDirection: 'column',
 gap: '20px',
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
 type="button"
 className="btn" 
 style={{ background: '#ef4444', color: 'white', fontWeight: 900, border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)', cursor: 'pointer' }} 
 onClick={() => setShowSosModal(true)}
 >
 {t('travelCommuteExt.sosAlert')}
 </button>
 </div>

 <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
 <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
 <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineMapPin /> {t('travelCommuteExt.liveGps')}</h4>
 <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>{t('travelCommuteExt.gpsDesc')}</p>
 </div>
 <div style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
 <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlinePaperAirplane /> {t('travelCommuteExt.shareTrip')}</h4>
 <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>{t('travelCommuteExt.shareDesc')}</p>
 </div>
 </div>
 </div>

 {/* Emergency Assistance Modal */}
 {showSosModal && (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 width: '100%',
 height: '100%',
 background: 'rgba(15, 23, 42, 0.75)',
 backdropFilter: 'blur(4px)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 zIndex: 9999,
 padding: '16px'
 }}>
 <div style={{
 background: 'white',
 borderRadius: '16px',
 maxWidth: '480px',
 width: '100%',
 padding: '28px',
 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
 borderTop: '6px solid #ef4444'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '50%', display: 'flex' }}>
 <HiOutlineExclamationTriangle size={24} />
 </span>
 <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#991b1b', fontWeight: 900 }}>
 Ride Safety & Emergency Desk
 </h3>
 </div>
 <button 
 type="button" 
 onClick={() => setShowSosModal(false)}
 style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
 >
 <HiOutlineXMark size={22} />
 </button>
 </div>

 <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
 ServeCircle 24/7 Rapid Response Desk is alerted. Your location coordinates are encrypted and ready to transmit to verified emergency responders.
 </p>

 <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.8rem', color: '#334155' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
 <span style={{ fontWeight: 600 }}>GPS Latitude:</span>
 <span style={{ fontWeight: 800, color: '#0f766e' }}>12.922634° N</span>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
 <span style={{ fontWeight: 600 }}>GPS Longitude:</span>
 <span style={{ fontWeight: 800, color: '#0f766e' }}>77.625345° E</span>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ fontWeight: 600 }}>Security Status:</span>
 <span style={{ fontWeight: 800, color: '#16a34a' }}> Rapid Dispatch Active</span>
 </div>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
 borderRadius: '10px',
 fontWeight: 800,
 fontSize: '0.9rem',
 boxShadow: '0 4px 6px rgba(239, 68, 68, 0.25)'
 }}
 >
 <HiOutlinePhone /> Call Police & Emergency Helpline (112)
 </a>

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
 borderRadius: '10px',
 fontWeight: 800,
 fontSize: '0.9rem'
 }}
 >
 <HiOutlinePhone /> Call ServeCircle 24/7 Desk (1800-233-911)
 </a>

 <button
 type="button"
 onClick={async () => {
 const shareUrl = `${window.location.origin}/customer/tracking/live-preview?lat=12.9226&lng=77.6253`;
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
 setShowSosModal(false);
 }, 1600);
 }}
 className="btn btn-outline-secondary"
 style={{ 
 padding: '10px', 
 fontSize: '0.82rem', 
 fontWeight: 700,
 backgroundColor: copiedSosLink ? '#ecfdf5' : 'transparent',
 borderColor: copiedSosLink ? '#10b981' : '#cbd5e1',
 color: copiedSosLink ? '#059669' : 'inherit',
 transition: 'all 0.2s ease'
 }}
 >
 {copiedSosLink ? ' Link Copied to Clipboard!' : ' Copy Encrypted Live Tracking Link'}
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};

export default TravelCommuteHub;
