import React, { useEffect, useState } from 'react';
import ParticipantForm from './components/ParticipantForm';
import MapView from './components/MapView';
import ResultPanel from './components/ResultPanel';
import { checkHealth } from './services/api';
import { MapPin, Activity } from 'lucide-react';

  export default function App() {
    const [backendStatus, setBackendStatus] = useState('checking...');

    useEffect(() => {
      checkHealth()
        .then((data) => setBackendStatus(data.status || 'connected'))
        .catch(() => setBackendStatus('offline (jalankan backend di port 8000)'));
    }, []);

    return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
              {/* Navbar */}
              <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-600 text-white p-2 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">TengahIn</h1>
                    <p className="text-xs text-slate-500">Fair Meeting Point Finder</p>
                  </div>
                </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Status Backend:</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${backendStatus === 'healthy' || backendStatus === 'connected'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                      {backendStatus}
                    </span>
                  </div>
              </header>

                  {/* Main Content Layout */}
                  <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-6">
                      <ParticipantForm />
                      <ResultPanel />
                    </div>
                      <div className="lg:col-span-8 flex flex-col">
                        <MapView />
                      </div>
                  </main>

                {/* Footer */}
                <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
                  Proyek TengahIn &copy; {new Date().getFullYear()} — Rehan (PM/UIUX), Amas (Frontend), Faiz (Backend), Firly (AI/Algo)
                </footer>
            </div>
            );
}
