import React from 'react';

export function Skeleton({ className = '', style = {}, ...rest }) {
  return <div className={`skeleton ${className}`} style={style} {...rest} />;
}
