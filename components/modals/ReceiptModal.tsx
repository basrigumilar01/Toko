import React, { useRef } from 'react';
import type { Transaction, StoreInfo, BankInfo, Address } from '../../types';

// Declare global libraries loaded via CDN
declare var html2canvas: any;
declare var jspdf: any;

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  paymentDetails: {
    cash: number;
    change: number;
  };
  logoUrl: string;
  storeInfo: StoreInfo;
  bankInfo: BankInfo;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction, paymentDetails, logoUrl, storeInfo, bankInfo }) => {
  const receiptContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;
  
  const terbilang = (n: number): string => {
      if (n < 0) return "Minus " + terbilang(Math.abs(n));
      const angka = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
      let temp = "";

      if (n < 12) {
          temp = " " + angka[n];
      } else if (n < 20) {
          temp = terbilang(n - 10) + " belas";
      } else if (n < 100) {
          temp = terbilang(Math.floor(n / 10)) + " puluh" + terbilang(n % 10);
      } else if (n < 200) {
          temp = " seratus" + terbilang(n - 100);
      } else if (n < 1000) {
          temp = terbilang(Math.floor(n / 100)) + " ratus" + terbilang(n % 100);
      } else if (n < 2000) {
          temp = " seribu" + terbilang(n - 1000);
      } else if (n < 1000000) {
          temp = terbilang(Math.floor(n / 1000)) + " ribu" + terbilang(n % 1000);
      } else if (n < 1000000000) {
          temp = terbilang(Math.floor(n / 1000000)) + " juta" + terbilang(n % 1000000);
      } else if (n < 1000000000000) {
          temp = terbilang(Math.floor(n / 1000000000)) + " milyar" + terbilang(n % 1000000000);
      } else if (n < 1000000000000000) {
          temp = terbilang(Math.floor(n / 1000000000000)) + " trilyun" + terbilang(n % 1000000000000);
      }

      return temp;
  }

  const numberToWords = (num: number): string => {
    if (num === 0) return "Nol Rupiah";
    const result = terbilang(num).trim();
    return result.charAt(0).toUpperCase() + result.slice(1) + " Rupiah";
  }


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long'
    }).format(new Date(dateString));
  }

  const formatStoreAddress = (address: Address): string => {
    const line1 = address.street;
    const line2 = [address.village, address.subdistrict].filter(Boolean).join(', ');
    const line3 = [address.city, address.province, address.postalCode].filter(Boolean).join(' ');
    return [line1, line2, line3].filter(Boolean).join('\n');
  }
  
  const handlePrint = () => {
    window.print();
  }

  const handleDownloadPdf = () => {
    if (receiptContentRef.current) {
      const { jsPDF } = jspdf;
      html2canvas(receiptContentRef.current, { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: receiptContentRef.current.scrollWidth,
          windowHeight: receiptContentRef.current.scrollHeight
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        const pdfName = `invoice-kwitansi-${storeInfo.name.replace(/\s/g, '-')}-${transaction.id}.pdf`;
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let pdfImageWidth = pageWidth; 
        let pdfImageHeight = pdfImageWidth / ratio;
        
        if (pdfImageHeight > pageHeight) {
            pdfImageHeight = pageHeight;
            pdfImageWidth = pdfImageHeight * ratio;
        }

        const x = (pageWidth - pdfImageWidth) / 2;
        const y = 0;
        
        pdf.addImage(imgData, 'PNG', x, y, pdfImageWidth, pdfImageHeight);
        pdf.save(pdfName);
      });
    }
  };

  const getCityFromAddress = (address: Address): string => {
    return address.city || 'Jakarta';
  };

  const invoiceView = (
      <div className="bg-white p-10 text-black">
        <div className="border-b-2 border-gray-200 pb-8 mb-8">
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <img src={logoUrl} alt="Logo Toko" className="w-20 h-20 object-contain rounded-md"/>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{storeInfo.name}</h2>
                        <p className="text-sm text-gray-500 max-w-xs whitespace-pre-line">{formatStoreAddress(storeInfo.address)}</p>
                        <p className="text-sm text-gray-500">{storeInfo.phone} | {storeInfo.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-bold text-primary-dark uppercase tracking-wider">Invoice</h1>
                    <p className="text-sm text-gray-500 mt-2">No. Invoice: <span className="font-semibold text-gray-700">#{transaction.id}</span></p>
                    <p className="text-sm text-gray-500">Tanggal: <span className="font-semibold text-gray-700">{formatDate(transaction.date)}</span></p>
                </div>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Ditagihkan Kepada:</h3>
            <p className="text-lg font-medium text-gray-800">{transaction.buyerName || 'Pelanggan Umum'}</p>
            {transaction.buyerAddress && <p className="text-sm text-gray-600">{transaction.buyerAddress}</p>}
        </div>

        <table className="w-full text-left table-auto mb-8">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-3 text-sm font-semibold text-gray-600 uppercase">No.</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 uppercase w-2/5">Deskripsi Barang</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Kuantitas</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Harga Satuan</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {transaction.items.map((item, index) => (
                    <tr key={item.id}>
                        <td className="p-3 text-gray-600">{index + 1}.</td>
                        <td className="p-3 font-medium text-gray-800">{item.name}</td>
                        <td className="p-3 text-gray-600 text-right">{item.quantity}</td>
                        <td className="p-3 text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-3 font-semibold text-gray-800 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm space-y-3">
                {transaction.subtotal != null && (
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">{formatCurrency(transaction.subtotal)}</span>
                  </div>
                )}
                {transaction.discount != null && transaction.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Diskon</span>
                    <span className="font-medium text-red-600">- {formatCurrency(transaction.discount)}</span>
                  </div>
                )}
                {transaction.tax != null && transaction.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>PPN</span>
                    <span className="font-medium text-gray-800">{formatCurrency(transaction.tax)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-primary-dark">{formatCurrency(transaction.total)}</span>
                </div>
                 <div className="border-t border-dashed pt-3 mt-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Tunai</span>
                        <span className="font-medium text-gray-800">{formatCurrency(paymentDetails.cash)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Kembalian</span>
                        <span className="font-medium text-gray-800">{formatCurrency(paymentDetails.change)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-8 mt-8">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Catatan & Informasi Pembayaran</h4>
            <div className="text-sm text-gray-600 space-y-1">
                <p>Pembayaran via transfer dapat dilakukan ke rekening berikut:</p>
                <p className="font-semibold">{bankInfo.bankName}: {bankInfo.accountNumber} a/n {bankInfo.accountName}</p>
                <p className="mt-4">Terima kasih telah berbelanja di {storeInfo.name}!</p>
            </div>
        </div>
    </div>
  );

  const kwitansiView = (
    <div className="bg-white p-10 pt-8 text-black font-serif">
      <div className="border-2 border-black p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{storeInfo.name}</h2>
            <p className="text-xs max-w-xs whitespace-pre-line">{formatStoreAddress(storeInfo.address)}</p>
          </div>
          <h1 className="text-3xl font-bold tracking-wider">KWITANSI</h1>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex border-b border-dotted">
            <span className="w-40 font-semibold">No.</span>
            <span>: #{transaction.id}</span>
          </div>
          <div className="flex border-b border-dotted">
            <span className="w-40 font-semibold">Telah terima dari</span>
            <span>: {transaction.buyerName || 'Pelanggan Umum'}</span>
          </div>
          <div className="flex items-start border-b border-dotted min-h-[4rem]">
            <span className="w-40 font-semibold">Uang sejumlah</span>
            <span className="flex-1 italic bg-gray-100 p-2">: {numberToWords(transaction.total)}</span>
          </div>
          <div className="flex items-start border-b border-dotted">
            <span className="w-40 font-semibold">Untuk pembayaran</span>
            <span className="flex-1">: Pembelian barang-barang bangunan sesuai invoice #{transaction.id}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-between items-end">
          <div className="border-2 border-black px-6 py-2">
            <span className="font-bold text-lg">{formatCurrency(transaction.total)},-</span>
          </div>
          <div className="text-center w-52">
            <p className="text-sm">{getCityFromAddress(storeInfo.address)}, {formatDate(transaction.date)}</p>
            <div className="relative h-20">
                <div className="absolute inset-0 flex justify-center items-center">
                    <div className="w-20 h-20 rounded-full border-2 border-blue-200 text-blue-300 flex items-center justify-center text-xs -rotate-12">
                        <span className="transform scale-150 opacity-50">{storeInfo.name}</span>
                    </div>
                </div>
            </div>
            <p className="border-t border-black mt-1 pt-1 font-semibold">{transaction.cashierName || storeInfo.name}</p>
            <p className="text-xs">(Yang Menerima)</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <style>{`
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body > *:not(.receipt-modal-root) {
          display: none !important;
        }
        .receipt-modal-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: auto !important;
          background-color: white !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        .receipt-modal-content {
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          height: auto !important;
        }
        .no-print {
          display: none !important;
        }
        .printable-area {
            padding: 0 !important;
        }
      }
    `}</style>
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-start p-4 overflow-auto receipt-modal-root">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 transform transition-all receipt-modal-content">
        
        {/* Header and Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-t-xl no-print border-b">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-secondary">Detail Transaksi (Invoice & Kwitansi)</h3>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                <span>Cetak Struk</span>
              </button>
               <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Simpan PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark"
              >
                Selesai & Transaksi Baru
              </button>
            </div>
          </div>
        </div>
        
        {/* Printable Content Area */}
        <div ref={receiptContentRef} className="printable-area bg-white text-black">
          {invoiceView}
          <div className="px-10">
            <hr className="border-t-2 border-dashed border-gray-300" />
          </div>
          {kwitansiView}
        </div>

      </div>
    </div>
    </>
  );
};

export default ReceiptModal;