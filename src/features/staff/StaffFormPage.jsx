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

export default function StaffFormPage() {
  const navigate = useNavigate();
  const roles = useAsyncData(() => api.staff.roles({ limit: 100 }), []);
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const [selectedStores, setSelectedStores] = useState([]);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { status: 'active' }
  });

  const roleRows = roles.data?.records || roles.data || [];
  const storeRows = stores.data?.records || stores.data || [];

  const toggleStore = (storeId) => {
    setSelectedStores((current) => current.includes(storeId) ? current.filter((id) => id !== storeId) : [...current, storeId]);
  };

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const selectedRole = roleRows.find((role) => role._id === values.role);
      if (!selectedRole?.permissions?.includes('system:*') && selectedStores.length === 0) {
        setServerError('Assign this staff member to at least one store');
        return;
      }
      await api.staff.create({ ...values, assignedStores: selectedStores });
      navigate('/staff');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create staff account');
    }
  };

  if (roles.status === 'loading' || stores.status === 'loading') return <SkeletonBlock rows={4} />;
  if (roles.status === 'failed') return <ErrorState message={roles.error} onRetry={roles.reload} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add staff</h1>
        <p className="mt-1 text-sm text-stone-500">Create a secure staff account and assign store access.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Full name" error={errors.fullName?.message} {...register('fullName', { required: 'Full name is required' })} />
        <TextField label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
        <TextField label="Phone" {...register('phone')} />
        <TextField label="Temporary password" type="password" error={errors.password?.message} {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} />
        <SelectField label="Role" error={errors.role?.message} {...register('role', { required: 'Role is required' })}>
          <option value="">Select role</option>
          {roleRows.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
        </SelectField>
        <SelectField label="Status" {...register('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
        </SelectField>
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold">Assigned stores</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {storeRows.map((store) => (
              <label key={store._id} className="flex min-h-12 items-center gap-2 rounded-md border border-stone-200 px-3 text-sm font-semibold">
                <input type="checkbox" className="h-4 w-4" checked={selectedStores.includes(store._id)} onChange={() => toggleStore(store._id)} />
                {store.name} · {store.code}
              </label>
            ))}
          </div>
        </div>
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/staff')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Create staff'}
        </button>
      </div>
    </form>
  );
}
