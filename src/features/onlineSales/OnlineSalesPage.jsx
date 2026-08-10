import ModulePage from '../../components/common/ModulePage.jsx';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useState } from 'react';
import { formatCurrency } from '../../utils/currency.js';

const deliveryStatuses = [
  'pending',
  'confirmed',
  'processing',
  'ready-for-dispatch',
  'dispatched',
  'delivered',
  'cancelled',
  'returned'
];

export default function OnlineSalesPage() {
  const { data, status, error, reload } = useAsyncData(() => api.onlineOrders.list({ limit: 50 }), []);
  const [serverError, setServerError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const orders = data?.records || data || [];
  const ordersTotal = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const collectedTotal = orders.reduce((sum, order) => sum + Number(order.amountPaid || 0), 0);
  const outstandingTotal = orders.reduce((sum, order) => sum + Number(order.outstandingBalance || 0), 0);

  const updateDeliveryStatus = async (order, deliveryStatus) => {
    setServerError(null);
    setUpdatingOrderId(order._id);
    try {
      await api.onlineOrders.updateStatus(order._id, { deliveryStatus });
      reload();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to update delivery status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updatePaymentStatus = async (order, paymentStatus) => {
    setServerError(null);
    setUpdatingOrderId(order._id);
    try {
      const amountPaid = paymentStatus === 'paid'
        ? order.totalAmount
        : paymentStatus === 'unpaid'
          ? 0
          : Number(paymentAmounts[order._id] ?? order.amountPaid ?? 0);
      await api.onlineOrders.updateStatus(order._id, { paymentStatus, amountPaid });
      reload();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to update payment status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const columns = [
    { key: 'orderNumber', header: 'Order' },
    { key: 'onlinePlatform', header: 'Platform', render: (row) => row.onlinePlatform?.name || 'Platform' },
    { key: 'customerPhone', header: 'Phone' },
    { key: 'totalAmount', header: 'Total', render: (row) => formatCurrency(row.totalAmount || 0) },
    {
      key: 'amountPaid',
      header: 'Paid',
      render: (row) => (
        <input
          type="number"
          min="0"
          step="0.01"
          value={paymentAmounts[row._id] ?? row.amountPaid ?? 0}
          disabled={updatingOrderId === row._id}
          onChange={(event) => setPaymentAmounts((current) => ({ ...current, [row._id]: event.target.value }))}
          onBlur={(event) => updatePaymentStatus(row, row.paymentStatus === 'unpaid' && Number(event.target.value || 0) > 0 ? 'partially-paid' : row.paymentStatus)}
          className="min-h-10 w-28 rounded-md border border-stone-200 bg-white px-2 text-sm font-semibold outline-none focus:border-burgundy-500 disabled:opacity-60"
        />
      )
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => (
        <select
          value={row.paymentStatus}
          disabled={updatingOrderId === row._id}
          onChange={(event) => updatePaymentStatus(row, event.target.value)}
          className="min-h-10 rounded-md border border-stone-200 bg-white px-2 text-sm font-semibold outline-none focus:border-burgundy-500 disabled:opacity-60"
        >
          <option value="unpaid">unpaid</option>
          <option value="partially-paid">partially paid</option>
          <option value="paid">paid</option>
          <option value="refunded">refunded</option>
        </select>
      )
    },
    { key: 'outstandingBalance', header: 'Balance', render: (row) => formatCurrency(row.outstandingBalance || 0) },
    {
      key: 'deliveryStatus',
      header: 'Delivery',
      render: (row) => (
        <select
          value={row.deliveryStatus}
          disabled={updatingOrderId === row._id}
          onChange={(event) => updateDeliveryStatus(row, event.target.value)}
          className="min-h-10 rounded-md border border-stone-200 bg-white px-2 text-sm font-semibold outline-none focus:border-burgundy-500 disabled:opacity-60"
        >
          {deliveryStatuses.map((deliveryStatus) => (
            <option key={deliveryStatus} value={deliveryStatus}>{deliveryStatus.replaceAll('-', ' ')}</option>
          ))}
        </select>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <ModulePage
        title="Online sales"
        description="Manage Instagram, WhatsApp, Facebook, Jumia, TikTok, website, and marketplace orders while deducting stock from the assigned fulfilment store."
        actions={[{ label: 'Create order', to: '/online-sales/new' }, { label: 'Add channel', to: '/online-sales/channels/new' }]}
        metrics={[
          { label: 'Loaded orders', value: orders.length },
          { label: 'Order value', value: formatCurrency(ordersTotal) },
          { label: 'Collected', value: formatCurrency(collectedTotal) },
          { label: 'Outstanding', value: formatCurrency(outstandingTotal) }
        ]}
        sections={[]}
      />
      <FormAlert message={serverError} />
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={orders} emptyMessage="Online orders will appear here." />}
    </div>
  );
}
