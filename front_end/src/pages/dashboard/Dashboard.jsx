import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  Eye,
  RefreshCw,
  ShoppingBag,
  Truck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import reportService from '../../services/reportService';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PrintableInvoiceModal from '../../components/invoice/PrintableInvoiceModal';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [chartView, setChartView] = useState('daily'); // 'daily' or 'monthly'

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summary, bestProds] = await Promise.all([
        dashboardService.getSummary(),
        reportService.getBestSelling(5),
      ]);
      setData(summary);
      setBestSelling(bestProds || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleViewInvoice = (sale) => {
    setSelectedSale(sale);
    setIsInvoiceOpen(true);
  };

  if (loading) {
    return <Loader text="Loading dashboard metrics..." fullPage />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertTriangle size={40} color="var(--danger-500)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--navy-900)' }}>
          Could not connect to backend API
        </h3>
        <p style={{ color: 'var(--navy-500)', fontSize: '14px', maxWidth: '460px', margin: '8px auto 20px' }}>
          {error}
        </p>
        <Button variant="primary" icon={<RefreshCw size={16} />} onClick={loadDashboardData}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const chartData = chartView === 'daily' ? data?.dailySales || [] : data?.monthlySales || [];

  return (
    <div>
      {/* Top Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Overview</h1>
          <p className="page-subtitle">Real-time inventory levels, daily revenue, and sales performance</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Truck size={15} />}
            onClick={() => navigate('/purchases')}
          >
            Record Purchase
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<PlusCircle size={15} />}
            onClick={() => navigate('/products')}
          >
            Add Product
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ShoppingBag size={15} />}
            onClick={() => navigate('/sales/pos')}
          >
            Open POS
          </Button>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <StatCard
          title="Total Products"
          value={data?.totalProducts || 0}
          subtext="Active inventory catalog"
          icon={<Package size={22} />}
          accent="navy"
        />
        <StatCard
          title="Total Sales"
          value={data?.totalSales || 0}
          subtext="Completed customer orders"
          icon={<ShoppingCart size={22} />}
          accent="info"
        />
        <StatCard
          title="Total Revenue"
          value={`$${Number(data?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Gross sales value"
          icon={<DollarSign size={22} />}
          accent="primary"
        />
        <StatCard
          title="Estimated Profit"
          value={`$${Number(data?.estimatedProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Gross profit after costs"
          icon={<TrendingUp size={22} />}
          accent="primary"
        />
        <StatCard
          title="Low Stock Items"
          value={data?.lowStockCount || 0}
          subtext="Below threshold alert"
          icon={<AlertTriangle size={22} />}
          accent={data?.lowStockCount > 0 ? 'danger' : 'primary'}
        />
      </div>

      {/* Main Grid: Charts & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }} className="dashboard-charts-grid">
        {/* Sales Chart Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Sales &amp; Revenue Trends</h3>
              <p style={{ fontSize: '13px', color: 'var(--navy-500)', marginTop: '2px' }}>
                {chartView === 'daily' ? 'Past 7 days performance' : 'Past 6 months breakdown'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setChartView('daily')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: chartView === 'daily' ? 'var(--primary-600)' : '#ffffff',
                  color: chartView === 'daily' ? '#ffffff' : 'var(--navy-700)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Daily
              </button>
              <button
                onClick={() => setChartView('monthly')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: chartView === 'monthly' ? 'var(--primary-600)' : '#ffffff',
                  color: chartView === 'monthly' ? '#ffffff' : 'var(--navy-700)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="card-body">
            {chartData.length === 0 ? (
              <EmptyState title="No chart data available" description="Complete sales in POS to view trends." />
            ) : (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === 'daily' ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                      <XAxis dataKey="label" stroke="var(--navy-400)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--navy-400)" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                      <XAxis dataKey="label" stroke="var(--navy-400)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--navy-400)" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Priority Alerts Widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 className="card-title">Priority Stock Alerts</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => navigate('/alerts')}
            >
              View All
            </Button>
          </div>
          <div className="card-body" style={{ flex: 1, padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Low stock alerts */}
              {data?.lowStockAlerts?.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Low Stock Warnings
                  </div>
                  {data.lowStockAlerts.map((item) => (
                    <div
                      key={item.productId}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--danger-50)',
                        border: '1px solid var(--danger-100)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-900)' }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--danger-600)', fontFamily: 'var(--font-mono)' }}>
                          SKU: {item.sku}
                        </div>
                      </div>
                      <Badge variant="danger">{item.currentStock} in stock</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Expiry alerts */}
              {data?.expiryAlerts?.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Expiry Alerts
                  </div>
                  {data.expiryAlerts.map((item) => (
                    <div
                      key={item.productId}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--warning-50)',
                        border: '1px solid var(--warning-100)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-900)' }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--warning-700)' }}>
                          {item.daysRemaining < 0
                            ? 'Already expired'
                            : `Expires in ${item.daysRemaining} days`}
                        </div>
                      </div>
                      <Badge variant={item.daysRemaining < 0 ? 'danger' : 'warning'}>
                        {item.expiryDate}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {(!data?.lowStockAlerts?.length && !data?.expiryAlerts?.length) && (
                <EmptyState
                  icon={<Clock size={36} color="var(--primary-600)" />}
                  title="All stock healthy"
                  description="No low stock or expiring products require attention."
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Best-Selling Products & Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="dashboard-tables-grid">
        {/* Best Selling Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Selling Products</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => navigate('/reports')}
            >
              Full Report
            </Button>
          </div>
          <div className="card-body card-body-tight">
            {bestSelling.length === 0 ? (
              <EmptyState title="No sales data" description="Sales will show top performing products here." />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th style={{ textAlign: 'center' }}>Units Sold</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSelling.map((prod, index) => (
                      <tr key={prod.productId || index}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{prod.productName}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--navy-600)' }}>
                          {prod.sku}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          <Badge variant="success">{prod.totalQuantitySold} sold</Badge>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
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

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => navigate('/sales/history')}
            >
              View History
            </Button>
          </div>
          <div className="card-body card-body-tight">
            {data?.recentSales?.length === 0 ? (
              <EmptyState title="No transactions yet" description="Recent checkout receipts will appear here." />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentSales?.slice(0, 5).map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                            {sale.invoiceNumber}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--navy-500)' }}>
                            {sale.cashierName}
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--navy-600)' }}>
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-700)', fontFamily: 'var(--font-mono)' }}>
                          ${Number(sale.grandTotal).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye size={14} />}
                            onClick={() => handleViewInvoice(sale)}
                          >
                            Receipt
                          </Button>
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

      {/* Printable Invoice Modal */}
      <PrintableInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSale}
      />

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-charts-grid, .dashboard-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
