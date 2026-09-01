import { formatRupiah } from '../../utils/formatCurrency';
import { formatDateIndonesian } from '../../utils/formatDate';

export default function BudgetTable({ data, type }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 px-4 font-heading text-body-base font-semibold text-text">
              Tanggal
            </th>
            <th className="py-3 px-4 font-heading text-body-base font-semibold text-text">
              Keterangan
            </th>
            <th className="py-3 px-4 font-heading text-body-base font-semibold text-text text-right">
              Jumlah (Rp)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b border-border-light hover:bg-bg transition-colors duration-150"
            >
              <td className="py-3 px-4 text-caption text-text-secondary">
                {formatDateIndonesian(item.date)}
              </td>
              <td className="py-3 px-4 font-body text-body-base text-text">
                {item.description}
              </td>
              <td
                className={`py-3 px-4 font-body text-body-base text-right font-medium ${
                  type === 'income' ? 'text-success' : 'text-danger'
                }`}
              >
                {formatRupiah(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border font-semibold">
            <td colSpan={2} className="py-3 px-4 font-heading text-body-base text-text">
              Total
            </td>
            <td
              className={`py-3 px-4 font-heading text-body-base text-right ${
                type === 'income' ? 'text-success' : 'text-danger'
              }`}
            >
              {formatRupiah(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
