import React, { useState, useEffect, useRef } from 'react';
import {
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhone,
} from 'react-icons/hi2';
import { fetchBookingMessages, sendBookingMessage, initiateBookingCall } from '../pages/worker/workerApi';
import { socket } from '../socket';

export default function BookingChatModal({
  isOpen,
  onClose,
  token,
  bookingId,
  customerName = 'Customer',
  workerName = 'Service Pro',
  currentUserRole = 'worker',
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [callNotice, setCallNotice] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !bookingId || !token) return;

    let isMounted = true;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await fetchBookingMessages(token, bookingId);
        if (isMounted) setMessages(data || []);
      } catch (err) {
        console.warn('Failed to load chat messages:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMessages();

    // Listen for live messages on socket
    const handleIncomingMessage = (msg) => {
      if (msg.bookingId === bookingId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:message', handleIncomingMessage);

    return () => {
      isMounted = false;
      socket.off('chat:message', handleIncomingMessage);
    };
  }, [isOpen, bookingId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const savedMsg = await sendBookingMessage(token, bookingId, textToSend);
      setMessages((prev) => [...prev, savedMsg]);
    } catch (err) {
      alert(err.message || 'Failed to send message');
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleCall = async () => {
    setCallNotice('');
    try {
      const res = await initiateBookingCall(token, bookingId);
      setCallNotice(res.message || 'Call relay is currently simulated.');
    } catch (err) {
      setCallNotice(err.message || 'Call failed');
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
          maxWidth: '480px',
          height: '580px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              <HiOutlineChatBubbleLeftRight style={{ fontSize: '1.2rem' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {currentUserRole === 'worker' ? customerName : workerName}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Booking #{bookingId}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCall}
              title="Call Contact"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <HiOutlinePhone /> Call
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HiOutlineXMark />
            </button>
          </div>
        </div>

        {callNotice && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.78rem',
              borderBottom: '1px solid #bfdbfe',
              textAlign: 'center',
            }}
          >
            {callNotice}
          </div>
        )}

        {/* Message Thread */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f8fafc',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto', fontSize: '0.9rem' }}>
              No messages yet. Send a message to coordinate service delivery!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (currentUserRole === 'worker' && msg.sender?.role === 'WORKER') ||
                (currentUserRole === 'customer' && msg.sender?.role === 'CUSTOMER') ||
                msg.senderId === token;

              return (
                <div
                  key={msg.id || Math.random()}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    backgroundColor: isMine ? '#2563eb' : '#ffffff',
                    color: isMine ? '#ffffff' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    fontSize: '0.88rem',
                    lineHeight: '1.4',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px' }}>
                    {msg.sender?.name || (isMine ? 'You' : 'Participant')}
                  </div>
                  <div>{msg.text}</div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      opacity: 0.7,
                      textAlign: 'right',
                      marginTop: '4px',
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '8px',
            backgroundColor: '#ffffff',
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '24px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: !newMessage.trim() || sending ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !newMessage.trim() || sending ? 0.6 : 1,
            }}
          >
            <HiOutlinePaperAirplane style={{ fontSize: '1.1rem' }} />
          </button>
        </form>
      </div>
    </div>
  );
}
