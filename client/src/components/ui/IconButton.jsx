import React from 'react';

export function IconButton({ active = false, className = '', children, 'aria-label': ariaLabel, style = {}, ...rest }) {
  const cls = ['glass-sm', active ? 'active' : '', className].filter(Boolean).join(' ');
  return (
    <button
      className={cls}
      aria-label={ariaLabel}
      style={{
        width: '40px',
        height: '40px',
        display: 'inline-grid',
        placeItems: 'center',
        padding: 0,
        ...style
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
