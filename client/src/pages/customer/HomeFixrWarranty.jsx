import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHeart, HiOutlineShieldCheck, HiOutlineSparkles,
  HiOutlinePlusCircle, HiOutlineClock, HiOutlineChevronRight,
  HiOutlineInbox, HiOutlineTrash, HiOutlineCheckCircle
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const HomeFixrWarranty = () => {
  const { t } = useTranslation();
  
  const [appliances, setAppliances] = useState([
    {
      id: 1,
      name: 'Master Bedroom AC',
      brand: 'Daikin',
      purchaseDate: '2025-06-12',
      warrantyYears: 5,
      type: 'AC',
      status: 'Filter Cleaning Due',
      statusColor: '#f59e0b'
    },
    {
      id: 2,
      name: 'Living Room Smart TV',
      brand: 'Sony',
      purchaseDate: '2024-10-18',
      warrantyYears: 2,
      type: 'TV',
      status: 'Healthy',
      statusColor: 'var(--success)'
    },
    {
      id: 3,
      name: 'Double-Door Refrigerator',
      brand: 'LG',
      purchaseDate: '2023-01-05',
      warrantyYears: 10,
      type: 'Refrigerator',
      status: 'Compressor check suggested',
      statusColor: '#3b82f6'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    purchaseDate: '',
    warrantyYears: 2,
    type: 'AC'
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Calculate HomeFixr Health Score dynamically
  const calculateScore = () => {
    let baseScore = 75;
    appliances.forEach((app) => {
      if (app.status === 'Healthy') baseScore += 5;
      else if (app.status.includes('check')) baseScore += 2;
    });
    return Math.min(100, baseScore);
  };

  const currentScore = calculateScore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.purchaseDate) {
      setAlertMsg('Please fill in all fields!');
      return;
    }

    const newApp = {
      id: Date.now(),
      name: formData.name,
      brand: formData.brand,
      purchaseDate: formData.purchaseDate,
      warrantyYears: parseInt(formData.warrantyYears) || 2,
      type: formData.type,
      status: 'Healthy',
      statusColor: 'var(--success)'
    };

    setAppliances((prev) => [...prev, newApp]);
    setFormData({
      name: '',
      brand: '',
      purchaseDate: '',
      warrantyYears: 2,
      type: 'AC'
    });
    setShowAddForm(false);
    setAlertMsg('');

    // Trigger toast or message
    alert('🎉 Appliance registered successfully! Your HomeFixr score has increased.');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this appliance from the warranty tracker?')) {
      setAppliances((prev) => prev.filter((app) => app.id !== id));
    }
  };

  const getWarrantyStatus = (app) => {
    const pDate = new Date(app.purchaseDate);
    const expDate = new Date(pDate.setFullYear(pDate.getFullYear() + app.warrantyYears));
    const now = new Date();
    
    if (now > expDate) {
      return { label: 'Expired', color: 'var(--danger)' };
    } else {
      const diffTime = Math.abs(expDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { label: `Active (Expires in ${diffDays} days)`, color: 'var(--success)' };
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.homefixr')} ❤️</h1>
          <p className="page-subtitle">AI-powered home health intelligence and proactive warranty monitoring.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
        
        {/* Left Side: HomeFixr Score Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)', textAlign: 'center', background: 'var(--gradient-dark)', color: 'white' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', opacity: 0.9 }}>Your HomeFixr Health Score</h3>
            
            {/* Health Score Circular Gauge Mock */}
            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 20px' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                border: '12px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifySpace: 'center', flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{currentScore}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.85, margin: '0 10px 16px' }}>
              Your home electrical, plumbing, and HVAC systems are in <strong>{currentScore >= 85 ? 'Excellent' : 'Good'}</strong> standing.
            </p>

            <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              ✨ Registering appliances and completing routine checks boosts your score.
            </div>
          </div>

          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineSparkles style={{ color: 'var(--primary-500)' }} /> Recommended Actions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ padding: '6px', background: '#fee2e2', color: 'var(--danger)', borderRadius: '50%', display: 'inline-flex', fontSize: '0.9rem' }}>⚠️</span>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)' }}>Clean Master Bedroom AC Filter</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>Clogged filters reduce efficiency by 15% and lower air quality.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ padding: '6px', background: '#dbeafe', color: 'var(--primary-700)', borderRadius: '50%', display: 'inline-flex', fontSize: '0.9rem' }}>🔧</span>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)' }}>Compressor Tune-up</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>Annual inspection recommended for Refrigerator.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Smart Warranty Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800 }}>Registered Appliances</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px' }}>Store invoices, track warranty expirations, and set automated check-ups.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <HiOutlinePlusCircle /> Register New
              </button>
            </div>

            {/* Registration Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  onSubmit={handleRegister}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    overflow: 'hidden',
                    background: 'var(--gray-50)',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    border: '1.5px solid var(--gray-200)'
                  }}
                >
                  <h4 style={{ fontWeight: 800, marginBottom: '14px', color: 'var(--navy-800)' }}>New Appliance Registration</h4>
                  
                  {alertMsg && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '10px' }}>{alertMsg}</div>}

                  <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Appliance Nickname</label>
                      <input type="text" name="name" className="input-field" placeholder="e.g. Guest Room AC" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Brand Manufacturer</label>
                      <input type="text" name="brand" className="input-field" placeholder="e.g. Samsung" value={formData.brand} onChange={handleInputChange} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Purchase Date</label>
                      <input type="date" name="purchaseDate" className="input-field" value={formData.purchaseDate} onChange={handleInputChange} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Warranty Period (Years)</label>
                      <input type="number" name="warrantyYears" className="input-field" min={1} max={20} value={formData.warrantyYears} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Appliance Type</label>
                    <select name="type" className="input-field" value={formData.type} onChange={handleInputChange}>
                      <option value="AC">Air Conditioner (AC)</option>
                      <option value="TV">Television (TV)</option>
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Washing Machine">Washing Machine</option>
                      <option value="Geyser">Water Geyser</option>
                      <option value="Other">Other Electronic Appliance</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm">Confirm & Save</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List of Registered items */}
            {appliances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1.5px dashed var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                <HiOutlineInbox style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '10px' }} />
                <h4 style={{ color: 'var(--gray-400)' }}>No appliances registered yet</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appliances.map((app) => {
                  const wInfo = getWarrantyStatus(app);
                  return (
                    <div
                      key={app.id}
                      className="card"
                      style={{
                        padding: '18px',
                        border: '1px solid var(--gray-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ fontSize: '2rem', padding: '10px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                          {app.type === 'AC' ? '💨' : app.type === 'TV' ? '📺' : app.type === 'Refrigerator' ? '❄️' : '🔌'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>{app.name}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '3px' }}>
                            {app.brand} • Purchased: {app.purchaseDate}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                            <span style={{
                              display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: app.statusColor
                            }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>{app.status}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: wInfo.color, background: `${wInfo.color}12`, padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                          {wInfo.label}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => alert(`Warranty Document (Invoice #SC-INV-${app.id}) details downloaded locally.`)}
                          >
                            Download Invoice
                          </button>
                          <button
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }}
                            onClick={() => handleDelete(app.id)}
                            title="Remove appliance"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default HomeFixrWarranty;
