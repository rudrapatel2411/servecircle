import { useState } from 'react';
import {
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentCheck,
  HiOutlineMapPin,
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee,
  HiOutlineArrowRight,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineWrench,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_RELOCATION_JOBS = [
  {
    id: 'REL-JOB-101',
    type: 'full-home-shifting',
    typeLabel: '3BHK Complete House Move',
    title: '3BHK Full Home Shifting: Bopal to Ambli Road (Includes Furniture Dismantle)',
    customer: 'Virendra & Shweta Joshi',
    phone: '+91 98252 77114',
    origin: 'Flat 902, Gala Aria, South Bopal (Elevator Available)',
    destination: 'Villa 14, The Banyan, Ambli Road (Ground + 1 Floor)',
    distanceKm: 8,
    payout: 12500,
    status: 'accepted',
    currentStage: 1, // 1: Inventory & Packing, 2: Transit & Unloading, 3: Furniture Assembly & Handover
    stages: [
      { num: 1, label: 'Room-by-Room Packing & Loading' },
      { num: 2, label: 'Dedicated Container Transit' },
      { num: 3, label: 'Room Placement & Bed Assembly' }
    ],
    inventoryList: [
      { item: '1x 3-Seater L-Shape Leather Sofa', count: 1, fragile: true, packed: true },
      { item: '2x King Size Wooden Double Beds (Dismantled)', count: 2, fragile: false, packed: true },
      { item: '1x 55" OLED Smart TV (Wooden Crate Packed)', count: 1, fragile: true, packed: false },
      { item: '1x Double-Door Refrigerator (Bubble Padded)', count: 1, fragile: false, packed: false },
      { item: '18x Heavy Corrugated Carton Boxes', count: 18, fragile: false, packed: false }
    ],
    inspectionChecks: {
      furnitureEdgePadsAndShrinkWrapSecured: true,
      woodenCrateBuiltForElectronics: true,
      elevatorWeightSafetyChecked: true,
      powerToolsDismantlingDone: true,
      postUnloadingBroomCleanDone: false
    }
  },
  {
    id: 'REL-JOB-102',
    type: 'vehicle-relocation',
    typeLabel: 'VIP Vehicle Carrier',
    title: 'Enclosed Carrier Transit: Hyundai Creta SX (Ahd ➔ Mumbai)',
    customer: 'Amitabh Sen',
    phone: '+91 98250 11223',
    origin: 'Flat 402, Sunshine Apts, Bopal, Ahmedabad',
    destination: 'Tower 4, Hiranandani Estate, Thane, Mumbai',
    distanceKm: 520,
    payout: 8999,
    status: 'accepted',
    currentStage: 2,
    stages: [
      { num: 1, label: '360° Inspection & Ramp Loading' },
      { num: 2, label: 'En-Route Container Transit' },
      { num: 3, label: 'Destination Unloading & Handover' }
    ],
    vehicleModel: 'Hyundai Creta SX (White, GJ-01-XX-9021)',
    odometerKm: '24,580 km',
    fuelLevel: '50% (Half Tank)',
    transitWaypoints: [
      { point: 'Ahmedabad Dispatch Hub', time: '06:00 AM', status: 'Departed' },
      { point: 'Vadodara Highway Toll', time: '08:30 AM', status: 'Passed' },
      { point: 'Surat Bypass Rest Halt', time: '12:00 PM', status: 'Active' },
      { point: 'Thane Destination Hub', time: '05:30 PM (Est.)', status: 'Pending' }
    ],
    inspectionChecks: {
      batteryDisconnected: true,
      wheelChocksLocked: true,
      fuelOdometerLogged: true,
      fourSidePhotosTaken: true,
      zeroScratchSigned: true
    }
  },
  {
    id: 'REL-JOB-103',
    type: 'scrap-removal',
    typeLabel: 'Pre-Move Scrap Salvage',
    title: 'Pre-Move Junk & Scrap Declutter (Weight Scale & Salvage Credit)',
    customer: 'Sunita Narang',
    phone: '+91 98980 44556',
    origin: 'Villa 14, Sterling City, Bopal',
    destination: 'GreenCycle Eco-Salvage Plant, GIDC',
    distanceKm: 28,
    payout: 1200,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Digital Scale Weight & Dismantle' },
      { num: 2, label: 'Truck Loading & Broom Clean' },
      { num: 3, label: 'Salvage Credit Cash Settlement' }
    ],
    scrapInventory: [
      { item: 'Old Wooden Bed Frame (Dismantled)', weightKg: 65, salvageRate: 0 },
      { item: 'Damaged Iron Grills & Metal Pipes', weightKg: 42, salvageRate: 28 }, // ₹1,176 credit
      { item: 'Obsolete CRT Monitor & Tangled E-Waste', weightKg: 18, salvageRate: 15 } // ₹270 credit
    ],
    inspectionChecks: {
      powerToolsDismantlingDone: true,
      digitalWeighingVerified: true,
      elevatorWeightSafetyChecked: true,
      salvageCashCreditedToCustomer: false,
      postPickupBroomCleanDone: false
    }
  },
  {
    id: 'REL-JOB-104',
    type: 'office-shifting',
    typeLabel: 'Corporate Office Move',
    title: 'Tech Office Shifting: 25 Workstations & Server Rack Padding',
    customer: 'InnoTech Solutions (Operations Desk)',
    phone: '+91 97244 11229',
    origin: 'Floor 4, Westgate Business Bay, SG Highway',
    destination: 'Floor 7, Privilon Commercial Hub, Iscon Cross Road',
    distanceKm: 12,
    payout: 18500,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Workstation Numbering & Server Crate' },
      { num: 2, label: 'Hydraulic Tailgate Truck Transit' },
      { num: 3, label: 'Desk Setup & IT Power Testing' }
    ],
    inventoryList: [
      { item: '25x Modular Workstation Desks (Flat Pack)', count: 25, fragile: false, packed: true },
      { item: '2x 42U Server Racks (Heavy Anti-Static Padded)', count: 2, fragile: true, packed: false },
      { item: '35x Monitored Ergonomic Chairs', count: 35, fragile: false, packed: false },
      { item: '1x Conference Table (12 Seater Solid Wood)', count: 1, fragile: true, packed: false }
    ],
    inspectionChecks: {
      serverAntiStaticPaddedCratesLocked: true,
      workstationColorCodedLabelsMatched: true,
      freightElevatorSlotBooked: true,
      serviceLiftProtectionBoardsInstalled: true
    }
  },
  {
    id: 'REL-JOB-105',
    type: 'single-item',
    typeLabel: 'Single Heavy Item Transit',
    title: 'Single Item Delivery: Luxury 3-Seater Electric Recliner Sofa',
    customer: 'Devansh Trivedi',
    phone: '+91 98255 33221',
    origin: 'Home Centre Showroom, Alpha One Mall, Vastrapur',
    destination: 'Flat 1102, Orchid Harmony, South Bopal',
    distanceKm: 14,
    payout: 1800,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Showroom Packaging & Loading' },
      { num: 2, label: 'Mini Tempo Direct Transit' },
      { num: 3, label: 'Living Room Placement & Power Plug' }
    ],
    inventoryList: [
      { item: '1x Electric Dual-Motor Leather Recliner (95 kg)', count: 1, fragile: true, packed: true }
    ],
    inspectionChecks: {
      waterproofCoveringApplied: true,
      staircasePivotClearanceMeasured: true,
      powerReclineMotorTestedOnDelivery: false
    }
  }
];

const normalizeRelocationBooking = (b) => {
  const isVehicle = (b.service || '').toLowerCase().includes('vehicle') || (b.service || '').toLowerCase().includes('carrier') || (b.service || '').toLowerCase().includes('car');
  const isScrap = (b.service || '').toLowerCase().includes('scrap') || (b.service || '').toLowerCase().includes('junk') || (b.service || '').toLowerCase().includes('declutter');
  const isOffice = (b.service || '').toLowerCase().includes('office') || (b.service || '').toLowerCase().includes('commercial');
  const isSingle = (b.service || '').toLowerCase().includes('single') || (b.service || '').toLowerCase().includes('heavy');
  const type = isVehicle ? 'vehicle-relocation' : isScrap ? 'scrap-removal' : isOffice ? 'office-shifting' : isSingle ? 'single-item' : 'full-home-shifting';
  const typeLabel = isVehicle ? 'Vehicle Relocation' : isScrap ? 'Scrap & Junk Removal' : isOffice ? 'Corporate Office Move' : isSingle ? 'Single Heavy Item' : 'Full Home Shifting';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Relocation Move'}: ${b.address || 'Ahmedabad Corridor'}`,
    customer: b.customer?.name || 'Relocation Client',
    phone: b.customer?.phone || '+91 98252 00000',
    origin: b.requirements?.pickupLocation || b.address || 'Pickup Address',
    destination: b.requirements?.destination || 'Destination Address',
    distanceKm: b.pricingParams?.distanceKm || 12,
    payout: b.amount ? Math.round(b.amount * 0.85) : 7500,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Room-by-Room Packing & Loading' },
      { num: 2, label: 'Dedicated Container Transit' },
      { num: 3, label: 'Unloading, Assembly & Handover' }
    ],
    inventoryList: [
      { item: b.requirements?.inventorySpecs || 'Master Furniture & Heavy Cartons', qty: 1, packed: false },
      { item: 'Fragile Electronics & Kitchen Glassware', qty: 1, packed: false },
      { item: 'Appliance Unhook & Bubble Wrap', qty: 1, packed: false }
    ],
    inspectionChecks: {
      zeroDepTransitInsuranceActive: true,
      bubbleWrapCornersChecked: true,
      containerSealLockedBeforeDispatch: true,
      floorScuffProtectorsPlaced: true
    }
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Relocation Operations' },
  { id: 'full-home-shifting', label: '📦 Full Home Shifting' },
  { id: 'vehicle-relocation', label: '🚗 Vehicle Carrier' },
  { id: 'scrap-removal', label: '♻️ Scrap Declutter' },
  { id: 'office-shifting', label: '🏢 Office Relocation' },
  { id: 'single-item', label: '🛋️ Single Heavy Item' }
];

const WorkerRelocation = () => {
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
    category: 'Packers & Movers',
    categoryAliases: ['Relocation', 'Packers', 'Movers', 'Packers & Movers'],
    defaultJobs: DEMO_RELOCATION_JOBS,
    normalizeIncomingBooking: normalizeRelocationBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleCheck = (jobId, key) => toggleChecklist(jobId, 'inspectionChecks', key);
  const toggleInventoryItem = (jobId, idx) => toggleChecklist(jobId, 'inventoryList', idx);

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
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Relocation & Packers Operations
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• Full House Shifting, Car Transit, Scrap Salvage & Office</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Packers & Movers Operations Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Coordinate room-by-room inventory manifests, enclosed hydraulic vehicle transit, digital scrap weighing, and broom-clean signoffs.
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
              const nextFiltered = jobs.filter(j => tab.id === 'all' || j.type === tab.id);
              if (nextFiltered.length > 0) {
                setSelectedJobId(nextFiltered[0].id);
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: selectedTab === tab.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#2563eb' : '#fff',
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

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Job Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Relocation Jobs ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Fleet
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No moves in this category.
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
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(37, 99, 235, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px'
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
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#2563eb' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.origin}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Distance: {job.distanceKm} km</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#2563eb',
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Distance: {currentJob.distanceKm} km Transit</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#2563eb' }} />
                  <span><strong>From:</strong> {currentJob.origin} ➔ <strong>To:</strong> {currentJob.destination}</span>
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
                  <HiOutlinePhone style={{ color: '#2563eb' }} />
                  <span>Call Client</span>
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
                      <HiOutlineCheck /> Accept Move
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
                    <HiOutlineXMark style={{ fontSize: '1.1rem' }} /> Move Declined
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
                    <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Move Completed
                  </button>
                ) : (
                  <button
                    onClick={() => advanceStage(currentJob.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#2563eb',
                      color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    <span>{currentJob.currentStage === 3 ? 'Finish & Complete Move' : 'Next Stage'}</span>
                    <HiOutlineArrowRight />
                  </button>
                )}
              </div>
            </div>

            {/* Stage Stepper */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Relocation Operational Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#2563eb' : isPassed ? '#16a34a' : '#fff',
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
              
              {/* Left Box: Inventory / Scrap Manifest */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                
                {/* 1. Inventory Checklist */}
                {currentJob.inventoryList && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiOutlineClipboardDocumentCheck style={{ color: '#2563eb', fontSize: '1.2rem' }} />
                      Inventory Packing & Loading List ({currentJob.inventoryList.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.inventoryList.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleInventoryItem(currentJob.id, idx)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            background: item.packed ? '#f0fdf4' : '#fff',
                            border: '1px solid #e2e8f0', fontSize: '0.8rem'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: item.packed ? 700 : 500, color: item.packed ? '#166534' : '#0f172a' }}>
                              {item.item}
                            </span>
                            {item.fragile && (
                              <span style={{ marginLeft: '6px', fontSize: '0.68rem', background: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                FRAGILE
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700,
                            background: item.packed ? '#dcfce7' : '#f1f5f9',
                            color: item.packed ? '#166534' : '#64748b'
                          }}>
                            {item.packed ? 'Packed & Loaded ✓' : 'Unpacked'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Vehicle Relocation Specs & Waypoints */}
                {currentJob.type === 'vehicle-relocation' && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      🚗 Carrier Vehicle Specs & Live Transit
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                      <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontWeight: 800, color: '#1e3a8a' }}>{currentJob.vehicleModel}</div>
                        <div style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: '2px' }}>
                          Odometer: {currentJob.odometerKm} • Fuel: {currentJob.fuelLevel}
                        </div>
                      </div>
                      <div style={{ color: '#475569' }}>
                        <strong>Highway Checkpoints:</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                          {currentJob.transitWaypoints?.map((wp, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                              <span>{wp.point} ({wp.time})</span>
                              <span style={{
                                fontWeight: 700,
                                color: wp.status === 'Departed' || wp.status === 'Passed' ? '#16a34a' : wp.status === 'Active' ? '#2563eb' : '#94a3b8'
                              }}>
                                {wp.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Scrap Salvage Weigh Scale */}
                {currentJob.scrapInventory && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      ⚖️ Digital Scrap Weight & Cash Value
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.scrapInventory.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{item.item}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Weight: {item.weightKg} kg</div>
                          </div>
                          <span style={{ fontWeight: 800, color: '#16a34a' }}>
                            {item.salvageRate > 0 ? `+ ₹${item.weightKg * item.salvageRate}` : 'Free Salvage'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Box: Movers Safety & Inspection Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineShieldCheck style={{ color: '#2563eb', fontSize: '1.2rem' }} />
                  Safety Transit & Furniture Assembly Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.inspectionChecks || {}).map(([key, val]) => (
                    <label
                      key={key}
                      onClick={() => toggleCheck(currentJob.id, key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontSize: '0.82rem', color: val ? '#0f172a' : '#64748b'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => {}}
                        style={{ accentColor: '#2563eb', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'furnitureEdgePadsAndShrinkWrapSecured' && 'Foam Corner Edge Guards & 5-Layer Stretch Wrap Applied'}
                        {key === 'woodenCrateBuiltForElectronics' && 'Custom Wooden Crate Box for OLED TV & Glass Mirrors'}
                        {key === 'elevatorWeightSafetyChecked' && 'Elevator Floor Padding & Weight Limit Adhered'}
                        {key === 'powerToolsDismantlingDone' && 'Cordless Drill Dismantling for Beds & Wardrobes Completed'}
                        {key === 'postUnloadingBroomCleanDone' && 'Destination Broom-Clean Promise & Box Disposal Finished'}
                        {key === 'batteryDisconnected' && 'Negative Battery Terminal Disconnected for Fire Safety'}
                        {key === 'wheelChocksLocked' && 'Container Floor Wheel Chocks & Heavy Ratchet Belts Bolted'}
                        {key === 'fuelOdometerLogged' && 'Odometer and Fuel Level Counters Verified with Customer'}
                        {key === 'fourSidePhotosTaken' && '360° Four-Side HD Vehicle Photos Captured Before Loading'}
                        {key === 'zeroScratchSigned' && 'Digital Zero-Scratch Transit Insurance Form Signed'}
                        {key === 'digitalWeighingVerified' && 'Digital Scale Certified Weight Verified with Host'}
                        {key === 'salvageCashCreditedToCustomer' && 'Salvage Credit Deposited via UPI into Customer Account'}
                        {key === 'postPickupBroomCleanDone' && 'Scrap Removal Yard Broom-Swept Free of Nails & Splinters'}
                        {key === 'serverAntiStaticPaddedCratesLocked' && 'Server Racks in Anti-Static Padded Crates Locked'}
                        {key === 'workstationColorCodedLabelsMatched' && 'Employee Workstation Desk Labels Color-Coded'}
                        {key === 'freightElevatorSlotBooked' && 'Commercial Building Freight Elevator Reserved'}
                        {key === 'serviceLiftProtectionBoardsInstalled' && 'Service Lift Wall Protection Boards Installed'}
                        {key === 'waterproofCoveringApplied' && 'Heavy Waterproof Tarpaulin Covering Applied to Sofa'}
                        {key === 'staircasePivotClearanceMeasured' && 'Staircase Turning Angle & Doorway Clearance Measured'}
                        {key === 'powerReclineMotorTestedOnDelivery' && 'Electric Recliner Motor Plugged In & Tested Functional'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '0.76rem', color: '#1e40af' }}>
                  <strong>Transit Guarantee:</strong> Zero-damage handling pledge; furniture re-assembled in designated rooms before final signoff.
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
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Movers Net Payout</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>₹{currentJob.payout.toLocaleString('en-IN')}</div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1',
            padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚚</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>No relocation orders in this category</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.85rem' }}>Switch tabs or reset filters to view all active moves.</p>
            <button
              onClick={() => setSelectedTab('all')}
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              View All Relocation Orders
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerRelocation;
