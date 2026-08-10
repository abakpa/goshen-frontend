import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/resources.js';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';

const categories = ['Rent', 'Electricity', 'Transportation', 'Salaries', 'Internet', 'Packaging', 'Repairs', 'Marketing', 'Delivery', 'Cleaning', 'Security', 'Miscellaneous'];

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      category: 'Rent',
      paymentMethod: 'bank-transfer',
      expenseDate: new Date().toISOString().slice(0, 10),
      status: 'pending'
    }
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.expenses.create({
        ...values,
        amount: Number(values.amount || 0)
      });
      navigate('/expenses');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create expense');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add expense</h1>
        <p className="mt-1 text-sm text-stone-500">Record a store or business-wide expense with category, date, amount, and payment method.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <SelectField label="Category" {...register('category')}>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </SelectField>
        <TextField label="Amount" type="number" min="0" step="0.01" error={errors.amount?.message} {...register('amount', { required: 'Amount is required' })} />
        <SelectField label="Payment method" {...register('paymentMethod')}>
          <option value="cash">Cash</option>
          <option value="bank-transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="pos-terminal">POS terminal</option>
        </SelectField>
        <TextField label="Expense date" type="date" {...register('expenseDate')} />
        <TextField label="Description" as="textarea" className="sm:col-span-2" error={errors.description?.message} {...register('description', { required: 'Description is required' })} />
        <TextField label="Notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="relative z-10 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:sticky lg:bottom-0">
        <button type="button" onClick={() => navigate('/expenses')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save expense'}
        </button>
      </div>
    </form>
  );
}
