import React from 'react';

export function Field({ label, error, children, className = '', style = {}, ...rest }) {
  return (
    <div className={`field-wrapper ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }} {...rest}>
      {label ? (
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink2)' }}>
          {label}
        </label>
      ) : null}
      <div className="sunken" style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
        {children}
      </div>
      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--ink)', opacity: 0.8 }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
