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
  HiOutlineQrCode,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhone,
  HiCheckCircle,
} from 'react-icons/hi2';
import LanguageToggle from './LanguageToggle';
import WorkerVerifyModal from './WorkerVerifyModal';
import { socket, joinUserRoom, leaveUserRoom } from '../socket';
import { getSession, clearSession, API_BASE } from '../utils/authSession';
import {
  subscribeToCrossTabNotifications,
  getCachedNotifications,
  markAllCachedNotificationsRead,
  dismissCachedNotification,
} from '../utils/notificationSync';
import { getWorkerCategory, doesServiceMatchWorker } from '../utils/workerCategoryHelper';
import './DashboardNavbar.css';

const DashboardNavbar = ({ panel }) => {
  const { t } = useTranslation();
  const session = getSession();
  const sessionUser = session?.user;
  const workerCategory = panel === 'worker' ? getWorkerCategory(sessionUser) : null;

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [latestToast, setLatestToast] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [activeCallRequests, setActiveCallRequests] = useState([]); // For worker panel
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllCachedNotificationsRead();
    if (session?.token) {
      fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.token}` },
      }).catch(() => {});
    }
  };

  const dismissNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    dismissCachedNotification(id);
    if (session?.token) {
      fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      }).catch(() => {});
    }
  };

  const addNotification = (data, extra = {}) => {
    const notif = { ...data, read: false, ...extra };
    setNotifications((prev) => [notif, ...prev].slice(0, 50)); // Keep max 50
    setLatestToast(notif);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 6000);
  };

  // Accept a call request (for worker panel)
  const acceptCallRequest = async (requestId, phone) => {
    try {
      const token = session?.token;
      const res = await fetch(`${API_BASE}/call-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // Remove from active call requests
        setActiveCallRequests((prev) => prev.filter((r) => r.requestId !== requestId));
        // Update notification to show it was accepted
        setNotifications((prev) =>
          prev.map((n) =>
            n.requestId === requestId
              ? { ...n, accepted: true, title: '✅ Call Request Accepted', canAccept: false }
              : n
          )
        );
        // Show a toast with phone number
        addNotification({
          id: `accepted_${requestId}`,
          title: '📞 Please Call the Customer',
          message: `Call: ${data.phone} — ${data.customerName || ''} (${data.serviceType || ''})`,
          type: 'call_accepted',
          date: new Date().toLocaleString('en-IN'),
        });
      }
    } catch (err) {
      console.error('Failed to accept call request:', err);
    }
  };

  useEffect(() => {
    joinUserRoom(sessionUser, panel);

    // 1. Pre-seed state from local cache so notifications never disappear on refresh
    try {
      const cached = getCachedNotifications();
      if (cached && cached.length > 0) {
        const relevant = cached.filter((c) => {
          if (panel === 'admin') return true;
          if (panel === 'worker') return c.targetAudience === 'workers' || c.targetAudience === 'all' || c.type === 'call_request';
          return c.targetAudience === panel || c.targetAudience === 'all';
        });
        if (relevant.length > 0) {
          setNotifications(relevant);
        }
      }
    } catch {}

    // 2. Load persistent notifications from backend API
    const loadNotifications = async () => {
      try {
        const token = session?.token;
        if (!token) return;
        const res = await fetch(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.notifications || []).map((n) => ({
            id: n._id || n.id,
            title: n.title,
            message: n.message,
            type: n.type || 'broadcast',
            date: n.date || new Date(n.createdAt || Date.now()).toLocaleString('en-IN'),
            read: n.readBy?.includes?.(sessionUser?._id) || n.readBy?.includes?.(sessionUser?.id) || false,
          }));

          setNotifications((prev) => {
            const combined = [...mapped];
            for (const p of prev) {
              if (!combined.some((item) => item.id === p.id)) {
                combined.unshift(p);
              }
            }
            return combined.slice(0, 50);
          });
        }
      } catch {}
    };
    loadNotifications();

    const handleNotification = (data) => {
      if (panel === 'worker' && (data?.category || data?.service)) {
        if (!doesServiceMatchWorker(workerCategory, data.category, data.service || data.serviceType)) {
          return; // Category does not match this worker
        }
      }
      addNotification(data);
    };

    const handleStatusChange = (data) => {
      const toastPayload = {
        id: `status_${data.bookingId}_${Date.now()}`,
        title: '📋 Booking Update',
        message: `Booking #${data.bookingId} is now ${data.currentStatus?.replace(/_/g, ' ') || 'updated'}.`,
        type: 'booking_update',
        date: new Date().toLocaleString('en-IN'),
      };
      addNotification(toastPayload);
    };

    const handleCallRequest = (data) => {
      if (panel === 'worker' && (data?.category || data?.serviceType)) {
        if (!doesServiceMatchWorker(workerCategory, data.category, data.serviceType)) {
          return; // Belongs to a different service worker
        }
      }
      setActiveCallRequests((prev) => {
        if (prev.find((r) => r.requestId === data.requestId)) return prev;
        return [data, ...prev];
      });
      addNotification({ ...data, canAccept: true });
    };

    const handleCallRequestTaken = (data) => {
      setActiveCallRequests((prev) =>
        prev.filter((r) => r.requestId !== data.requestId)
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.requestId === data.requestId
            ? {
                ...n,
                canAccept: false,
                title: data.cancelled
                  ? '❌ Request Cancelled'
                  : `✅ Accepted by ${data.acceptedByWorkerName || 'another worker'}`,
              }
            : n
        )
      );
    };

    // 3. Listen to panel-specific socket events
    if (panel === 'admin') {
      socket.on('admin_notification', handleNotification);
    } else if (panel === 'worker') {
      socket.on('worker_notification', handleNotification);
      socket.on('call_request', handleCallRequest);
      socket.on('call_request_taken', handleCallRequestTaken);
    } else if (panel === 'customer') {
      socket.on('customer_notification', handleNotification);
    } else if (panel === 'b2b') {
      socket.on('b2b_notification', handleNotification);
    }

    socket.on('booking_status_changed', handleStatusChange);

    // 4. Cross-tab instant broadcast sync
    const unsubscribeCrossTab = subscribeToCrossTabNotifications((crossData) => {
      if (panel === 'admin') {
        addNotification(crossData);
      } else if (panel === 'worker') {
        const matches = doesServiceMatchWorker(workerCategory, crossData.category, crossData.serviceType || crossData.service);
        if (matches) {
          if (crossData.type === 'call_request') {
            handleCallRequest(crossData);
          } else {
            handleNotification(crossData);
          }
        }
      }
    });

    return () => {
      if (panel === 'admin') {
        socket.off('admin_notification', handleNotification);
      } else if (panel === 'worker') {
        socket.off('worker_notification', handleNotification);
        socket.off('call_request', handleCallRequest);
        socket.off('call_request_taken', handleCallRequestTaken);
      } else if (panel === 'customer') {
        socket.off('customer_notification', handleNotification);
      } else if (panel === 'b2b') {
        socket.off('b2b_notification', handleNotification);
      }
      socket.off('booking_status_changed', handleStatusChange);
      unsubscribeCrossTab();
    };
  }, [panel, sessionUser?.id, sessionUser?._id]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getProfileInitials = () => {
    if (sessionUser?.name) {
      return sessionUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (panel === 'admin') return 'A';
    if (panel === 'worker') return 'R'; // Ramesh
    if (panel === 'b2b') return 'G'; // Green Valley
    return 'R'; // Rudra
  };

  const getUserDetails = () => {
    if (sessionUser?.name && sessionUser?.email) {
      return { name: sessionUser.name, email: sessionUser.email };
    }
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
      path: '/customer/ai-chat',
      label: 'AI Assistant',
      icon: <HiOutlineChatBubbleLeftRight />,
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

  // Notification type → color mapping
  const notifTypeColor = {
    alert: '#ef4444',
    broadcast: '#3b82f6',
    system: '#8b5cf6',
    booking_update: '#f59e0b',
    call_request: '#10b981',
    call_accepted: '#10b981',
    promotion: '#ec4899',
    default: '#6b7280',
  };

  const notifTypeIcon = {
    call_request: '📞',
    call_accepted: '✅',
    booking_update: '📋',
    alert: '🔔',
    broadcast: '📢',
    system: '⚙️',
    promotion: '🎉',
  };

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
        {panel === 'customer' && (
          <button
            className="dash-icon-btn dash-ai-btn"
            aria-label="Open ServeCircle AI Assistant"
            title="ServeCircle AI"
            onClick={() => navigate('/customer/ai-chat')}
          >
            <HiOutlineChatBubbleLeftRight />
          </button>
        )}

        {/* ── Notification Bell with Dropdown ── */}
        <div className="dash-notif-container" ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="dash-icon-btn"
            aria-label={t('common.notifications')}
            onClick={() => setShowNotifDropdown((prev) => !prev)}
            style={{ position: 'relative' }}
          >
            <HiOutlineBell />
            {unreadCount > 0 && (
              <span
                className="notif-badge"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: unreadCount > 9 ? '20px' : '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifDropdown && (
            <div
              className="notif-dropdown animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                maxHeight: '480px',
                overflowY: 'auto',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb',
                zIndex: 9998,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '16px 16px 12px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'sticky',
                  top: 0,
                  background: 'white',
                  borderRadius: '16px 16px 0 0',
                  zIndex: 1,
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        fontSize: '0.75rem',
                        color: '#3b7dc1',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifDropdown(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', padding: '2px' }}
                  >
                    <HiXMark />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#9ca3af',
                  }}
                >
                  <HiOutlineBell style={{ fontSize: '2.5rem', marginBottom: '8px', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', margin: 0 }}>
                    No notifications yet
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '4px' }}>
                    You'll see updates here in real-time
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => {
                    const color = notifTypeColor[notif.type] || notifTypeColor.default;
                    const icon = notifTypeIcon[notif.type] || '🔔';
                    return (
                      <div
                        key={notif.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f9fafb',
                          background: notif.read ? 'white' : '#f0f9ff',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `${color}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          {icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: notif.read ? 600 : 700,
                              color: '#111827',
                              margin: '0 0 2px',
                              lineHeight: 1.3,
                            }}
                          >
                            {notif.title}
                          </p>
                          <p
                            style={{
                              fontSize: '0.78rem',
                              color: '#6b7280',
                              margin: '0 0 6px',
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                            }}
                          >
                            {notif.message}
                          </p>

                          {/* Accept button for call_request type (worker panel) */}
                          {notif.canAccept && notif.type === 'call_request' && panel === 'worker' && !notif.accepted && (
                            <button
                              onClick={() => acceptCallRequest(notif.requestId, notif.phone)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: '4px',
                              }}
                            >
                              <HiOutlinePhone style={{ fontSize: '0.9rem' }} />
                              Accept & Call Back
                            </button>
                          )}

                          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                            {notif.date || notif.timestamp || ''}
                          </span>
                        </div>
                        <button
                          onClick={() => dismissNotif(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d1d5db',
                            fontSize: '1rem',
                            padding: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <HiXMark />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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

                {/* Trust & Safety: Verify -> Verify Worker for ALL ROLES */}
                <button
                  className="dropdown-link"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsVerifyModalOpen(true);
                  }}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    borderRadius: '8px',
                    margin: '4px 0',
                  }}
                >
                  <HiOutlineQrCode className="dropdown-link-icon" style={{ color: '#2563eb' }} />
                  <span>Verify Worker</span>
                </button>

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
                      to="/customer/ordered-services"
                      className="dropdown-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HiOutlineSparkles className="dropdown-link-icon" style={{ color: '#d97706' }} />
                      <span>Ordered Services (Live)</span>
                    </Link>

                    <Link
                      to="/customer/bookings"
                      className="dropdown-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HiOutlineCalendarDays className="dropdown-link-icon" />
                      <span>{t('customer.myBookings', 'Booking History')}</span>
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
                    leaveUserRoom();
                    clearSession();
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

      <WorkerVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />

      {/* ── Toast Notification ── */}
      {showToast && latestToast && (
        <div
          className="toast-notification animate-slide-in-left"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'white',
            borderLeft: `4px solid ${notifTypeColor[latestToast.type] || 'var(--primary-500)'}`,
            boxShadow: 'var(--shadow-lg)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            maxWidth: '380px',
          }}
        >
          <span style={{ fontSize: '1.4rem', marginTop: '2px' }}>
            {notifTypeIcon[latestToast.type] || '🔔'}
          </span>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--navy-800)', fontWeight: 700 }}>
              {latestToast.title}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>
              {latestToast.message}
            </p>

            {/* Accept button inside toast for call_request (worker panel) */}
            {latestToast.canAccept && latestToast.type === 'call_request' && panel === 'worker' && (
              <button
                onClick={() => {
                  acceptCallRequest(latestToast.requestId, latestToast.phone);
                  setShowToast(false);
                }}
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <HiOutlinePhone />
                Accept Call Request
              </button>
            )}
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            <HiXMark />
          </button>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;
