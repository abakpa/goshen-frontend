import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function ReturnFormPage() {
  const navigate = useNavigate();
  const sales = useAsyncData(() => api.sales.list({ limit: 100 }), []);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedLineIndex, setSelectedLineIndex] = useState('');
  const [quantityReturned, setQuantityReturned] = useState(1);
  const [condition, setCondition] = useState('sellable');
  const [items, setItems] = useState([]);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { returnOption: 'refund' } });
  const saleRows = sales.data?.records || [];
  const selectedSale = useMemo(() => saleRows.find((sale) => sale._id === selectedSaleId), [saleRows, selectedSaleId]);
  const selectedLine = selectedSale?.items?.[Number(selectedLineIndex)];

  const addItem = () => {
    if (!selectedSale || !selectedLine) return;
    const quantity = Math.min(Number(quantityReturned), selectedLine.quantity);
    setItems((current) => [
      ...current,
      {
        product: selectedLine.product,
        variation: selectedLine.variation || null,
        label: `${selectedLine.productName} ${selectedLine.variationLabel || ''}`,
        quantityReturned: quantity,
        condition,
        refundAmount: condition === 'sellable' ? selectedLine.unitPrice * quantity : 0
      }
    ]);
    setSelectedLineIndex('');
    setQuantityReturned(1);
  };

  const onSubmit = async (values) => {
    setServerError(null);
    if (!selectedSale) {
      setServerError('Select the original sale');
      return;
    }
    if (items.length === 0) {
      setServerError('Add at least one returned item');
      return;
    }
    try {
      await api.returns.create({
        originalSale: selectedSale._id,
        customer: selectedSale.customer?._id || selectedSale.customer || null,
        store: selectedSale.store?._id || selectedSale.store,
        returnReason: values.returnReason,
        returnOption: values.returnOption,
        notes: values.notes,
        items
      });
      navigate('/sales/returns-refunds');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to process return');
    }
  };

  if (sales.status === 'loading') return <SkeletonBlock rows={4} />;
  if (sales.status === 'failed') return <ErrorState message={sales.error} onRetry={sales.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Process return</h1>
        <p className="mt-1 text-sm text-stone-500">Return sellable items to available stock and damaged items to damaged stock.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft md:grid-cols-2">
        <SelectField label="Original sale" value={selectedSaleId} onChange={(event) => setSelectedSaleId(event.target.value)}>
          <option value="">Select sale</option>
          {saleRows.map((sale) => <option key={sale._id} value={sale._id}>{sale.saleNumber} · {sale.receiptNumber} · {formatCurrency(sale.totalAmount)}</option>)}
        </SelectField>
        <SelectField label="Return option" {...register('returnOption')}>
          <option value="refund">Refund</option>
          <option value="exchange">Exchange</option>
          <option value="store-credit">Store credit</option>
          <option value="replacement">Replacement</option>
        </SelectField>
        <SelectField label="Sale item" value={selectedLineIndex} onChange={(event) => setSelectedLineIndex(event.target.value)}>
          <option value="">Select item</option>
          {selectedSale?.items?.map((item, index) => <option key={`${item.product}-${index}`} value={index}>{item.productName} · Qty {item.quantity}</option>)}
        </SelectField>
        <TextField label="Quantity returned" type="number" min="1" max={selectedLine?.quantity || undefined} value={quantityReturned} onChange={(event) => setQuantityReturned(Number(event.target.value))} />
        <SelectField label="Condition" value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option value="sellable">Sellable</option>
          <option value="damaged">Damaged</option>
        </SelectField>
        <div className="self-end">
          <button type="button" onClick={addItem} className="min-h-11 rounded-md bg-ink px-4 font-bold text-white focus-ring">Add returned item</button>
        </div>
        <TextField label="Return reason" as="textarea" className="md:col-span-2" error={errors.returnReason?.message} {...register('returnReason', { required: 'Return reason is required' })} />
        <TextField label="Notes" as="textarea" className="md:col-span-2" {...register('notes')} />
      </section>
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <h2 className="font-bold">Returned items</h2>
        <div className="mt-3 space-y-2">
          {items.length === 0 && <p className="rounded-md bg-cream p-3 text-sm text-stone-500">No return items added yet.</p>}
          {items.map((item, index) => (
            <div key={`${item.product}-${index}`} className="flex items-center justify-between gap-3 rounded-md border border-stone-100 p-3">
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-stone-500">Qty {item.quantityReturned} · {item.condition} · Refund {formatCurrency(item.refundAmount)}</p>
              </div>
              <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="grid h-10 w-10 place-items-center rounded-md text-red-600 focus-ring"><FaTrash /></button>
            </div>
          ))}
        </div>
      </section>
      <div className="relative z-10 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:sticky lg:bottom-0">
        <button type="button" onClick={() => navigate('/sales/returns-refunds')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Processing...' : 'Process return'}
        </button>
      </div>
    </form>
  );
}
