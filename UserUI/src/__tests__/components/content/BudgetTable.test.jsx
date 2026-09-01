import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import BudgetTable from '../../../components/content/BudgetTable';

const mockIncomeData = [
  { date: '2026-01-01', description: 'Iuran anggota bulanan', amount: 750000 },
  { date: '2026-01-15', description: 'Dana kegiatan sosial', amount: 2000000 },
];

const mockExpenseData = [
  { date: '2026-01-05', description: 'Belanja ATK', amount: 150000 },
  { date: '2026-01-10', description: 'Sewa tempat acara', amount: 500000 },
];

describe('BudgetTable Component', () => {
  it('renders table headers', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    expect(screen.getByText('Tanggal')).toBeInTheDocument();
    expect(screen.getByText('Keterangan')).toBeInTheDocument();
    expect(screen.getByText('Jumlah (Rp)')).toBeInTheDocument();
  });

  it('renders income data rows', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    expect(screen.getByText('Iuran anggota bulanan')).toBeInTheDocument();
    expect(screen.getByText('Dana kegiatan sosial')).toBeInTheDocument();
  });

  it('renders expense data rows', () => {
    render(<BudgetTable data={mockExpenseData} type="expense" />);
    expect(screen.getByText('Belanja ATK')).toBeInTheDocument();
    expect(screen.getByText('Sewa tempat acara')).toBeInTheDocument();
  });

  it('calculates and displays total for income', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    expect(screen.getByText(/2\.750\.000/)).toBeInTheDocument();
  });

  it('calculates and displays total for expenses', () => {
    render(<BudgetTable data={mockExpenseData} type="expense" />);
    expect(screen.getByText(/650\.000/)).toBeInTheDocument();
  });

  it('displays Total label in footer', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('formats row amounts individually in tbody', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    const table = screen.getByRole('table');
    const tbody = table.querySelector('tbody');
    expect(within(tbody).getByText(/Rp\s*750\.000/)).toBeInTheDocument();
    expect(within(tbody).getByText(/Rp\s*2\.000\.000/)).toBeInTheDocument();
  });

  it('formats dates correctly in Indonesian', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    expect(screen.getByText(/1 Januari 2026/)).toBeInTheDocument();
  });

  it('renders as an accessible table', () => {
    render(<BudgetTable data={mockIncomeData} type="income" />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
});
