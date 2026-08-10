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

export default function CreditSaleFormPage() {
  const navigate = useNavigate();
  const customers = useAsyncData(() => api.customers.list({ limit: 100 }), []);
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      initialDeposit: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paymentMethod: 'cash'
    }
  });

  const customerRows = customers.data?.records || customers.data || [];
  const storeRows = stores.data?.records || stores.data || [];

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.credit.createSale({
        ...values,
        totalAmount: Number(values.totalAmount || 0),
        initialDeposit: Number(values.initialDeposit || 0)
      });
      navigate('/credit-sales');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create credit sale');
    }
  };

  if (customers.status === 'loading' || stores.status === 'loading') return <SkeletonBlock rows={4} />;
  if (customers.status === 'failed') return <ErrorState message={customers.error} onRetry={customers.reload} />;
  if (stores.status === 'failed') return <ErrorState message={stores.error} onRetry={stores.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Create credit sale</h1>
        <p className="mt-1 text-sm text-stone-500">Create a debtor invoice. Outstanding balance is calculated from payment transactions.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Customer" error={errors.customer?.message} {...register('customer', { required: 'Customer is required' })}>
          <option value="">Select customer</option>
          {customerRows.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName} · {customer.phone || 'No phone'}</option>)}
        </SelectField>
        <SelectField label="Store" error={errors.store?.message} {...register('store', { required: 'Store is required' })}>
          <option value="">Select store</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name} · {store.code}</option>)}
        </SelectField>
        <TextField label="Total credit amount" type="number" min="1" step="0.01" error={errors.totalAmount?.message} {...register('totalAmount', { required: 'Total amount is required' })} />
        <TextField label="Initial deposit" type="number" min="0" step="0.01" {...register('initialDeposit')} />
        <TextField label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate', { required: 'Due date is required' })} />
        <SelectField label="Deposit payment method" {...register('paymentMethod')}>
          <option value="cash">Cash</option>
          <option value="bank-transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="pos-terminal">POS terminal</option>
        </SelectField>
        <TextField label="Payment reference" {...register('paymentReference')} />
        <TextField label="Payment terms" {...register('paymentTerms')} />
        <TextField label="Notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/credit-sales')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Create credit sale'}
        </button>
      </div>
    </form>
  );
}
