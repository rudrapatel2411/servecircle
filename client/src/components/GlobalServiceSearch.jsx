import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import { generalServicesData } from '../data/generalServicesData';
import './GlobalServiceSearch.css';

const GlobalServiceSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState([]);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Flatten all services for global search
  const allServices = generalServicesData.flatMap((cat) =>
    cat.services.map((service) => ({
      serviceName: service,
      categoryLabel: cat.label,
      categoryPath: cat.path,
      icon: cat.icon,
      color: cat.color,
      bg: cat.bg,
    }))
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allServices.filter((s) =>
      s.serviceName.toLowerCase().includes(q) ||
      s.categoryLabel.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query]);

  // Handle outside click to close dropdown and unblur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    navigate(path);
    setIsFocused(false);
    setQuery('');
  };

  return (
    <>
      {/* Blurred Backdrop */}
      <div className={`global-search-backdrop ${isFocused ? 'active' : ''}`} />

      <div className="global-search-wrapper" ref={wrapperRef}>
        <div className={`global-search-container ${isFocused ? 'focused' : ''}`}>
          <HiOutlineMagnifyingGlass className="global-search-icon" />
          <input
            type="text"
            className="global-search-input"
            placeholder="Search all services (e.g., Plumber, Pet Grooming, Chef)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {query && (
            <button className="global-search-clear" onClick={() => setQuery('')}>
              <HiOutlineXMark />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isFocused && query && (
          <div className="global-search-dropdown animate-fade-in-up">
            {results.length > 0 ? (
              <ul className="global-search-list">
                {results.map((res, idx) => (
                  <li
                    key={idx}
                    className="global-search-item"
                    onClick={() => handleSelect(res.categoryPath)}
                  >
                    <div className="global-search-item-icon" style={{ color: res.color, background: res.bg }}>
                      {res.icon}
                    </div>
                    <div className="global-search-item-text">
                      <span className="global-search-item-name">{res.serviceName}</span>
                      <span className="global-search-item-cat">in {res.categoryLabel}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="global-search-empty">
                <p>No services found for "{query}"</p>
                <span>Try searching for general terms like "Cleaning" or "Repair"</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalServiceSearch;
