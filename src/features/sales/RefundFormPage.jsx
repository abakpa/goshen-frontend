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
import { formatCurrency } from '../../utils/currency.js';

export default function RefundFormPage() {
  const navigate = useNavigate();
  const sales = useAsyncData(() => api.sales.list({ limit: 100 }), []);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { method: 'cash' } });
  const saleRows = sales.data?.records || [];
  const selectedSale = saleRows.find((sale) => sale._id === selectedSaleId);

  const onSubmit = async (values) => {
    setServerError(null);
    if (!selectedSale) {
      setServerError('Select the sale being refunded');
      return;
    }
    try {
      await api.refunds.create({
        sale: selectedSale._id,
        store: selectedSale.store?._id || selectedSale.store,
        amount: Number(values.amount || 0),
        method: values.method,
        notes: values.notes
      });
      navigate('/sales/returns-refunds');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to request refund');
    }
  };

  if (sales.status === 'loading') return <SkeletonBlock rows={4} />;
  if (sales.status === 'failed') return <ErrorState message={sales.error} onRetry={sales.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Request refund</h1>
        <p className="mt-1 text-sm text-stone-500">Refunds are created as pending and require approval by an authorized user.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Sale" value={selectedSaleId} onChange={(event) => setSelectedSaleId(event.target.value)}>
          <option value="">Select sale</option>
          {saleRows.map((sale) => <option key={sale._id} value={sale._id}>{sale.saleNumber} · {formatCurrency(sale.totalAmount)}</option>)}
        </SelectField>
        <TextField label="Refund amount" type="number" min="0" step="0.01" error={errors.amount?.message} {...register('amount', { required: 'Refund amount is required' })} />
        <SelectField label="Refund method" {...register('method')}>
          <option value="cash">Cash</option>
          <option value="bank-transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="store-credit">Store credit</option>
        </SelectField>
        <TextField label="Notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="relative z-10 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:sticky lg:bottom-0">
        <button type="button" onClick={() => navigate('/sales/returns-refunds')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Submitting...' : 'Request refund'}
        </button>
      </div>
    </form>
  );
}
