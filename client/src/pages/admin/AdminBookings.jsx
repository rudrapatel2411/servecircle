import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineEye,
  HiOutlineCalendarDays, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';
import { getSession, requestApi } from '../../utils/authSession.js';

const statusConfig = {
  completed: { label: 'Completed', color: 'success' },
  assigned: { label: 'Assigned', color: 'primary' },
  accepted: { label: 'Accepted', color: 'primary' },
  'en-route': { label: 'En route', color: 'primary' },
  arrived: { label: 'Arrived', color: 'primary' },
  started: { label: 'Started', color: 'primary' },
  pending: { label: 'Pending', color: 'warning' },
  cancelled: { label: 'Cancelled', color: 'danger' },
};

const AdminBookings = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session?.token) return;

    requestApi('/bookings', { token: session.token })
      .then((data) => setBookings(data?.bookings || []))
      .catch((requestError) => setError(requestError.message || 'Unable to load bookings'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const bookingId = b.bookingId || b._id;
    const customerName = b.customer?.name || '';
    const workerName = b.worker?.name || '';
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return bookingId.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || customerName.toLowerCase().includes(q) || workerName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.bookings')} 📋</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
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
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="en-route">En route</option>
            <option value="arrived">Arrived</option>
            <option value="started">Started</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="empty-state"><p>Loading bookings...</p></div>}
      {error && <div className="empty-state"><p>{error}</p></div>}

      <div className="admin-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th><th>Service</th><th>Customer</th><th>Worker</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th><th></th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filtered.map((b) => {
              const bookingId = b.bookingId || b._id;
              const cfg = statusConfig[b.status] || { label: b.status, color: 'warning' };
              return (
                <tr key={bookingId} className={expandedId === bookingId ? 'row-expanded' : ''}>
                  <td><strong>{bookingId}</strong></td>
                  <td>{b.service}</td>
                  <td>{b.customer?.name || 'Unknown customer'}</td>
                  <td>{b.worker?.name || 'Pending assignment'}</td>
                  <td><small>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN') : 'Not scheduled'}, {b.scheduledTime || 'Flexible'}</small></td>
                  <td><strong>₹{b.amount}</strong></td>
                  <td><span className={`badge badge-${cfg.color}`}>{cfg.label}</span></td>
                  <td><span className={`badge badge-${b.paymentStatus === 'paid' ? 'success' : b.paymentStatus === 'refunded' ? 'warning' : 'danger'}`}>{b.paymentStatus}</span></td>
                  <td>
                    <button className="btn-icon-sm" onClick={() => setExpandedId(expandedId === bookingId ? null : bookingId)}><HiOutlineEye /></button>
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
