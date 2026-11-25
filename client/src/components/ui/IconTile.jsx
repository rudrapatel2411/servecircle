import React from 'react';

export function IconTile({ icon: Icon, tone = 'info', className = '', style = {}, ...rest }) {
  const cls = ['tile', `s-${tone}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style} {...rest}>
      {Icon ? <Icon style={{ width: '20px', height: '20px' }} /> : null}
    </div>
  );
}
