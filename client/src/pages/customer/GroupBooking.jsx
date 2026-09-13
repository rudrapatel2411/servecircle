import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  HiOutlineUserGroup, HiOutlineSparkles, HiOutlineCurrencyRupee,
  HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineInbox,
  HiOutlineGlobeAmericas, HiOutlineBuildingOffice
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const servicesOptions = [
  { name: 'AC & Appliance Repair (Routine Checkup)', basePrice: 500 },
  { name: 'Home Deep Cleaning', basePrice: 1200 },
  { name: 'Water Tank Cleaning', basePrice: 800 },
  { name: 'Pest Control', basePrice: 900 },
  { name: 'Electrical Work (Safety Auditing)', basePrice: 300 }
];

const GroupBooking = () => {
  const { t } = useTranslation();
  
  const [societyName, setSocietyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [flatCount, setFlatCount] = useState(5);
  const [selectedService, setSelectedService] = useState(servicesOptions[0]);
  const [preferredDate, setPreferredDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Compute progressive discount
  const getDiscountPercent = (count) => {
    if (count <= 1) return 0;
    if (count <= 5) return 10; // 10% discount
    if (count <= 10) return 15; // 15% discount
    return 20; // 20% discount (Platinum limits)
  };

  const discountPercent = getDiscountPercent(flatCount);
  const basePrice = selectedService.basePrice;
  const pricePerFlat = Math.round(basePrice * (1 - discountPercent / 100));
  const totalAmount = pricePerFlat * flatCount;
  const totalSavings = (basePrice - pricePerFlat) * flatCount;
  
  // Eco travel impact
  const travelKmSaved = Math.max(0, (flatCount - 1) * 3.5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!societyName || !contactName || !preferredDate) {
      alert('Please fill in all required fields!');
      return;
    }
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="page-content">
        <div className="booking-success" style={{ maxWidth: '600px', margin: '40px auto' }}>
          <div className="success-icon-wrap">
            <HiOutlineCheckCircle className="success-icon" style={{ fontSize: '4.5rem' }} />
          </div>
          <h2>Society Group Booking Requested! 🎉</h2>
          <p>We have received your coordinated request for <strong>{societyName}</strong>.</p>
          
          <div className="success-details" style={{ width: '100%' }}>
            <div className="success-row"><HiOutlineBuildingOffice /> <span>Society: {societyName}</span></div>
            <div className="success-row"><HiOutlineUserGroup /> <span>Participating Flats: {flatCount} Homes</span></div>
            <div className="success-row"><HiOutlineSparkles /> <span>Service: {selectedService.name}</span></div>
            <div className="success-row"><HiOutlineCurrencyRupee /> <span>Coordinated Price: ₹{pricePerFlat}/flat (Total: ₹{totalAmount})</span></div>
            <div className="success-row" style={{ color: 'var(--success)', fontWeight: 700 }}><HiOutlineCheckCircle /> <span>Group Savings: ₹{totalSavings} ({discountPercent}% off!)</span></div>
            <div className="success-row" style={{ color: '#2960a0' }}><HiOutlineGlobeAmericas /> <span>Eco-Impact: Saves ~{travelKmSaved}km of worker commuting!</span></div>
          </div>

          <p className="success-note">Group Request ID: <strong>#SC-GRP-{Math.floor(1000 + Math.random() * 9000)}</strong></p>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '24px' }}>
            Our B2B Operations Manager will contact you and your society coordinator within 2 hours to confirm the scheduling slots.
          </p>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>Submit Another Request</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.groupBooking')} 🏢</h1>
          <p className="page-subtitle">Coordinate bookings with neighbors in your housing society or apartment block for massive B2B discounts.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Side: Dynamic Calculator & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Discount Calculator Card */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>Interactive Coordinated Group Calculator</h3>
            
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Select Shared Service</label>
                <select
                  className="input-field"
                  value={selectedService.name}
                  onChange={(e) => {
                    const found = servicesOptions.find((o) => o.name === e.target.value);
                    if (found) setSelectedService(found);
                  }}
                >
                  {servicesOptions.map((opt) => (
                    <option key={opt.name} value={opt.name}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Number of Participating Flats</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="input-field"
                  value={flatCount}
                  onChange={(e) => setFlatCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            {/* Calculations display */}
            <div style={{
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1.5px dashed var(--gray-200)'
            }}>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Standard Price per Flat:</span>
                <span style={{ fontWeight: 600 }}>₹{basePrice}</span>
              </div>

              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Group Size Discount:</span>
                <span style={{ color: 'var(--success)', fontWeight: 800 }}>-{discountPercent}%</span>
              </div>

              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Price per Flat after Discount:</span>
                <span style={{ color: 'var(--primary-700)', fontWeight: 800, fontSize: '1.15rem' }}>₹{pricePerFlat}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '14px 0' }} />

              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: 'var(--navy-800)' }}>Total Coordinated Cost:</span>
                <span style={{ fontWeight: 900, color: 'var(--navy-800)', fontSize: '1.3rem' }}>₹{totalAmount}</span>
              </div>

              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>Total Coordinated Savings:</span>
                <span>Saved ₹{totalSavings}</span>
              </div>
            </div>

            {/* Eco impact badge */}
            {flatCount > 1 && (
              <div style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.15)',
                borderRadius: 'var(--radius-md)',
                color: '#224c82',
                fontSize: '0.8rem'
              }}>
                <HiOutlineGlobeAmericas style={{ fontSize: '1.6rem', flexShrink: 0 }} />
                <span>
                  <strong>Green Move!</strong> Booking {flatCount} flat services together saves approximately <strong>{travelKmSaved}km</strong> of worker travel distance, reducing carbon emissions in your local community!
                </span>
              </div>
            )}
          </div>

          {/* Group booking request form */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>Request a Group Booking Slots</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Housing Society / Apartment Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Green Valley Residency"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Coordinator Contact Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Ramesh Shah (Secretary)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
              </div>

              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Preferred Coordinated Service Date *</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Coordinator Phone Number *</label>
                  <input type="tel" required className="input-field" placeholder="e.g. +91 98765 43210" />
                </div>
              </div>

              <div className="input-group">
                <label>Special Instructions (e.g. specific flats, gate permission info)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Any details on flat coordination, visitor parking rules, or specific scheduling..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', fontSize: '1rem' }}>
                Submit Coordinated Request
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Informational blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px' }}>Progressive Discounts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <span>1 Flat (Solo Booking)</span>
                <span style={{ fontWeight: 700, color: 'var(--gray-500)' }}>Standard pricing</span>
              </div>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>2 - 5 Flats Block</span>
                <span style={{ color: 'var(--success)' }}>10% discount</span>
              </div>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>6 - 10 Flats Block</span>
                <span style={{ color: 'var(--success)' }}>15% discount</span>
              </div>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>11+ Flats Block</span>
                <span style={{ color: 'var(--success)' }}>20% discount</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '12px' }}>How does it work?</h3>
            <ol style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              <li><strong>Gather Interest</strong>: Discuss with neighbors in your WhatsApp group or society meet.</li>
              <li><strong>Calculate Savings</strong>: Enter the flat count here to see the discounted rate per flat.</li>
              <li><strong>Submit Request</strong>: The society coordinator submits this request form.</li>
              <li><strong>Execution</strong>: ServeCircle dispatches dedicated teams on the preferred date. Neighbors enjoy high-quality repairs at bulk wholesale prices!</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GroupBooking;
