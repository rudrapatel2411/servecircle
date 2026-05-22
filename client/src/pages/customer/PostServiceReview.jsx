import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineStar, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineCurrencyRupee, HiOutlineHeart } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const PostServiceReview = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const price = parseInt(searchParams.get('price')) || 499;
  const worker = searchParams.get('worker') || 'Rajesh Kumar';
  const totalPaid = (price + 49 + tip).toFixed(2);

  const handleTip = (amount) => setTip(amount);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-content" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 20px' }}>
            <HiOutlineCheckCircle />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', marginTop: '16px', marginBottom: '8px' }}>
            {t('postReview.serviceCompleted')}
          </h2>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.85rem' }}>
            {t('postReview.serviceCompletedDesc')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/customer/bookings')}><HiOutlineDocumentText /> {t('postReview.viewBookings')}</button>
            <button className="btn btn-primary" onClick={() => navigate('/customer')}>{t('postReview.backToHome')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="page-title">{t('postReview.serviceCompleted')} 🎉</h1>
        <p className="page-subtitle">{t('postReview.serviceCompletedDesc')}</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
        
        {/* E-Invoice & Summary */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <HiOutlineDocumentText style={{ fontSize: '2rem', color: 'var(--primary-600)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                {t('postReview.eInvoiceGenerated')}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--navy-600)', margin: '0 0 16px 0' }}>{t('postReview.eInvoiceDesc')}</p>
            </div>
          </div>

          <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--gray-300)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--navy-200)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--navy-600)' }}>{t('postReview.baseServiceCharge')}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>₹{price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--navy-200)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--navy-600)' }}>{t('postReview.partsMaterials')}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>₹0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--navy-200)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--navy-600)' }}>{t('postReview.taxesPlatformFee')}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>₹49</span>
            </div>
            {tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--navy-200)', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--success)' }}>{t('postReview.workerTip')}</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>+ ₹{tip}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
              <span style={{ color: 'var(--navy-800)', fontWeight: 800, fontSize: '1.1rem' }}>{t('postReview.totalPaid')}</span>
              <span style={{ color: 'var(--primary-600)', fontWeight: 900, fontSize: '1.4rem' }}>₹{totalPaid}</span>
            </div>
          </div>

          <button className="btn btn-outline" onClick={() => alert('Downloading PDF invoice...')} style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.85rem' }}>
            <HiOutlineDocumentText /> {t('postReview.downloadPdf')}
          </button>
        </div>

        {/* Review & Tipping */}
        <div>
          <div className="card" style={{ padding: '32px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
              {t('postReview.rateWorker')} {worker}
            </h3>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: star <= rating ? '#f59e0b' : '#e5e7eb',
                    fontSize: '2.5rem', transition: 'color 0.2s'
                  }}
                >
                  <HiOutlineStar style={{ fill: star <= rating ? '#f59e0b' : 'transparent' }} />
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '32px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineHeart style={{ color: 'var(--danger)' }} /> {t('postReview.addTip')}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn ${tip === 0 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTip(0)}
                style={{ flex: 1, padding: '10px' }}
              >
                {t('postReview.noTip')}
              </button>
              {[50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleTip(amt)}
                  className={`btn ${tip === amt ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, padding: '10px' }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>{t('postReview.writeReview')}</label>
            <textarea
              className="input-field"
              rows="3"
              placeholder={t('postReview.writeReview')}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ marginTop: '24px' }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
            {t('postReview.submitReview')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PostServiceReview;
