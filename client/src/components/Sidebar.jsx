import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlineCalendarDays,
  HiOutlineWallet,
  HiOutlineStar,
  HiOutlineBriefcase,
  HiOutlineClipboardDocumentList,
  HiOutlineBanknotes,
  HiOutlineAcademicCap,
  HiOutlineUserCircle,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineTicket,
  HiOutlineExclamationTriangle,
  HiOutlineBell,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineReceiptPercent,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCpuChip,
  HiOutlineShieldCheck,
  HiOutlineVideoCamera,
  HiOutlineMap,
  HiOutlineBolt,
  HiOutlineSparkles,
  HiOutlineCheckBadge,
  HiOutlineTruck,
  HiOutlineHeart,
} from 'react-icons/hi2';
import './Sidebar.css';

const sidebarConfig = {
  customer: [
    { path: '/customer', icon: <HiOutlineHome />, labelKey: 'customer.dashboard', end: true },
    { path: '/customer/services', icon: <HiOutlineMagnifyingGlass />, labelKey: 'customer.browseServices' },
    { path: '/customer/emergency', icon: <HiOutlineBolt style={{ color: '#ef4444' }} />, labelKey: 'customer.emergencyHub' },
    { path: '/customer/events', icon: <HiOutlineSparkles style={{ color: '#eab308' }} />, labelKey: 'customer.eventsHub' },
    { path: '/customer/my-home', icon: <HiOutlineShieldCheck style={{ color: '#10b981' }} />, labelKey: 'customer.myHome' },
    { path: '/customer/become-a-pro', icon: <HiOutlineAcademicCap style={{ color: '#f97316' }} />, labelKey: 'customer.becomeAPro' },
    { path: '/customer/trust-safety', icon: <HiOutlineCheckBadge style={{ color: '#3b82f6' }} />, labelKey: 'customer.trustSafety' },
    { path: '/customer/relocation', icon: <HiOutlineTruck style={{ color: '#a855f7' }} />, labelKey: 'categories.relocation' },
    { path: '/customer/health-wellness', icon: <HiOutlineHeart style={{ color: '#f43f5e' }} />, labelKey: 'categories.healthWellness' },
    { path: '/customer/pet-services', icon: <HiOutlineSparkles style={{ color: '#3b82f6' }} />, labelKey: 'categories.petServices' },
    { path: '/customer/food-kitchen', icon: <HiOutlineBuildingOffice2 style={{ color: '#10b981' }} />, labelKey: 'categories.foodKitchen' },
    { path: '/customer/travel-commute', icon: <HiOutlineMap style={{ color: '#06b6d4' }} />, labelKey: 'categories.travelCommute' },
    { path: '/customer/society-management', icon: <HiOutlineUserGroup style={{ color: '#84cc16' }} />, labelKey: 'categories.societyManagement' },
    { path: '/customer/bookings', icon: <HiOutlineCalendarDays />, labelKey: 'customer.myBookings' },
    { path: '/customer/wallet', icon: <HiOutlineWallet />, labelKey: 'customer.wallet' },
    { path: '/customer/subscriptions', icon: <HiOutlineStar />, labelKey: 'customer.subscriptions' },
  ],
  worker: [
    { path: '/worker', icon: <HiOutlineHome />, labelKey: 'worker.dashboard', end: true },
    { path: '/worker/jobs', icon: <HiOutlineBriefcase />, labelKey: 'worker.jobRequests' },
    { path: '/worker/schedule', icon: <HiOutlineClipboardDocumentList />, labelKey: 'worker.mySchedule' },
    { path: '/worker/earnings', icon: <HiOutlineBanknotes />, labelKey: 'worker.earnings' },
    { path: '/worker/training', icon: <HiOutlineAcademicCap />, labelKey: 'worker.training' },
    { path: '/worker/profile', icon: <HiOutlineUserCircle />, labelKey: 'worker.profile' },
  ],
  admin: [
    { path: '/admin', icon: <HiOutlineHome />, labelKey: 'admin.dashboard', end: true },
    { path: '/admin/bookings', icon: <HiOutlineCalendarDays />, labelKey: 'admin.bookings' },
    { path: '/admin/workers', icon: <HiOutlineUsers />, labelKey: 'admin.workers' },
    { path: '/admin/analytics', icon: <HiOutlineChartBar />, labelKey: 'admin.analytics' },
    { path: '/admin/coupons', icon: <HiOutlineTicket />, labelKey: 'admin.coupons' },
    { path: '/admin/complaints', icon: <HiOutlineExclamationTriangle />, labelKey: 'admin.complaints' },
    { path: '/admin/partners', icon: <HiOutlineBuildingOffice2 />, labelKey: 'admin.partners' },
    { path: '/admin/notifications', icon: <HiOutlineBell />, labelKey: 'admin.notifications' },
  ],
  b2b: [
    { path: '/b2b', icon: <HiOutlineHome />, labelKey: 'b2b.dashboard', end: true },
    { path: '/b2b/booking', icon: <HiOutlineReceiptPercent />, labelKey: 'b2b.bulkBooking' },
    { path: '/b2b/contracts', icon: <HiOutlineDocumentText />, labelKey: 'b2b.contracts' },
    { path: '/b2b/locations', icon: <HiOutlineMapPin />, labelKey: 'b2b.locations' },
    { path: '/b2b/team', icon: <HiOutlineUserGroup />, labelKey: 'b2b.teamAccounts' },
    { path: '/b2b/invoices', icon: <HiOutlineReceiptPercent />, labelKey: 'b2b.invoices' },
  ],
};

const panelLabels = {
  customer: { icon: 'CU', label: 'Customer Panel' },
  worker: { icon: 'WK', label: 'Worker Panel' },
  admin: { icon: 'AD', label: 'Admin Panel' },
  b2b: { icon: 'B2', label: 'B2B Panel' },
};

const Sidebar = ({ panel }) => {
  const { t } = useTranslation();
  const links = sidebarConfig[panel] || [];
  const panelInfo = panelLabels[panel];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <div className="logo-icon">SC</div>
          <span className="logo-text">ServeCircle</span>
        </NavLink>
        <div className="sidebar-panel-badge">
          <span>{panelInfo?.icon}</span>
          <span>{panelInfo?.label}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span className="sidebar-link-text">{t(link.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/login" className="sidebar-link">
          <span className="sidebar-link-icon"><HiOutlineCog6Tooth /></span>
          <span className="sidebar-link-text">{t('common.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
