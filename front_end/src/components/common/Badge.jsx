import React from 'react';

export const Badge = ({ children, variant = 'neutral', icon = null, className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {icon}
      {children}
    </span>
  );
};

export default Badge;
