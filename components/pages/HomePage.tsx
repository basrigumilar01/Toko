import React from 'react';

interface HomePageProps {
  welcomeName: string;
  storeName: string;
}

const HomePage: React.FC<HomePageProps> = ({ welcomeName, storeName }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
      <h1 className="text-4xl font-bold text-secondary mb-4">Selamat Datang, {welcomeName}!</h1>
      <p className="text-lg text-gray-600">Anda telah berhasil login ke sistem manajemen {storeName}.</p>
      <p className="text-lg text-gray-600 mt-2">Silakan gunakan menu navigasi di atas untuk mengelola toko.</p>
    </div>
  );
};

export default HomePage;
