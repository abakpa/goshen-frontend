import { Link } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import MessageModal from '../../components/common/MessageModal.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useState } from 'react';

export default function StockTransfersPage() {
  const { data, status, error, reload } = useAsyncData(() => api.stockTransfers.list({ limit: 50 }), []);
  const [modalError, setModalError] = useState(null);
  const transfers = data?.records || [];

  const runAction = async (transfer, action) => {
    try {
      if (action === 'approve') await api.stockTransfers.approve(transfer._id);
      if (action === 'reject') await api.stockTransfers.reject(transfer._id);
      if (action === 'dispatch') await api.stockTransfers.dispatch(transfer._id);
      if (action === 'receive') {
        await api.stockTransfers.receive(transfer._id, {
          items: transfer.items.map((item) => ({
            product: item.product?._id || item.product,
            variation: item.variation?._id || item.variation || null,
            quantityReceived: item.quantityDispatched || item.quantityRequested
          }))
        });
      }
      reload();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Unable to update transfer');
    }
  };

  const columns = [
    { key: 'transferNumber', header: 'Transfer' },
    { key: 'sourceStore', header: 'Source', render: (row) => row.sourceStore?.name || 'Source' },
    { key: 'destinationStore', header: 'Destination', render: (row) => row.destinationStore?.name || 'Destination' },
    { key: 'items', header: 'Items', render: (row) => row.items?.length || 0 },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'pending-approval' && <button onClick={() => runAction(row, 'approve')} className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-bold text-white">Approve</button>}
          {row.status === 'pending-approval' && <button onClick={() => runAction(row, 'reject')} className="rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">Reject</button>}
          {row.status === 'approved' && <button onClick={() => runAction(row, 'dispatch')} className="rounded-md bg-blue-600 px-2 py-1 text-xs font-bold text-white">Dispatch</button>}
          {['in-transit', 'partially-received'].includes(row.status) && <button onClick={() => runAction(row, 'receive')} className="rounded-md bg-burgundy-600 px-2 py-1 text-xs font-bold text-white">Receive</button>}
        </div>
      )
    }
  ];

  const pending = transfers.filter((item) => item.status === 'pending-approval').length;
  const approved = transfers.filter((item) => item.status === 'approved').length;
  const inTransit = transfers.filter((item) => item.status === 'in-transit').length;
  const received = transfers.filter((item) => item.status === 'received').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock transfers</h1>
          <p className="mt-1 text-sm text-stone-500">Transfer products between stores with approval, dispatch, receipt, partial receipt, and full audit tracking.</p>
        </div>
        <Link to="/inventory/transfers/new" className="inline-flex min-h-11 items-center justify-center rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">Create transfer</Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Pending approval</p><p className="mt-2 text-2xl font-bold">{pending}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Approved</p><p className="mt-2 text-2xl font-bold">{approved}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">In transit</p><p className="mt-2 text-2xl font-bold">{inTransit}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Received</p><p className="mt-2 text-2xl font-bold">{received}</p></article>
      </section>
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={transfers} emptyMessage="Stock transfer requests will appear here." />}
      <MessageModal
        open={Boolean(modalError)}
        title="Transfer Update Failed"
        message={modalError}
        onCancel={() => setModalError(null)}
      />
    </div>
  );
}
