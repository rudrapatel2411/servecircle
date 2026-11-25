import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHeart, HiOutlineShieldCheck, HiOutlineSparkles,
  HiOutlinePlusCircle, HiOutlineClock, HiOutlineChevronRight,
  HiOutlineInbox, HiOutlineTrash, HiOutlineCheckCircle,
  HiOutlineExclamationTriangle, HiOutlineWrench, HiOutlineTv,
  HiOutlineCube, HiOutlineBolt, HiOutlineHome, HiOutlineXMark,
  HiOutlineArrowDownTray
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const DEFAULT_APPLIANCES = [
  {
    id: 1,
    name: 'Master Bedroom AC',
    brand: 'Daikin',
    model: 'FTKF50TV16U Inverter 1.5T',
    serialNumber: 'SN-DKN-88294021',
    purchaseDate: '2025-06-12',
    warrantyYears: 5,
    type: 'AC',
    status: 'Filter Cleaning Due',
    statusColor: 'var(--status-warning-text)'
  },
  {
    id: 2,
    name: 'Living Room Smart TV',
    brand: 'Sony',
    model: 'Bravia XR 55A80K OLED',
    serialNumber: 'SN-SNY-33104928',
    purchaseDate: '2024-10-18',
    warrantyYears: 2,
    type: 'TV',
    status: 'Healthy',
    statusColor: 'var(--status-success-text)'
  },
  {
    id: 3,
    name: 'Double-Door Refrigerator',
    brand: 'LG',
    model: 'GL-T382VESX 340L',
    serialNumber: 'SN-LG-99214739',
    purchaseDate: '2023-01-05',
    warrantyYears: 10,
    type: 'Refrigerator',
    status: 'Compressor check suggested',
    statusColor: 'var(--blue)'
  }
];

const HomeFixrWarranty = () => {
  const { t } = useTranslation();
  
  // Synchronized persistent state with MyHomeDashboard
  const [appliances, setAppliances] = useState(() => {
    try {
      const saved = localStorage.getItem('servecircle_myhome_appliances');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_APPLIANCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('servecircle_myhome_appliances', JSON.stringify(appliances));
    } catch {
      // Storage safe
    }
  }, [appliances]);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    purchaseDate: '',
    warrantyYears: 2,
    type: 'AC'
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Calculate HomeFixr Health Score dynamically
  const calculateScore = () => {
    let baseScore = 75;
    appliances.forEach((app) => {
      if (app.status === 'Healthy' || !app.status) baseScore += 5;
      else if (app.status && app.status.includes('check')) baseScore += 2;
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
      model: `${formData.brand} Standard`,
      serialNumber: `SN-${formData.brand.slice(0, 3).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      purchaseDate: formData.purchaseDate,
      warrantyYears: parseInt(formData.warrantyYears) || 2,
      type: formData.type,
      status: 'Healthy',
      statusColor: 'var(--status-success-text)',
      fileName: 'warranty_invoice.pdf'
    };

    setAppliances((prev) => [newApp, ...prev]);
    setFormData({
      name: '',
      brand: '',
      purchaseDate: '',
      warrantyYears: 2,
      type: 'AC'
    });
    setShowAddForm(false);
    setAlertMsg('');
    setToast(`"${newApp.name}" registered successfully! HomeFixr score increased.`);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    setAppliances((prev) => prev.filter((app) => app.id !== deleteCandidate.id));
    setToast(`Removed "${deleteCandidate.name}" from warranty tracker.`);
    setDeleteCandidate(null);
  };

  const handleDownloadInvoice = (app) => {
    const slipText = `=====================================================
SERVECIRCLE™ OFFICIAL DIGITAL WARRANTY SLIP
Appliance:     ${app.name}
Brand:         ${app.brand}
Serial Number: ${app.serialNumber || 'SN-SC-GEN-' + app.id}
Purchase Date: ${app.purchaseDate}
Warranty Term: ${app.warrantyYears} Years
=====================================================
Customer Care: 1800-SERVE-CIRCLE`;

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${app.brand}_${app.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast(`Invoice slip for ${app.name} downloaded successfully.`);
  };

  const getWarrantyStatus = (app) => {
    const pDate = new Date(app.purchaseDate);
    const expDate = new Date(pDate.setFullYear(pDate.getFullYear() + (parseInt(app.warrantyYears) || 2)));
    const now = new Date();
    
    if (now > expDate) {
      return { label: 'Expired', color: 'var(--status-danger-text)' };
    } else {
      const diffTime = Math.abs(expDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { label: `Active (Expires in ${diffDays} days)`, color: 'var(--status-success-text)' };
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--status-success-text)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.875rem'
        }}>
          <HiOutlineCheckCircle style={{ color: 'var(--status-success-soft)', fontSize: '1.2rem' }} />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>
            <HiOutlineXMark />
          </button>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            {t('customer.homefixr', 'HomeFixr™ Smart Warranty Vault')} <HiOutlineHeart style={{ color: 'var(--status-danger-text)' }} />
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0', color: 'var(--gray-600)' }}>
            AI-powered home health intelligence and proactive warranty monitoring.
          </p>
        </div>

        <Link to="/customer/my-home" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
          <HiOutlineHome /> Open My Home Cockpit
        </Link>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
        
        {/* Left Side: HomeFixr Score Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '28px', border: '1px solid var(--glass-edge)', textAlign: 'center', background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink) 100%)', color: 'white', borderRadius: '26px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', opacity: 0.9 }}>Your HomeFixr Health Score</h3>
            
            {/* Health Score Circular Gauge */}
            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 20px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '12px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: currentScore > 80 ? 'var(--status-success-text)' : currentScore > 60 ? 'var(--status-warning-text)' : 'var(--status-danger-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative'
              }}>
                <span style={{ fontSize: '3rem', fontWeight: 950 }}>{currentScore}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.8, margin: '0 10px 20px' }}>
              Based on your registered appliances, safety inspections, and preventive maintenance status.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/customer/my-home"
                className="btn" 
                style={{ background: 'var(--blue)', color: 'white', textDecoration: 'none', padding: '10px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '8px' }}
              >
                Go to Full Home Cockpit →
              </Link>
            </div>
          </div>

        </div>

        {/* Right Side: Registered Appliance List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '24px', borderRadius: '26px', border: '1px solid var(--glass-edge)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0 }}>Registered Home Appliances</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '2px 0 0 0' }}>Keep track of guarantee slips, repair schedules & breakdown risk.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <HiOutlinePlusCircle /> {showAddForm ? 'Close' : 'Add Appliance'}
              </button>
            </div>

            {/* Registration Form Modal / Accordion */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleRegister}
                  style={{
                    background: 'var(--bg-page)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid var(--glass-edge)'
                  }}
                >
                  <h4 style={{ fontWeight: 800, marginBottom: '14px', color: 'var(--navy-800)', fontSize: '0.9rem' }}>Register Appliance</h4>
                  
                  {alertMsg && <div style={{ color: 'var(--status-danger-text)', fontSize: '0.85rem', marginBottom: '10px', fontWeight: 700 }}>{alertMsg}</div>}

                  <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Appliance Name *</label>
                      <input type="text" name="name" className="input-field" placeholder="e.g. Living Room AC" value={formData.name} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Brand / Manufacturer *</label>
                      <input type="text" name="brand" className="input-field" placeholder="e.g. Daikin, Sony" value={formData.brand} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Purchase Date *</label>
                      <input type="date" name="purchaseDate" className="input-field" value={formData.purchaseDate} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Warranty Duration (Years)</label>
                      <input type="number" min="1" max="15" name="warrantyYears" className="input-field" value={formData.warrantyYears} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '14px', marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Category</label>
                    <select name="type" className="input-field" value={formData.type} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <option value="AC">Air Conditioner</option>
                      <option value="TV">Television</option>
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Washing Machine">Washing Machine</option>
                      <option value="Water Purifier">RO Water Purifier</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 800, background: 'var(--blue)' }}>Confirm & Save</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List of Registered items */}
            {appliances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1px solid var(--glass-edge)', borderRadius: '12px' }}>
                <HiOutlineInbox style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '10px' }} />
                <h4 style={{ color: 'var(--gray-400)', margin: 0 }}>No appliances registered yet</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {appliances.map((app) => {
                  const wInfo = getWarrantyStatus(app);
                  return (
                    <div
                      key={app.id}
                      className="card"
                      style={{
                        padding: '16px 20px',
                        border: '1px solid var(--glass-edge)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '12px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.6rem', padding: '10px', background: 'var(--bg-page)', borderRadius: '10px', display: 'flex', alignItems: 'center', color: 'var(--blue)' }}>
                          {app.type === 'AC' ? <HiOutlineBolt /> : app.type === 'TV' ? <HiOutlineTv /> : app.type === 'Refrigerator' ? <HiOutlineCube /> : <HiOutlineWrench />}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0 }}>{app.name}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: '3px 0 0 0' }}>
                            {app.brand} • Purchased: {app.purchaseDate}
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: wInfo.color, background: `${wInfo.color}15`, padding: '3px 10px', borderRadius: '12px' }}>
                          {wInfo.label}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleDownloadInvoice(app)}
                          >
                            <HiOutlineArrowDownTray /> Invoice
                          </button>
                          <button
                            style={{ background: 'none', border: 'none', color: 'var(--status-danger-text)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}
                            onClick={() => setDeleteCandidate(app)}
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

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '20px'
        }} onClick={() => setDeleteCandidate(null)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            width: '100%', maxWidth: '400px',
            padding: '24px',
            textAlign: 'center',
            border: '1px solid rgba(22, 70, 214, 0.1)',
            boxShadow: '0 25px 60px -12px rgba(11, 30, 79, 0.35)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--status-danger-tint)', color: 'var(--status-danger-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.6rem' }}>
              <HiOutlineTrash />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 900, color: 'var(--navy-900)' }}>
              Remove Appliance?
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              Remove <strong>{deleteCandidate.name}</strong> from warranty tracking?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '8px' }} onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" style={{ flex: 1, padding: '8px', background: 'var(--status-danger-text)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800 }} onClick={handleConfirmDelete}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeFixrWarranty;
