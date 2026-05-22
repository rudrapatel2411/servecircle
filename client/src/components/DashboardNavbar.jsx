import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineBell, HiOutlineMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import LanguageToggle from './LanguageToggle';
import { socket } from '../socket';
import './DashboardNavbar.css';

const DashboardNavbar = ({ panel }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [latestToast, setLatestToast] = useState(null);

  useEffect(() => {
    if (panel === 'admin') {
      socket.connect();
      socket.emit('join_admin');

      socket.on('admin_notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
        setLatestToast(data);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      });

      return () => {
        socket.off('admin_notification');
        socket.disconnect();
      };
    }
  }, [panel]);

  return (
    <header className="dash-navbar">
      <div className="dash-navbar-search">
        <HiOutlineMagnifyingGlass />
        <input type="text" placeholder={t('common.search')} className="dash-search-input" />
      </div>
      <div className="dash-navbar-actions">
        <LanguageToggle />
        <button className="dash-icon-btn" aria-label={t('common.notifications')}>
          <HiOutlineBell />
          {notifications.length > 0 && <span className="notif-dot" style={{ background: 'var(--danger)' }} />}
        </button>
        <div className="dash-avatar">
          <span>{panel === 'admin' ? 'A' : 'U'}</span>
        </div>
      </div>

      {showToast && latestToast && (
        <div className="toast-notification animate-slide-in-left" style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'white', borderLeft: '4px solid var(--primary-500)', boxShadow: 'var(--shadow-lg)', padding: '16px 24px', borderRadius: 'var(--radius-md)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--navy-800)' }}>{latestToast.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>{latestToast.message}</p>
          </div>
          <button onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '1.2rem' }}>
            <HiXMark />
          </button>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;
