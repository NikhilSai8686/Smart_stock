import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Clock,
  RefreshCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import alertService from '../../services/alertService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const Alerts = () => {
  const [activeTab, setActiveTab] = useState('low-stock'); // 'low-stock' or 'expiry'
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();
  const navigate = useNavigate();

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const [lowStock, expiry] = await Promise.all([
        alertService.getLowStockAlerts(),
        alertService.getExpiryAlerts(),
      ]);
      setLowStockAlerts(lowStock || []);
      setExpiryAlerts(expiry || []);
    } catch (err) {
      showError(err.message || 'Failed to load stock alerts.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const getSeverityBadge = (status) => {
    if (status === 'OUT_OF_STOCK') {
      return <Badge variant="danger">Out of Stock (0)</Badge>;
    }
    if (status === 'CRITICAL') {
      return <Badge variant="danger">Critical Level</Badge>;
    }
    return <Badge variant="warning">Low Stock</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock &amp; Expiry Alerts</h1>
          <p className="page-subtitle">Critical inventory depletion warnings and perishable goods expiry timelines</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={loadAlerts}
          >
            Refresh Alerts
          </Button>
          <Button
            variant="primary"
            icon={<Truck size={16} />}
            onClick={() => navigate('/purchases')}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('low-stock')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'low-stock' ? 'var(--primary-700)' : 'var(--navy-500)',
            borderBottom: activeTab === 'low-stock' ? '2px solid var(--primary-600)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={17} color={lowStockAlerts.length > 0 ? 'var(--danger-500)' : 'inherit'} />
          Low Stock Alerts ({lowStockAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('expiry')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'expiry' ? 'var(--primary-700)' : 'var(--navy-500)',
            borderBottom: activeTab === 'expiry' ? '2px solid var(--primary-600)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={17} color={expiryAlerts.length > 0 ? 'var(--warning-500)' : 'inherit'} />
          Product Expiry Alerts ({expiryAlerts.length})
        </button>
      </div>

      {/* TAB 1: LOW STOCK ALERTS */}
      {activeTab === 'low-stock' && (
        <div className="card">
          {loading ? (
            <Loader text="Checking stock levels..." />
          ) : lowStockAlerts.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={48} color="var(--primary-600)" />}
              title="All products adequately stocked"
              description="No products are currently at or below minimum threshold levels."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU Code</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Current Stock</th>
                    <th style={{ textAlign: 'center' }}>Threshold</th>
                    <th>Alert Severity</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                          {item.productName}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--navy-600)' }}>
                        {item.sku}
                      </td>
                      <td>
                        <span
                          style={{
                            backgroundColor: 'var(--navy-100)',
                            color: 'var(--navy-700)',
                            fontSize: '12px',
                            fontWeight: 500,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px', color: item.currentStock === 0 ? 'var(--danger-600)' : 'var(--warning-700)' }}>
                        {item.currentStock} units
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--navy-500)', fontSize: '13px' }}>
                        {item.minimumStockLevel} units
                      </td>
                      <td>{getSeverityBadge(item.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Truck size={14} />}
                          onClick={() => navigate('/purchases')}
                        >
                          Restock Now
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPIRY ALERTS */}
      {activeTab === 'expiry' && (
        <div className="card">
          {loading ? (
            <Loader text="Checking expiry dates..." />
          ) : expiryAlerts.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={48} color="var(--primary-600)" />}
              title="No products expiring soon"
              description="No perishable inventory items are nearing or past their expiration dates."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU Code</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>In Stock</th>
                    <th>Expiration Date</th>
                    <th>Days Remaining</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryAlerts.map((item) => {
                    const isExpired = item.daysRemaining < 0;

                    return (
                      <tr key={item.productId}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                            {item.productName}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--navy-600)' }}>
                          {item.sku}
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: 'var(--navy-100)',
                              color: 'var(--navy-700)',
                              fontSize: '12px',
                              fontWeight: 500,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {item.currentStock}
                        </td>
                        <td style={{ fontWeight: 600, color: isExpired ? 'var(--danger-600)' : 'var(--navy-800)' }}>
                          {item.expiryDate}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: isExpired ? 'var(--danger-600)' : 'var(--warning-700)' }}>
                            {isExpired
                              ? `Expired ${Math.abs(item.daysRemaining)} days ago`
                              : `${item.daysRemaining} days left`}
                          </span>
                        </td>
                        <td>
                          <Badge variant={isExpired ? 'danger' : 'warning'}>
                            {isExpired ? 'EXPIRED' : 'EXPIRING SOON'}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/products')}
                          >
                            Manage Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Alerts;
