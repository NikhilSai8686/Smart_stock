import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import alertService from '../../services/alertService';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const fetchAlertsCount = async () => {
    try {
      const [lowStock, expiry] = await Promise.all([
        alertService.getLowStockAlerts(),
        alertService.getExpiryAlerts(),
      ]);
      const total = (lowStock?.length || 0) + (expiry?.length || 0);
      setAlertCount(total);
    } catch {
      // Ignore background alert fetch errors if API is offline
    }
  };

  useEffect(() => {
    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, 45000); // 45 seconds polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        alertCount={alertCount}
      />
      <div className="main-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          alertCount={alertCount}
        />
        <main className="page-container">
          <Outlet context={{ refreshAlerts: fetchAlertsCount }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
