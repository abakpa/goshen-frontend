import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBarcode, FaMinus, FaPlus, FaReceipt, FaTrash } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';
import { isOwnerUser } from '../../utils/permissions.js';

const productCardThemes = [
  'border-burgundy-100 bg-burgundy-50 text-burgundy-900',
  'border-emerald-100 bg-emerald-50 text-emerald-900',
  'border-amber-100 bg-amber-50 text-amber-900',
  'border-blue-100 bg-blue-50 text-blue-900',
  'border-purple-100 bg-purple-50 text-purple-900',
  'border-rose-100 bg-rose-50 text-rose-900',
  'border-cyan-100 bg-cyan-50 text-cyan-900',
  'border-lime-100 bg-lime-50 text-lime-900'
];

function normalizeProduct(product) {
  return {
    product: product.type === 'variation' ? product.record.product?._id : product.record._id,
    variation: product.type === 'variation' ? product.record._id : null,
    name: product.type === 'variation' ? product.record.product?.name : product.record.name,
    variationLabel: product.type === 'variation' ? Object.values(product.record.attributes || {}).filter(Boolean).join(' · ') : '',
    sku: product.record.sku,
    barcode: product.record.barcode,
    unitPrice: product.record.sellingPrice || product.record.product?.sellingPrice || 0,
    quantity: 1,
    discount: 0
  };
}

export default function PointOfSalePage() {
  const scannerRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const isOwner = isOwnerUser(user);
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const [selectedStore, setSelectedStore] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [serverError, setServerError] = useState(null);
  const [successSale, setSuccessSale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ fullName: '', phone: '' });
  const [customerMatches, setCustomerMatches] = useState([]);
  const [customerSearchStatus, setCustomerSearchStatus] = useState('idle');
  const [selectedCheckoutCustomer, setSelectedCheckoutCustomer] = useState(null);

  const storeRows = stores.data?.records || stores.data || [];

  useEffect(() => {
    if (!isOwner && storeRows.length > 0 && !selectedStore) {
      setSelectedStore(storeRows[0]._id);
    }
  }, [isOwner, selectedStore, storeRows]);

  const inventory = useAsyncData(
    () => (selectedStore ? api.inventory.list({ store: selectedStore, limit: 100 }) : Promise.resolve([])),
    [selectedStore]
  );
  const inventoryRows = inventory.data?.records || inventory.data || [];

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0), [cart]);

  useEffect(() => {
    const phone = customerForm.phone.trim();
    setSelectedCheckoutCustomer(null);
    if (phone.length < 3) {
      setCustomerMatches([]);
      setCustomerSearchStatus('idle');
      return undefined;
    }

    let active = true;
    setCustomerSearchStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const data = await api.customers.list({ search: phone, limit: 5 });
        if (!active) return;
        setCustomerMatches(data?.records || data || []);
        setCustomerSearchStatus('succeeded');
      } catch {
        if (!active) return;
        setCustomerMatches([]);
        setCustomerSearchStatus('failed');
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerForm.phone]);

  const addToCart = (item) => {
    setSuccessSale(null);
    setCart((current) => {
      const existing = current.find((entry) => entry.product === item.product && entry.variation === item.variation);
      if (existing) {
        return current.map((entry) =>
          entry.product === item.product && entry.variation === item.variation
            ? { ...entry, quantity: Math.min(entry.quantity + 1, entry.availableQuantity || entry.quantity + 1) }
            : entry
        );
      }
      return [...current, item];
    });
    setTimeout(() => scannerRef.current?.focus(), 50);
  };

  const addInventoryItem = (inventoryItem) => {
    const variationLabel = inventoryItem.variation?.attributes
      ? Object.values(inventoryItem.variation.attributes).filter(Boolean).join(' · ')
      : '';
    addToCart({
      product: inventoryItem.product?._id,
      variation: inventoryItem.variation?._id || null,
      name: inventoryItem.product?.name,
      variationLabel,
      sku: inventoryItem.variation?.sku || inventoryItem.product?.sku,
      barcode: inventoryItem.variation?.barcode || inventoryItem.product?.barcode,
      unitPrice: inventoryItem.variation?.sellingPrice || inventoryItem.product?.sellingPrice || 0,
      quantity: 1,
      discount: 0,
      availableQuantity: inventoryItem.availableQuantity
    });
  };

  const lookupBarcode = async () => {
    if (!barcode.trim()) return;
    setServerError(null);
    try {
      const result = await api.products.lookupBarcode(barcode.trim());
      addToCart(normalizeProduct(result));
      setBarcode('');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Barcode not found');
    }
  };

  const updateQuantity = (index, quantity) => {
    setCart((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.availableQuantity || quantity) } : item
      )
    );
  };

  const removeItem = (index) => {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const openCheckout = () => {
    setServerError(null);
    setSuccessSale(null);
    if (!selectedStore) {
      setServerError(isOwner ? 'Select a store before checkout' : 'Your account must be assigned to a store before selling');
      return;
    }
    if (cart.length === 0) {
      setServerError('Add at least one item to the cart');
      return;
    }
    if (cart.some((item) => Number(item.unitPrice || 0) <= 0)) {
      setServerError('Enter the sold price for every cart item');
      return;
    }
    setCheckoutOpen(true);
  };

  const selectCustomerMatch = (customer) => {
    setSelectedCheckoutCustomer(customer);
    setCustomerForm({ fullName: customer.fullName || '', phone: customer.phone || '' });
  };

  const completeSale = async () => {
    setServerError(null);
    const fullName = customerForm.fullName.trim();
    const phone = customerForm.phone.trim();
    if (!selectedCheckoutCustomer && (!fullName || !phone)) {
      setServerError('Enter customer name and phone number before completing the sale');
      return;
    }
    setSubmitting(true);
    try {
      const sale = await api.sales.create({
        store: selectedStore,
        customer: selectedCheckoutCustomer?._id || null,
        customerInfo: selectedCheckoutCustomer ? null : { fullName, phone },
        channel: 'physical',
        items: cart.map((item) => ({
          product: item.product,
          variation: item.variation,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        })),
        payments: [{ method: paymentMethod, amount: subtotal, reference: '' }],
        discount: 0,
        tax: 0,
        deliveryFee: 0
      });
      setSuccessSale(sale);
      setCart([]);
      setCheckoutOpen(false);
      setCustomerForm({ fullName: '', phone: '' });
      setCustomerMatches([]);
      setSelectedCheckoutCustomer(null);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (stores.status === 'loading') return <SkeletonBlock rows={5} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Point of sale</h1>
          <p className="mt-1 text-sm text-stone-500">Scanner-first flow for physical store sales with transactional inventory deduction.</p>
        </div>
        <FormAlert message={serverError} />
        {successSale && (
          <section className={`rounded-lg border p-4 ${successSale.status === 'pending-approval' ? 'border-amber-100 bg-amber-50 text-amber-900' : 'border-emerald-100 bg-emerald-50 text-emerald-900'}`}>
            <div className="flex items-center gap-2 font-bold">
              <FaReceipt />
              {successSale.status === 'pending-approval' ? 'Sale sent for Admin approval' : 'Sale completed'}
            </div>
            {successSale.status !== 'pending-approval' && (
              <>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p>Receipt: <strong>{successSale.receiptNumber}</strong></p>
                  <p>Total: <strong>{formatCurrency(successSale.totalAmount)}</strong></p>
                  <p>Paid: <strong>{formatCurrency(successSale.amountPaid)}</strong></p>
                  <p>Change: <strong>{formatCurrency(successSale.change)}</strong></p>
                </div>
                <Link to={`/sales/${successSale._id}/receipt`} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white focus-ring">
                  Open receipt
                </Link>
              </>
            )}
          </section>
        )}
        <div className="rounded-lg bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-2">
            {isOwner ? (
              <SelectField label="Selling store" value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)}>
                <option value="">Select store</option>
                {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name} · {store.code}</option>)}
              </SelectField>
            ) : (
              <div className="rounded-md border border-stone-200 bg-cream px-3 py-2">
                <p className="text-xs font-bold uppercase text-stone-500">Assigned store</p>
                <p className="mt-1 min-h-6 font-bold">{storeRows[0]?.name || 'No store assigned'}</p>
              </div>
            )}
            <div className="rounded-md border border-stone-200 bg-cream px-3 py-2">
              <p className="text-xs font-bold uppercase text-stone-500">Customer</p>
              <p className="mt-1 min-h-6 font-bold">Collected at checkout</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <div className="flex min-h-12 flex-1 items-center gap-3 rounded-md border border-stone-200 px-3 focus-within:border-burgundy-500">
              <FaBarcode className="text-burgundy-600" />
              <input
                ref={scannerRef}
                className="w-full outline-none"
                placeholder="Scan barcode or type barcode"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    lookupBarcode();
                  }
                }}
                autoFocus
              />
            </div>
            <button type="button" onClick={lookupBarcode} className="min-h-12 rounded-md bg-ink px-4 font-bold text-white focus-ring">Add barcode</button>
          </div>
          {selectedStore && inventory.status === 'loading' && <div className="mt-4"><SkeletonBlock rows={3} /></div>}
          {selectedStore && inventory.status === 'failed' && <div className="mt-4"><ErrorState message={inventory.error} onRetry={inventory.reload} /></div>}
          {!selectedStore && <p className="mt-4 rounded-md bg-cream p-4 text-sm text-stone-500">Select a store to load sellable inventory.</p>}
          {selectedStore && inventory.status === 'succeeded' && inventoryRows.length === 0 && <p className="mt-4 rounded-md bg-cream p-4 text-sm text-stone-500">No inventory records found for this store.</p>}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {inventoryRows.map((item, index) => {
              const theme = productCardThemes[index % productCardThemes.length];
              const productName = item.product?.name || 'Product';
              const sku = item.variation?.sku || item.product?.sku || 'No SKU';
              const variationLabel = item.variation?.attributes ? Object.values(item.variation.attributes).filter(Boolean).join(' · ') : '';
              const guidePrice = item.variation?.sellingPrice || item.product?.sellingPrice;

              return (
                <button
                  key={item._id}
                  onClick={() => addInventoryItem(item)}
                  className={`min-h-[108px] rounded-lg border p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft focus-ring sm:min-h-[116px] ${theme}`}
                >
                  <div className="flex justify-end">
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-black">
                      {item.availableQuantity} left
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-black leading-4 sm:text-sm sm:leading-5">{productName}</p>
                  <p className="mt-1 truncate text-[11px] font-bold opacity-75 sm:text-xs">{sku}</p>
                  {variationLabel && <p className="mt-0.5 truncate text-[11px] opacity-70 sm:text-xs">{variationLabel}</p>}
                  <p className="mt-2 text-[11px] font-black sm:text-xs">
                    {guidePrice ? formatCurrency(guidePrice) : 'Enter price at sale'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <aside className="rounded-lg bg-white shadow-soft xl:sticky xl:top-24 xl:self-start">
        <div className="border-b border-stone-100 p-4">
          <h2 className="font-bold">Cart</h2>
          <p className="text-sm text-stone-500">{storeRows.find((store) => store._id === selectedStore)?.name || 'Select store'}</p>
        </div>
        <div className="max-h-[52vh] space-y-3 overflow-auto p-4 xl:max-h-[45vh]">
          {cart.length === 0 && <p className="rounded-md bg-cream p-4 text-sm text-stone-500">Scan or tap products to add them to the cart.</p>}
          {cart.map((item, index) => (
            <article key={`${item.product}-${item.variation || 'base'}`} className="rounded-md border border-stone-100 p-3">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-stone-500">{item.variationLabel || item.sku}</p>
                  <p className="mt-1 text-xs text-stone-500">Available: {item.availableQuantity || 'Check stock'}</p>
                </div>
                <button onClick={() => removeItem(index)} className="grid h-10 w-10 place-items-center rounded-md text-red-600 focus-ring"><FaTrash /></button>
              </div>
              <label className="mt-3 block text-xs font-bold uppercase text-stone-500">
                Sold price
                <input
                  className="mt-1 min-h-11 w-full rounded-md border border-stone-200 px-3 text-base font-semibold outline-none focus:border-burgundy-500 sm:text-sm"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(event) => {
                    const unitPrice = Number(event.target.value || 0);
                    setCart((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, unitPrice } : entry));
                  }}
                />
              </label>
              <div className="mt-3 grid gap-3 sm:flex sm:items-center sm:justify-between">
                <div className="inline-flex w-full items-center justify-between rounded-md border border-stone-200 sm:w-auto">
                  <button onClick={() => updateQuantity(index, item.quantity - 1)} className="grid h-10 w-10 place-items-center focus-ring"><FaMinus /></button>
                  <span className="grid h-10 min-w-12 place-items-center border-x border-stone-200 px-3 font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(index, item.quantity + 1)} className="grid h-10 w-10 place-items-center focus-ring"><FaPlus /></button>
                </div>
                <p className="text-right font-bold sm:text-left">{formatCurrency(item.unitPrice * item.quantity - item.discount)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="relative z-10 border-t border-stone-100 bg-white p-4 lg:sticky lg:bottom-0">
          <div className="grid gap-3">
            <SelectField label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="cash">Cash</option>
              <option value="bank-transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="pos-terminal">POS terminal</option>
              <option value="mobile-money">Mobile money</option>
              <option value="credit">Credit</option>
            </SelectField>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="flex justify-between text-lg"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div>
          </div>
          <button onClick={openCheckout} disabled={submitting} className="mt-4 min-h-12 w-full rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring disabled:opacity-60">
            Complete sale
          </button>
        </div>
      </aside>
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4">
          <section className="max-h-[92vh] w-full overflow-auto rounded-t-lg bg-white p-4 shadow-soft sm:max-w-lg sm:rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Customer details</h2>
                <p className="mt-1 text-sm text-stone-500">Search by phone or enter a new customer before completing the sale.</p>
              </div>
              <button type="button" onClick={() => setCheckoutOpen(false)} className="min-h-10 rounded-md border border-stone-200 px-3 font-bold focus-ring">Close</button>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="block text-sm font-semibold">
                Phone number
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-stone-200 px-3 text-base font-normal outline-none focus:border-burgundy-500"
                  value={customerForm.phone}
                  onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Enter customer phone"
                />
              </label>
              {customerSearchStatus === 'loading' && <p className="rounded-md bg-cream px-3 py-2 text-sm text-stone-500">Searching customers...</p>}
              {customerMatches.length > 0 && (
                <div className="grid gap-2">
                  {customerMatches.map((customer) => (
                    <button
                      type="button"
                      key={customer._id}
                      onClick={() => selectCustomerMatch(customer)}
                      className={`rounded-md border p-3 text-left focus-ring ${selectedCheckoutCustomer?._id === customer._id ? 'border-burgundy-300 bg-burgundy-50' : 'border-stone-200 bg-white'}`}
                    >
                      <p className="font-bold">{customer.fullName}</p>
                      <p className="text-sm text-stone-500">{customer.phone}</p>
                    </button>
                  ))}
                </div>
              )}
              <label className="block text-sm font-semibold">
                Customer name
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-stone-200 px-3 text-base font-normal outline-none focus:border-burgundy-500"
                  value={customerForm.fullName}
                  onChange={(event) => {
                    setSelectedCheckoutCustomer(null);
                    setCustomerForm((current) => ({ ...current, fullName: event.target.value }));
                  }}
                  placeholder="Enter customer name"
                />
              </label>
              {selectedCheckoutCustomer && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">Existing customer selected. This sale will be linked to their profile.</p>}
            </div>
            <div className="mt-4 rounded-md bg-cream p-3">
              <div className="flex justify-between text-sm"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div className="mt-1 flex justify-between text-sm"><span>Payment</span><strong className="capitalize">{paymentMethod.replace('-', ' ')}</strong></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCheckoutOpen(false)} className="min-h-11 rounded-md border border-stone-200 px-4 font-semibold focus-ring">Cancel</button>
              <button type="button" onClick={completeSale} disabled={submitting} className="min-h-11 rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring disabled:opacity-60">
                {submitting ? 'Completing...' : 'Confirm sale'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
