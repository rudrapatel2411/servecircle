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
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="card animate-scale-up" style={{
        width: '100%', maxWidth: '400px', background: 'white', padding: '0',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', fontWeight: 800, margin: 0 }}>
              Complete Payment
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>Amount to pay: <strong>₹{amount.toLocaleString('en-IN')}</strong></p>
          </div>
          <button 
            onClick={() => !isProcessing && onClose()}
            disabled={isProcessing || (activeTab === 'UPI' && upiStep === 2)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: '4px' }}
          >
            <HiOutlineXMark style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)' }}>
          {['UPI', 'Card', 'Wallet'].map(tab => (
            <button
              key={tab}
              disabled={isProcessing || (activeTab === 'UPI' && upiStep === 2)}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px 0', border: 'none', background: activeTab === tab ? 'white' : 'var(--gray-50)',
                color: activeTab === tab ? 'var(--primary-600)' : 'var(--gray-500)',
                fontWeight: activeTab === tab ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--primary-500)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          {error && (
            <div style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center', background: '#fef2f2', padding: '8px', borderRadius: '8px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* UPI Content */}
          {activeTab === 'UPI' && (
            <div>
              {upiStep === 1 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '16px' }}>Click below to open your preferred UPI app and complete the transaction.</p>
                  <button className="btn btn-primary" onClick={executePayment} style={{ width: '100%' }}>Pay via UPI App</button>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', margin: '0 auto 16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '3px solid var(--gray-100)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '3px solid var(--primary-500)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                  <h4 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                    Opening UPI App
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Please complete the payment securely in your UPI app.
                  </p>
                  <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    00:0{upiCountdown}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Content */}
          {activeTab === 'Card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Cardholder Name</label>
                <input type="text" className="input-field" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Card Number</label>
                <input type="text" className="input-field" placeholder="xxxx xxxx xxxx xxxx" value={cardNumber} onChange={(e) => handleCardNumberChange(e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Expiry Date</label>
                  <input type="text" className="input-field" placeholder="MM/YY" value={cardExpiry} onChange={(e) => handleExpiryChange(e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>CVV</label>
                  <input type="password" className="input-field" placeholder="***" value={cardCvv} onChange={(e) => handleCvvChange(e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={executePayment} disabled={isProcessing} style={{ marginTop: '10px' }}>
                {isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
              </button>
            </div>
          )}

          {/* Wallet Content */}
          {activeTab === 'Wallet' && (
            <div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--gray-200)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--gray-600)' }}>Current Balance:</span>
                  <span style={{ fontWeight: 800, color: 'var(--navy-800)' }}>₹{walletBalance.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--gray-600)' }}>Payment Amount:</span>
                  <span style={{ fontWeight: 800, color: 'var(--danger-700)' }}>- ₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--gray-300)', fontSize: '0.85rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--navy-800)' }}>Remaining Balance:</span>
                  <span style={{ color: walletBalance >= amount ? 'var(--primary-700)' : 'var(--danger-600)' }}>
                    ₹{(walletBalance - amount).toFixed(2)}
                  </span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={executePayment} disabled={isProcessing || walletBalance < amount} style={{ width: '100%' }}>
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
