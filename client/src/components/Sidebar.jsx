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
  HiOutlineSquares2X2,
  HiOutlineMagnifyingGlass,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
  HiOutlineTruck,
} from 'react-icons/hi2';
import { generalServicesData } from '../data/generalServicesData';
import { getWorkerCategory } from '../utils/workerCategoryHelper';
import { getSession } from '../utils/authSession';
import { getWorkerSession } from '../pages/worker/workerApi';
import './Sidebar.css';

const SPECIALIZED_NAV_MAP = {
  'Travel & Commute': { path: '/worker/travel-commute', icon: <HiOutlineTruck style={{ color: '#0d9488' }} />, label: 'Travel Operations' },
  'Food Kitchen': { path: '/worker/food-kitchen', icon: <HiOutlineSparkles style={{ color: '#ea580c' }} />, label: 'Culinary Operations' },
  'Pet Services': { path: '/worker/pet-services', icon: <HiOutlineSparkles style={{ color: '#db2777' }} />, label: 'Pet Operations' },
  'Health & Wellness': { path: '/worker/health-wellness', icon: <HiOutlineSparkles style={{ color: '#0284c7' }} />, label: 'Health Operations' },
  'Society Management': { path: '/worker/society-management', icon: <HiOutlineBuildingOffice2 style={{ color: '#16a34a' }} />, label: 'Society Operations' },
  'Property & Society': { path: '/worker/society-management', icon: <HiOutlineBuildingOffice2 style={{ color: '#16a34a' }} />, label: 'Society Operations' },
  'Packers & Movers': { path: '/worker/relocation', icon: <HiOutlineTruck style={{ color: '#2563eb' }} />, label: 'Relocation Operations' },
  'Events Hub': { path: '/worker/events', icon: <HiOutlineSparkles style={{ color: '#6366f1' }} />, label: 'Event Operations' }
};

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
    { path: '/worker/become-a-pro', icon: <HiOutlineAcademicCap style={{ color: '#d97706' }} />, labelKey: 'customer.becomeAPro', fallbackLabel: 'Become a Pro' },
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
    { path: '/admin/b2b', icon: <HiOutlineDocumentText style={{ color: '#2563eb' }} />, labelKey: 'admin.b2bPortal' },
    { path: '/admin/b2b/contracts', icon: <HiOutlineDocumentText />, labelKey: 'b2b.contracts' },
    { path: '/admin/b2b/locations', icon: <HiOutlineMapPin />, labelKey: 'b2b.locations' },
    { path: '/admin/b2b/invoices', icon: <HiOutlineReceiptPercent />, labelKey: 'b2b.invoices' },
  ],
  b2b: [
    { path: '/b2b', icon: <HiOutlineHome />, labelKey: 'b2b.dashboard', end: true },
    { path: '/b2b/services', icon: <HiOutlineMagnifyingGlass />, labelKey: 'b2b.bookServices' },
    { path: '/b2b/contracts', icon: <HiOutlineDocumentText />, labelKey: 'b2b.myContracts' },
    { path: '/b2b/locations', icon: <HiOutlineMapPin />, labelKey: 'b2b.myBlocks' },
    { path: '/b2b/team', icon: <HiOutlineUserGroup />, labelKey: 'b2b.teamAccounts' },
    { path: '/b2b/invoices', icon: <HiOutlineReceiptPercent />, labelKey: 'b2b.invoices' },
    { path: '/b2b/history', icon: <HiOutlineCalendarDays />, labelKey: 'b2b.serviceHistory' },
    { path: '/b2b/support', icon: <HiOutlineChatBubbleLeftRight />, labelKey: 'b2b.support' },
  ],
};

const panelLabels = {
  worker: { icon: 'WK', label: 'Worker Panel' },
  admin: { icon: 'AD', label: 'Admin Panel' },
  b2b: { icon: 'B2', label: 'B2B Client Portal' },
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
          <span className="category-sidebar-icon">
            <HiOutlineSquares2X2 size={20} />
          </span>
          <div>
            <div className="category-sidebar-heading">General Services</div>
            <div className="category-sidebar-sub">Choose a category</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="category-nav-label">Smart Essentials</div>
        <NavLink
          to="/customer/my-home"
          end
          className={({ isActive: navActive }) =>
            `category-sidebar-link${navActive ? ' category-sidebar-link--active' : ''}`
          }
        >
          <span className="category-sidebar-link-icon" style={{ color: '#2563eb' }}>
            <HiOutlineHome size={18} />
          </span>
          <span className="category-sidebar-link-text">My Home Cockpit</span>
          <span className="category-coming-soon-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Hub</span>
        </NavLink>
        <NavLink
          to="/customer/ordered-services"
          end
          className={({ isActive: navActive }) =>
            `category-sidebar-link${navActive ? ' category-sidebar-link--active' : ''}`
          }
        >
          <span className="category-sidebar-link-icon" style={{ color: '#d97706' }}>
            <HiOutlineSparkles size={18} />
          </span>
          <span className="category-sidebar-link-text">Ordered Services (Live)</span>
        </NavLink>

        <div className="category-nav-label" style={{ marginTop: '14px' }}>Categories</div>
        {generalServicesCategories.map((cat) => {
          if (cat.comingSoon) {
            return (
              <div
                key={cat.path}
                className="category-sidebar-link category-sidebar-link--disabled"
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
  const location = useLocation();
  const rawLinks = sidebarConfig[panel] || [];
  const panelInfo = panelLabels[panel];

  if (panel === 'customer') {
    return <GeneralServicesSidebar />;
  }

  let links = [...rawLinks];
  let workerUser = null;
  let workerCat = 'Home Repairs';

  if (panel === 'worker') {
    try {
      const wSession = getWorkerSession();
      const gSession = getSession();
      workerUser = wSession?.user || gSession?.user || null;
      workerCat = getWorkerCategory(workerUser);

      const assignedSpecialized = SPECIALIZED_NAV_MAP[workerCat] || null;
      if (assignedSpecialized) {
        // Replace generic "Job Requests" menu with the dedicated specialized operations console
        links = links.map((l) =>
          l.path === '/worker/jobs'
            ? {
                path: assignedSpecialized.path,
                icon: assignedSpecialized.icon,
                labelKey: `worker.${(assignedSpecialized.label || '').toLowerCase().replace(/[^a-z]/g, '')}`,
                fallbackLabel: assignedSpecialized.label,
              }
            : l
        );
      }
    } catch (_) {}
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <div className="logo-icon">SC</div>
          <span className="logo-text">ServeCircle</span>
        </NavLink>
        <div className="sidebar-panel-badge">
          <span className="panel-badge-abbr">{panelInfo?.icon}</span>
          <span className="panel-badge-name">{panelInfo?.label}</span>
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
            <span className="sidebar-link-text">{t(link.labelKey, link.fallbackLabel || link.labelKey)}</span>
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
