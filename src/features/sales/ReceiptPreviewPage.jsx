import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaPrint, FaRotateRight } from 'react-icons/fa6';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function ReceiptPreviewPage() {
  const { saleId } = useParams();
  const receiptRef = useRef(null);
  const [message, setMessage] = useState(null);
  const { data, status, error, reload } = useAsyncData(() => api.sales.receipt(saleId), [saleId]);
  const sale = data?.sale;
  const receipt = data?.receipt;

  const printReceipt = () => {
    window.print();
  };

  const reprint = async () => {
    setMessage(null);
    await api.sales.reprintReceipt(saleId);
    setMessage('Receipt reprint recorded');
    reload();
  };

  if (status === 'loading') return <SkeletonBlock rows={5} />;
  if (status === 'failed') return <ErrorState message={error} onRetry={reload} />;
  if (!sale || !receipt) return <ErrorState message="Receipt data is unavailable" onRetry={reload} />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Receipt preview</h1>
          <p className="mt-1 text-sm text-stone-500">{sale.receiptNumber}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link to="/sales/history" className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-200 bg-white px-4 font-bold focus-ring">History</Link>
          <button onClick={reprint} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white focus-ring"><FaRotateRight /> Reprint</button>
          <button onClick={printReceipt} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring"><FaPrint /> Print</button>
        </div>
      </div>
      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 print:hidden">{message}</p>}
      <section ref={receiptRef} className="mx-auto max-w-sm rounded-lg bg-white p-5 shadow-soft print:shadow-none">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-burgundy-700 text-lg font-bold text-gold">GC</div>
          <h2 className="mt-3 text-lg font-bold">GOSHEN COLLECTION</h2>
          <p className="text-xs text-stone-500">{sale.store?.name}</p>
          <p className="text-xs text-stone-500">{sale.store?.address || sale.store?.city || 'Nigeria'}</p>
        </div>
        <div className="mt-4 border-y border-dashed border-stone-300 py-3 text-xs">
          <div className="flex justify-between"><span>Receipt</span><strong>{sale.receiptNumber}</strong></div>
          <div className="flex justify-between"><span>Sale</span><strong>{sale.saleNumber}</strong></div>
          <div className="flex justify-between"><span>Date</span><strong>{new Date(sale.soldAt).toLocaleString()}</strong></div>
          <div className="flex justify-between"><span>Staff</span><strong>{sale.staffMember?.fullName}</strong></div>
          <div className="flex justify-between gap-3"><span>Customer name</span><strong className="text-right">{sale.customer?.fullName || 'Walk-in'}</strong></div>
          <div className="flex justify-between gap-3"><span>Customer phone</span><strong className="text-right">{sale.customer?.phone || 'Not provided'}</strong></div>
        </div>
        <div className="mt-4 space-y-3">
          {sale.items.map((item) => (
            <div key={`${item.product}-${item.variation || item.productName}`} className="text-sm">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-xs text-stone-500">{item.variationLabel}</p>
                  <p className="text-xs text-stone-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                </div>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-dashed border-stone-300 pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(sale.subtotal)}</strong></div>
          <div className="flex justify-between"><span>Discount</span><strong>{formatCurrency(sale.discount)}</strong></div>
          <div className="flex justify-between"><span>Tax</span><strong>{formatCurrency(sale.tax)}</strong></div>
          <div className="flex justify-between text-base"><span>Total</span><strong>{formatCurrency(sale.totalAmount)}</strong></div>
          <div className="flex justify-between"><span>Paid</span><strong>{formatCurrency(sale.amountPaid)}</strong></div>
          <div className="flex justify-between"><span>Outstanding</span><strong>{formatCurrency(sale.outstandingBalance)}</strong></div>
          <div className="flex justify-between"><span>Change</span><strong>{formatCurrency(sale.change)}</strong></div>
        </div>
        <div className="mt-4 flex justify-center">
          <QRCodeCanvas value={receipt.verificationCode} size={88} />
        </div>
        <p className="mt-3 text-center text-xs text-stone-500">Thank you for shopping with GOSHEN COLLECTION.</p>
        <p className="mt-1 text-center text-[11px] text-stone-400">Reprints: {receipt.reprintCount}</p>
      </section>
    </div>
  );
}
