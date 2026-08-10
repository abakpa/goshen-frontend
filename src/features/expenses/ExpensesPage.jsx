import ModulePage from '../../components/common/ModulePage.jsx';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function ExpensesPage() {
  const { data, status, error, reload } = useAsyncData(() => api.expenses.list({ limit: 50 }), []);
  const expenses = data?.records || data || [];
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const columns = [
    { key: 'expenseNumber', header: 'Number' },
    { key: 'category', header: 'Category' },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || 'Business-wide' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-5">
      <ModulePage
        title="Expenses"
        description="Record store and business-wide expenses with approval status, payment method, receipt attachment, and category reporting."
        actions={[{ label: 'Add expense', to: '/expenses/new' }, 'Export']}
        metrics={[
          { label: 'Loaded expenses', value: expenses.length },
          { label: 'Total listed', value: formatCurrency(total) },
          { label: 'Pending approval', value: expenses.filter((item) => item.status === 'pending').length },
          { label: 'Approved', value: expenses.filter((item) => item.status === 'approved').length }
        ]}
        sections={[]}
      />
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={expenses} emptyMessage="Expense records will appear here." />}
    </div>
  );
}
