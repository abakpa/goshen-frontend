import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function InventoryPage() {
  const { data, status, error, reload } = useAsyncData(() => api.inventory.list({ limit: 50 }), []);
  const inventory = Array.isArray(data) ? data : data?.records || data || [];
  const lowStock = inventory.filter((item) => item.availableQuantity <= item.minimumStockLevel).length;
  const outOfStock = inventory.filter((item) => item.availableQuantity === 0).length;
  const stockValue = inventory.reduce((sum, item) => sum + (item.availableQuantity || 0) * (item.product?.sellingPrice || 0), 0);
  const columns = [
    { key: 'product', header: 'Product', render: (row) => row.product?.name || 'Product' },
    { key: 'store', header: 'Store', render: (row) => row.store?.name || 'Store' },
    { key: 'availableQuantity', header: 'Available' },
    { key: 'reservedQuantity', header: 'Reserved' },
    { key: 'damagedQuantity', header: 'Damaged' }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link to="/inventory/receive" className="inline-flex min-h-11 items-center justify-center rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">Receive stock</Link>
      </div>
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Stock value" value={stockValue} currency />
        <StatCard label="Low stock" value={lowStock} tone="amber" />
        <StatCard label="Out of stock" value={outOfStock} tone="red" />
        <StatCard label="Pending transfers" value={3} tone="blue" />
      </section>
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <h2 className="font-bold">Stock movement history</h2>
        <div className="mt-4">
          {status === 'loading' && <SkeletonBlock rows={4} />}
          {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
          {status === 'succeeded' && <ResponsiveTable columns={columns} rows={inventory} emptyMessage="Inventory records will appear after stock is received." />}
        </div>
      </section>
    </div>
  );
}
