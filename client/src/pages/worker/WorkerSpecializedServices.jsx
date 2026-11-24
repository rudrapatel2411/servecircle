import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineCake,
  HiOutlineHeart,
  HiOutlineHomeModern,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlinePlusCircle,
  HiOutlineArrowPath,
  HiOutlineMusicalNote,
  HiOutlineBolt,
  HiOutlineCurrencyRupee
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { formatInr } from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';

// ─────────────────────────────────────────────────────────────
// SPECIALIZED ADVANCE BOOKING DATA FIXTURES
// ─────────────────────────────────────────────────────────────
const INITIAL_SPECIALIZED_JOBS = [
  // 1. TRAVEL & COMMUTE
  {
    id: 'ADV-TRV-801',
    category: 'travel-commute',
    title: 'Kids Safe School Commute Route (DPS Bopal Van #4)',
    type: 'school-commute',
    customer: 'Pooja Patel (Mother)',
    phone: '+91 98765 01234',
    scheduledDate: '2026-11-26',
    timeSlot: '07:15 AM - 08:00 AM (Morning Shift)',
    pickupAddress: 'Block C, Orchid Greens, South Bopal',
    dropAddress: 'DPS Bopal Main Campus Gate 1',
    payout: 3499,
    status: 'scheduled', // scheduled, prepared, en-route, completed
    manifest: [
      { name: 'Aarav Patel (Grade 3-B)', status: 'Boarded', emergencyPhone: '9876501234' },
      { name: 'Ananya Sharma (Grade 4-A)', status: 'Pending', emergencyPhone: '9822011223' },
      { name: 'Reyansh Mehta (Grade 2-C)', status: 'Pending', emergencyPhone: '9899033445' }
    ],
    vehicleChecks: {
      tiresChecked: true,
      fuelOrBatteryOk: true,
      dashcamStreaming: true,
      sanitizedAndAcOn: true,
      firstAidBoxChecked: true
    },
    notes: 'Female attendant Sunita Ben on board. Mandatory seatbelts before moving.'
  },
  {
    id: 'ADV-TRV-802',
    category: 'travel-commute',
    title: 'VIP Chauffeur: Ford Mustang GT Convertible Delivery',
    type: 'luxury-rental',
    customer: 'Vikramaditya Singhania',
    phone: '+91 98250 88990',
    scheduledDate: '2026-11-27',
    timeSlot: '10:00 AM (Doorstep Handover)',
    pickupAddress: 'ServeCircle VIP Fleet Hub, Prahlad Nagar',
    dropAddress: 'Courtyard by Marriott, Satellite Road',
    payout: 7999,
    status: 'scheduled',
    manifest: [
      { name: 'Chauffeur White Glove Service', status: 'Assigned', details: 'Captain Jaswinder Singh' }
    ],
    vehicleChecks: {
      flatbedSecured: true,
      zeroScratchAuditDone: true,
      fuelTank100Percent: true,
      licenseVerified: true
    },
    notes: 'Wedding ceremony entry at 4 PM. Deliver with sparkling gloss finish.'
  },

  // 2. FOOD & KITCHEN
  {
    id: 'ADV-FOD-901',
    category: 'food-kitchen',
    title: 'Backyard BBQ Live Grill: 12 Guests Party Feast',
    type: 'bbq',
    customer: 'Mehul & Ritu Shah',
    phone: '+91 98240 55667',
    scheduledDate: '2026-11-26',
    timeSlot: '05:30 PM - 09:30 PM (Evening Sundowner)',
    pickupAddress: 'Central Kitchen Logistics Hub',
    dropAddress: 'Villa 22, Sterling City, Bopal',
    payout: 4899,
    status: 'scheduled',
    guestCount: 12,
    dietType: 'Mixed (7 Veg, 5 Non-Veg Dedicated Grills)',
    skewerMenu: [
      'Peri-Peri Malai Paneer Tikka (30 Skewers)',
      'Hickory-Smoked Chicken Tikka (25 Skewers)',
      'Smoked Herb Button Mushrooms',
      'Awadhi Mutton Seekh Kebabs'
    ],
    equipmentChecklist: {
      portableCastIronGrill: true,
      organicHardwoodCoal5kg: true,
      bastingBrushesAndTongs: true,
      palmLeafPlatesLoaded: true,
      fireExtinguisherOnSite: true
    },
    notes: 'Jain marinade required for 2 guests (no onion/garlic). Post-party spotless sweep guaranteed.'
  },
  {
    id: 'ADV-FOD-902',
    category: 'food-kitchen',
    title: 'In-Home Masterclass: Classic French Macarons & Choux Pastry',
    type: 'baking',
    customer: 'Neha Singhal',
    phone: '+91 97230 44112',
    scheduledDate: '2026-11-28',
    timeSlot: '10:30 AM - 01:30 PM (Morning Class)',
    pickupAddress: 'Baker Academy Hub',
    dropAddress: 'Flat 901, Iscon Platinum, Bopal',
    payout: 3499,
    status: 'scheduled',
    studentNames: 'Neha & Kabir Singhal (Duo Couple Class)',
    equipmentChecklist: {
      callebautChocolateAndAlmondFlour: true,
      siliconeMacaronMats: true,
      pipingNozzlesKit: true,
      signedCertificatesPrinted: true
    },
    notes: 'Student has home OTG oven. Chef to demonstrate precision macaronage technique.'
  },

  // 3. PET SERVICES
  {
    id: 'ADV-PET-701',
    category: 'pet-services',
    title: 'Verified Family Homestay Boarding: Max (Golden Retriever)',
    type: 'boarding',
    customer: 'Anjali Sharma',
    phone: '+91 98980 12345',
    scheduledDate: '2026-11-26 to 2026-11-29',
    timeSlot: '3 Nights Cage-Free Homestay',
    pickupAddress: 'Flat 402, Green Meadows, Sector 14',
    dropAddress: 'Host Home: Happy Paws Garden Homestay',
    payout: 2697,
    status: 'scheduled',
    petProfile: {
      name: 'Max',
      breed: 'Golden Retriever (3 Yrs)',
      diet: 'Fresh cooked chicken broth 2x daily (Provided by parent)',
      allergies: 'None. Afraid of sudden loud crackers/thunder.'
    },
    dailyUpdates: [
      { time: '08:00 AM', label: 'Morning Park Walk & Breakfast', uploaded: true },
      { time: '01:30 PM', label: 'Afternoon Play & Hydration Video', uploaded: false },
      { time: '08:00 PM', label: 'Dinner & Cozy Sleep Video', uploaded: false }
    ],
    notes: 'Parent requested 3x daily WhatsApp updates. Fenced lawn exercise included.'
  },
  {
    id: 'ADV-PET-702',
    category: 'pet-services',
    title: 'Certified KCI In-Home Training: Foundation Bootcamp (Session 4/6)',
    type: 'training',
    customer: 'Karan Dave',
    phone: '+91 99090 77889',
    scheduledDate: '2026-11-27',
    timeSlot: '08:00 AM - 09:30 AM',
    pickupAddress: 'Trainer Base Hub',
    dropAddress: 'Bunglow 18, Goyal Intercity, Drive-In Road',
    payout: 1299,
    status: 'scheduled',
    trainingMilestones: {
      looseLeashWalking: '80% Mastered',
      doorbellImpulseControl: 'Needs Practice (Focus for today)',
      sitAndStay30Sec: 'Passed'
    },
    notes: 'Bring freeze-dried liver treats and 15ft biothane recall long-line.'
  },

  // 4. HEALTH & WELLNESS
  {
    id: 'ADV-HLT-601',
    category: 'health-wellness',
    title: 'In-Home IV Drip Therapy: Immunity Booster & Glutathione Glow',
    type: 'iv-drip',
    customer: 'Dr. Radhika Sen',
    phone: '+91 98220 99001',
    scheduledDate: '2026-11-26',
    timeSlot: '11:00 AM - 12:00 PM (45-Min Home Infusion)',
    pickupAddress: 'Apollo Clinical Cold-Chain Hub',
    dropAddress: 'Penthouse 1102, The Banyan, Ambli Road',
    payout: 2499,
    status: 'scheduled',
    clinicalIntake: {
      preBpCheck: '120/80 mmHg',
      pulse: '72 bpm',
      sterilitySealVerified: true,
      teleDocSignoff: 'Dr. Mehta (MBBS, Reg #54921)'
    },
    infusionProtocol: {
      sterileCanulaCheck: true,
      dripRateSet45DropsPerMin: true,
      emergencyAntihistamineKitReady: true
    },
    notes: 'Single-use cold sterile pouch verified. Monitor vitals every 15 minutes.'
  },
  {
    id: 'ADV-HLT-602',
    category: 'health-wellness',
    title: 'Elderly Care Physio & Mobility Rehab: Smt. Pushpa Patel',
    type: 'elderly-care',
    customer: 'Sameer Patel (Son)',
    phone: '+91 98790 33441',
    scheduledDate: '2026-11-26',
    timeSlot: '04:00 PM - 05:00 PM (Session 6 of 12)',
    pickupAddress: 'Physio Mobile Unit',
    dropAddress: 'Flat 204, Ashray Flats, Satellite',
    payout: 999,
    status: 'scheduled',
    therapyTasks: {
      kneeOsteoarthritisPassiveStretch: true,
      quadricepsStrengtheningBand: true,
      tensPainReliefTherapy15Min: true,
      fallRiskGaitBalanceAudit: true
    },
    notes: 'Upload post-session WhatsApp mobility video report for family.'
  },

  // 5. SOCIETY MANAGEMENT
  {
    id: 'ADV-SOC-501',
    category: 'society-management',
    title: 'Daily Waterless Car Wash Roster: Godrej Garden City (Wing B2)',
    type: 'waterless-wash',
    customer: 'RWA Society Committee',
    phone: '+91 98251 11223',
    scheduledDate: '2026-11-26',
    timeSlot: '05:00 AM - 08:30 AM (Morning Shift)',
    pickupAddress: 'Society Gate 2 Security Hub',
    dropAddress: 'Basement Parking Bay B2-101 to B2-120',
    payout: 3800,
    status: 'scheduled',
    societyGatePass: 'PIN: 4892 (Registered Security Gate 2)',
    vehicleRoster: [
      { bay: 'B2-104', car: 'Creta White (GJ-01-XX-1234)', washed: true, photoTaken: true },
      { bay: 'B2-108', car: 'Honda City Silver (GJ-01-YY-5678)', washed: true, photoTaken: true },
      { bay: 'B2-112', car: 'Nexon EV Blue (GJ-01-ZZ-9012)', washed: false, photoTaken: false },
      { bay: 'B2-116', car: 'Innova Crysta Black (GJ-01-AB-3456)', washed: false, photoTaken: false }
    ],
    notes: 'Use pH-neutral wax spray and clean ultra-soft microfiber cloths. Zero dripping policy.'
  },

  // 6. EVENTS HUB
  {
    id: 'ADV-EVT-401',
    category: 'events-hub',
    title: 'Corporate Gala Stage & AV Sound Setup: Tech Innovators Summit',
    type: 'event-production',
    customer: 'Chetan Kapoor (Event Lead)',
    phone: '+91 98240 99887',
    scheduledDate: '2026-11-27',
    timeSlot: '02:00 PM Load-In (Event 06:00 PM - 10:30 PM)',
    pickupAddress: 'ServeCircle Production Warehouse',
    dropAddress: 'Hyatt Regency Grand Ballroom, Ashram Road',
    payout: 8500,
    status: 'scheduled',
    runOfShow: [
      { time: '02:00 PM', milestone: 'Service Elevator Load-In & Truss Setup', done: true },
      { time: '04:00 PM', milestone: 'Sound Check & Wireless Mic Frequency Test', done: false },
      { time: '06:00 PM', milestone: 'Gala Inauguration & Lighting Cues', done: false },
      { time: '10:30 PM', milestone: 'Event Tear-Down & Safe Pack-Up', done: false }
    ],
    notes: 'Client POC Chetan Kapoor. Loading dock access pass badge #14.'
  }
];

const SECTORS = [
  { id: 'all', label: 'All Operations', icon: <HiOutlineSparkles /> },
  { id: 'travel-commute', label: 'Travel & Commute', icon: <HiOutlineTruck /> },
  { id: 'food-kitchen', label: 'Food & Kitchen', icon: <HiOutlineCake /> },
  { id: 'pet-services', label: 'Pet Services', icon: <HiOutlineHeart /> },
  { id: 'health-wellness', label: 'Health & Wellness', icon: <HiOutlineShieldCheck /> },
  { id: 'society-management', label: 'Society Operations', icon: <HiOutlineHomeModern /> },
  { id: 'events-hub', label: 'Events Hub', icon: <HiOutlineMusicalNote /> }
];

const WorkerSpecializedServices = () => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated, workerStatus, dutyStatus, updateDuty, isDemoMode } = useWorkerAuth();

  const [activeSector, setActiveSector] = useState('all');
  const [jobs, setJobs] = useState(INITIAL_SPECIALIZED_JOBS);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filteredJobs = useMemo(() => {
    if (activeSector === 'all') return jobs;
    return jobs.filter(j => j.category === activeSector);
  }, [jobs, activeSector]);

  // Status progression
  const advanceJobStatus = (jobId) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const nextStatus = j.status === 'scheduled' ? 'prepared' :
                         j.status === 'prepared' ? 'en-route' :
                         j.status === 'en-route' ? 'completed' : 'completed';
      return { ...j, status: nextStatus };
    }));
    showToast(`Order status updated successfully!`);
  };

  // Toggle vehicle / checklist item
  const toggleChecklist = (jobId, section, key) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        [section]: {
          ...j[section],
          [key]: !j[section][key]
        }
      };
    }));
    showToast('Checklist updated & saved.');
  };

  // Toggle student / passenger attendance
  const togglePassengerStatus = (jobId, index) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const updatedManifest = [...j.manifest];
      updatedManifest[index].status = updatedManifest[index].status === 'Boarded' ? 'Dropped / Complete' : 'Boarded';
      return { ...j, manifest: updatedManifest };
    }));
    showToast('Passenger attendance updated in live cloud log.');
  };

  // Toggle car wash item
  const toggleCarWash = (jobId, index) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const updatedRoster = [...j.vehicleRoster];
      updatedRoster[index].washed = !updatedRoster[index].washed;
      updatedRoster[index].photoTaken = updatedRoster[index].washed;
      return { ...j, vehicleRoster: updatedRoster };
    }));
    showToast('Vehicle wash verified with timestamp!');
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', padding: '20px 20px 100px', background: '#f8fafc' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'var(--navy-900)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <HiOutlineCheckCircle color="#38bdf8" size={20} />
          {toastMsg}
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        borderRadius: '24px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            <HiOutlineSparkles size={14} /> Specialized Operations Console
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Advance Bookings & Specialized Services Hub
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', maxWidth: '680px' }}>
            Manage scheduled contracts, passenger rosters, catering prep sheets, clinical health protocols, and RWA gate access.
          </p>
        </div>

        {/* Duty Switch widget */}
        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <WorkerDutySwitch
            dutyStatus={dutyStatus}
            onUpdateDuty={updateDuty}
            compact
          />
        </div>
      </div>

      {/* Sector Navigation Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        {SECTORS.map(s => {
          const active = activeSector === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSector(s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                border: active ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: active ? '#0284c7' : 'white',
                color: active ? 'white' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
            >
              {s.icon} {s.label}
            </button>
          );
        })}
      </div>

      {/* Job Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>
        {filteredJobs.map(job => {
          return (
            <div
              key={job.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Top Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: job.category === 'travel-commute' ? '#f0fdfa' :
                                job.category === 'food-kitchen' ? '#fff7ed' :
                                job.category === 'pet-services' ? '#fef2f2' :
                                job.category === 'health-wellness' ? '#eff6ff' :
                                job.category === 'society-management' ? '#f5f3ff' : '#fdf2f8',
                    color: job.category === 'travel-commute' ? '#0f766e' :
                           job.category === 'food-kitchen' ? '#ea580c' :
                           job.category === 'pet-services' ? '#ef4444' :
                           job.category === 'health-wellness' ? '#2563eb' :
                           job.category === 'society-management' ? '#7c3aed' : '#db2777'
                  }}>
                    {job.id} • {job.category.replace('-', ' & ')}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: job.status === 'completed' ? '#dcfce7' :
                                job.status === 'en-route' ? '#fef3c7' :
                                job.status === 'prepared' ? '#e0f2fe' : '#f1f5f9',
                    color: job.status === 'completed' ? '#15803d' :
                           job.status === 'en-route' ? '#b45309' :
                           job.status === 'prepared' ? '#0369a1' : '#475569'
                  }}>
                    ● {job.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 10px' }}>
                  {job.title}
                </h3>

                {/* Timing & Customer strip */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontWeight: 600 }}>📅 Date & Schedule:</span>
                    <strong style={{ color: 'var(--navy-900)' }}>{job.scheduledDate}</strong>
                    <div style={{ color: '#475569' }}>{job.timeSlot}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontWeight: 600 }}>👤 Client & Contact:</span>
                    <strong style={{ color: 'var(--navy-900)' }}>{job.customer}</strong>
                    <div style={{ color: '#0284c7', fontWeight: 700 }}>{job.phone}</div>
                  </div>
                </div>

                {/* Route / Addresses */}
                <div style={{ fontSize: '0.82rem', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                    <HiOutlineMapPin color="#0284c7" /> <strong>Pickup/Hub:</strong> {job.pickupAddress}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                    <HiOutlineMapPin color="#ef4444" /> <strong>Destination/Venue:</strong> {job.dropAddress}
                  </div>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* SECTOR SPECIFIC CONTENT */}
                {/* ───────────────────────────────────────────────────────────── */}

                {/* 1. TRAVEL: PASSENGER MANIFEST & VEHICLE INSPECTION */}
                {job.manifest && (
                  <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f766e', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📋 Passenger Manifest & Attendance</span>
                      <span>{job.manifest.length} Riders</span>
                    </div>
                    {job.manifest.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e6fffa', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{p.name}</strong>
                          {p.emergencyPhone && <span style={{ color: '#64748b', marginLeft: '6px' }}>({p.emergencyPhone})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePassengerStatus(job.id, idx)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: p.status === 'Boarded' ? '#0f766e' : '#e2e8f0',
                            color: p.status === 'Boarded' ? 'white' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {p.status}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {job.vehicleChecks && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#475569', display: 'block', marginBottom: '6px' }}>🚗 Pre-Trip Vehicle Safety Audit:</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {Object.keys(job.vehicleChecks).map(k => (
                        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={job.vehicleChecks[k]}
                            onChange={() => toggleChecklist(job.id, 'vehicleChecks', k)}
                          />
                          <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. FOOD & KITCHEN: SKEWERS & EQUIPMENT */}
                {job.skewerMenu && (
                  <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#c2410c', marginBottom: '6px' }}>
                      🔥 Live Grill Skewers ({job.guestCount} Guests • {job.dietType})
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#7c2d12', lineHeight: 1.5 }}>
                      {job.skewerMenu.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {job.equipmentChecklist && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#475569', display: 'block', marginBottom: '6px' }}>🍳 Kitchen Rig & Hardware Loading:</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                      {Object.keys(job.equipmentChecklist).map(k => (
                        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={job.equipmentChecklist[k]}
                            onChange={() => toggleChecklist(job.id, 'equipmentChecklist', k)}
                          />
                          <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PET CARE: DIET & 3X UPDATES */}
                {job.petProfile && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#b91c1c', marginBottom: '6px' }}>
                      🐾 Pet Profile: {job.petProfile.name} ({job.petProfile.breed})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                      <div><strong>Diet:</strong> {job.petProfile.diet}</div>
                      <div><strong>Habits:</strong> {job.petProfile.allergies}</div>
                    </div>
                  </div>
                )}

                {job.dailyUpdates && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#475569', display: 'block', marginBottom: '6px' }}>📹 3x Daily WhatsApp Video Proof:</strong>
                    {job.dailyUpdates.map((u, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                        <span>⏰ {u.time} - {u.label}</span>
                        <span style={{ fontWeight: 800, color: u.uploaded ? '#16a34a' : '#ea580c' }}>
                          {u.uploaded ? '✓ Sent to Parent' : 'Pending Upload'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. HEALTH: CLINICAL VITALS */}
                {job.clinicalIntake && (
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '14px', padding: '14px', marginBottom: '16px', fontSize: '0.78rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#1e40af', marginBottom: '6px' }}>
                      🩺 Clinical Vitals & Tele-Signoff
                    </div>
                    <div style={{ color: '#1e3a8a', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div><strong>Pre-BP:</strong> {job.clinicalIntake.preBpCheck}</div>
                      <div><strong>Pulse:</strong> {job.clinicalIntake.pulse}</div>
                      <div><strong>Doctor Signoff:</strong> {job.clinicalIntake.teleDocSignoff}</div>
                      <div><strong>Sterile Seal:</strong> Verified ✓</div>
                    </div>
                  </div>
                )}

                {/* 5. SOCIETY: VEHICLE ROSTER & GATE PASS */}
                {job.societyGatePass && (
                  <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '14px', padding: '14px', marginBottom: '16px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 800, color: '#6d28d9', marginBottom: '6px' }}>
                      🏢 Society Security Access: {job.societyGatePass}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#5b21b6' }}>
                      Show 4-digit PIN to Security Guard at Tower Gate to log entry into MyGate/NoBroker.
                    </div>
                  </div>
                )}

                {job.vehicleRoster && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#475569', display: 'block', marginBottom: '6px' }}>🚿 Daily Waterless Wash Matrix:</strong>
                    {job.vehicleRoster.map((v, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <strong>{v.bay}</strong>: {v.car}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCarWash(job.id, idx)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: v.washed ? '#16a34a' : '#e2e8f0',
                            color: v.washed ? 'white' : '#475569',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {v.washed ? '✓ Washed + Photo' : 'Mark Washed'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Special Instructions Note */}
                {job.notes && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', marginBottom: '16px' }}>
                    📌 Note: {job.notes}
                  </div>
                )}

              </div>

              {/* Bottom Actions & Payout */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Worker Earnings</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{job.payout}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => advanceJobStatus(job.id)}
                    style={{
                      background: job.status === 'completed' ? '#16a34a' : '#0284c7',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {job.status === 'scheduled' ? 'Confirm Prep & Dispatch' :
                     job.status === 'prepared' ? 'Start Service Trip' :
                     job.status === 'en-route' ? 'Complete & Save Log' : '✓ Completed'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default WorkerSpecializedServices;
