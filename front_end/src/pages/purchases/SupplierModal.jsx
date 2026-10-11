import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const SupplierModal = ({
  isOpen,
  onClose,
  onSave,
  initialSupplier = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialSupplier) {
      setFormData({
        name: initialSupplier.name || '',
        phone: initialSupplier.phone || '',
        email: initialSupplier.email || '',
        address: initialSupplier.address || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
      });
    }
    setErrors({});
  }, [initialSupplier, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Supplier name is required' });
      return;
    }

    onSave({
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {initialSupplier ? 'Update Supplier' : 'Save Supplier'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Supplier / Company Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Apex Wholesale Foods Inc."
          required
          error={errors.name}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +1 555-019-2831"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. orders@supplier.com"
          />
        </div>

        <Input
          label="Physical Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g. 450 Logistics Parkway, Chicago, IL"
        />
      </form>
    </Modal>
  );
};

export default SupplierModal;
