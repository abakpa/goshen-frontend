import { Link } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import MessageModal from '../../components/common/MessageModal.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';
import { useState } from 'react';

export default function ReturnsRefundsPage() {
  const returns = useAsyncData(() => api.returns.list({ limit: 50 }), []);
  const refunds = useAsyncData(() => api.refunds.list({ limit: 50 }), []);
  const [modalError, setModalError] = useState(null);
  const returnRows = returns.data?.records || [];
  const refundRows = refunds.data?.records || [];

  const approveRefund = async (refund) => {
    try {
      await api.refunds.approve(refund._id);
      refunds.reload();
    } catch (error) {
      setModalError(error.response?.data?.message || 'Unable to approve refund');
    }
  };

  const returnColumns = [
    { key: 'originalSale', header: 'Sale', render: (row) => row.originalSale?.saleNumber || row.originalSale },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || 'Store' },
    { key: 'returnOption', header: 'Option' },
    { key: 'items', header: 'Items', render: (row) => row.items?.length || 0 },
    { key: 'returnDate', header: 'Date', render: (row) => new Date(row.returnDate).toLocaleDateString() }
  ];

  const refundColumns = [
    { key: 'sale', header: 'Sale', render: (row) => row.sale?.saleNumber || row.sale },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || 'Store' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => row.status === 'pending' ? <button onClick={() => approveRefund(row)} className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-bold text-white">Approve</button> : null
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Returns and refunds</h1>
          <p className="mt-1 text-sm text-stone-500">Process returns, exchanges, store credit, replacements, and controlled refunds with approval requirements.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link to="/sales/returns-refunds/new" className="inline-flex min-h-11 items-center justify-center rounded-md bg-burgundy-600 px-4 text-sm font-bold text-white focus-ring">Process return</Link>
          <Link to="/sales/refunds/new" className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-bold text-white focus-ring">Request refund</Link>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Returns</p><p className="mt-2 text-2xl font-bold">{returnRows.length}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Pending refunds</p><p className="mt-2 text-2xl font-bold">{refundRows.filter((item) => item.status === 'pending').length}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Approved refunds</p><p className="mt-2 text-2xl font-bold">{refundRows.filter((item) => item.status === 'approved').length}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Refund value</p><p className="mt-2 text-2xl font-bold">{formatCurrency(refundRows.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</p></article>
      </section>
      <section className="space-y-3">
        <h2 className="font-bold">Returns</h2>
        {returns.status === 'loading' && <SkeletonBlock rows={3} />}
        {returns.status === 'failed' && <ErrorState message={returns.error} onRetry={returns.reload} />}
        {returns.status === 'succeeded' && <ResponsiveTable columns={returnColumns} rows={returnRows} emptyMessage="Return records will appear here." />}
      </section>
      <section className="space-y-3">
        <h2 className="font-bold">Refunds</h2>
        {refunds.status === 'loading' && <SkeletonBlock rows={3} />}
        {refunds.status === 'failed' && <ErrorState message={refunds.error} onRetry={refunds.reload} />}
        {refunds.status === 'succeeded' && <ResponsiveTable columns={refundColumns} rows={refundRows} emptyMessage="Refund requests will appear here." />}
      </section>
      <MessageModal
        open={Boolean(modalError)}
        title="Refund Approval Failed"
        message={modalError}
        onCancel={() => setModalError(null)}
      />
    </div>
  );
}
