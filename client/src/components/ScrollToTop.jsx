import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Universal ScrollToTop component:
 * Resets window scroll AND any internal overflow-scroll containers (.dashboard-content, main, html, body)
 * whenever the route pathname changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Native window scroll
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // 2. Internal dashboard layout scroll containers
    const scrollContainers = document.querySelectorAll('.dashboard-content, .dashboard-main, main');
    scrollContainers.forEach((container) => {
      if (container && typeof container.scrollTop === 'number') {
        container.scrollTop = 0;
      }
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
