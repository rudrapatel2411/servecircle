import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCalendarDays, HiOutlineCheckCircle, HiOutlineClock, HiOutlineChevronRight } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const FoodKitchenHub = () => {
  // Tiffin Meal Builder state
  const [dietType, setDietType] = useState('veg'); // 'veg', 'non-veg', 'keto'
  const [duration, setDuration] = useState('monthly'); // 'weekly', 'monthly'
  const [isPaused, setIsPaused] = useState(false);

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
      <Link to="/customer/services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      {/* Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #facc15',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🍳</span>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              ServeCircle Food & Culinary Hub 🥘
            </h1>
            <p className="page-subtitle" style={{ color: '#ffedd5', fontSize: '0.9rem', marginTop: '4px' }}>
              Daily healthy tiffin subscriptions, professional home chefs on-demand, and custom designer cake artists.
            </p>
          </div>
        </div>
      </div>

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
              🍱 Tiffin Meal Plan Builder
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Build your daily lunch & dinner box plan, prepared in high-hygiene FSSAI-approved kitchens.
            </p>

            {/* Diet type */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['veg', 'non-veg', 'keto'].map((t) => (
                <button
                  key={t}
                  onClick={() => setDietType(t)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: dietType === t ? '#ea580c' : 'var(--gray-200)',
                    background: dietType === t ? 'rgba(234, 88, 12, 0.05)' : 'white',
                    color: dietType === t ? '#ea580c' : 'var(--gray-700)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {t}
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
                  {dur === 'weekly' ? '7 Days (Weekly)' : '30 Days (Monthly - 10% Off)'}
                </button>
              ))}
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
                <strong style={{ color: 'var(--navy-800)' }}>Pause Subscription</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--gray-500)' }}>Pause meals anytime during travel.</span>
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Subscription Total</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateTiffinPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Daily Tiffin Meal Plan Subscription')}&price=${calculateTiffinPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              Subscribe Plan
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
              👨🏼‍🍳 Gourmet Home Chef Roster
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Hire master culinary artists to prepare premium traditional Indian feasts, Mughlai biryanis, or fine Continental courses directly in your kitchen.
            </p>

            {/* Cuisine choice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { id: 'indian', name: 'Traditional Indian Feast 🥘', desc: 'Home-style authentic regional cuisines' },
                { id: 'mughlai', name: 'Royal Mughlai Banquet 🍲', desc: 'Aromatic gravies, rich biryanis, and kebabs' },
                { id: 'continental', name: 'Premium European Course 🥩', desc: 'Fine dining steaks, baked bakes, and rich pastas' }
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Chef Booking Fee</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{calculateChefPrice().toLocaleString()}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Gourmet Home Chef (Per Meal)')}&price=${calculateChefPrice()}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              Book Chef Slot
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
              🎂 Custom Designer Cake Studio
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Upload theme reference photos and book top-rated pastry decorators to curate delicious showstoppers for weddings, anniversaries, and milestone events.
            </p>

            {/* Cake Style Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>Decorator Style</label>
              <select
                value={cakeStyle}
                onChange={(e) => setCakeStyle(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
              >
                <option value="minimalist">Minimalist Korean Cream (₹1,499)</option>
                <option value="fruit">Fresh Exotic Fruit Gateau (₹1,799)</option>
                <option value="fondant">Luxury 3D Sculpted Fondant (₹2,999)</option>
              </select>
            </div>

            {/* Photo Reference Upload simulator */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>Reference Photo / Drawing</label>
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
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Tap to upload reference blueprint</span>
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Consultation & Booking</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{cakeStyle === 'minimalist' ? '1,499' : cakeStyle === 'fruit' ? '1,799' : '2,999'}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Grand Birthday Theme Decor')}&price=${cakeStyle === 'minimalist' ? 1499 : cakeStyle === 'fruit' ? 1799 : 2999}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#ea580c', borderColor: '#ea580c' }}
            >
              Order Cake
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FoodKitchenHub;
