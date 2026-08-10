import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

function BusinessSettingsForm({ settings, reload }) {
  const [message, setMessage] = useState(null);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    reset({
      businessName: settings?.businessName || 'GOSHEN COLLECTION',
      address: settings?.address || '',
      phone: settings?.phone || '',
      email: settings?.email || '',
      currency: settings?.currency || 'NGN',
      taxRate: settings?.taxRate || 0,
      defaultCreditPeriodDays: settings?.defaultCreditPeriodDays || 30,
      defaultLowStockLevel: settings?.defaultLowStockLevel || 5,
      creditPolicy: settings?.creditPolicy || ''
    });
  }, [settings, reset]);

  const onSubmit = async (values) => {
    setMessage(null);
    setServerError(null);
    try {
      await api.settings.updateBusiness({
        ...values,
        taxRate: Number(values.taxRate || 0),
        defaultCreditPeriodDays: Number(values.defaultCreditPeriodDays || 30),
        defaultLowStockLevel: Number(values.defaultLowStockLevel || 5)
      });
      setMessage('Business settings saved');
      reload();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to save business settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg bg-white p-4 shadow-soft">
      <h2 className="font-bold">Business profile</h2>
      <FormAlert type="success" message={message} />
      <FormAlert message={serverError} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Business name" {...register('businessName')} />
        <TextField label="Currency" {...register('currency')} />
        <TextField label="Phone" {...register('phone')} />
        <TextField label="Email" type="email" {...register('email')} />
        <TextField label="Tax rate (%)" type="number" min="0" max="100" step="0.01" {...register('taxRate')} />
        <TextField label="Default credit period days" type="number" min="0" {...register('defaultCreditPeriodDays')} />
        <TextField label="Default low stock level" type="number" min="0" {...register('defaultLowStockLevel')} />
        <TextField label="Address" as="textarea" className="md:col-span-2" {...register('address')} />
        <TextField label="Credit policy" as="textarea" className="md:col-span-2" {...register('creditPolicy')} />
      </div>
      <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
        {isSubmitting ? 'Saving...' : 'Save business settings'}
      </button>
    </form>
  );
}

function ReceiptSettingsForm({ settings, reload }) {
  const [message, setMessage] = useState(null);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    reset({
      receiptHeader: settings?.receiptHeader || '',
      receiptFooter: settings?.receiptFooter || 'Thank you for shopping with GOSHEN COLLECTION.',
      returnPolicy: settings?.returnPolicy || '',
      receiptPrefix: settings?.numbering?.receiptPrefix || 'RCP',
      salePrefix: settings?.numbering?.salePrefix || 'SAL',
      transferPrefix: settings?.numbering?.transferPrefix || 'TRF',
      onlineOrderPrefix: settings?.numbering?.onlineOrderPrefix || 'ONL',
      creditInvoicePrefix: settings?.numbering?.creditInvoicePrefix || 'CRD'
    });
  }, [settings, reset]);

  const onSubmit = async (values) => {
    setMessage(null);
    setServerError(null);
    try {
      await api.settings.updateReceipt({
        receiptHeader: values.receiptHeader,
        receiptFooter: values.receiptFooter,
        returnPolicy: values.returnPolicy,
        numbering: {
          receiptPrefix: values.receiptPrefix,
          salePrefix: values.salePrefix,
          transferPrefix: values.transferPrefix,
          onlineOrderPrefix: values.onlineOrderPrefix,
          creditInvoicePrefix: values.creditInvoicePrefix
        }
      });
      setMessage('Receipt settings saved');
      reload();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to save receipt settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg bg-white p-4 shadow-soft">
      <h2 className="font-bold">Receipt settings</h2>
      <FormAlert type="success" message={message} />
      <FormAlert message={serverError} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Receipt header" {...register('receiptHeader')} />
        <TextField label="Receipt footer" {...register('receiptFooter')} />
        <TextField label="Receipt prefix" {...register('receiptPrefix')} />
        <TextField label="Sale prefix" {...register('salePrefix')} />
        <TextField label="Transfer prefix" {...register('transferPrefix')} />
        <TextField label="Online order prefix" {...register('onlineOrderPrefix')} />
        <TextField label="Credit invoice prefix" {...register('creditInvoicePrefix')} />
        <TextField label="Return policy" as="textarea" className="md:col-span-2" {...register('returnPolicy')} />
      </div>
      <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
        {isSubmitting ? 'Saving...' : 'Save receipt settings'}
      </button>
    </form>
  );
}

function SalesChannelManager() {
  const channels = useAsyncData(() => api.salesChannels.list({ limit: 100 }), []);
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { status: 'active' } });
  const channelRows = channels.data?.records || channels.data || [];
  const storeRows = stores.data?.records || stores.data || [];
  const columns = [
    { key: 'name', header: 'Channel' },
    { key: 'associatedStore', header: 'Store', render: (row) => row.associatedStore?.name || 'Unassigned' },
    { key: 'contactInformation', header: 'Contact' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await api.salesChannels.create({ ...values, associatedStore: values.associatedStore || null });
      reset({ name: '', description: '', contactInformation: '', associatedStore: '', status: 'active' });
      channels.reload();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create sales channel');
    }
  };

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-soft">
      <h2 className="font-bold">Sales channels</h2>
      <FormAlert message={serverError} />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <TextField label="Channel name" {...register('name', { required: true })} />
        <SelectField label="Associated store" {...register('associatedStore')}>
          <option value="">Unassigned</option>
          {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name}</option>)}
        </SelectField>
        <TextField label="Contact" {...register('contactInformation')} />
        <button disabled={isSubmitting} className="min-h-12 self-end rounded-md bg-ink px-4 font-bold text-white focus-ring disabled:opacity-60">Add</button>
      </form>
      {channels.status === 'loading' && <SkeletonBlock rows={3} />}
      {channels.status === 'failed' && <ErrorState message={channels.error} onRetry={channels.reload} />}
      {channels.status === 'succeeded' && <ResponsiveTable columns={columns} rows={channelRows} emptyMessage="Sales channels will appear here." />}
    </section>
  );
}

export default function SettingsPage() {
  const settings = useAsyncData(() => api.settings.business(), []);

  if (settings.status === 'loading') return <SkeletonBlock rows={5} />;
  if (settings.status === 'failed') return <ErrorState message={settings.error} onRetry={settings.reload} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-stone-500">Configure business profile, receipt text, numbering, policies, and online sales channels.</p>
      </div>
      <BusinessSettingsForm settings={settings.data} reload={settings.reload} />
      <ReceiptSettingsForm settings={settings.data} reload={settings.reload} />
      <SalesChannelManager />
    </div>
  );
}
