import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function ShiftClosePage() {
  const { shiftId } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const { data, status, error, reload } = useAsyncData(() => api.shifts.list({ limit: 100 }), [shiftId]);
  const shifts = data?.records || data || [];
  const shift = shifts.find((item) => item._id === shiftId);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      expectedCash: 0,
      actualCash: 0,
      totalCardPayments: 0,
      totalBankTransferPayments: 0,
      totalPosPayments: 0,
      totalCreditSales: 0,
      totalRefunds: 0
    }
  });

  const previewDifference = useMemo(() => {
    const actual = Number(watch('actualCash') || 0);
    const expected = Number(watch('expectedCash') || 0);
    return actual - expected;
  }, [watch('actualCash'), watch('expectedCash')]);

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.shifts.close(shiftId, {
        expectedCash: Number(values.expectedCash || 0),
        actualCash: Number(values.actualCash || 0),
        totalCardPayments: Number(values.totalCardPayments || 0),
        totalBankTransferPayments: Number(values.totalBankTransferPayments || 0),
        totalPosPayments: Number(values.totalPosPayments || 0),
        totalCreditSales: Number(values.totalCreditSales || 0),
        totalRefunds: Number(values.totalRefunds || 0),
        notes: values.notes
      });
      navigate('/sales/shifts');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to close shift');
    }
  };

  if (status === 'loading') return <SkeletonBlock rows={4} />;
  if (status === 'failed') return <ErrorState message={error} onRetry={reload} />;
  if (!shift) return <ErrorState message="Shift not found." onRetry={() => navigate('/sales/shifts')} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Close shift</h1>
        <p className="mt-1 text-sm text-stone-500">{shift.staffMember?.fullName || 'Staff'} at {shift.store?.name || 'store'} opened with {formatCurrency(shift.openingCash)}.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Expected cash" type="number" min="0" step="0.01" error={errors.expectedCash?.message} {...register('expectedCash', { required: 'Expected cash is required' })} />
        <TextField label="Actual cash" type="number" min="0" step="0.01" error={errors.actualCash?.message} {...register('actualCash', { required: 'Actual cash is required' })} />
        <TextField label="Card payments" type="number" min="0" step="0.01" {...register('totalCardPayments')} />
        <TextField label="Bank transfers" type="number" min="0" step="0.01" {...register('totalBankTransferPayments')} />
        <TextField label="POS payments" type="number" min="0" step="0.01" {...register('totalPosPayments')} />
        <TextField label="Credit sales" type="number" min="0" step="0.01" {...register('totalCreditSales')} />
        <TextField label="Refunds" type="number" min="0" step="0.01" {...register('totalRefunds')} />
        <div className="rounded-lg border border-stone-200 bg-cream p-4">
          <p className="text-xs font-bold uppercase text-stone-500">Cash difference</p>
          <p className={`mt-2 text-2xl font-black ${previewDifference < 0 ? 'text-red-700' : previewDifference > 0 ? 'text-emerald-700' : 'text-stone-900'}`}>
            {formatCurrency(previewDifference)}
          </p>
        </div>
        <TextField label="Closing notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/sales/shifts')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting || shift.status === 'closed'} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Closing...' : 'Close shift'}
        </button>
      </div>
    </form>
  );
}
