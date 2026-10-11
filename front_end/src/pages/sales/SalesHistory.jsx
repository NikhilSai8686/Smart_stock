import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, Eye, RefreshCw, Calendar, FileText } from 'lucide-react';
import saleService from '../../services/saleService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import PrintableInvoiceModal from '../../components/invoice/PrintableInvoiceModal';

export const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedSale, setSelectedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const { showError } = useToast();

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined,
      };
      const response = await saleService.getSales(params);
      setSales(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      showError(err.message || 'Failed to load sales history.');
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, showError]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleViewReceipt = (sale) => {
    setSelectedSale(sale);
    setIsInvoiceOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales History &amp; Invoices</h1>
          <p className="page-subtitle">Track customer transactions, past receipts, and sales audit</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={loadSales}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Filter Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={17} color="var(--navy-500)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-700)' }}>
              Filter by Date:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="form-input"
              style={{ width: '160px', height: '38px', fontSize: '13px' }}
            />
            <span style={{ color: 'var(--navy-400)', fontSize: '13px' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="form-input"
              style={{ width: '160px', height: '38px', fontSize: '13px' }}
            />
          </div>

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPage(0);
              }}
            >
              Reset Dates
            </Button>
          )}
        </div>
      </div>

      {/* Sales Table Card */}
      <div className="card">
        {loading ? (
          <Loader text="Loading transaction history..." />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<History size={40} color="var(--navy-400)" />}
            title="No sales transactions found"
            description="Complete sales in POS or change your date filters."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date &amp; Time</th>
                  <th>Cashier</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'right' }}>Discount</th>
                  <th style={{ textAlign: 'right' }}>Tax</th>
                  <th style={{ textAlign: 'right' }}>Grand Total</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: 'var(--navy-900)',
                          fontSize: '13px',
                        }}
                      >
                        {sale.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--navy-600)' }}>
                      {new Date(sale.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--navy-700)' }}>
                      {sale.cashierName || 'Staff'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {sale.items?.length || 0}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--navy-600)' }}>
                      ${Number(sale.subtotal).toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        color: Number(sale.discount) > 0 ? 'var(--danger-500)' : 'var(--navy-500)',
                      }}
                    >
                      {Number(sale.discount) > 0 ? `-$${Number(sale.discount).toFixed(2)}` : '$0.00'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--navy-600)' }}>
                      ${Number(sale.tax).toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--primary-700)',
                        fontSize: '15px',
                      }}
                    >
                      ${Number(sale.grandTotal).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => handleViewReceipt(sale)}
                      >
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Invoice Receipt Modal */}
      <PrintableInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};

export default SalesHistory;
