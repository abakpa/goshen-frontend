import { Link } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function SalesApprovalsPage() {
  const { data, status, error, reload } = useAsyncData(() => api.sales.list({ status: 'pending-approval', limit: 100 }), []);
  const approvals = data?.records || [];

  const columns = [
    { key: 'saleNumber', header: 'Sale number' },
    { key: 'staffMember', header: 'Staff', render: (row) => row.staffMember?.fullName || 'Staff' },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || 'Store' },
    { key: 'totalAmount', header: 'Sold total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'grossProfit', header: 'Difference', render: (row) => formatCurrency(row.grossProfit) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'action', header: 'Action', render: (row) => <Link className="font-bold text-burgundy-700" to={`/sales/approvals/${row._id}`}>Review</Link> }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sales approvals</h1>
        <p className="mt-1 text-sm text-stone-500">Review below-cost sales submitted by staff before stock is deducted and receipts are issued.</p>
      </div>
      {status === 'loading' && <SkeletonBlock rows={5} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={approvals} emptyMessage="Pending sales approvals will appear here." />}
    </div>
  );
}
