import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/pages/HomePage';
import TambahProdukPage from './components/pages/TambahProdukPage';
import DaftarTransaksiPage from './components/pages/DaftarTransaksiPage';
import TransaksiBaruPage from './components/pages/TransaksiBaruPage';
import PengeluaranPage from './components/pages/PengeluaranPage';
import RiwayatPembelianPage from './components/pages/RiwayatPembelianPage';
import LaporanPage from './components/pages/LaporanPage';
import MasterPegawaiPage from './components/pages/MasterPegawaiPage';
import PengaturanPage from './components/pages/PengaturanPage'; // Import baru
import type { Product, Transaction, Purchase, Pegawai, StoreInfo, BankInfo } from './types';
import { mockTransactions, mockPurchases } from './constants';


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('Home');
  const [logoUrl, setLogoUrl] = useState<string>('https://picsum.photos/id/13/200/200');
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Semen Tiga Roda 40kg', costPrice: 50000, sellingPrice: 55000, stock: 100 },
    { id: 2, name: 'Cat Dinding Avitex 5kg', costPrice: 110000, sellingPrice: 120000, stock: 50 },
    { id: 3, name: 'Bata Merah Super', costPrice: 700, sellingPrice: 800, stock: 10000 },
    { id: 4, name: 'Pipa PVC 4 inch', costPrice: 22000, sellingPrice: 25000, stock: 75 },
    { id: 5, name: 'Keramik 40x40 Putih Polos', costPrice: 42000, sellingPrice: 45000, stock: 200 },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [employees, setEmployees] = useState<Pegawai[]>([
    { id: 1, nama: 'Andi Wijaya', posisi: 'Kasir', status: 'aktif' },
    { id: 2, nama: 'Siti Aminah', posisi: 'Kasir', status: 'aktif' },
    { id: 3, nama: 'Budi Hartono', posisi: 'Gudang', status: 'tidak aktif' },
  ]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [username, setUsername] = useState('Basri');
  const [password, setPassword] = useState('123456789');
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "Toko Sinar Abadi",
    address: {
      street: "Jl. Raya Pembangunan No. 123",
      village: "Cibadak",
      subdistrict: "Tanah Sareal",
      city: "Kota Bogor",
      province: "Jawa Barat",
      postalCode: "16166",
    },
    phone: "(021) 123-4567",
    email: "info@sinarabadi.com",
    openingHours: "Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 15:00\nMinggu & Hari Libur: Tutup"
  });
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: 'BCA',
    accountName: 'Basri',
    accountNumber: '123-456-7890'
  });


  const handleUpdateLogo = (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl);
  };
  
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: Date.now(),
      ...newProductData
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };
  
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleSaveTransaction = (
    transactionData: Omit<Transaction, 'id'>,
    editingId: number | null
  ): Transaction => {
    let savedTransaction: Transaction;
    if (editingId) {
      // Update existing transaction
      savedTransaction = {
        id: editingId,
        ...transactionData,
      };
      setTransactions(prevTransactions =>
        prevTransactions.map(t => (t.id === editingId ? savedTransaction : t))
      );
    } else {
      // Add new transaction
      savedTransaction = {
        id: Date.now(),
        ...transactionData,
      };
      setTransactions(prevTransactions => [savedTransaction, ...prevTransactions]);
    }
    setEditingTransaction(null); // Clear editing state
    return savedTransaction;
  };

  const handleDeleteTransaction = (transactionId: number) => {
    setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== transactionId));
  };
  
  const handleCancelTransaction = (transactionId: number) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(t =>
        t.id === transactionId ? { ...t, status: 'cancelled' } : t
      )
    );
  };

  const handleAddPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      id: Date.now(),
      ...purchaseData,
    };
    
    // Add purchase to history
    setPurchases(prev => [newPurchase, ...prev]);

    // Update product stock
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      newPurchase.items.forEach(purchaseItem => {
        const productIndex = updatedProducts.findIndex(p => p.id === purchaseItem.productId);
        if (productIndex !== -1) {
          updatedProducts[productIndex].stock += purchaseItem.quantity;
        }
      });
      return updatedProducts;
    });
  };

  const handleStartEditTransaction = (transactionId: number) => {
    const transactionToEdit = transactions.find(t => t.id === transactionId);
    if (transactionToEdit) {
      if (transactionToEdit.status === 'cancelled') {
        alert('Transaksi yang sudah dibatalkan tidak dapat diedit.');
        return;
      }
      setEditingTransaction(transactionToEdit);
      setCurrentPage('Transaksi Baru');
    }
  };
  
  const handleUpdatePurchase = (updatedPurchase: Purchase) => {
    const originalPurchase = purchases.find(p => p.id === updatedPurchase.id);
    if (!originalPurchase) return;

    const stockAdjustments = new Map<number, number>();

    // Decrease stock based on original items
    originalPurchase.items.forEach(item => {
      stockAdjustments.set(item.productId, (stockAdjustments.get(item.productId) || 0) - item.quantity);
    });

    // Increase stock based on new items
    updatedPurchase.items.forEach(item => {
      stockAdjustments.set(item.productId, (stockAdjustments.get(item.productId) || 0) + item.quantity);
    });

    // Apply stock adjustments
    setProducts(prevProducts => {
      const newProducts = [...prevProducts];
      stockAdjustments.forEach((adjustment, productId) => {
        const productIndex = newProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          newProducts[productIndex].stock += adjustment;
        }
      });
      return newProducts;
    });

    // Update the purchase in the history
    setPurchases(prev => prev.map(p => (p.id === updatedPurchase.id ? updatedPurchase : p)));
    setEditingPurchase(null);
  };

  const handleStartEditPurchase = (purchaseId: number) => {
    const purchaseToEdit = purchases.find(p => p.id === purchaseId);
    if (purchaseToEdit) {
      setEditingPurchase(purchaseToEdit);
    }
  };

  const handleCancelEditPurchase = () => {
    setEditingPurchase(null);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setCurrentPage('Riwayat Penjualan');
  };

  const handleAddEmployee = (employeeData: Omit<Pegawai, 'id'>) => {
    const newEmployee: Pegawai = {
      id: Date.now(),
      ...employeeData,
    };
    setEmployees(prev => [...prev, newEmployee].sort((a,b) => a.nama.localeCompare(b.nama)));
  };

  const handleUpdateEmployee = (updatedEmployee: Pegawai) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  const handleUpdateCredentials = ({ newUsername, newPassword }: { newUsername?: string, newPassword?: string }) => {
    if (newUsername) {
      setUsername(newUsername);
    }
    if (newPassword) {
      setPassword(newPassword);
    }
  };

  const handleUpdateStoreInfo = (newInfo: StoreInfo) => {
    setStoreInfo(newInfo);
  };
  
  const handleUpdateBankInfo = (newInfo: BankInfo) => {
    setBankInfo(newInfo);
  };

  const handleSaveAllDataToServer = (): Promise<void> => {
    return new Promise((resolve) => {
      const allData = {
        storeInfo,
        bankInfo,
        credentials: { username, password },
        logoUrl,
        products,
        transactions,
        purchases,
        employees,
      };

      console.log("Menyimpan data ke server:", JSON.stringify(allData, null, 2));

      // Simulate network latency
      setTimeout(() => {
        console.log("Data berhasil disimpan.");
        resolve();
      }, 2000);
    });
  };

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === username && pass === password) {
      setIsLoggedIn(true);
      setCurrentPage('Home');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const activeCashier = employees.find(e => e.status === 'aktif' && e.posisi.toLowerCase().includes('kasir'));
  const welcomeName = activeCashier ? activeCashier.nama : username;

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <HomePage welcomeName={welcomeName} storeName={storeInfo.name} />;
      case 'Tambah Produk':
        return <TambahProdukPage products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} />;
      case 'Riwayat Penjualan':
        return <DaftarTransaksiPage 
                  transactions={transactions} 
                  onEditTransaction={handleStartEditTransaction} 
                  onDeleteTransaction={handleDeleteTransaction}
                  onCancelTransaction={handleCancelTransaction} 
                />;
      case 'Transaksi Baru':
        return <TransaksiBaruPage 
                  availableProducts={products} 
                  onSaveTransaction={handleSaveTransaction}
                  transactionToEdit={editingTransaction}
                  onCancelEdit={handleCancelEdit}
                  logoUrl={logoUrl}
                  employees={employees}
                  storeInfo={storeInfo}
                  bankInfo={bankInfo}
                />;
      case 'Laporan Penjualan':
        return <PengeluaranPage transactions={transactions} products={products} />;
      case 'Riwayat Pembelian':
        return <RiwayatPembelianPage 
                  purchases={purchases} 
                  availableProducts={products} 
                  onAddPurchase={handleAddPurchase} 
                  purchaseToEdit={editingPurchase}
                  onStartEdit={handleStartEditPurchase}
                  onUpdatePurchase={handleUpdatePurchase}
                  onCancelEdit={handleCancelEditPurchase}
                />;
      case 'Master':
        return <MasterPegawaiPage 
                  employees={employees} 
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />;
      case 'Laporan':
        return <LaporanPage transactions={transactions} purchases={purchases} products={products} />;
      case 'Pengaturan':
        return <PengaturanPage 
                  currentUsername={username}
                  currentPassword={password}
                  onUpdateCredentials={handleUpdateCredentials}
                  storeInfo={storeInfo}
                  onUpdateStoreInfo={handleUpdateStoreInfo}
                  logoUrl={logoUrl}
                  onUpdateLogo={handleUpdateLogo}
                  bankInfo={bankInfo}
                  onUpdateBankInfo={handleUpdateBankInfo}
                  onSaveAllDataToServer={handleSaveAllDataToServer}
                />;
      default:
        return <HomePage welcomeName={welcomeName} storeName={storeInfo.name} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} storeName={storeInfo.name} />;
  }

  return (
    <div className="bg-light-gray min-h-screen font-sans flex flex-col">
      <Header
        storeName={storeInfo.name}
        logoUrl={logoUrl}
        onLogout={handleLogout}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        {renderPage()}
      </main>
      <Footer storeInfo={storeInfo} />
    </div>
  );
};

export default App;