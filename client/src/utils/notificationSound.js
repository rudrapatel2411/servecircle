/**
 * notificationSound.js
 *
 * Lightweight Web Audio API sound synthesizer for ServeCircle notifications.
 * Works completely offline with zero external audio asset dependencies.
 * Automatically unlocks AudioContext on the first user interaction.
 */

let audioCtx = null;
let unlocked = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    if (unlocked) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    unlocked = true;
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}

function playToneSequence(notes = []) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  notes.forEach(({ freq, start = 0, duration = 0.14, gain = 0.14, type = 'sine' }) => {
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    } catch {
      // Ignore audio scheduling errors in restricted environments
    }
  });
}

/**
 * Play a distinct chime based on notification type.
 */
export function playNotificationSound(type = 'default') {
  const t = String(type || 'default').toLowerCase();

  if (t === 'duty_online') {
    playToneSequence([
      { freq: 523.25, start: 0, duration: 0.12, gain: 0.15, type: 'triangle' },
      { freq: 783.99, start: 0.1, duration: 0.18, gain: 0.16, type: 'triangle' },
    ]);
    return;
  }

  if (t === 'duty_offline') {
    playToneSequence([
      { freq: 523.25, start: 0, duration: 0.12, gain: 0.14, type: 'sine' },
      { freq: 349.23, start: 0.1, duration: 0.2, gain: 0.14, type: 'sine' },
    ]);
    return;
  }

  if (t === 'duty_paused') {
    playToneSequence([
      { freq: 440, start: 0, duration: 0.1, gain: 0.12, type: 'sine' },
      { freq: 440, start: 0.14, duration: 0.12, gain: 0.1, type: 'sine' },
    ]);
    return;
  }

  if (t === 'booking_request' || t === 'call_request') {
    playToneSequence([
      { freq: 659.25, start: 0, duration: 0.11, gain: 0.18, type: 'triangle' },
      { freq: 880, start: 0.1, duration: 0.11, gain: 0.18, type: 'triangle' },
      { freq: 1046.5, start: 0.2, duration: 0.22, gain: 0.2, type: 'triangle' },
    ]);
    return;
  }

  if (t === 'booking_completed' || t === 'booking_accepted' || t === 'otp_verified') {
    playToneSequence([
      { freq: 523.25, start: 0, duration: 0.1, gain: 0.14, type: 'triangle' },
      { freq: 659.25, start: 0.08, duration: 0.1, gain: 0.14, type: 'triangle' },
      { freq: 783.99, start: 0.16, duration: 0.22, gain: 0.16, type: 'triangle' },
    ]);
    return;
  }

  if (t === 'alert' || t === 'quote_decided') {
    playToneSequence([
      { freq: 587.33, start: 0, duration: 0.12, gain: 0.16, type: 'triangle' },
      { freq: 493.88, start: 0.12, duration: 0.18, gain: 0.15, type: 'triangle' },
    ]);
    return;
  }

  // Default stage / booking update chime
  playToneSequence([
    { freq: 587.33, start: 0, duration: 0.11, gain: 0.14, type: 'sine' },
    { freq: 880, start: 0.09, duration: 0.18, gain: 0.15, type: 'sine' },
  ]);
}

let speechTimer = null;

function cleanSpeechText(text = '') {
  return String(text)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✓✔⚡🔔📞📅✅🤝🚗📍🔐📸🔧📋💬🎉🟢⚫⏸️✨📢⚙️⚠️💰]/gu, '')
    .replace(/\(#[^)]+\)/g, '')
    .replace(/#\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speak a notification using the browser's Web Speech API (speechSynthesis).
 */
export function speakNotification({ title = '', message = '', type = 'default' } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const t = String(type || 'default').toLowerCase();
  let spokenText = '';

  if (t === 'duty_online') {
    spokenText = 'You are online';
  } else if (t === 'duty_offline') {
    spokenText = 'You are offline';
  } else if (t === 'duty_paused') {
    spokenText = 'Pause';
  } else {
    const cleanTitle = cleanSpeechText(title);
    const cleanMsg = cleanSpeechText(message);
    spokenText = cleanTitle || cleanMsg;
    if (cleanTitle && cleanMsg && cleanMsg.length <= 90 && !cleanMsg.toLowerCase().includes(cleanTitle.toLowerCase())) {
      spokenText = `${cleanTitle}. ${cleanMsg}`;
    }
  }

  if (!spokenText) return;

  if (speechTimer) {
    clearTimeout(speechTimer);
  }

  // Slight delay so the chime plays cleanly before the voice begins
  speechTimer = setTimeout(() => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(spokenText);
      const voices = synth.getVoices ? synth.getVoices() : [];
      const preferredVoice =
        voices.find((v) => /en[-_](IN|US|GB)/i.test(v.lang)) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.lang = preferredVoice?.lang || 'en-IN';
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      synth.speak(utterance);
    } catch {
      // Ignore speech synthesis errors if blocked before user gesture
    }
  }, 150);
}

/**
 * Play both notification chime and spoken voice alert.
 */
export function playNotificationAlert(notif = {}) {
  playNotificationSound(notif.type);
  speakNotification(notif);
}
