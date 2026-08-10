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

export default function SalesChannelFormPage() {
  const navigate = useNavigate();
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      associatedStore: '',
      status: 'active'
    }
  });
  const storeRows = stores.data?.records || stores.data || [];

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.salesChannels.create({
        ...values,
        associatedStore: values.associatedStore || null
      });
      navigate('/online-sales');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create sales channel');
    }
  };

  if (stores.status === 'loading') return <SkeletonBlock rows={5} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add sales channel</h1>
        <p className="mt-1 text-sm text-stone-500">Create an online platform such as Instagram, WhatsApp, Facebook, Jumia, TikTok, website, or another marketplace.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Channel name" error={errors.name?.message} {...register('name', { required: 'Channel name is required' })} />
        <SelectField label="Associated store" {...register('associatedStore')}>
          <option value="">Unassigned</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name}</option>)}
        </SelectField>
        <TextField label="Contact information" {...register('contactInformation')} />
        <SelectField label="Status" {...register('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>
        <TextField label="Description" as="textarea" className="sm:col-span-2" {...register('description')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/online-sales')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save channel'}
        </button>
      </div>
    </form>
  );
}
