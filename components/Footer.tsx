import React from 'react';
import type { StoreInfo, Address } from '../types';

interface FooterProps {
  storeInfo: StoreInfo;
}

export const Footer: React.FC<FooterProps> = ({ storeInfo }) => {
  const currentYear = new Date().getFullYear();

  const formatAddress = (address: Address): string => {
    return [
      address.street,
      address.village,
      address.subdistrict,
      address.city,
      address.province,
      address.postalCode
    ].filter(Boolean).join(', ');
  }

  return (
    <footer id="footer" className="bg-secondary text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4 font-display tracking-wide">{storeInfo.name}</h3>
            <p className="text-slate-300">{formatAddress(storeInfo.address)}</p>
            <p className="text-slate-300">{storeInfo.phone}</p>
            <p className="text-slate-300">{storeInfo.email}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Jam Buka</h3>
            {storeInfo.openingHours.split('\n').map((line, index) => (
              <p key={index} className="text-slate-300">{line}</p>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-slate-300 hover:text-primary transition-colors">Facebook</a>
              <a href="#" className="text-slate-300 hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="text-slate-300 hover:text-primary transition-colors">Whatsapp</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-500 text-center text-sm text-slate-400">
          <p>&copy; {currentYear} {storeInfo.name}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};