import React from 'react';
import { Users, Plus, MapPin } from 'lucide-react';

export default function ParticipantForm() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-slate-800">Daftar Partisipan</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Masukkan lokasi awal setiap anggota untuk mencari titik temu tengah.
      </p>
      {/* Placeholder form component */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>Partisipan 1 (Contoh)</span>
        </div>
      </div>
    </div>
  );
}
