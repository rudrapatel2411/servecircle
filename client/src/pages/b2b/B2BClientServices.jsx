import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
  HiOutlineShieldCheck,
  HiOutlineHomeModern,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import { MdOutlinePestControl, MdOutlineAcUnit, MdOutlinePark, MdOutlineRecycling } from 'react-icons/md';
import { getSession, requestApi } from '../../utils/authSession';
import '../Dashboard.css';
import './B2BPages.css';

const B2BClientServices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [confirmedModal, setConfirmedModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    location: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: 'Morning (08:00 AM - 12:00 PM)',
    urgency: 'Scheduled Routine',
    crewSize: '4 Workers (Standard Team)',
    notes: '',
  });

  useEffect(() => {
    const savedLocs = localStorage.getItem('b2bClientBlocks');
    if (savedLocs) setLocations(JSON.parse(savedLocs));
  }, []);

  const categories = [
    { id: 'cleaning', title: t('b2bClient.services.categories.cleaning', 'Cleaning & Hygiene'), desc: t('b2bClient.services.categories.cleaningDesc', 'Staircase, water tanks, basement parking & deep cleaning.'), icon: HiOutlineSparkles, color: '#3b82f6', mappedCategory: 'cleaning' },
    { id: 'pest', title: t('b2bClient.services.categories.pestControl', 'Pest & Vector Control'), desc: t('b2bClient.services.categories.pestControlDesc', 'Basement fogging, termite barriers & drain treatment.'), icon: MdOutlinePestControl, color: '#ef4444', mappedCategory: 'cleaning' },
    { id: 'maintenance', title: t('b2bClient.services.categories.maintenance', 'Repairs & Maintenance'), desc: t('b2bClient.services.categories.maintenanceDesc', 'Plumbing mainlines, electrical transformers & pumps.'), icon: HiOutlineWrenchScrewdriver, color: '#f59e0b', mappedCategory: 'home-repairs' },
    { id: 'ac', title: t('b2bClient.services.categories.acAppliance', 'AC & Chiller Plants'), desc: t('b2bClient.services.categories.acApplianceDesc', 'Clubhouse central plants, cassette units & duct clean.'), icon: MdOutlineAcUnit, color: '#06b6d4', mappedCategory: 'home-repairs' },
    { id: 'security', title: t('b2bClient.services.categories.security', 'Security & Automation'), desc: t('b2bClient.services.categories.securityDesc', 'CCTV networks, boom barrier RFID & guard shifts.'), icon: HiOutlineShieldCheck, color: '#6366f1', mappedCategory: 'society-management' },
    { id: 'garden', title: t('b2bClient.services.categories.garden', 'Garden & Landscaping'), desc: t('b2bClient.services.categories.gardenDesc', 'Lawn care, tree pruning, arborist & sprinkler systems.'), icon: MdOutlinePark, color: '#10b981', mappedCategory: 'garden-outdoor' },
    { id: 'common', title: t('b2bClient.services.categories.commonArea', 'Common Area Facilities'), desc: t('b2bClient.services.categories.commonAreaDesc', 'Pool chlorination, solar wash, play area safety audit.'), icon: HiOutlineHomeModern, color: '#8b5cf6', mappedCategory: 'society-management' },
    { id: 'waste', title: t('b2bClient.services.categories.waste', 'Waste & E-Waste'), desc: t('b2bClient.services.categories.wasteDesc', 'Garbage chute descaling, compost pit & bulk hauling.'), icon: MdOutlineRecycling, color: '#14b8a6', mappedCategory: 'cleaning' },
  ];

  const servicesData = {
    cleaning: [
      { id: 'c1', name: 'Lobby & Staircase High-Pressure Wash', price: 4500, time: '3-4 hrs', defaultCrew: '4 Workers' },
      { id: 'c2', name: 'Basement Parking Machine Scrubbing', price: 6500, time: '4 hrs', defaultCrew: '4 Workers' },
      { id: 'c3', name: 'Overhead & Underground Water Tank Disinfection', price: 8000, time: '1 day', defaultCrew: '5 Workers' },
      { id: 'c4', name: 'Monthly Campus Hygiene AMC (All Towers)', price: 18000, time: 'Monthly AMC', defaultCrew: 'Dedicated Crew' },
      { id: 'c5', name: 'Clubhouse & Multipurpose Hall Deep Clean', price: 5500, time: '5 hrs', defaultCrew: '4 Workers' },
      { id: 'c6', name: 'Society Glass Facade & Window Wash', price: 7000, time: '6 hrs', defaultCrew: '3 Workers' },
    ],
    pest: [
      { id: 'p1', name: 'Basement & Drain Fogging (Mosquito Larvicide)', price: 1800, time: '2 hrs', defaultCrew: '2 Workers' },
      { id: 'p2', name: 'Cockroach & Rodent Control (Pillars & Shafts)', price: 2500, time: '3 hrs', defaultCrew: '3 Workers' },
      { id: 'p3', name: 'Subterranean Termite Barrier Injections', price: 5500, time: '4 hrs', defaultCrew: '3 Workers' },
      { id: 'p4', name: 'Garden Bed Pest & Ant Shield Treatment', price: 1500, time: '1 hr', defaultCrew: '2 Workers' },
      { id: 'p5', name: 'Quarterly Full-Campus Disinfestation AMC', price: 12000, time: 'Annual AMC', defaultCrew: 'Specialist Crew' },
    ],
    maintenance: [
      { id: 'm1', name: 'Plumbing Common Risers & Borewell Pump Check', price: 1200, time: '2 hrs', defaultCrew: '2 Technicians' },
      { id: 'm2', name: 'Main Electrical Panel & Transformer Audit', price: 1800, time: '2 hrs', defaultCrew: '2 Technicians' },
      { id: 'm3', name: 'Diesel Generator (DG Set) Load Test & Service', price: 2800, time: '3 hrs', defaultCrew: '2 Technicians' },
      { id: 'm4', name: 'Fire Hydrant & Sprinkler Pump Pressure Test', price: 3500, time: '3 hrs', defaultCrew: '3 Technicians' },
      { id: 'm5', name: 'Lift Mechanical & Safety Governor Audit', price: 4500, time: '4 hrs', defaultCrew: '2 Engineers' },
    ],
    ac: [
      { id: 'a1', name: 'Clubhouse Central AC Plant Servicing', price: 4500, time: '4 hrs', defaultCrew: '2 HVAC Pros' },
      { id: 'a2', name: 'Cassette & Split AC Preventive Maintenance', price: 1200, time: '1.5 hrs', defaultCrew: '2 Technicians' },
      { id: 'a3', name: 'Air Duct Fogging & Odor Sanitization', price: 3500, time: '3 hrs', defaultCrew: '2 Technicians' },
      { id: 'a4', name: 'Gym & Clubhouse Chiller Annual AMC', price: 45000, time: 'Annual AMC', defaultCrew: 'HVAC Team' },
    ],
    security: [
      { id: 's1', name: 'CCTV Surveillance 32-Ch Wire & DVR Tuneup', price: 2200, time: '3 hrs', defaultCrew: '2 Techs' },
      { id: 's2', name: 'Automatic Boom Barrier & RFID Sensor Repair', price: 1800, time: '2 hrs', defaultCrew: '2 Techs' },
      { id: 's3', name: 'Society Intercom & EPABX Line Diagnosis', price: 1200, time: '2 hrs', defaultCrew: '2 Techs' },
      { id: 's4', name: 'Trained Security Guard Deployment (Day/Night)', price: 18500, time: 'Monthly/Guard', defaultCrew: '1 Security Guard' },
    ],
    garden: [
      { id: 'g1', name: 'Lawn Mowing & Turf De-Weeding (Central Garden)', price: 2500, time: '3 hrs', defaultCrew: '3 Malis' },
      { id: 'g2', name: 'Boundary Tree Trimming & Hazard Branch Cut', price: 3500, time: '4 hrs', defaultCrew: '3 Workers' },
      { id: 'g3', name: 'Drip Irrigation & Automated Sprinkler Setup', price: 4000, time: '5 hrs', defaultCrew: '2 Techs' },
      { id: 'g4', name: 'Seasonal Flowering Bed Plantation & Manure', price: 4500, time: 'Full Day', defaultCrew: '4 Malis' },
    ],
    common: [
      { id: 'ca1', name: 'Swimming Pool Vacuuming & Chemical Balancing', price: 3500, time: '3 hrs', defaultCrew: '2 Workers' },
      { id: 'ca2', name: 'Rooftop Solar Panel Dust Wash & Output Check', price: 2500, time: '2.5 hrs', defaultCrew: '2 Workers' },
      { id: 'ca3', name: 'Children Play Area Swing & Turf Safety Audit', price: 1500, time: '2 hrs', defaultCrew: '2 Techs' },
      { id: 'ca4', name: 'Rainwater Harvesting Pit Desilting & Filter Wash', price: 5500, time: '4 hrs', defaultCrew: '3 Workers' },
    ],
    waste: [
      { id: 'w1', name: 'Garbage Chute Steam Scrub & Enzyme Deodorizer', price: 4500, time: '3 hrs', defaultCrew: '3 Cleaners' },
      { id: 'w2', name: 'Organic Waste Composter Bacterial Culture Refresh', price: 2800, time: '2 hrs', defaultCrew: '2 Workers' },
      { id: 'w3', name: 'Bulk Society E-Waste & Scrap Disposal Haul', price: 1500, time: '2 hrs', defaultCrew: 'Truck + 2 Lifters' },
    ]
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.location || !form.date || !bookingModal) return;

    setIsSubmitting(true);
    const session = getSession();
    const token = session?.token;

    const mappedCat = categories.find(c => c.id === activeCategory)?.mappedCategory || 'society-management';
    const workOrderNumber = `SC-B2B-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatePin = `${Math.floor(1000 + Math.random() * 9000)}`;
    const cost = bookingModal.price || 2500;

    const workOrder = {
      id: workOrderNumber,
      rawId: `b2b-${Date.now()}`,
      service: bookingModal.name,
      category: mappedCat,
      amount: cost,
      cost: cost,
      date: form.date,
      time: form.timeSlot,
      tower: form.location,
      societyName: 'Green Valley Society',
      status: 'confirmed',
      workers: form.crewSize.includes('4') ? 4 : form.crewSize.includes('5') ? 5 : form.crewSize.includes('3') ? 3 : 2,
      leadWorker: {
        name: 'Mahesh Sharma',
        role: 'Verified Fleet Captain (Grade A)',
        phone: '+91 98250 11234',
        rating: 4.9,
      },
      gatePassPin: gatePin,
      urgency: form.urgency,
      notes: form.notes || 'Routine society maintenance request',
      vendor: 'ServeCircle Verified Fleet',
      createdAt: new Date().toISOString(),
    };

    // Attempt backend dispatch
    try {
      if (token) {
        await requestApi('/bookings', {
          method: 'POST',
          token,
          body: {
            service: bookingModal.name,
            category: mappedCat,
            address: `${form.location}, Green Valley Society, Ahmedabad`,
            amount: cost,
            scheduledDate: form.date,
            scheduledTime: form.timeSlot,
            description: `Specs: [Society: Green Valley, Tower: ${form.location}, Urgency: ${form.urgency}, GatePIN: ${gatePin}, WorkOrder: ${workOrderNumber}]`,
          },
        });
      }
    } catch (err) {
      console.warn('Backend booking API warning (using local persistent sync):', err.message);
    }

    // Persist to local B2B work orders
    try {
      const existing = JSON.parse(localStorage.getItem('b2bWorkOrders') || '[]');
      localStorage.setItem('b2bWorkOrders', JSON.stringify([workOrder, ...existing]));

      // Also persist to contracts list if applicable
      const contracts = JSON.parse(localStorage.getItem('b2bClientContracts') || '[]');
      const newContract = {
        id: `AMC-${Math.floor(10000 + Math.random() * 90000)}`,
        name: bookingModal.name,
        type: bookingModal.time.includes('AMC') || bookingModal.time.includes('Monthly') ? 'AMC' : 'Ad-hoc',
        vendor: 'ServeCircle Verified Fleet',
        startDate: form.date,
        endDate: 'N/A',
        frequency: bookingModal.time,
        value: cost,
        status: 'active',
        locations: 1,
      };
      localStorage.setItem('b2bClientContracts', JSON.stringify([...contracts, newContract]));

      // Trigger cross-panel event
      window.dispatchEvent(new CustomEvent('servecircle:b2b-booking-created', { detail: workOrder }));
    } catch (e) {
      console.error('Local persistence error:', e);
    }

    setIsSubmitting(false);
    setConfirmedModal(workOrder);
    setBookingModal(null);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.services.title', 'Society Work Orders & Services')}</h1>
          <p className="page-subtitle">{t('b2bClient.services.subtitle', 'Book campus-wide maintenance, facility operations & verified technician teams.')}</p>
        </div>
      </div>

      {!activeCategory ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="b2b-card hover-lift"
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                borderTop: `4px solid ${cat.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px 24px',
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div>
                <cat.icon style={{ fontSize: '3rem', color: cat.color, margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '8px' }}>{cat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{cat.desc}</p>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: cat.color, fontWeight: 700, fontSize: '0.85rem' }}>
                <span>View Rate Card & Book</span>
                <HiOutlineArrowRight />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <button className="btn btn-outline" onClick={() => setActiveCategory(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              ← {t('b2bClient.services.backToCategories', 'Back to All Categories')}
            </button>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
              Showing {servicesData[activeCategory]?.length || 0} Standard Services
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {servicesData[activeCategory]?.map((svc) => (
              <div key={svc.id} className="b2b-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '10px', lineHeight: 1.4 }}>{svc.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e40af' }}>
                      {svc.price > 0 ? `₹${svc.price.toLocaleString('en-IN')}` : 'On Inspection'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                      <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {svc.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineUserGroup style={{ color: '#2563eb' }} />
                    <span>Deployment: <strong>{svc.defaultCrew || '2-4 Verified Pros'}</strong></span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
                  onClick={() => setBookingModal(svc)}
                >
                  Schedule Work Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Booking Modal (Never Clipped, High Z-Index) ───────────────────────── */}
      {bookingModal && (
        <div className="b2b-modal-overlay">
          <div className="b2b-modal-content">
            <button className="b2b-modal-close" onClick={() => setBookingModal(null)}>
              <HiOutlineXMark />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Society Work Order Dispatch
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                {bookingModal.name}
              </h2>
            </div>

            <form onSubmit={handleBook} className="b2b-form-grid">
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Society Wing / Tower / Location *</label>
                <select
                  className="input-field"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  <option value="">-- Select Society Area --</option>
                  <option value="All Towers & Common Campus">All Towers & Common Campus</option>
                  <option value="Tower A (Flats 1-48)">Tower A (Residential)</option>
                  <option value="Tower B (Flats 1-48)">Tower B (Residential)</option>
                  <option value="Tower C (Flats 1-48)">Tower C (Residential)</option>
                  <option value="Tower D (Flats 1-48)">Tower D (Residential)</option>
                  <option value="Clubhouse & Swimming Pool">Clubhouse & Swimming Pool</option>
                  <option value="Central Garden & Amphitheatre">Central Garden & Amphitheatre</option>
                  <option value="Basement Parking B1/B2">Basement Parking B1/B2</option>
                  <option value="STP & Transformer Room">STP & Transformer Room</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={`${loc.tower} - ${loc.floor}`}>
                      {loc.tower} - {loc.floor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Execution Date *</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Preferred Shift / Timing *</label>
                <select
                  className="input-field"
                  value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                >
                  <option value="Morning (08:00 AM - 12:00 PM)">Morning (08:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (01:00 PM - 05:00 PM)">Afternoon (01:00 PM - 05:00 PM)</option>
                  <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                  <option value="Full Day Intensive Deployment">Full Day Intensive Deployment</option>
                </select>
              </div>

              <div className="input-group">
                <label>Urgency Level</label>
                <select
                  className="input-field"
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                >
                  <option value="Scheduled Routine">Scheduled Routine Maintenance</option>
                  <option value="High Priority (Within 4 Hours)">High Priority (Within 4 Hours)</option>
                  <option value="🚨 Emergency Breakdown">🚨 Emergency Breakdown (Immediate)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Allocated Crew Size</label>
                <select
                  className="input-field"
                  value={form.crewSize}
                  onChange={(e) => setForm({ ...form, crewSize: e.target.value })}
                >
                  <option value="2 Workers (Quick Inspection)">2 Workers (Quick Inspection)</option>
                  <option value="4 Workers (Standard Team)">4 Workers (Standard Team)</option>
                  <option value="6 Workers (Heavy Society Team)">6 Workers (Heavy Society Team)</option>
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Gate Access & Society Security Instructions</label>
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="e.g. Inform Security Gate 2; bring industrial high-pressure pump; service lift active."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                ></textarea>
              </div>

              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Estimated Work Order Fee:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e40af' }}>
                    {bookingModal.price > 0 ? `₹${bookingModal.price.toLocaleString('en-IN')}` : 'TBD (Inspection)'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '100px' }}>
                  ✓ Post-Work Society Billing
                </span>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.2, padding: '12px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Dispatching...' : 'Confirm & Dispatch Work Order'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 0.8 }}
                  onClick={() => setBookingModal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal with Gate Pass & Links ─────────────────────────── */}
      {confirmedModal && (
        <div className="b2b-modal-overlay">
          <div className="b2b-modal-content" style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 16px',
              }}
            >
              <HiOutlineCheckCircle />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
              Work Order Confirmed!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '18px' }}>
              Dispatched to <strong>ServeCircle Verified Pro Fleet</strong> for Green Valley Society.
            </p>

            {/* Work Order Info Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Work Order ID:</span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{confirmedModal.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Service:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>{confirmedModal.service}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Location:</span>
                <span style={{ fontSize: '0.85rem', color: '#0f172a' }}>{confirmedModal.tower}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Security Gate Entry PIN:</span>
                <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#16a34a' }}>
                  {confirmedModal.gatePassPin}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => {
                  setConfirmedModal(null);
                  navigate('/b2b/history');
                }}
              >
                Track Live in Service History
              </button>
              <button
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => {
                  setConfirmedModal(null);
                  navigate('/b2b/invoices');
                }}
              >
                View Society Billing & Invoices
              </button>
              <button
                className="btn btn-outline"
                style={{ width: '100%', padding: '8px', border: 'none', color: '#64748b' }}
                onClick={() => setConfirmedModal(null)}
              >
                Book Another Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BClientServices;
