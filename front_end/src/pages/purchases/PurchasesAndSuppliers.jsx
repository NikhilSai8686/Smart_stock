import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import purchaseService from '../../services/purchaseService';
import supplierService from '../../services/supplierService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import useDebounce from '../../hooks/useDebounce';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PurchaseModal from './PurchaseModal';
import PurchaseDetailModal from './PurchaseDetailModal';
import SupplierModal from './SupplierModal';

export const PurchasesAndSuppliers = () => {
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'suppliers'

  // Purchases state
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [purchasePage, setPurchasePage] = useState(0);
  const [purchaseTotalPages, setPurchaseTotalPages] = useState(0);
  const [purchaseTotalElements, setPurchaseTotalElements] = useState(0);

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [supplierPage, setSupplierPage] = useState(0);
  const [supplierTotalPages, setSupplierTotalPages] = useState(0);
  const [supplierTotalElements, setSupplierTotalElements] = useState(0);
  const [supplierSearch, setSupplierSearch] = useState('');
  const debouncedSupplierSearch = useDebounce(supplierSearch, 300);

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isPurchaseDetailOpen, setIsPurchaseDetailOpen] = useState(false);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSupplierDeleteOpen, setIsSupplierDeleteOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const pageSize = 10;

  // Load Purchases
  const loadPurchases = useCallback(async () => {
    try {
      setPurchasesLoading(true);
      const res = await purchaseService.getPurchases({ page: purchasePage, size: pageSize });
      setPurchases(res.content || []);
      setPurchaseTotalPages(res.totalPages || 0);
      setPurchaseTotalElements(res.totalElements || 0);
    } catch (err) {
      showError(err.message || 'Failed to load purchase records.');
    } finally {
      setPurchasesLoading(false);
    }
  }, [purchasePage, showError]);

  // Load Suppliers
  const loadSuppliers = useCallback(async () => {
    try {
      setSuppliersLoading(true);
      const res = await supplierService.getSuppliers({
        page: supplierPage,
        size: pageSize,
        search: debouncedSupplierSearch || undefined,
      });
      setSuppliers(res.content || []);
      setSupplierTotalPages(res.totalPages || 0);
      setSupplierTotalElements(res.totalElements || 0);
    } catch (err) {
      showError(err.message || 'Failed to load suppliers.');
    } finally {
      setSuppliersLoading(false);
    }
  }, [supplierPage, debouncedSupplierSearch, showError]);

  useEffect(() => {
    if (activeTab === 'purchases') {
      loadPurchases();
    } else {
      loadSuppliers();
    }
  }, [activeTab, loadPurchases, loadSuppliers]);

  // Handle Record Purchase
  const handleRecordPurchase = async (payload) => {
    try {
      setActionLoading(true);
      const res = await purchaseService.createPurchase(payload);
      showSuccess(`Purchase Order #${res.invoiceNumber} recorded! Inventory incremented.`);
      setIsPurchaseModalOpen(false);
      loadPurchases();
    } catch (err) {
      showError(err.message || 'Failed to record purchase.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save Supplier
  const handleSaveSupplier = async (payload) => {
    try {
      setActionLoading(true);
      if (selectedSupplier) {
        await supplierService.updateSupplier(selectedSupplier.id, payload);
        showSuccess(`Supplier '${payload.name}' updated.`);
      } else {
        await supplierService.createSupplier(payload);
        showSuccess(`Supplier '${payload.name}' created.`);
      }
      setIsSupplierModalOpen(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (err) {
      showError(err.message || 'Failed to save supplier.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Supplier
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    try {
      setActionLoading(true);
      await supplierService.deleteSupplier(selectedSupplier.id);
      showSuccess(`Supplier '${selectedSupplier.name}' removed.`);
      setIsSupplierDeleteOpen(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (err) {
      showError(err.message || 'Failed to delete supplier.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchases &amp; Suppliers</h1>
          <p className="page-subtitle">Restock inventory catalog and manage vendor relationships</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={() => (activeTab === 'purchases' ? loadPurchases() : loadSuppliers())}
          >
            Refresh
          </Button>

          {activeTab === 'purchases' ? (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              Record Purchase (Restock)
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setSelectedSupplier(null);
                setIsSupplierModalOpen(true);
              }}
            >
              Add New Supplier
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('purchases')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'purchases' ? 'var(--primary-700)' : 'var(--navy-500)',
            borderBottom: activeTab === 'purchases' ? '2px solid var(--primary-600)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Truck size={17} />
          Purchases &amp; Orders History
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'suppliers' ? 'var(--primary-700)' : 'var(--navy-500)',
            borderBottom: activeTab === 'suppliers' ? '2px solid var(--primary-600)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building size={17} />
          Suppliers Directory
        </button>
      </div>

      {/* TAB 1: PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="card">
          {purchasesLoading ? (
            <Loader text="Loading purchases..." />
          ) : purchases.length === 0 ? (
            <EmptyState
              icon={<Truck size={44} color="var(--navy-400)" />}
              title="No purchase orders found"
              description="Record a purchase order to replenish product quantities."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={() => setIsPurchaseModalOpen(true)}
                >
                  Record First Purchase
                </Button>
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice / PO #</th>
                    <th>Supplier</th>
                    <th>Date Recorded</th>
                    <th style={{ textAlign: 'center' }}>Total Items</th>
                    <th style={{ textAlign: 'right' }}>Total Cost</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((po) => (
                    <tr key={po.id}>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--navy-900)',
                            fontSize: '13px',
                          }}
                        >
                          {po.invoiceNumber}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--navy-800)' }}>
                        {po.supplierName}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--navy-600)' }}>
                        {new Date(po.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {po.items?.length || 0}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: 'var(--navy-900)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        ${Number(po.totalCost).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye size={14} />}
                          onClick={() => {
                            setSelectedPurchase(po);
                            setIsPurchaseDetailOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={purchasePage}
            totalPages={purchaseTotalPages}
            totalElements={purchaseTotalElements}
            pageSize={pageSize}
            onPageChange={(p) => setPurchasePage(p)}
          />
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Supplier Search */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ position: 'relative', maxWidth: '320px' }}>
              <Search
                size={17}
                color="var(--navy-400)"
                style={{ position: 'absolute', left: '12px', top: '11px', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search suppliers by name or email..."
                value={supplierSearch}
                onChange={(e) => {
                  setSupplierSearch(e.target.value);
                  setSupplierPage(0);
                }}
                className="form-input"
                style={{ paddingLeft: '38px', height: '40px' }}
              />
            </div>
          </div>

          <div className="card">
            {suppliersLoading ? (
              <Loader text="Loading suppliers directory..." />
            ) : suppliers.length === 0 ? (
              <EmptyState
                icon={<Building size={44} color="var(--navy-400)" />}
                title="No suppliers found"
                description="Add suppliers to associate with inventory products."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={15} />}
                    onClick={() => {
                      setSelectedSupplier(null);
                      setIsSupplierModalOpen(true);
                    }}
                  >
                    Add Supplier
                  </Button>
                }
              />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Supplier Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((sup) => (
                      <tr key={sup.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                            {sup.name}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--navy-700)' }}>
                          {sup.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={13} color="var(--navy-400)" />
                              <span>{sup.phone}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--navy-700)' }}>
                          {sup.email ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Mail size={13} color="var(--navy-400)" />
                              <span>{sup.email}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--navy-600)' }}>
                          {sup.address ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={13} color="var(--navy-400)" />
                              <span>{sup.address}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-ghost btn-icon"
                              title="Edit Supplier"
                              onClick={() => {
                                setSelectedSupplier(sup);
                                setIsSupplierModalOpen(true);
                              }}
                            >
                              <Edit2 size={16} color="var(--primary-700)" />
                            </button>
                            {isAdmin && (
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Delete Supplier (Admin Only)"
                                onClick={() => {
                                  setSelectedSupplier(sup);
                                  setIsSupplierDeleteOpen(true);
                                }}
                              >
                                <Trash2 size={16} color="var(--danger-500)" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={supplierPage}
              totalPages={supplierTotalPages}
              totalElements={supplierTotalElements}
              pageSize={pageSize}
              onPageChange={(p) => setSupplierPage(p)}
            />
          </div>
        </div>
      )}

      {/* Record Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSave={handleRecordPurchase}
        loading={actionLoading}
      />

      {/* Purchase Details Modal */}
      <PurchaseDetailModal
        isOpen={isPurchaseDetailOpen}
        onClose={() => {
          setIsPurchaseDetailOpen(false);
          setSelectedPurchase(null);
        }}
        purchase={selectedPurchase}
      />

      {/* Add / Edit Supplier Modal */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSave={handleSaveSupplier}
        initialSupplier={selectedSupplier}
        loading={actionLoading}
      />

      {/* Delete Supplier Confirmation */}
      <ConfirmDialog
        isOpen={isSupplierDeleteOpen}
        onClose={() => {
          setIsSupplierDeleteOpen(false);
          setSelectedSupplier(null);
        }}
        onConfirm={handleDeleteSupplier}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier '${selectedSupplier?.name}'?`}
        confirmText="Delete Supplier"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default PurchasesAndSuppliers;
