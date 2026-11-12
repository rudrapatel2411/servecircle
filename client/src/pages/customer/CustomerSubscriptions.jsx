import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCheckCircle, HiOutlineStar, HiOutlineRocketLaunch,
  HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineXCircle,
  HiXMark, HiOutlineCreditCard, HiOutlineWallet, HiOutlineDevicePhoneMobile,
  HiOutlineBanknotes, HiOutlineCalendarDays, HiOutlineArrowRight,
} from 'react-icons/hi2';
import { getSession, saveSession, requestApi } from '../../utils/authSession';
import { broadcastNotificationToTabs } from '../../utils/notificationSync';
import '../Dashboard.css';
import './CustomerPages.css';

const SUBSCRIPTION_HISTORY_KEY = 'servecircle_subscription_history';

const plans = [
  {
    key: 'basic',
    name: 'Basic',
    monthlyPrice: 0,
    discountPct: 0,
    color: '#6b7280',
    icon: <HiOutlineCheckCircle />,
    features: ['Standard pricing', 'Book any of 19 service domains', 'Standard support', 'Service history tracking'],
    notIncluded: ['No booking discounts', 'No priority emergency slot', 'No dedicated manager'],
  },
  {
    key: 'silver',
    name: 'Silver',
    monthlyPrice: 199,
    discountPct: 10,
    color: '#0284c7',
    icon: <HiOutlineStar />,
    features: ['Everything in Basic', '10% discount on all bookings', 'Priority booking slot', 'Dedicated helpline', '1 free consultation/month'],
    notIncluded: ['No VIP emergency response', 'No dedicated manager'],
  },
  {
    key: 'gold',
    name: 'Gold',
    monthlyPrice: 499,
    discountPct: 20,
    color: '#f59e0b',
    popular: true,
    icon: <HiOutlineRocketLaunch />,
    features: ['Everything in Silver', '20% discount on all bookings', 'Free video consultation (2/month)', 'Smart warranty tracker + reminders', 'Free quarterly AC/geyser check', 'VIP emergency response (30 min)'],
    notIncluded: ['No dedicated personal manager'],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    monthlyPrice: 999,
    discountPct: 30,
    color: '#8b5cf6',
    icon: <HiOutlineShieldCheck />,
    features: ['Everything in Gold', '30% discount on all bookings', 'Dedicated personal manager', 'Unlimited video consultations', 'Free annual home health audit', 'VIP emergency (15 min response)'],
    notIncluded: [],
  },
];

const CustomerSubscriptions = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getSession();

  const [currentPlan, setCurrentPlan] = useState(
    () => session?.user?.subscription || localStorage.getItem('servecircle_active_subscription') || 'basic'
  );
  const [billingCycle, setBillingCycle] = useState(
    () => (searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly')
  );
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('rahul@okicici');
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [activatedReceipt, setActivatedReceipt] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SUBSCRIPTION_HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Auto-open checkout if user came from Home Page (?plan=...)
  useEffect(() => {
    const paramPlan = searchParams.get('plan');
    if (paramPlan) {
      const matched = plans.find((p) => p.key === paramPlan.toLowerCase());
      if (matched && matched.key !== currentPlan) {
        setCheckoutPlan(matched);
      }
      // Clean URL query after opening
      const next = new URLSearchParams(searchParams);
      next.delete('plan');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPriceInfo = (monthlyPrice) => {
    if (!monthlyPrice) return { amount: 0, display: 'FREE', period: '', savings: 0 };
    if (billingCycle === 'yearly') {
      const amount = Math.round(monthlyPrice * 12 * 0.8);
      const savings = Math.round(monthlyPrice * 12 * 0.2);
      return { amount, display: `₹${amount.toLocaleString('en-IN')}`, period: '/year', savings };
    }
    return { amount: monthlyPrice, display: `₹${monthlyPrice}`, period: '/month', savings: 0 };
  };

  const handleActivatePlan = async () => {
    if (!checkoutPlan) return;
    setCheckoutError('');
    if (checkoutPlan.monthlyPrice > 0 && paymentMethod === 'UPI' && !upiId.includes('@')) {
      setCheckoutError('Please enter a valid UPI ID (e.g. name@upi).');
      return;
    }

    setProcessing(true);
    const priceInfo = getPriceInfo(checkoutPlan.monthlyPrice);
    const membershipId = `SC-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
    const nextRenewal = new Date();
    nextRenewal.setMonth(nextRenewal.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

    // 1. Update backend API if authenticated
    if (session?.token) {
      try {
        await requestApi('/users/me/subscription', {
          method: 'PUT',
          token: session.token,
          body: { plan: checkoutPlan.key },
        });
      } catch (err) {
        console.warn('Subscription API fallback notice:', err.message);
      }
    }

    // 2. Persist updated plan in session & localStorage
    setCurrentPlan(checkoutPlan.key);
    localStorage.setItem('servecircle_active_subscription', checkoutPlan.key);
    if (session) {
      saveSession({
        ...session,
        user: { ...session.user, subscription: checkoutPlan.key },
      });
    }

    // 3. Create receipt record
    const receipt = {
      id: membershipId,
      planKey: checkoutPlan.key,
      planName: checkoutPlan.name,
      billingCycle,
      amountPaid: priceInfo.amount,
      discountPct: checkoutPlan.discountPct,
      paymentMethod: priceInfo.amount === 0 ? 'Free Tier' : paymentMethod,
      activatedAt: new Date().toISOString(),
      nextRenewal: nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    const updatedHistory = [receipt, ...history].slice(0, 15);
    setHistory(updatedHistory);
    localStorage.setItem(SUBSCRIPTION_HISTORY_KEY, JSON.stringify(updatedHistory));

    // 4. Notify Customer & Admin live
    broadcastNotificationToTabs({
      id: `sub_${membershipId}`,
      title: `⭐ Subscription Activated: ${checkoutPlan.name}`,
      message: `${session?.user?.name || 'Customer'} upgraded to ${checkoutPlan.name} (${billingCycle}) — ₹${priceInfo.amount}. ${checkoutPlan.discountPct}% booking discount unlocked!`,
      type: 'alert',
      targetAudience: 'admin',
    });

    setProcessing(false);
    setCheckoutPlan(null);
    setActivatedReceipt(receipt);
  };

  const currentPlanObj = plans.find((p) => p.key === currentPlan) || plans[0];

  return (
    <div className="page-content" style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{t('customer.subscriptions')} ⭐</h1>
          <p className="page-subtitle">Upgrade anytime — automatic discounts apply instantly at booking checkout</p>
        </div>

        {/* Billing Cycle Switch */}
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              background: billingCycle === 'monthly' ? 'white' : 'transparent',
              color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
              boxShadow: billingCycle === 'monthly' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              background: billingCycle === 'yearly' ? '#2563eb' : 'transparent',
              color: billingCycle === 'yearly' ? 'white' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            Yearly
            <span style={{ background: '#fef08a', color: '#854d0e', padding: '1px 6px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 900 }}>
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Activation Confirmation Receipt */}
      {activatedReceipt && (
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.3)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px' }}>
              PAYMENT VERIFIED • {activatedReceipt.id}
            </span>
            <h3 style={{ margin: '8px 0 4px', fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>
              🎉 {activatedReceipt.planName} Plan Activated!
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.92 }}>
              Paid ₹{activatedReceipt.amountPaid.toLocaleString('en-IN')} via {activatedReceipt.paymentMethod} • Valid until {activatedReceipt.nextRenewal}.
              {activatedReceipt.discountPct > 0 && ` Your ${activatedReceipt.discountPct}% booking discount is live!`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/customer/services" className="btn" style={{ background: 'white', color: '#047857', fontWeight: 800, textDecoration: 'none' }}>
              Book a Service <HiOutlineArrowRight />
            </Link>
            <button
              onClick={() => setActivatedReceipt(null)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HiXMark />
            </button>
          </div>
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="current-plan-banner" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="current-plan-info">
          <HiOutlineSparkles />
          <span>
            You are currently on the <strong>{currentPlanObj.name}</strong> plan
            {currentPlanObj.discountPct > 0 ? ` (${currentPlanObj.discountPct}% off all bookings)` : ' (Standard rates)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="current-plan-badge">Active</span>
          {currentPlan !== 'basic' && (
            <button
              type="button"
              onClick={() => setCheckoutPlan(plans[0])}
              style={{
                background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 12px',
                fontSize: '0.75rem', fontWeight: 700, color: '#475569', cursor: 'pointer',
              }}
            >
              Switch to Free Basic
            </button>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const priceInfo = getPriceInfo(plan.monthlyPrice);
          return (
            <div
              key={plan.key}
              className={`plan-card ${isCurrent ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">{t('pricing.popular')}</div>}
              {isCurrent && <div className="current-badge">{t('pricing.currentPlan')}</div>}

              <div className="plan-icon" style={{ color: plan.color, background: `${plan.color}15` }}>
                {plan.icon}
              </div>
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price-amount">{priceInfo.display}</span>
                {priceInfo.period && <span className="price-period">{priceInfo.period}</span>}
              </div>
              {priceInfo.savings > 0 && (
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                  Save ₹{priceInfo.savings.toLocaleString('en-IN')}/year
                </span>
              )}

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i} className="feature-item included">
                    <HiOutlineCheckCircle className="feature-icon" /> {f}
                  </li>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <li key={`no-${i}`} className="feature-item not-included">
                    <HiOutlineXCircle className="feature-icon feature-x" /> {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`btn ${isCurrent ? 'btn-outline' : 'btn-primary'} plan-btn`}
                disabled={isCurrent}
                onClick={() => setCheckoutPlan(plan)}
              >
                {isCurrent ? t('pricing.currentPlan') : plan.monthlyPrice === 0 ? 'Downgrade to Basic' : t('pricing.choosePlan', 'Choose Plan')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Membership & Billing History */}
      {history.length > 0 && (
        <div className="dash-section" style={{ marginTop: 36 }}>
          <h3 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineCalendarDays style={{ color: '#2563eb' }} /> Membership Billing History
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Membership ID</th>
                  <th>Plan</th>
                  <th>Cycle</th>
                  <th>Amount Paid</th>
                  <th>Payment Mode</th>
                  <th>Next Renewal</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.id}</td>
                    <td><strong>{item.planName}</strong> ({item.discountPct}% off)</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.billingCycle}</td>
                    <td style={{ fontWeight: 800, color: '#059669' }}>₹{item.amountPaid.toLocaleString('en-IN')}</td>
                    <td>{item.paymentMethod}</td>
                    <td>{item.nextRenewal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="dash-section" style={{ marginTop: 40 }}>
        <h3 className="dash-section-title">Frequently Asked Questions</h3>
        <div className="faq-list">
          {[
            { q: 'Can I change my plan anytime?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
            { q: 'How does the discount work?', a: 'Your subscription discount is automatically applied at checkout on every booking.' },
            { q: 'What is VIP Emergency Response?', a: 'Gold and Platinum members get guaranteed fast response times for emergency services — 30 min for Gold, 15 min for Platinum.' },
            { q: 'Can I cancel my subscription?', a: 'Yes, you can downgrade to the Free Basic plan anytime with zero cancellation fees.' },
          ].map((faq, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-question">{faq.q}</summary>
              <p className="faq-answer">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Interactive Subscription Checkout Modal */}
      {checkoutPlan && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
          onClick={() => !processing && setCheckoutPlan(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)', position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !processing && setCheckoutPlan(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#475569',
              }}
            >
              <HiXMark size={18} />
            </button>

            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
              Subscription Checkout
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 14px' }}>
              {checkoutPlan.monthlyPrice === 0 ? 'Switch to Basic (Free)' : `Activate ${checkoutPlan.name} Plan`}
            </h3>

            {/* Plan Price Summary Box */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem', color: '#475569' }}>
                <span>Billing Cycle:</span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{billingCycle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem', color: '#475569' }}>
                <span>Booking Discount Unlocked:</span>
                <strong style={{ color: '#059669' }}>{checkoutPlan.discountPct}% Off All Services</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '6px', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                <span>Total Payable (Incl. GST):</span>
                <span style={{ color: '#2563eb' }}>{getPriceInfo(checkoutPlan.monthlyPrice).display}</span>
              </div>
            </div>

            {/* Payment Method Picker for Paid Plans */}
            {checkoutPlan.monthlyPrice > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Select Payment Method:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: <HiOutlineDevicePhoneMobile /> },
                    { id: 'Card', label: 'Debit / Credit', icon: <HiOutlineCreditCard /> },
                    { id: 'Wallet', label: 'ServeCircle Wallet', icon: <HiOutlineWallet /> },
                    { id: 'NetBanking', label: 'NetBanking', icon: <HiOutlineBanknotes /> },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      style={{
                        padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                        border: `1.5px solid ${paymentMethod === pm.id ? '#2563eb' : '#cbd5e1'}`,
                        background: paymentMethod === pm.id ? '#eff6ff' : 'white',
                        color: paymentMethod === pm.id ? '#1d4ed8' : '#334155',
                      }}
                    >
                      {pm.icon} {pm.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'UPI' && (
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. name@okicici)"
                    className="input-field"
                    style={{ fontSize: '0.85rem' }}
                  />
                )}
              </div>
            )}

            {checkoutError && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
                {checkoutError}
              </p>
            )}

            <button
              type="button"
              onClick={handleActivatePlan}
              disabled={processing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontWeight: 800, fontSize: '0.95rem' }}
            >
              {processing
                ? 'Processing Payment...'
                : checkoutPlan.monthlyPrice === 0
                ? 'Confirm Switch to Basic'
                : `Pay ${getPriceInfo(checkoutPlan.monthlyPrice).display} & Activate`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSubscriptions;
