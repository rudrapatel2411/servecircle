import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import CallMeBackWidget from './CallMeBackWidget';
import WorkerCallWidget from './WorkerCallWidget';
import './DashboardLayout.css';

const DashboardLayout = ({ panel }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar panel={panel} />
      <div className="dashboard-main">
        <DashboardNavbar panel={panel} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      {panel === 'customer' && <CallMeBackWidget />}
      {panel === 'worker' && <WorkerCallWidget />}
    </div>
  );
};

export default DashboardLayout;
