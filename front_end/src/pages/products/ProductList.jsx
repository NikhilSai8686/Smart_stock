import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Package
} from 'lucide-react';
import productService from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import useDebounce from '../../hooks/useDebounce';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductModal from './ProductModal';
import ProductDetailModal from './ProductDetailModal';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Filters & Search
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const loadCategories = async () => {
    try {
      const cats = await productService.getCategories();
      setCategories(cats || []);
    } catch {
      // ignore
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        stockStatus: selectedStockStatus || undefined,
        sortBy,
        sortDir,
      };
      const response = await productService.getProducts(params);
      setProducts(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      showError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCategory, selectedStockStatus, sortBy, sortDir, showError]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateOrUpdate = async (productData) => {
    try {
      setActionLoading(true);
      if (currentProduct) {
        await productService.updateProduct(currentProduct.id, productData);
        showSuccess(`Product '${productData.name}' updated successfully.`);
      } else {
        await productService.createProduct(productData);
        showSuccess(`Product '${productData.name}' created successfully.`);
      }
      setIsModalOpen(false);
      setCurrentProduct(null);
      loadCategories();
      loadProducts();
    } catch (err) {
      showError(err.message || 'Error saving product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;
    try {
      setActionLoading(true);
      await productService.deleteProduct(currentProduct.id);
      showSuccess(`Product '${currentProduct.name}' deleted.`);
      setIsDeleteOpen(false);
      setCurrentProduct(null);
      loadProducts();
    } catch (err) {
      showError(err.message || 'Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStockBadge = (prod) => {
    if (prod.quantity === 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    }
    if (prod.quantity <= prod.minimumStockLevel) {
      return <Badge variant="warning">Low Stock ({prod.quantity})</Badge>;
    }
    return <Badge variant="success">In Stock ({prod.quantity})</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Inventory</h1>
          <p className="page-subtitle">Manage items, stock thresholds, pricing, and suppliers</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={loadProducts}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px', minWidth: '220px' }}>
            <Search
              size={17}
              color="var(--navy-400)"
              style={{ position: 'absolute', left: '12px', top: '11px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="form-select"
              style={{ width: '160px', height: '40px' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setPage(0);
              }}
              className="form-select"
              style={{ width: '150px', height: '40px' }}
            >
              <option value="">All Stock Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
                setPage(0);
              }}
              className="form-select"
              style={{ width: '160px', height: '40px' }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="sellingPrice-asc">Price (Low to High)</option>
              <option value="sellingPrice-desc">Price (High to Low)</option>
              <option value="quantity-asc">Quantity (Lowest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card">
        {loading ? (
          <Loader text="Loading products catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={44} color="var(--navy-400)" />}
            title="No products found"
            description="No products match your search or filter criteria."
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => {
                  setCurrentProduct(null);
                  setIsModalOpen(true);
                }}
              >
                Add First Product
              </Button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th style={{ textAlign: 'right' }}>Selling Price</th>
                  <th>Stock Status</th>
                  <th>Expiry Date</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                        {prod.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--navy-600)' }}>
                      {prod.sku}
                    </td>
                    <td>
                      <span
                        style={{
                          backgroundColor: 'var(--navy-100)',
                          color: 'var(--navy-700)',
                          fontSize: '12px',
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {prod.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--navy-600)' }}>
                      ${Number(prod.purchasePrice).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-700)' }}>
                      ${Number(prod.sellingPrice).toFixed(2)}
                    </td>
                    <td>{getStockBadge(prod)}</td>
                    <td style={{ fontSize: '13px', color: prod.isExpired ? 'var(--danger-600)' : 'var(--navy-600)' }}>
                      {prod.expiryDate ? (
                        <span style={{ fontWeight: prod.isExpired ? 600 : 400 }}>
                          {prod.expiryDate} {prod.isExpired && '(Expired)'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--navy-600)' }}>
                      {prod.supplierName || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="View Details"
                          onClick={() => {
                            setCurrentProduct(prod);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Edit Product"
                          onClick={() => {
                            setCurrentProduct(prod);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 size={16} color="var(--primary-700)" />
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Delete Product (Admin Only)"
                            onClick={() => {
                              setCurrentProduct(prod);
                              setIsDeleteOpen(true);
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
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentProduct(null);
        }}
        onSave={handleCreateOrUpdate}
        initialProduct={currentProduct}
        categories={categories}
        loading={actionLoading}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setCurrentProduct(null);
        }}
        product={currentProduct}
        onEdit={(prod) => {
          setCurrentProduct(prod);
          setIsModalOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setCurrentProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to permanently delete '${currentProduct?.name}' (SKU: ${currentProduct?.sku})? This action cannot be undone.`}
        confirmText="Delete Product"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProductList;
