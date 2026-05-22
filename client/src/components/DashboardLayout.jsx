import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
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
    </div>
  );
};

export default DashboardLayout;
