import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import reportService from '../../services/reportService';
import { useToast } from '../../hooks/useToast';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const Reports = () => {
  const [profitReport, setProfitReport] = useState(null);
  const [bestSelling, setBestSelling] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', 'all'
  const [interval, setInterval] = useState('DAILY'); // 'DAILY', 'MONTHLY'
  const [loading, setLoading] = useState(true);

  const { showError, showSuccess } = useToast();

  const getDateRange = useCallback(() => {
    const now = new Date();
    let start = null;

    if (timeRange === '7d') {
      start = new Date();
      start.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      start = new Date();
      start.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      start = new Date();
      start.setDate(now.getDate() - 90);
    }

    return {
      startDate: start ? start.toISOString() : undefined,
      endDate: now.toISOString(),
    };
  }, [timeRange]);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      const [profit, best, slow] = await Promise.all([
        reportService.getProfitReport({ startDate, endDate }),
        reportService.getBestSelling(10),
        reportService.getSlowMoving(10),
      ]);

      setProfitReport(profit);
      setBestSelling(best || []);
      setSlowMoving(slow || []);
    } catch (err) {
      showError(err.message || 'Failed to generate analytical reports.');
    } finally {
      setLoading(false);
    }
  }, [getDateRange, showError]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Client-side CSV export
  const exportToCSV = () => {
    if (!profitReport?.breakdown || profitReport.breakdown.length === 0) {
      showError('No sales data available to export.');
      return;
    }

    const headers = ['Date / Period', 'Sales Count', 'Revenue ($)', 'Gross Profit ($)'];
    const rows = profitReport.breakdown.map((row) => [
      `"${row.label}"`,
      row.salesCount,
      row.revenue,
      row.profit,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartStock_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Sales report exported to CSV successfully.');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; Profit Analytics</h1>
          <p className="page-subtitle">Examine gross profitability, revenue streams, and inventory turnaround velocity</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={loadReports}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Download size={16} />}
            onClick={exportToCSV}
            disabled={!profitReport || loading}
          >
            Export Report (CSV)
          </Button>
        </div>
      </div>

      {/* Filter Period Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={17} color="var(--navy-500)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-700)' }}>
              Analysis Range:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: '90d', label: 'Last 90 Days' },
                { id: 'all', label: 'All Time' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTimeRange(btn.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: timeRange === btn.id ? 'var(--navy-900)' : '#ffffff',
                    color: timeRange === btn.id ? '#ffffff' : 'var(--navy-700)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Stat Cards */}
      <div className="grid grid-cols-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <StatCard
          title="Total Revenue"
          value={`$${Number(profitReport?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Gross sales generated"
          icon={<DollarSign size={22} />}
          accent="navy"
        />
        <StatCard
          title="Cost of Goods Sold"
          value={`$${Number(profitReport?.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Purchase cost of items sold"
          icon={<Package size={22} />}
          accent="info"
        />
        <StatCard
          title="Gross Profit"
          value={`$${Number(profitReport?.grossProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Revenue minus item purchase costs"
          icon={<TrendingUp size={22} />}
          accent="primary"
        />
        <StatCard
          title="Profit Margin"
          value={`${Number(profitReport?.profitMarginPercentage || 0).toFixed(1)}%`}
          subtext="Average margin percentage"
          icon={<BarChart3 size={22} />}
          accent="warning"
        />
      </div>

      {/* Revenue vs Profit Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Revenue vs. Gross Profit Comparison</h3>
            <p style={{ fontSize: '13px', color: 'var(--navy-500)', marginTop: '2px' }}>
              Daily financial progression and return on investment
            </p>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <Loader text="Generating chart..." />
          ) : !profitReport?.breakdown?.length ? (
            <EmptyState title="No transactions in selected range" description="Select a longer time range to analyze trends." />
          ) : (
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitReport.breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="label" stroke="var(--navy-400)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--navy-400)" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(val, name) => [`$${Number(val).toFixed(2)}`, name === 'revenue' ? 'Revenue' : 'Gross Profit']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="profit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Top Velocity vs Slow Moving */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="reports-tables-grid">
        {/* Top-Selling Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Best-Selling Products</h3>
            <span style={{ fontSize: '12px', color: 'var(--navy-500)' }}>Top revenue contributors</span>
          </div>
          <div className="card-body card-body-tight">
            {bestSelling.length === 0 ? (
              <EmptyState title="No sales data" description="Top products will appear once sales occur." />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th style={{ textAlign: 'center' }}>Units Sold</th>
                      <th style={{ textAlign: 'right' }}>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSelling.map((prod) => (
                      <tr key={prod.productId}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{prod.productName}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--navy-600)' }}>
                          {prod.sku}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          <Badge variant="success">{prod.totalQuantitySold} sold</Badge>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          ${Number(prod.totalRevenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Slow-Moving Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Slow-Moving Products</h3>
            <span style={{ fontSize: '12px', color: 'var(--navy-500)' }}>High stock / Low velocity</span>
          </div>
          <div className="card-body card-body-tight">
            {slowMoving.length === 0 ? (
              <EmptyState title="No inventory data" description="All products have healthy velocity." />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th style={{ textAlign: 'center' }}>Current Stock</th>
                      <th style={{ textAlign: 'right' }}>Units Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slowMoving.map((prod) => (
                      <tr key={prod.productId}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{prod.productName}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--navy-600)' }}>
                          {prod.sku}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          <Badge variant="neutral">{prod.currentStock} in stock</Badge>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--navy-500)' }}>
                          {prod.totalQuantitySold} sold
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .reports-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
