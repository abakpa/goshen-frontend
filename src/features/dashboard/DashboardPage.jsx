import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FaMoneyBillTrendUp, FaReceipt, FaShop, FaTriangleExclamation, FaUsers } from 'react-icons/fa6';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

const salesTrend = [
  { day: 'Mon', sales: 280000 },
  { day: 'Tue', sales: 355000 },
  { day: 'Wed', sales: 420000 },
  { day: 'Thu', sales: 390000 },
  { day: 'Fri', sales: 510000 },
  { day: 'Sat', sales: 720000 },
  { day: 'Sun', sales: 310000 }
];

const storeSales = [
  { name: 'Men', value: 1380000 },
  { name: 'Kids', value: 920000 },
  { name: 'Online', value: 610000 }
];

const paymentMix = [
  { name: 'Cash', value: 35, color: '#10b981' },
  { name: 'Transfer', value: 42, color: '#2563eb' },
  { name: 'POS', value: 18, color: '#8f1d3f' },
  { name: 'Credit', value: 5, color: '#f59e0b' }
];

export default function DashboardPage() {
  const { data, status, error, reload } = useAsyncData(() => api.dashboard.owner(), []);
  const sales = data?.sales || {};
  const inventory = data?.inventory || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-burgundy-600">Admin dashboard</p>
          <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">Goshen Collection overview</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select className="min-h-11 rounded-md border border-stone-200 bg-white px-3 text-sm focus-ring">
            <option>All stores</option>
            <option>Men's Clothing Store</option>
            <option>Kids' Clothing Store</option>
          </select>
          <input className="min-h-11 rounded-md border border-stone-200 bg-white px-3 text-sm focus-ring" type="date" />
        </div>
      </div>
      {status === 'loading' && <SkeletonBlock rows={2} />}
      {status === 'failed' && <ErrorState message={error} onRetry={reload} />}
      {status !== 'failed' && (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Income collected" value={sales.income || 0} currency icon={FaMoneyBillTrendUp} tone="green" />
          <StatCard label="Gross profit" value={sales.grossProfit || 0} currency icon={FaReceipt} tone="purple" />
          <StatCard label="Outstanding debt" value={sales.outstandingDebt || 0} currency icon={FaUsers} tone="amber" />
          <StatCard label="Low stock items" value={inventory.lowStockCount || 0} icon={FaTriangleExclamation} tone="red" />
        </section>
      )}
      {status !== 'failed' && (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Total sales value" value={sales.totalSales || 0} currency />
          <StatCard label="Physical sales" value={sales.physicalSales || 0} currency />
          <StatCard label="Online sales" value={sales.onlineSales || 0} currency />
          <StatCard label="Estimated net profit" value={sales.estimatedNetProfit || 0} currency tone={(sales.estimatedNetProfit || 0) >= 0 ? 'green' : 'red'} />
        </section>
      )}
      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Weekly sales</h2>
            <FaShop className="text-burgundy-600" />
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee7dc" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `₦${value / 1000}k`} width={64} />
                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#8f1d3f" fill="#f6dce6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-soft">
          <h2 className="text-base font-bold">Payment method distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={96} paddingAngle={3}>
                  {paymentMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <h2 className="text-base font-bold">Sales by store and channel</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={storeSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee7dc" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₦${value / 1000}k`} width={64} />
              <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Sales']} />
              <Bar dataKey="value" fill="#b98a2f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
