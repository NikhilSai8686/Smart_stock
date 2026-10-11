import React from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const ProductDetailModal = ({ isOpen, onClose, product, onEdit }) => {
  if (!product) return null;

  const getStatusBadge = () => {
    if (product.stockStatus === 'OUT_OF_STOCK') {
      return <Badge variant="danger">Out of Stock</Badge>;
    }
    if (product.stockStatus === 'LOW_STOCK') {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            Edit Product
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-900)' }}>
              {product.name}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--navy-500)', fontFamily: 'var(--font-mono)' }}>
              SKU: {product.sku}
            </span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--navy-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--navy-500)' }}>Category:</span>
            <div style={{ fontWeight: 600, color: 'var(--navy-800)', marginTop: '2px' }}>
              {product.category}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Supplier:</span>
            <div style={{ fontWeight: 600, color: 'var(--navy-800)', marginTop: '2px' }}>
              {product.supplierName || 'None assigned'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Selling Price:</span>
            <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '16px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              ${Number(product.sellingPrice).toFixed(2)}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Purchase Cost:</span>
            <div style={{ fontWeight: 600, color: 'var(--navy-800)', fontSize: '15px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              ${Number(product.purchasePrice).toFixed(2)}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Current Stock:</span>
            <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '15px', marginTop: '2px' }}>
              {product.quantity} units
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Min Stock Threshold:</span>
            <div style={{ fontWeight: 600, color: 'var(--navy-800)', marginTop: '2px' }}>
              {product.minimumStockLevel} units
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Expiry Date:</span>
            <div style={{ fontWeight: 600, color: 'var(--navy-800)', marginTop: '2px' }}>
              {product.expiryDate || 'N/A (Non-perishable)'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--navy-500)' }}>Gross Profit Margin:</span>
            <div style={{ fontWeight: 600, color: 'var(--primary-600)', marginTop: '2px' }}>
              {Number(product.sellingPrice) > 0
                ? `${(((Number(product.sellingPrice) - Number(product.purchasePrice)) / Number(product.sellingPrice)) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
