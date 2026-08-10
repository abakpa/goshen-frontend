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

export default function ProductFormPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const categories = useAsyncData(() => api.categories.list({ limit: 100 }), []);
  const categoryRows = categories.data?.records || categories.data || [];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      taxStatus: 'exempt',
      minimumStockLevel: 5,
      wholesalePrice: 0
    }
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.products.create({
        ...values,
        costPrice: Number(values.costPrice || 0),
        sellingPrice: values.sellingPrice ? Number(values.sellingPrice) : null,
        wholesalePrice: Number(values.wholesalePrice || 0),
        minimumStockLevel: Number(values.minimumStockLevel || 5),
        barcode: values.barcode || undefined
      });
      navigate('/products');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create product');
    }
  };

  if (categories.status === 'loading') return <SkeletonBlock rows={4} />;
  if (categories.status === 'failed') return <ErrorState message={categories.error} onRetry={categories.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add product</h1>
        <p className="mt-1 text-sm text-stone-500">Create products with prices, SKU, barcode, category, brand, and future variation support.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Product name" error={errors.name?.message} {...register('name', { required: 'Product name is required' })} />
        <TextField label="Product code" error={errors.productCode?.message} {...register('productCode', { required: 'Product code is required' })} />
        <TextField label="SKU" error={errors.sku?.message} {...register('sku', { required: 'SKU is required' })} />
        <TextField label="Barcode" {...register('barcode')} />
        <SelectField label="Category" error={errors.category?.message} {...register('category', { required: 'Category is required' })}>
          <option value="">Select category</option>
          {categoryRows.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </SelectField>
        <TextField label="Brand" {...register('brand')} />
        <TextField label="Cost price" type="number" min="0" step="0.01" error={errors.costPrice?.message} {...register('costPrice', { required: 'Cost price is required' })} />
        <TextField label="Wholesale price" type="number" min="0" step="0.01" {...register('wholesalePrice')} />
        <TextField label="Minimum stock level" type="number" min="0" {...register('minimumStockLevel')} />
        <SelectField label="Tax status" {...register('taxStatus')}>
          <option value="exempt">Exempt</option>
          <option value="taxable">Taxable</option>
        </SelectField>
        <TextField label="Gender group" {...register('genderGroup')} />
        <TextField label="Age group" {...register('ageGroup')} />
        <TextField label="Description" as="textarea" className="sm:col-span-2" {...register('description')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/products')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save product'}
        </button>
      </div>
    </form>
  );
}
