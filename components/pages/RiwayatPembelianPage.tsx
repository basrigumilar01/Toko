import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Product, Purchase, PurchaseItem } from '../../types';

interface RiwayatPembelianPageProps {
  purchases: Purchase[];
  availableProducts: Product[];
  onAddPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  purchaseToEdit: Purchase | null;
  onStartEdit: (purchaseId: number) => void;
  onUpdatePurchase: (purchase: Purchase) => void;
  onCancelEdit: () => void;
}

const RiwayatPembelianPage: React.FC<RiwayatPembelianPageProps> = ({
  purchases,
  availableProducts,
  onAddPurchase,
  purchaseToEdit,
  onStartEdit,
  onUpdatePurchase,
  onCancelEdit
}) => {
  // State for the new purchase form
  const [supplierName, setSupplierName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  // State for adding a single item to the current purchase
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(0);

  // State for UI interaction
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (purchaseToEdit) {
      setSupplierName(purchaseToEdit.supplierName);
      setPurchaseDate(new Date(purchaseToEdit.date).toISOString().slice(0, 10));
      setItems(purchaseToEdit.items);
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Clear form when not editing
      setSupplierName('');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setItems([]);
    }
  }, [purchaseToEdit]);

  const selectedProduct = useMemo(() => {
    const product = availableProducts.find(p => p.id.toString() === selectedProductId);
    if (product) {
      setCostPrice(product.costPrice);
    } else {
      setCostPrice(0);
    }
    return product;
  }, [selectedProductId, availableProducts]);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || costPrice < 0) {
      alert('Pastikan produk, jumlah, dan harga beli valid.');
      return;
    }

    // Check if item already exists in cart, if so, update it
    const existingItemIndex = items.findIndex(item => item.productId === selectedProduct.id);

    if (existingItemIndex > -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      existingItem.quantity += quantity;
      existingItem.costPrice = costPrice; // update cost price
      existingItem.totalCost = existingItem.quantity * existingItem.costPrice;
      setItems(updatedItems);
    } else {
       const newItem: PurchaseItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        costPrice,
        totalCost: quantity * costPrice,
      };
      setItems(prevItems => [...prevItems, newItem]);
    }

    // Reset item form
    setSelectedProductId('');
    setQuantity(1);
    setCostPrice(0);
  };

  const handleRemoveItem = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const totalPurchaseCost = useMemo(() => {
    return items.reduce((total, item) => total + item.totalCost, 0);
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || items.length === 0) {
      alert('Nama pemasok dan minimal satu barang harus diisi.');
      return;
    }
    
    const purchaseData = {
      date: new Date(purchaseDate).toISOString(),
      supplierName,
      items,
      totalPurchaseCost,
    };

    if (purchaseToEdit) {
      onUpdatePurchase({ ...purchaseData, id: purchaseToEdit.id });
    } else {
      onAddPurchase(purchaseData);
    }
  };
  
  const handleToggleRow = (purchaseId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const formatDate = (dateString: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString));
  
  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  );

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div ref={formRef} className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-secondary mb-6">{purchaseToEdit ? 'Edit Pembelian' : 'Tambah Pembelian Baru'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700">Nama Pemasok</label>
              <input type="text" id="supplier-name" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="mt-1 block w-full input-field" required />
            </div>
            <div>
              <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-700">Tanggal Pembelian</label>
              <input type="date" id="purchase-date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1 block w-full input-field" required />
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Barang yang Dibeli</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-lg">
              <div className="md:col-span-2">
                <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">Produk</label>
                <select id="product-select" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="mt-1 block w-full input-field">
                  <option value="">-- Pilih Barang --</option>
                  {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Jumlah</label>
                <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} min="1" className="mt-1 block w-full input-field" />
              </div>
              <div>
                <label htmlFor="cost-price" className="block text-sm font-medium text-gray-700">Harga Beli Satuan</label>
                <input type="number" id="cost-price" value={costPrice} onChange={e => setCostPrice(parseFloat(e.target.value) || 0)} min="0" className="mt-1 block w-full input-field" />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button type="button" onClick={handleAddItem} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Tambah Barang</button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Daftar Pembelian Saat Ini</h3>
              <ul className="divide-y divide-gray-200 border rounded-md">
                {items.map(item => (
                  <li key={item.productId} className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.costPrice)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                      <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                    </div>
                  </li>
                ))}
                <li className="flex justify-between items-center p-3 bg-gray-50 font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(totalPurchaseCost)}</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4 items-center gap-4">
            {purchaseToEdit && (
              <button type="button" onClick={onCancelEdit} className="bg-gray-200 text-secondary font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors">
                Batal
              </button>
            )}
            <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-primary-dark transition-colors">
              {purchaseToEdit ? 'Simpan Perubahan' : 'Simpan Pembelian'}
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">Riwayat Pembelian</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pemasok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Biaya</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.length > 0 ? purchases.map(purchase => (
                <React.Fragment key={purchase.id}>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-800">{formatDate(purchase.date)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{purchase.supplierName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary-dark">{formatCurrency(purchase.totalPurchaseCost)}</td>
                    <td className="px-6 py-4 text-center text-sm">
                       <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleToggleRow(purchase.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          {expandedRows.has(purchase.id) ? 'Sembunyikan' : 'Lihat Detail'}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => onStartEdit(purchase.id)} className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center gap-1">
                          <EditIcon />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(purchase.id) && (
                    <tr className="bg-slate-50">
                      <td colSpan={4} className="p-4">
                        <div className="pl-12">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Detail Pembelian dari "{purchase.supplierName}"</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            {purchase.items.map((item, index) => (
                              <li key={index}>{item.productName}: {item.quantity.toLocaleString('id-ID')} unit @ {formatCurrency(item.costPrice)}</li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Belum ada riwayat pembelian.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatPembelianPage;

// Add a simple CSS class for reuse
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