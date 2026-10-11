import React from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

export const PurchaseDetailModal = ({ isOpen, onClose, purchase }) => {
  if (!purchase) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Order Details"
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-500)', textTransform: 'uppercase' }}>
              Invoice / PO Number
            </span>
            <div style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--navy-900)' }}>
              {purchase.invoiceNumber}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--navy-600)', marginTop: '2px' }}>
              Supplier: <strong>{purchase.supplierName}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--navy-500)' }}>Date Recorded:</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-800)' }}>
              {new Date(purchase.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '8px' }}>
            Purchased Items
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px', color: 'var(--navy-600)' }}>Item</th>
                <th style={{ padding: '8px 4px', color: 'var(--navy-600)', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 4px', color: 'var(--navy-600)', textAlign: 'right' }}>Unit Cost</th>
                <th style={{ padding: '8px 4px', color: 'var(--navy-600)', textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items?.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid var(--navy-100)' }}>
                  <td style={{ padding: '10px 4px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{item.productName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--navy-500)', fontFamily: 'var(--font-mono)' }}>
                      SKU: {item.productSku}
                    </div>
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    +{item.quantity}
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    ${Number(item.unitPurchasePrice).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    ${Number(item.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13px', color: 'var(--navy-500)' }}>Total Purchase Cost:</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy-900)', fontFamily: 'var(--font-mono)' }}>
              ${Number(purchase.totalCost).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PurchaseDetailModal;
