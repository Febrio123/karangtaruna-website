import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import BudgetSummary from '../components/special/BudgetSummary';
import BudgetTable from '../components/content/BudgetTable';
import { budgetData, getBudgetSummary } from '../data/budget';
import useSeo from '../hooks/useSeo';

const years = Object.keys(budgetData)
  .map(Number)
  .sort((a, b) => b - a);

export default function Budget() {
  useSeo({
    title: 'Transparansi Keuangan',
    description: 'Laporan pemasukan dan pengeluaran kas Karang Taruna Mekar Jaya untuk transparansi anggaran organisasi.',
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
  const [selectedYear, setSelectedYear] = useState(years[0]);
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

  const summary = getBudgetSummary(selectedYear);
  const yearData = budgetData[selectedYear];

  return (
    <>
      <PageHeader
        title="Transparansi Keuangan"
        description="Laporan pemasukan dan pengeluaran kas organisasi."
        breadcrumbs={[{ label: 'Anggaran' }]}
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
                <BudgetTable data={yearData.income} type="income" />
              ) : (
                <BudgetTable data={yearData.expenses} type="expense" />
              )}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
