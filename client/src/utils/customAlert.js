/**
 * ServeCircle Custom Premium Alert System
 * Overrides standard browser window.alert with a gorgeous, high-end glassmorphic modal
 */

const installCustomAlert = () => {
  if (typeof window === 'undefined') return;

  // Add styles dynamically to document head
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Custom Alert Overlay Styling */
    .custom-alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .custom-alert-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Custom Alert Modal Window */
    .custom-alert-modal {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 
        0 4px 30px rgba(0, 0, 0, 0.03),
        0 30px 60px -15px rgba(15, 23, 42, 0.18),
        0 0 50px rgba(99, 102, 241, 0.08);
      border-radius: 32px;
      width: 92%;
      max-width: 440px;
      padding: 36px 30px;
      text-align: center;
      transform: scale(0.85) translateY(24px);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .custom-alert-overlay.active .custom-alert-modal {
      transform: scale(1) translateY(0);
    }

    /* Floating Animated Icon Box */
    .custom-alert-icon-box {
      width: 76px;
      height: 76px;
      margin: 0 auto 22px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.3rem;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.03);
      box-shadow: 
        0 10px 25px -5px rgba(0, 0, 0, 0.05),
        0 8px 10px -6px rgba(0, 0, 0, 0.05);
      animation: floatIcon 3.5s ease-in-out infinite;
      position: relative;
    }

    /* Dynamic Glow Ring behind icon */
    .custom-alert-icon-box::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 28px;
      background: inherit;
      filter: blur(12px);
      opacity: 0.15;
      z-index: -1;
    }

    @keyframes floatIcon {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(2deg); }
    }

    /* Modal Text Content */
    .custom-alert-title {
      font-size: 1.45rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 12px;
      letter-spacing: -0.03em;
    }

    .custom-alert-message {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 28px;
      font-weight: 500;
    }

    /* Premium Glow Button */
    .custom-alert-btn {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      padding: 12px 38px;
      border-radius: 9999px;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .custom-alert-btn:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 14px 30px rgba(79, 70, 229, 0.5);
    }

    .custom-alert-btn:active {
      transform: translateY(-1px) scale(0.98);
    }
  `;
  document.head.appendChild(styleEl);

  // Create alert DOM elements
  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';

  const modal = document.createElement('div');
  modal.className = 'custom-alert-modal';

  const iconBox = document.createElement('div');
  iconBox.className = 'custom-alert-icon-box';

  const titleEl = document.createElement('h3');
  titleEl.className = 'custom-alert-title';

  const messageEl = document.createElement('p');
  messageEl.className = 'custom-alert-message';

  const btn = document.createElement('button');
  btn.className = 'custom-alert-btn';
  btn.textContent = 'Acknowledge';

  // Assemble Modal
  modal.appendChild(iconBox);
  modal.appendChild(titleEl);
  modal.appendChild(messageEl);
  modal.appendChild(btn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close functionality
  const closeAlert = () => {
    overlay.classList.remove('active');
  };

  btn.addEventListener('click', closeAlert);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeAlert();
    }
  });

  // Keep a reference to original alert (just in case)
  const originalAlert = window.alert;

  // Override window.alert
  window.alert = (message) => {
    // String conversion
    const msgStr = String(message || '');

    // Defaults
    let emoji = 'ℹ️';
    let title = 'System Notification';
    let themeColor = 'rgba(99, 102, 241, 0.15)'; // Default Indigo

    // Extract potential leading emoji or parse keywords
    if (msgStr.includes('🎉') || msgStr.toLowerCase().includes('success') || msgStr.toLowerCase().includes('complete')) {
      emoji = '🎉';
      title = 'Action Completed!';
      themeColor = 'rgba(16, 185, 129, 0.2)'; // Green
    } else if (msgStr.includes('🚨') || msgStr.toLowerCase().includes('sos') || msgStr.toLowerCase().includes('alarm')) {
      emoji = '🚨';
      title = 'Safety Alert Dispatch';
      themeColor = 'rgba(239, 68, 68, 0.2)'; // Red
    } else if (msgStr.includes('⚠️') || msgStr.toLowerCase().includes('warning') || msgStr.toLowerCase().includes('please')) {
      emoji = '⚠️';
      title = 'Attention Required';
      themeColor = 'rgba(245, 158, 11, 0.2)'; // Orange
    } else if (msgStr.includes('📞') || msgStr.toLowerCase().includes('dialing') || msgStr.toLowerCase().includes('call')) {
      emoji = '📞';
      title = 'Voice Call Masking';
      themeColor = 'rgba(59, 130, 246, 0.2)'; // Blue
    } else if (msgStr.includes('💬') || msgStr.toLowerCase().includes('chat') || msgStr.toLowerCase().includes('message')) {
      emoji = '💬';
      title = 'Secure Message Box';
      themeColor = 'rgba(139, 92, 246, 0.2)'; // Purple
    } else if (msgStr.includes('📄') || msgStr.toLowerCase().includes('download') || msgStr.toLowerCase().includes('invoice')) {
      emoji = '📄';
      title = 'Document Generator';
      themeColor = 'rgba(6, 182, 212, 0.2)'; // Cyan
    }

    // Strip leading emoji from message text if redundant
    let cleanMessage = msgStr;
    const emojiRegex = /^[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g;
    if (emojiRegex.test(cleanMessage.substring(0, 3))) {
      cleanMessage = cleanMessage.replace(emojiRegex, '').trim();
    }

    // Set content and styles
    iconBox.textContent = emoji;
    iconBox.style.background = themeColor;
    titleEl.textContent = title;
    messageEl.textContent = cleanMessage;

    // Apply specific gradient to button based on type
    if (themeColor.includes('16, 185, 129')) {
      btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      btn.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.35)';
    } else if (themeColor.includes('239, 68, 68')) {
      btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      btn.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.35)';
    } else if (themeColor.includes('245, 158, 11')) {
      btn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      btn.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.35)';
    } else {
      btn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      btn.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.35)';
    }

    // Open overlay
    overlay.classList.add('active');
    
    // Auto-focus ok button
    setTimeout(() => {
      btn.focus();
    }, 50);
  };
};

export default installCustomAlert;
