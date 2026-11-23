import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import CallMeBackWidget from './CallMeBackWidget';
import WorkerCallWidget from './WorkerCallWidget';
import GlobalServiceSearch from './GlobalServiceSearch';
import ErrorBoundary from './ErrorBoundary';
import { getSession, roleHome } from '../utils/authSession.js';
import './DashboardLayout.css';

/* Routes where the General Services category sidebar should appear */
const GENERAL_SERVICES_ROUTES = [
  '/customer/general-services',
  '/customer/travel-commute',
  '/customer/food-kitchen',
  '/customer/pet-services',
  '/customer/health-wellness',
  '/customer/society-management',
  '/customer/relocation',
];

const DashboardLayout = ({ panel }) => {
  const location = useLocation();
  const session = getSession();
  const contentRef = useRef(null);

  // Automatically reset scroll to the very top on every route change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (session.user.role !== panel) {
    return <Navigate to={roleHome[session.user.role] || '/login'} replace />;
  }

  // Show the category sidebar only on customer panel + General Services routes
  const isGeneralServicesRoute =
    panel === 'customer' &&
    GENERAL_SERVICES_ROUTES.some((route) => location.pathname.startsWith(route));

  // Non-customer panels always show the standard sidebar
  const showStandardSidebar = panel !== 'customer';

  return (
    <div className={`dashboard-layout${showStandardSidebar ? ' dashboard-layout--with-sidebar' : ''}`}>
      {/* Standard sidebar for worker/admin/b2b */}
      {showStandardSidebar && <Sidebar panel={panel} />}

      {/* Main area: navbar + content */}
      <div className={`dashboard-main${showStandardSidebar ? ' dashboard-main--offset' : ''}`}>
        <DashboardNavbar panel={panel} />

        {/* Content row: optional category sidebar + page outlet */}
        <div className={`dashboard-content-row${isGeneralServicesRoute ? ' dashboard-content-row--with-category' : ''}`}>
          {isGeneralServicesRoute && <Sidebar panel="customer" />}

          <main ref={contentRef} className={`dashboard-content${isGeneralServicesRoute ? ' dashboard-content--with-category' : ''}`}>
            {/* Global Search overlays if on General Services pages */}
            {isGeneralServicesRoute && <GlobalServiceSearch />}
            <ErrorBoundary inline>
              <div key={location.pathname} className="page-transition-wrapper">
                <Outlet />
              </div>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {panel === 'customer' && <CallMeBackWidget />}
      {panel === 'worker' && <WorkerCallWidget />}
    </div>
  );
};

export default DashboardLayout;
