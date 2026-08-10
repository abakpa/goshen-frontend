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

export default function ShiftOpenPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const { data: storeData, status, error, reload } = useAsyncData(() => api.stores.list({ status: 'active', limit: 100 }), []);
  const stores = storeData?.records || storeData || [];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { openingCash: 0 }
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.shifts.open({
        store: values.store,
        openingCash: Number(values.openingCash || 0),
        notes: values.notes
      });
      navigate('/sales/shifts');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to open shift');
    }
  };

  if (status === 'loading') return <SkeletonBlock rows={4} />;
  if (status === 'failed') return <ErrorState message={error} onRetry={reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Open shift</h1>
        <p className="mt-1 text-sm text-stone-500">Start a sales shift for the selected store and record the opening cash balance.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Store" error={errors.store?.message} {...register('store', { required: 'Store is required' })}>
          <option value="">Select store</option>
          {stores.map((store) => <option key={store._id} value={store._id}>{store.name}</option>)}
        </SelectField>
        <TextField label="Opening cash" type="number" min="0" step="0.01" error={errors.openingCash?.message} {...register('openingCash', { required: 'Opening cash is required' })} />
        <TextField label="Notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="relative z-10 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:sticky lg:bottom-0">
        <button type="button" onClick={() => navigate('/sales/shifts')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Opening...' : 'Open shift'}
        </button>
      </div>
    </form>
  );
}
