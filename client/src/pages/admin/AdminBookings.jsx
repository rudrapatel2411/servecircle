import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineEye,
  HiOutlineCalendarDays, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';
import Pagination from '../../components/Pagination';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAllBookings = async () => {
      let apiBookings = [];
      const session = getSession();
      if (session?.token) {
        try {
          const data = await requestApi('/bookings', { token: session.token });
          apiBookings = data?.bookings || [];
        } catch (requestError) {
          setError(requestError.message || 'Unable to load bookings from server');
        }
      }

      // Merge B2B Society Work Orders from persistent store
      let localB2B = [];
      try {
        const raw = localStorage.getItem('b2bWorkOrders');
        if (raw) {
          const parsed = JSON.parse(raw);
          localB2B = parsed.map(o => ({
            _id: o.id,
            bookingId: o.id,
            service: o.service,
            customer: { name: o.societyName || 'Green Valley Society (RWA)' },
            worker: { name: o.leadName ? `${o.leadName} (${o.workers || 4} Pros)` : 'ServeCircle Verified Crew' },
            scheduledDate: o.date,
            scheduledTime: o.time,
            amount: o.amount || o.cost || 2500,
            status: o.status || 'pending',
            paymentStatus: o.paymentStatus || 'pending',
            isB2B: true,
            tower: o.tower,
            gatePassPin: o.gatePassPin,
            notes: o.notes,
          }));
        }
      } catch (e) {
        console.warn('Error reading local B2B orders for admin:', e);
      }

      const merged = [...localB2B, ...apiBookings];
      setBookings(merged);
      setIsLoading(false);
    };

    loadAllBookings();
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
          <h1 className="page-title">{t('admin.bookings')}</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-input-wrap">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, service, customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="filter-group">
          <HiOutlineFunnel />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
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
            {!isLoading && filtered
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((b) => {
              const bookingId = b.bookingId || b._id;
              const cfg = statusConfig[b.status] || { label: b.status, color: 'warning' };
              return (
                <>
                  <tr key={bookingId} className={expandedId === bookingId ? 'row-expanded' : ''}>
                    <td>
                      <strong>{bookingId}</strong>
                      {b.isB2B && (
                        <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '3px' }}>
                          🏢 Society B2B
                        </span>
                      )}
                    </td>
                    <td>
                      <div>{b.service}</div>
                      {b.tower && <small style={{ color: '#64748b' }}>Wing: {b.tower}</small>}
                    </td>
                    <td>{b.customer?.name || 'Unknown customer'}</td>
                    <td>{b.worker?.name || 'Pending assignment'}</td>
                    <td><small>{b.scheduledDate ? (typeof b.scheduledDate === 'string' && b.scheduledDate.includes(' ') ? b.scheduledDate : new Date(b.scheduledDate).toLocaleDateString('en-IN')) : 'Not scheduled'}, {b.scheduledTime || 'Flexible'}</small></td>
                    <td><strong>₹{b.amount}</strong></td>
                    <td><span className={`badge badge-${cfg.color}`}>{cfg.label}</span></td>
                    <td><span className={`badge badge-${b.paymentStatus === 'paid' ? 'success' : b.paymentStatus === 'refunded' ? 'warning' : 'danger'}`}>{b.paymentStatus}</span></td>
                    <td>
                      <button className="btn-icon-sm" onClick={() => setExpandedId(expandedId === bookingId ? null : bookingId)}><HiOutlineEye /></button>
                    </td>
                  </tr>
                  {expandedId === bookingId && (
                    <tr className="detail-row">
                      <td colSpan="9" style={{ background: '#f8fafc', padding: '12px 16px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div><strong>Location / Campus:</strong> {b.address || 'Green Valley Society, Ahmedabad'}</div>
                          {b.tower && <div><strong>Designated Tower:</strong> {b.tower}</div>}
                          {b.gatePassPin && <div><strong>Security Gate PIN:</strong> <span style={{ color: '#166534', fontWeight: 700, letterSpacing: '2px' }}>{b.gatePassPin}</span></div>}
                          {b.notes && <div><strong>Instructions:</strong> {b.notes}</div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={(page) => {
            setCurrentPage(page);
            setExpandedId(null);
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="bookings"
        />
      )}

      {filtered.length === 0 && <div className="empty-state"><p>No bookings found</p></div>}
    </div>
  );
};

export default AdminBookings;
