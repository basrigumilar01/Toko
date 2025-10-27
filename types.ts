export interface Address {
  street: string;
  village: string; // Desa/Kelurahan
  subdistrict: string; // Kecamatan
  city: string; // Kabupaten/Kota
  province: string; // Provinsi
  postalCode: string;
}

export interface Product {
  id: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
}

export interface TransactionItem {
  id: number;
  quantity: number;
  name: string;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: number;
  date: string;
  items: TransactionItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  buyerName?: string;
  buyerAddress?: string;
  cashierName?: string;
}

export interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
}

export interface Purchase {
  id: number;
  date: string;
  supplierName: string;
  items: PurchaseItem[];
  totalPurchaseCost: number;
}

export interface Pegawai {
  id: number;
  nama: string;
  posisi: string;
  status: 'aktif' | 'tidak aktif';
}

export interface StoreInfo {
  name: string;
  address: Address;
  phone: string;
  email: string;
  openingHours: string;
}

export interface BankInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
}