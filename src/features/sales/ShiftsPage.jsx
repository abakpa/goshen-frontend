import { Link } from 'react-router-dom';
import ModulePage from '../../components/common/ModulePage.jsx';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-');

export default function ShiftsPage() {
  const { data, status, error, reload } = useAsyncData(() => api.shifts.list({ limit: 50 }), []);
  const shifts = data?.records || data || [];
  const openShifts = shifts.filter((shift) => shift.status === 'open');
  const shortages = shifts
    .filter((shift) => Number(shift.cashDifference || 0) < 0)
    .reduce((sum, shift) => sum + Math.abs(Number(shift.cashDifference || 0)), 0);
  const overages = shifts
    .filter((shift) => Number(shift.cashDifference || 0) > 0)
    .reduce((sum, shift) => sum + Number(shift.cashDifference || 0), 0);

  const columns = [
    { key: 'staffMember', header: 'Staff', render: (row) => row.staffMember?.fullName || '-' },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || '-' },
    { key: 'openedAt', header: 'Opened', render: (row) => formatDateTime(row.openedAt) },
    { key: 'openingCash', header: 'Opening cash', render: (row) => formatCurrency(row.openingCash) },
    { key: 'actualCash', header: 'Actual cash', render: (row) => row.status === 'closed' ? formatCurrency(row.actualCash) : '-' },
    { key: 'cashDifference', header: 'Difference', render: (row) => row.status === 'closed' ? formatCurrency(row.cashDifference) : '-' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'action',
      header: 'Action',
      render: (row) => row.status === 'open'
        ? <Link className="font-bold text-burgundy-700" to={`/sales/shifts/${row._id}/close`}>Close</Link>
        : <span className="text-stone-400">Closed</span>
    }
  ];

  return (
    <div className="space-y-5">
      <ModulePage
        title="Sales shifts"
        description="Open and close sales shifts with cash reconciliation, payment breakdown, refunds, shortages, overages, and staff history."
        actions={[{ label: 'Open shift', to: '/sales/shifts/open' }]}
        metrics={[
          { label: 'Loaded shifts', value: shifts.length },
          { label: 'Open shifts', value: openShifts.length },
          { label: 'Shortages', value: formatCurrency(shortages) },
          { label: 'Overages', value: formatCurrency(overages) }
        ]}
        sections={[]}
      />
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={shifts} emptyMessage="Open shifts will appear here." />}
    </div>
  );
}
