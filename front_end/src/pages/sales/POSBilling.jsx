import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import productService from '../../services/productService';
import saleService from '../../services/saleService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PrintableInvoiceModal from '../../components/invoice/PrintableInvoiceModal';

export const POSBilling = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Cart state
  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState('0');
  const [taxPercent, setTaxPercent] = useState('8'); // 8% tax default
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Completed sale modal
  const [completedSale, setCompletedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const { showSuccess, showError, showWarning } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, cats] = await Promise.all([
        productService.getProducts({ size: 100, stockStatus: 'ALL' }),
        productService.getCategories(),
      ]);
      setProducts(prodRes.content || []);
      setCategories(cats || []);
    } catch (err) {
      showError(err.message || 'Failed to load POS catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products locally for instant response
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  // Cart operations
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      showWarning(`'${product.name}' is out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const currentItem = cart[existingIndex];
      if (currentItem.quantity >= product.quantity) {
        showWarning(`Cannot add more. Only ${product.quantity} units available in stock.`);
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitSellingPrice: product.sellingPrice,
        },
      ]);
    }
  };

  const updateQuantity = (productId, newQty) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.product.quantity) {
      showWarning(`Cannot exceed available stock of ${item.product.quantity} units.`);
      return;
    }

    setCart(
      cart.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty } : i
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount('0');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Number(item.unitSellingPrice) * item.quantity;
    }, 0);
  }, [cart]);

  const discount = Math.max(0, parseFloat(discountAmount) || 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = (taxableAmount * (parseFloat(taxPercent) || 0)) / 100;
  const grandTotal = Math.max(0, taxableAmount + tax);

  // Complete Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showWarning('Cart is empty. Please add items to checkout.');
      return;
    }

    // Validate available inventory before sending
    for (const item of cart) {
      if (item.quantity > item.product.quantity) {
        showError(`Stock changed for '${item.product.name}'. Max available is ${item.product.quantity}.`);
        return;
      }
    }

    try {
      setCheckoutLoading(true);
      const salePayload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount: discount,
        tax: Number(tax.toFixed(2)),
      };

      const completed = await saleService.createSale(salePayload);
      showSuccess(`Sale completed! Invoice #${completed.invoiceNumber} generated.`);

      setCompletedSale(completed);
      setIsInvoiceOpen(true);
      clearCart();
      loadData(); // Refresh product stock counts immediately
    } catch (err) {
      showError(err.message || 'Checkout failed. Please review stock and retry.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 className="page-title">Point of Sale (POS) &amp; Billing</h1>
          <p className="page-subtitle">Scan or select items, configure discounts, and generate invoices</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={loadData}
          >
            Refresh Catalog
          </Button>
        </div>
      </div>

      {/* POS Layout: 2 Columns (Catalog on left, Cart on right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '22px' }} className="pos-grid">
        {/* Left Column: Product Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search & Categories Bar */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  color="var(--navy-400)"
                  style={{ position: 'absolute', left: '12px', top: '12px', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Search products by title or SKU code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', height: '42px', fontSize: '15px' }}
                />
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: selectedCategory === '' ? 'var(--navy-900)' : '#ffffff',
                    color: selectedCategory === '' ? '#ffffff' : 'var(--navy-700)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  All Items ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: selectedCategory === cat ? 'var(--navy-900)' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : 'var(--navy-700)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="card" style={{ flex: 1, padding: '20px' }}>
            {loading ? (
              <Loader text="Loading catalog items..." />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Package size={40} color="var(--navy-400)" />}
                title="No items found"
                description="Try another search keyword or select a different category."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '14px',
                  maxHeight: '620px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.quantity <= 0;
                  const inCartItem = cart.find((i) => i.product.id === prod.id);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isOutOfStock && addToCart(prod)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: inCartItem
                          ? '2px solid var(--primary-500)'
                          : '1px solid var(--border-light)',
                        backgroundColor: isOutOfStock ? 'var(--navy-50)' : '#ffffff',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)',
                        boxShadow: inCartItem ? 'var(--shadow-sm)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isOutOfStock) e.currentTarget.style.borderColor = 'var(--primary-500)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isOutOfStock && !inCartItem)
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--navy-500)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {prod.sku}
                          </span>
                          {inCartItem && (
                            <span
                              style={{
                                backgroundColor: 'var(--primary-600)',
                                color: '#ffffff',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 6px',
                              }}
                            >
                              x{inCartItem.quantity}
                            </span>
                          )}
                        </div>

                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--navy-900)',
                            marginTop: '4px',
                            lineHeight: 1.3,
                          }}
                        >
                          {prod.name}
                        </h4>
                      </div>

                      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: 700,
                              color: 'var(--primary-700)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            ${Number(prod.sellingPrice).toFixed(2)}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              color: isOutOfStock ? 'var(--danger-500)' : 'var(--navy-500)',
                              fontWeight: isOutOfStock ? 600 : 400,
                            }}
                          >
                            {isOutOfStock ? 'Out of stock' : `${prod.quantity} available`}
                          </span>
                        </div>

                        <button
                          disabled={isOutOfStock}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            backgroundColor: isOutOfStock ? 'var(--navy-200)' : 'var(--primary-600)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Checkout Cart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={19} color="var(--primary-600)" />
              <h3 className="card-title">Current Order Cart</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: 'var(--danger-500)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, padding: '16px', maxHeight: '380px', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart size={36} color="var(--navy-400)" />}
                title="Cart is empty"
                description="Click on any product to add it to the current customer sale."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--navy-50)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '13px',
                          color: 'var(--navy-900)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--navy-500)', fontFamily: 'var(--font-mono)' }}>
                        ${Number(item.unitSellingPrice).toFixed(2)} / unit
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.quantity}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product.id, parseInt(e.target.value, 10) || 1)
                        }
                        style={{
                          width: '42px',
                          height: '26px',
                          textAlign: 'center',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: item.quantity >= item.product.quantity ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div style={{ textAlign: 'right', minWidth: '60px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                        ${(Number(item.unitSellingPrice) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--danger-500)',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Adjustments & Summary Totals */}
          <div
            style={{
              padding: '20px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Discount and Tax inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-600)' }}>
                  Discount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="form-input"
                  style={{ height: '36px', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-600)' }}>
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="form-input"
                  style={{ height: '36px', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Price Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--navy-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger-500)' }}>
                  <span>Discount:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated Tax ({taxPercent}%):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  marginTop: '4px',
                  borderTop: '2px solid var(--navy-800)',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--navy-900)',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary-600)', fontFamily: 'var(--font-mono)' }}>
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <Button
              variant="primary"
              size="lg"
              loading={checkoutLoading}
              disabled={cart.length === 0}
              onClick={handleCheckout}
              icon={<CheckCircle size={18} />}
              style={{ width: '100%', marginTop: '16px' }}
            >
              Complete Sale &amp; Print Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <PrintableInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={completedSale}
      />

      <style>{`
        @media (max-width: 1024px) {
          .pos-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default POSBilling;
