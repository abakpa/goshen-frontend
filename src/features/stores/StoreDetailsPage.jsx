import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaPen } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function StoreDetailsPage() {
  const { storeId } = useParams();
  const { data, status, error, reload } = useAsyncData(async () => {
    const [storeResult, inventoryResult, salesResult] = await Promise.allSettled([
      api.stores.get(storeId),
      api.inventory.list({ store: storeId, limit: 50 }),
      api.sales.list({ store: storeId, limit: 10 })
    ]);
    if (storeResult.status === 'rejected') throw storeResult.reason;
    const store = storeResult.value;
    const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : [];
    const sales = salesResult.status === 'fulfilled' ? salesResult.value : [];
    return { store, inventory: inventory?.records || inventory || [], sales: sales?.records || sales || [] };
  }, [storeId]);

  const store = data?.store;
  const inventory = data?.inventory || [];
  const sales = data?.sales || [];
  const stockValue = inventory.reduce((sum, item) => sum + (item.availableQuantity || 0) * (item.product?.sellingPrice || 0), 0);
  const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  const staffColumns = [
    { key: 'fullName', header: 'Staff' },
    { key: 'role', header: 'Role', render: (row) => row.role?.name || 'Staff' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const inventoryColumns = [
    { key: 'product', header: 'Product', render: (row) => row.product?.name || 'Product' },
    { key: 'sku', header: 'SKU', render: (row) => row.variation?.sku || row.product?.sku || '-' },
    { key: 'availableQuantity', header: 'Available' },
    { key: 'reservedQuantity', header: 'Reserved' },
    { key: 'damagedQuantity', header: 'Damaged' }
  ];

  const salesColumns = [
    { key: 'saleNumber', header: 'Sale no.' },
    { key: 'staffMember', header: 'Staff', render: (row) => row.staffMember?.fullName || 'Staff' },
    { key: 'totalAmount', header: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'soldAt', header: 'Date', render: (row) => row.soldAt ? new Date(row.soldAt).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/stores" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy-700">
            <FaArrowLeft /> Stores
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{store?.name || 'Store details'}</h1>
          <p className="mt-1 text-sm text-stone-500">{store?.type} {store?.city ? `· ${store.city}` : ''}</p>
        </div>
        {store && (
          <div className="flex gap-2">
            <Link to={`/stores/${store._id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 font-bold focus-ring">
              <FaPen /> Edit
            </Link>
            <Link to={`/stores/${store._id}/reports`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white focus-ring">
              <FaChartLine /> Reports
            </Link>
          </div>
        )}
      </div>

      {status === 'loading' && <SkeletonBlock rows={5} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status === 'succeeded' && store && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Assigned staff" value={store.staffCount || 0} />
            <StatCard label="Recent sales" value={totalSales} currency tone="green" />
            <StatCard label="Stock value" value={stockValue} currency tone="purple" />
            <StatCard label="Inventory items" value={inventory.length} tone="blue" />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <article className="rounded-lg bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold">Store profile</h2>
                <StatusBadge status={store.status} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-stone-500">Code</dt><dd className="mt-1 font-bold">{store.code}</dd></div>
                <div><dt className="text-stone-500">Manager</dt><dd className="mt-1 font-bold">{store.manager?.fullName || 'Not assigned'}</dd></div>
                <div><dt className="text-stone-500">Phone</dt><dd className="mt-1 font-bold">{store.phone || '-'}</dd></div>
                <div><dt className="text-stone-500">Email</dt><dd className="mt-1 font-bold break-words">{store.email || '-'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-stone-500">Address</dt><dd className="mt-1 font-bold">{[store.address, store.city, store.state, store.country].filter(Boolean).join(', ') || '-'}</dd></div>
              </dl>
            </article>
            <article>
              <h2 className="mb-3 font-bold">Assigned staff</h2>
              <ResponsiveTable columns={staffColumns} rows={store.assignedStaff || []} emptyMessage="No staff has been assigned to this store." />
            </article>
          </section>

          <section>
            <h2 className="mb-3 font-bold">Inventory snapshot</h2>
            <ResponsiveTable columns={inventoryColumns} rows={inventory} emptyMessage="No inventory has been received for this store." />
          </section>

          <section>
            <h2 className="mb-3 font-bold">Recent sales</h2>
            <ResponsiveTable columns={salesColumns} rows={sales} emptyMessage="No sales have been recorded for this store." />
          </section>
        </>
      )}
    </div>
  );
}
