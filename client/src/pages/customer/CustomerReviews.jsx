import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineStar, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheckCircle
} from 'react-icons/hi2';
import { getSession, requestApi } from '../../utils/authSession';
import '../Dashboard.css';
import './CustomerPages.css';

const DEFAULT_REVIEWS = [
  { id: 'rev-1', service: 'AC Servicing (Deep Clean)', worker: 'Ramesh Kumar (Verified Pro)', workerAvatar: 'RK', date: 'Yesterday', rating: 5, comment: 'Outstanding service! The technician arrived exactly on time and resolved the indoor unit drip. Highly recommended.', bookingId: 'SC-2841' },
  { id: 'rev-2', service: 'Plumbing Fix', worker: 'Ajay Patel', workerAvatar: 'AP', date: '3 days ago', rating: 4, comment: 'Good job, fixed the kitchen faucet leak quickly and tested pressure properly.', bookingId: 'SC-2839' },
  { id: 'rev-3', service: 'Car Washing', worker: 'Deepak Singh', workerAvatar: 'DS', date: '12 May 2026', rating: 4, comment: 'Car looks brand new. Interior cleaning was thorough.', bookingId: 'SC-2836' },
];

const StarRating = ({ rating, interactive = false, onChange }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((s) => (
      <HiOutlineStar
        key={s}
        className={`star ${s <= rating ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
        onClick={() => interactive && onChange && onChange(s)}
      />
    ))}
  </div>
);

const CustomerReviews = () => {
  const { t } = useTranslation();
  const session = getSession();
  const token = session?.token;

  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await requestApi('/reviews/my', { token });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r) => ({
            id: r.id || r._id,
            service: r.service || 'Home Service',
            worker: r.worker?.name || 'Verified Technician',
            workerAvatar: (r.worker?.name || 'Pro').slice(0, 2).toUpperCase(),
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent',
            rating: r.rating || 5,
            comment: r.comment || '',
            bookingId: r.booking?.bookingId || 'SC-Booking',
          }));
          setReviews(mapped);
        }
      } catch (err) {
        console.warn('Live reviews fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReviews();
    return () => { isMounted = false; };
  }, [token]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditComment('');
    setEditRating(0);
  };

  const handleSaveEdit = async (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, comment: editComment, rating: editRating } : r))
    );
    setEditingId(null);
    showToast('Review updated successfully!');
  };

  const handleDelete = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('Review removed from public profile.');
  };

  return (
    <div className="page-content" style={{ paddingBottom: '90px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sc-toast success">
          <HiOutlineCheckCircle style={{ fontSize: '1.3rem', color: 'var(--status-success-text)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{t('customer.reviews')}</h1>
          <p className="page-subtitle">Your verified ratings and feedback for completed doorstep service visits.</p>
        </div>
        <Link to="/customer/bookings" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          Rate Recent Bookings
        </Link>
      </div>

      {/* Stats */}
      <div className="reviews-stats">
        <div className="review-stat-card">
          <div className="review-stat-big">{avgRating}</div>
          <StarRating rating={Math.round(Number(avgRating))} />
          <span className="review-stat-label">Your Average Rating Given</span>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-big">{reviews.length}</div>
          <span className="review-stat-label">Total Verified Reviews</span>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-big">{reviews.filter((r) => r.rating === 5).length}</div>
          <span className="review-stat-label">5-Star Praises</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="dash-section">
        <h3 className="dash-section-title">Your Service Experience History</h3>
        
        {loading && <div className="chart-placeholder">Loading your reviews...</div>}

        {!loading && reviews.length === 0 && (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)' }}>
            You haven't reviewed any services yet. After your technician completes a job, your rating and reviews will appear here.
          </div>
        )}

        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card" style={{ borderRadius: '16px', border: '1px solid var(--glass-edge)', padding: '20px' }}>
              <div className="review-card-top">
                <div className="review-worker">
                  <div className="worker-avatar" style={{ background: 'var(--blue)', color: 'white', fontWeight: 800 }}>{review.workerAvatar}</div>
                  <div>
                    <h4 className="review-service-name" style={{ fontSize: '1.05rem', fontWeight: 800 }}>{review.service}</h4>
                    <span className="review-worker-name" style={{ color: 'var(--ink-3)', fontSize: '0.82rem' }}>
                      {review.worker} • <strong>#{review.bookingId}</strong>
                    </span>
                  </div>
                </div>
                <div className="review-meta">
                  <StarRating
                    rating={editingId === review.id ? editRating : review.rating}
                    interactive={editingId === review.id}
                    onChange={setEditRating}
                  />
                  <span className="review-date" style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{review.date}</span>
                </div>
              </div>

              {editingId === review.id ? (
                <div className="review-edit" style={{ marginTop: '14px' }}>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <div className="review-edit-actions" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => handleSaveEdit(review.id)}>Save Changes</button>
                    <button className="btn btn-sm btn-outline" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="review-comment" style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.5, margin: '14px 0 10px 0' }}>
                  "{review.comment}"
                </p>
              )}

              {editingId !== review.id && (
                <div className="review-actions" style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--bg-page)', paddingTop: '10px' }}>
                  <button className="review-action-btn" onClick={() => startEdit(review)}>
                    <HiOutlinePencilSquare /> Edit Feedback
                  </button>
                  <button className="review-action-btn delete" onClick={() => handleDelete(review.id)}>
                    <HiOutlineTrash /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;