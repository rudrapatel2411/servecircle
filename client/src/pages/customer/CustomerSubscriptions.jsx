import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
 HiOutlineCheckCircle, HiOutlineStar, HiOutlineRocketLaunch,
 HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineXMark
} from 'react-icons/hi2';
import { getSession } from '../../utils/authSession';
import '../Dashboard.css';
import './CustomerPages.css';

const plans = [
 {
 key: 'basic', name: 'Basic', price: 'FREE', priceNum: 0, color: '#6b7280',
 icon: <HiOutlineCheckCircle />,
 features: ['Browse all services', 'Book any service', 'Standard support', 'Basic worker matching'],
 notIncluded: ['No discounts', 'No priority booking', 'No dedicated manager'],
 },
 {
 key: 'silver', name: 'Silver', price: '₹199', priceNum: 199, color: '#94a3b8',
 icon: <HiOutlineStar />,
 features: ['Everything in Basic', '10% discount on all bookings', 'Priority booking queue', 'Exclusive coupons monthly', 'Email support'],
 notIncluded: ['No VIP emergency', 'No dedicated manager'],
 },
 {
 key: 'gold', name: 'Gold', price: '₹1499', priceNum: 1499, color: '#f59e0b', popular: true,
 icon: <HiOutlineRocketLaunch />,
 features: ['Everything in Silver', '20% discount on all bookings', 'Free video consultation (2/month)', 'Smart warranty tracker', 'VIP emergency response (30 min)', 'Priority chat support'],
 notIncluded: ['No dedicated manager'],
 },
 {
 key: 'platinum', name: 'Platinum', price: '₹1999', priceNum: 1999, color: '#8b5cf6',
 icon: <HiOutlineShieldCheck />,
 features: ['Everything in Gold', '30% discount on all bookings', 'Dedicated personal manager', 'Unlimited video consultations', 'Free annual home health audit', 'VIP emergency (15 min response)', 'B2B pricing access'],
 notIncluded: [],
 },
];

const CustomerSubscriptions = () => {
 const { t } = useTranslation();
 const session = getSession();

 const [currentPlan, setCurrentPlan] = useState(() => {
 try {
 return localStorage.getItem('servecircle_active_subscription') || 'gold';
 } catch {
 return 'gold';
 }
 });

 const [pendingPlan, setPendingPlan] = useState(null);
 const [toastMessage, setToastMessage] = useState('');

 const handleActivatePlan = (plan) => {
 setCurrentPlan(plan.key);
 try {
 localStorage.setItem('servecircle_active_subscription', plan.key);
 } catch {}
 setPendingPlan(null);
 setToastMessage(` Successfully upgraded to the ${plan.name} Membership! Your benefits are live.`);
 setTimeout(() => setToastMessage(''), 5000);
 };

 return (
 <div className="page-content" style={{ paddingBottom: '90px' }}>
 
 {/* Toast Notification */}
 {toastMessage && (
 <div className="sc-toast success">
 <HiOutlineCheckCircle style={{ fontSize: '1.3rem', color: '#22c55e' }} />
 <span>{toastMessage}</span>
 </div>
 )}

 <div className="page-header">
 <div>
 <h1 className="page-title">{t('customer.subscriptions')} ⭐</h1>
 <p className="page-subtitle">Choose the perfect plan for priority technician dispatches, discounts, and home audits.</p>
 </div>
 </div>

 {/* Current Plan Banner */}
 <div className="current-plan-banner" style={{ borderRadius: '16px', padding: '18px 24px' }}>
 <div className="current-plan-info">
 <HiOutlineSparkles style={{ fontSize: '1.4rem', color: '#f59e0b' }} />
 <span>You are currently enjoying the <strong>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Tier</strong> benefits</span>
 </div>
 <span className="current-plan-badge">Active Status</span>
 </div>

 {/* Plans Grid */}
 <div className="plans-grid">
 {plans.map((plan) => {
 const isCurrent = plan.key === currentPlan;
 return (
 <div
 key={plan.key}
 className={`plan-card ${isCurrent ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
 style={{ borderRadius: '18px', border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0' }}
 >
 {plan.popular && <div className="popular-badge">{t('pricing.popular')}</div>}
 {isCurrent && <div className="current-badge">{t('pricing.currentPlan')}</div>}

 <div className="plan-icon" style={{ color: plan.color, background: `${plan.color}15` }}>
 {plan.icon}
 </div>
 <h3 className="plan-name">{plan.name}</h3>
 <div className="plan-price">
 <span className="price-amount">{plan.price}</span>
 {plan.priceNum > 0 && <span className="price-period">{t('pricing.month')}</span>}
 </div>

 <ul className="plan-features">
 {plan.features.map((f, i) => (
 <li key={i} className="feature-item included">
 <HiOutlineCheckCircle className="feature-icon" /> {f}
 </li>
 ))}
 {plan.notIncluded.map((f, i) => (
 <li key={`no-${i}`} className="feature-item not-included">
 <span className="feature-x"></span> {f}
 </li>
 ))}
 </ul>

 <button
 type="button"
 className={`btn ${isCurrent ? 'btn-outline' : 'btn-primary'} plan-btn`}
 disabled={isCurrent}
 onClick={() => !isCurrent && setPendingPlan(plan)}
 style={{ cursor: isCurrent ? 'default' : 'pointer' }}
 >
 {isCurrent ? t('pricing.currentPlan') : `Choose ${plan.name}`}
 </button>
 </div>
 );
 })}
 </div>

 {/* Plan Upgrade Confirmation Modal */}
 {pendingPlan && (
 <div style={{
 position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
 }}>
 <div style={{
 background: 'white', borderRadius: '20px', maxWidth: '440px', width: '100%',
 padding: '28px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative'
 }}>
 <button
 type="button"
 onClick={() => setPendingPlan(null)}
 style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
 >
 <HiOutlineXMark />
 </button>
 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem' }}>
 <HiOutlineStar />
 </div>
 <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
 Upgrade to {pendingPlan.name} Plan
 </h3>
 <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '18px' }}>
 Enjoy {pendingPlan.features[1] || 'exclusive discounts'} and priority technician dispatches for <strong>{pendingPlan.price}/month</strong>.
 </p>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 style={{ flex: 1 }}
 onClick={() => setPendingPlan(null)}
 >
 Cancel
 </button>
 <button
 type="button"
 className="btn btn-primary"
 style={{ flex: 1.5 }}
 onClick={() => handleActivatePlan(pendingPlan)}
 >
 Confirm & Activate
 </button>
 </div>
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
 { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. Your benefits continue until the end of the billing period.' },
 ].map((faq, i) => (
 <details key={i} className="faq-item">
 <summary className="faq-question">{faq.q}</summary>
 <p className="faq-answer">{faq.a}</p>
 </details>
 ))}
 </div>
 </div>
 </div>
 );
};

export default CustomerSubscriptions;