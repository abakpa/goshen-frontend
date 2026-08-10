import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import MessageModal from '../../components/common/MessageModal.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatCurrency } from '../../utils/currency.js';

export default function SalesApprovalDetailsPage() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Rejected by Admin');
  const { data, status, error, reload } = useAsyncData(() => api.sales.get(saleId), [saleId]);
  const sale = data?.sale;

  const approve = async () => {
    setServerError(null);
    setSubmitting(true);
    try {
      await api.sales.approve(saleId);
      navigate('/sales/approvals');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to approve sale');
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    setServerError(null);
    setSubmitting(true);
    try {
      await api.sales.reject(saleId, { reason: rejectionReason || 'Rejected by Admin' });
      navigate('/sales/approvals');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to reject sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <SkeletonBlock rows={5} />;
  if (status === 'failed') return <ErrorState message={error} onRetry={reload} />;
  if (!sale) return <ErrorState message="Sale not found." onRetry={() => navigate('/sales/approvals')} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/sales/approvals" className="text-sm font-bold text-burgundy-700">Back to approvals</Link>
          <h1 className="mt-2 text-2xl font-bold">Review sale approval</h1>
          <p className="mt-1 text-sm text-stone-500">{sale.saleNumber} submitted by {sale.staffMember?.fullName || 'Staff'}.</p>
        </div>
        <StatusBadge status={sale.status} />
      </div>
      <FormAlert message={serverError} />
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="min-w-0 rounded-lg bg-white p-3 shadow-soft sm:p-4">
          <p className="text-xs font-bold uppercase text-stone-500">Staff</p>
          <p className="mt-2 break-words font-bold">{sale.staffMember?.fullName || 'Staff'}</p>
        </div>
        <div className="min-w-0 rounded-lg bg-white p-3 shadow-soft sm:p-4">
          <p className="text-xs font-bold uppercase text-stone-500">Store</p>
          <p className="mt-2 break-words font-bold">{sale.store?.name || 'Store'}</p>
        </div>
        <div className="min-w-0 rounded-lg bg-white p-3 shadow-soft sm:p-4">
          <p className="text-xs font-bold uppercase text-stone-500">Sold total</p>
          <p className="mt-2 break-words font-bold">{formatCurrency(sale.totalAmount)}</p>
        </div>
        <div className="min-w-0 rounded-lg bg-white p-3 shadow-soft sm:p-4">
          <p className="text-xs font-bold uppercase text-stone-500">Total difference</p>
          <p className={`mt-2 break-words font-bold ${Number(sale.grossProfit || 0) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatCurrency(sale.grossProfit)}</p>
        </div>
      </section>
      <section className="min-w-0 overflow-hidden rounded-lg bg-white shadow-soft">
        <div className="p-4">
          <h2 className="font-bold">Sale items</h2>
          <p className="mt-1 text-xs font-semibold text-stone-500 sm:hidden">Swipe left to view all columns.</p>
        </div>
        <div className="w-full overflow-x-auto overscroll-x-contain">
          {(sale.items || []).length === 0 ? (
            <p className="mx-4 mb-4 rounded-md bg-cream p-4 text-sm text-stone-500">No sale items found.</p>
          ) : (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-cream text-xs uppercase text-stone-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Product</th>
                  <th className="whitespace-nowrap px-4 py-3">Variation</th>
                  <th className="whitespace-nowrap px-4 py-3">Qty</th>
                  <th className="whitespace-nowrap px-4 py-3">Cost price</th>
                  <th className="whitespace-nowrap px-4 py-3">Selling price</th>
                  <th className="whitespace-nowrap px-4 py-3">Difference</th>
                  <th className="whitespace-nowrap px-4 py-3">Line difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white text-ink">
                {sale.items.map((item, index) => (
                  <tr key={`${item.product}-${item.variation || index}`} className="table-row bg-white">
                    <td className="max-w-[180px] whitespace-nowrap px-4 py-3 font-semibold text-ink">{item.productName || 'Product'}</td>
                    <td className="max-w-[180px] whitespace-nowrap px-4 py-3">{item.variationLabel || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{item.quantity || 0}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{formatCurrency(item.unitCost || 0)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{formatCurrency(item.unitPrice || 0)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{formatCurrency((item.unitPrice || 0) - (item.unitCost || 0))}</td>
                    <td className={`whitespace-nowrap px-4 py-3 font-bold ${Number(item.lineProfit || 0) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatCurrency(item.lineProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <div className="flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:sticky lg:bottom-0">
        <button type="button" onClick={() => setRejectModalOpen(true)} disabled={submitting || sale.status !== 'pending-approval'} className="min-h-11 rounded-md bg-red-600 px-5 font-bold text-white focus-ring disabled:opacity-60">Reject</button>
        <button type="button" onClick={approve} disabled={submitting || sale.status !== 'pending-approval'} className="min-h-11 rounded-md bg-emerald-600 px-5 font-bold text-white focus-ring disabled:opacity-60">Approve</button>
      </div>
      <MessageModal
        open={rejectModalOpen}
        title="Reject Sale"
        message="Enter the reason this sale should not be approved."
        confirmLabel="Reject sale"
        cancelLabel="Cancel"
        tone="danger"
        submitting={submitting}
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={reject}
      >
        <label className="block text-sm font-semibold">
          Rejection reason
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-stone-200 px-3 py-3 font-normal outline-none focus:border-burgundy-500"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
        </label>
      </MessageModal>
    </div>
  );
}
