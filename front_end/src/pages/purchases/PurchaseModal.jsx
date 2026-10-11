import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import productService from '../../services/productService';
import supplierService from '../../services/supplierService';

export const PurchaseModal = ({ isOpen, onClose, onSave, loading = false }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitPurchasePrice: '' },
  ]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supData, prodData] = await Promise.all([
          supplierService.getAllSuppliers(),
          productService.getProducts({ size: 100 }),
        ]);
        setSuppliers(supData || []);
        setProducts(prodData.content || []);
      } catch {
        // fallback
      }
    };
    if (isOpen) {
      fetchData();
      setSupplierId('');
      setItems([{ productId: '', quantity: 1, unitPurchasePrice: '' }]);
      setError('');
    }
  }, [isOpen]);

  const handleProductChange = (index, prodId) => {
    const prod = products.find((p) => String(p.id) === String(prodId));
    const newItems = [...items];
    newItems[index].productId = prodId;
    if (prod) {
      newItems[index].unitPurchasePrice = prod.purchasePrice;
    }
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: 1, unitPurchasePrice: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCost = items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    const price = parseFloat(item.unitPurchasePrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setError(`Row #${i + 1}: Please select a product.`);
        return;
      }
      if (!it.quantity || parseInt(it.quantity, 10) <= 0) {
        setError(`Row #${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (it.unitPurchasePrice === '' || parseFloat(it.unitPurchasePrice) < 0) {
        setError(`Row #${i + 1}: Unit purchase price must be positive.`);
        return;
      }
    }

    const payload = {
      supplierId: supplierId ? parseInt(supplierId, 10) : null,
      items: items.map((i) => ({
        productId: parseInt(i.productId, 10),
        quantity: parseInt(i.quantity, 10),
        unitPurchasePrice: parseFloat(i.unitPurchasePrice),
      })),
    };

    onSave(payload);
  };

  const supplierOptions = suppliers.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.sku}) — Current Stock: ${p.quantity}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Purchase Order (Restock)"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Save &amp; Update Stock
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-50)',
              color: 'var(--danger-600)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Supplier"
          name="supplierId"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={supplierOptions}
          placeholder="Select supplier (optional)"
        />

        <div style={{ marginTop: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Purchased Product Items <span className="required">*</span>
            </label>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={addItemRow}
            >
              Add Item Row
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((row, index) => {
              const rowLineTotal = (parseInt(row.quantity, 10) || 0) * (parseFloat(row.unitPurchasePrice) || 0);

              return (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                    gap: '10px',
                    alignItems: 'center',
                    backgroundColor: 'var(--navy-50)',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <select
                      value={row.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="form-select"
                      style={{ height: '38px', fontSize: '13px' }}
                      required
                    >
                      <option value="">Select product...</option>
                      {productOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="form-input"
                      style={{ height: '38px', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit Cost ($)"
                      value={row.unitPurchasePrice}
                      onChange={(e) => handleItemChange(index, 'unitPurchasePrice', e.target.value)}
                      className="form-input"
                      style={{ height: '38px', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                    ${rowLineTotal.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    disabled={items.length <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: items.length <= 1 ? 'var(--navy-300)' : 'var(--danger-500)',
                      cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Summary */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13px', color: 'var(--navy-600)' }}>Estimated Purchase Cost:</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-900)', fontFamily: 'var(--font-mono)' }}>
              ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseModal;
