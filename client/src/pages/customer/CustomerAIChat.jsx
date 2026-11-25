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

/**
 * AITrackingAvatar — Hyper-Realistic 3D Cybernetic AI Companion Avatar
 * Features:
 * - 3D spherical cranial geometry with brushed titanium & sapphire lacquer shading
 * - Convex optical glass visor dome with dual specular light glares
 * - Biometric camera-iris ocular optics with radial cyan/sapphire glow & dual corneal reflections
 * - Real-time cursor gaze tracking with natural physics, micro-saccades, and smooth blinking
 * - Idle floating hover physics and responsive 3D head perspective tilt
 */
function AITrackingAvatar({ size = 44, isThinking = false, interactive = true }) {
  const avatarRef = useRef(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [saccade, setSaccade] = useState({ x: 0, y: 0 });

  // Cursor Tracking with smooth physics
  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (!avatarRef.current) return;
        const rect = avatarRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const angle = Math.atan2(deltaY, deltaX);

        // Pupil max range (scaled relative to size)
        const maxMove = Math.max(3.6, size * 0.09);
        const intensity = Math.min(distance / 22, maxMove);
        const x = Math.cos(angle) * intensity;
        const y = Math.sin(angle) * intensity;

        // Realistic 3D perspective tilt (degrees)
        const maxTilt = 11;
        const tiltX = Math.max(-maxTilt, Math.min(maxTilt, -(deltaY / (window.innerHeight || 800)) * maxTilt * 2));
        const tiltY = Math.max(-maxTilt, Math.min(maxTilt, (deltaX / (window.innerWidth || 1200)) * maxTilt * 2));

        setPupilPos({ x, y });
        setHeadTilt({ rotateX: tiltX, rotateY: tiltY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  // Subtle lifelike micro-saccades (natural eye movement)
  useEffect(() => {
    const saccadeInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        const sx = (Math.random() - 0.5) * 0.8;
        const sy = (Math.random() - 0.5) * 0.8;
        setSaccade({ x: sx, y: sy });
      } else {
        setSaccade({ x: 0, y: 0 });
      }
    }, 1800);
    return () => clearInterval(saccadeInterval);
  }, []);

  // Natural periodic double/single blinks
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        // Occasional double-blink
        if (Math.random() > 0.65) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
          }, 140);
        }
      }, 160);
    }, 4200);
    return () => clearInterval(blinkTimer);
  }, []);

  const handleClick = () => {
    if (!interactive) return;
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 650);
  };

  const currentEyeX = pupilPos.x + saccade.x;
  const currentEyeY = pupilPos.y + saccade.y;

  return (
    <div
      ref={avatarRef}
      className={`ai-tracking-avatar-wrap ${isThinking ? 'ai-tracking-avatar--thinking' : ''}`}
      onClick={handleClick}
      title="ServeCircle AI — Realistic 3D Cursor-Tracking Companion"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      <div
        className="ai-tracking-avatar-head"
        style={{
          transform: `perspective(360px) rotateX(${headTilt.rotateX}deg) rotateY(${headTilt.rotateY}deg)`,
          transition: 'transform 0.08s cubic-bezier(0.2, 0.8, 0.4, 1)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="ai-avatar-svg ai-avatar-svg--realistic"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* 3D Cranial Sphere Radial Gradient with Key Light & Ambient Occlusion */}
            <radialGradient id={`cranialSphere-${size}`} cx="38%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="12%" stopColor="var(--status-info-tint)" />
              <stop offset="38%" stopColor="var(--blue)" />
              <stop offset="70%" stopColor="var(--blue)" />
              <stop offset="88%" stopColor="var(--blue-deep)" />
              <stop offset="100%" stopColor="var(--ink)" />
            </radialGradient>

            {/* Bottom Environmental Bounce Rim Gradient */}
            <linearGradient id={`bottomBounce-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="75%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.45)" />
            </linearGradient>

            {/* Obsidian Glass Visor Chamber */}
            <radialGradient id={`visorChamber-${size}`} cx="50%" cy="38%" r="60%">
              <stop offset="0%" stopColor="var(--ink)" />
              <stop offset="55%" stopColor="var(--ink)" />
              <stop offset="100%" stopColor="var(--ink)" />
            </radialGradient>

            {/* Upper Glass Specular Curved Glare */}
            <linearGradient id={`glassGlareTop-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.65)" />
              <stop offset="45%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>

            {/* Biometric Luminous Iris Radial Gradient */}
            <radialGradient id={`luminousIris-${size}`} cx="44%" cy="38%" r="58%">
              <stop offset="0%" stopColor="var(--accent-teal-tint)" />
              <stop offset="25%" stopColor="var(--blue-hi)" />
              <stop offset="55%" stopColor="var(--blue)" />
              <stop offset="82%" stopColor="var(--blue-deep)" />
              <stop offset="100%" stopColor="var(--ink)" />
            </radialGradient>

            {/* Metallic Ear Bevel Gradient */}
            <linearGradient id={`earBevel-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ink-3)" />
              <stop offset="40%" stopColor="var(--glass-edge)" />
              <stop offset="70%" stopColor="var(--ink)" />
              <stop offset="100%" stopColor="var(--ink)" />
            </linearGradient>

            {/* Mouth / HUD Glow Gradient */}
            <linearGradient id={`hudGlow-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--blue-hi)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--blue-hi)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--blue-hi)" stopOpacity="0.4" />
            </linearGradient>

            {/* Neon Bloom Filter for Ocular Optics */}
            <filter id={`bloomFilter-${size}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dynamic Thinking Aura Halo */}
          {isThinking && (
            <g className="ai-realistic-thinking-halo">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="url(#hudGlow-${size})"
                strokeWidth="1.8"
                strokeDasharray="8 6"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(56, 189, 248, 0.3)"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
            </g>
          )}

          {/* 3D Drop Shadow underneath the floating head */}
          <ellipse
            cx="50"
            cy="93"
            rx="32"
            ry="4.5"
            fill="rgba(15, 23, 42, 0.28)"
            className="ai-avatar-drop-shadow"
          />

          {/* Side Cybernetic Ear-Pods with Metallic Bevels & Glowing Aperture */}
          <g>
            {/* Left Ear */}
            <ellipse cx="9" cy="50" rx="4.5" ry="12" fill={`url(#earBevel-${size})`} stroke="var(--ink)" strokeWidth="1" />
            <ellipse cx="8" cy="50" rx="2" ry="7" fill="var(--ink)" />
            <circle cx="8" cy="50" r="1.6" fill={isThinking ? 'var(--blue-hi)' : 'var(--blue-hi)'} filter={`url(#bloomFilter-${size})`} />

            {/* Right Ear */}
            <ellipse cx="91" cy="50" rx="4.5" ry="12" fill={`url(#earBevel-${size})`} stroke="var(--ink)" strokeWidth="1" />
            <ellipse cx="92" cy="50" rx="2" ry="7" fill="var(--ink)" />
            <circle cx="92" cy="50" r="1.6" fill={isThinking ? 'var(--blue-hi)' : 'var(--blue-hi)'} filter={`url(#bloomFilter-${size})`} />
          </g>

          {/* Main 3D Spherical Cranial Shell */}
          <path
            d="M 50 8 C 76 8, 91 22, 91 50 C 91 76, 75 92, 50 92 C 25 92, 9 76, 9 50 C 9 22, 24 8, 50 8 Z"
            fill={`url(#cranialSphere-${size})`}
            stroke="var(--blue-hi)"
            strokeWidth="1.2"
          />

          {/* Bottom Environmental Bounce Light Reflection */}
          <path
            d="M 50 8 C 76 8, 91 22, 91 50 C 91 76, 75 92, 50 92 C 25 92, 9 76, 9 50 C 9 22, 24 8, 50 8 Z"
            fill={`url(#bottomBounce-${size})`}
            pointerEvents="none"
          />

          {/* Cranial Top Light Accent Line */}
          <path
            d="M 32 12 Q 50 9 68 12"
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="drop-shadow(0 1px 2px rgba(255, 255, 255, 0.6))"
          />

          {/* Forehead Cyan AI Neural Status Beacon */}
          <circle
            cx="50"
            cy="18"
            r="2.2"
            fill={isThinking ? 'var(--blue-hi)' : 'var(--blue-hi)'}
            filter={`url(#bloomFilter-${size})`}
            className={isThinking ? 'ai-antenna-pulse' : ''}
          />

          {/* Convex Optical Glass Visor Frame & Obsidian Chamber */}
          <g>
            {/* Outer Visor Bezel / Rim with dark depth */}
            <path
              d="M 18 33 C 28 20, 72 20, 82 33 C 89 44, 88 64, 80 74 C 70 84, 30 84, 20 74 C 12 64, 11 44, 18 33 Z"
              fill="var(--ink)"
              stroke="var(--ink)"
              strokeWidth="1.6"
            />

            {/* Obsidian Glass Chamber Interior */}
            <path
              d="M 20 34 C 29 22, 71 22, 80 34 C 86 44, 85 63, 78 72 C 69 82, 31 82, 22 72 C 15 63, 14 44, 20 34 Z"
              fill={`url(#visorChamber-${size})`}
            />

            {/* Subtle Ocular Alignment Grid / HUD reticle line in background */}
            <line x1="22" y1="51" x2="78" y2="51" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx="50" cy="51" r="2.5" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.8" />
          </g>

          {/* ─── Left Eye Ocular Sensor ─── */}
          <g transform="translate(36, 50)">
            {/* Recessed Eye Socket Shadow */}
            <circle cx="0" cy="0" r="10.5" fill="var(--ink)" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="1" />
            <circle cx="0" cy="0" r="9.2" fill="var(--ink)" />

            {/* Outer Aperture Tick Ring */}
            <circle cx="0" cy="0" r="8.2" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="0.8" strokeDasharray="2 2" />

            {isBlinking || isWinking ? (
              /* Realistic Curved Biometric Shutter Closed */
              <path
                d="M -9 0 Q 0 4 9 0"
                stroke="var(--blue-hi)"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                filter={`url(#bloomFilter-${size})`}
              />
            ) : (
              <>
                {/* Luminous Camera-Iris Optics Tracking Cursor */}
                <g transform={`translate(${currentEyeX}, ${currentEyeY})`}>
                  {/* Glowing Sapphire Iris Sphere */}
                  <circle
                    cx="0"
                    cy="0"
                    r="6.8"
                    fill={`url(#luminousIris-${size})`}
                    filter={`url(#bloomFilter-${size})`}
                  />
                  {/* Concentric Internal Iris Ring */}
                  <circle cx="0" cy="0" r="4.6" fill="none" stroke="rgba(240, 253, 250, 0.45)" strokeWidth="0.6" />
                  {/* True Obsidian Pupil Core */}
                  <circle cx="0" cy="0" r="3.2" fill="var(--ink)" />
                  {/* Central Aperture Laser Dot */}
                  <circle cx="0" cy="0" r="1.1" fill="var(--blue-hi)" />
                </g>

                {/* Primary Corneal Key-Light Specular Glint (Fixed at 10 o'clock for authentic 3D sphere look) */}
                <circle
                  cx={currentEyeX * 0.7 - 2.5}
                  cy={currentEyeY * 0.7 - 2.5}
                  r="2"
                  fill="#FFFFFF"
                />
                {/* Secondary Corneal Soft Fill Reflection at 4 o'clock */}
                <circle
                  cx={currentEyeX * 0.7 + 2.2}
                  cy={currentEyeY * 0.7 + 2.2}
                  r="1"
                  fill="rgba(255, 255, 255, 0.65)"
                />
              </>
            )}
          </g>

          {/* ─── Right Eye Ocular Sensor ─── */}
          <g transform="translate(64, 50)">
            {/* Recessed Eye Socket Shadow */}
            <circle cx="0" cy="0" r="10.5" fill="var(--ink)" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="1" />
            <circle cx="0" cy="0" r="9.2" fill="var(--ink)" />

            {/* Outer Aperture Tick Ring */}
            <circle cx="0" cy="0" r="8.2" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="0.8" strokeDasharray="2 2" />

            {isBlinking ? (
              /* Realistic Curved Biometric Shutter Closed */
              <path
                d="M -9 0 Q 0 4 9 0"
                stroke="var(--blue-hi)"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                filter={`url(#bloomFilter-${size})`}
              />
            ) : (
              <>
                {/* Luminous Camera-Iris Optics Tracking Cursor */}
                <g transform={`translate(${currentEyeX}, ${currentEyeY})`}>
                  {/* Glowing Sapphire Iris Sphere */}
                  <circle
                    cx="0"
                    cy="0"
                    r="6.8"
                    fill={`url(#luminousIris-${size})`}
                    filter={`url(#bloomFilter-${size})`}
                  />
                  {/* Concentric Internal Iris Ring */}
                  <circle cx="0" cy="0" r="4.6" fill="none" stroke="rgba(240, 253, 250, 0.45)" strokeWidth="0.6" />
                  {/* True Obsidian Pupil Core */}
                  <circle cx="0" cy="0" r="3.2" fill="var(--ink)" />
                  {/* Central Aperture Laser Dot */}
                  <circle cx="0" cy="0" r="1.1" fill="var(--blue-hi)" />
                </g>

                {/* Primary Corneal Key-Light Specular Glint */}
                <circle
                  cx={currentEyeX * 0.7 - 2.5}
                  cy={currentEyeY * 0.7 - 2.5}
                  r="2"
                  fill="#FFFFFF"
                />
                {/* Secondary Corneal Soft Fill Reflection */}
                <circle
                  cx={currentEyeX * 0.7 + 2.2}
                  cy={currentEyeY * 0.7 + 2.2}
                  r="1"
                  fill="rgba(255, 255, 255, 0.65)"
                />
              </>
            )}
          </g>

          {/* ─── Convex Glass Specular Reflections (Overlays on Top of Eyes!) ─── */}
          {/* Upper Curved Glass Dome Crescent Reflection */}
          <path
            d="M 23 34 C 33 24, 67 24, 77 34 C 70 41, 30 41, 23 34 Z"
            fill={`url(#glassGlareTop-${size})`}
            pointerEvents="none"
          />

          {/* Lower Glass Edge Secondary Specular Rim */}
          <path
            d="M 32 75 C 48 78, 68 76, 75 70 C 69 73, 49 75, 32 75 Z"
            fill="rgba(96, 165, 250, 0.35)"
            pointerEvents="none"
          />

          {/* ─── Mouth / Visor Biometric HUD Line ─── */}
          <path
            d={
              isThinking
                ? 'M 42 74 Q 50 70 58 74'
                : isWinking
                ? 'M 40 73 Q 50 82 60 73'
                : 'M 41 73 Q 50 79 59 73'
            }
            stroke={`url(#hudGlow-${size})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            filter={`url(#bloomFilter-${size})`}
          />

          {/* Thinking Laser Scan Line sweeping across visor */}
          {isThinking && (
            <line
              x1="24"
              y1="51"
              x2="76"
              y2="51"
              stroke="var(--blue-hi)"
              strokeWidth="1.5"
              strokeDasharray="12 20"
              className="ai-realistic-laser-scan"
              filter={`url(#bloomFilter-${size})`}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

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
 else if (category.includes('health') || skill.includes('nurse') || skill.includes('doctor')) icon = '';
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
 else if (skill.includes('carpent') || name.includes('carpent') || name.includes('lock')) icon = '';
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
 { label: ' Doctor / Physio', prompt: 'Need doctor consultation and physiotherapy at home' },
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

 // Lock parent layout scrolling so the AI chat window is firmly locked in the center of the screen
 useEffect(() => {
 const parentContent = document.querySelector('.dashboard-content');
 if (parentContent) {
 parentContent.style.overflow = 'hidden';
 parentContent.style.paddingBottom = '16px';
 }
 return () => {
 if (parentContent) {
 parentContent.style.overflow = '';
 parentContent.style.paddingBottom = '';
 }
 };
 }, []);

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
 <AITrackingAvatar size={42} isThinking={isSending} />
 <div className="ai-title-text">
 <div className="ai-title-row">
 <h1>ServeCircle AI</h1>
 <span className="ai-status-badge">
 <span className="ai-status-pulse" />
 {isSending ? 'Thinking' : 'Online'}
 </span>
 </div>
 <p>Cursor-tracking smart service diagnostics</p>
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

 {message.id === 'welcome' && (
 <div className="ai-welcome-hero-card">
 <div className="ai-welcome-hero-avatar">
 <AITrackingAvatar size={56} isThinking={isSending} />
 </div>
 <div className="ai-welcome-hero-text">
 <h3>ServeCircle AI Assistant</h3>
 <p>Move your cursor around to watch my eyes track you! Tell me what you need, upload a photo, or choose a quick prompt.</p>
 </div>
 </div>
 )}

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
 <div className="ai-thinking-stage-wrapper">
 {/* Visual Thinking Scene placed above thinking message */}
 <div className="ai-thinking-scene">
 <div className="ai-thinking-ripple-stage">
 <span className="ai-thinking-ripple ring-1" />
 <span className="ai-thinking-ripple ring-2" />
 <span className="ai-thinking-ripple ring-3" />
 <div className="ai-thinking-avatar-core">
 <AITrackingAvatar size={34} isThinking={true} interactive={false} />
 </div>
 </div>
 {/* Ascending thought bubbles bridge */}
 <div className="ai-thought-bubbles-bridge">
 <span className="ai-thought-dot dot-sm" />
 <span className="ai-thought-dot dot-md" />
 <span className="ai-thought-dot dot-lg" />
 </div>
 </div>

 {/* Thought bubble message */}
 <article className="ai-message ai-message--assistant ai-message--thinking">
 <div className="ai-thinking-content">
 <span className="ai-thinking-indicator-dot" />
 <p className="ai-thinking-label">
 {image ? 'Analyzing your photo & issue diagnostics...' : 'Thinking & mapping best verified experts...'}
 </p>
 </div>
 <div className="ai-thinking-wave">
 <span /><span /><span /><span /><span />
 </div>
 </article>
 </div>
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
