import React from 'react';

export default function MapView() {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
          🗺️
        </div>
        <h3 className="font-medium text-slate-700">Peta Interaktif (Leaflet)</h3>
        <p className="text-sm text-slate-400 mt-1">
          Peta akan merender rute dan titik temu adil setelah data partisipan dimasukkan.
        </p>
      </div>
    </div>
  );
}
