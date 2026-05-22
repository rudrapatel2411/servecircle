import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineVideoCamera, HiOutlineVideoCameraSlash, HiOutlineMicrophone,
  HiOutlinePhoneXMark, HiOutlineChatBubbleBottomCenterText,
  HiOutlineCalendar, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlinePaperAirplane, HiOutlineSpeakerWave
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const consultants = [
  {
    id: 1,
    name: 'Sanjeev Nair',
    specialty: 'Senior Electrical Inspector',
    rating: 4.9,
    jobs: 1420,
    avatar: 'SN',
    fee: 199,
    availableToday: ['3:00 PM', '4:30 PM', '6:00 PM']
  },
  {
    id: 2,
    name: 'Harish Mehta',
    specialty: 'Structural Engineer & Plumber Pro',
    rating: 4.8,
    jobs: 980,
    avatar: 'HM',
    fee: 149,
    availableToday: ['2:00 PM', '3:30 PM', '5:00 PM']
  },
  {
    id: 3,
    name: 'Anjali Desai',
    specialty: 'Interior & Architectural Designer',
    rating: 4.9,
    jobs: 850,
    avatar: 'AD',
    fee: 299,
    availableToday: ['4:00 PM', '5:30 PM', '7:00 PM']
  }
];

const VideoConsultation = () => {
  const { t } = useTranslation();
  
  const [activeCall, setActiveCall] = useState(null); // consultant object or null
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  
  const [chatMessages, setChatMessages] = useState([
    { sender: 'expert', text: 'Hello Rudra! Thanks for joining. How can I help you diagnose your home repair issue today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const [selectedConsultant, setSelectedConsultant] = useState(consultants[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookedConsultations, setBookedConsultations] = useState([
    {
      id: 101,
      consultant: consultants[1],
      date: 'Today',
      time: '5:00 PM',
      status: 'Ready to Join'
    }
  ]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, inCall]);

  const handleBook = (e) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      alert('Please select a time slot!');
      return;
    }

    const newBooking = {
      id: Date.now(),
      consultant: selectedConsultant,
      date: 'Tomorrow',
      time: selectedTimeSlot,
      status: 'Scheduled'
    };

    setBookedConsultations((prev) => [newBooking, ...prev]);
    setSelectedTimeSlot('');
    alert(`🎉 Video consultation booked with ${selectedConsultant.name} for ${newBooking.date} at ${newBooking.time}.`);
  };

  const startMockCall = (consultant) => {
    setActiveCall(consultant);
    setInCall(true);
    setMicActive(true);
    setCamActive(true);
    setChatMessages([
      { sender: 'expert', text: `Hello Rudra! Thanks for connecting. I am ${consultant.name}, your expert consultant. How can I assist you?` }
    ]);
  };

  const endCall = () => {
    setInCall(false);
    setActiveCall(null);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Trigger mock expert response after a delay
    setTimeout(() => {
      let reply = "I understand. Based on what you described, that sounds like a standard issue. We can definitely route a priority worker to get this fixed.";
      if (inputText.toLowerCase().includes('leak') || inputText.toLowerCase().includes('water')) {
        reply = "That water leak requires immediate attention. I suggest shutting down the main valve first. I will recommend booking the priority Plumber service right away.";
      } else if (inputText.toLowerCase().includes('short') || inputText.toLowerCase().includes('wire') || inputText.toLowerCase().includes('spark')) {
        reply = "Sparks mean an active short circuit. Please switch off the main circuit breaker. Let me recommend the Emergency Electrical service.";
      }
      setChatMessages((prev) => [...prev, { sender: 'expert', text: reply }]);
    }, 1500);
  };

  return (
    <div className="page-content" style={{ minHeight: '90vh' }}>
      
      <AnimatePresence mode="wait">
        {!inCall ? (
          <motion.div
            key="scheduler-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <div className="page-header">
              <div>
                <h1 className="page-title">{t('customer.videoConsultation')} 📹</h1>
                <p className="page-subtitle">Video call our certified home experts to diagnose repairs and save costly unnecessary visits.</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr', gap: '24px' }}>
              
              {/* Consultant Booking Area */}
              <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>Book a New Virtual consultation</h3>
                
                {/* Consultant Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-500)' }}>Choose an Expert Consultant</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {consultants.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConsultant(c);
                          setSelectedTimeSlot('');
                        }}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: selectedConsultant.id === c.id ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                          background: selectedConsultant.id === c.id ? 'var(--primary-50)' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'var(--navy-800)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                          }}>{c.avatar}</div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>{c.name}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{c.specialty}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', marginTop: '14px', fontSize: '0.75rem', borderTop: '1px solid var(--gray-100)', paddingTop: '10px' }}>
                          <span style={{ fontWeight: 600 }}>⭐ {c.rating} ({c.jobs} jobs)</span>
                          <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>₹{c.fee} / call</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Time Slot Form */}
                <form onSubmit={handleBook}>
                  <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label><HiOutlineCalendar /> Consultation Date</label>
                      <select className="input-field">
                        <option>Today (Available)</option>
                        <option>Tomorrow</option>
                        <option>Day after tomorrow</option>
                      </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label><HiOutlineClock /> Available Time Slots</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {selectedConsultant.availableToday.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                    Book Call Slot • Paid Consultation (₹{selectedConsultant.fee})
                  </button>
                </form>
              </div>

              {/* Consultation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px' }}>My Consultations</h3>
                  
                  {bookedConsultations.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>No booked video calls.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {bookedConsultations.map((bc) => (
                        <div
                          key={bc.id}
                          className="card"
                          style={{
                            padding: '16px',
                            border: '1.5px solid var(--primary-200)',
                            background: bc.status.includes('Ready') ? 'var(--primary-50)' : 'white'
                          }}
                        >
                          <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{bc.consultant.name}</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>{bc.consultant.specialty}</p>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                <span>📅 {bc.date}</span>
                                <span>⏰ {bc.time}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--primary-500)', color: 'white', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                              {bc.status}
                            </span>
                          </div>

                          {bc.status.includes('Ready') && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              onClick={() => startMockCall(bc.consultant)}
                            >
                              <HiOutlineVideoCamera /> Join Consultation Room
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="call-room-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 0.9fr',
              gap: '20px',
              height: '84vh',
              background: '#0f172a',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              padding: '16px'
            }}
          >
            {/* Left: Video Streams Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              
              <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px', position: 'relative' }}>
                
                {/* Consultant Main Stream */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255,255,255,0.08)'
                }}>
                  {/* Mock expert camera feed */}
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'var(--gradient-primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 900,
                    boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                    animation: 'pulse 1.8s infinite'
                  }}>
                    {activeCall.avatar}
                  </div>
                  
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineSpeakerWave style={{ animation: 'pulse 1s infinite', color: 'var(--primary-400)' }} />
                    <span>{activeCall.name} (Expert Consultant)</span>
                  </div>

                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--danger)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                    LIVE pre-inspection
                  </div>
                </div>

                {/* Customer Stream Preview */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255,255,255,0.08)'
                }}>
                  {camActive ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#475569', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px'
                      }}>RU</div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Local Camera Preview active</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <HiOutlineVideoCameraSlash style={{ fontSize: '2.5rem', marginBottom: '10px' }} />
                      <p style={{ fontSize: '0.8rem' }}>Your Camera is Off</p>
                    </div>
                  )}

                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                    Rudra (You) {micActive ? '🎙️' : '🔇'}
                  </div>
                </div>

              </div>

              {/* Call Controls Bar */}
              <div style={{
                background: '#1e293b',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
              }}>
                <button
                  onClick={() => setMicActive(!micActive)}
                  style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: micActive ? '#334155' : 'var(--danger)',
                    color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', transition: 'all 0.2s'
                  }}
                  title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                >
                  <HiOutlineMicrophone style={{ opacity: micActive ? 1 : 0.7 }} />
                </button>

                <button
                  onClick={() => setCamActive(!camActive)}
                  style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: camActive ? '#334155' : 'var(--danger)',
                    color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', transition: 'all 0.2s'
                  }}
                  title={camActive ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {camActive ? <HiOutlineVideoCamera /> : <HiOutlineVideoCameraSlash />}
                </button>

                <button
                  onClick={endCall}
                  style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'var(--danger)', color: 'white',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', transition: 'all 0.2s',
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)'
                  }}
                  title="Hang Up Consultation"
                >
                  <HiOutlinePhoneXMark />
                </button>
              </div>

            </div>

            {/* Right: Immersive In-call Chat panel */}
            <div style={{
              background: '#1e293b',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              border: '1.5px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>
                <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800 }}>
                  <HiOutlineChatBubbleBottomCenterText style={{ color: 'var(--primary-400)' }} /> In-Call Consultation Chat
                </h4>
              </div>

              {/* Message Streams */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === 'expert' ? 'flex-start' : 'flex-end',
                      background: msg.sender === 'expert' ? '#334155' : 'var(--gradient-primary)',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'expert' ? '0 12px 12px 12px' : '12px 12px 0 12px',
                      maxWidth: '85%',
                      fontSize: '0.8rem',
                      lineHeight: 1.4
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', background: '#111827' }}>
                <input
                  type="text"
                  placeholder="Type an issue, e.g. leak, wire..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" style={{
                  padding: '10px',
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <HiOutlinePaperAirplane style={{ fontSize: '1rem' }} />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VideoConsultation;
