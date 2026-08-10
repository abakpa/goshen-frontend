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

export default function CreditPaymentFormPage() {
  const navigate = useNavigate();
  const debtors = useAsyncData(() => api.credit.debtors(), []);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { paymentMethod: 'cash' }
  });
  const debtorRows = Array.isArray(debtors.data) ? debtors.data : [];

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.credit.recordPayment({
        ...values,
        amountPaid: Number(values.amountPaid || 0)
      });
      navigate('/credit-sales');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to record payment');
    }
  };

  if (debtors.status === 'loading') return <SkeletonBlock rows={4} />;
  if (debtors.status === 'failed') return <ErrorState message={debtors.error} onRetry={debtors.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Record debt payment</h1>
        <p className="mt-1 text-sm text-stone-500">Record instalment payments. The backend blocks payments above the outstanding balance.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Credit invoice" error={errors.creditSale?.message} {...register('creditSale', { required: 'Credit invoice is required' })}>
          <option value="">Select invoice</option>
          {debtorRows.map((debt) => (
            <option key={debt._id} value={debt._id}>
              {debt.creditInvoiceNumber} · {debt.customerName || 'Customer'} · Balance ₦{Number(debt.outstandingBalance || 0).toLocaleString()}
            </option>
          ))}
        </SelectField>
        <TextField label="Amount paid" type="number" min="1" step="0.01" error={errors.amountPaid?.message} {...register('amountPaid', { required: 'Amount is required' })} />
        <SelectField label="Payment method" {...register('paymentMethod')}>
          <option value="cash">Cash</option>
          <option value="bank-transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="pos-terminal">POS terminal</option>
          <option value="mobile-money">Mobile money</option>
        </SelectField>
        <TextField label="Payment reference" {...register('paymentReference')} />
        <TextField label="Notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/credit-sales')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Recording...' : 'Record payment'}
        </button>
      </div>
    </form>
  );
}
