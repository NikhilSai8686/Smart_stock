import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon,
  accent = 'primary', // 'primary', 'warning', 'danger', 'info', 'navy'
}) => {
  const accentStyles = {
    primary: {
      bg: 'var(--primary-50)',
      color: 'var(--primary-600)',
    },
    warning: {
      bg: 'var(--warning-50)',
      color: 'var(--warning-600)',
    },
    danger: {
      bg: 'var(--danger-50)',
      color: 'var(--danger-500)',
    },
    info: {
      bg: 'var(--info-50)',
      color: 'var(--info-600)',
    },
    navy: {
      bg: 'var(--navy-100)',
      color: 'var(--navy-700)',
    },
  };

  const style = accentStyles[accent] || accentStyles.primary;

  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--navy-900)', marginTop: '6px', letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: '13px', color: 'var(--navy-500)', marginTop: '4px' }}>
              {subtext}
            </div>
          )}
        </div>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: style.bg,
            color: style.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
