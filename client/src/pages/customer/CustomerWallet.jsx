import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineWallet, HiOutlineArrowUpCircle, HiOutlineArrowDownCircle,
  HiOutlinePlusCircle, HiOutlineGift, HiOutlineBanknotes, HiOutlineSparkles
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const mockTransactions = [
  { id: 1, type: 'topup', amount: 3000, balance: 3000, desc: 'Wallet top-up via UPI', date: '14 May 2026, 9:30 AM', method: 'UPI' },
  { id: 2, type: 'payment', amount: -500, balance: 2500, desc: 'AC Servicing payment (#SC-2841)', date: '14 May 2026, 11:00 AM', method: 'Wallet' },
  { id: 3, type: 'bonus', amount: 50, balance: 2550, desc: 'Referral bonus — Priya joined!', date: '13 May 2026, 3:15 PM', method: '' },
  { id: 4, type: 'payment', amount: -100, balance: 2450, desc: 'Tip to Ramesh Kumar', date: '13 May 2026, 4:00 PM', method: 'Wallet' },
  { id: 5, type: 'refund', amount: 250, balance: 2700, desc: 'Refund for cancelled Car Wash', date: '10 May 2026, 6:00 PM', method: '' },
  { id: 6, type: 'payment', amount: -350, balance: 2350, desc: 'Plumbing Fix (#SC-2839)', date: '10 May 2026, 12:30 PM', method: 'Wallet' },
  { id: 7, type: 'topup', amount: 2000, balance: 2700, desc: 'Wallet top-up via Card', date: '8 May 2026, 10:00 AM', method: 'Card' },
];

const typeConfig = {
  topup: { icon: <HiOutlineArrowUpCircle />, color: '#3b7dc1', label: 'Top-up' },
  payment: { icon: <HiOutlineArrowDownCircle />, color: '#ef4444', label: 'Payment' },
  bonus: { icon: <HiOutlineGift />, color: '#8b5cf6', label: 'Bonus' },
  refund: { icon: <HiOutlineBanknotes />, color: '#3b82f6', label: 'Refund' },
  points_redeem: { icon: <HiOutlineSparkles />, color: '#f59e0b', label: 'Points Redeemed' }
};

const CustomerWallet = () => {
  const { t } = useTranslation();
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(2450);
  const [transactions, setTransactions] = useState(mockTransactions);

  // ServePoints states
  const [servePoints, setServePoints] = useState(450); // Starting points
  const pointsRedeemRate = 1; // 1 Point = 1 Rupee

  const totalSpent = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalEarned = transactions.filter(t => ['topup', 'bonus', 'refund', 'points_redeem'].includes(t.type)).reduce((s, t) => s + t.amount, 0);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleTopup = (e) => {
    e.preventDefault();
    const amt = parseInt(topupAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newTxn = {
      id: Date.now(),
      type: 'topup',
      amount: amt,
      balance: walletBalance + amt,
      desc: `Wallet top-up via custom gateway`,
      date: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      method: 'Online'
    };

    setWalletBalance(walletBalance + amt);
    setTransactions([newTxn, ...transactions]);
    setTopupAmount('');
    setShowTopup(false);
  };

  const handleRedeemPoints = (pointsToRedeem) => {
    if (pointsToRedeem > servePoints || pointsToRedeem <= 0) return;

    const cashbackAmount = pointsToRedeem * pointsRedeemRate;
    const newTxn = {
      id: Date.now(),
      type: 'points_redeem',
      amount: cashbackAmount,
      balance: walletBalance + cashbackAmount,
      desc: `Redeemed ${pointsToRedeem} ServePoints for wallet cashback`,
      date: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      method: 'ServePoints'
    };

    setWalletBalance(walletBalance + cashbackAmount);
    setServePoints(servePoints - pointsToRedeem);
    setTransactions([newTxn, ...transactions]);
  };

  // Determine loyalty tier badge
  const getTierDetails = (points) => {
    if (points >= 1000) return { name: 'Diamond Pro', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', nextTier: 'Max Tier Achieved! 🏆' };
    if (points >= 500) return { name: 'Gold Tier', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', nextTier: `${1000 - points} points to Diamond Pro` };
    if (points >= 200) return { name: 'Silver Tier', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', nextTier: `${500 - points} points to Gold` };
    return { name: 'Bronze Tier', color: '#b45309', bg: 'rgba(180, 83, 9, 0.1)', nextTier: `${200 - points} points to Silver` };
  };

  const tier = getTierDetails(servePoints);

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.wallet')} 💰</h1>
          <p className="page-subtitle">Manage your wallet balance, transaction ledger, and premium loyalty ServePoints.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Wallet Balance Card */}
        <div className="wallet-hero" style={{ height: '100%', margin: 0 }}>
          <div className="wallet-balance-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="wallet-balance-top">
                <HiOutlineWallet className="wallet-icon" />
                <span className="wallet-label">Available Balance</span>
              </div>
              <div className="wallet-amount" style={{ fontSize: '2.5rem' }}>₹{walletBalance.toLocaleString()}</div>
            </div>
            <div className="wallet-stats-row" style={{ margin: '16px 0' }}>
              <div className="wallet-stat">
                <span className="wallet-stat-label">Total Added</span>
                <span className="wallet-stat-value plus">+₹{totalEarned.toLocaleString()}</span>
              </div>
              <div className="wallet-stat">
                <span className="wallet-stat-label">Total Spent</span>
                <span className="wallet-stat-value minus">-₹{totalSpent.toLocaleString()}</span>
              </div>
            </div>
            <button className="btn btn-primary wallet-topup-btn" style={{ width: '100%' }} onClick={() => setShowTopup(!showTopup)}>
              <HiOutlinePlusCircle /> Add Money
            </button>
          </div>
        </div>

        {/* ServePoints Loyalty Ledger */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineSparkles style={{ color: '#f59e0b' }} /> Loyalty Rewards
              </span>
              <span style={{
                background: tier.bg,
                color: tier.color,
                border: `1px solid ${tier.color}33`,
                padding: '4px 12px',
                borderRadius: '50px',
                fontSize: '0.72rem',
                fontWeight: 900,
                textTransform: 'uppercase'
              }}>
                {tier.name}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 950, color: '#f8fafc', lineHeight: 1 }}>{servePoints}</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>ServePoints</span>
            </div>

            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
              {tier.nextTier}
            </span>

            {/* Loyalty Perks Description */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              lineHeight: 1.4,
              marginBottom: '20px'
            }}>
              ⭐ <strong>Earn 50 Points</strong> on every booking completed!<br />
              🎁 <strong>Instant Cash Redeem</strong>: 1 Point = ₹1 directly into Wallet balance.
            </div>
          </div>

          {/* Point Redemption Simulator */}
          <div>
            <button
              onClick={() => handleRedeemPoints(100)}
              disabled={servePoints < 100}
              className="btn"
              style={{
                width: '100%',
                background: servePoints >= 100 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
                color: servePoints >= 100 ? '#0f172a' : '#64748b',
                border: 'none',
                fontWeight: 900,
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.82rem',
                cursor: servePoints >= 100 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🚀 Redeem 100 Points for ₹100 Cashback
            </button>
            {servePoints < 100 && (
              <span style={{ display: 'block', textAlign: 'center', fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                Need at least 100 points to redeem.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top-up Section */}
      {showTopup && (
        <div className="dash-section topup-section animate-fade-in-up" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '32px' }}>
          <h3 className="dash-section-title" style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px' }}>Add Money to Wallet</h3>
          <div className="topup-card" style={{ background: 'transparent', border: 'none', padding: 0 }}>
            <div className="quick-amounts" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  className={`quick-amount-btn ${topupAmount === String(amt) ? 'selected' : ''}`}
                  onClick={() => setTopupAmount(String(amt))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid var(--gray-200)',
                    background: topupAmount === String(amt) ? 'var(--primary-600)' : 'white',
                    color: topupAmount === String(amt) ? 'white' : 'var(--gray-700)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="topup-input-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="rupee-prefix" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-800)' }}>₹</span>
              <input
                type="number"
                className="input-field topup-input"
                placeholder="Enter amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={handleTopup}
                className="btn btn-primary"
                disabled={!topupAmount || parseInt(topupAmount) <= 0}
                style={{ padding: '12px 24px', fontWeight: 700 }}
              >
                Add ₹{topupAmount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="dash-section" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
        <h3 className="dash-section-title" style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>Transaction History</h3>
        <div className="transactions-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {transactions.map((txn) => {
            const config = typeConfig[txn.type] || { icon: <HiOutlineGift />, color: '#8b5cf6', label: 'Bonus' };
            return (
              <div key={txn.id} className="transaction-item" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                border: '1px solid var(--gray-100)',
                borderRadius: '12px',
                background: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="txn-icon" style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: `${config.color}15`,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem'
                  }}>
                    {config.icon}
                  </div>
                  <div className="txn-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="txn-desc" style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--navy-800)' }}>{txn.desc}</span>
                    <span className="txn-date" style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '2px' }}>{txn.date}</span>
                  </div>
                </div>
                <div className="txn-amount-col" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span className={`txn-amount ${txn.amount >= 0 ? 'plus' : 'minus'}`} style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: txn.amount >= 0 ? '#3b7dc1' : '#ef4444'
                  }}>
                    {txn.amount >= 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                  </span>
                  <span className="txn-balance" style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '2px' }}>Bal: ₹{txn.balance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerWallet;
