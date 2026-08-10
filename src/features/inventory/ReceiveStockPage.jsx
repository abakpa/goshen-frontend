import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function ReceiveStockPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const products = useAsyncData(() => api.products.list({ limit: 100 }), []);
  const storeRows = stores.data?.records || stores.data || [];
  const productRows = products.data?.records || products.data || [];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      quantity: 1,
      minimumStockLevel: 5,
      reorderLevel: 5,
      reason: 'Stock received'
    }
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.inventory.receive({
        ...values,
        quantity: Number(values.quantity),
        minimumStockLevel: Number(values.minimumStockLevel || 5),
        reorderLevel: Number(values.reorderLevel || 5),
        variation: values.variation || null
      });
      navigate('/inventory');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to receive stock');
    }
  };

  if (stores.status === 'loading' || products.status === 'loading') return <SkeletonBlock rows={4} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;
  if (products.status === 'failed') return <ErrorState message={products.error} onRetry={products.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Receive stock</h1>
        <p className="mt-1 text-sm text-stone-500">Add stock to a store inventory record and write a stock movement trail.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Product" error={errors.product?.message} {...register('product', { required: 'Product is required' })}>
          <option value="">Select product</option>
          {productRows.map((product) => <option key={product._id} value={product._id}>{product.name} · {product.sku}</option>)}
        </SelectField>
        <TextField label="Variation ID" {...register('variation')} />
        <SelectField label="Store" error={errors.store?.message} {...register('store', { required: 'Store is required' })}>
          <option value="">Select store</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name} · {store.code}</option>)}
        </SelectField>
        <TextField label="Quantity received" type="number" min="1" error={errors.quantity?.message} {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Quantity must be at least 1' } })} />
        <TextField label="Minimum stock level" type="number" min="0" {...register('minimumStockLevel')} />
        <TextField label="Reorder level" type="number" min="0" {...register('reorderLevel')} />
        <TextField label="Reason" as="textarea" className="sm:col-span-2" {...register('reason')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/inventory')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Receiving...' : 'Receive stock'}
        </button>
      </div>
    </form>
  );
}
