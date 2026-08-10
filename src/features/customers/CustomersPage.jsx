import ModulePage from '../../components/common/ModulePage.jsx';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function CustomersPage() {
  const { data, status, error, reload } = useAsyncData(() => api.customers.list({ limit: 50 }), []);
  const customers = data?.records || data || [];
  const columns = [
    { key: 'fullName', header: 'Customer' },
    { key: 'phone', header: 'Phone' },
    { key: 'customerType', header: 'Type' },
    { key: 'currentDebt', header: 'Debt', render: (row) => `₦${Number(row.currentDebt || 0).toLocaleString()}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-5">
      <ModulePage
        title="Customers"
        description="Customer profiles track contact details, credit eligibility, purchase history, payment history, return history, preferred store, and preferred online platform."
        actions={[{ label: 'Add customer', to: '/customers/new' }, 'Import CSV']}
        metrics={[
          { label: 'Loaded customers', value: customers.length },
          { label: 'Credit customers', value: customers.filter((item) => item.customerType === 'credit').length },
          { label: 'Online customers', value: customers.filter((item) => item.customerType === 'online').length },
          { label: 'Duplicates blocked', value: 'Phone/email' }
        ]}
        sections={[]}
      />
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={customers} emptyMessage="Customer records will appear here." />}
    </div>
  );
}
