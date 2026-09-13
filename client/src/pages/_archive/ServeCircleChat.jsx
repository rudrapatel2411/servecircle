import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePhone, HiOutlinePaperAirplane, HiOutlineLockClosed, HiOutlineUserCircle } from 'react-icons/hi2';

const ServeCircleChat = ({ workerName = 'Rajesh Kumar', workerAvatar }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'worker', text: 'msg1', time: '10:30 AM' },
    { id: 2, sender: 'worker', text: 'msg2', time: '10:31 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('ringing');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call timer effect
  useEffect(() => {
    let interval;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
        if (callStatus === 'ringing') {
          setCallStatus('connected');
        }
      }, 1000);
    } else {
      setCallDuration(0);
      setCallStatus('ringing');
    }
    return () => clearInterval(interval);
  }, [isCalling, callStatus]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'customer',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulated worker reply after 1.5 seconds
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'worker',
          text: 'msgReply',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      height: '520px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      color: 'white',
      maxWidth: '560px',
      margin: '20px auto'
    }}>
      {/* Secure Header */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(30, 41, 59, 0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {workerAvatar ? (
            <img
              src={workerAvatar}
              alt={workerName}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              <HiOutlineUserCircle />
            </div>
          )}
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{workerName}</h4>
            <span style={{ fontSize: '0.7rem', color: '#3b7dc1', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b7dc1' }}></span> {t('secureChat.online')}
            </span>
          </div>
        </div>

        {/* Masked Voice Call Trigger */}
        <button
          type="button"
          onClick={() => setIsCalling(true)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(59, 125, 193, 0.1)',
            color: '#3b7dc1',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title={t('secureChat.maskedCall')}
        >
          <HiOutlinePhone />
        </button>
      </div>

      {/* Trust Badge Bar */}
      <div style={{
        background: 'rgba(59, 125, 193, 0.08)',
        color: '#609cd2',
        fontSize: '0.72rem',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderBottom: '1px solid rgba(59, 125, 193, 0.1)'
      }}>
        <HiOutlineLockClosed style={{ fontSize: '0.85rem' }} />
        <span>{t('secureChat.proxyActive')}</span>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {messages.map((msg) => {
          const isMe = msg.sender === 'customer';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                background: isMe ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                {t('secureChat.' + msg.text, msg.text)}
              </div>
              <span style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '4px' }}>
                {msg.time}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Form Footer */}
      <form onSubmit={handleSendMessage} style={{
        padding: '14px 20px',
        background: 'rgba(30, 41, 59, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('secureChat.placeholder')}
          style={{
            flex: 1,
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '10px 16px',
            color: 'white',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
        >
          <HiOutlinePaperAirplane />
        </button>
      </form>

      {/* VOICE CALL SIMULATION OVERLAY */}
      {isCalling && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fade-in 0.3s ease'
        }}>
          {/* Animated Pulsing Ringing Circles */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(59, 125, 193, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #3b7dc1',
              animation: 'ping 1.5s infinite'
            }} />
            {workerAvatar ? (
              <img
                src={workerAvatar}
                alt={workerName}
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: '3rem', color: '#3b7dc1' }}>
                <HiOutlinePhone />
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>{workerName}</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '50px' }}>
            🔒 {t('secureChat.maskedCallLabel')}
          </span>

          <p style={{
            color: '#3b7dc1',
            fontWeight: 700,
            marginTop: '24px',
            fontSize: '0.9rem',
            letterSpacing: '0.5px'
          }}>
            {t('secureChat.' + callStatus, callStatus)}
          </p>

          {callDuration > 0 && (
            <p style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', margin: '4px 0 0 0' }}>
              {formatDuration(callDuration)}
            </p>
          )}

          {/* Decline Button */}
          <button
            type="button"
            onClick={() => setIsCalling(false)}
            style={{
              marginTop: '40px',
              padding: '12px 30px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {t('secureChat.endSecureCall')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ServeCircleChat;
