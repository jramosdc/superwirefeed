// Render parsed CSV rows as a table. Replaces viewpost.displayTable (which built
// the DOM by hand). First row is treated as the header.
export function CsvTable({ rows }: { rows: string[][] }) {
  if (!rows || rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            {header.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className={r % 2 ? "bg-slate-50" : ""}>
              {row.map((cell, c) => (
                <td key={c} className="whitespace-nowrap px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
