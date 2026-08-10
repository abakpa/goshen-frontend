import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/resources.js';
import FormAlert from '../../components/forms/FormAlert.jsx';
import TextField from '../../components/forms/TextField.jsx';

export default function StoreFormPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { country: 'Nigeria', status: 'active' }
  });

  const onSubmit = async (values) => {
    setServerError(null);
    setSuccess(null);
    try {
      if (storeId) {
        await api.stores.update(storeId, values);
        setSuccess('Store updated successfully');
      } else {
        await api.stores.create(values);
        setSuccess('Store created successfully');
      }
      setTimeout(() => navigate('/stores'), 500);
    } catch (error) {
      const details = error.response?.data?.details;
      setServerError(details?.length ? details.join(', ') : error.response?.data?.message || 'Unable to save store');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Store details</h1>
        <p className="mt-1 text-sm text-stone-500">Create branches, warehouses, and future sales locations without hard-coded store types.</p>
      </div>
      <FormAlert message={serverError} />
      <FormAlert type="success" message={success} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Store name" error={errors.name?.message} {...register('name', { required: 'Store name is required' })} />
        <TextField label="Store code" error={errors.code?.message} {...register('code', { required: 'Store code is required' })} />
        <TextField label="Store type" error={errors.type?.message} {...register('type', { required: 'Store type is required' })} />
        <TextField label="Phone number" {...register('phone')} />
        <TextField label="Email address" type="email" error={errors.email?.message} {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' } })} />
        <TextField label="City" {...register('city')} />
        <TextField label="State" {...register('state')} />
        <TextField label="Country" {...register('country')} />
        <TextField label="Address" as="textarea" className="sm:col-span-2" {...register('address')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/stores')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save store'}
        </button>
      </div>
    </form>
  );
}
