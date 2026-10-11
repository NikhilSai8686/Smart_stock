import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon = <PackageOpen size={48} color="var(--navy-400)" />,
  title = 'No records found',
  description = 'Try adjusting your search criteria or add new items.',
  action = null,
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <div style={{ marginBottom: '4px' }}>{icon}</div>
      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy-800)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '14px', color: 'var(--navy-500)', maxWidth: '380px' }}>
        {description}
      </p>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
