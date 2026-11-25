import React from 'react';

export function PrimaryButton({ danger = false, className = '', children, ...rest }) {
  const cls = ['btn-primary', danger ? 'btn-danger' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
