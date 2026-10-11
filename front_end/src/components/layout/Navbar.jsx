import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, ShoppingCart, Bell, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export const Navbar = ({ onToggleSidebar, alertCount = 0 }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile Menu Toggle & Breadcrumb/Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--navy-700)',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
          }}
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-500)',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy-600)' }}>
            System Online
          </span>
        </div>
      </div>

      {/* Right: Quick POS Action, Alerts, User & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Button
          variant="primary"
          size="sm"
          icon={<ShoppingCart size={16} />}
          onClick={() => navigate('/sales/pos')}
        >
          New Sale (POS)
        </Button>

        <button
          onClick={() => navigate('/alerts')}
          style={{
            background: 'none',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--navy-700)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Stock Alerts"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                backgroundColor: 'var(--danger-500)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {alertCount}
            </span>
          )}
        </button>

        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-light)', margin: '0 4px' }} />

        {/* User Info & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', display: 'none' }} className="user-text-details">
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-900)' }}>
              {user?.fullName || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--navy-500)' }}>
              {user?.email}
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut size={16} />}
          >
            Logout
          </Button>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .user-text-details {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
