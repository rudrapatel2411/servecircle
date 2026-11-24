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
  HiOutlineTrash
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_RELOCATION_JOBS = [
  {
    id: 'REL-JOB-101',
    type: 'vehicle-relocation',
    title: 'Vehicle Relocation: Hyundai Creta SX (Enclosed Container Pod)',
    customer: 'Amitabh Sen',
    phone: '+91 98250 11223',
    origin: 'Flat 402, Sunshine Apts, Bopal, Ahmedabad',
    destination: 'Tower 4, Hiranandani Estate, Thane, Mumbai',
    distanceKm: 520,
    vehicleModel: 'Hyundai Creta SX (White)',
    plateNumber: 'GJ-01-XX-9021',
    currentStage: 1, // 1: Inspection & Loading, 2: In-Transit, 3: Unloading & Handover
    payout: 8999,
    stages: [
      { num: 1, label: '360° Inspection & Ramp Loading' },
      { num: 2, label: 'En-Route Container Transit' },
      { num: 3, label: 'Destination Unloading & Handover' }
    ],
    inspectionChecks: {
      batteryDisconnected: true,
      wheelChocksLocked: true,
      fuelOdometerLogged: true,
      fourSidePhotosTaken: true,
      zeroScratchSigned: true
    },
    odometerKm: '24,580 km',
    fuelLevel: '50% (Half Tank)',
    transitWaypoints: [
      { point: 'Ahmedabad Dispatch Hub', time: '06:00 AM', status: 'Departed' },
      { point: 'Vadodara Highway Toll', time: '08:30 AM', status: 'Passed' },
      { point: 'Surat Bypass Rest Halt', time: '12:00 PM', status: 'Active' },
      { point: 'Thane Destination Hub', time: '05:30 PM (Est.)', status: 'Pending' }
    ]
  },
  {
    id: 'REL-JOB-102',
    type: 'scrap-removal',
    title: 'Pre-Move Scrap & Bulk Declutter Removal',
    customer: 'Sunita Narang',
    phone: '+91 98980 44556',
    origin: 'Villa 14, Sterling City, Bopal',
    destination: 'GreenCycle Eco-Salvage Plant, GIDC',
    distanceKm: 28,
    currentStage: 1,
    payout: 1200,
    stages: [
      { num: 1, label: 'Inventory Weighed & Dismantled' },
      { num: 2, label: 'Truck Loading & Broom Clean' },
      { num: 3, label: 'Salvage Credit Settlement' }
    ],
    inventoryList: [
      { item: 'Old Wooden Double Bed Frame (Dismantled)', weightKg: 65, salvageRate: 0 },
      { item: 'Damaged Iron Grills & Pipes', weightKg: 42, salvageRate: 28 }, // ₹1176 credit
      { item: 'Obsolete CRT Monitor & Tangled E-Waste', weightKg: 18, salvageRate: 15 } // ₹270 credit
    ],
    inspectionChecks: {
      powerToolsDismantlingDone: true,
      digitalWeighingVerified: true,
      elevatorWeightSafetyChecked: true,
      postPickupBroomCleanDone: false
    }
  }
];

const WorkerRelocation = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_RELOCATION_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_RELOCATION_JOBS[0].id);
  const [toastMsg, setToastMsg] = useState('');

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const advanceStage = (jobId) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const next = j.currentStage < 3 ? j.currentStage + 1 : 3;
      return { ...j, currentStage: next };
    }));
    showToast('Workflow advanced to next operational stage!');
  };

  const toggleCheck = (jobId, key) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        inspectionChecks: {
          ...j.inspectionChecks,
          [key]: !j.inspectionChecks[key]
        }
      };
    }));
    showToast('Audit checklist updated in cloud registry.');
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', padding: '20px 20px 100px', background: '#f8fafc' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: 'var(--navy-900)',
          color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <HiOutlineCheckCircle color="#38bdf8" size={20} /> {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        color: 'white', borderRadius: '24px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.25)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <HiOutlineTruck size={16} /> Specialized Relocation & Logistics Operations
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Packers & Vehicle Transport Commander
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', maxWidth: '640px' }}>
            Manage container dispatch, 360° vehicle dent audits, hydraulic ramp loading, and post-move broom-clean signoffs.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <WorkerDutySwitch dutyStatus={dutyStatus} onUpdateDuty={updateDuty} compact />
        </div>
      </div>

      {/* Main Two-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left: Active Jobs List */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
            Assigned Relocation Work Orders ({jobs.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {jobs.map(job => {
              const isSelected = job.id === selectedJobId;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(37, 99, 235, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px' }}>
                      {job.id} • {job.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>
                      Stage {job.currentStage} of 3
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 6px' }}>
                    {job.title}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>📍 <strong>From:</strong> {job.origin}</div>
                    <div>🎯 <strong>To:</strong> {job.destination} ({job.distanceKm} km)</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>👤 {job.customer}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>₹{job.payout}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Operational Workflow Cockpit */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          
          {/* Stage Progress Bar */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '10px' }}>
                Active Workflow • {currentJob.id}
              </span>
              <a href={`tel:${currentJob.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', textDecoration: 'none' }}>
                <HiOutlinePhone /> Call Customer
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {currentJob.stages.map(s => {
                const done = currentJob.currentStage > s.num;
                const active = currentJob.currentStage === s.num;
                return (
                  <div key={s.num} style={{ textAlign: 'center' }}>
                    <div style={{
                      height: '6px', borderRadius: '4px',
                      background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
                      marginBottom: '6px'
                    }}></div>
                    <div style={{ fontSize: '0.72rem', fontWeight: active ? 800 : 600, color: active ? '#1e293b' : '#94a3b8' }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE 1: INSPECTION & LOADING */}
          {currentJob.currentStage === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 1: Pre-Dispatch Inspection & Safety Loading
              </h4>

              {currentJob.vehicleModel && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--navy-900)', marginBottom: '4px' }}>
                    🚘 Vehicle: {currentJob.vehicleModel} ({currentJob.plateNumber})
                  </div>
                  <div style={{ color: '#475569', display: 'flex', gap: '16px' }}>
                    <span>Odometer: <strong>{currentJob.odometerKm}</strong></span>
                    <span>Fuel: <strong>{currentJob.fuelLevel}</strong></span>
                  </div>
                </div>
              )}

              {/* Digital Checkpoints */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534', marginBottom: '8px' }}>
                  Digital Safety Checkpoints:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  {Object.keys(currentJob.inspectionChecks).map(k => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentJob.inspectionChecks[k]}
                        onChange={() => toggleCheck(currentJob.id, k)}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scrap details if scrap job */}
              {currentJob.inventoryList && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e', marginBottom: '6px' }}>
                    ♻️ Declutter Weighed Inventory:
                  </div>
                  {currentJob.inventoryList.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid #fef3c7' }}>
                      <span>{item.item}</span>
                      <strong>{item.weightKg} kg {item.salvageRate > 0 ? `(@ ₹${item.salvageRate}/kg)` : '(Junk)'}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: IN-TRANSIT TRACKING */}
          {currentJob.currentStage === 2 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 2: Live GPS Transit & Highway Checkpoints
              </h4>

              {currentJob.transitWaypoints && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {currentJob.transitWaypoints.map((wp, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '0.82rem' }}>
                      <div>
                        <strong>{wp.point}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Scheduled: {wp.time}</div>
                      </div>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                        background: wp.status === 'Passed' || wp.status === 'Departed' ? '#dcfce7' : wp.status === 'Active' ? '#fef3c7' : '#f1f5f9',
                        color: wp.status === 'Passed' || wp.status === 'Departed' ? '#15803d' : wp.status === 'Active' ? '#b45309' : '#64748b'
                      }}>
                        {wp.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: UNLOADING & HANDOVER */}
          {currentJob.currentStage === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 3: Destination Unloading & Broom-Clean Signoff
              </h4>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  ✓ Destination Safe Delivery Checklist
                </div>
                <div style={{ color: '#14532d', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  1. Ramps deployed with wheel stops.<br/>
                  2. Vehicle / inventory physically inspected with customer.<br/>
                  3. Floor swept clean with zero packing debris left behind.<br/>
                  4. Digital signoff OTP verified with client.
                </div>
              </div>
            </div>
          )}

          {/* Stage Action Button */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Guaranteed Payout</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{currentJob.payout}</div>
            </div>

            <button
              type="button"
              onClick={() => advanceStage(currentJob.id)}
              style={{
                background: currentJob.currentStage === 3 ? '#16a34a' : '#2563eb',
                color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {currentJob.currentStage === 1 ? <>Complete Loading & Start Transit <HiOutlineArrowRight /></> :
               currentJob.currentStage === 2 ? <>Arrived at Destination <HiOutlineCheckCircle /></> :
               <>Submit Proof & Complete Order ✓</>}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerRelocation;
