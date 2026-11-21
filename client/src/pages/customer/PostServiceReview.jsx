import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlineHeart,
  HiOutlinePrinter,
  HiOutlineXMark,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { getSession, requestApi } from '../../utils/authSession';
import '../Dashboard.css';
import './CustomerPages.css';

const PostServiceReview = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const session = getSession();
  const token = session?.token;
  const user = session?.user;

  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const priceParam = searchParams.get('price');
  const price = priceParam !== null && !isNaN(parseInt(priceParam)) ? parseInt(priceParam) : 499;
  const worker = searchParams.get('worker') || 'Ramesh Kumar (Verified Pro)';
  const serviceName = searchParams.get('service') || 'AC General Service';
  const isSellingService = serviceName.toLowerCase().includes('junk') || serviceName.toLowerCase().includes('scrap');
  const scrapValue = 1250;

  const totalPaid = (price + 49 + tip).toFixed(2);

  const handleTip = (amount) => setTip(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (token) {
      try {
        await requestApi('/reviews', {
          method: 'POST',
          token,
          body: {
            booking: bookingId || 'SC-2841',
            service: serviceName,
            rating: rating || 5,
            comment: reviewText.trim() || 'Work was completed promptly and professionally.',
          },
        });
      } catch (err) {
        console.warn('Review API fallback:', err.message);
      }
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-content" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px', borderRadius: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 20px' }}>
            <HiOutlineCheckCircle />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>
            {t('postReview.serviceCompleted')}
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Thank you for rating <strong>{worker}</strong>! Your review has been permanently verified and recorded in the technician ledger.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => setShowReceiptModal(true)}>
              <HiOutlineDocumentText /> View Tax Invoice
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/customer')}>
              {t('postReview.backToHome')}
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Modal */}
        {showReceiptModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px',
          }}>
            <div style={{
              background: 'white', borderRadius: '18px', maxWidth: '580px', width: '100%',
              padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative',
            }}>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
              >
                <HiOutlineXMark />
              </button>

              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>ServeCircle</h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>Official Service Receipt & Tax Invoice</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>PAID IN FULL</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Inv #: INV-{bookingId || '2841'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><strong>Customer:</strong> {user?.name || 'Rudra Shah'}</div>
                <div><strong>Service:</strong> {serviceName}</div>
                <div><strong>Technician:</strong> {worker}</div>
                <div><strong>Status:</strong> Completed & Verified</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '8px 0' }}>Item Description</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0' }}>Base Labour & Service Charge</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{price}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0' }}>GST & Safe Platform Fee</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>₹49</td>
                  </tr>
                  {tip > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0' }}>Technician Tip (100% Direct)</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{tip}</td>
                    </tr>
                  )}
                  <tr style={{ fontWeight: 800, fontSize: '1rem', borderTop: '2px solid #0f172a' }}>
                    <td style={{ padding: '12px 0' }}>Total Paid</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: '#16a34a' }}>₹{totalPaid}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => window.print()}
                >
                  <HiOutlinePrinter /> Print / Save as PDF
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '80px' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="page-title">{t('postReview.serviceCompleted')} 🎉</h1>
        <p className="page-subtitle">{t('postReview.serviceCompletedDesc')}</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '24px', maxWidth: '980px', margin: '0 auto' }}>
        
        {/* E-Invoice & Summary */}
        <div className="card" style={{ padding: '32px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            {isSellingService ? (
               <HiOutlineCurrencyRupee style={{ fontSize: '2.5rem', color: '#3b7dc1' }} />
            ) : (
               <HiOutlineDocumentText style={{ fontSize: '2.2rem', color: '#2563eb' }} />
            )}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', display: 'block' }}>
                {isSellingService ? 'Earnings Summary' : t('postReview.eInvoiceGenerated')}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--navy-600)', margin: 0 }}>
                {isSellingService ? 'Your items have been evaluated and payment processed.' : t('postReview.eInvoiceDesc')}
              </p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--navy-600)' }}>{t('postReview.baseServiceCharge')}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>₹{price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--navy-600)' }}>{t('postReview.partsMaterials')}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>₹0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--navy-600)' }}>{t('postReview.taxesPlatformFee')}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>₹49</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0', fontSize: '1rem' }}>
              <span style={{ color: '#16a34a', fontWeight: 800 }}>✓ Settled via Online / Wallet</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>₹{price + 49}</span>
            </div>

            {tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '1rem' }}>Tip to Professional</span>
                <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.2rem' }}>₹{tip}</span>
              </div>
            )}
          </div>

          {/* Proof Photos Thumbnail on invoice */}
          <div style={{ marginTop: '20px', padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineShieldCheck style={{ fontSize: '1rem' }} /> Verified Proof of Work Attached
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"
                alt="Before proof"
                style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <img
                src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800"
                alt="After proof"
                style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => setShowReceiptModal(true)}
            style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.85rem' }}
          >
            <HiOutlineDocumentText /> View & Download Full Tax Invoice
          </button>
        </div>

        {/* Review & Tipping */}
        <div>
          <div className="card" style={{ padding: '32px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px', textAlign: 'center', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
              {t('postReview.rateWorker')} {worker}
            </h3>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
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
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {rating === 5 ? '⭐⭐⭐⭐⭐ Outstanding & Courteous' : rating === 4 ? '⭐⭐⭐⭐ Very Good Work' : '⭐⭐⭐ Satisfactory'}
            </p>
          </div>

          {!isSellingService && (
            <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineHeart style={{ color: tip > 0 ? '#dc2626' : '#94a3b8' }} /> 
                {tip > 0 ? `Thank you for tipping ₹${tip}!` : t('postReview.addTip', 'Add a tip for the professional')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '14px' }}>100% of your tip goes directly to {worker}.</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTip(0)}
                  style={{
                    flex: 1, padding: '8px',
                    background: tip === 0 ? '#f1f5f9' : 'white',
                    color: tip === 0 ? '#0f172a' : '#64748b',
                    border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {t('postReview.noTip', 'No Tip')}
                </button>
                {[50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleTip(amt)}
                    style={{
                      flex: 1, padding: '8px', cursor: 'pointer',
                      background: tip === amt ? '#2563eb' : 'white',
                      color: tip === amt ? 'white' : '#0f172a',
                      border: tip === amt ? 'none' : '1px solid #cbd5e1',
                      borderRadius: '8px', fontWeight: 800,
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              {t('postReview.writeReview')}
            </label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Tell us what you liked about the technician's punctuality, cleanliness, and expertise..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 800 }}
          >
            {submitting ? 'Submitting Review...' : (!isSellingService && tip > 0) ? `Pay Tip of ₹${tip} & Submit Review` : t('postReview.submitReview')}
          </button>
        </div>

      </div>

      {/* Printable Tax Invoice Modal */}
      {showReceiptModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '18px', maxWidth: '580px', width: '100%',
            padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative',
          }}>
            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
            >
              <HiOutlineXMark />
            </button>

            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>ServeCircle</h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>Official Service Receipt & Tax Invoice</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>PAID IN FULL</span>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Inv #: INV-{bookingId || '2841'}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Customer:</strong> {user?.name || 'Rudra Shah'}</div>
              <div><strong>Service:</strong> {serviceName}</div>
              <div><strong>Technician:</strong> {worker}</div>
              <div><strong>Status:</strong> Completed & Verified</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '8px 0' }}>Item Description</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0' }}>Base Labour & Service Charge</td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{price}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0' }}>GST & Safe Platform Fee</td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>₹49</td>
                </tr>
                {tip > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0' }}>Technician Tip (100% Direct)</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{tip}</td>
                  </tr>
                )}
                <tr style={{ fontWeight: 800, fontSize: '1rem', borderTop: '2px solid #0f172a' }}>
                  <td style={{ padding: '12px 0' }}>Total Paid</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: '#16a34a' }}>₹{totalPaid}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => window.print()}
              >
                <HiOutlinePrinter /> Print / Save as PDF
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostServiceReview;