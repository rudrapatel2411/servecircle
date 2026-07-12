import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineVideoCamera, HiOutlineVideoCameraSlash, HiOutlineMicrophone,
  HiOutlinePhoneXMark, HiOutlineChatBubbleBottomCenterText,
  HiOutlineCalendar, HiOutlineClock,
  HiOutlinePaperAirplane, HiOutlineSpeakerWave
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
    { sender: 'expert', text: 'expertPrompt1' }
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
      status: 'readyToJoin'
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
      alert(t('videoConsultation.selectTimeAlert', 'Please select a time slot!'));
      return;
    }

    const newBooking = {
      id: Date.now(),
      consultant: selectedConsultant,
      date: 'Tomorrow',
      time: selectedTimeSlot,
      status: 'scheduled'
    };

    setBookedConsultations((prev) => [newBooking, ...prev]);
    setSelectedTimeSlot('');
    alert(`🎉 ${t('videoConsultation.bookedSuccess', 'Video consultation successfully scheduled!')}`);
  };

  const startMockCall = (consultant) => {
    setActiveCall(consultant);
    setInCall(true);
    setMicActive(true);
    setCamActive(true);
    setChatMessages([
      { sender: 'expert', text: 'expertReply1' }
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
      let reply = "expertReplyNormal";
      if (inputText.toLowerCase().includes('leak') || inputText.toLowerCase().includes('water')) {
        reply = "expertReplyLeak";
      } else if (inputText.toLowerCase().includes('short') || inputText.toLowerCase().includes('wire') || inputText.toLowerCase().includes('spark')) {
        reply = "expertReplyElectric";
      }
      setChatMessages((prev) => [...prev, { sender: 'expert', text: reply }]);
    }, 1500);
  };

  const getConsultantName = (c) => t('videoConsultation.expert' + c.id + 'Name', c.name);
  const getConsultantSpecialty = (c) => t('videoConsultation.expert' + c.id + 'Specialty', c.specialty);
  const getBookingDateLabel = (dateStr) => {
    if (dateStr === 'Today') return t('videoConsultation.todayAvailable');
    if (dateStr === 'Tomorrow') return t('videoConsultation.tomorrow');
    if (dateStr === 'Day after tomorrow') return t('videoConsultation.dayAfterTomorrow');
    return dateStr;
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
                <p className="page-subtitle">{t('videoConsultation.certifiedSubtitle')}</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr', gap: '24px' }}>
              
              {/* Consultant Booking Area */}
              <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>{t('videoConsultation.bookNewVirtual')}</h3>
                
                {/* Consultant Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-500)' }}>{t('videoConsultation.chooseExpert')}</label>
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
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>{getConsultantName(c)}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{getConsultantSpecialty(c)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', marginTop: '14px', fontSize: '0.75rem', borderTop: '1px solid var(--gray-100)', paddingTop: '10px' }}>
                          <span style={{ fontWeight: 600 }}>⭐ {c.rating} ({c.jobs} {t('videoConsultation.jobs')})</span>
                          <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>₹{c.fee} {t('videoConsultation.callPrice')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Time Slot Form */}
                <form onSubmit={handleBook}>
                  <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label><HiOutlineCalendar /> {t('videoConsultation.consultationDate')}</label>
                      <select className="input-field">
                        <option value="Today">{t('videoConsultation.todayAvailable')}</option>
                        <option value="Tomorrow">{t('videoConsultation.tomorrow')}</option>
                        <option value="Day after tomorrow">{t('videoConsultation.dayAfterTomorrow')}</option>
                      </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label><HiOutlineClock /> {t('videoConsultation.availableTimeSlots')}</label>
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
                    {t('videoConsultation.bookCallSlotPaid')} (₹{selectedConsultant.fee})
                  </button>
                </form>
              </div>

              {/* Consultation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px' }}>{t('videoConsultation.myConsultations')}</h3>
                  
                  {bookedConsultations.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{t('videoConsultation.noBookedVideo')}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {bookedConsultations.map((bc) => (
                        <div
                          key={bc.id}
                          className="card"
                          style={{
                            padding: '16px',
                            border: '1.5px solid var(--primary-200)',
                            background: bc.status.includes('Ready') || bc.status === 'readyToJoin' ? 'var(--primary-50)' : 'white'
                          }}
                        >
                          <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{getConsultantName(bc.consultant)}</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>{getConsultantSpecialty(bc.consultant)}</p>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                <span>📅 {getBookingDateLabel(bc.date)}</span>
                                <span>⏰ {bc.time}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--primary-500)', color: 'white', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                              {t('videoConsultation.' + bc.status, bc.status)}
                            </span>
                          </div>

                          {(bc.status.includes('Ready') || bc.status === 'readyToJoin') && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              onClick={() => startMockCall(bc.consultant)}
                            >
                              <HiOutlineVideoCamera /> {t('videoConsultation.joinConsultationRoom')}
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
                    <span>{getConsultantName(activeCall)} ({t('videoConsultation.expertConsultant')})</span>
                  </div>

                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--danger)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {t('videoConsultation.livePreInspection')}
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
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t('videoConsultation.localCameraPreview')}</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <HiOutlineVideoCameraSlash style={{ fontSize: '2.5rem', marginBottom: '10px' }} />
                      <p style={{ fontSize: '0.8rem' }}>{t('videoConsultation.cameraOff')}</p>
                    </div>
                  )}

                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                    Rudra ({t('videoConsultation.you')}) {micActive ? '🎙️' : '🔇'}
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
                  title={micActive ? t('videoConsultation.muteMic') : t('videoConsultation.unmuteMic')}
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
                  title={camActive ? t('videoConsultation.turnCameraOff') : t('videoConsultation.turnCameraOn')}
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
                  title={t('videoConsultation.hangUp')}
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
                  <HiOutlineChatBubbleBottomCenterText style={{ color: 'var(--primary-400)' }} /> {t('videoConsultation.inCallChat')}
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
                    {t('videoConsultation.' + msg.text, msg.text)}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', background: '#111827' }}>
                <input
                  type="text"
                  placeholder={t('videoConsultation.chatPlaceholder')}
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
