import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import supplierService from '../../services/supplierService';

export const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  initialProduct = null,
  categories = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    customCategory: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    minimumStockLevel: '5',
    expiryDate: '',
    supplierId: '',
  });

  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getAllSuppliers();
        setSuppliers(data || []);
      } catch {
        // supplier list optional fallback
      }
    };
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        sku: initialProduct.sku || '',
        category: initialProduct.category || '',
        customCategory: '',
        purchasePrice: initialProduct.purchasePrice ?? '',
        sellingPrice: initialProduct.sellingPrice ?? '',
        quantity: initialProduct.quantity ?? '',
        minimumStockLevel: initialProduct.minimumStockLevel ?? '5',
        expiryDate: initialProduct.expiryDate || '',
        supplierId: initialProduct.supplierId ? String(initialProduct.supplierId) : '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: categories[0] || 'Grocery',
        customCategory: '',
        purchasePrice: '',
        sellingPrice: '',
        quantity: '0',
        minimumStockLevel: '5',
        expiryDate: '',
        supplierId: '',
      });
    }
    setErrors({});
  }, [initialProduct, isOpen, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';

    const cat = formData.category === 'NEW_CATEGORY' ? formData.customCategory : formData.category;
    if (!cat.trim()) errs.category = 'Category is required';

    if (formData.purchasePrice === '' || Number(formData.purchasePrice) < 0) {
      errs.purchasePrice = 'Purchase price must be positive or zero';
    }
    if (formData.sellingPrice === '' || Number(formData.sellingPrice) < 0) {
      errs.sellingPrice = 'Selling price must be positive or zero';
    }
    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      errs.quantity = 'Quantity cannot be negative';
    }
    if (formData.minimumStockLevel === '' || Number(formData.minimumStockLevel) < 0) {
      errs.minimumStockLevel = 'Minimum stock level cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory =
      formData.category === 'NEW_CATEGORY' ? formData.customCategory.trim() : formData.category.trim();

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: finalCategory,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity, 10),
      minimumStockLevel: parseInt(formData.minimumStockLevel, 10),
      expiryDate: formData.expiryDate ? formData.expiryDate : null,
      supplierId: formData.supplierId ? parseInt(formData.supplierId, 10) : null,
    };

    onSave(payload);
  };

  const categoryOptions = [
    ...categories.map((c) => ({ value: c, label: c })),
    { value: 'NEW_CATEGORY', label: '+ Add New Category' },
  ];

  const supplierOptions = suppliers.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Edit Product' : 'Add New Product'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {initialProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Organic Whole Milk"
            required
            error={errors.name}
          />

          <Input
            label="SKU / Barcode"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g. GROC-MLK-001"
            required
            error={errors.sku}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
            required
            error={errors.category}
          />

          {formData.category === 'NEW_CATEGORY' ? (
            <Input
              label="New Category Name"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              placeholder="e.g. Organic Dairy"
              required
              error={errors.category}
            />
          ) : (
            <Select
              label="Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              options={supplierOptions}
              placeholder="Select Supplier (Optional)"
            />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Purchase Cost ($)"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchasePrice}
            onChange={handleChange}
            placeholder="0.00"
            required
            error={errors.purchasePrice}
          />

          <Input
            label="Selling Price ($)"
            name="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice}
            onChange={handleChange}
            placeholder="0.00"
            required
            error={errors.sellingPrice}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Input
            label="Current Stock Qty"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            required
            error={errors.quantity}
          />

          <Input
            label="Min Stock Threshold"
            name="minimumStockLevel"
            type="number"
            min="0"
            value={formData.minimumStockLevel}
            onChange={handleChange}
            placeholder="5"
            required
            error={errors.minimumStockLevel}
          />

          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
