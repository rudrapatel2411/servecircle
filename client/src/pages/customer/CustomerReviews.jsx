import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineStar, HiOutlinePencilSquare, HiOutlineTrash
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const mockReviews = [
  { id: 1, service: 'AC Servicing', worker: 'Ramesh Kumar', workerAvatar: 'RK', date: '14 May 2026', rating: 5, comment: 'Excellent work! AC is running perfectly now. Very professional and on-time.', bookingId: '#SC-2841' },
  { id: 2, service: 'Plumbing Fix', worker: 'Ajay Patel', workerAvatar: 'AP', date: '10 May 2026', rating: 4, comment: 'Good job, fixed the leak quickly. Could have cleaned up a bit better.', bookingId: '#SC-2839' },
  { id: 3, service: 'Car Washing', worker: 'Deepak Singh', workerAvatar: 'DS', date: '12 May 2026', rating: 4, comment: 'Car looks brand new. Interior cleaning was thorough.', bookingId: '#SC-2836' },
  { id: 4, service: 'Pest Control', worker: 'Sunita Mehra', workerAvatar: 'SM', date: '8 May 2026', rating: 5, comment: 'Very thorough pest control. No bugs since the treatment! Highly recommended.', bookingId: '#SC-2837' },
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
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);

  const avgRating = (mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1);

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

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.reviews')} ⭐</h1>
          <p className="page-subtitle">Your reviews and ratings for completed services</p>
        </div>
      </div>

      {/* Stats */}
      <div className="reviews-stats">
        <div className="review-stat-card">
          <div className="review-stat-big">{avgRating}</div>
          <StarRating rating={Math.round(avgRating)} />
          <span className="review-stat-label">Average Rating</span>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-big">{mockReviews.length}</div>
          <span className="review-stat-label">Total Reviews</span>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-big">{mockReviews.filter(r => r.rating === 5).length}</div>
          <span className="review-stat-label">5-Star Reviews</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="dash-section">
        <h3 className="dash-section-title">Your Reviews</h3>
        <div className="reviews-list">
          {mockReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card-top">
                <div className="review-worker">
                  <div className="worker-avatar">{review.workerAvatar}</div>
                  <div>
                    <h4 className="review-service-name">{review.service}</h4>
                    <span className="review-worker-name">{review.worker} • {review.bookingId}</span>
                  </div>
                </div>
                <div className="review-meta">
                  <StarRating
                    rating={editingId === review.id ? editRating : review.rating}
                    interactive={editingId === review.id}
                    onChange={setEditRating}
                  />
                  <span className="review-date">{review.date}</span>
                </div>
              </div>

              {editingId === review.id ? (
                <div className="review-edit">
                  <textarea
                    className="input-field"
                    rows={3}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                  <div className="review-edit-actions">
                    <button className="btn btn-sm btn-primary">Save</button>
                    <button className="btn btn-sm btn-outline" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="review-comment">{review.comment}</p>
              )}

              {editingId !== review.id && (
                <div className="review-actions">
                  <button className="review-action-btn" onClick={() => startEdit(review)}>
                    <HiOutlinePencilSquare /> Edit
                  </button>
                  <button className="review-action-btn delete">
                    <HiOutlineTrash /> Delete
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
