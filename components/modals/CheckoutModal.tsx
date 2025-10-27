import React, { useState, useMemo, useEffect } from 'react';
import type { TransactionItem } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentType: 'now' | 'later', cashPaid: number, buyerName: string, buyerAddress: string) => void;
  onDeleteTransaction: () => void;
  cartItems: TransactionItem[];
  totalAmount: number;
  buyerName?: string;
  buyerAddress?: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onConfirm, onDeleteTransaction, cartItems, totalAmount, buyerName: initialBuyerName, buyerAddress: initialBuyerAddress }) => {
  const [cashPaid, setCashPaid] = useState<string>('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  useEffect(() => {
    // Reset state when modal is opened
    if (isOpen) {
      setCashPaid('');
      setBuyerName(initialBuyerName || '');
      setBuyerAddress(initialBuyerAddress || '');
    }
  }, [isOpen, initialBuyerName, initialBuyerAddress]);

  const changeAmount = useMemo(() => {
    const cash = parseFloat(cashPaid);
    if (!isNaN(cash) && cash >= totalAmount) {
      return cash - totalAmount;
    }
    return 0;
  }, [cashPaid, totalAmount]);

  const isConfirmDisabled = useMemo(() => {
    const cash = parseFloat(cashPaid);
    return isNaN(cash) || cash < totalAmount;
  }, [cashPaid, totalAmount]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh transaksi ini? Tindakan ini tidak dapat diurungkan.')) {
      onDeleteTransaction();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-secondary">Konfirmasi Pembayaran</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
            <div className="max-h-40 overflow-y-auto pr-2">
                 {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">{item.name} <span className="text-xs"> (x{item.quantity})</span></span>
                        <span className="font-medium text-gray-800">{formatCurrency(item.total)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 space-y-3">
                 <div>
                    <label htmlFor="buyer-name" className="block text-sm font-medium text-gray-700">Nama Pembeli (Opsional)</label>
                    <input
                        type="text"
                        id="buyer-name"
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base"
                        placeholder="Masukkan nama pembeli"
                    />
                </div>
                <div>
                    <label htmlFor="buyer-address" className="block text-sm font-medium text-gray-700">Alamat Pembeli (Opsional)</label>
                    <input
                        type="text"
                        id="buyer-address"
                        value={buyerAddress}
                        onChange={e => setBuyerAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base"
                        placeholder="Masukkan alamat pembeli"
                    />
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-secondary">Total Belanja</span>
                    <span className="text-primary-dark">{formatCurrency(totalAmount)}</span>
                </div>
                 <div>
                    <label htmlFor="cash-paid" className="block text-sm font-medium text-gray-700">Jumlah Uang Tunai (Rp)</label>
                    <input
                        type="number"
                        id="cash-paid"
                        value={cashPaid}
                        onChange={e => setCashPaid(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-lg"
                        placeholder="0"
                        autoFocus
                    />
                </div>
                <div className="flex justify-between items-center text-lg font-bold bg-green-50 p-3 rounded-md">
                    <span className="text-green-800">Kembalian</span>
                    <span className="text-green-800">{formatCurrency(changeAmount)}</span>
                </div>
            </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={() => onConfirm('later', 0, buyerName, buyerAddress)}
            className="px-6 py-2 border border-primary rounded-md shadow-sm text-sm font-bold text-primary-dark bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Bayar Nanti
          </button>
          <button
            type="button"
            onClick={() => onConfirm('now', parseFloat(cashPaid), buyerName, buyerAddress)}
            disabled={isConfirmDisabled}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;