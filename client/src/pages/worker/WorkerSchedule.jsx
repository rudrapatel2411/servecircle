import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlinePlusCircle,
  HiOutlineSparkles,
  HiOutlineSun,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs } from './workerApi';
import { formatDate, isSameDay } from './workerHelpers';
import '../Dashboard.css';
import './WorkerPages.css';

const DEFAULT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ALL_DAYS = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
  { key: 'Sun', label: 'Sunday' },
];

const LEAVE_REASONS = [
  { value: 'Personal Rest / Aaram', label: 'Personal Rest / Day Off' },
  { value: 'Medical / Health Checkup', label: 'Medical / Health Checkup' },
  { value: 'Family Function / Shaadi', label: 'Family Event / Wedding' },
  { value: 'Vehicle / Bike Maintenance', label: 'Vehicle Service / Maintenance' },
];

const WorkerSchedule = () => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated, signIn, authError, authLoading, workerStatus } = useWorkerAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Weekly availability planner state (Feature 11)
  const [workingDays, setWorkingDays] = useState(() => {
    try {
      const saved = localStorage.getItem('servecircle_worker_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.workingDays)) return parsed.workingDays;
      }
    } catch {
      // ignore
    }
    return DEFAULT_DAYS;
  });

  const [shiftStart, setShiftStart] = useState(() => {
    try {
      const saved = localStorage.getItem('servecircle_worker_schedule');
      if (saved) return JSON.parse(saved).shiftStart || '09:00';
    } catch {}
    return '09:00';
  });

  const [shiftEnd, setShiftEnd] = useState(() => {
    try {
      const saved = localStorage.getItem('servecircle_worker_schedule');
      if (saved) return JSON.parse(saved).shiftEnd || '19:00';
    } catch {}
    return '19:00';
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem('servecircle_worker_leaves');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      { id: 'leave-1', date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], reason: 'Family Function / Shaadi' }
    ];
  });

  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState(LEAVE_REASONS[0].value);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const toggleDay = (dayKey) => {
    setWorkingDays((prev) => {
      const exists = prev.includes(dayKey);
      const updated = exists ? prev.filter((d) => d !== dayKey) : [...prev, dayKey];
      saveSchedule(updated, shiftStart, shiftEnd);
      return updated;
    });
  };

  const saveSchedule = (days = workingDays, start = shiftStart, end = shiftEnd) => {
    try {
      localStorage.setItem('servecircle_worker_schedule', JSON.stringify({
        workingDays: days,
        shiftStart: start,
        shiftEnd: end,
        updatedAt: new Date().toISOString()
      }));
      showToast('Weekly Shift & Availability Saved Successfully! ✅');
    } catch {
      // ignore
    }
  };

  const handleAddLeave = (e) => {
    e.preventDefault();
    if (!newLeaveDate) {
      alert('Please select a date for the planned leave.');
      return;
    }
    const newEntry = {
      id: `leave-${Date.now()}`,
      date: newLeaveDate,
      reason: newLeaveReason,
    };
    const updated = [...leaves, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    setLeaves(updated);
    localStorage.setItem('servecircle_worker_leaves', JSON.stringify(updated));
    setNewLeaveDate('');
    showToast('Leave recorded! New jobs will be paused on this date. 📅');
  };

  const handleRemoveLeave = (id) => {
    const updated = leaves.filter((l) => l.id !== id);
    setLeaves(updated);
    localStorage.setItem('servecircle_worker_leaves', JSON.stringify(updated));
    showToast('Leave cancelled.');
  };

  const loadSchedule = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorkerJobs(token);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const upcomingJobs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return jobs
      .filter((job) => ['pending', 'confirmed', 'active', 'accepted', 'en-route', 'arrived', 'started'].includes(job.status))
      .filter((job) => new Date(job.scheduledDate) >= today)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }, [jobs]);

  const todayJobs = useMemo(
    () => upcomingJobs.filter((job) => isSameDay(job.scheduledDate)),
    [upcomingJobs]
  );

  const monthlyCompleted = useMemo(() => {
    const now = new Date();
    return jobs.filter((job) => {
      if (job.status !== 'completed') return false;
      const date = new Date(job.scheduledDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [jobs]);

  const groupedByDate = useMemo(() => {
    return upcomingJobs.reduce((acc, job) => {
      const key = formatDate(job.scheduledDate);
      if (!acc[key]) acc[key] = [];
      acc[key].push(job);
      return acc;
    }, {});
  }, [upcomingJobs]);

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} currentUser={user} workerStatus={workerStatus} />;
  }

  return (
    <div className="page-content worker-page-content" style={{ paddingBottom: '90px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sc-toast success">
          <HiOutlineCheckCircle style={{ fontSize: '1.25rem', color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.mySchedule')} 📅</h1>
          <p className="page-subtitle">Configure working days, duty shift hours, planned leaves, and upcoming appointments.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <HiOutlineCalendarDays />
          </div>
          <div>
            <div className="stat-value">{todayJobs.length}</div>
            <div className="stat-label">Jobs Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <HiOutlineClock />
          </div>
          <div>
            <div className="stat-value">{upcomingJobs.length}</div>
            <div className="stat-label">Upcoming Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <HiOutlineSun />
          </div>
          <div>
            <div className="stat-value">{workingDays.length} Days/wk</div>
            <div className="stat-label">Active Work Days</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <HiOutlineCalendarDays />
          </div>
          <div>
            <div className="stat-value">{leaves.length}</div>
            <div className="stat-label">Planned Leaves</div>
          </div>
        </div>
      </div>

      {/* ===== FEATURE 11: WEEKLY AVAILABILITY & SHIFT PLANNER ===== */}
      <div className="schedule-planner-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Weekly Working Days & Shifts
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Select the days and daily hours you are available for customer visits.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => saveSchedule()}
            style={{ fontSize: '0.85rem', padding: '8px 18px' }}
          >
            Save Shift Settings
          </button>
        </div>

        {/* Days of Week Toggle Grid */}
        <div className="days-selector-grid">
          {ALL_DAYS.map((day) => {
            const isActive = workingDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                className={`day-toggle-btn ${isActive ? 'active' : ''}`}
                onClick={() => toggleDay(day.key)}
              >
                <span>{day.key}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{isActive ? '✓ ON' : 'OFF'}</span>
              </button>
            );
          })}
        </div>

        {/* Shift Timings Selector */}
        <div className="shift-time-inputs" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineClock style={{ color: '#2563eb', fontSize: '1.2rem' }} />
            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>Daily Shift Hours:</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#64748b' }}>Start:</label>
            <input
              type="time"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#64748b' }}>End:</label>
            <input
              type="time"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setShiftStart('09:00'); setShiftEnd('19:00'); }}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Standard (9 AM - 7 PM)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setShiftStart('08:00'); setShiftEnd('14:00'); }}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Morning (8 AM - 2 PM)
            </button>
          </div>
        </div>
      </div>

      {/* ===== FEATURE 11: LEAVE / CHHUTTI PLANNER ===== */}
      <div className="schedule-planner-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Mark Leave / Chhutti 🏖️
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0' }}>
          Schedule personal days off in advance. ServeCircle will pause automatic dispatch for you on your leave days.
        </p>

        <form onSubmit={handleAddLeave} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Select Leave Date:
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={newLeaveDate}
              onChange={(e) => setNewLeaveDate(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              required
            />
          </div>
          <div style={{ flex: '1.5 1 240px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Reason for Leave:
            </label>
            <select
              value={newLeaveReason}
              onChange={(e) => setNewLeaveReason(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: 'white' }}
            >
              {LEAVE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <HiOutlinePlusCircle /> Add Leave Day
          </button>
        </form>

        {leaves.length > 0 ? (
          <div className="leave-items-container">
            {leaves.map((leave) => (
              <div key={leave.id} className="leave-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HiOutlineCalendarDays style={{ fontSize: '1.2rem', color: '#dc2626' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#991b1b' }}>{formatDate(leave.date)}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#7f1d1d', marginLeft: '12px' }}>({leave.reason})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLeave(leave.id)}
                  style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 700 }}
                  title="Remove this leave"
                >
                  <HiOutlineXMark /> Cancel
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
            No upcoming leaves scheduled. You are available on all selected working days.
          </div>
        )}
      </div>

      {/* ===== UPCOMING APPOINTMENTS CALENDAR ===== */}
      <div className="schedule-planner-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
          Customer Bookings Calendar 🗂️
        </h3>

        {error && (
          <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {loading && <div className="chart-placeholder">Loading schedule appointments...</div>}

        {!loading && upcomingJobs.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
            No upcoming customer jobs scheduled for future dates. Turn on Duty to receive new instant dispatches!
          </div>
        )}

        {!loading && Object.entries(groupedByDate).map(([dateKey, dateJobs]) => (
          <div key={dateKey} style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '6px' }}>
              {dateKey} ({dateJobs.length} jobs)
            </h4>
            {dateJobs.map((job) => (
              <div key={job._id} className="job-card" style={{ gridTemplateColumns: '1fr', padding: '16px 20px', marginBottom: '12px' }}>
                <div className="job-info">
                  <h4 style={{ fontSize: '1.05rem' }}>{job.service}</h4>
                  <div className="job-meta">
                    <span><HiOutlineClock /> {job.scheduledTime || 'Flexible'}</span>
                    <span><HiOutlineMapPin /> {job.address}</span>
                    <span className={`badge ${job.status === 'started' ? 'badge-primary' : job.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
};

export default WorkerSchedule;