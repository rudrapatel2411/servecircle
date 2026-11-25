import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

const PaymentModal = ({ isOpen, onClose, onSuccess, amount = 0 }) => {
  const [activeTab, setActiveTab] = useState('UPI'); // 'UPI', 'Card', 'Wallet'
  
  // Payment Process State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // UPI State
  const [upiStep, setUpiStep] = useState(1);
  const [upiCountdown, setUpiCountdown] = useState(10);
  
  // Card State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Mock Wallet Balance
  const walletBalance = 5000;

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setActiveTab('UPI');
      setUpiStep(1);
      setUpiCountdown(10);
      setIsProcessing(false);
      setError('');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (activeTab === 'UPI' && upiStep === 2 && upiCountdown > 0) {
      timer = setTimeout(() => setUpiCountdown(c => c - 1), 1000);
    } else if (activeTab === 'UPI' && upiStep === 2 && upiCountdown === 0) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [upiStep, upiCountdown, activeTab, onSuccess]);

  if (!isOpen) return null;

  const handleCardNumberChange = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handleCvvChange = (val) => {
    setCardCvv(val.replace(/\D/g, '').substring(0, 3));
  };

  const executePayment = () => {
    setError('');
    
    if (activeTab === 'Card') {
      if (!cardName || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setError('Please fill all card details correctly.');
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 2000);
    } else if (activeTab === 'Wallet') {
      if (walletBalance < amount) {
        setError('Insufficient wallet balance!');
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 1500);
    } else if (activeTab === 'UPI') {
      setUpiStep(2);
      setUpiCountdown(5); // Fast forward for demo
    }
  };

  return (
    <div
      className="modal-glass-overlay"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        className="glass animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '0',
          borderRadius: '28px',
          boxShadow: 'var(--sh-card)',
          border: '1px solid var(--glass-edge)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-edge)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.2rem',
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                margin: 0,
              }}
            >
              Complete Payment
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-2)', margin: '4px 0 0 0' }}>
              Amount to pay: <strong style={{ color: 'var(--blue)' }}>₹{amount.toLocaleString('en-IN')}</strong>
            </p>
          </div>
          <button 
            onClick={() => !isProcessing && onClose()}
            disabled={isProcessing || (activeTab === 'UPI' && upiStep === 2)}
            className="glass-sm"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--glass-edge)',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            <HiOutlineXMark style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        {/* Payment Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(227, 235, 250, 0.4)',
            borderBottom: '1px solid var(--glass-edge)',
          }}
        >
          {['UPI', 'Card', 'Wallet'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                disabled={isProcessing || (activeTab === 'UPI' && upiStep === 2)}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  border: 'none',
                  borderRadius: '999px',
                  background: isActive ? 'linear-gradient(135deg, var(--blue-hi), var(--blue))' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--ink-2)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(22, 70, 214, 0.3)' : 'none',
                  transition: 'all 0.25s var(--ease)',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                color: 'var(--status-danger-text)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '16px',
                textAlign: 'center',
                background: 'var(--status-danger-tint)',
                border: '1px solid var(--status-danger-ring)',
                padding: '10px 14px',
                borderRadius: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* UPI Content */}
          {activeTab === 'UPI' && (
            <div>
              {upiStep === 1 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', marginBottom: '20px', lineHeight: 1.5 }}>
                    Click below to open your preferred UPI app and complete the transaction securely.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={executePayment}
                    style={{ width: '100%' }}
                  >
                    Pay via UPI App
                  </button>
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '3px solid rgba(22, 70, 214, 0.15)',
                        borderRadius: '50%',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '3px solid var(--blue)',
                        borderRadius: '50%',
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  </div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      margin: '0 0 8px 0',
                      fontSize: '1.15rem',
                    }}
                  >
                    Opening UPI App
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Please complete the payment securely in your UPI app.
                  </p>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid var(--glass-edge)',
                      boxShadow: 'var(--sh-small)',
                      padding: '8px 20px',
                      borderRadius: '999px',
                      display: 'inline-block',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--blue)',
                    }}
                  >
                    00:0{upiCountdown}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Content */}
          {activeTab === 'Card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Cardholder Name</label>
                <input
                  type="text"
                  className="sunken"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={{ height: '46px', padding: '0 14px', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label className="input-label">Card Number</label>
                <input
                  type="text"
                  className="sunken"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  style={{ height: '46px', padding: '0 14px', fontSize: '0.88rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Expiry Date</label>
                  <input
                    type="text"
                    className="sunken"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    style={{ height: '46px', padding: '0 14px', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label className="input-label">CVV</label>
                  <input
                    type="password"
                    className="sunken"
                    placeholder="***"
                    value={cardCvv}
                    onChange={(e) => handleCvvChange(e.target.value)}
                    style={{ height: '46px', padding: '0 14px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={executePayment}
                disabled={isProcessing}
                style={{ marginTop: '8px', width: '100%' }}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
              </button>
            </div>
          )}

          {/* Wallet Content */}
          {activeTab === 'Wallet' && (
            <div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.55)',
                  padding: '16px',
                  borderRadius: '18px',
                  border: '1px solid var(--glass-edge)',
                  boxShadow: 'var(--sh-small)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--ink-2)' }}>Current Balance:</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>₹{walletBalance.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--ink-2)' }}>Payment Amount:</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-danger-text)' }}>- ₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px dashed var(--glass-edge)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: 'var(--ink)' }}>Remaining Balance:</span>
                  <span style={{ color: walletBalance >= amount ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>
                    ₹{(walletBalance - amount).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={executePayment}
                disabled={isProcessing || walletBalance < amount}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
