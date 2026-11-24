import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineXMark,
  HiStar,
  HiOutlineShieldCheck,
  HiOutlineQrCode,
  HiOutlinePhone,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';
import Pagination from '../../components/Pagination';

const PRE_SEEDED_HISTORY = [
  // Upcoming
  { id: 'SRV-201', service: 'Deep Cleaning (Common Areas & Lobby)', tower: 'Tower A', date: '22 Jul 2026', time: '09:00 AM', status: 'confirmed', workers: 4, vendor: 'ServeCircle Verified Fleet', cost: 4500, rating: 0, notes: 'Bring industrial scrubber; Gate 2 entry', gatePassPin: '7291', leadName: 'Mahesh Sharma' },
  { id: 'SRV-202', service: 'Basement & Drain Fogging (Pest Control)', tower: 'All Towers', date: '25 Jul 2026', time: '07:00 AM', status: 'confirmed', workers: 6, vendor: 'ServeCircle Verified Fleet', cost: 1800, rating: 0, notes: 'Basement B1/B2 focus', gatePassPin: '4183', leadName: 'Deepak Verma' },
  { id: 'SRV-203', service: 'Central Garden Lawn Mowing & Pruning', tower: 'Common Area', date: '28 Jul 2026', time: '06:30 AM', status: 'pending', workers: 3, vendor: 'ServeCircle Verified Fleet', cost: 2500, rating: 0, notes: 'Bring hedge trimmer', gatePassPin: '8392', leadName: 'Ramesh Mali' },
  { id: 'SRV-204', service: 'Water Tank High-Pressure Disinfection', tower: 'Tower B & D', date: '01 Aug 2026', time: '05:00 AM', status: 'pending', workers: 5, vendor: 'ServeCircle Verified Fleet', cost: 8000, rating: 0, notes: 'Drain tanks previous night', gatePassPin: '5521', leadName: 'Karan Patel' },
  { id: 'SRV-205', service: 'Elevator Shaft Inspection & Governor AMC', tower: 'Tower C', date: '03 Aug 2026', time: '10:00 AM', status: 'confirmed', workers: 2, vendor: 'ServeCircle Verified Fleet', cost: 4500, rating: 0, notes: 'Routine safety checkup', gatePassPin: '9184', leadName: 'Sunil Rao' },
  // Past
  { id: 'SRV-199', service: 'Water Pump & Borewell Motor Repair', tower: 'Tower A', date: '15 Jul 2026', time: '02:00 PM', status: 'completed', workers: 2, vendor: 'ServeCircle Verified Fleet', cost: 3500, rating: 5, notes: 'Replaced bearing set' },
  { id: 'SRV-198', service: 'Campus Fire Hydrant & Pressure Audit', tower: 'All Towers', date: '10 Jul 2026', time: '10:00 AM', status: 'completed', workers: 4, vendor: 'ServeCircle Verified Fleet', cost: 3500, rating: 4, notes: 'Audit passed successfully' },
  { id: 'SRV-197', service: 'Main Riser Leakage Repair', tower: 'Tower D', date: '05 Jul 2026', time: '11:30 AM', status: 'completed', workers: 1, vendor: 'ServeCircle Verified Fleet', cost: 1200, rating: 5, notes: 'Replaced joint collar' },
  { id: 'SRV-196', service: 'Clubhouse Central AC Servicing', tower: 'Clubhouse', date: '01 Jul 2026', time: '09:00 AM', status: 'completed', workers: 2, vendor: 'ServeCircle Verified Fleet', cost: 4500, rating: 4, notes: 'Filter cleaned and gas top-up' },
  { id: 'SRV-195', service: 'Subterranean Termite Treatment', tower: 'Basement', date: '20 Jun 2026', time: '11:00 AM', status: 'completed', workers: 3, vendor: 'ServeCircle Verified Fleet', cost: 5500, rating: 5, notes: 'Injected chemical barrier' },
];

const STEP_LABELS = ['Placed', 'Assigned', 'En Route', 'At Gate', 'In Progress', 'Completed'];

const B2BClientHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedJob, setSelectedJob] = useState(null);
  const [gatePassJob, setGatePassJob] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const loadHistoryData = () => {
    let localOrders = [];
    try {
      const raw = localStorage.getItem('b2bWorkOrders');
      if (raw) localOrders = JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading b2bWorkOrders:', e);
    }
    // Merge local orders on top of pre-seeded history
    const merged = [...localOrders];
    PRE_SEEDED_HISTORY.forEach(item => {
      if (!merged.some(m => m.id === item.id)) {
        merged.push(item);
      }
    });
    setHistory(merged);
  };

  useEffect(() => {
    loadHistoryData();

    const handleUpdate = () => loadHistoryData();
    window.addEventListener('servecircle:b2b-status-updated', handleUpdate);
    window.addEventListener('servecircle:b2b-booking-created', handleUpdate);

    return () => {
      window.removeEventListener('servecircle:b2b-status-updated', handleUpdate);
      window.removeEventListener('servecircle:b2b-booking-created', handleUpdate);
    };
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(j =>
      tab === 'upcoming'
        ? ['pending', 'assigned', 'confirmed', 'en-route', 'arrived', 'started', 'in_progress'].includes(j.status)
        : ['completed', 'cancelled'].includes(j.status)
    );
  }, [history, tab]);

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'confirmed': return 1;
      case 'en-route': return 2;
      case 'arrived': return 3;
      case 'started':
      case 'in_progress': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#dcfce7', color: '#166534', label: 'Completed' };
      case 'started':
      case 'in_progress':
        return { bg: '#eff6ff', color: '#1e40af', label: 'Work In Progress' };
      case 'arrived':
        return { bg: '#fdf4ff', color: '#86198f', label: 'At Society Gate' };
      case 'en-route':
        return { bg: '#cffafe', color: '#0e7490', label: 'En Route' };
      case 'confirmed':
      case 'assigned':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'Team Assigned' };
      case 'cancelled':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' };
      default:
        return { bg: '#fef9c3', color: '#854d0e', label: 'Pending Dispatch' };
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.history.title', 'Society Work Orders & History')}</h1>
          <p className="page-subtitle">{t('b2bClient.history.subtitle', 'Live tracking, gate passes, technician check-in, and past completed service records.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/b2b/services')}>
          + Book New Work Order
        </button>
      </div>

      <div className="tabs-bar">
        <button
          className={`tab-btn ${tab === 'upcoming' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setTab('upcoming');
            setCurrentPage(1);
          }}
        >
          Active & Upcoming Schedule ({history.filter(j => ['pending', 'assigned', 'confirmed', 'en-route', 'arrived', 'started', 'in_progress'].includes(j.status)).length})
        </button>
        <button
          className={`tab-btn ${tab === 'past' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setTab('past');
            setCurrentPage(1);
          }}
        >
          Completed Records ({history.filter(j => ['completed', 'cancelled'].includes(j.status)).length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {filteredHistory
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((job) => {
            const badge = statusBadge(job.status);
            return (
              <div
                key={job.id}
                className="b2b-card hover-lift"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: job.urgency?.includes('Emergency') ? '4px solid #ef4444' : undefined,
                }}
                onClick={() => setSelectedJob(job)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{job.id}</div>
                      <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '4px 0 0 0', lineHeight: 1.35 }}>{job.service}</h3>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiOutlineMapPin style={{ color: '#2563eb' }} />
                      <span>{job.tower || 'Central Society Campus'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiOutlineCalendarDays style={{ color: '#2563eb' }} />
                      <span>{job.date} &middot; {job.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiOutlineUserGroup style={{ color: '#16a34a' }} />
                      <span>Team: <strong>{job.workers || 4} Verified Pros</strong> {job.leadName ? `(Lead: ${job.leadName})` : ''}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Fee: </span>
                      <strong style={{ color: '#1e40af', fontSize: '1.1rem' }}>
                        {job.amount || job.cost ? `₹${(job.amount || job.cost).toLocaleString('en-IN')}` : 'AMC Covered'}
                      </strong>
                    </div>

                    {tab === 'past' && (
                      <div style={{ display: 'flex', color: '#eab308', fontSize: '1rem' }}>
                        {[...Array(job.rating || 5)].map((_, i) => <HiStar key={i} />)}
                      </div>
                    )}
                  </div>

                  {tab === 'upcoming' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1.2, padding: '8px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setGatePassJob(job);
                        }}
                      >
                        <HiOutlineQrCode /> Security Gate PIN
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                        }}
                      >
                        Live Tracking
                      </button>
                    </div>
                  )}

                  {tab === 'past' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/b2b/invoices');
                        }}
                      >
                        <HiOutlinePrinter /> View Society Invoice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {filteredHistory.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredHistory.length}
            pageSize={pageSize}
            pageSizeOptions={[6, 12, 24]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemName="orders"
          />
        </div>
      )}

      {filteredHistory.length === 0 && (
        <div className="b2b-card" style={{ textAlign: 'center', padding: '48px 20px', marginTop: '24px', color: '#64748b' }}>
          <HiOutlineClock style={{ fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No {tab} work orders found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Book scheduled maintenance or ad-hoc repairs for your society campus.</p>
          <button className="btn btn-primary" onClick={() => navigate('/b2b/services')}>
            Explore B2B Services Catalog
          </button>
        </div>
      )}

      {/* ── Security Gate Pass Modal ────────────────────────────────────────── */}
      {gatePassJob && (
        <div className="b2b-modal-overlay">
          <div className="b2b-modal-content" style={{ maxWidth: '480px' }}>
            <button className="b2b-modal-close" onClick={() => setGatePassJob(null)}>
              <HiOutlineXMark />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 10px',
                }}
              >
                <HiOutlineShieldCheck />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                Society Security Gate Pass
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Green Valley Society &middot; RWA Entry Permit
              </span>
            </div>

            {/* PIN Card */}
            <div
              style={{
                background: '#f0fdf4',
                border: '2px dashed #22c55e',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gate Entry Verification PIN
              </span>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '12px', color: '#166534', margin: '8px 0' }}>
                {gatePassJob.gatePassPin || '5821'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0 }}>
                Share this PIN with the security guard at Gate 1 or Gate 2 to allow entry.
              </p>
            </div>

            {/* Team Details */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Work Order:</span>
                <strong>{gatePassJob.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Service:</span>
                <strong style={{ color: '#1e40af' }}>{gatePassJob.service}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Designated Wing:</span>
                <strong>{gatePassJob.tower || 'All Towers'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Assigned Fleet Lead:</span>
                <strong>{gatePassJob.leadName || 'Mahesh Sharma'} (ID: #SC-9412)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Authorized Team Size:</span>
                <strong>{gatePassJob.workers || 4} Badge-Verified Pros</strong>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => {
                const pin = gatePassJob.gatePassPin || '5821';
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(`ServeCircle Security Entry PIN: ${pin} | Work Order: ${gatePassJob.id} | Service: ${gatePassJob.service}`);
                }
                showToast(`Security Gate Entry PIN [${pin}] copied & dispatched to Society Guard Desk!`);
                setGatePassJob(null);
              }}
            >
              Confirm Entry with Guard Desk
            </button>
          </div>
        </div>
      )}

      {/* ── Live Stepper Tracking & Details Modal ────────────────────────────── */}
      {selectedJob && (
        <div className="b2b-modal-overlay">
          <div className="b2b-modal-content" style={{ maxWidth: '520px' }}>
            <button className="b2b-modal-close" onClick={() => setSelectedJob(null)}>
              <HiOutlineXMark />
            </button>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
              Work Order Tracking
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 16px 0' }}>
              {selectedJob.service}
            </h2>

            {/* Stepper */}
            <div className="b2b-stepper">
              <div className="b2b-stepper-line"></div>
              <div
                className="b2b-stepper-line-active"
                style={{ width: `${(getStepIndex(selectedJob.status) / (STEP_LABELS.length - 1)) * 100}%` }}
              ></div>
              {STEP_LABELS.map((step, idx) => {
                const currentIdx = getStepIndex(selectedJob.status);
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div
                    key={step}
                    className={`b2b-step-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="b2b-step-circle">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className="b2b-step-label">{step}</span>
                  </div>
                );
              })}
            </div>

            {/* OTP Verification Info */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', margin: '16px 0', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Job Start Verification Code:</span>
                  <strong style={{ fontSize: '1.15rem', color: '#991b1b', letterSpacing: '3px' }}>
                    {selectedJob.startOtp || '8492'}
                  </strong>
                </div>
                <div style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Job End Completion OTP:</span>
                  <strong style={{ fontSize: '1.15rem', color: '#166534', letterSpacing: '3px' }}>
                    {selectedJob.endOtp || '3751'}
                  </strong>
                </div>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '10px', marginBottom: 0 }}>
                Share Start OTP with the lead technician upon arrival, and End OTP after society committee inspection.
              </p>
            </div>

            {/* Specifications Summary */}
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem', color: '#334155', marginBottom: '20px' }}>
              <div><strong>Society Campus:</strong> Green Valley Society</div>
              <div><strong>Target Area:</strong> {selectedJob.tower}</div>
              <div><strong>Scheduled Shift:</strong> {selectedJob.date} at {selectedJob.time}</div>
              <div><strong>Deployment:</strong> {selectedJob.workers || 4} Certified Technicians</div>
              <div><strong>Assigned Lead:</strong> {selectedJob.leadName || 'Mahesh Sharma'} (+91 98250 11234)</div>
              <div><strong>Estimated Cost:</strong> <span style={{ color: '#1e40af', fontWeight: 800 }}>₹{(selectedJob.amount || selectedJob.cost || 2500).toLocaleString('en-IN')}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => {
                  setSelectedJob(null);
                  setGatePassJob(selectedJob);
                }}
              >
                Security Gate Pass
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => {
                  setSelectedJob(null);
                  navigate('/b2b/invoices');
                }}
              >
                View Society Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          maxWidth: '420px',
        }}>
          <HiOutlineCheckCircle style={{ color: '#22c55e', fontSize: '1.4rem', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default B2BClientHistory;
