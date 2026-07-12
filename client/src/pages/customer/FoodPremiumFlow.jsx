import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineFire, HiOutlineCake, HiOutlineSparkles } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

const FoodPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type'); // bbq, baking, kitchen-clean
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // BBQ State
  const [bbqMenu, setBbqMenu] = useState('');
  const [bbqGuests, setBbqGuests] = useState('');
  
  // Baking State
  const [bakingClass, setBakingClass] = useState('');
  const [bakingDiet, setBakingDiet] = useState('');
  
  // Cleaning State
  const [cleanSize, setCleanSize] = useState('');
  const [cleanAddon, setCleanAddon] = useState('');

  // Handle flow type mismatch
  useEffect(() => {
    if (!['bbq', 'baking', 'kitchen-clean'].includes(flowType)) {
      navigate('/customer/food-kitchen');
    }
  }, [flowType, navigate]);

  const handleNext = () => {
    setErrorMsg('');
    
    // Validation
    if (flowType === 'bbq') {
      if (step === 1 && !bbqMenu) return setErrorMsg(t('foodFlow.validationMenu', "Please select a BBQ menu type."));
      if (step === 2 && !bbqGuests) return setErrorMsg(t('foodFlow.validationGuests', "Please select the number of guests."));
    }
    if (flowType === 'baking') {
      if (step === 1 && !bakingClass) return setErrorMsg(t('foodFlow.validationClass', "Please select a class type."));
      if (step === 2 && !bakingDiet) return setErrorMsg(t('foodFlow.validationDiet', "Please select dietary preferences."));
    }
    if (flowType === 'kitchen-clean') {
      if (step === 1 && !cleanSize) return setErrorMsg(t('foodFlow.validationCleanSize', "Please select your kitchen size."));
      if (step === 2 && !cleanAddon) return setErrorMsg(t('foodFlow.validationCleanAddon', "Please select a cleaning add-on."));
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
      
      if (flowType === 'bbq') {
        serviceName = 'Backyard BBQ Live Grill Setup';
        price = bbqGuests === '2-4 Guests' ? 3499 : bbqGuests === '5-10 Guests' ? 6999 : 12999;
      } else if (flowType === 'baking') {
        serviceName = `In-Home Baking Class (${bakingClass})`;
        price = bakingClass === 'Advanced Pastry' ? 3999 : 2499;
      } else if (flowType === 'kitchen-clean') {
        serviceName = 'Kitchen Deep Clean & Pantry Organization';
        price = cleanSize === 'Small Kitchen' ? 1999 : cleanSize === 'Medium Kitchen' ? 2999 : 4999;
      }
      
      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&price=${price}`);
    }, 1200);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'bbq': return { 
        title: t('foodFlow.bbqTitle', 'BBQ Setup & Menu'), 
        icon: <HiOutlineFire size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
        color: '#ea580c',
        bgSoft: '#fff7ed',
        borderActive: '#ea580c',
        shadowActive: '0 4px 14px rgba(234, 88, 12, 0.15)'
      };
      case 'baking': return { 
        title: t('foodFlow.bakingTitle', 'Baking Masterclass'), 
        icon: <HiOutlineCake size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
        color: '#db2777',
        bgSoft: '#fdf2f8',
        borderActive: '#db2777',
        shadowActive: '0 4px 14px rgba(219, 39, 119, 0.15)'
      };
      case 'kitchen-clean': return { 
        title: t('foodFlow.cleanTitle', 'Kitchen & Pantry'), 
        icon: <HiOutlineSparkles size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
        color: '#0ea5e9',
        bgSoft: '#f0f9ff',
        borderActive: '#0ea5e9',
        shadowActive: '0 4px 14px rgba(14, 165, 233, 0.15)'
      };
      default: return { title: 'Service', icon: null, gradient: '', color: '', bgSoft: '', borderActive: '', shadowActive: '' };
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

  const renderBbqFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('foodFlow.selectMenuType', 'Select Menu Type')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('foodFlow.allVeg', 'All Veg Platter')} subtext={t('foodFlow.allVegDesc', 'Paneer tikka, grilled veggies, and mushrooms')} isSelected={bbqMenu === 'All Veg'} onClick={() => setBbqMenu('All Veg')} />
            <OptionCard label={t('foodFlow.nonVeg', 'Non-Veg Classic')} subtext={t('foodFlow.nonVegDesc', 'Chicken tikka, kebabs, and grilled fish')} isSelected={bbqMenu === 'Non-Veg'} onClick={() => setBbqMenu('Non-Veg')} />
            <OptionCard label={t('foodFlow.mixed', 'Mixed Platter')} subtext={t('foodFlow.mixedDesc', 'A perfect balance of veg and non-veg items')} isSelected={bbqMenu === 'Mixed'} onClick={() => setBbqMenu('Mixed')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('foodFlow.numGuests', 'Number of Guests')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('foodFlow.guests2to4', '2-4 Guests')} subtext={t('foodFlow.guests2to4Desc', 'Intimate family grilling')} isSelected={bbqGuests === '2-4 Guests'} onClick={() => setBbqGuests('2-4 Guests')} />
            <OptionCard label={t('foodFlow.guests5to10', '5-10 Guests')} subtext={t('foodFlow.guests5to10Desc', 'Perfect for a small get-together')} isSelected={bbqGuests === '5-10 Guests'} onClick={() => setBbqGuests('5-10 Guests')} />
            <OptionCard label={t('foodFlow.guests10plus', '10+ Guests (Party)')} subtext={t('foodFlow.guests10plusDesc', 'Large scale setup with 2 chefs')} isSelected={bbqGuests === '10+ Guests'} onClick={() => setBbqGuests('10+ Guests')} />
          </div>
        </div>
      );
    }
  };

  const renderBakingFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('foodFlow.selectClassType', 'Select Class Type')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('foodFlow.kidsFun', 'Kids Fun Cupcake Decoration')} subtext={t('foodFlow.kidsFunDesc', 'Safe, fun, and colorful baking for children')} isSelected={bakingClass === 'Kids Fun'} onClick={() => setBakingClass('Kids Fun')} />
            <OptionCard label={t('foodFlow.couplesCake', 'Couples Cake Baking')} subtext={t('foodFlow.couplesCakeDesc', 'A romantic 2-hour cake baking session')} isSelected={bakingClass === 'Couples'} onClick={() => setBakingClass('Couples')} />
            <OptionCard label={t('foodFlow.advancedPastry', 'Advanced Pastry & Macarons')} subtext={t('foodFlow.advancedPastryDesc', 'Learn complex techniques from a master chef')} isSelected={bakingClass === 'Advanced Pastry'} onClick={() => setBakingClass('Advanced Pastry')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('foodFlow.dietaryConstraints', 'Dietary Constraints')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('foodFlow.standard', 'Standard')} subtext={t('foodFlow.standardDesc', 'Contains Egg and Dairy products')} isSelected={bakingDiet === 'Standard'} onClick={() => setBakingDiet('Standard')} />
            <OptionCard label={t('foodFlow.eggless', '100% Eggless')} subtext={t('foodFlow.egglessDesc', 'Completely egg-free recipes')} isSelected={bakingDiet === 'Eggless'} onClick={() => setBakingDiet('Eggless')} />
            <OptionCard label={t('foodFlow.vegan', 'Vegan')} subtext={t('foodFlow.veganDesc', 'No dairy or animal products used')} isSelected={bakingDiet === 'Vegan'} onClick={() => setBakingDiet('Vegan')} />
          </div>
        </div>
      );
    }
  };

  const renderCleaningFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('foodFlow.kitchenSize', 'Kitchen Size')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('foodFlow.smallKitchen', 'Small Kitchen')} subtext={t('foodFlow.smallKitchenDesc', 'Standard apartment kitchen')} isSelected={cleanSize === 'Small Kitchen'} onClick={() => setCleanSize('Small Kitchen')} />
            <OptionCard label={t('foodFlow.mediumKitchen', 'Medium Kitchen')} subtext={t('foodFlow.mediumKitchenDesc', 'Standard 2-3 BHK kitchen')} isSelected={cleanSize === 'Medium Kitchen'} onClick={() => setCleanSize('Medium Kitchen')} />
            <OptionCard label={t('foodFlow.largeKitchen', 'Large / Open Kitchen')} subtext={t('foodFlow.largeKitchenDesc', 'Large villa or open layout kitchen')} isSelected={cleanSize === 'Large Kitchen'} onClick={() => setCleanSize('Large Kitchen')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('foodFlow.selectAddon', 'Select Included Add-on')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('foodFlow.fridgeClean', 'Inside Fridge Deep Cleaning')} subtext={t('foodFlow.fridgeCleanDesc', 'Removal of stains and odor')} isSelected={cleanAddon === 'Fridge'} onClick={() => setCleanAddon('Fridge')} />
            <OptionCard label={t('foodFlow.chimneyDegrease', 'Chimney & Exhaust Degreasing')} subtext={t('foodFlow.chimneyDegreaseDesc', 'Intensive oil and grease removal')} isSelected={cleanAddon === 'Chimney'} onClick={() => setCleanAddon('Chimney')} />
            <OptionCard label={t('foodFlow.pantryLabel', 'Pantry Jar Labelling & Sorting')} subtext={t('foodFlow.pantryLabelDesc', 'Aesthetic organization of your spices and pulses')} isSelected={cleanAddon === 'Pantry'} onClick={() => setCleanAddon('Pantry')} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      
      <div style={{ width: '100%', maxWidth: '650px', alignSelf: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/customer/food-kitchen')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
          background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '24px',
          padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <HiOutlineArrowLeft /> {t('foodFlow.back', 'Back')}
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
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>{t('foodFlow.customize', 'Customize your premium experience')}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ padding: '20px 30px 0 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t('foodFlow.stepOf', { step })}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.color }}>
                {step === 1 ? t('foodFlow.completed', { percent: 50 }) : t('foodFlow.completed', { percent: 100 })}
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
            {flowType === 'bbq' && renderBbqFlow()}
            {flowType === 'baking' && renderBakingFlow()}
            {flowType === 'kitchen-clean' && renderCleaningFlow()}
            
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
                  {t('foodFlow.back', 'Back')}
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
                {loading ? t('foodFlow.processing', 'Processing...') : step === 2 ? t('foodFlow.continueCheckout', 'Continue to Checkout') : t('foodFlow.nextStep', 'Next Step')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FoodPremiumFlow;
