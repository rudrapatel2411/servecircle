import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineWrench, HiOutlineCreditCard, HiOutlineArrowLeft,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import WorkerComparison, { mockWorkersForService } from './WorkerComparison';
import '../Dashboard.css';
import './CustomerPages.css';

const steps = [
  { id: 1, label: 'Service', icon: <HiOutlineWrench /> },
  { id: 2, label: 'Schedule', icon: <HiOutlineCalendarDays /> },
  { id: 3, label: 'Address', icon: <HiOutlineMapPin /> },
  { id: 4, label: 'Confirm', icon: <HiOutlineCreditCard /> }
];

const BookingFlow = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize from URL params if available
  const initialService = searchParams.get('service') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialBasePrice = parseInt(searchParams.get('price')) || 0;
  const initialDate = searchParams.get('date') || '';
  const initialTime = searchParams.get('slot') || '';
  const initialTier = searchParams.get('tier') || 'standard';

  // Auto-select worker based on tier if service exists
  const workers = mockWorkersForService(initialService, initialBasePrice);
  const defaultWorker = initialTier === 'premium' ? workers[2] : workers[0]; // Assuming w3 is premium

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState(defaultWorker);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [formData, setFormData] = useState({
    service: initialService,
    category: initialCategory,
    price: Math.round(initialBasePrice * (defaultWorker?.rateMultiplier || 1)),
    date: initialDate,
    time: initialTime,
    address: '',
    landmark: '',
    city: 'Ahmedabad',
    notes: '',
  });

  // If user came with all pre-filled data from ServiceDetail, jump to Address step
  useEffect(() => {
    if (initialService && initialDate && initialTime) {
      setCurrentStep(2); // Jump to Address Step
    }
  }, []);

  const workerName = selectedWorker?.name || 'Rajesh Kumar';
  const tier = initialTier === 'premium' ? 'Premium Pro' : 'Standard';
  const price = formData.price;

  const handleNext = () => {
    if (currentStep === 0 && (!formData.service || !selectedWorker)) {
      showToast("Please select a professional to continue.");
      return;
    }
    if (currentStep === 1 && (!formData.date || !formData.time)) {
      showToast("Please select both Date and Time.");
      return;
    }
    if (currentStep === 2 && (!formData.address || formData.address.length < 5 || !formData.city)) {
      showToast("Please provide a complete Flat/House No. and City to continue.");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleBook();
    }
  };

  const handleBook = () => {
    const bookingId = `SC-${Math.floor(2840 + Math.random() * 100)}`;
    navigate(`/customer/live-tracking?bookingId=${bookingId}&service=${encodeURIComponent(formData.service)}&worker=${encodeURIComponent(workerName)}&price=${price}`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!formData.service && !!selectedWorker;
      case 1: return !!(formData.date && formData.time);
      case 2: return !!(formData.address && formData.address.length > 5 && formData.city);
      default: return true;
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '90vh', paddingBottom: '60px', position: 'relative' }}>
      
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: 'white', borderLeft: '4px solid var(--danger, #ef4444)',
          padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>!</div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-900)' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <button className="back-btn" onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1)}>
            <HiOutlineArrowLeft /> {currentStep > 0 ? t('bookingFlow.previous', 'Previous Step') : t('bookingFlow.back', 'Back')}
          </button>
          <h2 className="page-title" style={{ fontSize: '1.8rem' }}>{t('bookingFlow.checkout', 'Secure Checkout')}</h2>
        </div>
      </div>

      {/* Progress Wizard */}
      <div className="booking-steps" style={{ marginBottom: '36px' }}>
        {steps.map((step, i) => (
          <div key={step.id} className={`booking-step ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`} onClick={() => i < currentStep && setCurrentStep(i)} style={{ cursor: i < currentStep ? 'pointer' : 'default' }}>
            <div className="step-number">
              {i < currentStep ? <HiOutlineCheckCircle size={18} /> : step.id}
            </div>
            <span className="step-label">{step.label}</span>
            {i < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {/* Main Layout: Split Form and Summary */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Active Step Content */}
        <div className="booking-form-card" style={{ margin: 0, padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          
          {currentStep === 0 && (
            <div className="booking-step-content">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>
                {t('bookingFlow.selectedService', 'Selected Service')}
              </h3>
              
              <div style={{ padding: '20px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', marginBottom: '24px' }}>
                {formData.service ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0 }}>{t(formData.service)}</h4>
                      {formData.category && <p style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600, margin: '4px 0 0 0', textTransform: 'uppercase' }}>{t(formData.category)}</p>}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', margin: 0 }}>{t('bookingFlow.noServiceSelected', 'No service selected.')}</p>
                )}
              </div>

              <WorkerComparison
                service={{ name: formData.service, basePrice: initialBasePrice || 499 }}
                selectedWorkerId={selectedWorker?.id}
                onSelectWorker={(worker) => {
                  setSelectedWorker(worker);
                  const base = initialBasePrice || 499;
                  setFormData(prev => ({ ...prev, price: Math.round(base * worker.rateMultiplier) }));
                }}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="booking-step-content">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>
                {t('bookingFlow.chooseDateTime', 'When should the professional arrive?')}
              </h3>
              
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineCalendarDays /> {t('bookingFlow.selectDate', 'Select Date')}
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Today', 'Tomorrow', 'Day after tomorrow'].map((d) => (
                    <button
                      key={d} type="button"
                      onClick={() => setFormData(prev => ({...prev, date: d}))}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.9rem',
                        background: formData.date === d ? 'var(--primary-50)' : 'white',
                        color: formData.date === d ? 'var(--primary-700)' : 'var(--navy-600)',
                        border: formData.date === d ? '2px solid var(--primary-500)' : '1px solid var(--gray-300)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineClock /> {t('bookingFlow.selectTimeSlot', 'Select Time Slot')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM'].map((slot) => (
                    <button
                      key={slot} type="button"
                      onClick={() => setFormData(prev => ({...prev, time: slot}))}
                      style={{
                        padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.9rem',
                        background: formData.time === slot ? 'var(--primary-50)' : 'white',
                        color: formData.time === slot ? 'var(--primary-700)' : 'var(--navy-600)',
                        border: formData.time === slot ? '2px solid var(--primary-500)' : '1px solid var(--gray-300)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="booking-step-content">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '8px' }}>
                {t('bookingFlow.serviceAddress', 'Where do you need the service?')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '28px' }}>
                Please provide accurate details so our professional can reach you on time.
              </p>
              
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--gray-100)' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineMapPin size={16} color="var(--primary-500)" />
                    {t('bookingFlow.fullAddress', 'Flat / House No. & Building Name')}
                  </label>
                  <input 
                    type="text"
                    value={formData.address || ''} 
                    onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))} 
                    placeholder="e.g. Flat 402, Sunshine Apartments, Main Road"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1.05rem', color: 'var(--navy-900)', fontWeight: 600, padding: '4px 0' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ padding: '20px', borderRight: '1px solid var(--gray-100)' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                      {t('bookingFlow.landmarkOptional', 'Landmark (Optional)')}
                    </label>
                    <input 
                      type="text"
                      value={formData.landmark || ''} 
                      onChange={(e) => setFormData(prev => ({...prev, landmark: e.target.value}))} 
                      placeholder="e.g. Near Metro Station"
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', color: 'var(--navy-800)', padding: '4px 0' }}
                    />
                  </div>
                  <div style={{ padding: '20px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                      {t('bookingFlow.city', 'City')}
                    </label>
                    <input 
                      type="text"
                      value={formData.city || ''} 
                      onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))} 
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', color: 'var(--navy-800)', padding: '4px 0' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                  {t('bookingFlow.specialInstructions', 'Special Instructions for Professional')}
                </label>
                <textarea 
                  rows="2" 
                  value={formData.notes || ''} 
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))} 
                  placeholder="e.g. Ring the doorbell twice, beware of dog..."
                  style={{ 
                    width: '100%', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', 
                    borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s', color: 'var(--navy-800)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                ></textarea>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="booking-step-content">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>
                {t('bookingFlow.paymentMethod', 'Select Payment Method')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {[
                  { id: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'Card', desc: 'Credit or Debit Card' },
                  { id: 'Wallet', desc: 'ServeCircle Balance' },
                  { id: 'Cash', desc: 'Pay after service completion' }
                ].map(method => (
                  <div 
                    key={method.id} 
                    onClick={() => setPaymentMethod(method.id)} 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s',
                      border: paymentMethod === method.id ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                      background: paymentMethod === method.id ? 'var(--primary-50)' : 'white'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: paymentMethod === method.id ? 'var(--primary-700)' : 'var(--navy-800)', fontSize: '1.05rem', marginBottom: '4px' }}>
                        {t(`bookingFlow.${method.id.toLowerCase()}`, method.id)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{method.desc}</div>
                    </div>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', border: paymentMethod === method.id ? '6px solid var(--primary-500)' : '2px solid var(--gray-300)',
                      background: 'white', transition: 'all 0.2s'
                    }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>
              Step {currentStep + 1} of 4
            </span>
            <button 
              className="btn btn-primary" 
              onClick={handleNext} 
              style={{ minWidth: '180px', padding: '14px 24px', fontSize: '1rem', fontWeight: 800, boxShadow: 'var(--shadow-md)' }}
            >
              {currentStep === 3 ? t('bookingFlow.confirmPay', 'Pay & Confirm Booking') : t('bookingFlow.next', 'Continue')} →
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Order Summary */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div className="card" style={{ padding: '28px', border: '1.5px solid var(--primary-200)', background: 'white', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--gray-100)' }}>
              Order Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Service</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>
                  {t(formData.service || 'Select a service')} 
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', verticalAlign: 'middle' }}>
                    {tier}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Professional</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-800)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={selectedWorker?.avatar || 'https://via.placeholder.com/40'} alt="worker" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  {workerName}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Date</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-800)', marginTop: '4px' }}>
                    {formData.date || 'TBD'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Time</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-800)', marginTop: '4px' }}>
                    {formData.time || 'TBD'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                <span>Service Charge</span>
                <span style={{ fontWeight: 600 }}>₹{price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                <span>Taxes & Fees</span>
                <span style={{ fontWeight: 600 }}>₹{Math.round(price * 0.18)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--gray-300)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary-700)' }}>₹{price + Math.round(price * 0.18)}</span>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" placeholder="Coupon Code (e.g. SAVE20)" style={{ padding: '12px', fontSize: '0.85rem' }} />
                <button type="button" className="btn btn-outline" style={{ padding: '10px 16px', fontWeight: 800 }}>Apply</button>
              </div>
            </div>
            
            {currentStep < 3 && (
               <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '16px', marginBottom: 0 }}>
                 You will not be charged until the final step.
               </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default BookingFlow;
