import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function OnlineOrderFormPage() {
  const navigate = useNavigate();
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const channels = useAsyncData(() => api.salesChannels.list({ limit: 100 }), []);
  const customers = useAsyncData(() => api.customers.list({ limit: 100 }), []);
  const [fulfilmentStore, setFulfilmentStore] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [items, setItems] = useState([]);
  const [serverError, setServerError] = useState(null);
  const inventory = useAsyncData(
    () => (fulfilmentStore ? api.inventory.list({ store: fulfilmentStore, limit: 100 }) : Promise.resolve([])),
    [fulfilmentStore]
  );

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      paymentStatus: 'unpaid',
      deliveryStatus: 'pending',
      paymentMethod: 'bank-transfer',
      amountPaid: 0,
      deliveryFee: 0,
      orderDate: new Date().toISOString().slice(0, 10)
    }
  });

  const storeRows = stores.data?.records || stores.data || [];
  const channelRows = channels.data?.records || channels.data || [];
  const customerRows = customers.data?.records || customers.data || [];
  const inventoryRows = inventory.data?.records || inventory.data || [];
  const selectedInventory = useMemo(() => inventoryRows.find((row) => row._id === selectedInventoryId), [inventoryRows, selectedInventoryId]);
  const selectedCustomer = customerRows.find((customer) => customer._id === watch('customer'));
  const itemsTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = Number(watch('deliveryFee') || 0);

  useEffect(() => {
    if (!selectedInventory) {
      setUnitPrice('');
      return;
    }
    setUnitPrice(selectedInventory.variation?.sellingPrice || selectedInventory.product?.sellingPrice || '');
  }, [selectedInventory]);

  const addItem = () => {
    const soldPrice = Number(unitPrice || 0);
    if (!selectedInventory || quantity < 1 || soldPrice < 0) return;
    const nextQuantity = Math.min(Number(quantity), selectedInventory.availableQuantity);
    setItems((current) => [
      ...current,
      {
        product: selectedInventory.product?._id,
        variation: selectedInventory.variation?._id || null,
        label: `${selectedInventory.product?.name} ${selectedInventory.variation?.sku || selectedInventory.product?.sku}`,
        availableQuantity: selectedInventory.availableQuantity,
        quantity: nextQuantity,
        unitPrice: soldPrice,
        lineTotal: nextQuantity * soldPrice
      }
    ]);
    setSelectedInventoryId('');
    setQuantity(1);
    setUnitPrice('');
  };

  const removeItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const onSubmit = async (values) => {
    setServerError(null);
    if (!fulfilmentStore) {
      setServerError('Select a fulfilment store');
      return;
    }
    if (items.length === 0) {
      setServerError('Add at least one order item');
      return;
    }
    try {
      await api.onlineOrders.create({
        ...values,
        customer: values.customer || null,
        fulfilmentStore,
        deliveryFee,
        amountPaid: values.paymentStatus === 'paid' ? itemsTotal + deliveryFee : Number(values.amountPaid || 0),
        customerPhone: values.customerPhone || selectedCustomer?.phone,
        customerEmail: values.customerEmail || selectedCustomer?.email,
        items: items.map((item) => ({
          product: item.product,
          variation: item.variation,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal
        }))
      });
      navigate('/online-sales');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create online order');
    }
  };

  if (stores.status === 'loading' || channels.status === 'loading' || customers.status === 'loading') return <SkeletonBlock rows={5} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;
  if (channels.status === 'failed') return <ErrorState message={channels.error} onRetry={channels.reload} />;
  if (customers.status === 'failed') return <ErrorState message={customers.error} onRetry={customers.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Create online order</h1>
        <p className="mt-1 text-sm text-stone-500">Record marketplace and social orders while deducting inventory from the fulfilment store.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft lg:grid-cols-3">
        <SelectField label="Sales channel" error={errors.onlinePlatform?.message} {...register('onlinePlatform', { required: 'Sales channel is required' })}>
          <option value="">Select channel</option>
          {channelRows.map((channel) => <option key={channel._id} value={channel._id}>{channel.name}</option>)}
        </SelectField>
        <SelectField label="Fulfilment store" value={fulfilmentStore} onChange={(event) => setFulfilmentStore(event.target.value)}>
          <option value="">Select store</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name} · {store.code}</option>)}
        </SelectField>
        <SelectField
          label="Customer"
          {...register('customer', {
            onChange: (event) => {
              const customer = customerRows.find((item) => item._id === event.target.value);
              setValue('customerPhone', customer?.phone || '');
              setValue('customerEmail', customer?.email || '');
            }
          })}
        >
          <option value="">Guest online customer</option>
          {customerRows.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName} · {customer.phone || 'No phone'}</option>)}
        </SelectField>
        <TextField label="Customer phone" {...register('customerPhone')} />
        <TextField label="Customer email" type="email" {...register('customerEmail')} />
        <TextField label="Order date" type="date" {...register('orderDate')} />
        <SelectField label="Payment status" {...register('paymentStatus')}>
          <option value="unpaid">Unpaid</option>
          <option value="partially-paid">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </SelectField>
        <SelectField label="Payment method" {...register('paymentMethod')}>
          <option value="bank-transfer">Bank transfer</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="pos-terminal">POS terminal</option>
          <option value="online-payment">Online payment</option>
        </SelectField>
        <TextField label="Amount paid" type="number" min="0" step="0.01" {...register('amountPaid')} />
        <SelectField label="Delivery status" {...register('deliveryStatus')}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="ready-for-dispatch">Ready for dispatch</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </SelectField>
        <TextField label="Delivery fee" type="number" min="0" step="0.01" {...register('deliveryFee')} />
        <TextField label="Courier" {...register('courier')} />
        <TextField label="Tracking number" {...register('trackingNumber')} />
        <TextField label="Delivery address" as="textarea" className="lg:col-span-2" {...register('deliveryAddress')} />
        <TextField label="Notes" as="textarea" {...register('notes')} />
      </section>
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft lg:grid-cols-[1fr_140px_180px_auto]">
        {fulfilmentStore && inventory.status === 'loading' && <div className="lg:col-span-4"><SkeletonBlock rows={2} /></div>}
        {fulfilmentStore && inventory.status === 'failed' && <div className="lg:col-span-4"><ErrorState message={inventory.error} onRetry={inventory.reload} /></div>}
        <SelectField label="Fulfilment inventory" value={selectedInventoryId} onChange={(event) => setSelectedInventoryId(event.target.value)}>
          <option value="">Select item</option>
          {inventoryRows.map((item) => (
            <option key={item._id} value={item._id}>
              {item.product?.name} · {item.variation?.sku || item.product?.sku} · Available {item.availableQuantity}
            </option>
          ))}
        </SelectField>
        <TextField label="Qty" type="number" min="1" max={selectedInventory?.availableQuantity || undefined} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        <TextField label="Selling amount" type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
        <button type="button" onClick={addItem} className="min-h-12 self-end rounded-md bg-ink px-4 font-bold text-white focus-ring">Add item</button>
      </section>
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Order items</h2>
          <p className="font-bold text-burgundy-700">{formatCurrency(itemsTotal + deliveryFee)}</p>
        </div>
        <div className="mt-3 space-y-2">
          {items.length === 0 && <p className="rounded-md bg-cream p-3 text-sm text-stone-500">No items added yet.</p>}
          {items.map((item, index) => (
            <div key={`${item.product}-${item.variation || index}`} className="flex items-center justify-between gap-3 rounded-md border border-stone-100 p-3">
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-stone-500">{item.quantity} x {formatCurrency(item.unitPrice)} · Available {item.availableQuantity}</p>
              </div>
              <div className="flex items-center gap-3">
                <strong>{formatCurrency(item.lineTotal)}</strong>
                <button type="button" onClick={() => removeItem(index)} className="grid h-10 w-10 place-items-center rounded-md text-red-600 focus-ring"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="relative z-10 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:sticky lg:bottom-0">
        <button type="button" onClick={() => navigate('/online-sales')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Create order'}
        </button>
      </div>
    </form>
  );
}
