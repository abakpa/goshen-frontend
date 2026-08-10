import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import ResponsiveTable from '../../components/tables/ResponsiveTable.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { downloadCsv } from '../../utils/exportCsv.js';
import { formatCurrency } from '../../utils/currency.js';

const reportTabs = [
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'credit', label: 'Credit' }
];

function normalizeRows(type, data) {
  if (type === 'sales') {
    return (data || []).map((row) => ({
      store: row._id?.store || 'All stores',
      channel: row._id?.channel || 'physical',
      count: row.count,
      total: row.total,
      income: row.income,
      grossProfit: row.grossProfit,
      debt: row.debt
    }));
  }
  if (type === 'expenses') {
    return (data || []).map((row) => ({
      store: row._id?.store || 'Business-wide',
      category: row._id?.category || 'Uncategorized',
      count: row.count,
      total: row.total
    }));
  }
  if (type === 'inventory') {
    return (data || []).map((row) => ({
      store: row.store?.name || 'Store',
      product: row.product?.name || 'Product',
      sku: row.variation?.sku || row.product?.sku,
      available: row.availableQuantity,
      reserved: row.reservedQuantity,
      damaged: row.damagedQuantity,
      value: (row.availableQuantity || 0) * (row.product?.sellingPrice || 0)
    }));
  }
  return (data || []).map((row) => ({
    invoice: row.creditInvoiceNumber,
    customer: row.customer?.fullName || 'Customer',
    store: row.store?.name || 'Store',
    amount: row.totalAmount,
    initialDeposit: row.initialDeposit,
    dueDate: row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '',
    status: row.status
  }));
}

export default function ReportsPage() {
  const { storeId } = useParams();
  const [activeReport, setActiveReport] = useState('sales');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', store: storeId || '' });
  const stores = useAsyncData(() => api.stores.list({ limit: 100 }), []);
  const report = useAsyncData(() => api.reports[activeReport](filters), [activeReport, filters.startDate, filters.endDate, filters.store]);
  const storeRows = stores.data?.records || stores.data || [];
  const selectedStore = storeRows.find((store) => store._id === storeId);
  const rows = useMemo(() => normalizeRows(activeReport, report.data), [activeReport, report.data]);

  const columns = {
    sales: [
      { key: 'channel', header: 'Channel' },
      { key: 'count', header: 'Transactions' },
      { key: 'total', header: 'Total', render: (row) => formatCurrency(row.total) },
      { key: 'income', header: 'Income', render: (row) => formatCurrency(row.income) },
      { key: 'grossProfit', header: 'Gross profit', render: (row) => formatCurrency(row.grossProfit) },
      { key: 'debt', header: 'Debt', render: (row) => formatCurrency(row.debt) }
    ],
    inventory: [
      { key: 'store', header: 'Store' },
      { key: 'product', header: 'Product' },
      { key: 'sku', header: 'SKU' },
      { key: 'available', header: 'Available' },
      { key: 'damaged', header: 'Damaged' },
      { key: 'value', header: 'Value', render: (row) => formatCurrency(row.value) }
    ],
    expenses: [
      { key: 'category', header: 'Category' },
      { key: 'count', header: 'Count' },
      { key: 'total', header: 'Total', render: (row) => formatCurrency(row.total) }
    ],
    credit: [
      { key: 'invoice', header: 'Invoice' },
      { key: 'customer', header: 'Customer' },
      { key: 'store', header: 'Store' },
      { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
      { key: 'dueDate', header: 'Due date' },
      { key: 'status', header: 'Status' }
    ]
  };

  const exportRows = rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === 'number' ? value : value || '']))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {storeId && (
            <Link to={`/stores/${storeId}`} className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-burgundy-700">
              <FaArrowLeft /> Store details
            </Link>
          )}
          <h1 className="text-2xl font-bold">{storeId ? `${selectedStore?.name || 'Store'} reports` : 'Reports'}</h1>
          <p className="mt-1 text-sm text-stone-500">Filter and export key sales, inventory, expense, and credit reports.</p>
        </div>
        <button onClick={() => downloadCsv(`${activeReport}-report.csv`, exportRows)} disabled={!rows.length} className="min-h-11 rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring disabled:opacity-50">Export CSV</button>
      </div>
      <section className={`grid gap-3 rounded-lg bg-white p-4 shadow-soft ${storeId ? 'lg:grid-cols-3' : 'lg:grid-cols-[1fr_1fr_1fr_1fr]'}`}>
        <SelectField label="Report" value={activeReport} onChange={(event) => setActiveReport(event.target.value)}>
          {reportTabs.map((tab) => <option key={tab.key} value={tab.key}>{tab.label}</option>)}
        </SelectField>
        <TextField label="Start date" type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} />
        <TextField label="End date" type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} />
        {!storeId && (
          <SelectField label="Store" value={filters.store} onChange={(event) => setFilters((current) => ({ ...current, store: event.target.value }))}>
            <option value="">All stores</option>
            {storeRows.map((store) => <option key={store._id} value={store._id}>{store.name}</option>)}
          </SelectField>
        )}
      </section>
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Rows</p><p className="mt-2 text-2xl font-bold">{rows.length}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Report</p><p className="mt-2 text-2xl font-bold capitalize">{activeReport}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Stores</p><p className="mt-2 text-2xl font-bold">{filters.store ? 1 : 'All'}</p></article>
        <article className="rounded-lg bg-white p-4 shadow-soft"><p className="text-sm text-stone-500">Export</p><p className="mt-2 text-2xl font-bold">CSV</p></article>
      </section>
      {stores.status === 'failed' && <ErrorState message={stores.error} onRetry={stores.reload} />}
      {report.status === 'loading' && <SkeletonBlock rows={5} />}
      {report.status === 'failed' && <ErrorState message={report.error} onRetry={report.reload} />}
      {report.status === 'succeeded' && <ResponsiveTable columns={columns[activeReport]} rows={rows} keyField="invoice" emptyMessage="No report data matches these filters." />}
    </div>
  );
}
