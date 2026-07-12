import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineKey } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

const TravelPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type'); // luxury-rental, school-commute, corporate-carpool
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Luxury Rental State
  const [carClass, setCarClass] = useState('');
  const [driveType, setDriveType] = useState('');
  
  // School Commute State
  const [childAge, setChildAge] = useState('');
  const [safetyAddon, setSafetyAddon] = useState('');
  
  // Corporate Carpool State
  const [officeHub, setOfficeHub] = useState('');
  const [vehicleClass, setVehicleClass] = useState('');

  // Handle flow type mismatch
  useEffect(() => {
    if (!['luxury-rental', 'school-commute', 'corporate-carpool'].includes(flowType)) {
      navigate('/customer/travel-commute');
    }
  }, [flowType, navigate]);

  const handleNext = () => {
    setErrorMsg('');
    
    // Validation
    if (flowType === 'luxury-rental') {
      if (step === 1 && !carClass) return setErrorMsg(t('travelFlow.validationCarClass', "Please select a car class."));
      if (step === 2 && !driveType) return setErrorMsg(t('travelFlow.validationDriveType', "Please select a drive type."));
    }
    if (flowType === 'school-commute') {
      if (step === 1 && !childAge) return setErrorMsg(t('travelFlow.validationChildAge', "Please select child's age group."));
      if (step === 2 && !safetyAddon) return setErrorMsg(t('travelFlow.validationSafety', "Please select a safety requirement."));
    }
    if (flowType === 'corporate-carpool') {
      if (step === 1 && !officeHub) return setErrorMsg(t('travelFlow.validationOfficeHub', "Please select an office hub."));
      if (step === 2 && !vehicleClass) return setErrorMsg(t('travelFlow.validationVehicleClass', "Please select vehicle class."));
    }

    if (step < 2) {
      setStep(step + 1);
    } else {
      finalizeBooking();
    }
  };

  const finalizeBooking = () => {
    setLoading(true);
    setTimeout(() => {
      let serviceName = '';
      let price = 0;
      
      if (flowType === 'luxury-rental') {
        serviceName = `Luxury Car Rental (${carClass} - ${driveType})`;
        price = carClass === 'Ford Mustang GT' ? 14999 : carClass === 'Mercedes G-Wagon' ? 24999 : 49999;
      } else if (flowType === 'school-commute') {
        serviceName = 'Monthly School Commute Sub (With Dashcam)';
        price = 4500;
      } else if (flowType === 'corporate-carpool') {
        serviceName = 'Premium Corporate Carpool Pass (Monthly)';
        price = vehicleClass === 'Premium Sedan' ? 3999 : 6499;
      }
      
      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&price=${price}`);
    }, 1200);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'luxury-rental': return { 
        title: t('travelFlow.luxuryTitle', 'Luxury & Vintage Fleet'), 
        icon: <HiOutlineKey size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
        color: '#ef4444',
        bgSoft: '#fef2f2',
        borderActive: '#ef4444',
        shadowActive: '0 4px 14px rgba(239, 68, 68, 0.15)'
      };
      case 'school-commute': return { 
        title: t('travelFlow.schoolTitle', 'Kids Safe Commute'), 
        icon: <HiOutlineAcademicCap size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        color: '#10b981',
        bgSoft: '#ecfdf5',
        borderActive: '#10b981',
        shadowActive: '0 4px 14px rgba(16, 185, 129, 0.15)'
      };
      case 'corporate-carpool': return { 
        title: t('travelFlow.carpoolTitle', 'Corporate Carpool Match'), 
        icon: <HiOutlineBriefcase size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: '#3b82f6',
        bgSoft: '#eff6ff',
        borderActive: '#3b82f6',
        shadowActive: '0 4px 14px rgba(59, 130, 246, 0.15)'
      };
      default: return { title: 'Travel Services', icon: null, gradient: '', color: '', bgSoft: '', borderActive: '', shadowActive: '' };
    }
  };

  const theme = getThemeInfo();

  const OptionCard = ({ label, isSelected, onClick, subtext }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '20px', 
        borderRadius: '16px', 
        border: `2px solid ${isSelected ? theme.borderActive : 'var(--gray-200)'}`,
        background: isSelected ? theme.bgSoft : 'white', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: isSelected ? theme.shadowActive : '0 2px 5px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease-in-out',
        transform: isSelected ? 'translateY(-2px)' : 'none'
      }}
    >
      <div>
        <span style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-800)', fontSize: '1.05rem', display: 'block' }}>{label}</span>
        {subtext && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>{subtext}</span>}
      </div>
      <div style={{ 
        width: '28px', height: '28px', borderRadius: '50%', 
        border: `2px solid ${isSelected ? theme.color : 'var(--gray-300)'}`, 
        background: isSelected ? theme.color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white'
      }}>
        {isSelected && <HiOutlineCheckCircle size={20} />}
      </div>
    </div>
  );

  const renderLuxuryFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('travelFlow.luxuryQ1', 'Select Car Class')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('travelFlow.mustang', 'Ford Mustang GT')} subtext={t('travelFlow.mustangDesc', 'V8 engine, convertible top')} isSelected={carClass === 'Ford Mustang GT'} onClick={() => setCarClass('Ford Mustang GT')} />
            <OptionCard label={t('travelFlow.gwagon', 'Mercedes G-Wagon')} subtext={t('travelFlow.gwagonDesc', 'Luxury SUV with unmatched presence')} isSelected={carClass === 'Mercedes G-Wagon'} onClick={() => setCarClass('Mercedes G-Wagon')} />
            <OptionCard label={t('travelFlow.vintage', 'Vintage Rolls Royce')} subtext={t('travelFlow.vintageDesc', 'Classic elegance for weddings')} isSelected={carClass === 'Vintage Rolls Royce'} onClick={() => setCarClass('Vintage Rolls Royce')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('travelFlow.luxuryQ2', 'Drive Preference')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('travelFlow.selfDrive', 'Self-Drive')} subtext={t('travelFlow.selfDriveDesc', 'Insurance included, unlimited km')} isSelected={driveType === 'Self-Drive'} onClick={() => setDriveType('Self-Drive')} />
            <OptionCard label={t('travelFlow.chauffeur', 'Chauffeur Driven')} subtext={t('travelFlow.chauffeurDesc', 'White glove service, uniformed driver')} isSelected={driveType === 'Chauffeur'} onClick={() => setDriveType('Chauffeur')} />
          </div>
        </div>
      );
    }
  };

  const renderSchoolFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('travelFlow.schoolQ1', "Child's Age Group")}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('travelFlow.toddler', 'Toddler (Under 5 Yrs)')} subtext={t('travelFlow.toddlerDesc', 'Includes certified car seat installation')} isSelected={childAge === 'Toddler'} onClick={() => setChildAge('Toddler')} />
            <OptionCard label={t('travelFlow.primary', 'Primary School (5-10 Yrs)')} subtext={t('travelFlow.primaryDesc', 'Door-to-door escort assistance')} isSelected={childAge === 'Primary'} onClick={() => setChildAge('Primary')} />
            <OptionCard label={t('travelFlow.highSchool', 'High School (11+ Yrs)')} subtext={t('travelFlow.highSchoolDesc', 'Direct pickup and drop-off')} isSelected={childAge === 'High School'} onClick={() => setChildAge('High School')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('travelFlow.schoolQ2', 'Safety Preference')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('travelFlow.standardSafety', 'Standard Background Checked')} subtext={t('travelFlow.standardSafetyDesc', 'All our drivers are police verified')} isSelected={safetyAddon === 'Standard'} onClick={() => setSafetyAddon('Standard')} />
            <OptionCard label={t('travelFlow.femaleDriver', 'Female Driver Only')} subtext={t('travelFlow.femaleDriverDesc', 'Subject to availability in your area')} isSelected={safetyAddon === 'Female Driver'} onClick={() => setSafetyAddon('Female Driver')} />
            <OptionCard label={t('travelFlow.dashcam', 'Live In-Cab Dashcam')} subtext={t('travelFlow.dashcamDesc', 'Real-time video feed access on your app')} isSelected={safetyAddon === 'Dashcam'} onClick={() => setSafetyAddon('Dashcam')} />
          </div>
        </div>
      );
    }
  };

  const renderCarpoolFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('travelFlow.carpoolQ1', 'Select Office Hub')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('travelFlow.itPark', 'Cyber City / IT Park')} subtext={t('travelFlow.itParkDesc', 'Tech hubs and software parks')} isSelected={officeHub === 'IT Park'} onClick={() => setOfficeHub('IT Park')} />
            <OptionCard label={t('travelFlow.financial', 'Financial District')} subtext={t('travelFlow.financialDesc', 'Banking and corporate headquarters')} isSelected={officeHub === 'Financial'} onClick={() => setOfficeHub('Financial')} />
            <OptionCard label={t('travelFlow.downtown', 'Downtown Business Center')} subtext={t('travelFlow.downtownDesc', 'Main city commercial centers')} isSelected={officeHub === 'Downtown'} onClick={() => setOfficeHub('Downtown')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('travelFlow.carpoolQ2', 'Vehicle Class')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('travelFlow.premiumSedan', 'Premium Sedan')} subtext={t('travelFlow.premiumSedanDesc', 'Share with max 2 executives')} isSelected={vehicleClass === 'Sedan'} onClick={() => setVehicleClass('Sedan')} />
            <OptionCard label={t('travelFlow.executiveSuv', 'Executive SUV')} subtext={t('travelFlow.executiveSuvDesc', 'Share with max 4 executives, spacious')} isSelected={vehicleClass === 'SUV'} onClick={() => setVehicleClass('SUV')} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      
      <div style={{ width: '100%', maxWidth: '650px', alignSelf: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/customer/travel-commute')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
          background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '24px',
          padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <HiOutlineArrowLeft /> {t('travelFlow.back', 'Back')}
        </button>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          
          {/* Rich Header Area */}
          <div style={{
            background: theme.gradient,
            padding: '40px 30px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background circle */}
            <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '16px', borderRadius: '20px', display: 'flex',
              backdropFilter: 'blur(10px)'
            }}>
              {theme.icon}
            </div>
            <div style={{ zIndex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{theme.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>{t('travelFlow.customize', 'Customize your premium experience')}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ padding: '20px 30px 0 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t('travelFlow.stepOf', { step })}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.color }}>
                {step === 1 ? t('travelFlow.completed', { percent: 50 }) : t('travelFlow.completed', { percent: 100 })}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--gray-100)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', width: step === 1 ? '50%' : '100%', 
                background: theme.color, borderRadius: '10px', transition: 'width 0.3s ease' 
              }}></div>
            </div>
          </div>

          {/* Flow Content */}
          <div style={{ padding: '30px' }}>
            {flowType === 'luxury-rental' && renderLuxuryFlow()}
            {flowType === 'school-commute' && renderSchoolFlow()}
            {flowType === 'corporate-carpool' && renderCarpoolFlow()}
            
            {errorMsg && (
              <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)}
                  style={{
                    padding: '16px 24px', fontSize: '1.05rem', fontWeight: 800,
                    background: 'white', color: 'var(--navy-800)', border: '2px solid var(--gray-200)',
                    borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {t('travelFlow.back', 'Back')}
                </button>
              )}
              
              <button 
                onClick={handleNext}
                disabled={loading}
                style={{ 
                  flex: 1, padding: '16px', fontSize: '1.1rem', fontWeight: 800,
                  background: theme.color, color: 'white', border: 'none',
                  borderRadius: '16px', cursor: 'pointer',
                  boxShadow: `0 8px 20px -6px ${theme.color}`,
                  transition: 'transform 0.1s, box-shadow 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none' }}
              >
                {loading ? t('travelFlow.processing', 'Processing...') : step === 2 ? t('travelFlow.continueCheckout', 'Continue to Checkout') : t('travelFlow.nextStep', 'Next Step')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TravelPremiumFlow;
