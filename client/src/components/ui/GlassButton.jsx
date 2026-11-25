import React from 'react';

export function GlassButton({ active = false, className = '', children, ...rest }) {
  const cls = ['glass-sm', 'btn-glass', active ? 'active' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
