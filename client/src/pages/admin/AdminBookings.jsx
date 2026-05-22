import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineEye,
  HiOutlineCalendarDays, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const mockBookings = [
  { id: '#SC-2841', service: 'AC Servicing', category: 'Home Repairs', customer: 'Rudra Shah', customerPhone: '9876543210', worker: 'Ramesh Kumar', date: '14 May 2026', time: '10:00 AM', address: 'Satellite, Ahmedabad', amount: 500, status: 'completed', payment: 'paid' },
  { id: '#SC-2840', service: 'Deep Cleaning', category: 'Cleaning', customer: 'Rudra Shah', customerPhone: '9876543210', worker: 'Sunita Mehra', date: '15 May 2026', time: '2:00 PM', address: 'Prahlad Nagar, Ahmedabad', amount: 1200, status: 'active', payment: 'pending' },
  { id: '#SC-2839', service: 'Plumbing Fix', category: 'Home Repairs', customer: 'Rudra Shah', customerPhone: '9876543210', worker: 'Ajay Patel', date: '10 May 2026', time: '11:00 AM', address: 'Satellite, Ahmedabad', amount: 350, status: 'completed', payment: 'paid' },
  { id: '#SC-2838', service: 'Electrical Wiring', category: 'Home Repairs', customer: 'Priya Desai', customerPhone: '9876543211', worker: 'Ramesh Kumar', date: '16 May 2026', time: '4:30 PM', address: 'SG Highway, Ahmedabad', amount: 600, status: 'pending', payment: 'pending' },
  { id: '#SC-2837', service: 'Pest Control', category: 'Cleaning', customer: 'Priya Desai', customerPhone: '9876543211', worker: 'Sunita Mehra', date: '8 May 2026', time: '9:00 AM', address: 'Bopal, Ahmedabad', amount: 900, status: 'completed', payment: 'paid' },
  { id: '#SC-2836', service: 'Car Washing', category: 'Vehicle', customer: 'Amit Patel', customerPhone: '9876543212', worker: 'Deepak Singh', date: '12 May 2026', time: '7:00 AM', address: 'Vastrapur, Ahmedabad', amount: 250, status: 'completed', payment: 'paid' },
  { id: '#SC-2835', service: 'Birthday Party', category: 'Events', customer: 'Amit Patel', customerPhone: '9876543212', worker: 'Pending', date: '20 May 2026', time: '5:00 PM', address: 'Thaltej, Ahmedabad', amount: 5000, status: 'pending', payment: 'pending' },
  { id: '#SC-2830', service: 'Pest Control', category: 'Cleaning', customer: 'Priya Desai', customerPhone: '9876543211', worker: 'Sunita Mehra', date: '5 May 2026', time: '9:00 AM', address: 'Bopal, Ahmedabad', amount: 900, status: 'cancelled', payment: 'refunded' },
];

const statusConfig = {
  completed: { label: 'Completed', color: 'success' },
  active: { label: 'Active', color: 'primary' },
  pending: { label: 'Pending', color: 'warning' },
  cancelled: { label: 'Cancelled', color: 'danger' },
};

const AdminBookings = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = mockBookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.id.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.worker.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.bookings')} 📋</h1>
          <p className="page-subtitle">{mockBookings.length} total bookings</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-input-wrap">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input type="text" className="search-input" placeholder="Search by ID, service, customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <HiOutlineFunnel />
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th><th>Service</th><th>Customer</th><th>Worker</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const cfg = statusConfig[b.status];
              return (
                <tr key={b.id} className={expandedId === b.id ? 'row-expanded' : ''}>
                  <td><strong>{b.id}</strong></td>
                  <td>{b.service}</td>
                  <td>{b.customer}</td>
                  <td>{b.worker}</td>
                  <td><small>{b.date}, {b.time}</small></td>
                  <td><strong>₹{b.amount}</strong></td>
                  <td><span className={`badge badge-${cfg.color}`}>{cfg.label}</span></td>
                  <td><span className={`badge badge-${b.payment === 'paid' ? 'success' : b.payment === 'refunded' ? 'warning' : 'danger'}`}>{b.payment}</span></td>
                  <td>
                    <button className="btn-icon-sm" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}><HiOutlineEye /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="empty-state"><p>No bookings found</p></div>}
    </div>
  );
};

export default AdminBookings;
