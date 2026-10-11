import React from 'react';
import { Printer, CheckCircle2, Layers } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const PrintableInvoiceModal = ({ isOpen, onClose, sale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleString();
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Invoice Receipt"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<Printer size={16} />} onClick={handlePrint}>
            Print Invoice
          </Button>
        </>
      }
    >
      <div className="printable-invoice" style={{ padding: '12px 6px' }}>
        {/* Header Success Banner */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-700)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} color="var(--primary-600)" />
          <span>Sale completed successfully! Invoice generated.</span>
        </div>

        {/* Invoice Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--border-light)',
            paddingBottom: '18px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={18} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-900)' }}>
                SmartStock Store
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--navy-500)' }}>
              123 Commerce Avenue, Retail District
            </p>
            <p style={{ fontSize: '13px', color: 'var(--navy-500)' }}>
              Phone: +1 555-010-8800 | support@smartstock.local
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--primary-600)',
                backgroundColor: 'var(--primary-50)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Tax Invoice
            </span>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--navy-900)',
                marginTop: '8px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {sale.invoiceNumber}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--navy-500)', marginTop: '2px' }}>
              Date: {formatDate(sale.createdAt)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--navy-500)' }}>
              Cashier: {sale.cashierName || 'Staff'}
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div style={{ marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', color: 'var(--navy-600)', fontWeight: 600 }}>#</th>
                <th style={{ padding: '10px 8px', color: 'var(--navy-600)', fontWeight: 600 }}>Item Description</th>
                <th style={{ padding: '10px 8px', color: 'var(--navy-600)', fontWeight: 600, textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 8px', color: 'var(--navy-600)', fontWeight: 600, textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '10px 8px', color: 'var(--navy-600)', fontWeight: 600, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid var(--navy-100)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--navy-500)' }}>{index + 1}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{item.productName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--navy-500)', fontFamily: 'var(--font-mono)' }}>
                      SKU: {item.productSku}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    ${Number(item.unitSellingPrice).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: '12px 8px',
                      textAlign: 'right',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ${Number(item.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: '14px',
                color: 'var(--navy-600)',
              }}
            >
              <span>Subtotal:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                ${Number(sale.subtotal || 0).toFixed(2)}
              </span>
            </div>
            {Number(sale.discount) > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: '14px',
                  color: 'var(--danger-500)',
                }}
              >
                <span>Discount:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  -${Number(sale.discount).toFixed(2)}
                </span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: '14px',
                color: 'var(--navy-600)',
              }}
            >
              <span>Tax:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                ${Number(sale.tax || 0).toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderTop: '2px solid var(--navy-800)',
                marginTop: '6px',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--navy-900)',
              }}
            >
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary-600)', fontFamily: 'var(--font-mono)' }}>
                ${Number(sale.grandTotal || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: '1px dashed var(--border-light)',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--navy-500)',
          }}
        >
          <p>Thank you for shopping with us! Please keep this receipt for returns or exchanges.</p>
          <p style={{ marginTop: '2px' }}>SmartStock Point of Sale System</p>
        </div>
      </div>
    </Modal>
  );
};

export default PrintableInvoiceModal;
