import ModulePage from '../../components/common/ModulePage.jsx';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function CreditSalesPage() {
  const { data, status, error, reload } = useAsyncData(() => api.credit.debtors(), []);
  const debtors = Array.isArray(data) ? data : [];
  const totalDebt = debtors.reduce((sum, item) => sum + Math.max(item.outstandingBalance || 0, 0), 0);
  const columns = [
    { key: 'creditInvoiceNumber', header: 'Invoice' },
    { key: 'customerName', header: 'Customer', render: (row) => row.customerName || 'Customer' },
    { key: 'storeName', header: 'Store', render: (row) => row.storeName || 'Store' },
    { key: 'totalAmount', header: 'Original', render: (row) => `₦${Number(row.totalAmount || 0).toLocaleString()}` },
    { key: 'amountPaid', header: 'Paid', render: (row) => `₦${Number(row.amountPaid || 0).toLocaleString()}` },
    { key: 'outstandingBalance', header: 'Balance', render: (row) => `₦${Number(row.outstandingBalance || 0).toLocaleString()}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-5">
      <ModulePage
        title="Credit and debtors"
        description="Track credit invoices, instalment payments, outstanding balances, overdue accounts, and debtor statements without allowing users to overwrite balances manually."
        actions={[{ label: 'Record payment', to: '/credit-sales/payments/new' }, { label: 'Create credit sale', to: '/credit-sales/new' }]}
        metrics={[
          { label: 'Outstanding debt', value: `₦${totalDebt.toLocaleString()}` },
          { label: 'Overdue debts', value: debtors.filter((item) => item.status === 'overdue').length },
          { label: 'Active debtors', value: debtors.length },
          { label: 'Balance source', value: 'Payments' }
        ]}
        sections={[]}
      />
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={debtors} emptyMessage="Debtor records will appear here." />}
    </div>
  );
}
