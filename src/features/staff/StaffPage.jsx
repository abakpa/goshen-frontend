import ModulePage from '../../components/common/ModulePage.jsx';
import { Link } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function StaffPage() {
  const { data, status, error, reload } = useAsyncData(() => api.staff.list({ limit: 50 }), []);
  const roles = useAsyncData(() => api.staff.roles({ limit: 100 }), []);
  const staff = data?.records || data || [];
  const roleRows = roles.data?.records || roles.data || [];
  const columns = [
    { key: 'fullName', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (row) => row.role?.name || 'Unassigned' },
    { key: 'assignedStores', header: 'Stores', render: (row) => row.assignedStores?.length || 0 },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];
  const roleColumns = [
    { key: 'name', header: 'Role' },
    { key: 'permissions', header: 'Permissions', render: (row) => row.permissions?.includes('system:*') ? 'Full access' : row.permissions?.length || 0 },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'action', header: 'Action', render: (row) => <Link className="font-bold text-burgundy-700" to={`/staff/roles/${row._id}/edit`}>Edit</Link> }
  ];

  return (
    <div className="space-y-5">
      <ModulePage
        title="Staff, roles, and activity"
        description="Create staff accounts, assign stores, configure custom roles, and track every important action in the audit trail."
        actions={[{ label: 'Add staff', to: '/staff/new' }, { label: 'Create role', to: '/staff/roles/new' }]}
        metrics={[
          { label: 'Loaded staff', value: staff.length },
          { label: 'Active staff', value: staff.filter((item) => item.status === 'active').length },
          { label: 'Assigned to stores', value: staff.filter((item) => item.assignedStores?.length).length },
          { label: 'Roles', value: roleRows.length }
        ]}
        sections={[]}
      />
      {status === 'loading' && <SkeletonBlock rows={4} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && <ResponsiveTable columns={columns} rows={staff} emptyMessage="Staff records will appear here." />}
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-bold">Roles and permissions</h2>
        </div>
        {roles.status === 'loading' && <SkeletonBlock rows={3} />}
        {roles.status === 'failed' && <ErrorState message={roles.error} onRetry={roles.reload} />}
        {roles.status === 'succeeded' && <ResponsiveTable columns={roleColumns} rows={roleRows} emptyMessage="Roles will appear here." />}
      </section>
    </div>
  );
}
