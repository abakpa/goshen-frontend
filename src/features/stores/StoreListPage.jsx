import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function StoreListPage() {
  const { data, status, error, reload } = useAsyncData(() => api.stores.list({ limit: 50 }), []);
  const stores = Array.isArray(data) ? data : data?.records || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="mt-1 text-sm text-stone-500">Unlimited physical branches, warehouses, and fulfilment locations.</p>
        </div>
        <Link to="/stores/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">
          <FaPlus /> Add store
        </Link>
      </div>
      {status === 'loading' && <SkeletonBlock rows={3} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && stores.length === 0 && <EmptyState title="No stores yet" message="Create the first branch, warehouse, or fulfilment location." />}
      {status === 'succeeded' && stores.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <article key={store._id || store.code} className="rounded-lg bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">{store.name}</h2>
                <p className="mt-1 text-sm text-stone-500">{store.type} · {store.city}</p>
              </div>
              <StatusBadge status={store.status} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-cream p-3">
                <dt className="text-stone-500">Code</dt>
                <dd className="mt-1 font-bold">{store.code}</dd>
              </div>
              <div className="rounded-md bg-cream p-3">
                <dt className="text-stone-500">Staff</dt>
                <dd className="mt-1 font-bold">{store.staffCount || 0} assigned</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Link to={`/stores/${store._id}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-stone-200 px-3 font-semibold focus-ring">Details</Link>
              <Link to={`/stores/${store._id}/reports`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-ink px-3 font-semibold text-white focus-ring">Reports</Link>
            </div>
          </article>
        ))}
      </div>}
    </div>
  );
}
