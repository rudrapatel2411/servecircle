import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import CallMeBackWidget from './CallMeBackWidget';
import WorkerCallWidget from './WorkerCallWidget';
import GlobalServiceSearch from './GlobalServiceSearch';
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

        {/* Global Search overlays if on General Services pages */}
        {isGeneralServicesRoute && <GlobalServiceSearch />}

        {/* Content row: optional category sidebar + page outlet */}
        <div className={`dashboard-content-row${isGeneralServicesRoute ? ' dashboard-content-row--with-category' : ''}`}>
          {isGeneralServicesRoute && <Sidebar panel="customer" />}

          <main className={`dashboard-content${isGeneralServicesRoute ? ' dashboard-content--with-category' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>

      {panel === 'customer' && <CallMeBackWidget />}
      {panel === 'worker' && <WorkerCallWidget />}
    </div>
  );
};

export default DashboardLayout;
