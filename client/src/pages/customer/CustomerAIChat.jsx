import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 HiOutlineArrowLeft,
 HiOutlineArrowPath,
 HiOutlineClock,
 HiOutlineMicrophone,
 HiOutlinePaperAirplane,
 HiOutlinePhoto,
 HiOutlineSparkles,
 HiOutlineTrash,
 HiOutlineWrenchScrewdriver,
 HiOutlineXMark,
 HiPlus,
 HiStopCircle,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerAIChat.css';

import { API_BASE, getSession } from '../../utils/authSession.js';
import servicesCatalog from '../../data/servicesCatalog.json';
const ACTIVE_SESSION_ID_KEY = 'servecircle_ai_active_session_id';
const SESSIONS_STORAGE_KEY = 'servecircle_ai_chat_sessions';

const initialMessages = [
 {
 id: 'welcome',
 role: 'assistant',
 content: 'Hey! I am ServeCircle AI. Tell me what you need help with, or send a photo or voice note.',
 },
];

function getSpeechRecognition() {
 return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function confidencePercent(value) {
 const score = typeof value === 'number' ? value : value?.score;
 if (typeof score !== 'number') return 'Not sure';
 return `${Math.round(score * 100)}%`;
}

function cleanLabel(value, fallback) {
 const label = String(value || '').trim();
 if (!label) return fallback;
 const lower = label.toLowerCase();
 if (lower.includes('conversation context') || lower.includes('previous conversation') || lower.includes('latest customer message')) {
 return fallback;
 }
 if (label.length > 90) return fallback;
 return label;
}

function deriveSessionTitle(sessionMessages = []) {
 const userMsg = sessionMessages.find((m) => m.role === 'user' && m.content && m.content !== 'Photo attached');
 if (userMsg?.content) {
 const text = userMsg.content.trim();
 return text.length > 32 ? `${text.slice(0, 32)}...` : text;
 }
 const aiMsg = sessionMessages.find((m) => m.analysis?.title);
 if (aiMsg?.analysis?.title) return aiMsg.analysis.title;
 return 'Service Assistance';
}

function getAnalysisParts(response) {
 const multimodal = response?.analysis?.multimodal || response?.analysis;
 const problem = multimodal?.problemAnalysis || {};
 const service = multimodal?.serviceResolution || multimodal?.recommendation?.recommendedService || {};
 const recommendation = multimodal?.recommendation || {};
 const summary = multimodal?.summary || response?.analysis?.prediction || {};

 const rawPrice = service.priceRangeInr?.min 
 || recommendation.recommendedService?.priceRangeInr?.min 
 || recommendation.recommendedService?.estimatedPrice 
 || service.estimatedPrice;

 return {
 problem,
 service,
 recommendation,
 title: cleanLabel(problem.aiAnalysisRaw?.problemType || problem.possibleProblems?.[0]?.name || summary.topProblem, 'Service issue'),
 category: cleanLabel(service.category || problem.aiAnalysisRaw?.serviceCategory || summary.problemCategory, 'Service'),
 serviceName: cleanLabel(service.service || recommendation.recommendedService?.name || summary.resolvedService, 'Recommended service'),
 urgency: cleanLabel(summary.urgencyLevel || problem.aiAnalysisRaw?.urgency || recommendation.priority?.level, 'Standard'),
 skill: cleanLabel(service.requiredWorkerSkill || summary.requiredSkill || recommendation.requiredSkill?.primary, 'Technician'),
 duration: cleanLabel(service.estimatedDurationLabel || recommendation.recommendedService?.estimatedDurationLabel || problem.aiAnalysisRaw?.estimatedDuration, 'After inspection'),
 confidence: confidencePercent(recommendation.confidence?.overall || problem.confidence || response?.analysis?.confidence),
 price: rawPrice ? `₹${rawPrice}` : 'From ₹349',
 rawPrice: rawPrice || 499,
 targetHubRoute: service.targetHubRoute || null,
 serviceId: service.serviceId || recommendation.recommendedService?.serviceId || '',
 questions: response?.followUpQuestions || problem.aiAnalysisRaw?.followUpQuestions || recommendation.additionalQuestions?.map((q) => q.question) || [],
 actions: problem.aiAnalysisRaw?.recommendedActions || service.safetyPrecautions || recommendation.recommendedService?.safetyPrecautions || [],
 };
}

function ctaLabel(analysis) {
 const serviceName = analysis?.serviceName || 'Service';
 const skill = String(analysis?.skill || '').toLowerCase();
 const category = String(analysis?.category || '').toLowerCase();
 const name = String(analysis?.serviceName || '').toLowerCase();

 let icon = '';
 if (category.includes('travel') || skill.includes('driver')) icon = '';
 else if (category.includes('food') || skill.includes('cook') || skill.includes('chef')) icon = '';
 else if (category.includes('pet') || skill.includes('pet') || name.includes('dog')) icon = '';
 else if (category.includes('health') || skill.includes('nurse') || skill.includes('doctor')) icon = '🩺';
 else if (category.includes('event') || skill.includes('event')) icon = '';
 else if (category.includes('vehicle') || skill.includes('detailer') || skill.includes('mechanic')) icon = '';
 else if (category.includes('moving') || category.includes('relocation')) icon = '';
 else if (category.includes('society') || skill.includes('security')) icon = '';
 else if (category.includes('it') || skill.includes('cctv')) icon = '';
 else if (skill.includes('plumb') || name.includes('plumb') || name.includes('leak') || name.includes('pipe')) icon = '';
 else if (skill.includes('ac') || name.includes('ac') || name.includes('cooling')) icon = '';
 else if (skill.includes('electric') || name.includes('electric') || name.includes('wire')) icon = '';
 else if (skill.includes('clean') || name.includes('clean') || name.includes('safai')) icon = '';
 else if (skill.includes('paint') || name.includes('paint')) icon = '';
 else if (skill.includes('carpent') || name.includes('carpent') || name.includes('lock')) icon = '🪚';
 else if (skill.includes('pest') || name.includes('pest')) icon = '';
 else if (skill.includes('garden') || name.includes('garden')) icon = '';

 return `Book ${serviceName} ${icon}`;
}

/**
 * Returns true only when the AI analysis points to a service that actually
 * exists in the platform catalog. This prevents random / hallucinated service
 * cards from appearing after general conversation messages.
 *
 * Matching strategy (in priority order):
 * 1. Exact name match (case-insensitive)
 * 2. Partial name match (AI name contains catalog name or vice-versa)
 * 3. Category keyword match as a last-resort safety net
 */
function isValidService(analysis) {
 if (!analysis) return false;
 const aiServiceId = String(analysis.serviceId || '').trim();
 const aiName = String(analysis.serviceName || '').toLowerCase().trim();
 const aiCategory = String(analysis.category || '').toLowerCase().trim();
 if (!aiName && !aiServiceId) return false;

 return servicesCatalog.some((svc) => {
 if (aiServiceId && svc.serviceId === aiServiceId) return true;
 const svcName = svc.name.toLowerCase();
 const svcCat = svc.category.toLowerCase();
 // Exact or partial name match
 if (svcName === aiName) return true;
 if (svcName.includes(aiName) || aiName.includes(svcName)) return true;
 // Category alignment as fallback (e.g. "Home Repairs" catches many sub-services)
 if (aiCategory && svcCat === aiCategory && aiName.length > 3) return true;
 return false;
 });
}

const QUICK_SUGGESTIONS = [
 { label: ' AC Repair / Cooling', prompt: 'AC is blowing warm air, need urgent cooling repair' },
 { label: ' Tap & Pipe Leakage', prompt: 'Bathroom pipe se water leak ho raha hai, plumber chahiye' },
 { label: ' Fan / Switch Repair', prompt: 'Ceiling fan is not running and switch board sparked' },
 { label: ' Packers & Movers', prompt: 'Need packers and movers for 2BHK house shifting' },
 { label: ' Need a Driver', prompt: 'Need a verified driver for outstation travel' },
 { label: ' Pet Grooming / Bath', prompt: 'Need dog grooming and bathing service at home' },
 { label: ' Deep Cleaning', prompt: 'Need complete deep cleaning for 2BHK flat' },
 { label: ' Sofa & Carpet Clean', prompt: 'Need sofa shampoo and carpet dry cleaning at home' },
 { label: ' Door Lock / Carpentry', prompt: 'Main door wooden lock is jammed, need carpenter' },
 { label: ' Home Cook / Chef', prompt: 'Need daily home cook service for family meals' },
 { label: ' CCTV & IT Setup', prompt: 'Need CCTV camera installation and WiFi setup' },
 { label: '🩺 Doctor / Physio', prompt: 'Need doctor consultation and physiotherapy at home' },
];

const CustomerAIChat = () => {
 const navigate = useNavigate();
 const fileInputRef = useRef(null);
 const recognitionRef = useRef(null);

 // All saved sessions
 const [sessions, setSessions] = useState(() => {
 try {
 const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
 return saved ? JSON.parse(saved) : [];
 } catch {
 return [];
 }
 });

 // Current active session ID
 const [activeSessionId, setActiveSessionId] = useState(() => {
 try {
 return localStorage.getItem(ACTIVE_SESSION_ID_KEY) || `session-${Date.now()}`;
 } catch {
 return `session-${Date.now()}`;
 }
 });

 // Current messages in active session
 const [messages, setMessages] = useState(() => {
 try {
 const savedActiveId = localStorage.getItem(ACTIVE_SESSION_ID_KEY);
 const savedSessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
 if (savedActiveId && savedSessions.length > 0) {
 const found = savedSessions.find((s) => s.id === savedActiveId);
 if (found?.messages?.length > 0) return found.messages;
 }
 } catch {}
 return initialMessages;
 });

 const [input, setInput] = useState('');
 const [image, setImage] = useState(null);
 const [isSending, setIsSending] = useState(false);
 const [error, setError] = useState('');
 const [isRecording, setIsRecording] = useState(false);
 const [voiceError, setVoiceError] = useState('');
 const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

 // Sync active session and sessions list to localStorage whenever messages change
 useEffect(() => {
 try {
 localStorage.setItem(ACTIVE_SESSION_ID_KEY, activeSessionId);
 setSessions((prevSessions) => {
 const title = deriveSessionTitle(messages);
 const existingIdx = prevSessions.findIndex((s) => s.id === activeSessionId);
 const updatedSession = {
 id: activeSessionId,
 title,
 updatedAt: new Date().toISOString(),
 messages,
 };

 let newSessions;
 if (existingIdx >= 0) {
 newSessions = [...prevSessions];
 newSessions[existingIdx] = updatedSession;
 } else {
 newSessions = [updatedSession, ...prevSessions];
 }

 localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
 return newSessions;
 });
 } catch (e) {
 console.error('Failed to sync chat session:', e);
 }
 }, [messages, activeSessionId]);

 const canSend = useMemo(() => (input.trim() || image) && !isSending, [input, image, isSending]);

 // Start brand new chat without losing history
 const startNewChat = () => {
 const newSessionId = `session-${Date.now()}`;
 setActiveSessionId(newSessionId);
 setMessages(initialMessages);
 setInput('');
 setImage(null);
 setError('');
 setShowHistoryDrawer(false);
 };

 // Load a selected session from history
 const loadSession = (session) => {
 setActiveSessionId(session.id);
 setMessages(session.messages || initialMessages);
 setInput('');
 setImage(null);
 setError('');
 setShowHistoryDrawer(false);
 };

 // Delete a session from history
 const deleteSession = (sessionId, event) => {
 event.stopPropagation();
 const updatedSessions = sessions.filter((s) => s.id !== sessionId);
 setSessions(updatedSessions);
 try {
 localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
 } catch {}

 // If active session was deleted, start a new chat
 if (activeSessionId === sessionId) {
 startNewChat();
 }
 };

 const pickImage = (event) => {
 const file = event.target.files?.[0];
 if (!file) return;
 if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
 setError('Please select a JPG, PNG, or WEBP image.');
 return;
 }
 if (file.size > 20 * 1024 * 1024) {
 setError('Image is too large. Please choose one under 20 MB.');
 return;
 }
 setError('');
 setImage({ file, url: URL.createObjectURL(file) });
 };

 const messagesEndRef = useRef(null);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages, isSending]);

 const sendMessage = async (overridePrompt = null) => {
 const isDirect = typeof overridePrompt === 'string' && overridePrompt.trim().length > 0;
 const text = isDirect ? overridePrompt.trim() : input.trim();
 const attachedImage = isDirect ? null : image;

 if (!text && !attachedImage) return;
 if (isSending) return;

 const userMessage = {
 id: `user-${Date.now()}`,
 role: 'user',
 content: text || 'Photo attached',
 imageUrl: attachedImage?.url,
 };

 setMessages((prev) => [...prev, userMessage]);
 if (!isDirect) {
 setInput('');
 setImage(null);
 }
 setError('');
 setIsSending(true);

 const formData = new FormData();
 formData.append('text', text);
 if (attachedImage?.file) formData.append('image', attachedImage.file);
 formData.append('conversation', JSON.stringify(messages.slice(-12).map(({ role, content, intent }) => ({ role, content, intent }))));
 formData.append('customerContext', JSON.stringify({ preferredLanguage: 'auto' }));
 const controller = new AbortController();
 const requestTimeout = window.setTimeout(() => controller.abort(), 35000);

 try {
 const session = getSession();
 const headers = {};
 if (session?.token) {
 headers['Authorization'] = `Bearer ${session.token}`;
 }

 const response = await fetch(`${API_BASE}/customer/ai/chat`, {
 method: 'POST',
 headers,
 body: formData,
 signal: controller.signal,
 });
 const data = await response.json();
 if (!response.ok) throw new Error(data.message || 'AI request failed');

 setMessages((prev) => [
 ...prev,
 {
 id: `ai-${Date.now()}`,
 role: 'assistant',
 intent: data.intent,
 content: data.message || 'I can help with that.',
 analysis: data.showServiceRecommendation ? getAnalysisParts(data) : null,
 followUpQuestions: data.followUpQuestions || [],
 },
 ]);
 } catch (err) {
 if (!isDirect) {
 setInput(text);
 if (attachedImage) setImage(attachedImage);
 }
 const userMessage = err.name === 'AbortError'
 ? 'AI response timed out. Please try sending your message again.'
 : (err.message || 'AI is unavailable right now.');
 setError(userMessage);
 setMessages((prev) => [
 ...prev,
 {
 id: `err-${Date.now()}`,
 role: 'assistant',
 content: userMessage,
 isError: true,
 },
 ]);
 } finally {
 window.clearTimeout(requestTimeout);
 setIsSending(false);
 }
 };

 const toggleRecording = () => {
 setVoiceError('');
 const SpeechRecognition = getSpeechRecognition();
 if (!SpeechRecognition) {
 setVoiceError('Speech recognition is not supported on this browser.');
 return;
 }

 if (isRecording) {
 recognitionRef.current?.stop();
 setIsRecording(false);
 return;
 }

 const recognition = new SpeechRecognition();
 recognition.lang = 'en-IN';
 recognition.interimResults = false;
 recognition.continuous = false;
 recognition.onresult = (event) => {
 const transcript = Array.from(event.results).map((result) => result[0]?.transcript || '').join(' ').trim();
 if (transcript) setInput((prev) => [prev, transcript].filter(Boolean).join(' '));
 };
 recognition.onerror = () => {
 setVoiceError('Microphone permission or speech recognition failed.');
 setIsRecording(false);
 };
 recognition.onend = () => setIsRecording(false);
 recognitionRef.current = recognition;
 setIsRecording(true);
 recognition.start();
 };

 const bookRecommended = (analysis) => {
 const serviceName = analysis?.serviceName || 'Home Service';
 const category = analysis?.category || 'Home Repairs';
 const price = analysis?.rawPrice || 499;
 const serviceId = analysis?.serviceId || '';
 const params = new URLSearchParams({
 service: serviceName,
 category,
 price: String(price),
 });
 if (serviceId) params.set('serviceId', serviceId);
 navigate(`/customer/book?${params.toString()}`);
 };

 return (
 <div className="ai-chat-page">
 <section className="ai-chat-shell">
 <header className="ai-chat-header">
 <button className="ai-icon-control" onClick={() => navigate(-1)} aria-label="Back">
 <HiOutlineArrowLeft />
 </button>
 <div className="ai-title">
 <span><HiOutlineSparkles /></span>
 <div>
 <h1>ServeCircle AI</h1>
 <p>Chat, image, and voice service routing</p>
 </div>
 </div>
 <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
 <button
 className="btn btn-sm btn-outline-secondary"
 style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700, padding: '5px 10px', borderRadius: '8px' }}
 onClick={() => setShowHistoryDrawer(true)}
 title="View Chat History"
 >
 <HiOutlineClock size={16} /> History ({sessions.filter((s) => s.messages?.length > 1).length})
 </button>
 <button
 className="btn btn-sm btn-primary"
 style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700, padding: '5px 10px', borderRadius: '8px' }}
 onClick={startNewChat}
 title="Start New Chat"
 >
 <HiPlus size={16} /> New Chat
 </button>
 </div>
 </header>

 <main className="ai-messages" aria-live="polite">
 {messages.map((message) => (
 <article key={message.id} className={`ai-message ai-message--${message.role}${message.isError ? ' ai-message--error' : ''}`}>
 {message.imageUrl && <img className="ai-message-image" src={message.imageUrl} alt="Customer upload preview" />}
 <p>{message.content}</p>

 {message.id === 'welcome' && messages.length <= 1 && (
 <div className="ai-suggestions-box">
 <span className="ai-suggestions-label"> Quick Prompts for Testing & Demo:</span>
 <div className="ai-suggestions-list">
 {QUICK_SUGGESTIONS.map((item) => (
 <button
 key={item.label}
 type="button"
 className="ai-suggestion-chip"
 onClick={() => sendMessage(item.prompt)}
 disabled={isSending}
 >
 {item.label}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Service result card — only render when the AI matched a real platform service */}
 {message.analysis && isValidService(message.analysis) && (
 <div className="ai-result-card">
 <div className="ai-result-head">
 <HiOutlineWrenchScrewdriver />
 <div>
 <h2>{message.analysis.serviceName || message.analysis.title}</h2>
 <span>{message.analysis.category ? `${message.analysis.category} • Verified Expert` : (message.analysis.skill || 'Professional Service')}</span>
 </div>
 </div>
 <div className="ai-result-grid">
 <span>Service <strong>{message.analysis.category}</strong></span>
 <span>Urgency <strong>{message.analysis.urgency}</strong></span>
 <span>Confidence <strong>{message.analysis.confidence}</strong></span>
 <span>Est. Price <strong>{message.analysis.price}</strong></span>
 <span>Duration <strong>{message.analysis.duration}</strong></span>
 <span>Skill <strong>{message.analysis.skill}</strong></span>
 </div>
 {message.analysis.actions.length > 0 && (
 <ul className="ai-actions-list">
 {message.analysis.actions.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
 </ul>
 )}
 {message.analysis.questions.length > 0 && (
 <div className="ai-followups">
 {message.analysis.questions.slice(0, 3).map((question) => (
 <button key={question} onClick={() => sendMessage(question)}>{question}</button>
 ))}
 </div>
 )}
 <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
 <button
 type="button"
 className="ai-book-btn"
 style={{ flex: 1, marginTop: 0 }}
 onClick={() => bookRecommended(message.analysis)}
 >
 {ctaLabel(message.analysis)}
 </button>
 {message.analysis.targetHubRoute && message.analysis.targetHubRoute !== '/customer/services' && (
 <button
 type="button"
 className="btn btn-outline-secondary"
 style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}
 onClick={() => navigate(message.analysis.targetHubRoute)}
 title="View Category Hub"
 >
 Hub 
 </button>
 )}
 </div>
 </div>
 )}
 {!message.analysis && message.followUpQuestions?.length > 0 && (
 <div className="ai-followups">
 {message.followUpQuestions.slice(0, 3).map((question) => (
 <button key={question} onClick={() => sendMessage(question)}>{question}</button>
 ))}
 </div>
 )}
 </article>
 ))}
 {isSending && (
 <article className="ai-message ai-message--assistant">
 <p>{image ? 'Looking at your photo...' : 'Thinking...'}</p>
 <div className="ai-thinking"><span /><span /><span /></div>
 </article>
 )}
 <div ref={messagesEndRef} />
 </main>

 <footer className="ai-composer-wrap">
 {(error || voiceError) && (
 <div className="ai-error-line">
 <span>{error || voiceError}</span>
 {error && <button onClick={sendMessage}><HiOutlineArrowPath /> Retry</button>}
 </div>
 )}
 {image && (
 <div className="ai-preview">
 <img src={image.url} alt="Selected upload preview" />
 <button onClick={() => setImage(null)} aria-label="Remove image"><HiOutlineTrash /></button>
 </div>
 )}
 <div className="ai-composer">
 <input ref={fileInputRef} type="file" accept="image/*" onChange={pickImage} hidden />
 <button className="ai-icon-control" onClick={() => fileInputRef.current?.click()} aria-label="Add photo">
 <HiOutlinePhoto />
 </button>
 <textarea
 value={input}
 onChange={(event) => setInput(event.target.value)}
 placeholder="Describe the issue..."
 rows={1}
 onKeyDown={(event) => {
 if (event.key === 'Enter' && !event.shiftKey) {
 event.preventDefault();
 sendMessage();
 }
 }}
 />
 <button className={`ai-icon-control${isRecording ? ' ai-recording' : ''}`} onClick={toggleRecording} aria-label="Voice input">
 {isRecording ? <HiStopCircle /> : <HiOutlineMicrophone />}
 </button>
 <button className="ai-send-btn" disabled={!canSend} onClick={sendMessage} aria-label="Send message">
 <HiOutlinePaperAirplane />
 </button>
 </div>
 </footer>
 </section>

 {/* Chat History Drawer Overlay */}
 {showHistoryDrawer && (
 <div className="ai-history-overlay" onClick={() => setShowHistoryDrawer(false)}>
 <aside className="ai-history-drawer" onClick={(e) => e.stopPropagation()}>
 <header className="ai-history-header">
 <h3><HiOutlineClock /> Chat History</h3>
 <button className="ai-icon-control" onClick={() => setShowHistoryDrawer(false)} aria-label="Close history">
 <HiOutlineXMark />
 </button>
 </header>
 <div className="ai-history-body">
 <button className="ai-new-chat-drawer-btn" onClick={startNewChat}>
 <HiPlus size={18} /> Start New Chat
 </button>

 {sessions.filter((s) => s.messages?.length > 0).length === 0 ? (
 <div className="ai-history-empty">
 <p>No saved chat history yet.</p>
 <span>Your conversations will be saved here automatically.</span>
 </div>
 ) : (
 <ul className="ai-history-list">
 {sessions.map((session) => {
 const isActive = session.id === activeSessionId;
 const msgCount = session.messages?.length || 0;
 const dateStr = session.updatedAt
 ? new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
 : 'Recent';

 return (
 <li
 key={session.id}
 className={`ai-history-item${isActive ? ' active' : ''}`}
 onClick={() => loadSession(session)}
 >
 <div className="ai-history-item-info">
 <h4 className="ai-history-item-title">{session.title}</h4>
 <div className="ai-history-item-meta">
 <span>{dateStr}</span> • <span>{msgCount} msgs</span>
 {isActive && <span className="ai-history-active-badge">Active</span>}
 </div>
 </div>
 <button
 className="ai-history-delete-btn"
 onClick={(e) => deleteSession(session.id, e)}
 title="Delete chat session"
 aria-label="Delete chat"
 >
 <HiOutlineTrash />
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </div>
 </aside>
 </div>
 )}
 </div>
 );
};

export default CustomerAIChat;
