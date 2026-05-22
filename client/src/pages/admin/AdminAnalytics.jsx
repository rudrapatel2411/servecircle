import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowTrendingUp, HiOutlineUsers, HiOutlineBanknotes,
  HiOutlineCalendarDays, HiOutlineChartBar
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const monthlyData = [
  { month: 'Dec', revenue: 28000, bookings: 45 },
  { month: 'Jan', revenue: 35000, bookings: 62 },
  { month: 'Feb', revenue: 42000, bookings: 78 },
  { month: 'Mar', revenue: 51000, bookings: 95 },
  { month: 'Apr', revenue: 68000, bookings: 120 },
  { month: 'May', revenue: 82500, bookings: 145 },
];

const topServices = [
  { name: 'Home Deep Cleaning', count: 320, revenue: 384000, pct: 100 },
  { name: 'AC & Appliance Repair', count: 280, revenue: 140000, pct: 87 },
  { name: 'Electrical Work', count: 210, revenue: 63000, pct: 66 },
  { name: 'Car/Bike Washing', count: 190, revenue: 47500, pct: 59 },
  { name: 'Pest Control', count: 150, revenue: 135000, pct: 47 },
];

const userGrowth = [
  { label: 'Total Customers', value: '12,450', change: '+18%', icon: <HiOutlineUsers />, color: '#3b82f6' },
  { label: 'Active Workers', value: '2,340', change: '+12%', icon: <HiOutlineUsers />, color: '#10b981' },
  { label: 'B2B Partners', value: '45', change: '+8%', icon: <HiOutlineUsers />, color: '#8b5cf6' },
  { label: 'Monthly Revenue', value: '₹82,500', change: '+21%', icon: <HiOutlineBanknotes />, color: '#f59e0b' },
];

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.analytics')} 📊</h1>
          <p className="page-subtitle">Platform performance and insights</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        {userGrowth.map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
            <span className="stat-change positive">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="dash-section">
        <h3 className="dash-section-title"><HiOutlineArrowTrendingUp style={{ verticalAlign: 'middle' }} /> Revenue Trend (Last 6 Months)</h3>
        <div className="chart-card">
          <div className="bar-chart">
            {monthlyData.map((d, i) => (
              <div key={i} className="bar-col">
                <div className="bar-value">₹{(d.revenue / 1000).toFixed(0)}K</div>
                <div className="bar-fill" style={{ height: `${(d.revenue / maxRevenue) * 200}px` }}>
                  <div className="bar-inner" />
                </div>
                <div className="bar-label">{d.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="analytics-two-col">
        {/* Top Services */}
        <div className="dash-section">
          <h3 className="dash-section-title"><HiOutlineChartBar style={{ verticalAlign: 'middle' }} /> Top Services</h3>
          <div className="top-services-list">
            {topServices.map((s, i) => (
              <div key={i} className="top-service-item">
                <div className="ts-rank">#{i + 1}</div>
                <div className="ts-info">
                  <span className="ts-name">{s.name}</span>
                  <div className="ts-bar-wrap">
                    <div className="ts-bar" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
                <div className="ts-stats">
                  <span className="ts-count">{s.count} bookings</span>
                  <span className="ts-revenue">₹{(s.revenue / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Breakdown */}
        <div className="dash-section">
          <h3 className="dash-section-title"><HiOutlineCalendarDays style={{ verticalAlign: 'middle' }} /> Booking Status</h3>
          <div className="status-breakdown">
            {[
              { label: 'Completed', value: 485, pct: 65, color: '#10b981' },
              { label: 'Active', value: 120, pct: 16, color: '#3b82f6' },
              { label: 'Pending', value: 95, pct: 13, color: '#f59e0b' },
              { label: 'Cancelled', value: 45, pct: 6, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="status-row">
                <div className="status-dot" style={{ background: s.color }} />
                <span className="status-name">{s.label}</span>
                <div className="status-bar-wrap"><div className="status-bar" style={{ width: `${s.pct}%`, background: s.color }} /></div>
                <span className="status-val">{s.value}</span>
                <span className="status-pct">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
