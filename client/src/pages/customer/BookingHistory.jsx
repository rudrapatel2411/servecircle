import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineCurrencyRupee, HiOutlineStar, HiOutlineEye
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import '../Dashboard.css';
import './CustomerPages.css';
import Pagination from '../../components/Pagination';
import { getSession, getCustomerSession, requestApi } from '../../utils/authSession.js';
import { getWorkflowBookings, subscribeWorkflowUpdates, matchesBookingId } from '../../utils/serviceWorkflowEngine';

const statusConfig = {
  completed: { label: 'Completed', color: 'success' },
  started: { label: 'In progress', color: 'primary' },
  'in-progress': { label: 'In progress', color: 'primary' },
  quotation_pending: { label: 'Quotation Pending', color: 'warning' },
  arrived: { label: 'Worker arrived', color: 'primary' },
  'en-route': { label: 'Worker en route', color: 'primary' },
  accepted: { label: 'Accepted', color: 'primary' },
  assigned: { label: 'Assigned', color: 'primary' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Declined', color: 'danger' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  cancelled_visiting_fee: { label: 'Cancelled (Visiting Fee)', color: 'danger' },
};

const normalizeBooking = (booking) => ({
  id: booking.bookingId || booking._id || booking.id,
  rawId: booking._id || booking.id,
  service: booking.service || booking.serviceName,
  category: booking.category,
  worker: booking.worker?.name || (typeof booking.worker === 'string' ? booking.worker : 'Pending assignment'),
  date: booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : 'Not scheduled',
  time: booking.scheduledTime || 'Not specified',
  address: booking.address,
  amount: booking.amount || booking.finalAmount || 499,
  status: String(booking.status || 'pending').toLowerCase().replace(/_/g, '-'),
  paymentStatus: booking.paymentStatus || 'pending',
  rating: booking.rating || null,
});

const BookingHistory = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [expandedId, setExpandedId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');

  const loadBookings = async () => {
    const session = getCustomerSession() || getSession();
    const wfNormalized = getWorkflowBookings().map((wf) => normalizeBooking(wf));
    if (!session?.token) {
      setBookings(wfNormalized);
      setIsLoading(false);
      return;
    }
    try {
      const data = await requestApi('/bookings/my', { token: session.token });
      const dbList = Array.isArray(data) ? data.map(normalizeBooking) : [];
      const merged = [...dbList];
      wfNormalized.forEach((wf) => {
        const exists = merged.some(
          (db) => db.id === wf.id || matchesBookingId(wf, db.id) || (wf.rawId && db.rawId === wf.rawId)
        );
        if (!exists) merged.unshift(wf);
      });
      setBookings(merged);
    } catch (requestError) {
      if (wfNormalized.length > 0) setBookings(wfNormalized);
      else setError(requestError.message || 'Unable to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    const unsub = subscribeWorkflowUpdates(() => loadBookings());
    const timer = setInterval(loadBookings, 5000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const handleCancelBooking = async (booking) => {
    const session = getCustomerSession() || getSession();
    const targetId = String(booking.rawId || booking.id || '').replace(/^#/, '');
    if (!targetId) return;
    if (!window.confirm(`Cancel booking ${booking.id}?`)) return;
    setCancellingId(booking.id);
    try {
      if (session?.token) {
        await requestApi(`/bookings/${encodeURIComponent(targetId)}/cancel`, {
          method: 'PATCH',
          token: session.token,
          body: { reason: 'Cancelled by customer from My Bookings' },
        });
      }
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to cancel booking');
    } finally {
      setCancellingId('');
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: t('customer.active') },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: t('customer.completed') },
    { key: 'cancelled', label: t('customer.cancelled') },
  ];

  const filtered = activeTab === 'all'
    ? bookings
    : activeTab === 'active'
      ? bookings.filter((booking) => ['assigned', 'accepted', 'en-route', 'arrived', 'started'].includes(booking.status))
      : bookings.filter((booking) => booking.status === activeTab);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.myBookings')}</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
              setExpandedId(null);
            }}
          >
            {tab.label}
            <span className="tab-count">
              {tab.key === 'all'
                ? bookings.length
                : tab.key === 'active'
                  ? bookings.filter((booking) => ['assigned', 'accepted', 'en-route', 'arrived', 'started'].includes(booking.status)).length
                  : bookings.filter((booking) => booking.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {isLoading && <div className="empty-state"><p>Loading bookings...</p></div>}
      {error && <div className="empty-state"><p>{error}</p></div>}

      {/* Booking Cards */}
      <div className="bookings-list">
        {!isLoading && filtered
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((booking) => {
          const config = statusConfig[booking.status] || { label: booking.status, color: 'warning' };
          const isExpanded = expandedId === booking.id;
          return (
            <div key={booking.id} className={`booking-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="booking-card-header" onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                <div className="booking-card-left">
                  <span className="booking-id">{booking.id}</span>
                  <h4 className="booking-service">{booking.service}</h4>
                  <div className="booking-meta-row">
                    <span><HiOutlineCalendarDays /> {booking.date}</span>
                    <span><HiOutlineClock /> {booking.time}</span>
                  </div>
                </div>
                <div className="booking-card-right">
                  <span className={`badge badge-${config.color}`}>{config.label}</span>
                  <span className="booking-amount">₹{booking.amount}</span>
                  <HiOutlineEye className="expand-icon" />
                </div>
              </div>

              {isExpanded && (
                <div className="booking-card-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Worker</span>
                      <span className="detail-value">{booking.worker}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category</span>
                      <span className="detail-value">{booking.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address</span>
                      <span className="detail-value"><HiOutlineMapPin /> {booking.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Payment</span>
                      <span className="detail-value">
                        <span className={`badge badge-${booking.paymentStatus === 'paid' ? 'success' : booking.paymentStatus === 'refunded' ? 'warning' : 'danger'}`}>
                          {booking.paymentStatus}
                        </span>
                      </span>
                    </div>
                    {booking.rating && (
                      <div className="detail-item">
                        <span className="detail-label">Your Rating</span>
                        <span className="detail-value rating-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <HiOutlineStar key={s} className={s <= booking.rating ? 'star-filled' : 'star-empty'} />
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                  {['pending', 'assigned', 'accepted', 'en-route', 'arrived', 'started'].includes(booking.status) && (
                    <div className="booking-actions">
                      <Link to={`/customer/live-tracking?bookingId=${encodeURIComponent(booking.id)}&service=${encodeURIComponent(booking.service)}&worker=${encodeURIComponent(booking.worker)}&price=${booking.amount}`} className="btn btn-sm btn-outline">Track Live</Link>
                      {booking.status !== 'started' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancelBooking(booking)}
                          style={{ color: 'var(--danger)', borderColor: 'var(--status-danger-soft)' }}
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  )}
                  {booking.status === 'completed' && !booking.rating && (
                    <div className="booking-actions">
                      <Link to={`/customer/review/${encodeURIComponent(booking.id)}?service=${encodeURIComponent(booking.service)}&worker=${encodeURIComponent(booking.worker)}&price=${booking.amount}`} className="btn btn-sm btn-primary">Leave Review</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No {activeTab} bookings found.</p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24]}
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
    </div>
  );
};

export default BookingHistory;
