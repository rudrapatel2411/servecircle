import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePlusCircle,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const availableLocations = [
  'Block A - Green Valley',
  'Block B - Green Valley',
  'Block C - Green Valley',
  'Club House',
  'TechPark Tower 1',
];

const initialContracts = [
  {
    id: 'CON-1001',
    name: 'Green Valley Society',
    type: 'Monthly Cleaning',
    value: 25000,
    locations: 4,
    startDate: '01 Jan 2026',
    endDate: '31 Dec 2026',
    status: 'active',
  },
  {
    id: 'CON-1002',
    name: 'TechPark Offices',
    type: 'Quarterly Maintenance',
    value: 20000,
    locations: 2,
    startDate: '01 Apr 2026',
    endDate: '31 Mar 2027',
    status: 'renewal_due',
  },
  {
    id: 'CON-1003',
    name: 'Sunrise Residency',
    type: 'Annual Package',
    value: 89000,
    locations: 6,
    startDate: '10 Feb 2026',
    endDate: '09 Feb 2027',
    status: 'active',
  },
];

const B2BBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    service: 'Deep Cleaning',
    contractType: 'one-time',
    scheduleType: 'weekly',
    preferredDate: '',
    preferredTime: '',
    quantity: 1,
    notes: '',
  });
  const [selectedLocations, setSelectedLocations] = useState([availableLocations[0]]);
  const [localContracts, setLocalContracts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('b2bContracts');
    if (saved) {
      setLocalContracts(JSON.parse(saved));
    } else {
      localStorage.setItem('b2bContracts', JSON.stringify(initialContracts));
      setLocalContracts(initialContracts);
    }
  }, []);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleLocation = (location) => {
    setSelectedLocations((current) => (
      current.includes(location)
        ? current.filter((item) => item !== location)
        : [...current, location]
    ));
  };

  const estimatedCost = useMemo(() => {
    const base = form.service === 'Deep Cleaning' ? 1200 : form.service === 'Pest Control' ? 900 : 700;
    const multiplier = form.scheduleType === 'monthly' ? 3.2 : form.scheduleType === 'weekly' ? 1 : 0.3;
    return Math.round(base * selectedLocations.length * multiplier * form.quantity);
  }, [form, selectedLocations]);

  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleSubmit = () => {
    if (selectedLocations.length === 0) {
      setErrorMsg('Please select at least one campus block or building location');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    setIsSubmitting(true);
    
    // Create new bulk request/contract object
    const requestId = `BB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest = {
      id: requestId,
      name: `Bulk Request - ${form.service}`,
      type: form.service,
      value: estimatedCost,
      locations: selectedLocations.length,
      startDate: form.preferredDate || new Date().toISOString().split('T')[0],
      endDate: form.preferredDate || new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const updatedContracts = [newRequest, ...localContracts];
    setLocalContracts(updatedContracts);
    localStorage.setItem('b2bContracts', JSON.stringify(updatedContracts));

    // Also dispatch to b2bWorkOrders so Worker Panel and B2B History see it immediately
    try {
      const existingRaw = localStorage.getItem('b2bWorkOrders');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const newWorkOrder = {
        id: `SC-B2B-${Math.floor(1000 + Math.random() * 9000)}`,
        service: `Bulk ${form.service} (${selectedLocations.length} Wings)`,
        tower: selectedLocations.join(', '),
        date: form.preferredDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: form.preferredTime || '09:00 AM',
        status: 'pending',
        workers: Math.max(3, selectedLocations.length * 2),
        vendor: 'ServeCircle Verified Fleet',
        amount: estimatedCost,
        cost: estimatedCost,
        leadName: 'Mahesh Sharma',
        gatePassPin: Math.floor(1000 + Math.random() * 9000).toString(),
        startOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        endOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        notes: `Bulk order for ${selectedLocations.length} locations. Schedule: ${form.scheduleType || 'One-time'}.`,
        societyName: 'Green Valley Society',
        isB2B: true,
      };
      const updatedOrders = [newWorkOrder, ...existing];
      localStorage.setItem('b2bWorkOrders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('servecircle:b2b-booking-created', { detail: newWorkOrder }));
    } catch (e) {
      console.warn('Error saving to b2bWorkOrders:', e);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Bulk work order submitted! Dispatched to Fleet Operations.');
      setTimeout(() => navigate('/b2b/history'), 1200);
    }, 800);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.bookTitle', 'Bulk Booking')}</h1>
          <p className="page-subtitle">{t('b2bExtended.bookSubtitle', 'Create one request for multiple buildings or blocks.')}</p>
        </div>
      </div>

      <div className="b2b-two-col">
        <section className="b2b-card">
          <h3>{t('b2bExtended.createNew', 'Create New Bulk Request')}</h3>
          <div className="b2b-form-grid">
            <div className="input-group">
              <label>{t('b2bExtended.serviceType', 'Service Type')}</label>
              <select className="input-field" value={form.service} onChange={(event) => update('service', event.target.value)}>
                <option>Deep Cleaning</option>
                <option>Pest Control</option>
                <option>General Maintenance</option>
                <option>Emergency Support</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>{t('b2bExtended.contractType', 'Contract Type')}</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="contractType" value="one-time" checked={form.contractType === 'one-time'} onChange={(e) => update('contractType', e.target.value)} />
                  {t('b2bExtended.oneTime', 'One-time Bulk Booking')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="contractType" value="amc" checked={form.contractType === 'amc'} onChange={(e) => update('contractType', e.target.value)} />
                  {t('b2bExtended.amc', 'AMC (Annual Maintenance Contract)')}
                </label>
              </div>
            </div>
            {form.contractType === 'amc' && (
              <div className="input-group">
                <label>{t('b2bExtended.scheduleFreq', 'Schedule Frequency')}</label>
                <select className="input-field" value={form.scheduleType} onChange={(event) => update('scheduleType', event.target.value)}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            )}
            <div className="input-group">
              <label><HiOutlineCalendarDays style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.preferredDate', 'Preferred Date')}</label>
              <input className="input-field" type="date" value={form.preferredDate} onChange={(event) => update('preferredDate', event.target.value)} />
            </div>
            <div className="input-group">
              <label><HiOutlineClock style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.preferredTime', 'Preferred Time')}</label>
              <select className="input-field" value={form.preferredTime} onChange={(event) => update('preferredTime', event.target.value)}>
                <option value="" disabled>Select a slot</option>
                <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                <option value="Flexible (Anytime)">Flexible (Anytime)</option>
              </select>
            </div>
            <div className="input-group">
              <label>{t('b2bExtended.unitsCount', 'Units / Blocks Count')}</label>
              <input className="input-field" type="number" min="1" value={form.quantity} onChange={(event) => update('quantity', Number(event.target.value))} />
            </div>
            <div className="input-group">
              <label><HiOutlineMapPin style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.selectLocations', 'Select Locations')}</label>
              <div className="b2b-check-list">
                {availableLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    className={`b2b-check-item ${selectedLocations.includes(location) ? 'active' : ''}`}
                    onClick={() => toggleLocation(location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>{t('b2bExtended.requestNotes', 'Request Notes')}</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Any constraints, approvals, or service notes..."
                value={form.notes}
                onChange={(event) => update('notes', event.target.value)}
              />
            </div>
          </div>
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem', marginBottom: '14px', border: '1px solid #fca5a5' }}>
              {errorMsg}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            <HiOutlinePlusCircle /> {isSubmitting ? 'Submitting...' : t('b2bExtended.submitBulk', 'Submit Bulk Request')}
          </button>
        </section>

        <aside className="b2b-card">
          <h3>{t('b2bExtended.requestSummary', 'Request Summary')}</h3>
          <div className="confirm-summary">
            <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.service', 'Service')}</span><span className="confirm-value">{form.service}</span></div>
            <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.contract', 'Contract')}</span><span className="confirm-value">{form.contractType === 'amc' ? 'AMC' : 'One-time'}</span></div>
            {form.contractType === 'amc' && (
              <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.frequency', 'Frequency')}</span><span className="confirm-value">{form.scheduleType}</span></div>
            )}
            <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.locations', 'Locations')}</span><span className="confirm-value">{selectedLocations.length}</span></div>
            <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.units', 'Units')}</span><span className="confirm-value">{form.quantity}</span></div>
            <div className="confirm-row total"><span className="confirm-label">{t('b2bExtended.estMonthlyCost', 'Est. Monthly Cost')}</span><span className="confirm-value">Rs {estimatedCost.toLocaleString('en-IN')}</span></div>
          </div>
          <p className="page-subtitle">{t('b2bExtended.finalInvoiceNote', 'Final invoice depends on actual site scope and SLA approval.')}</p>
        </aside>
      </div>

      <div className="dash-section">
        <h3 className="dash-section-title">{t('b2bExtended.recentBulk', 'Recent Bulk Requests')}</h3>
        <div className="b2b-card">
          {localContracts.map((request) => (
            <div key={request.id} className="b2b-request-row">
              <div><strong>{request.id}</strong><div className="page-subtitle">{request.type}</div></div>
              <div>{request.locations} locations</div>
              <div>{request.startDate}</div>
              <div>
                <span className={`b2b-chip ${request.status}`}>{request.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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

export default B2BBooking;
