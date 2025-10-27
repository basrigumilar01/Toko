import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Product } from '../../types';

interface TambahProdukPageProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
}

const TambahProdukPage: React.FC<TambahProdukPageProps> = ({ products, onAddProduct, onUpdateProduct }) => {
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingProduct) {
        setName(editingProduct.name);
        setCostPrice(editingProduct.costPrice.toString());
        setSellingPrice(editingProduct.sellingPrice.toString());
        setStock(editingProduct.stock.toString());
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Clear form when not editing or after submission
        setName('');
        setCostPrice('');
        setSellingPrice('');
        setStock('');
    }
  }, [editingProduct]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  }

  const handleCancelEdit = () => {
    setEditingProduct(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !costPrice || !sellingPrice || !stock) return;

    if (editingProduct) {
      onUpdateProduct({
        id: editingProduct.id,
        name,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock, 10),
      });
    } else {
      onAddProduct({
        name,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock, 10),
      });
    }

    setEditingProduct(null); // Reset editing state and clear form via useEffect
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  );

  return (
    <div className="space-y-8">
      <div ref={formRef} className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-secondary mb-6">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                    <label htmlFor="nama-barang" className="block text-sm font-medium text-gray-700">Nama Barang</label>
                    <input type="text" id="nama-barang" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                    <label htmlFor="harga-pokok" className="block text-sm font-medium text-gray-700">Harga Pokok (Rp)</label>
                    <input type="number" id="harga-pokok" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                    <label htmlFor="harga-jual" className="block text-sm font-medium text-gray-700">Harga Jual (Rp)</label>
                    <input type="number" id="harga-jual" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                </div>
                 <div>
                    <label htmlFor="stok-awal" className="block text-sm font-medium text-gray-700">Stok</label>
                    <input type="number" id="stok-awal" value={stock} onChange={e => setStock(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                </div>
            </div>
            <div className="flex justify-end items-center gap-4">
                {editingProduct && (
                   <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-secondary font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
                        Batal
                    </button>
                )}
                <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors">
                    {editingProduct ? 'Simpan Perubahan' : 'Input Barang'}
                </button>
            </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">Daftar Produk</h2>
        
        <div className="mb-4">
            <label htmlFor="search-product" className="sr-only">Cari Produk</label>
            <input
                type="text"
                id="search-product"
                placeholder="Cari produk berdasarkan nama..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="block w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Pokok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.costPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.sellingPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{product.stock.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <EditIcon/>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'Tidak ada produk yang cocok dengan pencarian Anda.' : 'Belum ada produk yang ditambahkan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TambahProdukPage;