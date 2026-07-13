import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineHome,
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
  HiOutlineWrench,
  HiOutlineTruck,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineMap,
  HiOutlineClock,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { generalServicesData } from '../data/generalServicesData';
import './Sidebar.css';

/* =====================================================
   GENERAL SERVICES CATEGORY MENU (customer panel)
   ===================================================== */
const generalServicesCategories = generalServicesData.map(c => ({
  path: c.path,
  icon: c.icon,
  label: c.label,
  color: c.color,
  comingSoon: c.comingSoon
}));
/* =====================================================
   NON-CUSTOMER PANEL SIDEBARS
   ===================================================== */
const sidebarConfig = {
  worker: [
    { path: '/worker', icon: <HiOutlineHome />, labelKey: 'worker.dashboard', end: true },
    { path: '/worker/jobs', icon: <HiOutlineBriefcase />, labelKey: 'worker.jobRequests' },
    { path: '/worker/schedule', icon: <HiOutlineClipboardDocumentList />, labelKey: 'worker.mySchedule' },
    { path: '/worker/earnings', icon: <HiOutlineBanknotes />, labelKey: 'worker.earnings' },
    { path: '/worker/training', icon: <HiOutlineAcademicCap />, labelKey: 'worker.training' },
    { path: '/worker/profile', icon: <HiOutlineUserCircle />, labelKey: 'worker.profile' },
    { path: '/worker/become-a-pro', icon: <HiOutlineAcademicCap style={{ color: '#f97316' }} />, labelKey: 'customer.becomeAPro' },
  ],
  admin: [
    { path: '/admin', icon: <HiOutlineHome />, labelKey: 'admin.dashboard', end: true },
    { path: '/admin/bookings', icon: <HiOutlineClipboardDocumentList />, labelKey: 'admin.bookings' },
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
  worker: { icon: 'WK', label: 'Worker Panel' },
  admin: { icon: 'AD', label: 'Admin Panel' },
  b2b: { icon: 'B2', label: 'B2B Panel' },
};

/* =====================================================
   GENERAL SERVICES CATEGORY SIDEBAR
   ===================================================== */
const GeneralServicesSidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar sidebar--category">
      <div className="sidebar-header">
        <div className="category-sidebar-title">
          <span className="category-sidebar-icon">🛍️</span>
          <div>
            <div className="category-sidebar-heading">General Services</div>
            <div className="category-sidebar-sub">Choose a category</div>
          </div>
        </div>

      </div>

      <nav className="sidebar-nav">
        <div className="category-nav-label">Categories</div>
        {generalServicesCategories.map((cat) => {
          const isActive = location.pathname.startsWith(cat.path) ||
            (cat.path === '/customer/travel-commute' && location.pathname === '/customer/travel-commute') ||
            (cat.path === '/customer/food-kitchen' && location.pathname === '/customer/food-kitchen') ||
            (cat.path === '/customer/pet-services' && location.pathname === '/customer/pet-services') ||
            (cat.path === '/customer/health-wellness' && location.pathname === '/customer/health-wellness') ||
            (cat.path === '/customer/society-management' && location.pathname === '/customer/society-management');

          if (cat.comingSoon) {
            return (
              <div
                key={cat.path}
                className={`category-sidebar-link category-sidebar-link--disabled`}
                title="Coming Soon"
              >
                <span className="category-sidebar-link-icon" style={{ color: cat.color }}>
                  {cat.icon}
                </span>
                <span className="category-sidebar-link-text">{cat.label}</span>
                <span className="category-coming-soon-badge">Soon</span>
              </div>
            );
          }

          return (
            <NavLink
              key={cat.path}
              to={cat.path}
              end
              className={({ isActive: navActive }) =>
                `category-sidebar-link${navActive ? ' category-sidebar-link--active' : ''}`
              }
            >
              <span className="category-sidebar-link-icon" style={{ color: cat.color }}>
                {cat.icon}
              </span>
              <span className="category-sidebar-link-text">{cat.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/customer/general-services" className="category-back-link">
          ← Back to All Categories
        </NavLink>
      </div>
    </aside>
  );
};

/* =====================================================
   STANDARD SIDEBAR (worker / admin / b2b)
   ===================================================== */
const Sidebar = ({ panel }) => {
  const { t } = useTranslation();
  const links = sidebarConfig[panel] || [];
  const panelInfo = panelLabels[panel];

  // Customer panel: sidebar rendered conditionally by DashboardLayout, not here
  if (panel === 'customer') {
    return <GeneralServicesSidebar />;
  }

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
