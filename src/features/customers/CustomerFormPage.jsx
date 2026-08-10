import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/resources.js';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { customerType: 'regular', creditEligibility: false, creditLimit: 0 }
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.customers.create({
        ...values,
        creditEligibility: Boolean(values.creditEligibility),
        creditLimit: Number(values.creditLimit || 0)
      });
      navigate('/customers');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create customer');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add customer</h1>
        <p className="mt-1 text-sm text-stone-500">Create a profile for walk-in, regular, wholesale, credit, or online customers.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Full name" error={errors.fullName?.message} {...register('fullName', { required: 'Full name is required' })} />
        <TextField label="Phone number" {...register('phone')} />
        <TextField label="Email address" type="email" error={errors.email?.message} {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' } })} />
        <SelectField label="Customer type" {...register('customerType')}>
          <option value="walk-in">Walk-in customer</option>
          <option value="regular">Regular customer</option>
          <option value="wholesale">Wholesale customer</option>
          <option value="credit">Credit customer</option>
          <option value="online">Online customer</option>
        </SelectField>
        <TextField label="Credit limit" type="number" min="0" step="0.01" {...register('creditLimit')} />
        <label className="flex min-h-12 items-center gap-2 self-end rounded-md border border-stone-200 px-3 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4" {...register('creditEligibility')} />
          Credit eligible
        </label>
        <TextField label="Address" as="textarea" className="sm:col-span-2" {...register('address')} />
        <TextField label="Notes" as="textarea" className="sm:col-span-2" {...register('notes')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/customers')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save customer'}
        </button>
      </div>
    </form>
  );
}
