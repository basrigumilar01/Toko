import React, { useState, useEffect, useRef } from 'react';
import type { Pegawai } from '../../types';

interface MasterPegawaiPageProps {
  employees: Pegawai[];
  onAddEmployee: (employee: Omit<Pegawai, 'id'>) => void;
  onUpdateEmployee: (employee: Pegawai) => void;
  onDeleteEmployee: (employeeId: number) => void;
}

const MasterPegawaiPage: React.FC<MasterPegawaiPageProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
  const [nama, setNama] = useState('');
  const [posisi, setPosisi] = useState('');
  const [status, setStatus] = useState<'aktif' | 'tidak aktif'>('aktif');
  const [editingEmployee, setEditingEmployee] = useState<Pegawai | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingEmployee) {
        setNama(editingEmployee.nama);
        setPosisi(editingEmployee.posisi);
        setStatus(editingEmployee.status);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
        setNama('');
        setPosisi('');
        setStatus('aktif');
    }
  }, [editingEmployee]);

  const handleEditClick = (employee: Pegawai) => {
    setEditingEmployee(employee);
  }

  const handleCancelEdit = () => {
    setEditingEmployee(null);
  }

  const handleDeleteClick = (employeeId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
        onDeleteEmployee(employeeId);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !posisi) {
        alert('Nama dan Posisi pegawai harus diisi.');
        return;
    };

    const employeeData = { nama, posisi, status };

    if (editingEmployee) {
      onUpdateEmployee({
        id: editingEmployee.id,
        ...employeeData
      });
    } else {
      onAddEmployee(employeeData);
    }

    setEditingEmployee(null); 
  };
  
  const StatusBadge = ({ status }: { status: 'aktif' | 'tidak aktif' }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
    if (status === 'aktif') {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Aktif</span>;
    }
    return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Tidak Aktif</span>;
  };

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  );
  
  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <div className="space-y-8">
      <div ref={formRef} className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-secondary mb-6">{editingEmployee ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="nama-pegawai" className="block text-sm font-medium text-gray-700">Nama Pegawai</label>
                    <input type="text" id="nama-pegawai" value={nama} onChange={e => setNama(e.target.value)} className="mt-1 block w-full input-field" required />
                </div>
                <div>
                    <label htmlFor="posisi" className="block text-sm font-medium text-gray-700">Posisi</label>
                    <input type="text" id="posisi" value={posisi} onChange={e => setPosisi(e.target.value)} className="mt-1 block w-full input-field" placeholder="Contoh: Kasir" required />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full input-field">
                        <option value="aktif">Aktif</option>
                        <option value="tidak aktif">Tidak Aktif</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end items-center gap-4">
                {editingEmployee && (
                   <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-secondary font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
                        Batal
                    </button>
                )}
                <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors">
                    {editingEmployee ? 'Simpan Perubahan' : 'Simpan Pegawai'}
                </button>
            </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">Daftar Pegawai</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pegawai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length > 0 ? (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.posisi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={employee.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center items-center gap-2">
                             <button 
                                onClick={() => handleEditClick(employee)}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center p-1 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                <EditIcon/>
                                Edit
                            </button>
                            <span className="text-gray-300">|</span>
                             <button 
                                onClick={() => handleDeleteClick(employee.id)}
                                className="text-red-600 hover:text-red-800 font-medium flex items-center p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <DeleteIcon/>
                                Hapus
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    Belum ada data pegawai yang ditambahkan.
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

export default MasterPegawaiPage;

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
