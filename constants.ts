import type { Transaction, Purchase } from './types';

export const mockTransactions: Transaction[] = [
  { 
    id: 1, 
    date: '2024-05-20T10:00:00Z',
    buyerName: 'Bapak Budi Santoso',
    buyerAddress: 'Jl. Merdeka No. 10, Jakarta',
    items: [
      { id: 101, quantity: 2, name: 'Semen Tiga Roda 40kg', unitPrice: 55000, total: 110000 },
      { id: 102, quantity: 1, name: 'Cat Dinding Avitex 5kg', unitPrice: 120000, total: 120000 },
    ],
    total: 230000,
    status: 'paid'
  },
  { 
    id: 2, 
    date: '2024-05-20T11:30:00Z',
    buyerName: 'CV. Karya Mandiri',
    buyerAddress: 'Komp. Industri Sentosa Blok C5, Bandung',
    items: [
      { id: 201, quantity: 10, name: 'Pipa PVC 4 inch', unitPrice: 25000, total: 250000 },
    ],
    total: 250000,
    status: 'paid'
  },
  { 
    id: 3, 
    date: '2024-05-19T15:00:00Z',
    buyerName: 'Ibu Retno Wulandari',
    buyerAddress: 'Perumahan Griya Asri, Jl. Anggrek 12, Surabaya',
    items: [
      { id: 301, quantity: 3, name: 'Keramik 40x40 Putih Polos', unitPrice: 45000, total: 135000 },
      { id: 302, quantity: 500, name: 'Bata Merah Super', unitPrice: 800, total: 400000 },
    ],
    total: 535000,
    status: 'paid'
  },
];

export const mockPurchases: Purchase[] = [
  {
    id: 1001,
    date: '2024-05-18T09:00:00Z',
    supplierName: 'PT. Semen Sentosa',
    items: [
      { productId: 1, productName: 'Semen Tiga Roda 40kg', quantity: 50, costPrice: 50000, totalCost: 2500000 },
    ],
    totalPurchaseCost: 2500000,
  },
  {
    id: 1002,
    date: '2024-05-17T14:30:00Z',
    supplierName: 'Distributor Cat Avian',
    items: [
      { productId: 2, productName: 'Cat Dinding Avitex 5kg', quantity: 20, costPrice: 108000, totalCost: 2160000 },
      { productId: 4, productName: 'Pipa PVC 4 inch', quantity: 30, costPrice: 21500, totalCost: 645000 },
    ],
    totalPurchaseCost: 2805000,
  },
];