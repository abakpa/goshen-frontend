import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/resources.js';
import FormAlert from '../../components/forms/FormAlert.jsx';
import TextField from '../../components/forms/TextField.jsx';

export default function CategoryFormPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.categories.create(values);
      navigate('/products');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create category');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Add category</h1>
        <p className="mt-1 text-sm text-stone-500">Create flexible product categories and subcategories for future stores and product lines.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft">
        <TextField label="Category name" error={errors.name?.message} {...register('name', { required: 'Category name is required' })} />
        <TextField label="Description" as="textarea" {...register('description')} />
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/products')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save category'}
        </button>
      </div>
    </form>
  );
}
