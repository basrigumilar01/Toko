import React, { useState, useEffect, useRef } from 'react';
import type { StoreInfo, BankInfo } from '../../types';

interface PengaturanPageProps {
  currentUsername: string;
  currentPassword:  string;
  onUpdateCredentials: ({ newUsername, newPassword }: { newUsername?: string, newPassword?: string }) => void;
  storeInfo: StoreInfo;
  onUpdateStoreInfo: (newInfo: StoreInfo) => void;
  logoUrl: string;
  onUpdateLogo: (newLogoUrl: string) => void;
  bankInfo: BankInfo;
  onUpdateBankInfo: (newInfo: BankInfo) => void;
  onSaveAllDataToServer: () => Promise<void>;
}

const PengaturanPage: React.FC<PengaturanPageProps> = ({ currentUsername, currentPassword, onUpdateCredentials, storeInfo, onUpdateStoreInfo, logoUrl, onUpdateLogo, bankInfo, onUpdateBankInfo, onSaveAllDataToServer }) => {
  // State for store info
  const [currentStoreInfo, setCurrentStoreInfo] = useState<StoreInfo>(storeInfo);
  const [currentBankInfo, setCurrentBankInfo] = useState<BankInfo>(bankInfo);
  
  // State for username change
  const [newUsername, setNewUsername] = useState(currentUsername);
  
  // State for password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for server sync
  const [isSaving, setIsSaving] = useState(false);

  // State for feedback messages
  const [storeInfoMessage, setStoreInfoMessage] = useState({ type: '', text: '' });
  const [bankInfoMessage, setBankInfoMessage] = useState({ type: '', text: '' });
  const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [logoMessage, setLogoMessage] = useState({ type: '', text: '' });
  const [syncMessage, setSyncMessage] = useState({ type: '', text: '' });


  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setCurrentStoreInfo(storeInfo);
    setCurrentBankInfo(bankInfo);
  }, [storeInfo, bankInfo]);

  // Effect to auto-hide messages
  useEffect(() => {
    const messages = [storeInfoMessage, usernameMessage, passwordMessage, logoMessage, bankInfoMessage, syncMessage];
    const setters = [setStoreInfoMessage, setUsernameMessage, setPasswordMessage, setLogoMessage, setBankInfoMessage, setSyncMessage];
    
    messages.forEach((msg, index) => {
        if (msg.text) {
            const timer = setTimeout(() => setters[index]({ type: '', text: '' }), 3000);
            return () => clearTimeout(timer);
        }
    });

  }, [storeInfoMessage, usernameMessage, passwordMessage, logoMessage, bankInfoMessage, syncMessage]);

  const handleStoreInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const addressFields = ['street', 'village', 'subdistrict', 'city', 'province', 'postalCode'];
    if (addressFields.includes(name)) {
      setCurrentStoreInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    } else {
      setCurrentStoreInfo({
        ...currentStoreInfo,
        [name]: e.target.value
      });
    }
  };

  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBankInfo({
      ...currentBankInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleStoreInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreInfo(currentStoreInfo);
    setStoreInfoMessage({ type: 'success', text: 'Informasi toko berhasil diperbarui!' });
  };
  
  const handleBankInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBankInfo(currentBankInfo);
    setBankInfoMessage({ type: 'success', text: 'Informasi bank berhasil diperbarui!' });
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() === '') {
      setUsernameMessage({ type: 'error', text: 'Username tidak boleh kosong.' });
      return;
    }
    if (newUsername === currentUsername) {
      setUsernameMessage({ type: 'info', text: 'Username tidak berubah.' });
      return;
    }

    onUpdateCredentials({ newUsername: newUsername.trim() });
    setUsernameMessage({ type: 'success', text: 'Username berhasil diperbarui!' });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' }); // Reset message

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Semua kolom password harus diisi.' });
      return;
    }
    if (oldPassword !== currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Password lama yang Anda masukkan salah.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password baru minimal harus 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    onUpdateCredentials({ newPassword });
    setPasswordMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
    
    // Clear password fields after successful update
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newLogoUrl = reader.result as string;
        onUpdateLogo(newLogoUrl);
        setLogoMessage({ type: 'success', text: 'Logo berhasil diperbarui!' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToServerClick = () => {
    setIsSaving(true);
    setSyncMessage({ type: 'info', text: 'Menyimpan data ke server...' });

    onSaveAllDataToServer()
      .then(() => {
        setSyncMessage({ type: 'success', text: 'Semua data berhasil disimpan ke server!' });
      })
      .catch((error) => {
        console.error('Gagal menyimpan data ke server:', error);
        setSyncMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan data.' });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };
  
  const Message = ({ type, text }: { type: string, text: string }) => {
    if (!text) return null;
    const baseClasses = 'text-sm p-3 rounded-md mt-4';
    let colorClasses = '';
    if (type === 'success') colorClasses = 'bg-green-100 text-green-800';
    else if (type === 'error') colorClasses = 'bg-red-100 text-red-800';
    else if (type === 'info') colorClasses = 'bg-blue-100 text-blue-800';
    
    return <div className={`${baseClasses} ${colorClasses}`}>{text}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-secondary">Pengaturan</h1>

      {/* Save to Server */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Sinkronisasi Data</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div>
            <button
              type="button"
              onClick={handleSaveToServerClick}
              disabled={isSaving}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-wait flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Data ke Server'
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">Klik tombol ini untuk menyimpan semua data aplikasi (produk, transaksi, pegawai, dll.) ke server. Proses ini mungkin memerlukan beberapa saat.</p>
          </div>
        </div>
        <Message type={syncMessage.type} text={syncMessage.text} />
      </div>
      
      {/* Logo Change Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Logo Toko</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img src={logoUrl} alt="Logo Toko Saat Ini" className="w-24 h-24 object-cover rounded-full border-4 border-primary"/>
          <div>
            <button 
              type="button"
              onClick={handleLogoUploadClick}
              className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-slate-700 transition-colors"
            >
              Ubah Logo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <p className="text-xs text-gray-500 mt-2">Pilih file gambar (JPG, PNG, dll.) untuk diunggah.</p>
          </div>
        </div>
        <Message type={logoMessage.type} text={logoMessage.text} />
      </div>

      {/* Store Info Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Informasi Toko</h2>
        <form onSubmit={handleStoreInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Toko</label>
              <input type="text" id="name" name="name" value={currentStoreInfo.name} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field" />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
              <input type="text" id="phone" name="phone" value={currentStoreInfo.phone} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field" />
            </div>
          </div>
          <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Jalan</label>
              <input type="text" id="street" name="street" value={currentStoreInfo.address.street} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field" placeholder="Contoh: Jl. Raya Pembangunan No. 123"/>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="village" className="block text-sm font-medium text-gray-700">Desa / Kelurahan</label>
                <input type="text" id="village" name="village" value={currentStoreInfo.address.village} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field"/>
              </div>
              <div>
                <label htmlFor="subdistrict" className="block text-sm font-medium text-gray-700">Kecamatan</label>
                <input type="text" id="subdistrict" name="subdistrict" value={currentStoreInfo.address.subdistrict} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field"/>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kabupaten / Kota</label>
                <input type="text" id="city" name="city" value={currentStoreInfo.address.city} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field"/>
              </div>
               <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provinsi</label>
                <input type="text" id="province" name="province" value={currentStoreInfo.address.province} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field"/>
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Kode Pos</label>
                <input type="text" id="postalCode" name="postalCode" value={currentStoreInfo.address.postalCode} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field"/>
              </div>
           </div>
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Toko</label>
              <input type="email" id="email" name="email" value={currentStoreInfo.email} onChange={handleStoreInfoChange} className="mt-1 block w-full input-field" />
            </div>
          <div>
            <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700">Jam Buka</label>
            <textarea id="openingHours" name="openingHours" value={currentStoreInfo.openingHours} onChange={handleStoreInfoChange} rows={4} className="mt-1 block w-full input-field" placeholder="Contoh:&#10;Senin - Jumat: 08:00 - 17:00&#10;Sabtu: 08:00 - 15:00"></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors">
              Simpan Informasi Toko
            </button>
          </div>
          <Message type={storeInfoMessage.type} text={storeInfoMessage.text} />
        </form>
      </div>
      
      {/* Bank Info Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Informasi Bank</h2>
        <form onSubmit={handleBankInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Nama Bank</label>
              <input type="text" id="bankName" name="bankName" value={currentBankInfo.bankName} onChange={handleBankInfoChange} className="mt-1 block w-full input-field" placeholder="Contoh: BCA" />
            </div>
             <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Nomor Rekening</label>
              <input type="text" id="accountNumber" name="accountNumber" value={currentBankInfo.accountNumber} onChange={handleBankInfoChange} className="mt-1 block w-full input-field" placeholder="Contoh: 1234567890" />
            </div>
          </div>
           <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Nama Pemilik Rekening</label>
              <input type="text" id="accountName" name="accountName" value={currentBankInfo.accountName} onChange={handleBankInfoChange} className="mt-1 block w-full input-field" placeholder="Contoh: Budi Sanjaya" />
            </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors">
              Simpan Informasi Bank
            </button>
          </div>
          <Message type={bankInfoMessage.type} text={bankInfoMessage.text} />
        </form>
      </div>

      {/* Change Username Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Ubah Username</h2>
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username Baru</label>
            <input
              type="text"
              id="username"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameMessage({ type: '', text: '' });
              }}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
            >
              Simpan Username
            </button>
          </div>
          <Message type={usernameMessage.type} text={usernameMessage.text} />
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Ubah Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="old-password"  className="block text-sm font-medium text-gray-700">Password Lama</label>
            <input
              type="password"
              id="old-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="new-password"  className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
            >
              Simpan Password
            </button>
          </div>
          <Message type={passwordMessage.type} text={passwordMessage.text} />
        </form>
      </div>
    </div>
  );
};

export default PengaturanPage;

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