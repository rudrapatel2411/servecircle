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
      completedDate: null,
      targetPath: '/customer/services/home-repairs/ac-repair'
    },
    {
      id: 2,
      title: 'Water Tank Sanitization',
      dueDate: 'Due in 90 days',
      urgency: 'normal',
      points: 5,
      completed: false,
      completedDate: null,
      targetPath: '/customer/services/cleaning/water-tank-clean'
    },
    {
      id: 3,
      title: 'Electrical Safety Inspection',
      dueDate: 'Completed 15 days ago',
      urgency: 'completed',
      points: 5,
      completed: true,
      completedDate: '2026-05-05',
      targetPath: '/customer/services/home-repairs/electrician-visit'
    },
    {
      id: 4,
      title: 'Pest Control Treatment',
      dueDate: 'Due in 120 days',
      urgency: 'normal',
      points: 6,
      completed: false,
      completedDate: null,
      targetPath: '/customer/services/cleaning/pest-control'
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
  const [showManualFields, setShowManualFields] = useState(false);
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

  // Search, Filter, and AI Scanning states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showTrackingMap, setShowTrackingMap] = useState(false);
  const [mapUrl, setMapUrl] = useState("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.074090240974!2d77.62534571738283!3d12.9226343!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1466099187a5%3A0x67ba4f3fc58702cb!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin");

  const openTrackingMap = () => {
    setShowTrackingMap(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapUrl(`https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`);
        },
        (error) => {
          console.warn("Geolocation denied or failed, using default map.");
        }
      );
    }
  };

  // Interactive Maintenance timeline states
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');

  // Toggle maintenance timeline completion state easily
  const toggleTimelineItem = (id) => {
    setTimelineItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          return {
            ...item,
            completed: nextCompleted,
            urgency: nextCompleted ? 'completed' : (id === 1 ? 'warning' : 'normal'),
            dueDate: nextCompleted ? 'Completed Just Now' : (id === 1 ? 'Due in 30 days' : id === 2 ? 'Due in 90 days' : 'Due in 120 days')
          };
        }
        return item;
      })
    );
  };

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
        completedDate: null,
        targetPath: '/customer/services/home-repairs/ac-repair'
      },
      {
        id: 2,
        title: 'Water Tank Sanitization',
        dueDate: 'Due in 90 days',
        urgency: 'normal',
        points: 5,
        completed: false,
        completedDate: null,
        targetPath: '/customer/services/cleaning/water-tank-clean'
      },
      {
        id: 3,
        title: 'Electrical Safety Inspection',
        dueDate: 'Completed 15 days ago',
        urgency: 'completed',
        points: 5,
        completed: true,
        completedDate: '2026-05-05',
        targetPath: '/customer/services/home-repairs/electrician-visit'
      },
      {
        id: 4,
        title: 'Pest Control Treatment',
        dueDate: 'Due in 120 days',
        urgency: 'normal',
        points: 6,
        completed: false,
        completedDate: null,
        targetPath: '/customer/services/cleaning/pest-control'
      }
    ]);
  };

  // Appliance input handle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // AI Invoice OCR Scanner Simulator
  const triggerAIScan = (fileName) => {
    setIsScanning(true);
    setScanStage('Initializing OCR engine...');

    setTimeout(() => {
      setScanStage('Scanning visual receipt layers...');
      setTimeout(() => {
        setScanStage('Extracting invoice lines & merchant metadata...');
        setTimeout(() => {
          setScanStage('AI matching manufacturer catalog...');
          setTimeout(() => {
            setIsScanning(false);
            
            // Generate mock data based on filename matching
            const lowerName = fileName.toLowerCase();
            let matchedData = {
              name: 'Havells Instant Geyser',
              brand: 'Havells',
              purchaseDate: '2026-02-15',
              warrantyYears: 3,
              type: 'Geyser'
            };

            if (lowerName.includes('ac') || lowerName.includes('daikin') || lowerName.includes('carrier')) {
              matchedData = {
                name: 'Daikin Premium Split AC',
                brand: 'Daikin',
                purchaseDate: '2025-08-14',
                warrantyYears: 5,
                type: 'AC'
              };
            } else if (lowerName.includes('fridge') || lowerName.includes('lg') || lowerName.includes('refrigerator')) {
              matchedData = {
                name: 'LG Double-Door Refrigerator',
                brand: 'LG',
                purchaseDate: '2024-05-10',
                warrantyYears: 10,
                type: 'Refrigerator'
              };
            } else if (lowerName.includes('tv') || lowerName.includes('sony') || lowerName.includes('samsung')) {
              matchedData = {
                name: 'Sony Bravia 4K TV',
                brand: 'Sony',
                purchaseDate: '2025-01-20',
                warrantyYears: 2,
                type: 'TV'
              };
            } else if (lowerName.includes('wash') || lowerName.includes('machine') || lowerName.includes('ifb')) {
              matchedData = {
                name: 'IFB Front-Load Washing Machine',
                brand: 'IFB',
                purchaseDate: '2025-11-05',
                warrantyYears: 4,
                type: 'Washing Machine'
              };
            }

            setFormData(matchedData);
            alert(`🤖 ServeCircle AI Scan Complete!\nSuccessfully extracted invoice details: ${matchedData.name} (${matchedData.brand}) from ${fileName}. The form has been autofilled.`);
          }, 800);
        }, 800);
      }, 800);
    }, 600);
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
          
          // Trigger the AI scanning process
          triggerAIScan(file.name);
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

  // Get Warranty Status with Expiring Soon indicator (<= 90 days)
  const getWarrantyStatus = (app) => {
    const purchase = new Date(app.purchaseDate);
    const expire = new Date(purchase.getFullYear() + app.warrantyYears, purchase.getMonth(), purchase.getDate());
    const now = new Date();

    if (now > expire) {
      return { label: 'Expired', color: '#ef4444', isExpired: true, expiringSoon: false };
    } else {
      const diffTime = expire - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const expiringSoon = diffDays <= 90;
      return { 
        label: expiringSoon ? `Expiring Soon (${diffDays} days)` : `Active (${diffDays} days left)`, 
        color: expiringSoon ? '#f59e0b' : '#10b981', 
        isExpired: false, 
        expiringSoon 
      };
    }
  };

  // Calculate Warranty Progress Percentage
  const getWarrantyProgress = (app) => {
    const purchase = new Date(app.purchaseDate);
    const expire = new Date(purchase.getFullYear() + app.warrantyYears, purchase.getMonth(), purchase.getDate());
    const now = new Date();
    
    if (now > expire) return 0;
    
    const totalDuration = expire - purchase;
    const remaining = expire - now;
    return Math.max(0, Math.min(100, Math.round((remaining / totalDuration) * 100)));
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

      {/* Onboarding Guide Banner */}
      <div className="card animate-fade-in-up" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%)',
        border: '1.5px solid var(--primary-200)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--primary-700)', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏡</span> How to use your Home Dashboard
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--navy-600)', lineHeight: 1.4 }}>
            Maintain your home, safeguard warranties, and boost your Home Health index in 3 simple steps:
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.65rem' }}>1</span>
              Complete timeline events
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.65rem' }}>2</span>
              Upload bills to auto-scan warranties
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.65rem' }}>3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Live Booking Tracker */}
      <div className="card animate-fade-in-up" style={{
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid var(--navy-800)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6' }}>
            <span style={{ fontSize: '1.5rem' }}>🚚</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: '#3b82f6', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Tracking</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Order #SC-89241</span>
            </div>
            <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Complete Home Relocation</h4>
            <p style={{ color: '#cbd5e1', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Expert assigned: Rajesh Kumar. OTP to start: <strong style={{ color: '#10b981', letterSpacing: '1px' }}>4521</strong></p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}>View Details</button>
          <button className="btn btn-primary" style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', cursor: 'pointer' }} onClick={openTrackingMap}>Track Partner 📍</button>
        </div>
      </div>

      {/* ServeCircle Prime Subscription Upsell */}
      <div className="card animate-fade-in-up" style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1.5px solid #fde68a',
        borderRadius: 'var(--radius-md)',
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2rem' }}>👑</div>
          <div>
            <h4 style={{ color: '#b45309', margin: 0, fontSize: '1rem', fontWeight: 900 }}>ServeCircle Prime (AMC)</h4>
            <p style={{ color: '#92400e', margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 600 }}>Get Free Visits, 0% Platform Fees & Priority Support for 1 Year.</p>
          </div>
        </div>
        <button className="btn" style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', cursor: 'pointer' }}>
          Join at ₹999/yr
        </button>
      </div>

      <div className="dashboard-grid animate-fade-in-up" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: HOMEFIXR HEALTH SCORE & RECOMMENDED REPEAT BOOKINGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Health Score Card */}
          <div 
            className="card hover-lift" 
            onClick={() => setShowHealthModal(true)}
            style={{ padding: '28px', border: '1px solid var(--gray-200)', textAlign: 'center', background: 'var(--gradient-dark)', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', opacity: 0.9, color: 'white' }}>HomeFixr Health Index</h3>
            
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

            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '12px' }}>
              💡 <strong>Instant Boosts:</strong> Complete AC Servicing (+8 pts) or register new appliances in the warranty registry (+5 pts each).
            </div>
            
            <button 
              className="btn btn-outline btn-sm" 
              onClick={(e) => { e.stopPropagation(); setShowHealthModal(true); }}
              style={{ width: '100%', padding: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
            >
              📊 View Detailed Health Audit
            </button>
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
                <Link to="/customer/services/festive-seasonal/waterproofing" className="btn btn-primary btn-sm" style={{ background: '#10b981', alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '4px' }}>
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
                <Link to="/customer/services/cleaning/water-tank-clean" className="btn btn-primary btn-sm" style={{ background: '#f59e0b', color: 'white', alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '4px' }}>
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
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '18px' }}>Track, schedule, and mark routine safety events to verify standard maintenance compliance.</p>

            {/* Timeline Status Filter Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px' }}>
              {['ALL', 'PENDING', 'COMPLETED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setTimelineFilter(filter); setBookingItem(null); }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: timelineFilter === filter ? 'var(--gradient-primary)' : 'var(--gray-100)',
                    color: timelineFilter === filter ? 'white' : 'var(--navy-600)',
                    transition: 'all 0.2s ease',
                    boxShadow: timelineFilter === filter ? '0 4px 10px rgba(99, 102, 241, 0.2)' : 'none'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px', borderLeft: '2.5px dashed var(--gray-200)', gap: '24px' }}>
              
              {timelineItems
                .filter(item => {
                  if (timelineFilter === 'PENDING') return !item.completed;
                  if (timelineFilter === 'COMPLETED') return item.completed;
                  return true;
                })
                .map((item, index) => {
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
                      
                      {/* Interactive Circle Checkbox Node */}
                      <div 
                        onClick={() => toggleTimelineItem(item.id)}
                        title="Click to toggle safety completion"
                        style={{
                          position: 'absolute',
                          left: '-34px',
                          top: '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: item.completed ? '#22c55e' : 'white',
                          border: `3px solid ${item.completed ? '#22c55e' : circleColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          cursor: 'pointer',
                          boxShadow: '0 0 0 4px white',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        {item.completed && (
                          <span style={{ fontSize: '0.62rem', color: 'white', fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 
                            onClick={() => toggleTimelineItem(item.id)}
                            style={{ 
                              fontSize: '0.95rem', 
                              fontWeight: 800, 
                              color: 'var(--navy-800)', 
                              textDecoration: item.completed ? 'line-through' : 'none', 
                              opacity: item.completed ? 0.5 : 1,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
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
                            <button 
                              className="btn btn-primary btn-sm"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => {
                                setBookingItem(item);
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                setBookingDate(tomorrow.toISOString().split('T')[0]);
                              }}
                            >
                              Book Slot <HiOutlineArrowRight />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
                            <HiOutlineCheckCircle /> Verified Safe
                          </div>
                        )}
                      </div>

                      {/* Inline Quick Schedule Module */}
                      {bookingItem?.id === item.id && (
                        <div style={{
                          background: 'var(--gray-50)',
                          border: '1.5px solid var(--primary-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          marginTop: '12px',
                          boxShadow: 'var(--shadow-sm)',
                          animation: 'fadeInUp 0.3s ease'
                        }}>
                          <h5 style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--navy-800)', marginBottom: '8px' }}>
                            📅 Quick Schedule: {item.title}
                          </h5>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: '4px' }}>Date *</label>
                              <input 
                                type="date" 
                                className="input-field" 
                                value={bookingDate} 
                                onChange={(e) => setBookingDate(e.target.value)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%', height: '36px' }} 
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: '4px' }}>Time Slot *</label>
                              <select 
                                className="input-field" 
                                value={bookingTime} 
                                onChange={(e) => setBookingTime(e.target.value)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%', height: '36px' }}
                              >
                                <option>09:00 AM - 11:00 AM</option>
                                <option>11:00 AM - 01:00 PM</option>
                                <option>02:00 PM - 04:00 PM</option>
                                <option>04:00 PM - 06:00 PM</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setBookingItem(null)}>Cancel</button>
                            <button 
                              className="btn btn-primary btn-sm" 
                              style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'var(--gradient-primary)' }} 
                              onClick={() => {
                                markComplete(item.id);
                                setBookingItem(null);
                                alert(`📅 Slot Booked Successfully!\nScheduled your ${item.title} for ${bookingDate} during ${bookingTime}. Professional has been dispatched.`);
                              }}
                            >
                              Confirm Booking
                            </button>
                          </div>
                        </div>
                      )}
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

                {/* Animated AI OCR Scanner overlay during scanning state */}
                {isScanning ? (
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '2px dashed var(--primary-400)',
                    borderRadius: 'var(--radius-md)',
                    padding: '30px 20px',
                    textAlign: 'center',
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Glowing moving scanning bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: 'linear-gradient(to right, transparent, var(--primary-500), transparent)',
                      boxShadow: '0 0 12px var(--primary-500)',
                      animation: 'scanLine 2s linear infinite'
                    }} />
                    <style>{`
                      @keyframes scanLine {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}</style>
                    <span style={{ fontSize: '2.5rem', display: 'block', animation: 'pulse 1.5s infinite' }}>🤖</span>
                    <h5 style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.95rem', marginTop: '10px' }}>AI Smart Receipt Scan Active</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--navy-600)', marginTop: '6px', fontWeight: 600 }}>{scanStage}</p>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)', display: 'block', marginTop: '12px' }}>Autofilling invoice metadata...</span>
                  </div>
                ) : (
                  <>
                    {/* Simulated Invoice Receipt Upload - PRIORITIZED AT THE TOP */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '2px dashed var(--primary-300)', textAlign: 'center', marginBottom: '16px' }}>
                      <input type="file" id="invoice-upload" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
                      <label htmlFor="invoice-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineArrowUpOnSquare style={{ fontSize: '2rem', color: 'var(--primary-600)' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                          {uploadedFile ? `Attached: ${uploadedFile}` : '📸 Scan Invoice Bill / Guarantee Card'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', maxWidth: '280px', lineHeight: 1.4 }}>
                          Upload your bill. Our AI will automatically scan and fill all warranty details instantly!
                        </span>
                      </label>

                      {isUploading && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary-500)', transition: 'width 0.15s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '4px', display: 'inline-block' }}>Uploading bill: {uploadProgress}%</span>
                        </div>
                      )}
                    </div>

                    {/* Toggle manual details link */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setShowManualFields(!showManualFields)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-600)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {showManualFields ? 'Hide manual details form' : 'Or fill appliance details manually'}
                      </button>
                    </div>

                    {/* Collapsible Manual Fields */}
                    {showManualFields && (
                      <div className="animate-fade-in">
                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Appliance Name *</label>
                            <input type="text" name="name" className="input-field" placeholder="e.g. Master Bedroom AC" value={formData.name} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                          </div>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Manufacturer / Brand *</label>
                            <input type="text" name="brand" className="input-field" placeholder="e.g. Daikin" value={formData.brand} onChange={handleInputChange} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
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

                        <div className="input-group" style={{ marginBottom: '16px' }}>
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
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline btn-sm" disabled={isScanning} onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isScanning}>Verify & Add</button>
                </div>
              </form>
            )}

            {/* Search & Category Filter Header for registered items */}
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Search Bar */}
              <div style={{ display: 'flex', background: 'var(--gray-50)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--gray-400)' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search registered appliances..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', flex: 1, color: 'var(--navy-800)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--gray-400)' }}>✕</button>
                )}
              </div>

              {/* Category Filter Badges */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                {['ALL', 'AC', 'TV', 'Refrigerator', 'Washing Machine', 'Geyser', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: selectedCategory === cat ? 'var(--gradient-primary)' : 'var(--gray-100)',
                      color: selectedCategory === cat ? 'white' : 'var(--navy-600)',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedCategory === cat ? '0 4px 10px rgba(99, 102, 241, 0.2)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Registered Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {appliances
                .filter(app => {
                  const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       app.brand.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCat = selectedCategory === 'ALL' || app.type === selectedCategory;
                  return matchesSearch && matchesCat;
                })
                .map((app) => {
                  const wStatus = getWarrantyStatus(app);
                  const isExpiring = wStatus.expiringSoon;
                  const progressPercent = getWarrantyProgress(app);
                  return (
                    <div
                      key={app.id}
                      style={{
                        padding: '16px',
                        border: isExpiring ? '1.5px solid #fde68a' : '1px solid var(--gray-200)',
                        background: isExpiring ? '#fffbeb' : 'white',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                        transition: 'all 0.3s ease',
                        boxShadow: isExpiring ? '0 4px 12px rgba(245, 158, 11, 0.08)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.8rem', padding: '8px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                          {app.type === 'AC' ? '💨' : app.type === 'TV' ? '📺' : app.type === 'Refrigerator' ? '❄️' : '🔌'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>{app.name}</h4>
                            {isExpiring && (
                              <span style={{ fontSize: '0.65rem', background: '#fbbf24', color: '#78350f', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>⚠️ Expiring Soon</span>
                            )}
                          </div>
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

      {/* Home Health Detailed Audit Modal */}
      {showHealthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
          fontFamily: 'var(--font-body)'
        }}
        onClick={() => setShowHealthModal(false)}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 'var(--radius-lg)',
            width: '92%',
            maxWidth: '560px',
            padding: '36px',
            boxShadow: 'var(--shadow-2xl), 0 0 50px rgba(99, 102, 241, 0.1)',
            position: 'relative',
            transform: 'scale(1)',
            transition: 'all 0.3s ease',
            color: 'var(--navy-800)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowHealthModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'var(--gray-100)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray-600)',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '3rem' }}>🩺</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--navy-900)', marginTop: '12px' }}>HomeFixr™ Safety & Health Audit</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '4px' }}>Real-time breakdown of structural, appliance, and preventive standards.</p>
            </div>

            {/* score progress indicator bar */}
            <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>Overall Safety Compliance</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: currentScore >= 80 ? 'var(--success)' : 'var(--warning)' }}>{currentScore}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'var(--gray-200)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${currentScore}%`, height: '100%', background: currentScore >= 80 ? 'var(--success)' : 'var(--warning)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Audit Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category Breakdowns</h4>
              
              {/* timelines item list summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>💨 HVAC & Air Quality</span>
                <strong style={{ color: timelineItems.find(item => item.id === 1)?.completed ? 'var(--success)' : 'var(--warning)' }}>
                  {timelineItems.find(item => item.id === 1)?.completed ? 'Safe & Verified' : 'Deep Clean Required'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>💧 Hydraulic & Tanks</span>
                <strong style={{ color: timelineItems.find(item => item.id === 2)?.completed ? 'var(--success)' : 'var(--warning)' }}>
                  {timelineItems.find(item => item.id === 2)?.completed ? 'Sanitary' : 'Sanitization Overdue'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚡ Electrical Grid</span>
                <strong style={{ color: timelineItems.find(item => item.id === 3)?.completed ? 'var(--success)' : 'var(--warning)' }}>
                  {timelineItems.find(item => item.id === 3)?.completed ? 'Standard Checked' : 'Inspection Pending'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🕷️ Pest Prevention</span>
                <strong style={{ color: timelineItems.find(item => item.id === 4)?.completed ? 'var(--success)' : 'var(--warning)' }}>
                  {timelineItems.find(item => item.id === 4)?.completed ? 'Safe Barrier' : 'Treatment Overdue'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🛡️ Digital Appliance Registry</span>
                <strong>{appliances.length} Registered ({Math.min(15, appliances.length * 5)}/15 pts)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowHealthModal(false)}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                Close Report
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowHealthModal(false);
                  resetTimeline();
                  alert('HomeFixr checklist reset successfully! Time to boost your score again.');
                }}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                Reset Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Map Modal */}
      {showTrackingMap && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card animate-fade-in-up" style={{
            background: 'white',
            width: '100%',
            maxWidth: '800px',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Header */}
            <div style={{ background: 'var(--navy-900)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📍</span> Live Partner Tracking
                </h3>
                <p style={{ color: 'var(--gray-400)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Order #SC-89241 • Reaching in 5 mins</p>
              </div>
              <button 
                onClick={() => setShowTrackingMap(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Map Container */}
            <div style={{ width: '100%', height: '450px', background: '#e2e8f0', position: 'relative' }}>
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Live Tracking Map"
              ></iframe>
              
              {/* Fake UI Overlay on Map */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80" alt="Partner" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }} />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>Rajesh Kumar <HiOutlineCheckCircle style={{ color: '#10b981' }} /></h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Relocation Expert • 4.9 ★ (120+ Jobs)</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--navy-600)', fontWeight: 700 }}>Current Location: Koramangala 4th Block</p>
                </div>
                <button className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981', padding: '10px 20px', fontSize: '0.85rem' }} onClick={() => alert('Calling Partner...')}>
                  📞 Call Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyHomeDashboard;
