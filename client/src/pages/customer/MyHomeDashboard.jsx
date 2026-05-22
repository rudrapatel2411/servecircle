import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineHome, HiOutlineShieldCheck, HiOutlineSparkles,
  HiOutlinePlusCircle, HiOutlineClock, HiOutlineTrash,
  HiOutlineCheckCircle, HiOutlineWrench, HiOutlineCalendarDays,
  HiOutlineArrowRight, HiOutlineArrowUpOnSquare, HiOutlineArrowPath
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const MyHomeDashboard = () => {
  const { t } = useTranslation();

  // Maintenance Timeline State
  const [timelineItems, setTimelineItems] = useState([
    {
      id: 1,
      title: 'AC Deep Cleaning & Servicing',
      dueDate: 'Due in 30 days',
      urgency: 'warning',
      points: 8,
      completed: false,
      completedDate: null
    },
    {
      id: 2,
      title: 'Water Tank Sanitization',
      dueDate: 'Due in 90 days',
      urgency: 'normal',
      points: 5,
      completed: false,
      completedDate: null
    },
    {
      id: 3,
      title: 'Electrical Safety Inspection',
      dueDate: 'Completed 15 days ago',
      urgency: 'completed',
      points: 5,
      completed: true,
      completedDate: '2026-05-05'
    },
    {
      id: 4,
      title: 'Pest Control Treatment',
      dueDate: 'Due in 120 days',
      urgency: 'normal',
      points: 6,
      completed: false,
      completedDate: null
    }
  ]);

  // Appliance Warranty State
  const [appliances, setAppliances] = useState([
    {
      id: 1,
      name: 'Master Bedroom AC',
      brand: 'Daikin',
      purchaseDate: '2025-06-12',
      warrantyYears: 5,
      type: 'AC',
      fileName: 'daikin_ac_invoice.pdf'
    },
    {
      id: 2,
      name: 'Living Room Smart TV',
      brand: 'Sony',
      purchaseDate: '2024-10-18',
      warrantyYears: 2,
      type: 'TV',
      fileName: 'sony_tv_invoice.pdf'
    },
    {
      id: 3,
      name: 'Double-Door Refrigerator',
      brand: 'LG',
      purchaseDate: '2023-01-05',
      warrantyYears: 10,
      type: 'Refrigerator',
      fileName: 'lg_fridge_bill.pdf'
    }
  ]);

  // Form State for new appliance registration
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    purchaseDate: '',
    warrantyYears: 2,
    type: 'AC'
  });
  
  // File Upload Mock State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Calculate HomeFixr Health Score dynamically
  const calculateScore = () => {
    let baseScore = 65;
    
    // Add points for each completed maintenance timeline item
    timelineItems.forEach(item => {
      if (item.completed) {
        baseScore += item.points;
      }
    });

    // Add points for registered appliances
    baseScore += Math.min(15, appliances.length * 5);

    return Math.min(100, baseScore);
  };

  const currentScore = calculateScore();

  // Mark timeline item as complete
  const markComplete = (id) => {
    setTimelineItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, completed: true, urgency: 'completed', dueDate: 'Completed Just Now', completedDate: new Date().toISOString().split('T')[0] } 
          : item
      )
    );
    alert('🎉 Maintenance item marked complete! Your HomeFixr Health Score has increased.');
  };

  // Reset Maintenance Timeline
  const resetTimeline = () => {
    setTimelineItems([
      {
        id: 1,
        title: 'AC Deep Cleaning & Servicing',
        dueDate: 'Due in 30 days',
        urgency: 'warning',
        points: 8,
        completed: false,
        completedDate: null
      },
      {
        id: 2,
        title: 'Water Tank Sanitization',
        dueDate: 'Due in 90 days',
        urgency: 'normal',
        points: 5,
        completed: false,
        completedDate: null
      },
      {
        id: 3,
        title: 'Electrical Safety Inspection',
        dueDate: 'Completed 15 days ago',
        urgency: 'completed',
        points: 5,
        completed: true,
        completedDate: '2026-05-05'
      },
      {
        id: 4,
        title: 'Pest Control Treatment',
        dueDate: 'Due in 120 days',
        urgency: 'normal',
        points: 6,
        completed: false,
        completedDate: null
      }
    ]);
  };

  // Appliance input handle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // File Upload Mock Simulator
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFile(file.name);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Register New Appliance
  const handleRegisterAppliance = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.purchaseDate) {
      setAlertMsg('Please fill in all required fields!');
      return;
    }

    const newAppliance = {
      id: Date.now(),
      name: formData.name,
      brand: formData.brand,
      purchaseDate: formData.purchaseDate,
      warrantyYears: parseInt(formData.warrantyYears) || 2,
      type: formData.type,
      fileName: uploadedFile || 'standard_invoice.pdf'
    };

    setAppliances(prev => [...prev, newAppliance]);
    setFormData({
      name: '',
      brand: '',
      purchaseDate: '',
      warrantyYears: 2,
      type: 'AC'
    });
    setUploadedFile(null);
    setUploadProgress(0);
    setShowAddForm(false);
    setAlertMsg('');

    alert('🎉 Appliance registered successfully in the digital Warranty Register!');
  };

  // Delete Appliance
  const handleDeleteAppliance = (id) => {
    if (window.confirm('Are you sure you want to remove this appliance?')) {
      setAppliances(prev => prev.filter(app => app.id !== id));
    }
  };

  // Get Warranty Status
  const getWarrantyStatus = (app) => {
    const purchase = new Date(app.purchaseDate);
    const expire = new Date(purchase.getFullYear() + app.warrantyYears, purchase.getMonth(), purchase.getDate());
    const now = new Date();

    if (now > expire) {
      return { label: 'Expired', color: '#ef4444', isExpired: true };
    } else {
      const diffTime = expire - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { label: `Active (${diffDays} days left)`, color: '#10b981', isExpired: false };
    }
  };

  return (
    <div className="page-content">
      {/* Title Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{t('customer.myHome')} 🏡</h1>
          <p className="page-subtitle">Your interactive home maintenance cockpit, appliance warranty vault, and HomeFixr health indicator.</p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={resetTimeline}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
        >
          <HiOutlineArrowPath /> Reset Timeline
        </button>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: HOMEFIXR HEALTH SCORE & RECOMMENDED REPEAT BOOKINGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Health Score Card */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)', textAlign: 'center', background: 'var(--gradient-dark)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', opacity: 0.9 }}>HomeFixr Health Index</h3>
            
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 20px' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                border: '12px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: currentScore >= 80 ? '#10b981' : currentScore >= 60 ? '#f59e0b' : '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                position: 'relative', transition: 'all 0.5s ease'
              }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{currentScore}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.85, margin: '0 10px 16px' }}>
              Your home health status is <strong>{currentScore >= 80 ? 'Excellent' : currentScore >= 65 ? 'Stable' : 'Needs Attention'}</strong>. 
              {currentScore < 100 && ' Tackle upcoming timeline events to secure 100% HomeFixr rating!'}
            </p>

            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              💡 <strong>Instant Boosts:</strong> Complete AC Servicing (+8 pts) or register new appliances in the warranty registry (+5 pts each).
            </div>
          </div>

          {/* Seasonal Repeat Booking Suggestions */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <HiOutlineSparkles style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800 }}>Smart Seasonal Alerts</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
              Based on local climate and seasonality patterns, these preventive bookings protect against breakdown damages:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Alert 1 */}
              <div style={{ padding: '14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', background: '#34d399', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, textTransform: 'uppercase' }}>Recommended</span>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>Monsoon AC & Leak Proofing</h4>
                  </div>
                  <span style={{ fontSize: '1.3rem' }}>⛈️</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#047857' }}>
                  Prevent AC water dripping and wall dampness. Includes structural check of external compressor bracket.
                </p>
                <Link to="/customer/services" className="btn btn-primary btn-sm" style={{ background: '#10b981', alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '4px' }}>
                  Book Monsoon Prep
                </Link>
              </div>

              {/* Alert 2 */}
              <div style={{ padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', background: '#fbbf24', color: '#78350f', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, textTransform: 'uppercase' }}>Autumn Check</span>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e', marginTop: '4px' }}>Water Tank Sanitization</h4>
                  </div>
                  <span style={{ fontSize: '1.3rem' }}>💧</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#b45309' }}>
                  Regular tank cleaning every 6 months prevents algae build-up. Recommended timing: pre-winter transition.
                </p>
                <Link to="/customer/services" className="btn btn-primary btn-sm" style={{ background: '#f59e0b', color: 'white', alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '4px' }}>
                  Schedule Cleaning
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE MAINTENANCE TIMELINE & DIGITAL WARRANTY REGISTER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Maintenance Timeline Card */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '4px' }}>Interactive Maintenance Timeline</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '24px' }}>Track, schedule, and mark routine safety events to verify standard maintenance compliance.</p>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px', borderLeft: '2.5px dashed var(--gray-200)', gap: '24px' }}>
              
              {timelineItems.map((item, index) => {
                let badgeColor = 'var(--gray-500)';
                let badgeBg = 'var(--gray-100)';
                let circleColor = 'var(--gray-300)';

                if (item.urgency === 'warning') {
                  badgeColor = '#d97706';
                  badgeBg = '#fef3c7';
                  circleColor = '#fbbf24';
                } else if (item.urgency === 'normal') {
                  badgeColor = 'var(--primary-700)';
                  badgeBg = '#e6f4ea';
                  circleColor = 'var(--primary-400)';
                } else if (item.urgency === 'completed') {
                  badgeColor = '#16a34a';
                  badgeBg = '#dcfce7';
                  circleColor = '#22c55e';
                }

                return (
                  <div key={item.id} style={{ position: 'relative' }}>
                    
                    {/* Circle Node */}
                    <div style={{
                      position: 'absolute',
                      left: '-34px',
                      top: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'white',
                      border: `3px solid ${circleColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 0 0 4px white'
                    }}>
                      {item.completed && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.6 : 1 }}>
                          {item.title}
                        </h4>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: badgeColor, background: badgeBg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            {item.dueDate}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                            Boosts Score: <strong>+{item.points} pts</strong>
                          </span>
                        </div>
                      </div>

                      {!item.completed ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => markComplete(item.id)}
                          >
                            Mark Done
                          </button>
                          <Link 
                            to="/customer/services"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            Book Slot <HiOutlineArrowRight />
                          </Link>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
                          <HiOutlineCheckCircle /> Verified Safe
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Digital Warranty Vault Card */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800 }}>Appliance Warranty Register</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '2px' }}>Upload bills, calculate active statuses, and set automated breakdown alerts.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <HiOutlinePlusCircle /> Register Appliance
              </button>
            </div>

            {/* Appliance Registration Form Widget */}
            {showAddForm && (
              <form
                onSubmit={handleRegisterAppliance}
                style={{
                  background: 'var(--gray-50)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1.5px solid var(--gray-200)',
                  transition: 'all 0.3s ease'
                }}
              >
                <h4 style={{ fontWeight: 800, marginBottom: '14px', color: 'var(--navy-800)', fontSize: '0.9rem' }}>Appliance Verification Details</h4>
                
                {alertMsg && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '10px' }}>{alertMsg}</div>}

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Appliance Name *</label>
                    <input type="text" name="name" className="input-field" placeholder="e.g. Master Bedroom Geyser" value={formData.name} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Manufacturer / Brand *</label>
                    <input type="text" name="brand" className="input-field" placeholder="e.g. Havells" value={formData.brand} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Purchase Date *</label>
                    <input type="date" name="purchaseDate" className="input-field" value={formData.purchaseDate} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Warranty Duration (Years) *</label>
                    <input type="number" name="warrantyYears" className="input-field" min={1} max={15} value={formData.warrantyYears} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Category Type</label>
                  <select name="type" className="input-field" value={formData.type} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                    <option value="AC">Air Conditioner (AC)</option>
                    <option value="TV">Television (TV)</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="Geyser">Water Geyser</option>
                    <option value="Other">Other Electronic Appliance</option>
                  </select>
                </div>

                {/* Simulated Invoice Receipt Upload */}
                <div style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--gray-300)', textAlign: 'center', marginBottom: '16px' }}>
                  <input type="file" id="invoice-upload" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
                  <label htmlFor="invoice-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineArrowUpOnSquare style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)' }}>
                      {uploadedFile ? `Attached: ${uploadedFile}` : 'Upload Invoice Bill / Guarantee Card'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>PDF or Images up to 5MB</span>
                  </label>

                  {isUploading && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary-500)', transition: 'width 0.15s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '4px', display: 'inline-block' }}>Uploading: {uploadProgress}%</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Verify & Add</button>
                </div>
              </form>
            )}

            {/* List of Registered Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {appliances.map((app) => {
                const wStatus = getWarrantyStatus(app);
                return (
                  <div
                    key={app.id}
                    style={{
                      padding: '16px',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.8rem', padding: '8px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        {app.type === 'AC' ? '💨' : app.type === 'TV' ? '📺' : app.type === 'Refrigerator' ? '❄️' : '🔌'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>{app.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          {app.brand} • Purchased: {app.purchaseDate}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', background: '#e6f4ea', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: 600 }}>
                          📄 {app.fileName}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: wStatus.color, background: `${wStatus.color}12`, padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>
                        {wStatus.label}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                          onClick={() => alert(`Warranty Document (${app.fileName}) downloaded successfully.`)}
                        >
                          Invoice
                        </button>
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
                          onClick={() => handleDeleteAppliance(app.id)}
                          title="Remove Appliance"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MyHomeDashboard;
