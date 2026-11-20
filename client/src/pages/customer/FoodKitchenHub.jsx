import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowLeft, HiOutlineCalendarDays, HiOutlineCheckCircle, HiOutlineClock, HiOutlineChevronRight, HiOutlineShieldCheck, HiOutlineFire } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const FoodKitchenHub = () => {
  const { t } = useTranslation();

  // Tiffin Meal Builder state
  const [dietType, setDietType] = useState('veg'); // 'veg', 'non-veg', 'keto'
  const [duration, setDuration] = useState('monthly'); // 'weekly', 'monthly'
  const [isPaused, setIsPaused] = useState(false);
  
  // Interactive Calendar State
  const [activeDays, setActiveDays] = useState({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false });

  const toggleDay = (day) => {
    setActiveDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // Home Chef state
  const [cuisine, setCuisine] = useState('indian'); // 'indian', 'mughlai', 'continental'
  
  // Custom Cake state
  const [cakeStyle, setCakeStyle] = useState('minimalist'); // 'minimalist', 'fruit', 'fondant'
  const [cakeImage, setCakeImage] = useState(null);

  const calculateTiffinPrice = () => {
    const base = dietType === 'veg' ? 120 : dietType === 'non-veg' ? 150 : 180;
    const days = duration === 'weekly' ? 7 : 30;
    const discount = duration === 'monthly' ? 0.9 : 1.0; // 10% off on monthly
    return Math.round(base * days * discount);
  };

  const calculateChefPrice = () => {
    const cuisinePrices = { indian: 599, mughlai: 899, continental: 1299 };
    return cuisinePrices[cuisine];
  };

  const handleImageUploadSim = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCakeImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button */}
      <Link to="/customer/general-services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>



      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        
        {/* Tiffin Meal Plan Builder */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {t('foodKitchen.tiffinTitle')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              {t('foodKitchen.tiffinDesc')}
            </p>

            {/* Macro Tags */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', background: '#fff7ed', color: '#c2410c', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}><HiOutlineFire /> High Protein (35g)</span>
              <span style={{ fontSize: '0.65rem', background: '#f0f5fa', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 800 }}>{t('foodKitchenExt.lowCalorie')}</span>
            </div>

            {/* Diet type */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['veg', 'non-veg', 'keto'].map((dt) => (
                <button
                  key={dt}
                  onClick={() => setDietType(dt)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: dietType === dt ? '#ea580c' : 'var(--gray-200)',
                    background: dietType === dt ? 'rgba(234, 88, 12, 0.05)' : 'white',
                    color: dietType === dt ? '#ea580c' : 'var(--gray-700)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {dt === 'veg' ? t('foodKitchen.veg') : dt === 'non-veg' ? t('foodKitchen.nonVeg') : t('foodKitchen.keto')}
                </button>
              ))}
            </div>

            {/* Duration */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['weekly', 'monthly'].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: duration === dur ? '#ea580c' : 'var(--gray-200)',
                    background: duration === dur ? 'rgba(234, 88, 12, 0.05)' : 'white',
                    color: duration === dur ? '#ea580c' : 'var(--gray-700)',
                    fontWeight: 650,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {dur === 'weekly' ? t('foodKitchen.weeklyTiffin') : t('foodKitchen.monthlyTiffin')}
                </button>
              ))}
            </div>

            {/* Interactive Calendar */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '8px' }}>{t('foodKitchenExt.deliverySchedule')}</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Object.keys(activeDays).map(day => (
                  <div
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 0',
                      borderRadius: '8px',
                      background: activeDays[day] ? '#ea580c' : '#f1f5f9',
                      color: activeDays[day] ? 'white' : 'var(--gray-500)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      border: '1px solid',
                      borderColor: activeDays[day] ? '#ea580c' : 'var(--gray-300)'
                    }}
                  >
                    {day.substring(0, 1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Switch */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              marginBottom: '20px',
              border: '1px solid var(--gray-200)'
            }}>
              <div>
                <strong style={{ color: 'var(--navy-800)' }}>{t('foodKitchen.pauseSub')}</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--gray-500)' }}>{t('foodKitchen.pauseSubDesc')}</span>
              </div>
              <input
                type="checkbox"
                checked={isPaused}
                onChange={() => setIsPaused(!isPaused)}
                style={{ width: '18px', height: '18px', accentColor: '#ea580c', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{
            background: 'rgba(234, 88, 12, 0.03)',
            border: '1px solid rgba(234, 88, 12, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('foodKitchen.subTotal')}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateTiffinPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Daily Tiffin Meal Plan Subscription')}&serviceId=tiffin-subscription&category=food-kitchen&price=${calculateTiffinPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              {t('foodKitchen.subscribePlan')}
            </Link>
          </div>
        </div>

        {/* Gourmet Home Chef Booking */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {t('foodKitchen.chefTitle')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '12px' }}>
              {t('foodKitchen.chefDesc')}
            </p>

            {/* FSSAI & Hygiene Badge */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HiOutlineShieldCheck size={14}/> 100% FSSAI Certified
              </span>
              <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '4px', fontWeight: 800 }}>
                ⭐ 4.9 Hygiene Rating
              </span>
            </div>

            {/* Cuisine choice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { id: 'indian', name: t('foodKitchen.indianName', 'Traditional Indian Feast 🥘'), desc: t('foodKitchen.indianDesc', 'Home-style authentic regional cuisines') },
                { id: 'mughlai', name: t('foodKitchen.mughlaiName', 'Royal Mughlai Banquet 🍲'), desc: t('foodKitchen.mughlaiDesc', 'Aromatic gravies, rich biryanis, and kebabs') },
                { id: 'continental', name: t('foodKitchen.continentalName', 'Premium European Course 🥩'), desc: t('foodKitchen.continentalDesc', 'Fine dining steaks, baked bakes, and rich pastas') }
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => setCuisine(c.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: cuisine === c.id ? '#ea580c' : 'var(--gray-200)',
                    background: cuisine === c.id ? 'rgba(234, 88, 12, 0.03)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{c.name}</span>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--gray-500)', marginTop: '2px' }}>{c.desc}</span>
                  </div>
                  <HiOutlineChevronRight style={{ color: cuisine === c.id ? '#ea580c' : 'var(--gray-400)' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(234, 88, 12, 0.03)',
            border: '1px solid rgba(234, 88, 12, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('foodKitchen.chefFee')}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateChefPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Gourmet Home Chef (Per Meal)')}&serviceId=home-chef&category=food-kitchen&price=${calculateChefPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              {t('foodKitchen.bookChefSlot')}
            </Link>
          </div>
        </div>

        {/* Custom Cake Designer Scheduler */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {t('foodKitchen.cakeTitle')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              {t('foodKitchen.cakeDesc')}
            </p>

            {/* Cake Style Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>{t('foodKitchen.decoratorStyle')}</label>
              <select
                value={cakeStyle}
                onChange={(e) => setCakeStyle(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
              >
                <option value="minimalist">{t('foodKitchen.minimalistCake')}</option>
                <option value="fruit">{t('foodKitchen.fruitCake')}</option>
                <option value="fondant">{t('foodKitchen.fondantCake')}</option>
              </select>
            </div>

            {/* Photo Reference Upload simulator */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>{t('foodKitchen.refPhoto')}</label>
              <div style={{
                border: '1.5px dashed var(--gray-300)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                background: 'var(--gray-50)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                {cakeImage ? (
                  <img src={cakeImage} alt="Uploaded Cake reference" style={{ maxHeight: '80px', margin: '0 auto', borderRadius: '6px' }} />
                ) : (
                  <div>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>📸</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{t('foodKitchen.tapToUpload')}</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadSim}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(234, 88, 12, 0.03)',
            border: '1px solid rgba(234, 88, 12, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('foodKitchen.consultationBooking')}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{cakeStyle === 'minimalist' ? '1,499' : cakeStyle === 'fruit' ? '1,799' : '2,999'}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Celebration Custom Cake Designer')}&serviceId=custom-cake&category=food-kitchen&price=${cakeStyle === 'minimalist' ? 1499 : cakeStyle === 'fruit' ? 1799 : 2999}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              {t('foodKitchen.orderCake')}
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #ea580c' }}>
          Premium Culinary Experiences
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
        {/* BBQ & Grill Setup */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Backyard BBQ Setup 🍖
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              We bring the grill, coal, and marinated meats. Enjoy a live BBQ experience in your backyard.
            </p>
          </div>
          <Link
            to="/customer/food-flow?type=bbq"
            className="btn btn-primary btn-sm"
            style={{ padding: '12px 16px', background: '#ea580c', borderColor: '#ea580c', fontWeight: 800, textAlign: 'center' }}
          >
            Configure BBQ Menu
          </Link>
        </div>

        {/* Baking Masterclass */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              In-Home Baking Class 🧁
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              Book a pastry chef for a 2-hour hands-on baking masterclass in your kitchen.
            </p>
          </div>
          <Link
            to="/customer/food-flow?type=baking"
            className="btn btn-primary btn-sm"
            style={{ padding: '12px 16px', background: '#ea580c', borderColor: '#ea580c', fontWeight: 800, textAlign: 'center' }}
          >
            Book Masterclass
          </Link>
        </div>

        {/* Kitchen Deep Clean & Pantry */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Kitchen & Pantry Clean 🧼
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              Deep cleaning of appliances and aesthetic organization of your pantry shelves.
            </p>
          </div>
          <Link
            to="/customer/food-flow?type=kitchen-clean"
            className="btn btn-primary btn-sm"
            style={{ padding: '12px 16px', background: '#ea580c', borderColor: '#ea580c', fontWeight: 800, textAlign: 'center' }}
          >
            Customize Cleaning
          </Link>
        </div>

        </div>
      </div>
    </div>
  );
};

export default FoodKitchenHub;
