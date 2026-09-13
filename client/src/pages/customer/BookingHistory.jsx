import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineCurrencyRupee, HiOutlineStar, HiOutlineEye
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import '../Dashboard.css';
import './CustomerPages.css';
import { getSession, requestApi } from '../../utils/authSession.js';

const statusConfig = {
  completed: { label: 'Completed', color: 'success' },
  started: { label: 'In progress', color: 'primary' },
  arrived: { label: 'Worker arrived', color: 'primary' },
  'en-route': { label: 'Worker en route', color: 'primary' },
  accepted: { label: 'Accepted', color: 'primary' },
  assigned: { label: 'Assigned', color: 'primary' },
  pending: { label: 'Pending', color: 'warning' },
  cancelled: { label: 'Cancelled', color: 'danger' },
};

const normalizeBooking = (booking) => ({
  id: booking.bookingId || booking._id,
  service: booking.service,
  category: booking.category,
  worker: booking.worker?.name || 'Pending assignment',
  date: booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : 'Not scheduled',
  time: booking.scheduledTime || 'Not specified',
  address: booking.address,
  amount: booking.amount,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  rating: booking.rating || null,
});

const BookingHistory = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session?.token) return;

    requestApi('/bookings/my', { token: session.token })
      .then((data) => setBookings(Array.isArray(data) ? data.map(normalizeBooking) : []))
      .catch((requestError) => setError(requestError.message || 'Unable to load bookings'))
      .finally(() => setIsLoading(false));
  }, []);

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
          <h1 className="page-title">{t('customer.myBookings')} 📋</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
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
        {!isLoading && filtered.map((booking) => {
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
                  {['assigned', 'accepted', 'en-route', 'arrived', 'started'].includes(booking.status) && (
                    <div className="booking-actions">
                      <Link to={`/customer/live-tracking?bookingId=${encodeURIComponent(booking.id)}&service=${encodeURIComponent(booking.service)}&worker=${encodeURIComponent(booking.worker)}&price=${booking.amount}`} className="btn btn-sm btn-outline">Track Live 📍</Link>
                      <button className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: '#fecaca' }}>Cancel</button>
                    </div>
                  )}
                  {booking.status === 'completed' && !booking.rating && (
                    <div className="booking-actions">
                      <button className="btn btn-sm btn-primary">Leave Review ⭐</button>
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
    </div>
  );
};

export default BookingHistory;
