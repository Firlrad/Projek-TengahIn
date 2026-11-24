import React from 'react';
import { Sparkles, Navigation } from 'lucide-react';

export default function ResultPanel() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-800">Hasil Rekomendasi Titik Temu</h2>
      </div>
      <div className="p-4 bg-brand-50 rounded-xl text-brand-700 text-sm flex items-start gap-3">
        <Navigation className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Titik Temu Optimal Belum Dihitung</p>
          <p className="text-xs text-brand-600 mt-1">
            Algoritma AI akan menentukan lokasi yang meminimalkan ketimpangan jarak dan waktu tempuh.
          </p>
        </div>
      </div>
    </div>
  );
}
