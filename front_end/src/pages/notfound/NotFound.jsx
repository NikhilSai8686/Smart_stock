import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--navy-100)',
          color: 'var(--navy-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <HelpCircle size={36} />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: 'var(--navy-500)', fontSize: '15px', maxWidth: '440px', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved to another URL.
      </p>

      <Button
        variant="primary"
        icon={<Home size={16} />}
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
