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

export default function VariationFormPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const products = useAsyncData(() => api.products.list({ limit: 100 }), []);
  const productRows = products.data?.records || products.data || [];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.products.createVariation({
        product: values.product,
        sku: values.sku,
        barcode: values.barcode,
        costPrice: values.costPrice ? Number(values.costPrice) : undefined,
        sellingPrice: values.sellingPrice ? Number(values.sellingPrice) : undefined,
        wholesalePrice: values.wholesalePrice ? Number(values.wholesalePrice) : undefined,
        attributes: {
          size: values.size,
          colour: values.colour,
          design: values.design,
          material: values.material,
          ageRange: values.ageRange,
          shoeSize: values.shoeSize,
          sleeveType: values.sleeveType
        }
      });
      navigate('/products');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create variation');
    }
  };

  if (products.status === 'loading') return <SkeletonBlock rows={4} />;
  if (products.status === 'failed') return <ErrorState message={products.error} onRetry={products.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add product variation</h1>
        <p className="mt-1 text-sm text-stone-500">Create size, colour, material, age range, and shoe-size variants with their own SKU and barcode.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Product" error={errors.product?.message} {...register('product', { required: 'Product is required' })}>
          <option value="">Select product</option>
          {productRows.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
        </SelectField>
        <TextField label="Variation SKU" error={errors.sku?.message} {...register('sku', { required: 'SKU is required' })} />
        <TextField label="Variation barcode" error={errors.barcode?.message} {...register('barcode', { required: 'Barcode is required' })} />
        <TextField label="Colour" {...register('colour')} />
        <TextField label="Size" {...register('size')} />
        <TextField label="Shoe size" {...register('shoeSize')} />
        <TextField label="Age range" {...register('ageRange')} />
        <TextField label="Material" {...register('material')} />
        <TextField label="Design" {...register('design')} />
        <TextField label="Sleeve type" {...register('sleeveType')} />
        <TextField label="Cost price" type="number" min="0" step="0.01" {...register('costPrice')} />
        <TextField label="Selling price" type="number" min="0" step="0.01" {...register('sellingPrice')} />
        <TextField label="Wholesale price" type="number" min="0" step="0.01" {...register('wholesalePrice')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/products')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save variation'}
        </button>
      </div>
    </form>
  );
}
