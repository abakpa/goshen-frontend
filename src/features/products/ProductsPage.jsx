import { Link } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function ProductsPage() {
  const { data, status, error, reload } = useAsyncData(() => api.products.list({ limit: 50 }), []);
  const products = Array.isArray(data) ? data : data?.records || [];
  const columns = [
    { key: 'name', header: 'Product' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category', render: (row) => row.category?.name || 'Unassigned' },
    { key: 'sellingPrice', header: 'Guide price', render: (row) => row.sellingPrice ? formatCurrency(row.sellingPrice) : 'Set at sale' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="min-w-0 space-y-5">
      <h1 className="text-2xl font-bold">Products and variations</h1>
      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 rounded-lg bg-white p-4 shadow-soft">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <input className="min-h-12 min-w-0 flex-1 rounded-md border border-stone-200 px-3 outline-none focus:border-burgundy-500" placeholder="Search by name, SKU, barcode" />
            <Link to="/products/new" className="inline-flex min-h-12 items-center justify-center rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">Add product</Link>
          </div>
          <div className="mt-5 min-w-0">
            {status === 'loading' && <SkeletonBlock rows={4} />}
            {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
            {status === 'succeeded' && <ResponsiveTable columns={columns} rows={products} emptyMessage="Products will appear here after they are created." />}
          </div>
        </div>
        <aside className="min-w-0 rounded-lg bg-ink p-4 text-white shadow-soft">
          <h2 className="font-bold">Barcode tools</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">Generation, camera scanning, duplicate scan handling, and label printing are staged for the inventory module.</p>
          <div className="mt-4 grid gap-2">
            <Link to="/products/barcodes" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-gold px-4 font-bold text-ink focus-ring">Print labels</Link>
            <Link to="/products/variations/new" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-white/10 px-4 font-bold text-white focus-ring">Add variation</Link>
            <Link to="/products/categories/new" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-white/10 px-4 font-bold text-white focus-ring">Add category</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
