import React from 'react';
import type { Transaction } from '../../types';

interface DaftarTransaksiPageProps {
  transactions: Transaction[];
  onEditTransaction: (transactionId: number) => void;
  onDeleteTransaction: (transactionId: number) => void;
  onCancelTransaction: (transactionId: number) => void;
}

const DaftarTransaksiPage: React.FC<DaftarTransaksiPageProps> = ({ transactions, onEditTransaction, onDeleteTransaction, onCancelTransaction }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
  
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  }

  const handleDeleteClick = (transactionId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat diurungkan.')) {
      onDeleteTransaction(transactionId);
    }
  };

  const handleCancelClick = (transactionId: number) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan transaksi ini? Transaksi akan ditandai sebagai "Dibatalkan" dan tidak akan dihitung dalam laporan.')) {
      onCancelTransaction(transactionId);
    }
  };

  const StatusBadge = ({ status }: { status: 'paid' | 'pending' | 'cancelled' }) => {
    const baseClasses = "px-3 py-1 text-xs font-bold rounded-full text-white shadow-sm";
    if (status === 'paid') {
      return <span className={`${baseClasses} bg-green-500`}>Lunas</span>;
    }
    if (status === 'cancelled') {
      return <span className={`${baseClasses} bg-slate-500`}>Dibatalkan</span>;
    }
    return <span className={`${baseClasses} bg-yellow-500`}>Belum Dibayar</span>;
  };

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-secondary mb-6">Riwayat Penjualan</h1>
      <div className="space-y-6">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-3 border-b">
                <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
                    <div>
                      <h2 className="font-semibold text-gray-700">
                        ID: {transaction.id}
                        {transaction.buyerName && <span className="text-gray-500 font-normal"> - {transaction.buyerName}</span>}
                      </h2>
                      {transaction.buyerAddress && <p className="text-xs text-gray-500">{transaction.buyerAddress}</p>}
                    </div>
                    <StatusBadge status={transaction.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                  <button
                    onClick={() => onEditTransaction(transaction.id)}
                    disabled={transaction.status === 'cancelled'}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 p-1 rounded-md hover:bg-blue-50 transition-colors disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleCancelClick(transaction.id)}
                    disabled={transaction.status === 'cancelled'}
                    className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-1 p-1 rounded-md hover:bg-yellow-50 transition-colors disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <CancelIcon />
                    <span>Batalkan</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(transaction.id)}
                    className="text-sm text-white bg-red-500 hover:bg-red-600 font-medium flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                  >
                    <DeleteIcon />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banyaknya</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transaction.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                      <tr>
                          <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-secondary uppercase">Total Transaksi</td>
                          <td className="px-6 py-3 text-left text-sm font-bold text-primary-dark">{formatCurrency(transaction.total)}</td>
                      </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Belum ada riwayat transaksi.</p>
        )}
      </div>
    </div>
  );
};

export default DaftarTransaksiPage;