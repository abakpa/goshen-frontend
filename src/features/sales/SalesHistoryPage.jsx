import { Link } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function SalesHistoryPage() {
  const { data, status, error, reload } = useAsyncData(() => api.sales.list({ limit: 50 }), []);
  const sales = data?.records || [];

  const columns = [
    { key: 'saleNumber', header: 'Sale number' },
    { key: 'receiptNumber', header: 'Receipt' },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || 'Store' },
    { key: 'totalAmount', header: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        if (row.status === 'pending-approval') return <span className="text-sm font-semibold text-amber-700">Awaiting Admin</span>;
        if (row.status === 'rejected') return <span className="text-sm font-semibold text-red-700">Rejected</span>;
        return <Link className="font-bold text-burgundy-600" to={`/sales/${row._id}/receipt`}>Receipt</Link>;
      }
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales history</h1>
          <p className="mt-1 text-sm text-stone-500">Review completed sales, payment status, receipts, and reprint history.</p>
        </div>
        <Link to="/sales/pos" className="inline-flex min-h-11 items-center justify-center rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">Open POS</Link>
      </div>
      {status === 'loading' && <SkeletonBlock rows={5} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={sales} emptyMessage="Sales will appear here after checkout." />}
    </div>
  );
}
