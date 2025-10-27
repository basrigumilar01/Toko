import React, { useState, useMemo } from 'react';
import type { Transaction, Purchase, Product } from '../../types';

interface LaporanPageProps {
  transactions: Transaction[];
  purchases: Purchase[];
  products: Product[];
}

type FilterType = 'harian' | 'bulanan' | 'tahunan';
type ActiveTab = 'pemasukan' | 'pengeluaran' | 'neraca';

const LaporanPage: React.FC<LaporanPageProps> = ({ transactions, purchases, products }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('neraca');
  const [filterType, setFilterType] = useState<FilterType>('harian');
  
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisYear = new Date().getFullYear().toString();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(thisMonth);
  const [selectedYear, setSelectedYear] = useState(thisYear);
  
  const [appliedFilters, setAppliedFilters] = useState({
    type: filterType,
    date: selectedDate,
    month: selectedMonth,
    year: selectedYear
  });

  const handleApplyFilter = () => {
    setAppliedFilters({
      type: filterType,
      date: selectedDate,
      month: selectedMonth,
      year: selectedYear
    });
  };

  const { filteredPurchases, filteredTransactions } = useMemo(() => {
    const { type, date, month, year } = appliedFilters;

    const filterPredicate = (itemDate: Date) => {
      switch (type) {
        case 'harian': {
          const d = new Date(date);
          return itemDate.getFullYear() === d.getFullYear() &&
                 itemDate.getMonth() === d.getMonth() &&
                 itemDate.getDate() === d.getDate();
        }
        case 'bulanan': {
          const [y, m] = month.split('-').map(Number);
          return itemDate.getFullYear() === y && itemDate.getMonth() === m - 1;
        }
        case 'tahunan': {
          const y = parseInt(year, 10);
          return itemDate.getFullYear() === y;
        }
        default:
          return true;
      }
    };

    const fPurchases = purchases.filter(p => filterPredicate(new Date(p.date)));
    const fTransactions = transactions.filter(t => t.status !== 'cancelled' && filterPredicate(new Date(t.date)));
    
    return { filteredPurchases: fPurchases, filteredTransactions: fTransactions };
  }, [purchases, transactions, appliedFilters]);

  const neracaData = useMemo(() => {
    const totalOmzet = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

    const totalHPP = filteredTransactions
      .flatMap(t => t.items)
      .reduce((sum, item) => {
        const product = products.find(p => p.name === item.name);
        const cost = product ? product.costPrice * item.quantity : 0;
        return sum + cost;
      }, 0);

    const labaKotor = totalOmzet - totalHPP;

    return { totalOmzet, totalHPP, labaKotor };
  }, [filteredTransactions, products]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const formatDate = (dateString: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(dateString));

  const renderFilterControls = () => (
    <div className="bg-slate-50 p-4 rounded-lg mb-6 border flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">Jenis Filter</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value as FilterType)} className="mt-1 block w-full input-field">
          <option value="harian">Harian</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
        </select>
      </div>
      {filterType === 'harian' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Tanggal</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mt-1 block w-full input-field" />
        </div>
      )}
      {filterType === 'bulanan' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Bulan & Tahun</label>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="mt-1 block w-full input-field" />
        </div>
      )}
      {filterType === 'tahunan' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Tahun</label>
          <input type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="mt-1 block w-full input-field" placeholder="Contoh: 2024" />
        </div>
      )}
      <button onClick={handleApplyFilter} className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors">
        Terapkan Filter
      </button>
    </div>
  );
  
  const renderPemasukan = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pemasok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
         </thead>
         <tbody className="bg-white divide-y divide-gray-200">
            {filteredPurchases.length > 0 ? filteredPurchases.flatMap(p => 
                p.items.map((item, index) => (
                    <tr key={`${p.id}-${item.productId}`}>
                        {index === 0 && <td rowSpan={p.items.length} className="px-6 py-4 align-top text-sm">{formatDate(p.date)}</td>}
                        {index === 0 && <td rowSpan={p.items.length} className="px-6 py-4 align-top text-sm font-medium">{p.supplierName}</td>}
                        <td className="px-6 py-4 text-sm">{item.productName}</td>
                        <td className="px-6 py-4 text-sm">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm">{formatCurrency(item.costPrice)}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(item.totalCost)}</td>
                    </tr>
                ))
            ) : (
                 <tr><td colSpan={6} className="text-center py-10 text-gray-500">Tidak ada data pemasukan pada periode ini.</td></tr>
            )}
         </tbody>
         <tfoot className="bg-gray-100">
            <tr>
                <td colSpan={5} className="px-6 py-3 text-right font-bold text-secondary">TOTAL PEMASUKAN</td>
                <td className="px-6 py-3 font-bold text-primary-dark">{formatCurrency(filteredPurchases.reduce((sum, p) => sum + p.totalPurchaseCost, 0))}</td>
            </tr>
         </tfoot>
      </table>
    </div>
  );

  const renderPengeluaran = () => (
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
         </thead>
         <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? filteredTransactions.flatMap(t => 
                t.items.map((item, index) => (
                    <tr key={`${t.id}-${item.id}`}>
                        {index === 0 && <td rowSpan={t.items.length} className="px-6 py-4 align-top text-sm">{formatDate(t.date)}</td>}
                        {index === 0 && <td rowSpan={t.items.length} className="px-6 py-4 align-top text-sm font-medium">{t.buyerName || '-'}</td>}
                        <td className="px-6 py-4 text-sm">{item.name}</td>
                        <td className="px-6 py-4 text-sm">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                ))
            ) : (
                 <tr><td colSpan={6} className="text-center py-10 text-gray-500">Tidak ada data pengeluaran pada periode ini.</td></tr>
            )}
         </tbody>
         <tfoot className="bg-gray-100">
            <tr>
                <td colSpan={5} className="px-6 py-3 text-right font-bold text-secondary">TOTAL OMZET</td>
                <td className="px-6 py-3 font-bold text-primary-dark">{formatCurrency(neracaData.totalOmzet)}</td>
            </tr>
         </tfoot>
      </table>
    </div>
  );

  const renderNeraca = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Omzet (Pendapatan)</h3>
            <p className="text-3xl font-bold text-blue-900 mt-2">{formatCurrency(neracaData.totalOmzet)}</p>
        </div>
        <div className="bg-red-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Total Modal (HPP)</h3>
            <p className="text-3xl font-bold text-red-900 mt-2">{formatCurrency(neracaData.totalHPP)}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Laba Kotor</h3>
            <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(neracaData.labaKotor)}</p>
        </div>
    </div>
  );


  return (
    <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-secondary">Laporan Keuangan & Stok</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('neraca')} className={`${activeTab === 'neraca' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                Neraca
            </button>
            <button onClick={() => setActiveTab('pemasukan')} className={`${activeTab === 'pemasukan' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                Laporan Pemasukan
            </button>
            <button onClick={() => setActiveTab('pengeluaran')} className={`${activeTab === 'pengeluaran' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                Laporan Pengeluaran
            </button>
        </nav>
      </div>

      {renderFilterControls()}

      <div>
        {activeTab === 'pemasukan' && renderPemasukan()}
        {activeTab === 'pengeluaran' && renderPengeluaran()}
        {activeTab === 'neraca' && renderNeraca()}
      </div>
    </div>
  );
};

export default LaporanPage;

const style = document.createElement('style');
style.innerHTML = `
  .input-field {
    padding: 0.5rem 0.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .input-field:focus {
    outline: none;
    --tw-ring-color: #f59e0b;
    border-color: #f59e0b;
    box-shadow: 0 0 0 1px #f59e0b;
  }
`;
document.head.appendChild(style);