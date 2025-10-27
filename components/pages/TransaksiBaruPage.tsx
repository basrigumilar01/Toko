import React, { useState, useMemo, useEffect } from 'react';
import type { Product, TransactionItem, Transaction, Pegawai, StoreInfo, BankInfo } from '../../types';
import CheckoutModal from '../modals/CheckoutModal';
import ReceiptModal from '../modals/ReceiptModal';

interface TransaksiBaruPageProps {
  availableProducts: Product[];
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, editingId: number | null) => Transaction;
  transactionToEdit: Transaction | null;
  onCancelEdit: () => void;
  logoUrl: string;
  employees: Pegawai[];
  storeInfo: StoreInfo;
  bankInfo: BankInfo;
}

interface PaymentDetails {
    cash: number;
    change: number;
}

const TransaksiBaruPage: React.FC<TransaksiBaruPageProps> = ({ availableProducts, onSaveTransaction, transactionToEdit, onCancelEdit, logoUrl, employees, storeInfo, bankInfo }) => {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [transactionDateTime, setTransactionDateTime] = useState(new Date().toISOString());
  const [discount, setDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  const isCancelled = transactionToEdit?.status === 'cancelled';

  useEffect(() => {
    if (transactionToEdit) {
      setCart(transactionToEdit.items);
      setTransactionDateTime(transactionToEdit.date);
      // Note: Discount and tax are not stored in the transaction object in this version,
      // so they reset to 0 when editing.
      setDiscount(0);
      setTaxPercent(0);
    } else {
      // Clear cart when not editing or when an edit is cancelled/completed
      setCart([]);
      setTransactionDateTime(new Date().toISOString());
      setDiscount(0);
      setTaxPercent(0);
    }
  }, [transactionToEdit]);


  const selectedProduct = useMemo(() => {
    return availableProducts.find(p => p.id.toString() === selectedProductId);
  }, [selectedProductId, availableProducts]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  const handleAddToCart = () => {
    if (!selectedProduct) {
      alert('Silakan pilih produk terlebih dahulu.');
      return;
    }
    if (quantity <= 0) {
      alert('Jumlah barang harus lebih dari 0.');
      return;
    }

    const existingCartItem = cart.find(item => item.name === selectedProduct.name);

    if (existingCartItem) {
      setCart(cart.map(item => 
        item.name === selectedProduct.name 
        ? { ...item, quantity: item.quantity + quantity, total: item.total + (selectedProduct.sellingPrice * quantity) }
        : item
      ));
    } else {
      const newCartItem: TransactionItem = {
        id: Date.now(),
        name: selectedProduct.name,
        quantity: quantity,
        unitPrice: selectedProduct.sellingPrice,
        total: selectedProduct.sellingPrice * quantity,
      };
      setCart([...cart, newCartItem]);
    }
    
    setSelectedProductId('');
    setQuantity(1);
  };
  
  const handleUpdateCartItem = (itemId: number, field: 'quantity' | 'unitPrice', value: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, [field]: value };
        if(field === 'quantity' && value < 1) {
            newItem.quantity = 1;
        }
        newItem.total = newItem.quantity * newItem.unitPrice;
        return newItem;
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.total, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    const taxableAmount = subtotal - discount;
    if (taxableAmount <= 0 || taxPercent <= 0) return 0;
    return taxableAmount * (taxPercent / 100);
  }, [subtotal, discount, taxPercent]);

  const finalTotal = useMemo(() => {
    return subtotal - discount + taxAmount;
  }, [subtotal, discount, taxAmount]);
  
  const handleFinishTransaction = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }
    setIsCheckoutModalOpen(true);
  }
  
  const handleConfirmCheckout = (paymentType: 'now' | 'later', cashPaid: number, buyerName: string, buyerAddress: string) => {
    const activeCashier = employees.find(e => e.status === 'aktif' && e.posisi.toLowerCase().includes('kasir'));
    
    const transactionData: Omit<Transaction, 'id' | 'status'> & { status: 'paid' | 'pending' } = {
        date: transactionDateTime,
        items: cart,
        subtotal: subtotal,
        discount: discount,
        tax: taxAmount,
        total: finalTotal,
        status: paymentType === 'now' ? 'paid' : 'pending',
        buyerName: buyerName.trim() || undefined,
        buyerAddress: buyerAddress.trim() || undefined,
        cashierName: activeCashier?.nama,
    };
    
    const wasEditing = !!transactionToEdit;
    const savedTransaction = onSaveTransaction(transactionData, transactionToEdit ? transactionToEdit.id : null);

    setIsCheckoutModalOpen(false);

    if(paymentType === 'now') {
        setCompletedTransaction(savedTransaction);
        setPaymentDetails({ cash: cashPaid, change: cashPaid - finalTotal });
        setIsReceiptModalOpen(true);
    } else {
        alert('Transaksi berhasil disimpan sebagai "Belum Dibayar".');
        if (wasEditing) {
            onCancelEdit(); // Navigate back to list after saving an edit as pending
        }
    }
  };
  
  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    setCompletedTransaction(null);
    setPaymentDetails(null);
    // After closing receipt, the page will automatically reset to "New Transaction"
    // because the `transactionToEdit` state in App.tsx was cleared upon saving.
  };

  const handleDeleteTransaction = () => {
    setCart([]);
    setIsCheckoutModalOpen(false);
    if (transactionToEdit) {
      onCancelEdit();
    }
  };


  return (
    <>
      {isCancelled && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
          <p className="font-bold">Transaksi Dibatalkan</p>
          <p>Transaksi ini telah dibatalkan dan tidak dapat diubah lagi.</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Product Selection */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-bold text-secondary mb-4">Pilih Produk Barang</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">Produk</label>
              <select
                id="product-select"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                disabled={isCancelled}
              >
                <option value="">-- Pilih Barang --</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            {selectedProduct && (
              <div className="p-3 bg-slate-100 rounded-md">
                  <span className="text-sm text-gray-500">Harga Barang:</span>
                  <p className="font-semibold text-lg text-primary-dark">{formatCurrency(selectedProduct.sellingPrice)}</p>
              </div>
            )}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Banyaknya</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                disabled={isCancelled}
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedProduct || isCancelled}
              className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Tambah ke Transaksi
            </button>
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-secondary">
              {transactionToEdit ? 'Edit Transaksi' : 'Transaksi Saat Ini'}
            </h2>
            {transactionToEdit && (
              <button
                onClick={onCancelEdit}
                className="bg-gray-200 text-secondary font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Batal Edit
              </button>
            )}
          </div>
          {transactionToEdit && (
             <div className="mb-4">
               <label htmlFor="transaction-datetime" className="block text-sm font-medium text-gray-700">Tanggal & Waktu Transaksi</label>
               <input
                 type="datetime-local"
                 id="transaction-datetime"
                 value={transactionDateTime.substring(0, 16)} // Format for datetime-local
                 onChange={e => setTransactionDateTime(new Date(e.target.value).toISOString())}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                 disabled={isCancelled}
               />
             </div>
          )}
          <div className="overflow-y-auto mb-4" style={{maxHeight: '400px'}}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateCartItem(item.id, 'quantity', parseInt(e.target.value, 10))}
                            className="w-20 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            min="1"
                            disabled={isCancelled}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateCartItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                            className="w-32 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            min="0"
                            disabled={isCancelled}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-semibold">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed" disabled={isCancelled}>Hapus</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Keranjang belanja kosong.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between items-center text-md">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-md">
                  <label htmlFor="discount" className="text-gray-600">Diskon (Rp)</label>
                  <input
                    type="number"
                    id="discount"
                    value={discount}
                    onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-32 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-right"
                    placeholder='0'
                    disabled={isCancelled}
                  />
              </div>
              <div className="flex justify-between items-center text-md">
                  <label htmlFor="tax" className="text-gray-600">Pajak (%)</label>
                  <input
                    type="number"
                    id="tax"
                    value={taxPercent}
                    onChange={e => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 p-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-right"
                    placeholder='0'
                    disabled={isCancelled}
                  />
              </div>
              <div className="flex justify-between items-center text-md">
                  <span className="text-gray-600">Jumlah Pajak</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t border-dashed my-2"></div>
              <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-secondary">Total Akhir:</span>
                  <span className="text-primary-dark">{formatCurrency(finalTotal)}</span>
              </div>
              <button
                onClick={handleFinishTransaction}
                disabled={cart.length === 0 || isCancelled}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                Selesaikan Transaksi
              </button>
          </div>
        </div>
      </div>
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleConfirmCheckout}
        onDeleteTransaction={handleDeleteTransaction}
        cartItems={cart}
        totalAmount={finalTotal}
        buyerName={transactionToEdit?.buyerName}
        buyerAddress={transactionToEdit?.buyerAddress}
      />
       {completedTransaction && paymentDetails && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={handleCloseReceipt}
          transaction={completedTransaction}
          paymentDetails={paymentDetails}
          logoUrl={logoUrl}
          storeInfo={storeInfo}
          bankInfo={bankInfo}
        />
      )}
    </>
  );
};

export default TransaksiBaruPage;