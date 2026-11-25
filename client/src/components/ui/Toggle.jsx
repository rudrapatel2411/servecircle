import React from 'react';

export function Toggle({ checked = false, onChange, className = '', ...rest }) {
  const cls = ['toggle', 'sunken', checked ? 'on' : '', className].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      className={cls}
      {...rest}
    >
      <div className="knob" />
    </button>
  );
}
