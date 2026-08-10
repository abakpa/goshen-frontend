import EmptyState from '../common/EmptyState.jsx';

export default function ResponsiveTable({ columns, rows, keyField = '_id', emptyMessage }) {
  if (!rows?.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-auto rounded-lg bg-white shadow-soft">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-stone-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[keyField] || index} className="border-b border-stone-100 last:border-0">
              {columns.map((column) => (
                <td key={column.key} className="max-w-[220px] whitespace-nowrap px-4 py-3 align-top">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
