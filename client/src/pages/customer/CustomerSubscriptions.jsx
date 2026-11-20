import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineCheckCircle, HiOutlineStar, HiOutlineRocketLaunch,
  HiOutlineShieldCheck, HiOutlineSparkles
} from 'react-icons/hi2';
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
  const [currentPlan] = useState('gold');
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.subscriptions')} ⭐</h1>
          <p className="page-subtitle">Choose the perfect plan for your service needs</p>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="current-plan-banner">
        <div className="current-plan-info">
          <HiOutlineSparkles />
          <span>You are currently on the <strong>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong> plan</span>
        </div>
        <span className="current-plan-badge">Active</span>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isSelected = selectedPlan === plan.key;
          return (
            <div
              key={plan.key}
              className={`plan-card ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
              onClick={() => !isCurrent && setSelectedPlan(plan.key)}
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
                    <span className="feature-x">✕</span> {f}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${isCurrent ? 'btn-outline' : 'btn-primary'} plan-btn`}
                disabled={isCurrent}
              >
                {isCurrent ? t('pricing.currentPlan') : t('pricing.choosePlan')}
              </button>
            </div>
          );
        })}
      </div>

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
