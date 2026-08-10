import { FaBarcode, FaPrint } from 'react-icons/fa6';
import { useState } from 'react';
import { api } from '../../api/resources.js';

export default function BarcodeLabelsPage() {
  const [barcode, setBarcode] = useState('123456789012');
  const [lookup, setLookup] = useState(null);
  const [error, setError] = useState(null);

  const findBarcode = async () => {
    setError(null);
    try {
      const result = await api.products.lookupBarcode(barcode);
      setLookup(result);
    } catch (err) {
      setLookup(null);
      setError(err.response?.data?.message || 'Barcode not found');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Barcode label printing</h1>
        <p className="mt-1 text-sm text-stone-500">Select a product variation, label quantity, size, store, and visible label fields.</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <form className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Barcode lookup
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input value={barcode} onChange={(event) => setBarcode(event.target.value)} className="min-h-12 flex-1 rounded-md border border-stone-200 px-3 font-normal outline-none focus:border-burgundy-500" />
              <button type="button" onClick={findBarcode} className="min-h-12 rounded-md bg-ink px-4 font-bold text-white focus-ring">Lookup</button>
            </div>
            {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
          </label>
          {['Product', 'Variation', 'Store', 'Label size', 'Number of labels'].map((label) => (
            <label key={label} className="text-sm font-semibold">
              {label}
              <input className="mt-2 min-h-12 w-full rounded-md border border-stone-200 px-3 font-normal outline-none focus:border-burgundy-500" />
            </label>
          ))}
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
            {['Show price', 'Show SKU', 'Show product name'].map((label) => (
              <label key={label} className="flex min-h-12 items-center gap-2 rounded-md border border-stone-200 px-3 text-sm font-semibold">
                <input type="checkbox" className="h-4 w-4" defaultChecked />
                {label}
              </label>
            ))}
          </div>
        </form>
        <aside className="rounded-lg bg-white p-4 shadow-soft">
          <h2 className="font-bold">Preview</h2>
          <div className="mt-4 rounded-md border border-dashed border-stone-300 bg-cream p-4 text-center">
            <FaBarcode className="mx-auto h-16 w-16 text-ink" />
            <p className="mt-3 font-bold">{lookup?.record?.sku || 'GOS-KID-POLO-BLU-06'}</p>
            <p className="text-sm text-stone-500">{lookup?.record?.product?.name || lookup?.record?.name || 'Boys Polo Shirt'} · ₦12,500.00</p>
          </div>
          <button className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">
            <FaPrint /> Print labels
          </button>
        </aside>
      </section>
    </div>
  );
}
