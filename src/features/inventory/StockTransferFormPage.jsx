import { useMemo, useState } from 'react';
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

export default function StockTransferFormPage() {
  const navigate = useNavigate();
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const [sourceStore, setSourceStore] = useState('');
  const [destinationStore, setDestinationStore] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [serverError, setServerError] = useState(null);
  const inventory = useAsyncData(
    () => (sourceStore ? api.inventory.list({ store: sourceStore, limit: 100 }) : Promise.resolve([])),
    [sourceStore]
  );
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const storeRows = stores.data?.records || stores.data || [];
  const inventoryRows = inventory.data?.records || inventory.data || [];
  const selectedInventory = useMemo(() => inventoryRows.find((row) => row._id === selectedInventoryId), [inventoryRows, selectedInventoryId]);

  const addItem = () => {
    if (!selectedInventory || quantity < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.product === selectedInventory.product?._id && item.variation === (selectedInventory.variation?._id || null));
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantityRequested: Math.min(item.quantityRequested + Number(quantity), selectedInventory.availableQuantity) } : item
        );
      }
      return [
        ...current,
        {
          product: selectedInventory.product?._id,
          variation: selectedInventory.variation?._id || null,
          label: `${selectedInventory.product?.name} ${selectedInventory.variation?.sku || selectedInventory.product?.sku}`,
          availableQuantity: selectedInventory.availableQuantity,
          quantityRequested: Math.min(Number(quantity), selectedInventory.availableQuantity)
        }
      ];
    });
    setSelectedInventoryId('');
    setQuantity(1);
  };

  const removeItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const onSubmit = async (values) => {
    setServerError(null);
    if (!sourceStore || !destinationStore) {
      setServerError('Select source and destination stores');
      return;
    }
    if (sourceStore === destinationStore) {
      setServerError('Source and destination stores must be different');
      return;
    }
    if (items.length === 0) {
      setServerError('Add at least one transfer item');
      return;
    }
    try {
      await api.stockTransfers.create({
        sourceStore,
        destinationStore,
        notes: values.notes,
        status: 'pending-approval',
        items: items.map((item) => ({
          product: item.product,
          variation: item.variation,
          quantityRequested: item.quantityRequested
        }))
      });
      navigate('/inventory/transfers');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create transfer');
    }
  };

  if (stores.status === 'loading') return <SkeletonBlock rows={4} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Create stock transfer</h1>
        <p className="mt-1 text-sm text-stone-500">Request movement of stock from one store to another. Stock leaves only after approval and dispatch.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft md:grid-cols-2">
        <SelectField label="Source store" value={sourceStore} onChange={(event) => setSourceStore(event.target.value)}>
          <option value="">Select source</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name} · {store.code}</option>)}
        </SelectField>
        <SelectField label="Destination store" value={destinationStore} onChange={(event) => setDestinationStore(event.target.value)}>
          <option value="">Select destination</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name} · {store.code}</option>)}
        </SelectField>
        {sourceStore && inventory.status === 'loading' && <div className="md:col-span-2"><SkeletonBlock rows={2} /></div>}
        {sourceStore && inventory.status === 'failed' && <div className="md:col-span-2"><ErrorState message={inventory.error} onRetry={inventory.reload} /></div>}
        <SelectField label="Inventory item" value={selectedInventoryId} onChange={(event) => setSelectedInventoryId(event.target.value)}>
          <option value="">Select item</option>
          {inventoryRows.map((item) => (
            <option key={item._id} value={item._id}>
              {item.product?.name} · {item.variation?.sku || item.product?.sku} · Available {item.availableQuantity}
            </option>
          ))}
        </SelectField>
        <TextField label="Quantity" type="number" min="1" max={selectedInventory?.availableQuantity || undefined} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        <div className="md:col-span-2">
          <button type="button" onClick={addItem} className="min-h-11 rounded-md bg-ink px-4 font-bold text-white focus-ring">Add item</button>
        </div>
        <TextField label="Notes" as="textarea" className="md:col-span-2" {...register('notes')} />
      </section>
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <h2 className="font-bold">Transfer items</h2>
        <div className="mt-3 space-y-2">
          {items.length === 0 && <p className="rounded-md bg-cream p-3 text-sm text-stone-500">No items added yet.</p>}
          {items.map((item, index) => (
            <div key={`${item.product}-${item.variation || 'base'}`} className="flex items-center justify-between gap-3 rounded-md border border-stone-100 p-3">
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-stone-500">Requested: {item.quantityRequested} · Available: {item.availableQuantity}</p>
              </div>
              <button type="button" onClick={() => removeItem(index)} className="grid h-10 w-10 place-items-center rounded-md text-red-600 focus-ring"><FaTrash /></button>
            </div>
          ))}
        </div>
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/inventory/transfers')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Create transfer'}
        </button>
      </div>
    </form>
  );
}
