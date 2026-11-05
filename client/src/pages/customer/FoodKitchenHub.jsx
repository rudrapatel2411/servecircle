import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft, HiOutlineCalendarDays, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineChevronRight, HiOutlineShieldCheck,
  HiOutlineFire, HiOutlineStar, HiOutlineCamera, HiOutlineCake,
  HiOutlineSparkles, HiOutlineUserGroup
} from 'react-icons/hi2';
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

  // Home Chef state with dynamic guest scaling
  const [cuisine, setCuisine] = useState('indian'); // 'indian', 'mughlai', 'continental'
  const [chefGuests, setChefGuests] = useState(4);
  
  // Custom Cake state with dynamic weight scaling
  const [cakeStyle, setCakeStyle] = useState('minimalist'); // 'minimalist', 'fruit', 'fondant'
  const [cakeWeightKg, setCakeWeightKg] = useState(1);
  const [cakeImage, setCakeImage] = useState(null);

  const calculateTiffinPrice = () => {
    const base = dietType === 'veg' ? 120 : dietType === 'non-veg' ? 150 : 180;
    const days = duration === 'weekly' ? 7 : 30;
    const discount = duration === 'monthly' ? 0.9 : 1.0; // 10% off on monthly
    return Math.round(base * days * discount);
  };

  const calculateChefPrice = () => {
    const cuisinePrices = { indian: 599, mughlai: 899, continental: 1299 };
    const base = cuisinePrices[cuisine] || 599;
    const extraGuests = Math.max(0, chefGuests - 4);
    return Math.round(base + extraGuests * 110);
  };

  const calculateCakePrice = () => {
    const styleBases = { minimalist: 999, fruit: 1299, fondant: 1899 };
    const basePerKg = styleBases[cakeStyle] || 999;
    return Math.round(basePerKg * cakeWeightKg);
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

        {/* Gourmet Home Chef Booking with Dynamic Guests */}
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HiOutlineShieldCheck size={14}/> 100% FSSAI Certified
              </span>
              <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <HiOutlineStar /> 4.9 Hygiene Rating
              </span>
            </div>

            {/* Cuisine choice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'indian', name: t('foodKitchen.indianName', 'Traditional Indian Feast'), desc: t('foodKitchen.indianDesc', 'Home-style authentic regional cuisines') },
                { id: 'mughlai', name: t('foodKitchen.mughlaiName', 'Royal Mughlai Banquet'), desc: t('foodKitchen.mughlaiDesc', 'Aromatic gravies, rich biryanis, and kebabs') },
                { id: 'continental', name: t('foodKitchen.continentalName', 'Premium European Course'), desc: t('foodKitchen.continentalDesc', 'Fine dining steaks, baked bakes, and rich pastas') }
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => setCuisine(c.id)}
                  style={{
                    padding: '10px 14px',
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
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy-800)' }}>{c.name}</span>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--gray-500)', marginTop: '2px' }}>{c.desc}</span>
                  </div>
                  <HiOutlineChevronRight style={{ color: cuisine === c.id ? '#ea580c' : 'var(--gray-400)' }} />
                </div>
              ))}
            </div>

            {/* Dynamic Guest Count Controller */}
            <div style={{ marginBottom: '20px', background: 'var(--gray-50)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineUserGroup style={{ color: '#ea580c' }} /> Guest Count: <span style={{ color: '#ea580c' }}>{chefGuests} Guests</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setChefGuests(prev => Math.max(2, prev - 1))}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--gray-300)', background: 'white', fontWeight: 800, cursor: 'pointer', lineHeight: '1' }}
                  >-</button>
                  <span style={{ fontWeight: 800, minWidth: '22px', textAlign: 'center', color: 'var(--navy-900)', fontSize: '0.85rem' }}>{chefGuests}</span>
                  <button
                    type="button"
                    onClick={() => setChefGuests(prev => Math.min(50, prev + 1))}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--gray-300)', background: 'white', fontWeight: 800, cursor: 'pointer', lineHeight: '1' }}
                  >+</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[2, 4, 8, 15, 25, 40].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setChefGuests(cnt)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: chefGuests === cnt ? '#ea580c' : 'var(--gray-300)',
                      background: chefGuests === cnt ? '#ea580c' : 'white',
                      color: chefGuests === cnt ? 'white' : 'var(--gray-700)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--gray-500)', marginTop: '6px' }}>
                Covers base preparation up to 4 guests; +₹110 per additional guest.
              </span>
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('foodKitchen.chefFee')} ({chefGuests} guests)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateChefPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent(`Gourmet Home Chef (${cuisine.toUpperCase()} • ${chefGuests} Guests)`)}&serviceId=home-chef&category=food-kitchen&price=${calculateChefPrice()}&guests=${chefGuests}&cuisine=${cuisine}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              {t('foodKitchen.bookChefSlot')}
            </Link>
          </div>
        </div>

        {/* Custom Cake Designer with Dynamic Weight */}
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
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              {t('foodKitchen.cakeDesc')}
            </p>

            {/* Cake Style Selection */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>{t('foodKitchen.decoratorStyle')}</label>
              <select
                value={cakeStyle}
                onChange={(e) => setCakeStyle(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
              >
                <option value="minimalist">{t('foodKitchen.minimalistCake')} (Base ₹999/kg)</option>
                <option value="fruit">{t('foodKitchen.fruitCake')} (Base ₹1,299/kg)</option>
                <option value="fondant">{t('foodKitchen.fondantCake')} (Base ₹1,899/kg)</option>
              </select>
            </div>

            {/* Dynamic Cake Weight Selector */}
            <div style={{ marginBottom: '16px', background: 'var(--gray-50)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>
                Select Cake Weight: <strong style={{ color: '#ea580c' }}>{cakeWeightKg} Kg</strong>
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[0.5, 1, 1.5, 2, 3, 5].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setCakeWeightKg(w)}
                    style={{
                      flex: 1,
                      minWidth: '42px',
                      padding: '5px 6px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: cakeWeightKg === w ? '#ea580c' : 'var(--gray-300)',
                      background: cakeWeightKg === w ? '#ea580c' : 'white',
                      color: cakeWeightKg === w ? 'white' : 'var(--gray-700)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Reference Upload simulator */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>{t('foodKitchen.refPhoto')}</label>
              <div style={{
                border: '1.5px dashed var(--gray-300)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                background: 'var(--gray-50)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                {cakeImage ? (
                  <img src={cakeImage} alt="Uploaded Cake reference" style={{ maxHeight: '70px', margin: '0 auto', borderRadius: '6px' }} />
                ) : (
                  <div>
                    <span style={{ fontSize: '1.4rem', display: 'flex', justifyContent: 'center', marginBottom: '2px', color: '#ea580c' }}>
                      <HiOutlineCamera />
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{t('foodKitchen.tapToUpload')}</span>
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{cakeWeightKg} Kg {cakeStyle.toUpperCase()} Cake</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateCakePrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent(`Celebration Custom Cake (${cakeStyle.toUpperCase()} • ${cakeWeightKg} Kg)`)}&serviceId=custom-cake&category=food-kitchen&price=${calculateCakePrice()}&weight=${cakeWeightKg}&cakeStyle=${cakeStyle}`}
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
              Backyard BBQ Setup <HiOutlineFire style={{ color: '#ea580c' }} />
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
              In-Home Baking Class <HiOutlineCake style={{ color: '#ec4899' }} />
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
              Kitchen & Pantry Clean <HiOutlineSparkles style={{ color: '#06b6d4' }} />
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
