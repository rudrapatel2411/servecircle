import React, { useState } from 'react';
import { HiOutlineXMark, HiOutlineStar } from 'react-icons/hi2';
import { rateCustomer } from '../pages/worker/workerApi';

const AVAILABLE_TAGS = [
  'Polite & Respectful',
  'Prompt Handover',
  'Accurate Description',
  'Safe Environment',
  'Easy to Locate',
  'Prompt Payment',
];

export default function WorkerRateCustomerModal({
  isOpen,
  onClose,
  token,
  bookingId,
  customerName = 'Customer',
  onSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await rateCustomer(token, bookingId, {
        rating,
        tags: selectedTags,
        comment,
      });
      alert('Thank you for rating the customer! Your feedback keeps ServeCircle safe.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: '#ffffff',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rate Customer Experience</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            <HiOutlineXMark />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
            How was your service experience with <strong>{customerName}</strong>?
          </p>

          {/* Star selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  color: star <= rating ? '#eab308' : '#cbd5e1',
                  cursor: 'pointer',
                  padding: '2px',
                  transition: 'transform 0.1s',
                }}
              >
                ★
              </button>
            ))}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Select Tags (Optional)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {AVAILABLE_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      border: selected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: selected ? '#eff6ff' : '#ffffff',
                      color: selected ? '#1d4ed8' : '#475569',
                      fontWeight: selected ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Comments / Notes (Confidential)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Private feedback to improve future matchmaking..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#16a34a',
                color: '#ffffff',
                cursor: loading ? 'default' : 'pointer',
                fontWeight: 700,
              }}
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
