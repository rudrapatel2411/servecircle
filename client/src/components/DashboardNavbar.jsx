import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiXMark,
  HiOutlineShieldCheck,
  HiOutlineWallet,
  HiOutlineCalendarDays,
  HiOutlineStar,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBolt,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
  HiOutlineViewColumns,
  HiOutlineHome,
  HiOutlineMagnifyingGlass as HiSearch,
  HiBars3,
  HiXMark as HiClose,
} from 'react-icons/hi2';
import LanguageToggle from './LanguageToggle';
import { socket } from '../socket';
import './DashboardNavbar.css';

const DashboardNavbar = ({ panel }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [latestToast, setLatestToast] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (panel === 'admin') {
      socket.connect();
      socket.emit('join_admin');

      socket.on('admin_notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
        setLatestToast(data);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      });

      return () => {
        socket.off('admin_notification');
        socket.disconnect();
      };
    }
  }, [panel]);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getProfileInitials = () => {
    if (panel === 'admin') return 'A';
    if (panel === 'worker') return 'R'; // Ramesh
    if (panel === 'b2b') return 'G'; // Green Valley
    return 'R'; // Rudra
  };

  const getUserDetails = () => {
    switch (panel) {
      case 'admin':
        return { name: 'System Admin', email: 'admin@servecircle.in' };
      case 'worker':
        return { name: 'Ramesh Kumar', email: 'ramesh@test.com' };
      case 'b2b':
        return { name: 'Green Valley Manager', email: 'gv@test.com' };
      default:
        return { name: 'Rudra Shah', email: 'rudra@test.com' };
    }
  };

  const user = getUserDetails();

  const customerTopNavLinks = [
    {
      path: '/customer',
      label: 'Dashboard',
      icon: <HiOutlineHome />,
      end: true,
    },
    {
      path: '/customer/services',
      label: 'Browse Services',
      icon: <HiSearch />,
      end: false,
    },
    {
      path: '/customer/general-services',
      label: 'General Services',
      icon: <HiOutlineSquares2X2 />,
      end: false,
    },
    {
      path: '/customer/events',
      label: 'Events Hub',
      icon: <HiOutlineSparkles />,
      end: false,
    },
    {
      path: '/customer/emergency',
      label: 'Emergency 24/7',
      icon: <HiOutlineBolt />,
      end: false,
      isEmergency: true,
    },
  ];

  return (
    <header className="dash-navbar">
      {/* ===== BRAND LOGO ===== */}
      <NavLink to={panel === 'customer' ? '/customer' : `/${panel}`} className="dash-brand">
        <div className="dash-brand-icon">SC</div>
        <span className="dash-brand-text">ServeCircle</span>
      </NavLink>

      {/* ===== CUSTOMER TOP NAV (centered) ===== */}
      {panel === 'customer' && (
        <>
          <nav className="customer-top-nav">
            {customerTopNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `customer-top-nav-link${isActive ? ' customer-top-nav-link--active' : ''}${link.isEmergency ? ' customer-top-nav-link--emergency' : ''}`
                }
              >
                <span className="customer-top-nav-icon">{link.icon}</span>
                <span className="customer-top-nav-label">{link.label}</span>
              </NavLink>
            ))}
          </nav>

        </>
      )}

      {/* ===== NON-CUSTOMER PANEL TITLE ===== */}
      {panel !== 'customer' && (
        <div className="dash-panel-title">
          <span className="dash-panel-badge">{panel}</span>
          <span className="dash-panel-label">
            {panel === 'worker' ? 'Worker Panel' : panel === 'admin' ? 'Admin Panel' : 'B2B Panel'}
          </span>
        </div>
      )}

      {/* ===== RIGHT ACTIONS ===== */}
      <div className="dash-navbar-actions">
        <button className="dash-icon-btn" aria-label={t('common.notifications')}>
          <HiOutlineBell />
          {notifications.length > 0 && <span className="notif-dot" style={{ background: 'var(--danger)' }} />}
        </button>

        {/* Profile Dropdown */}
        <div className="dash-profile-container" ref={dropdownRef}>
          <button
            className="dash-avatar-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Toggle profile menu"
          >
            <div className="dash-avatar">
              <span>{getProfileInitials()}</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="dash-profile-dropdown animate-fade-in">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  <span>{getProfileInitials()}</span>
                </div>
                <div className="user-details">
                  <h4 className="user-name">{user.name}</h4>
                  <span className="user-email">{user.email}</span>
                  <span className="user-badge">{panel}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-links" style={{ paddingBottom: '8px' }}>
                {/* Language Toggle in Profile Menu */}
                <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'center' }}>
                  <LanguageToggle />
                </div>
                <div className="dropdown-divider" style={{ margin: '8px 0' }} />

                {panel === 'customer' && (
                  <>
                    <Link
                      to="/customer/my-home"
                      className="dropdown-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HiOutlineShieldCheck className="dropdown-link-icon" style={{ color: '#3b7dc1' }} />
                      <span>{t('customer.myHome')}</span>
                    </Link>

                    <Link
                      to="/customer/bookings"
                      className="dropdown-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HiOutlineCalendarDays className="dropdown-link-icon" />
                      <span>{t('customer.myBookings')}</span>
                    </Link>

                    <Link
                      to="/customer/wallet"
                      className="dropdown-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HiOutlineWallet className="dropdown-link-icon" />
                      <span>{t('customer.wallet')}</span>
                    </Link>

                    <Link
                      to="/customer/subscriptions"
                      className="dropdown-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HiOutlineStar className="dropdown-link-icon" />
                      <span>{t('customer.subscriptions')}</span>
                    </Link>
                  </>
                )}

                {panel === 'worker' && (
                  <Link
                    to="/worker/profile"
                    className="dropdown-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <HiOutlineUser className="dropdown-link-icon" />
                    <span>{t('worker.profile')}</span>
                  </Link>
                )}

                <button
                  className="dropdown-link logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/login');
                  }}
                >
                  <HiOutlineArrowRightOnRectangle className="dropdown-link-icon text-danger" />
                  <span className="text-danger">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && latestToast && (
        <div className="toast-notification animate-slide-in-left" style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'white', borderLeft: '4px solid var(--primary-500)', boxShadow: 'var(--shadow-lg)', padding: '16px 24px', borderRadius: 'var(--radius-md)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--navy-800)' }}>{latestToast.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>{latestToast.message}</p>
          </div>
          <button onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '1.2rem' }}>
            <HiXMark />
          </button>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;
