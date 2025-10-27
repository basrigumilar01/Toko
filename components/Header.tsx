import React, { useState } from 'react';

interface HeaderProps {
  storeName: string;
  logoUrl: string;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ storeName, logoUrl, onLogout, currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = ['Home', 'Transaksi Baru', 'Riwayat Penjualan', 'Tambah Produk', 'Laporan Penjualan', 'Riwayat Pembelian', 'Master', 'Laporan', 'Pengaturan'];

  const NavLinkItems = () => (
    <>
      {navLinks.map(link => (
        <a
          key={link}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(link);
            setIsMenuOpen(false);
          }}
          className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === link ? 'bg-primary text-white' : 'text-secondary hover:bg-slate-200 hover:text-primary-dark'
            } transition-colors`}
        >
          {link}
        </a>
      ))}
      <button
        onClick={onLogout}
        className="ml-4 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </>
  )

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={logoUrl} alt="Store Logo" className="h-12 w-12 object-cover rounded-full border-2 border-primary" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-secondary font-display tracking-wide">
              {storeName}
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            <NavLinkItems />
          </nav>
          <button className="md:hidden text-secondary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col items-start space-y-2">
            <NavLinkItems />
          </nav>
        )}
      </div>
    </header>
  );
};