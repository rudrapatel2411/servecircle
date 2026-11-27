import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
 markCachedNotificationRead,
 dismissCachedNotification,
 getDismissedNotificationIds,
 getReadNotificationIds,
 broadcastNotificationToTabs,
 isFakeNotification,
 isNotificationTargetedForSession,
} from '../utils/notificationSync';
import { getWorkerCategory, doesServiceMatchWorker } from '../utils/workerCategoryHelper';
import { acceptWorkflowBooking } from '../utils/serviceWorkflowEngine';
import { getWorkerSession, setWorkerSession, updateDutyStatus, respondToJobRequest } from '../pages/worker/workerApi';
import { playNotificationAlert } from '../utils/notificationSound';
import './DashboardNavbar.css';

const DashboardNavbar = ({ panel }) => {
 const { t } = useTranslation();
 const session = getSession();
 const workerSession = getWorkerSession();
 const sessionUser = panel === 'worker' ? (workerSession?.user || session?.user) : session?.user;
 const workerCategory = panel === 'worker' ? getWorkerCategory(sessionUser) : null;

 const [dutyStatus, setDutyStatus] = useState(() => {
 return workerSession?.user?.dutyStatus || sessionUser?.dutyStatus || 'online';
 });
 const [dutyLoading, setDutyLoading] = useState(false);
 const [showDutyMenu, setShowDutyMenu] = useState(false);
 const dutyMenuRef = useRef(null);

 const [notifications, setNotifications] = useState([]);
 const [showNotifDropdown, setShowNotifDropdown] = useState(false);
 const [showToast, setShowToast] = useState(false);
 const [latestToast, setLatestToast] = useState(null);
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
 const [activeCallRequests, setActiveCallRequests] = useState([]); // For worker panel
 const dropdownRef = useRef(null);
 const notifRef = useRef(null);
 const toastTimerRef = useRef(null);
 const lastDutyNotifRef = useRef({ status: null, ts: 0 });
 const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const navTimer = setTimeout(() => setIsNavigating(false), 320);

    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeLink = navRef.current.querySelector('.customer-top-nav-link--active');
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setIndicatorStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    const animId = requestAnimationFrame(updateIndicator);
    const timeoutId = setTimeout(updateIndicator, 40);

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(navTimer);
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

 const unreadCount = notifications.filter((n) => !n.read).length;

 const buildDutyNotification = (statusValue) => {
  const s = String(statusValue || '').toLowerCase();
  if (s === 'online') {
    return {
      id: `duty_online_${Date.now()}`,
      title: 'You are online',
      message: 'Worker is now online and ready to receive job requests.',
      type: 'duty_online',
      targetRole: 'worker',
      skipInbox: true,
      date: new Date().toLocaleString('en-IN'),
    };
  }
  if (s === 'paused') {
    return {
      id: `duty_paused_${Date.now()}`,
      title: 'Pause',
      message: 'Pause',
      type: 'duty_paused',
      targetRole: 'worker',
      skipInbox: true,
      date: new Date().toLocaleString('en-IN'),
    };
  }
  return {
    id: `duty_offline_${Date.now()}`,
    title: 'You are offline',
    message: 'Worker is now offline. New job dispatches are turned off.',
    type: 'duty_offline',
    targetRole: 'worker',
    skipInbox: true,
    date: new Date().toLocaleString('en-IN'),
  };
 };

 // Listen to external duty changes (e.g. from WorkerDutySwitch on dashboard or jobs page)
 useEffect(() => {
 const handleExternalDutyChange = (e) => {
 if (e.detail?.dutyStatus) {
 const nextStatus = e.detail.dutyStatus.toLowerCase();
 if (nextStatus !== dutyStatus.toLowerCase()) {
 setDutyStatus(nextStatus);
 }
 if (panel === 'worker') {
 const now = Date.now();
 const alreadyNotified =
 lastDutyNotifRef.current.status === nextStatus &&
 now - lastDutyNotifRef.current.ts < 1500;
 if (!alreadyNotified) {
 lastDutyNotifRef.current = { status: nextStatus, ts: now };
 addNotification(buildDutyNotification(nextStatus));
 }
 }
 }
 };
 window.addEventListener('servecircle:duty-changed', handleExternalDutyChange);
 return () => window.removeEventListener('servecircle:duty-changed', handleExternalDutyChange);
 }, [dutyStatus, panel]);

 const handleDutyToggle = async (targetStatus) => {
 if (dutyLoading || dutyStatus === targetStatus) {
 setShowDutyMenu(false);
 return;
 }
 setDutyLoading(true);
 setShowDutyMenu(false);
 const token = workerSession?.token || session?.token;
 let updatedUser = null;
 try {
 if (token && token !== 'demo-token-worker') {
 updatedUser = await updateDutyStatus(token, { dutyStatus: targetStatus });
 }
 setDutyStatus(targetStatus);
 const nextUser = {
 ...(workerSession?.user || session?.user || {}),
 dutyStatus: targetStatus,
 ...(updatedUser || {}),
 };
 if (workerSession) {
 setWorkerSession({ ...workerSession, user: nextUser });
 }
 lastDutyNotifRef.current = { status: targetStatus, ts: Date.now() };
 window.dispatchEvent(
 new CustomEvent('servecircle:duty-changed', {
 detail: { dutyStatus: targetStatus, user: nextUser },
 })
 );
 addNotification(buildDutyNotification(targetStatus));
 } catch (err) {
 console.warn('Duty toggle failed:', err);
 addNotification({
 id: `duty_err_${Date.now()}`,
 title: 'Duty Update Failed',
 message: err.message || 'Could not update duty status on server.',
 type: 'alert',
 date: new Date().toLocaleString('en-IN'),
 });
 } finally {
 setDutyLoading(false);
 }
 };

 const markAllRead = (e) => {
 if (e) e.stopPropagation();
 const ids = notifications.map((n) => n.id || n._id).filter(Boolean);
 setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
 markAllCachedNotificationsRead(ids);
 if (session?.token) {
 fetch(`${API_BASE}/notifications/read-all`, {
 method: 'PUT',
 headers: { Authorization: `Bearer ${session.token}` },
 }).catch(() => {});
 }
 };

 const markOneRead = (id, e) => {
 if (e) e.stopPropagation();
 if (!id) return;
 setNotifications((prev) =>
 prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
 );
 markCachedNotificationRead(id);
 if (session?.token) {
 fetch(`${API_BASE}/notifications/${id}/read`, {
 method: 'PUT',
 headers: { Authorization: `Bearer ${session.token}` },
 }).catch(() => {});
 }
 };

 const dismissNotif = (id, e) => {
 if (e) e.stopPropagation();
 if (!id) return;
 setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
 dismissCachedNotification(id);
 if (latestToast && (latestToast.id === id || latestToast._id === id)) {
 setShowToast(false);
 }
 if (session?.token) {
 fetch(`${API_BASE}/notifications/${id}`, {
 method: 'DELETE',
 headers: { Authorization: `Bearer ${session.token}` },
 }).catch(() => {});
 }
 };

 const directCallCustomer = (phone, customerName, notifObj) => {
 if (!phone) return;
 // Also mark accepted & notify admin if not already accepted
 if (notifObj && notifObj.requestId && !notifObj.accepted) {
 acceptCallRequest(notifObj.requestId, phone, notifObj);
 }
 // Open live in-app Worker Voice Console (avoids OS tel:/WhatsApp popup)
 window.dispatchEvent(
 new CustomEvent('servecircle:open-worker-call', {
 detail: { phone, customerName: customerName || 'Customer', autoStart: true },
 })
 );
 };

 const addNotification = (data, extra = {}) => {
 if (!data || isFakeNotification(data)) return;
 if (!isNotificationTargetedForSession(data, { panel, user: sessionUser, workerCategory })) return;
 const id = data.id || data._id || `notif_${Date.now()}`;
 const dismissed = getDismissedNotificationIds();
 if (dismissed.includes(id)) return;
 const readIds = getReadNotificationIds();
 const notif = { ...data, id, read: data.read || readIds.includes(id), ...extra };
 if (!notif.skipInbox) {
  setNotifications((prev) => {
  if (
  prev.some(
  (n) =>
  (n.id && n.id === notif.id) ||
  (notif.requestId && notif.type === 'call_request' && n.requestId === notif.requestId && n.type === 'call_request')
  )
  ) {
  return prev;
  }
  return [notif, ...prev].slice(0, 50);
  });
 }
 setLatestToast(notif);
 setShowToast(true);
 playNotificationAlert(notif);
 if (toastTimerRef.current) {
  clearTimeout(toastTimerRef.current);
 }
 toastTimerRef.current = setTimeout(() => setShowToast(false), 6500);
 };

 // Accept a call request (for worker panel)
 const acceptCallRequest = async (requestId, phone, extraNotif = {}) => {
 const workerName = sessionUser?.name || 'Assigned Worker';
 const workerEmail = sessionUser?.email || '';
 const workerPhone = sessionUser?.phone || '9876543210';
 const workerId = sessionUser?._id || sessionUser?.id || 'worker_id';
 const service = extraNotif.serviceType || extraNotif.category || workerCategory || 'Service';

 // Always update UI immediately & broadcast to Admin
 setActiveCallRequests((prev) => prev.filter((r) => r.requestId !== requestId));
 setNotifications((prev) =>
 prev.map((n) =>
 n.requestId === requestId
 ? { ...n, accepted: true, title: ' Call Request Accepted', canAccept: false }
 : n
 )
 );

 const acceptPayload = {
 requestId,
 phone,
 workerId,
 workerName,
 workerEmail,
 workerPhone,
 workerCategory,
 service,
 customerName: extraNotif.customerName || 'Customer',
 timestamp: new Date().toISOString(),
 date: new Date().toLocaleString('en-IN'),
 };

 try {
 socket.emit('worker_accepted_job', acceptPayload);
      socket.emit('worker_accepted_call', acceptPayload);
 socket.emit('call_request_taken', {
 requestId,
 acceptedByWorkerId: workerId,
 acceptedByWorkerName: workerName,
 });
 } catch {}

 broadcastNotificationToTabs({
 id: `accepted_${requestId}_${Date.now()}`,
 title: ' Call Request Accepted by Worker',
 message: `Worker "${workerName}" (${workerEmail}) accepted call request for ${service}. Customer phone: +91 ${phone}`,
 type: 'alert',
 targetAudience: 'admin',
 ...acceptPayload,
 });

 addNotification({
 id: `accepted_${requestId}`,
 title: ' Please Call the Customer',
 message: `Call: +91 ${phone} — ${acceptPayload.customerName} (${service})`,
 type: 'call_accepted',
 date: new Date().toLocaleString('en-IN'),
 });

 try {
 const token = session?.token;
 if (token) {
 await fetch(`${API_BASE}/call-requests/${requestId}/accept`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 });
 }
 } catch (err) {
 console.warn('Call accept API notice:', err.message);
 }
 };

 useEffect(() => {
 joinUserRoom(sessionUser, panel);

 // 1. Pre-seed state strictly filtered for this user and panel (Zero fake notifications)
    try {
      const cached = getCachedNotifications({ panel, user: sessionUser, workerCategory });
      setNotifications(cached || []);
    } catch {
      setNotifications([]);
    }

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
 const dismissed = new Set(getDismissedNotificationIds());
 const readIds = new Set(getReadNotificationIds());
 const mapped = (data.notifications || [])
 .filter((n) => !isFakeNotification(n))
 .filter((n) => !dismissed.has(n._id || n.id))
 .filter((n) => isNotificationTargetedForSession(n, { panel, user: sessionUser, workerCategory }))
 .map((n) => {
 const nid = n._id || n.id;
 return {
 ...n,
 id: nid,
 title: n.title,
 message: n.message,
 type: n.type || 'broadcast',
 date: n.date || new Date(n.createdAt || Date.now()).toLocaleString('en-IN'),
 read: readIds.has(nid) || n.readBy?.includes?.(sessionUser?._id) || n.readBy?.includes?.(sessionUser?.id) || false,
 };
 });

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
 if (isFakeNotification(data)) return;
 if (!isNotificationTargetedForSession(data, { panel, user: sessionUser, workerCategory })) return;
 addNotification(data);
 };

 const handleStatusChange = (data) => {
 const toastPayload = {
 id: `status_${data.bookingId}_${Date.now()}`,
 title: ' Booking Update',
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
 ? ' Request Cancelled'
 : ` Accepted by ${data.acceptedByWorkerName || 'another worker'}`,
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

 // 4. Cross-tab instant broadcast sync (Strict isolation, zero fake leakage)
    const unsubscribeCrossTab = subscribeToCrossTabNotifications((crossData) => {
      if (isFakeNotification(crossData)) return;
      if (!isNotificationTargetedForSession(crossData, { panel, user: sessionUser, workerCategory })) {
        return; // Block leaks to Admin, B2B, or other workers/customers
      }
      if (panel === 'worker' && crossData.type === 'call_request') {
        handleCallRequest(crossData);
      } else {
        addNotification(crossData);
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
 if (dutyMenuRef.current && !dutyMenuRef.current.contains(event.target)) {
 setShowDutyMenu(false);
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
 booking_confirmed: '#2563eb',
 booking_request: '#10b981',
 booking_accepted: '#10b981',
 worker_enroute: '#0ea5e9',
 worker_arrived: '#f59e0b',
 otp_verified: '#10b981',
 photo_uploaded: '#6366f1',
 service_started: '#2563eb',
 quote_received: '#f59e0b',
 quote_decided: '#8b5cf6',
 booking_completed: '#059669',
 duty_online: '#16a34a',
 duty_offline: '#64748b',
 duty_paused: '#d97706',
 call_request: '#10b981',
 call_accepted: '#10b981',
 promotion: '#ec4899',
 default: '#6b7280',
 };

 // Notification type → icon mapping
 const notifTypeIcon = {
 alert: '⚠️',
 broadcast: '📢',
 system: '⚙️',
 booking_update: '📅',
 booking_confirmed: '✅',
 booking_request: '⚡',
 booking_accepted: '🤝',
 worker_enroute: '🚗',
 worker_arrived: '📍',
 otp_verified: '🔐',
 photo_uploaded: '📸',
 service_started: '🔧',
 quote_received: '📋',
 quote_decided: '💬',
 booking_completed: '🎉',
 duty_online: '🟢',
 duty_offline: '⚫',
 duty_paused: '⏸️',
 call_request: '📞',
 call_accepted: '✅',
 promotion: '✨',
 default: '🔔',
 };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'call_request': return <HiOutlinePhone size={18} />;
      case 'call_accepted': return <HiCheckCircle size={18} />;
      case 'booking_update': return <HiOutlineCalendarDays size={18} />;
      case 'promotion': return <HiOutlineSparkles size={18} />;
      case 'system': return <HiOutlineBolt size={18} />;
      default: return <HiOutlineBell size={18} />;
    }
  };

  return (
    <header className="dash-navbar">
      {/* Top route progress loading bar */}
      {isNavigating && <div className="top-route-loader-bar" />}
      {/* ===== BRAND LOGO ===== */}
      <NavLink to={panel === 'customer' ? '/customer' : `/${panel}`} className="dash-brand">
        <div className="dash-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v10" />
            <path d="M8 12h8" />
          </svg>
        </div>
        <span className="dash-brand-text">ServeCircle</span>
      </NavLink>

      {/* ===== CUSTOMER TOP NAV (centered) ===== */}
      {panel === 'customer' && (
        <nav className="customer-top-nav" ref={navRef}>
          {/* Sliding Squircle Background Pill */}
          <span
            className="customer-top-nav-indicator"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
            aria-hidden="true"
          />
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
      )}

      {/* ===== NON-CUSTOMER PANEL TITLE ===== */}
      {panel !== 'customer' && (
        <div className="dash-panel-title">
          <span className="dash-panel-badge">{panel}</span>
          <span className="dash-panel-label">
            {panel === 'worker' ? 'Worker Panel' : panel === 'admin' ? 'Admin Dashboard' : 'B2B Client Portal'}
          </span>
        </div>
      )}

      {/* ===== RIGHT ACTIONS ===== */}
      <div className="dash-navbar-actions">
        {/* Worker Instant Duty Switch in Header (Demo UI Spring Toggle) */}
        {panel === 'worker' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: dutyStatus === 'online' ? '#2B8663' : dutyStatus === 'paused' ? '#b45309' : 'var(--ink2)',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}>
              {dutyLoading ? 'Updating...' : dutyStatus === 'online' ? 'Duty ON' : dutyStatus === 'paused' ? 'Paused' : 'Duty OFF'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={dutyStatus === 'online'}
              aria-label={dutyStatus === 'online' ? 'Turn duty off' : 'Turn duty on'}
              className={`sunken toggle ${dutyStatus === 'online' ? 'on' : ''}`}
              onClick={() => handleDutyToggle(dutyStatus === 'online' ? 'offline' : 'online')}
              disabled={dutyLoading}
              title="Click to toggle Online/Offline duty"
              style={{
                width: '64px',
                height: '34px',
                opacity: dutyLoading ? 0.65 : 1,
                background: dutyStatus === 'online' ? 'rgba(54, 160, 122, 0.16)' : 'rgba(255, 255, 255, 0.52)',
              }}
            >
              <span
                className="knob"
                style={{
                  width: '26px',
                  height: '26px',
                  top: '3px',
                  left: '3px',
                  transform: dutyStatus === 'online' ? 'translateX(30px)' : 'translateX(0)',
                  background: dutyStatus === 'online'
                    ? 'linear-gradient(135deg, #34d399, #059669)'
                    : 'linear-gradient(135deg, #94a3b8, #64748b)',
                  boxShadow: dutyStatus === 'online'
                    ? '0 5px 12px rgba(5, 150, 105, 0.45), inset 0 1px 2px rgba(255,255,255,0.5)'
                    : '0 4px 10px rgba(100, 116, 139, 0.35), inset 0 1px 2px rgba(255,255,255,0.5)',
                }}
              />
            </button>
          </div>
        )}

        {panel === 'admin' && (
          <div className="admin-filter-pill">
            <span>Last 30 Days</span>
            <span style={{ fontSize: '0.7rem' }}>⌵</span>
          </div>
        )}

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
 {getNotifIcon(notif.type)}
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

 {panel === 'worker' && (notif.type === 'booking_request' || notif.canAccept || notif.title?.toLowerCase?.().includes('job') || notif.bookingId || notif.message?.includes('SC-')) && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '4px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.78rem', background: '#16a34a', border: 'none', borderRadius: '6px' }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const targetBId = notif.bookingId || (notif.message?.match(/SC-\d+/)?.[0]) || notif.id;
                            acceptWorkflowBooking(targetBId, sessionUser);
                            const wToken = workerSession?.token || session?.token;
                            if (wToken && wToken !== 'demo-token-worker') {
                              try {
                                await respondToJobRequest(wToken, String(targetBId).replace(/^#/, ''), 'accept');
                              } catch {}
                            }
                            markOneRead(notif.id, e);
                            setShowNotifDropdown(false);
                            navigate('/worker/jobs');
                          }}
                        >
                          ✓ Accept Request
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifDropdown(false);
                            navigate('/worker/jobs');
                          }}
                        >
                          View on Map
                        </button>
                      </div>
                    )}
                    {/* Direct Call & Accept buttons for call notifications (worker panel) */}
 {panel === 'worker' && (notif.type === 'call_request' || notif.type === 'call_accepted' || notif.phone) && (
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', marginBottom: '6px' }}>
 {notif.phone && (
 <a
 href={`tel:${notif.phone}`}
 onClick={(e) => {
 e.preventDefault();
 directCallCustomer(notif.phone, notif.customerName, notif);
 }}
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 gap: '5px',
 background: '#2563eb',
 color: 'white',
 borderRadius: '8px',
 padding: '5px 10px',
 fontSize: '0.74rem',
 fontWeight: 800,
 textDecoration: 'none',
 cursor: 'pointer',
 }}
 >
 <HiOutlinePhone style={{ fontSize: '0.85rem' }} />
 Call +91 {notif.phone}
 </a>
 )}
 {notif.canAccept && notif.type === 'call_request' && !notif.accepted && (
 <button
 type="button"
 onClick={() => acceptCallRequest(notif.requestId, notif.phone, notif)}
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 gap: '5px',
 background: 'linear-gradient(135deg, #10b981, #059669)',
 color: 'white',
 border: 'none',
 borderRadius: '8px',
 padding: '5px 10px',
 fontSize: '0.74rem',
 fontWeight: 700,
 cursor: 'pointer',
 }}
 >
 <HiCheckCircle style={{ fontSize: '0.9rem' }} />
 Accept
 </button>
 )}
 </div>
 )}

 <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
 {notif.date}
 </span>
 </div>

 {/* Dismiss & Read Actions */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
 <button
 type="button"
 onClick={(e) => dismissNotif(notif.id || notif._id, e)}
 title="Dismiss notification"
 style={{
 background: 'transparent',
 border: 'none',
 color: '#9ca3af',
 cursor: 'pointer',
 padding: '2px',
 fontSize: '0.95rem',
 lineHeight: 1,
 }}
 >
 <HiXMark />
 </button>
 {!notif.read && (
 <button
 type="button"
 onClick={(e) => markOneRead(notif.id || notif._id, e)}
 title="Mark as read"
 style={{
 background: 'transparent',
 border: 'none',
 color: '#3b7dc1',
 cursor: 'pointer',
 padding: '2px',
 fontSize: '0.95rem',
 lineHeight: 1,
 }}
 >
 <HiCheckCircle />
 </button>
 )}
 </div>
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

 {/* Floating Important Popup Notification (Top-Right) */}
 {showToast && latestToast && (
 <div
 className="toast-notification toast-top-right"
 role="alert"
 aria-live="assertive"
 style={{
 position: 'fixed',
 top: '84px',
 bottom: 'auto',
 right: '24px',
 left: 'auto',
 background: 'rgba(255, 255, 255, 0.96)',
 backdropFilter: 'blur(16px)',
 WebkitBackdropFilter: 'blur(16px)',
 border: '1px solid rgba(226, 232, 240, 0.95)',
 borderLeft: `5px solid ${notifTypeColor[latestToast.type] || 'var(--primary-500)'}`,
 boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18), 0 4px 14px rgba(15, 23, 42, 0.08)',
 padding: '16px 20px',
 borderRadius: '16px',
 zIndex: 9999,
 display: 'flex',
 alignItems: 'flex-start',
 gap: '14px',
 maxWidth: '400px',
 minWidth: '300px',
 }}
 >
 <span style={{ fontSize: '1.5rem', marginTop: '2px', flexShrink: 0 }}>
 {notifTypeIcon[latestToast.type] || notifTypeIcon.default || '🔔'}
 </span>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
 <span
 style={{
 fontSize: '0.65rem',
 fontWeight: 800,
 textTransform: 'uppercase',
 letterSpacing: '0.06em',
 padding: '2px 7px',
 borderRadius: '999px',
 background: `${notifTypeColor[latestToast.type] || '#2563eb'}18`,
 color: notifTypeColor[latestToast.type] || '#2563eb',
 }}
 >
 Important Update
 </span>
 </div>
 <h4 style={{ fontSize: '0.98rem', margin: '0 0 4px', color: 'var(--navy-800)', fontWeight: 800 }}>
 {latestToast.title}
 </h4>
 <p style={{ fontSize: '0.84rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.4 }}>
 {latestToast.message}
 </p>

 {/* Direct Job Request Accept button inside toast for worker panel */}
	{panel === 'worker' && (latestToast.canAccept || latestToast.type === 'booking_request') && (
		<div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
			<button
				type="button"
				style={{
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
				onClick={(e) => {
					e.stopPropagation();
					const targetBId = latestToast.bookingId || (latestToast.message?.match(/SC-\d+/)?.[0]) || latestToast.id;
					acceptWorkflowBooking(targetBId, sessionUser);
					const wToken = workerSession?.token || session?.token;
					if (wToken && wToken !== 'demo-token-worker') {
						respondToJobRequest(wToken, String(targetBId).replace(/^#/, ''), 'accept').catch(() => {});
					}
					markOneRead(latestToast.id || latestToast._id, e);
					setShowToast(false);
					navigate('/worker/jobs');
				}}
			>
				✓ Accept Request
			</button>
			<button
				type="button"
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '6px',
					background: '#f1f5f9',
					color: '#334155',
					border: '1px solid #cbd5e1',
					borderRadius: '8px',
					padding: '6px 12px',
					fontSize: '0.8rem',
					fontWeight: 600,
					cursor: 'pointer',
				}}
				onClick={(e) => {
					e.stopPropagation();
					setShowToast(false);
					navigate('/worker/jobs');
				}}
			>
				View on Map
			</button>
		</div>
	)}

	{/* Direct Call & Accept buttons inside toast for worker panel */}
 {panel === 'worker' && (latestToast.type === 'call_request' || latestToast.phone) && (
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
 {latestToast.phone && (
 <a
 href={`tel:${latestToast.phone}`}
 onClick={(e) => {
 e.preventDefault();
 directCallCustomer(latestToast.phone, latestToast.customerName, latestToast);
 setShowToast(false);
 }}
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 gap: '6px',
 background: '#2563eb',
 color: 'white',
 borderRadius: '8px',
 padding: '6px 12px',
 fontSize: '0.78rem',
 fontWeight: 800,
 textDecoration: 'none',
 cursor: 'pointer',
 }}
 >
 <HiOutlinePhone />
 Call +91 {latestToast.phone}
 </a>
 )}
 {latestToast.canAccept && latestToast.type === 'call_request' && !latestToast.accepted && (
 <button
 type="button"
 onClick={() => {
 acceptCallRequest(latestToast.requestId, latestToast.phone, latestToast);
 setShowToast(false);
 }}
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
 }}
 >
 <HiCheckCircle />
 Accept Call
 </button>
 )}
 </div>
 )}
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
 <button
 type="button"
 onClick={(e) => {
 dismissNotif(latestToast.id || latestToast._id, e);
 setShowToast(false);
 }}
 title="Dismiss notification"
 style={{
 background: '#f1f5f9',
 border: 'none',
 borderRadius: '6px',
 color: '#475569',
 cursor: 'pointer',
 fontSize: '1.1rem',
 width: '26px',
 height: '26px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <HiXMark />
 </button>
 {!latestToast.read && (
 <button
 type="button"
 onClick={(e) => {
 markOneRead(latestToast.id || latestToast._id, e);
 setShowToast(false);
 }}
 title="Mark as read"
 style={{
 background: '#eff6ff',
 border: '1px solid #bfdbfe',
 borderRadius: '6px',
 color: '#2563eb',
 cursor: 'pointer',
 fontSize: '1rem',
 width: '26px',
 height: '26px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <HiCheckCircle />
 </button>
 )}
 </div>
 </div>
 )}
 </header>
 );
};

export default DashboardNavbar;
