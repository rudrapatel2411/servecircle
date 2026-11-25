import React from 'react';
import { statusToClass } from './statusMap.js';

export function StatusPill({ status, label, className = '', children, ...rest }) {
  const toneClass = statusToClass(status || label || children);
  const cls = ['pill', toneClass, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {label || children || status}
    </span>
  );
}
