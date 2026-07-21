import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineCurrencyRupee, HiOutlineStar, HiOutlineEye
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import '../Dashboard.css';
import './CustomerPages.css';

const mockBookings = [
  { id: '#SC-2841', service: 'AC Servicing', category: 'Home Repairs', worker: 'Ramesh Kumar', workerPhone: '9876500001', date: '14 May 2026', time: '10:00 AM', address: 'Satellite, Ahmedabad', amount: 500, status: 'completed', paymentStatus: 'paid', rating: 5 },
  { id: '#SC-2840', service: 'Deep Cleaning', category: 'Cleaning & Hygiene', worker: 'Sunita Mehra', workerPhone: '9876500002', date: '15 May 2026', time: '2:00 PM', address: 'Prahlad Nagar, Ahmedabad', amount: 1200, status: 'active', paymentStatus: 'pending', rating: null },
  { id: '#SC-2839', service: 'Plumbing Fix', category: 'Home Repairs', worker: 'Ajay Patel', workerPhone: '9876500003', date: '10 May 2026', time: '11:00 AM', address: 'Satellite, Ahmedabad', amount: 350, status: 'completed', paymentStatus: 'paid', rating: 4 },
  { id: '#SC-2838', service: 'Electrical Wiring', category: 'Home Repairs', worker: 'Ramesh Kumar', workerPhone: '9876500001', date: '16 May 2026', time: '4:30 PM', address: 'SG Highway, Ahmedabad', amount: 600, status: 'pending', paymentStatus: 'pending', rating: null },
  { id: '#SC-2836', service: 'Car Washing', category: 'Vehicle Services', worker: 'Deepak Singh', workerPhone: '9876500004', date: '12 May 2026', time: '7:00 AM', address: 'Vastrapur, Ahmedabad', amount: 250, status: 'completed', paymentStatus: 'paid', rating: 4 },
  { id: '#SC-2835', service: 'Birthday Party', category: 'Events', worker: 'Pending Assignment', workerPhone: '', date: '20 May 2026', time: '5:00 PM', address: 'Thaltej, Ahmedabad', amount: 5000, status: 'pending', paymentStatus: 'pending', rating: null },
  { id: '#SC-2830', service: 'Pest Control', category: 'Cleaning & Hygiene', worker: 'Sunita Mehra', workerPhone: '9876500002', date: '5 May 2026', time: '9:00 AM', address: 'Bopal, Ahmedabad', amount: 900, status: 'cancelled', paymentStatus: 'refunded', rating: null },
];

const statusConfig = {
  completed: { label: 'Completed', color: 'success' },
  active: { label: 'Active', color: 'primary' },
  pending: { label: 'Pending', color: 'warning' },
  cancelled: { label: 'Cancelled', color: 'danger' },
};

const BookingHistory = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: t('customer.active') },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: t('customer.completed') },
    { key: 'cancelled', label: t('customer.cancelled') },
  ];

  const filtered = activeTab === 'all' ? mockBookings : mockBookings.filter((b) => b.status === activeTab);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.myBookings')} 📋</h1>
          <p className="page-subtitle">{mockBookings.length} total bookings</p>
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
              {tab.key === 'all' ? mockBookings.length : mockBookings.filter((b) => b.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="bookings-list">
        {filtered.map((booking) => {
          const config = statusConfig[booking.status];
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
                  {booking.status === 'active' && (
                    <div className="booking-actions">
                      <Link to="/customer/ordered-services" className="btn btn-sm btn-outline">Track Live 📍</Link>
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
