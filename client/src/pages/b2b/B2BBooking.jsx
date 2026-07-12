import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePlusCircle,
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

const previousRequests = [
  { id: 'BB-7821', service: 'Deep Cleaning', locations: 4, date: '18 May 2026', status: 'pending' },
  { id: 'BB-7812', service: 'Pest Control', locations: 2, date: '11 May 2026', status: 'active' },
  { id: 'BB-7804', service: 'Lobby Maintenance', locations: 3, date: '03 May 2026', status: 'completed' },
];

const B2BBooking = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    service: 'Deep Cleaning',
    scheduleType: 'weekly',
    preferredDate: '',
    preferredTime: '',
    quantity: 1,
    notes: '',
  });
  const [selectedLocations, setSelectedLocations] = useState([availableLocations[0]]);

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
            <div className="input-group">
              <label>{t('b2bExtended.scheduleFreq', 'Schedule Frequency')}</label>
              <select className="input-field" value={form.scheduleType} onChange={(event) => update('scheduleType', event.target.value)}>
                <option value="one-time">One Time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="input-group">
              <label><HiOutlineCalendarDays style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.preferredDate', 'Preferred Date')}</label>
              <input className="input-field" type="date" value={form.preferredDate} onChange={(event) => update('preferredDate', event.target.value)} />
            </div>
            <div className="input-group">
              <label><HiOutlineClock style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.preferredTime', 'Preferred Time')}</label>
              <input className="input-field" type="time" value={form.preferredTime} onChange={(event) => update('preferredTime', event.target.value)} />
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
          <button className="btn btn-primary"><HiOutlinePlusCircle /> {t('b2bExtended.submitBulk', 'Submit Bulk Request')}</button>
        </section>

        <aside className="b2b-card">
          <h3>{t('b2bExtended.requestSummary', 'Request Summary')}</h3>
          <div className="confirm-summary">
            <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.service', 'Service')}</span><span className="confirm-value">{form.service}</span></div>
            <div className="confirm-row"><span className="confirm-label">{t('b2bExtended.frequency', 'Frequency')}</span><span className="confirm-value">{form.scheduleType}</span></div>
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
          {previousRequests.map((request) => (
            <div key={request.id} className="b2b-request-row">
              <div><strong>{request.id}</strong><div className="page-subtitle">{request.service}</div></div>
              <div>{request.locations} locations</div>
              <div>{request.date}</div>
              <div>
                <span className={`b2b-chip ${request.status}`}>{request.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default B2BBooking;
