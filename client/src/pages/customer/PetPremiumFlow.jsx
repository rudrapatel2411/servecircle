import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineCamera, HiOutlineHomeModern, HiOutlineAcademicCap, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useTranslation, Trans } from 'react-i18next';

const PetPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type'); // boarding, training, photography, subscription
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Boarding State
  const [boardingDates, setBoardingDates] = useState('');
  const [boardingType, setBoardingType] = useState('');
  
  // Training State
  const [trainingGoal, setTrainingGoal] = useState('');
  
  // Photography State
  const [photoLocation, setPhotoLocation] = useState('');

  // Subscription State
  const [subPlan, setSubPlan] = useState('');
  const [subDiet, setSubDiet] = useState('');

  // Handle flow type mismatch
  useEffect(() => {
    if (!['boarding', 'training', 'photography', 'subscription'].includes(flowType)) {
      navigate('/customer/pet-services');
    }
  }, [flowType, navigate]);

  const handleNext = () => {
    setErrorMsg('');
    
    // Validation
    if (flowType === 'boarding') {
      if (step === 1 && !boardingDates) return setErrorMsg(t('petFlow.validationBoardingDates', "Please enter boarding dates."));
      if (step === 2 && !boardingType) return setErrorMsg(t('petFlow.validationBoardingType', "Please select a boarding preference."));
    }
    if (flowType === 'training' && step === 1 && !trainingGoal) {
      return setErrorMsg(t('petFlow.validationTrainingGoal', "Please select a training goal."));
    }
    if (flowType === 'photography' && step === 1 && !photoLocation) {
      return setErrorMsg(t('petFlow.validationPhotoLoc', "Please select a photoshoot location."));
    }
    if (flowType === 'subscription') {
      if (step === 1 && !subPlan) return setErrorMsg(t('petFlow.validationSubTier', "Please select a subscription tier."));
      if (step === 2 && !subDiet) return setErrorMsg(t('petFlow.validationSubDiet', "Please select a diet preference."));
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
      
      if (flowType === 'boarding') {
        serviceName = 'Premium Pet Boarding & Sitting';
        price = 899;
      } else if (flowType === 'training') {
        serviceName = 'Certified In-Home Pet Training';
        price = 1299;
      } else if (flowType === 'photography') {
        serviceName = 'Professional Pet Photography';
        price = 2499;
      } else if (flowType === 'subscription') {
        serviceName = `Monthly Pet Box (${subPlan})`;
        price = subPlan === 'Standard Box' ? 1999 : 2999;
      }
      
      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&price=${price}`);
    }, 1200);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'boarding': return { 
        title: t('petFlow.boardingTitle', 'Pet Boarding Setup'), 
        icon: <HiOutlineHomeModern size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
        color: '#ef4444',
        bgSoft: '#fef2f2',
        borderActive: '#ef4444',
        shadowActive: '0 4px 14px rgba(239, 68, 68, 0.15)'
      };
      case 'training': return { 
        title: t('petFlow.trainingTitle', 'Training Plan'), 
        icon: <HiOutlineAcademicCap size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
        color: '#f59e0b',
        bgSoft: '#fffbeb',
        borderActive: '#f59e0b',
        shadowActive: '0 4px 14px rgba(245, 158, 11, 0.15)'
      };
      case 'photography': return { 
        title: t('petFlow.photoTitle', 'Photoshoot Details'), 
        icon: <HiOutlineCamera size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #c026d3 0%, #86198f 100%)',
        color: '#c026d3',
        bgSoft: '#fdf4ff',
        borderActive: '#c026d3',
        shadowActive: '0 4px 14px rgba(192, 38, 211, 0.15)'
      };
      case 'subscription': return { 
        title: t('petFlow.subTitle', 'Custom Pet Box'), 
        icon: <HiOutlineShoppingBag size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
        color: '#16a34a',
        bgSoft: '#f0fdf4',
        borderActive: '#16a34a',
        shadowActive: '0 4px 14px rgba(22, 163, 74, 0.15)'
      };
      default: return { title: 'Pet Services', icon: null, gradient: '', color: '', bgSoft: '', borderActive: '', shadowActive: '' };
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

  const renderBoardingFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('petFlow.boardingQ1', 'When do you need boarding?')}</h3>
          <div style={{ padding: '20px', borderRadius: '16px', border: '2px solid var(--gray-200)', background: 'white' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '8px' }}>{t('petFlow.boardingDatesLabel', 'Enter Dates (e.g. 15th Aug to 18th Aug)')}</label>
            <input 
              type="text" 
              placeholder={t('petFlow.boardingDatesPlaceholder', "e.g. 15th Aug to 18th Aug")}
              value={boardingDates}
              onChange={(e) => setBoardingDates(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--gray-300)', fontSize: '1rem', outlineColor: theme.color }}
            />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('petFlow.boardingQ2', 'Choose Boarding Type')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('petFlow.verifiedHomestay', 'Verified Homestay')} subtext={t('petFlow.verifiedHomestayDesc', 'A cozy home environment with a verified host')} isSelected={boardingType === 'Homestay'} onClick={() => setBoardingType('Homestay')} />
            <OptionCard label={t('petFlow.petResort', 'Premium Pet Resort')} subtext={t('petFlow.petResortDesc', 'Includes play areas, pool time, and AC rooms')} isSelected={boardingType === 'Resort'} onClick={() => setBoardingType('Resort')} />
            <OptionCard label={t('petFlow.inHomeSitter', 'In-Home Sitter')} subtext={t('petFlow.inHomeSitterDesc', 'We send a verified sitter to your own house')} isSelected={boardingType === 'In-Home'} onClick={() => setBoardingType('In-Home')} />
          </div>
        </div>
      );
    }
  };

  const renderTrainingFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('petFlow.trainingQ1', 'What is the primary training goal?')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('petFlow.basics', 'Potty Training & Basics')} subtext={t('petFlow.basicsDesc', 'Ideal for young puppies')} isSelected={trainingGoal === 'Basics'} onClick={() => setTrainingGoal('Basics')} />
            <OptionCard label={t('petFlow.leashPulling', 'Leash Pulling & Walking')} subtext={t('petFlow.leashPullingDesc', 'Stop aggressive leash pulling during walks')} isSelected={trainingGoal === 'Walking'} onClick={() => setTrainingGoal('Walking')} />
            <OptionCard label={t('petFlow.aggression', 'Aggression & Biting')} subtext={t('petFlow.aggressionDesc', 'Specialized behavioral correction')} isSelected={trainingGoal === 'Aggression'} onClick={() => setTrainingGoal('Aggression')} />
            <OptionCard label={t('petFlow.advanced', 'Advanced Obedience Tricks')} subtext={t('petFlow.advancedDesc', 'Roll over, play dead, and agility')} isSelected={trainingGoal === 'Advanced'} onClick={() => setTrainingGoal('Advanced')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '40px 0' }}>
          <HiOutlineCheckCircle size={80} color={theme.color} style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '12px' }}>{t('petFlow.trainerMatched', 'Trainer Matched!')}</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '1rem', lineHeight: 1.5 }}>
            <Trans i18nKey="petFlow.trainerMatchedDesc" values={{ goal: trainingGoal }}>
              We have successfully found a certified behaviorist specialized in <strong>{{goal}}</strong> for your pet.
            </Trans>
          </p>
        </div>
      );
    }
  };

  const renderPhotographyFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('petFlow.photoQ1', 'Where should we shoot?')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('petFlow.atHome', 'At your Home')} subtext={t('petFlow.atHomeDesc', 'Comfortable environment for anxious pets')} isSelected={photoLocation === 'Home'} onClick={() => setPhotoLocation('Home')} />
            <OptionCard label={t('petFlow.dogPark', 'Local Dog Park / Nature')} subtext={t('petFlow.dogParkDesc', 'Action shots while playing outside')} isSelected={photoLocation === 'Park'} onClick={() => setPhotoLocation('Park')} />
            <OptionCard label={t('petFlow.studio', 'Professional Studio')} subtext={t('petFlow.studioDesc', 'Controlled lighting and fun props')} isSelected={photoLocation === 'Studio'} onClick={() => setPhotoLocation('Studio')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>📸</div>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '12px' }}>{t('petFlow.perfectChoice', 'Perfect Choice!')}</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '1rem', lineHeight: 1.5 }}>
            <Trans i18nKey="petFlow.photoDesc" values={{ location: photoLocation }}>
              Your photographer will bring props suitable for a <strong>{{location}}</strong> shoot.
            </Trans>
          </p>
        </div>
      );
    }
  };

  const renderSubscriptionFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('petFlow.subQ1', 'Select Box Tier')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('petFlow.standardBox', 'Standard Box')} subtext={t('petFlow.standardBoxDesc', 'Premium food and basic treats')} isSelected={subPlan === 'Standard Box'} onClick={() => setSubPlan('Standard Box')} />
            <OptionCard label={t('petFlow.premiumBox', 'Premium Box')} subtext={t('petFlow.premiumBoxDesc', 'Includes toys, grooming, and spa items')} isSelected={subPlan === 'Premium Box'} onClick={() => setSubPlan('Premium Box')} />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>{t('petFlow.subQ2', 'Diet Preference')}</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <OptionCard label={t('petFlow.grainFree', 'Grain-Free formulation')} subtext={t('petFlow.grainFreeDesc', 'Best for sensitive stomachs')} isSelected={subDiet === 'Grain-Free'} onClick={() => setSubDiet('Grain-Free')} />
            <OptionCard label={t('petFlow.highProtein', 'High Protein Diet')} subtext={t('petFlow.highProteinDesc', 'For active and growing pets')} isSelected={subDiet === 'High Protein'} onClick={() => setSubDiet('High Protein')} />
            <OptionCard label={t('petFlow.weightMgmt', 'Weight Management')} subtext={t('petFlow.weightMgmtDesc', 'Low calorie formulation')} isSelected={subDiet === 'Weight Management'} onClick={() => setSubDiet('Weight Management')} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      
      <div style={{ width: '100%', maxWidth: '650px', alignSelf: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/customer/pet-services')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
          background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '24px',
          padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <HiOutlineArrowLeft /> {t('petFlow.back', 'Back')}
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
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>{t('petFlow.customize', 'Customize your premium experience')}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ padding: '20px 30px 0 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t('petFlow.stepOf', { step })}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.color }}>
                {step === 1 ? t('petFlow.completed', { percent: 50 }) : t('petFlow.completed', { percent: 100 })}
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
            {flowType === 'boarding' && renderBoardingFlow()}
            {flowType === 'training' && renderTrainingFlow()}
            {flowType === 'photography' && renderPhotographyFlow()}
            {flowType === 'subscription' && renderSubscriptionFlow()}
            
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
                  {t('petFlow.back', 'Back')}
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
                {loading ? t('petFlow.processing', 'Processing...') : step === 2 ? t('petFlow.continueCheckout', 'Continue to Checkout') : t('petFlow.nextStep', 'Next Step')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PetPremiumFlow;
