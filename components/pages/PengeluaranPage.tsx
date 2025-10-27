import React, { useMemo, useState } from 'react';
import type { Transaction, Product } from '../../types';

interface PengeluaranPageProps {
  transactions: Transaction[];
  products: Product[];
}

interface ProductSummary {
  name: string;
  totalSold: number;
  initialStock: number;
  remainingStock: number;
  lastSaleDate: string;
  details: { date: string; quantity: number; transactionId: number }[];
}

const PengeluaranPage: React.FC<PengeluaranPageProps> = ({ transactions, products }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const productSummary = useMemo<ProductSummary[]>(() => {
    const activeTransactions = transactions.filter(t => t.status !== 'cancelled');

    const filteredTransactions = activeTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); 
        if (transactionDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (transactionDate > end) return false;
      }

      return true;
    });

    const summaryMap: Map<string, { totalSold: number; lastSaleDate: string; details: { date: string; quantity: number; transactionId: number }[] }> = new Map();
          
    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      transaction.items.forEach(item => {
        const existing = summaryMap.get(item.name);
        if (existing) {
          existing.totalSold += item.quantity;
          if (transactionDate > new Date(existing.lastSaleDate)) {
            existing.lastSaleDate = transaction.date;
          }
          existing.details.push({ date: transaction.date, quantity: item.quantity, transactionId: transaction.id });
        } else {
          summaryMap.set(item.name, {
            totalSold: item.quantity,
            lastSaleDate: transaction.date,
            details: [{ date: transaction.date, quantity: item.quantity, transactionId: transaction.id }],
          });
        }
      });
    });

    return Array.from(summaryMap.entries())
      .map(([name, data]) => {
        const productInfo = products.find(p => p.name === name);
        const initialStock = productInfo ? productInfo.stock + data.totalSold : data.totalSold; // Recalculate initial stock
        return {
          name,
          totalSold: data.totalSold,
          lastSaleDate: data.lastSaleDate,
          initialStock,
          remainingStock: initialStock - data.totalSold,
          details: data.details,
        };
      })
      .sort((a, b) => b.totalSold - a.totalSold);

  }, [transactions, products, startDate, endDate]);
  
  const handleToggleRow = (productName: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productName)) {
        newSet.delete(productName);
      } else {
        newSet.add(productName);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
    }).format(new Date(dateString));
  }
  
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  }

  const handleDownloadCSV = () => {
    if (productSummary.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    const headers = ['No.', 'Nama Barang', 'Tanggal Penjualan Terakhir', 'Stok Awal', 'Total Terjual', 'Sisa Stok'];
    
    const rows = productSummary.map((product, index) => [
      index + 1,
      `"${product.name.replace(/"/g, '""')}"`,
      formatDate(product.lastSaleDate),
      product.initialStock,
      product.totalSold,
      product.remainingStock
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        const today = new Date().toISOString().slice(0, 10);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan-penjualan-${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
        <h1 className="text-3xl font-bold text-secondary">Laporan Penjualan Produk</h1>
        <button
          onClick={handleDownloadCSV}
          className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <DownloadIcon />
          Download Laporan
        </button>
      </div>
      <p className="text-gray-600 mb-6">Berikut adalah rangkuman jumlah total setiap barang yang telah terjual, diurutkan berdasarkan produk terlaris.</p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
           <button
            onClick={handleResetFilter}
            className="bg-gray-200 text-secondary font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Penjualan Terakhir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Awal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Terjual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Stok</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productSummary.length > 0 ? (
              productSummary.map((product, index) => (
                <React.Fragment key={product.name}>
                  <tr className={product.remainingStock < 0 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(product.lastSaleDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.initialStock.toLocaleString('id-ID')} unit</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.totalSold.toLocaleString('id-ID')} unit</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${product.remainingStock < 10 ? 'text-red-600' : 'text-green-700'}`}>
                      {product.remainingStock.toLocaleString('id-ID')} unit
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                       <button
                          onClick={() => handleToggleRow(product.name)}
                          className="text-blue-600 hover:text-blue-800 font-medium p-1 rounded-md hover:bg-blue-50 transition-colors text-xs"
                        >
                          {expandedRows.has(product.name) ? 'Sembunyikan' : 'Lihat Detail'}
                        </button>
                    </td>
                  </tr>
                  {expandedRows.has(product.name) && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="p-4">
                        <div className="pl-12">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Detail Transaksi untuk "{product.name}"</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
                            {product.details
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((detail, detailIndex) => (
                              <li key={`${detail.transactionId}-${detailIndex}`}>
                                <span className="font-medium">{formatDateTime(detail.date)}:</span> Terjual {detail.quantity.toLocaleString('id-ID')} unit (ID Transaksi: {detail.transactionId})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  Tidak ada data transaksi pada rentang tanggal yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PengeluaranPage;