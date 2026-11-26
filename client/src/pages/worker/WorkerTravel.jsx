import { useState } from 'react';
import {
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
  HiOutlineKey,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineXMark
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_TRAVEL_JOBS = [
  {
    id: 'TRV-JOB-201',
    type: 'school-commute',
    typeLabel: 'School Commute Sub',
    title: 'School Safe Commute: DPS Bopal Kids Van #4 (Morning Shift)',
    customer: 'DPS Bopal Transport Desk',
    phone: '+91 98765 01234',
    pickupAddress: 'Sector 14 to South Bopal Corridor',
    destination: 'DPS Bopal Main Campus Gate 1',
    timeSlot: '07:15 AM - 08:00 AM',
    payout: 3499,
    status: 'accepted', // pending, accepted, rejected, completed
    currentStage: 2, // 1: Vehicle Audit, 2: Student Pickup Manifest, 3: Campus Safe Drop
    stages: [
      { num: 1, label: 'Vehicle Safety Audit' },
      { num: 2, label: 'Kids Pickup Manifest' },
      { num: 3, label: 'Campus Safe Drop' }
    ],
    vehicleAudit: {
      tiresOk: true,
      fuelOrBatteryOk: true,
      dashcamOnline: true,
      femaleEscortOnBoard: true,
      sanitizedAndAcOn: true
    },
    students: [
      { name: 'Aarav Patel (Grade 3-B)', stop: 'Block C, Orchid Greens', status: 'Boarded', parentPhone: '9876501234' },
      { name: 'Ananya Sharma (Grade 4-A)', stop: 'Main Gate, Gala Aria', status: 'Boarded', parentPhone: '9822011223' },
      { name: 'Reyansh Mehta (Grade 2-C)', stop: 'Bunglow 12, Sterling City', status: 'Pending', parentPhone: '9899033445' },
      { name: 'Diya Joshi (Grade 1-A)', stop: 'Flat 402, Sunshine Apts', status: 'Pending', parentPhone: '9711044556' }
    ]
  },
  {
    id: 'TRV-JOB-202',
    type: 'airport-transfer',
    typeLabel: 'Airport Transfer',
    title: 'VIP Airport Transfer: Terminal 2 Pickup (Flight 6E-2412)',
    customer: 'Rajesh & Meera Singhal',
    phone: '+91 98251 33445',
    pickupAddress: 'Sardar Vallabhbhai Patel Intl Airport (T2 Arrival Gate 3)',
    destination: 'Bungalow 7, Ambli Road, Bodakdev',
    timeSlot: '11:45 AM (Flight Lands 11:20 AM)',
    payout: 1499,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Flight Tracking & Terminal Gate Standby' },
      { num: 2, label: 'Passenger Meet & Greet with Placard' },
      { num: 3, label: 'Luggage Loading & Home Drop' }
    ],
    vehicleAudit: {
      tiresOk: true,
      fuelOrBatteryOk: true,
      dashcamOnline: true,
      sanitizedAndAcOn: true,
      namePlacardReady: true
    },
    flightMeta: {
      airline: 'IndiGo 6E-2412 (From Mumbai BOM)',
      eta: '11:20 AM (On-Time)',
      luggagePieces: '3 Trolley Bags + 2 Handbags',
      placardName: 'MR. RAJESH SINGHAL'
    }
  },
  {
    id: 'TRV-JOB-203',
    type: 'outstation-chauffeur',
    typeLabel: 'Outstation Chauffeur',
    title: 'Outstation 3-Day Trip: Ahmedabad ➔ Udaipur ➔ Mount Abu',
    customer: 'Dr. Sameer Kulkarni (Family Trip)',
    phone: '+91 99090 77889',
    pickupAddress: 'Flat 901, Iscon Platinum, Bopal',
    destination: 'Lake Palace Road, Udaipur (Return to Ahmedabad)',
    timeSlot: '06:00 AM Departure (3 Days / 2 Nights)',
    payout: 6800,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Pre-Trip Inspection & Odometer Start' },
      { num: 2, label: 'En-Route Highway Halts & Toll Log' },
      { num: 3, label: 'Trip Return & Final Settlement' }
    ],
    vehicleAudit: {
      tiresOk: true,
      fuelOrBatteryOk: true,
      dashcamOnline: true,
      stepneyJackChecked: true,
      fastagLoaded: true
    },
    itinerary: {
      startOdometer: '42,150 km',
      expectedKm: '850 km',
      driverAllowancePerNight: '₹500 / night included',
      halts: ['Shamlaji Highway Rest 08:30 AM', 'Udaipur Check-in 01:30 PM']
    }
  },
  {
    id: 'TRV-JOB-204',
    type: 'luxury-rental',
    typeLabel: 'Luxury & Vintage Rental',
    title: 'VIP Chauffeur Delivery: Ford Mustang GT Convertible',
    customer: 'Vikramaditya Singhania',
    phone: '+91 98250 88990',
    pickupAddress: 'ServeCircle VIP Fleet Hub, Prahlad Nagar',
    destination: 'Courtyard by Marriott, Satellite Road',
    timeSlot: '10:00 AM Handover',
    payout: 7999,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Pre-Dispatch Fleet Inspection' },
      { num: 2, label: 'Doorstep Delivery Handover' },
      { num: 3, label: 'Trip Return / Signoff' }
    ],
    vehicleAudit: {
      flatbedSecured: true,
      zeroScratchAuditDone: true,
      fuelTank100Percent: true,
      licenseVerified: true
    },
    specs: 'Triple Yellow • 5.0L V8 • 2-Door Convertible Sports'
  },
  {
    id: 'TRV-JOB-205',
    type: 'corporate-carpool',
    typeLabel: 'Corporate Carpool Hub',
    title: 'Daily Corporate SUV Route: South Bopal ➔ Gift City Tech Park',
    customer: 'Gift City Executives Roster',
    phone: '+91 97250 66112',
    pickupAddress: 'South Bopal Cross Road (Gate 1)',
    destination: 'Tower 1, Brigade Tech Hub, Gift City',
    timeSlot: '08:30 AM Morning Shift',
    payout: 2200,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Route Prep & Seat Reservation Audit' },
      { num: 2, label: 'Executive Co-Riders Boarding' },
      { num: 3, label: 'Gift City Tech Park Drop' }
    ],
    vehicleAudit: {
      tiresOk: true,
      fuelOrBatteryOk: true,
      dashcamOnline: true,
      sanitizedAndAcOn: true,
      chargingCablesReady: true
    },
    passengers: [
      { name: 'Kunal Shah (VP, FinTech)', seat: 'Co-Pilot Front', status: 'Confirmed' },
      { name: 'Pooja Agarwal (Senior Analyst)', seat: 'Rear Left', status: 'Confirmed' },
      { name: 'Nikhil Mehta (Lead Architect)', seat: 'Rear Right', status: 'Confirmed' }
    ]
  }
];

const normalizeTravelBooking = (b) => {
  const isSchool = (b.service || '').toLowerCase().includes('school');
  const isAirport = (b.service || '').toLowerCase().includes('airport');
  const isLuxury = (b.service || '').toLowerCase().includes('luxury') || (b.service || '').toLowerCase().includes('vintage');
  const isCarpool = (b.service || '').toLowerCase().includes('carpool');
  const type = isSchool ? 'school-commute' : isAirport ? 'airport-transfer' : isLuxury ? 'luxury-rental' : isCarpool ? 'corporate-carpool' : 'outstation-chauffeur';
  const typeLabel = isSchool ? 'School Commute Sub' : isAirport ? 'Airport Transfer' : isLuxury ? 'Luxury Rental' : isCarpool ? 'Corporate Carpool' : 'Outstation Trip';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Travel Booking'}: ${b.address || 'Corridor Route'}`,
    customer: b.customer?.name || 'Customer Booking',
    phone: b.customer?.phone || '+91 98765 01234',
    pickupAddress: b.requirements?.pickupLocation || b.address || 'Ahmedabad Pickup',
    destination: b.requirements?.destination || 'Destination Point',
    timeSlot: b.scheduledTime || 'Scheduled Slot',
    payout: b.amount ? Math.round(b.amount * 0.85) : 3499,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Vehicle Safety Audit' },
      { num: 2, label: 'Passenger Manifest' },
      { num: 3, label: 'Safe Drop Handover' }
    ],
    vehicleAudit: {
      tiresOk: true,
      fuelOrBatteryOk: true,
      dashcamOnline: true,
      femaleEscortOnBoard: true,
      sanitizedAndAcOn: true
    },
    students: isSchool ? [
      { name: b.customer?.name || 'Student 1', stop: b.requirements?.pickupLocation || b.address || 'Stop Point', status: 'Pending', parentPhone: b.customer?.phone || '9876501234' }
    ] : undefined,
    flightMeta: isAirport ? {
      airline: b.requirements?.flightNo ? `Flight ${b.requirements.flightNo}` : 'IndiGo 6E-2412',
      eta: b.scheduledTime || 'On-Time',
      luggagePieces: '2 Checked Bags + Handbags',
      placardName: (b.customer?.name || 'PASSENGER').toUpperCase()
    } : undefined,
    itinerary: (!isSchool && !isAirport && !isLuxury && !isCarpool) ? {
      startOdometer: '42,150 km',
      expectedKm: '450 km',
      driverAllowancePerNight: '₹500 / night included',
      halts: [(b.requirements?.stops?.[0] || 'Mid-way Express Rest'), 'Destination Check-in']
    } : undefined,
    specs: isLuxury ? 'Luxury Chauffeur Service • Sanitized • VIP Amenity Kit' : undefined,
    passengers: isCarpool ? [
      { name: b.customer?.name || 'Executive Rider', seat: 'Co-Pilot Front', status: 'Confirmed' }
    ] : undefined
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Travel Requests' },
  { id: 'school-commute', label: '🚸 School Commute' },
  { id: 'airport-transfer', label: '✈️ Airport Transfer' },
  { id: 'outstation-chauffeur', label: '🛣️ Outstation Trip' },
  { id: 'luxury-rental', label: '🏎️ Luxury Fleet' },
  { id: 'corporate-carpool', label: '👥 Corporate Carpool' }
];

const WorkerTravel = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [selectedTab, setSelectedTab] = useState('all');

  const {
    jobs,
    selectedJobId,
    setSelectedJobId,
    currentJob: activeSpecializedJob,
    handleJobAction,
    advanceStage,
    toggleChecklist,
    toastMsg,
  } = useSpecializedJobs({
    category: 'Travel & Commute',
    categoryAliases: ['Travel', 'Commute'],
    defaultJobs: DEMO_TRAVEL_JOBS,
    normalizeIncomingBooking: normalizeTravelBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleAudit = (jobId, key) => toggleChecklist(jobId, 'vehicleAudit', key);
  const toggleStudent = (jobId, idx) => toggleChecklist(jobId, 'students', idx);

  return (
    <div className="worker-page">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#0f172a',
          color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid #334155', fontWeight: 600
        }}>
          <HiOutlineCheckCircle style={{ color: '#22c55e', fontSize: '1.25rem' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="worker-hero-card" style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Travel & Commute Operations
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• School Van, Airport Cabs, Outstation & Fleets</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Travel & Commute Driver Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Manage student pick/drop rosters, pre-trip vehicle audits, flight track manifests, and outstation odometer logs.
            </p>
          </div>
          <WorkerDutySwitch dutyStatus={dutyStatus} updateDuty={updateDuty} />
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTab(tab.id);
              const tabJobs = jobs.filter(j => tab.id === 'all' || j.type === tab.id);
              if (tabJobs.length > 0) {
                setSelectedJobId(tabJobs[0].id);
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: selectedTab === tab.id ? '2px solid #0d9488' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#0d9488' : '#fff',
              color: selectedTab === tab.id ? '#fff' : '#475569',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Job Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Assigned Trips ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#ccfbf1', color: '#0f766e', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Schedule
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No trips in this category right now.
            </div>
          ) : (
            filteredJobs.map(job => {
              const isSelected = job.id === currentJob.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    background: '#fff',
                    border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(13, 148, 136, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#0d9488', background: '#f0fdfa', padding: '3px 8px', borderRadius: '6px'
                    }}>
                      {job.typeLabel}
                    </span>
                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}>
                      ₹{job.payout.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {job.title}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#0d9488' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.pickupAddress}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>{job.timeSlot}</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#0d9488',
                      fontWeight: 700
                    }}>
                      {job.status === 'completed' ? 'Completed ✓' : job.status === 'rejected' ? 'Declined ✗' : job.status === 'pending' ? 'Pending Action' : `Stage ${job.currentStage}/3`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Operational Cockpit */}
        {currentJob ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Time: {currentJob.timeSlot}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#0d9488' }} />
                  <span><strong>From:</strong> {currentJob.pickupAddress} ➔ <strong>To:</strong> {currentJob.destination}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${(currentJob.phone || '').replace(/[^0-9+]/g, '')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                    borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1',
                    color: '#0f172a', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700
                  }}
                >
                  <HiOutlinePhone style={{ color: '#0d9488' }} />
                  <span>Call Desk</span>
                </a>

                {['pending', 'assigned', 'broadcast'].includes(String(currentJob.status || '').toLowerCase()) ? (
                  <>
                    <button
                      onClick={() => handleJobAction(currentJob.id, 'accepted')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '10px', background: '#16a34a', color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      <HiOutlineCheck /> Accept Job
                    </button>
                    <button
                      onClick={() => handleJobAction(currentJob.id, 'rejected')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                        borderRadius: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      <HiOutlineXMark /> Decline
                    </button>
                  </>
                ) : currentJob.status === 'rejected' ? (
                  <button
                    disabled
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                      fontWeight: 700, fontSize: '0.82rem', cursor: 'default'
                    }}
                  >
                    <HiOutlineXMark style={{ fontSize: '1.1rem' }} /> Trip Declined
                  </button>
                ) : currentJob.status === 'completed' ? (
                  <button
                    disabled
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: '#16a34a', color: '#fff', border: 'none',
                      fontWeight: 700, fontSize: '0.82rem', cursor: 'default'
                    }}
                  >
                    <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Trip Completed
                  </button>
                ) : (
                  <button
                    onClick={() => advanceStage(currentJob.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#0d9488',
                      color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    <span>{currentJob.currentStage === 3 ? 'Finish & Complete Trip' : 'Next Stage'}</span>
                    <HiOutlineArrowRight />
                  </button>
                )}
              </div>
            </div>

            {/* Stage Stepper */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Operational Transit Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#0d9488' : isPassed ? '#16a34a' : '#fff',
                        color: isCurrent || isPassed ? '#fff' : '#64748b',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isCurrent || isPassed ? 'none' : '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '999px',
                        background: isCurrent || isPassed ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem'
                      }}>
                        {isPassed && currentJob.status === 'completed' ? '✓' : stg.num}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service-Specific Interactive Tools */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Left Box: Domain Specific Manifests / Meta */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                
                {/* 1. School Commute Students */}
                {currentJob.type === 'school-commute' && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiOutlineAcademicCap style={{ color: '#0d9488', fontSize: '1.2rem' }} />
                      Student Attendance & Guardian Manifest ({currentJob.students?.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.students?.map((std, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px', borderRadius: '8px',
                            background: std.status === 'Boarded' ? '#f0fdfa' : std.status.includes('Dropped') ? '#f0fdf4' : '#fff',
                            border: '1px solid #e2e8f0', fontSize: '0.8rem'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{std.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Stop: {std.stop}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => toggleStudent(currentJob.id, idx)}
                              style={{
                                padding: '4px 10px', borderRadius: '6px', border: 'none',
                                background: std.status === 'Boarded' ? '#0d9488' : std.status.includes('Dropped') ? '#16a34a' : '#e2e8f0',
                                color: std.status === 'Pending' ? '#475569' : '#fff',
                                fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer'
                              }}
                            >
                              {std.status}
                            </button>
                            <a href={`tel:${std.parentPhone}`} style={{ color: '#0d9488', fontSize: '1rem' }} title="Call Parent">
                              <HiOutlinePhone />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Airport Transfer Flight Specs */}
                {currentJob.type === 'airport-transfer' && currentJob.flightMeta && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      ✈️ Live Flight Details & Placard
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Flight Number & Status</div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentJob.flightMeta.airline}</div>
                        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>ETA: {currentJob.flightMeta.eta}</div>
                      </div>
                      <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Digital Pickup Placard</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '0.04em', margin: '4px 0' }}>
                          {currentJob.flightMeta.placardName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#3b82f6' }}>Hold tablet or paper placard at Arrival Gate 3</div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        📦 <strong>Baggage:</strong> {currentJob.flightMeta.luggagePieces}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Outstation Itinerary */}
                {currentJob.type === 'outstation-chauffeur' && currentJob.itinerary && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      🛣️ Outstation Trip Milestones & Fuel/Toll
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Start Odometer:</span>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentJob.itinerary.startOdometer}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Est. Total Run:</span>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentJob.itinerary.expectedKm}</div>
                        </div>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600 }}>
                        {currentJob.itinerary.driverAllowancePerNight}
                      </div>
                      <div style={{ color: '#475569' }}>
                        <strong>Planned Halts:</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
                          {currentJob.itinerary.halts.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Luxury Rental Handover */}
                {currentJob.type === 'luxury-rental' && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      🏎️ Fleet Handover & Vehicle Specs
                    </h4>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{currentJob.specs}</div>
                      <p style={{ margin: 0, color: '#64748b' }}>
                        Mandatory 360° walk-around video capture before handing keys to customer. Check original DL and collect security deposit voucher.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Corporate Carpool Passenger List */}
                {currentJob.type === 'corporate-carpool' && currentJob.passengers && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      👥 Executive Co-Riders Manifest
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.passengers.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Seat: {p.seat}</div>
                          </div>
                          <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Box: Pre-Departure Vehicle Safety Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineShieldCheck style={{ color: '#0d9488', fontSize: '1.2rem' }} />
                  Vehicle Safety & Cleanliness Audit
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.vehicleAudit || {}).map(([key, val]) => (
                    <label
                      key={key}
                      onClick={() => toggleAudit(currentJob.id, key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontSize: '0.82rem', color: val ? '#0f172a' : '#64748b'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => {}}
                        style={{ accentColor: '#0d9488', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'tiresOk' && 'Tire Pressure & Tread Depth Verified (32-35 PSI)'}
                        {key === 'fuelOrBatteryOk' && 'Fuel Tank > 60% or EV Charge > 80%'}
                        {key === 'dashcamOnline' && 'Dual Dashcam Active & Live GPS Streaming'}
                        {key === 'femaleEscortOnBoard' && 'Verified Female Attendant Present in Van'}
                        {key === 'sanitizedAndAcOn' && 'Cabin Sanitized & Climate Control Set at 23°C'}
                        {key === 'namePlacardReady' && 'Digital / Printed Guest Name Placard Ready'}
                        {key === 'stepneyJackChecked' && 'Spare Wheel (Stepney) & Hydraulic Jack Verified'}
                        {key === 'fastagLoaded' && 'FASTag Balance Minimum ₹1,000 Maintained'}
                        {key === 'flatbedSecured' && 'Vehicle Securely Loaded on Transport Flatbed'}
                        {key === 'zeroScratchAuditDone' && 'Pre-Delivery 360° Scratch & Dent Inspection Photo Taken'}
                        {key === 'fuelTank100Percent' && 'Fuel Tank 100% Full (Complimentary Full Tank)'}
                        {key === 'licenseVerified' && 'Driver Commercial License & Badge Valid'}
                        {key === 'chargingCablesReady' && 'Type-C & Lightning Multi-Charger Cables Available'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1', fontSize: '0.76rem', color: '#0f766e' }}>
                  <strong>Safety Protocol:</strong> Speed limit governed at 60 km/h for student buses and city cabs as per road safety mandate.
                </div>
              </div>

            </div>

            {/* Bottom Contact & Payout Bar */}
            <div style={{
              marginTop: '20px', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc',
              border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Client Contact</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.customer} ({currentJob.phone})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Driver Net Payout</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>₹{currentJob.payout.toLocaleString('en-IN')}</div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚖</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No trips in this category</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px' }}>
              There are currently no active bookings matching this filter. Switch back to view all trips.
            </p>
            <button
              onClick={() => { setSelectedTab('all'); if (jobs.length > 0) setSelectedJobId(jobs[0].id); }}
              style={{ padding: '8px 18px', borderRadius: '10px', background: '#0d9488', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              View All Travel Requests
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerTravel;
