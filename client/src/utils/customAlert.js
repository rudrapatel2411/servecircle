/**
 * ServeCircle Corporate Modal Alert System
 * Professional, clean dialog system replacing default browser alert()
 */

export const installCustomAlert = () => {
  if (typeof window === 'undefined') return;

  // Prevent multiple installations
  if (window.__serveCircleAlertInstalled) return;
  window.__serveCircleAlertInstalled = true;

  // Inject CSS Styles into head
  const styleEl = document.createElement('style');
  styleEl.id = 'servecircle-custom-alert-styles';
  styleEl.innerHTML = `
    .custom-alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
    }

    .custom-alert-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    .custom-alert-modal {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: 12px;
      padding: 28px 24px 24px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
      transform: scale(0.98);
      transition: transform 0.15s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .custom-alert-overlay.active .custom-alert-modal {
      transform: scale(1);
    }

    .custom-alert-icon-box {
      width: 52px;
      height: 52px;
      margin: 0 auto 18px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
    }

    .custom-alert-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .custom-alert-message {
      font-size: 0.9rem;
      color: #475569;
      line-height: 1.55;
      margin-bottom: 24px;
      word-break: break-word;
    }

    .custom-alert-btn {
      background: #1e40af;
      color: #ffffff;
      border: 1px solid #1e40af;
      padding: 10px 28px;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
      transition: background-color 0.12s ease;
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 120px;
    }

    .custom-alert-btn:hover {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    .custom-alert-btn:active {
      background: #1e3a8a;
    }
  `;
  document.head.appendChild(styleEl);

  // SVG Icons
  const SVG_ICONS = {
    success: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    danger: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  // Build Modal Elements in DOM
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
  btn.textContent = 'OK';

  modal.appendChild(iconBox);
  modal.appendChild(titleEl);
  modal.appendChild(messageEl);
  modal.appendChild(btn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close logic
  const closeAlert = () => {
    overlay.classList.remove('active');
  };

  btn.addEventListener('click', closeAlert);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAlert();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeAlert();
    }
  });

  // Override window.alert
  window.alert = (message) => {
    const msgStr = String(message || '');

    let iconHtml = SVG_ICONS.info;
    let title = 'Notification';
    let iconBg = '#eff6ff';
    let iconBorder = '#bfdbfe';

    const lower = msgStr.toLowerCase();

    if (lower.includes('success') || lower.includes('complete') || lower.includes('confirmed') || lower.includes('accepted')) {
      iconHtml = SVG_ICONS.success;
      title = 'Success';
      iconBg = '#ecfdf5';
      iconBorder = '#a7f3d0';
    } else if (lower.includes('sos') || lower.includes('alarm') || lower.includes('emergency') || lower.includes('danger') || lower.includes('error') || lower.includes('failed')) {
      iconHtml = SVG_ICONS.danger;
      title = 'Alert';
      iconBg = '#fef2f2';
      iconBorder = '#fecaca';
    } else if (lower.includes('warning') || lower.includes('attention') || lower.includes('please')) {
      iconHtml = SVG_ICONS.warning;
      title = 'Notice';
      iconBg = '#fffbeb';
      iconBorder = '#fde68a';
    }

    // Strip emoji characters from message text
    let cleanMessage = msgStr.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu, '').trim();

    iconBox.innerHTML = iconHtml;
    iconBox.style.background = iconBg;
    iconBox.style.borderColor = iconBorder;
    titleEl.textContent = title;
    messageEl.textContent = cleanMessage;

    overlay.classList.add('active');
    btn.focus();
  };
};

export default installCustomAlert;
