import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineXMark,
  HiStar,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const MOCK_HISTORY = [
  // Upcoming
  { id: 'SRV-201', service: 'Deep Cleaning (Common Areas)', tower: 'Tower A', date: '22 Jul 2026', time: '09:00 AM', status: 'confirmed', workers: 4, vendor: 'ServeCircle Partner', cost: 4500, rating: 0, notes: 'Bring extra scrubber' },
  { id: 'SRV-202', service: 'General Disinfestation', tower: 'All Towers', date: '25 Jul 2026', time: '07:00 AM', status: 'confirmed', workers: 6, vendor: 'Rentokil PCI', cost: 1800, rating: 0, notes: 'Focus on basement areas' },
  { id: 'SRV-203', service: 'Lawn Mowing & Care', tower: 'Common Area', date: '28 Jul 2026', time: '06:30 AM', status: 'pending', workers: 3, vendor: 'GreenScape Services', cost: 4500, rating: 0, notes: '' },
  { id: 'SRV-204', service: 'Water Tank Cleaning', tower: 'Tower B & D', date: '01 Aug 2026', time: '05:00 AM', status: 'pending', workers: 5, vendor: 'Aquatech Cleaning', cost: 15000, rating: 0, notes: 'Drain tanks previous night' },
  { id: 'SRV-205', service: 'Elevator Maintenance (AMC)', tower: 'Tower C', date: '03 Aug 2026', time: '10:00 AM', status: 'confirmed', workers: 2, vendor: 'Otis Elevator Co.', cost: 0, rating: 0, notes: 'AMC routine checkup' },
  // Past
  { id: 'SRV-199', service: 'Water Pump Repair', tower: 'Tower A', date: '15 Jul 2026', time: '02:00 PM', status: 'completed', workers: 2, vendor: 'ServeCircle Partner', cost: 3500, rating: 5, notes: 'Replaced bearings' },
  { id: 'SRV-198', service: 'Fire Safety Audit', tower: 'All Towers', date: '10 Jul 2026', time: '10:00 AM', status: 'completed', workers: 4, vendor: 'SafeFire India', cost: 35000, rating: 4, notes: 'Audit passed successfully' },
  { id: 'SRV-197', service: 'Plumbing Services', tower: 'Tower D', date: '05 Jul 2026', time: '11:30 AM', status: 'completed', workers: 1, vendor: 'ServeCircle Partner', cost: 800, rating: 5, notes: 'Fixed lobby leakage' },
  { id: 'SRV-196', service: 'AC Servicing (Split/Window)', tower: 'Clubhouse', date: '01 Jul 2026', time: '09:00 AM', status: 'completed', workers: 2, vendor: 'ServeCircle Partner', cost: 2400, rating: 3, notes: 'Gas refilled in 2 units' },
  { id: 'SRV-195', service: 'Termite Treatment', tower: 'Basement', date: '20 Jun 2026', time: '11:00 AM', status: 'completed', workers: 3, vendor: 'Rentokil PCI', cost: 5500, rating: 5, notes: 'Injected chemicals in pillars' },
];

const B2BClientHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [tab, setTab] = useState('upcoming');
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredHistory = useMemo(() => {
    return history.filter(j => 
      tab === 'upcoming' 
        ? ['confirmed', 'pending'].includes(j.status) 
        : ['completed', 'cancelled'].includes(j.status)
    );
  }, [history, tab]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.history.title')}</h1>
          <p className="page-subtitle">{t('b2bClient.history.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/b2b/services')}>
          {t('b2bClient.common.bookService')}
        </button>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn ${tab === 'upcoming' ? 'tab-btn-active' : ''}`} onClick={() => setTab('upcoming')}>
          {t('b2bClient.history.upcomingSchedule')} ({history.filter(j => ['confirmed', 'pending'].includes(j.status)).length})
        </button>
        <button className={`tab-btn ${tab === 'past' ? 'tab-btn-active' : ''}`} onClick={() => setTab('past')}>
          {t('b2bClient.history.pastServices')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {filteredHistory.map((job) => (
          <div
            key={job.id}
            className="b2b-card hover-lift"
            style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '18px' }}
            onClick={() => setSelectedJob(job)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '4px' }}>{job.id}</div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)' }}>{job.service}</h3>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                background: job.status === 'confirmed' || job.status === 'completed' ? '#dcfce7' : job.status === 'pending' ? '#fef9c3' : '#fee2e2',
                color: job.status === 'confirmed' || job.status === 'completed' ? '#166534' : job.status === 'pending' ? '#854d0e' : '#991b1b',
              }}>
                {t(`b2bClient.common.${job.status}`)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '12px' }}>
              <div><HiOutlineCalendarDays style={{ verticalAlign: 'middle', marginRight: '4px' }}/> {job.date} &middot; {job.time}</div>
              <div><HiOutlineMapPin style={{ verticalAlign: 'middle', marginRight: '4px' }}/> {job.tower}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)' }}>
                <strong>{t('b2bClient.history.cost')}:</strong> {job.cost > 0 ? `${t('b2bClient.common.rupees')}${job.cost}` : 'Covered in AMC'}
              </div>
              {tab === 'past' && job.rating > 0 && (
                <div style={{ display: 'flex', color: '#eab308', fontSize: '1rem' }}>
                  {[...Array(job.rating)].map((_, i) => <HiStar key={i} />)}
                </div>
              )}
            </div>

            {tab === 'upcoming' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: '6px 0', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); alert(t('b2bClient.history.rescheduleMsg')); }}>
                  {t('b2bClient.history.rescheduleBtn')}
                </button>
                <button className="btn btn-outline" style={{ flex: 1, padding: '6px 0', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5' }} onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    setHistory(prev => prev.map(j => j.id === job.id ? { ...j, status: 'cancelled' } : j));
                    alert(t('b2bClient.history.cancelMsg'));
                  }
                }}>
                  {t('b2bClient.history.cancelBtn')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
          No {tab} services found.
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px',
            position: 'relative',
          }}>
            <button onClick={() => setSelectedJob(null)} style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--gray-400)'
            }}>
              <HiOutlineXMark />
            </button>

            <h2 style={{ fontSize: '1.3rem', color: 'var(--navy-800)', marginBottom: '16px' }}>{t('b2bClient.history.detail.serviceDetails')}</h2>
            
            <div style={{ display: 'grid', gap: '12px', fontSize: '0.9rem' }}>
              <div><strong>{t('b2bClient.history.detail.bookingId')}:</strong> {selectedJob.id}</div>
              <div><strong>{t('b2bClient.invoices.service')}:</strong> {selectedJob.service}</div>
              <div><strong>{t('b2bClient.common.vendor')}:</strong> {selectedJob.vendor}</div>
              <div><strong>{t('b2bClient.locations.addForm.towerBuilding')}:</strong> {selectedJob.tower}</div>
              <div><strong>{t('b2bClient.common.date')}:</strong> {selectedJob.date} at {selectedJob.time}</div>
              <div><strong>{t('b2bClient.history.detail.teamAssigned')}:</strong> {selectedJob.workers} {t('b2bClient.history.workers')}</div>
              <div><strong>{t('b2bClient.history.cost')}:</strong> <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{selectedJob.cost > 0 ? `${t('b2bClient.common.rupees')}${selectedJob.cost}` : 'AMC Covered'}</span></div>
              {selectedJob.notes && <div><strong>{t('b2bClient.history.detail.jobNotes')}:</strong> {selectedJob.notes}</div>}
              <div>
                <strong>{t('b2bClient.common.status')}:</strong>{' '}
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                  background: selectedJob.status === 'confirmed' || selectedJob.status === 'completed' ? '#dcfce7' : selectedJob.status === 'pending' ? '#fef9c3' : '#fee2e2',
                  color: selectedJob.status === 'confirmed' || selectedJob.status === 'completed' ? '#166534' : selectedJob.status === 'pending' ? '#854d0e' : '#991b1b',
                }}>
                  {t(`b2bClient.common.${selectedJob.status}`)}
                </span>
              </div>
            </div>

            {selectedJob.status === 'completed' && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => { setSelectedJob(null); navigate('/b2b/services'); }}>
                {t('b2bClient.history.detail.rebookBtn')}
              </button>
            )}
            {['confirmed', 'pending'].includes(selectedJob.status) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
                <button className="btn btn-outline" onClick={() => { alert(t('b2bClient.history.rescheduleMsg')); setSelectedJob(null); }}>
                  {t('b2bClient.history.rescheduleBtn')}
                </button>
                <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => {
                  if (window.confirm('Cancel this booking?')) {
                    setHistory(prev => prev.map(j => j.id === selectedJob.id ? { ...j, status: 'cancelled' } : j));
                    alert(t('b2bClient.history.cancelMsg'));
                    setSelectedJob(null);
                  }
                }}>
                  {t('b2bClient.history.cancelBtn')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BClientHistory;
