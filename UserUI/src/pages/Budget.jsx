import { useState, useRef, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import heroImg from '../assets/hero1.png';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import BudgetSummary from '../components/special/BudgetSummary';
import BudgetTable from '../components/content/BudgetTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBanner from '../components/ui/ErrorBanner';
import EmptyState from '../components/ui/EmptyState';
import useApiData from '../hooks/useApiData';
import { adaptBudgetSummaryRaw, adaptTransaksiToBudget } from '../lib/adapters';
import { budgetData as staticBudget } from '../data/budget';
import useSeo from '../hooks/useSeo';

// Tahun yang tersedia: dari data statis + tahun yang ditemukan saat fetch.
const staticYears = Object.keys(staticBudget)
  .map(Number)
  .sort((a, b) => b - a);

// Hitung ringkasan dari baris transaksi (fallback bila endpoint ringkasan gagal).
function deriveSummaryFromTransaksi(data, year) {
  const income = data?.income || [];
  const expenses = data?.expenses || [];
  const totalIncome = income.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  return {
    year,
    period: `Periode tahun ${year}`,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    incomeCount: income.length,
    expenseCount: expenses.length,
  };
}

export default function Budget() {
  const [selectedYear, setSelectedYear] = useState(staticYears[0]);

  // Ringkasan (total/saldo/perBulan/perKategori) dari endpoint ringkasan.
  const summaryApi = useApiData({
    url: `/transaksi-anggaran/ringkasan?tahun=${selectedYear}`,
    fallback: () => {
      const d = staticBudget[selectedYear];
      return d
        ? {
            tahun: d.year,
            totalIncome: d.income.reduce((s, i) => s + i.amount, 0),
            totalExpenses: d.expenses.reduce((s, i) => s + i.amount, 0),
            balance: d.income.reduce((s, i) => s + i.amount, 0) - d.expenses.reduce((s, i) => s + i.amount, 0),
            incomeCount: d.income.length,
            expenseCount: d.expenses.length,
          }
        : null;
    },
    adapter: (raw) => {
      if (!raw) return null;
      return {
        tahun: raw.tahun,
        totalIncome: Number(raw.totalPemasukan) || 0,
        totalExpenses: Number(raw.totalPengeluaran) || 0,
        balance: Number(raw.saldo) || 0,
        incomeCount: Number(raw.jumlahPemasukan) || 0,
        expenseCount: Number(raw.jumlahPengeluaran) || 0,
        perBulan: raw.perBulan,
        perKategori: raw.perKategori,
      };
    },
  });

  // Detail baris (untuk tabel Pemasukan/Pengeluaran) dari endpoint list.
  const transaksi = useApiData({
    url: `/transaksi-anggaran?tahun=${selectedYear}&limit=100`,
    fallback: () => {
      const d = staticBudget[selectedYear];
      return d ? { income: d.income, expenses: d.expenses } : { income: [], expenses: [] };
    },
    adapter: adaptTransaksiToBudget,
  });

  useSeo({
    title: 'Transparansi Keuangan',
    description: 'Laporan pemasukan dan pengeluaran kas Karang Taruna Mangga Dua Selatan untuk transparansi anggaran organisasi.',
    path: '/anggaran',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Anggaran' },
        ],
      },
    ],
  });
  const [activeTab, setActiveTab] = useState('income');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Deret tahun yang tersedia = gabungan statis + tahun live (dari transaksi).
  const years = useMemo(() => {
    const set = new Set(staticYears);
    (transaksi.data?.income || []).forEach((r) => {});
    const liveYears = [];
    // Transaksi tidak membawa tahun per baris; cukup pakai tahun statis,
    // dan tambahkan tahun dari summary ringkasan bila berbeda.
    if (summaryApi.data?.tahun) set.add(summaryApi.data.tahun);
    return [...set].sort((a, b) => b - a);
  }, [summaryApi.data, transaksi.data, staticYears]);

  // Ringkasan: pakai live ringkasan; fallback derive dari baris transaksi.
  const summary = summaryApi.data
    ? {
        year: summaryApi.data.tahun,
        period: `Periode tahun ${selectedYear} (live)`,
        totalIncome: summaryApi.data.totalIncome,
        totalExpenses: summaryApi.data.totalExpenses,
        balance: summaryApi.data.balance,
        incomeCount: summaryApi.data.incomeCount,
        expenseCount: summaryApi.data.expenseCount,
      }
    : deriveSummaryFromTransaksi(transaksi.data, selectedYear);

  const yearData = {
    year: selectedYear,
    period: `Periode tahun ${selectedYear}`,
    income: transaksi.data?.income || [],
    expenses: transaksi.data?.expenses || [],
  };

  const loading = summaryApi.loading || transaksi.loading;
  const error = summaryApi.error || transaksi.error;
  const retry = () => {
    summaryApi.retry();
    transaksi.retry();
  };

  return (
    <>
      <PageHeader
        title="Transparansi Keuangan"
        description="Laporan pemasukan dan pengeluaran kas organisasi."
        breadcrumbs={[{ label: 'Anggaran' }]}
        image={heroImg}
      />

      <Section>
        {/* Year dropdown selector */}
        <div ref={dropdownRef} className="relative inline-block mb-6">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2 text-body-base font-body font-medium rounded-md',
              'bg-surface text-text border border-border hover:bg-bg',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            )}
          >
            Tahun {selectedYear}
            <ChevronDown
              className={clsx(
                'w-4 h-4 text-text-muted transition-transform duration-150',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <ul
              role="listbox"
              aria-label="Pilih tahun anggaran"
              className="absolute z-20 mt-2 w-56 max-h-72 overflow-auto rounded-md border border-border bg-white shadow-lg"
            >
              {years.map((year) => (
                <li key={year}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedYear === year}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-2.5 font-body text-body-base transition-colors duration-100',
                      'focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary',
                      selectedYear === year
                        ? 'bg-primary text-white'
                        : 'text-text hover:bg-bg'
                    )}
                  >
                    {year}
                    {year === years[0] && (
                      <span className="ml-1 text-caption opacity-80">(aktif)</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <ErrorBanner message={error} onRetry={retry} className="mb-6" />}

        {loading ? (
          <LoadingSpinner label="Memuat data anggaran..." />
        ) : (
        <>
        {/* Period info */}
        {summary && (
          <p className="font-body text-body-base text-text-secondary mb-6">
            Periode: {summary.period}
          </p>
        )}

        {/* Summary */}
        <BudgetSummary summary={summary} />

        {/* Detail tables */}
        {yearData && (
          <div className="mt-8">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-border mb-6">
              <button
                role="tab"
                aria-selected={activeTab === 'income'}
                onClick={() => setActiveTab('income')}
                className={clsx(
                  'px-4 py-2 text-body-base font-body font-medium',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  activeTab === 'income'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text'
                )}
              >
                Pemasukan ({yearData.income.length})
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'expenses'}
                onClick={() => setActiveTab('expenses')}
                className={clsx(
                  'px-4 py-2 text-body-base font-body font-medium',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  activeTab === 'expenses'
                    ? 'text-danger border-b-2 border-danger'
                    : 'text-text-secondary hover:text-text'
                )}
              >
                Pengeluaran ({yearData.expenses.length})
              </button>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-md border border-border-light overflow-hidden">
              {activeTab === 'income' ? (
                yearData.income.length === 0 ? (
                  <EmptyState
                    title="Belum ada transaksi"
                    description={`Belum ada data transaksi untuk tahun ${selectedYear}.`}
                  />
                ) : (
                  <BudgetTable data={yearData.income} type="income" />
                )
              ) : yearData.expenses.length === 0 ? (
                <EmptyState
                  title="Belum ada transaksi"
                  description={`Belum ada data transaksi untuk tahun ${selectedYear}.`}
                />
              ) : (
                <BudgetTable data={yearData.expenses} type="expense" />
              )}
            </div>
          </div>
        )}
        </>
        )}
      </Section>
    </>
  );
}
