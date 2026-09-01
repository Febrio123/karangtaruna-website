import Card from '../ui/Card';
import { formatRupiah } from '../../utils/formatCurrency';

export default function BudgetSummary({ summary }) {
  if (!summary) return null;

  const maxAmount = Math.max(summary.totalIncome, summary.totalExpenses);
  const incomePercent = maxAmount > 0 ? (summary.totalIncome / maxAmount) * 100 : 0;
  const expensePercent = maxAmount > 0 ? (summary.totalExpenses / maxAmount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-caption text-text-secondary font-body mb-1">Pemasukan</p>
          <p className="font-heading text-h3 text-success">{formatRupiah(summary.totalIncome)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-caption text-text-secondary font-body mb-1">Pengeluaran</p>
          <p className="font-heading text-h3 text-danger">{formatRupiah(summary.totalExpenses)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-caption text-text-secondary font-body mb-1">Saldo Akhir</p>
          <p className={`font-heading text-h3 ${summary.balance >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatRupiah(summary.balance)}
          </p>
        </Card>
      </div>

      {/* Bar visualization */}
      <Card>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-caption text-text-secondary font-body mb-1">
              <span>Pemasukan</span>
              <span>{formatRupiah(summary.totalIncome)}</span>
            </div>
            <div className="h-3 bg-bg rounded-sm overflow-hidden">
              <div
                className="h-full bg-success rounded-sm transition-all duration-500"
                style={{ width: `${incomePercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-caption text-text-secondary font-body mb-1">
              <span>Pengeluaran</span>
              <span>{formatRupiah(summary.totalExpenses)}</span>
            </div>
            <div className="h-3 bg-bg rounded-sm overflow-hidden">
              <div
                className="h-full bg-danger rounded-sm transition-all duration-500"
                style={{ width: `${expensePercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
