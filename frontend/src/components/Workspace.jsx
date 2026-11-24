import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Sparkles,
  MapPin,
  Users,
  Car,
  Bike,
  Footprints,
  Coffee,
  UtensilsCrossed,
  Trees,
  Search,
  Crosshair,
  Trash2,
  UserPlus,
  ArrowLeft,
  HelpCircle,
  X,
  Scale,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Compass,
  Zap,
  Wifi,
  Moon,
  Wallet,
  History,
  PanelLeftClose,
  PanelLeft,
  Calendar,
  Clock,
  Layers,
  Fuel,
  Coins,
  Loader2
} from 'lucide-react';
import { calculateWithFallback, reverseGeocode } from '../services/api';
import MapView from './MapView';

const SURABAYA_SUGGESTIONS = [
  { name: 'ITS Sukolilo, Surabaya Timur', lat: -7.28197, lng: 112.79532 },
  { name: 'Unair Kampus B, Gubeng', lat: -7.27138, lng: 112.75882 },
  { name: 'Pakuwon Mall, Surabaya Barat', lat: -7.29745, lng: 112.67568 },
  { name: 'Tunjungan Plaza, Surabaya Pusat', lat: -7.2625, lng: 112.7428 },
  { name: 'UINSA Kampus Ahmad Yani, Surabaya Selatan', lat: -7.3328, lng: 112.7351 },
  { name: 'Universitas Ciputra, CitraLand', lat: -7.2891, lng: 112.6325 },
  { name: 'Royal Plaza, Wonokromo', lat: -7.3094, lng: 112.7348 }
];

const DEFAULT_RECOMMENDATIONS = [
  {
    name: 'Historica Coffee & Pastry',
    dist: '180 m',
    score: '94% Match',
    note: 'Wi-Fi 100 Mbps · Stopkontak tiap meja · Tenang',
    tags: ['colokan', 'wifi', 'budget'],
    lat: -7.2721,
    lng: 112.7485,
    x: 44,
    y: 42
  },
  {
    name: 'Kopi Nalar Dharmahusada',
    dist: '260 m',
    score: '91% Match',
    note: 'Ruang diskusi lega · Parkir motor/mobil luas · Buka 24 Jam',
    tags: ['colokan', 'wifi', 'midnight'],
    lat: -7.269,
    lng: 112.763,
    x: 54,
    y: 46
  },
  {
    name: 'Teras Kertajaya Coffee',
    dist: '340 m',
    score: '88% Match',
    note: 'Harga mahasiswa (< 20rb) · Buka sampai 23.00 · Outdoor adem',
    tags: ['budget', 'wifi', 'midnight'],
    lat: -7.278,
    lng: 112.768,
    x: 41,
    y: 53
  },
  {
    name: 'Oost Koffie & Eatery',
    dist: '490 m',
    score: '85% Match',
    note: 'Area indoor AC dingin & outdoor banyak colokan',
    tags: ['colokan', 'wifi'],
    lat: -7.263,
    lng: 112.752,
    x: 50,
    y: 38
  },
  {
    name: 'Jokopi Gubeng Airlangga',
    dist: '620 m',
    score: '82% Match',
    note: 'Menu kopi ramah kantong · Dekat halte Suroboyo Bus',
    tags: ['budget', 'colokan'],
    lat: -7.267,
    lng: 112.754,
    x: 46,
    y: 58
  }
];

export default function Workspace({ onBackToHome, backendStatus }) {
  // Navigation & Layout states
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'results' | 'history'
  const [sidebarOpen, setSidebarOpen] = useState(true); // Toggleable sidebar
  const [mapViewMode, setMapViewMode] = useState('leaflet'); // 'leaflet' | 'vector'
  const [isLoading, setIsLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Simulation Mode state
  const [forceSimulation, setForceSimulation] = useState(backendStatus !== 'healthy');

  // Preferences state
  const [transportMode, setTransportMode] = useState('driving');
  const [category, setCategory] = useState('cafe');
  const [radius, setRadius] = useState(800);
  const [selectedStudentTags, setSelectedStudentTags] = useState(['colokan', 'wifi']);

  // Participants state (with real coordinates)
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Raka', address: 'ITS Sukolilo, Surabaya Timur', color: 'bg-indigo-600', lat: -7.28197, lng: 112.79532 },
    { id: 2, name: 'Sinta', address: 'Unair Kampus B, Gubeng', color: 'bg-amber-500', lat: -7.27138, lng: 112.75882 },
    { id: 3, name: 'Dimas', address: 'Pakuwon Mall, Surabaya Barat', color: 'bg-rose-500', lat: -7.29745, lng: 112.67568 }
  ]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(null);
  const [liveGeocodeResults, setLiveGeocodeResults] = useState([]);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [locatingIdx, setLocatingIdx] = useState(null);
  const debounceTimerRef = useRef(null);

  // Calculation Results state
  const [calculationResult, setCalculationResult] = useState({
    optimalPoint: 'Dharmahusada',
    optimalLat: -7.2685,
    optimalLng: 112.76,
    fairnessScore: 'Sangat Adil',
    timeDiff: '3 menit',
    minDuration: '11 menit',
    maxDuration: '14 menit',
    routes: [
      { name: 'Raka (ITS Sukolilo)', duration: '12 mnt', distance: '4.2 km', distNum: 4.2, color: 'bg-indigo-600' },
      { name: 'Sinta (Unair Kampus B)', duration: '11 mnt', distance: '3.1 km', distNum: 3.1, color: 'bg-amber-500' },
      { name: 'Dimas (Pakuwon Mall)', duration: '14 mnt', distance: '6.4 km', distNum: 6.4, color: 'bg-rose-500' }
    ],
    recommendations: DEFAULT_RECOMMENDATIONS
  });

  // History state (saved in localStorage)
  const [historySessions, setHistorySessions] = useState(() => {
    try {
      const saved = localStorage.getItem('tengahin_history_sessions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'sample-1',
          date: 'Hari ini, 19.30',
          participantCount: 3,
          participants: [
            { id: 1, name: 'Raka', address: 'ITS Sukolilo, Surabaya Timur', color: 'bg-indigo-600', lat: -7.28197, lng: 112.79532 },
            { id: 2, name: 'Sinta', address: 'Unair Kampus B, Gubeng', color: 'bg-amber-500', lat: -7.27138, lng: 112.75882 },
            { id: 3, name: 'Dimas', address: 'Pakuwon Mall, Surabaya Barat', color: 'bg-rose-500', lat: -7.29745, lng: 112.67568 }
          ],
          optimalPoint: 'Dharmahusada',
          topCafe: 'Historica Coffee & Pastry',
          timeDiff: 'Beda 3 menit'
        }
      ];
    } catch {
      return [];
    }
  });

  // Map state
  const [focusedCafe, setFocusedCafe] = useState(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapTranslate, setMapTranslate] = useState({ x: 0, y: 0 });

  // Escape key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAiModal) {
        setShowAiModal(false);
      }
    };
    if (showAiModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAiModal]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tengahin_history_sessions', JSON.stringify(historySessions));
    } catch (e) {
      console.warn('Gagal menyimpan riwayat ke localStorage:', e);
    }
  }, [historySessions]);

  // Click outside to close address suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.address-input-wrapper')) {
        setActiveSuggestionIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Participant handlers
  const updateParticipant = (index, field, value) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrorMessage('');
  };

  // Live Geocoding search using Nominatim OpenStreetMap (Debounced)
  const handleAddressTyping = (idx, text) => {
    updateParticipant(idx, 'address', text);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (text.trim().length >= 3) {
      setIsSearchingGeocode(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              text
            )}&countrycodes=id&limit=4`,
            { headers: { 'Accept-Language': 'id' } }
          );
          const data = await res.json();
          setLiveGeocodeResults(
            data.map((item) => ({
              name: item.display_name.split(',').slice(0, 3).join(','),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }))
          );
        } catch {
          // Graceful fallback to local suggestions
          setLiveGeocodeResults([]);
        } finally {
          setIsSearchingGeocode(false);
        }
      }, 500);
    } else {
      setLiveGeocodeResults([]);
      setIsSearchingGeocode(false);
    }
  };

  const handlePickAddress = (idx, item) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        address: item.name,
        lat: item.lat,
        lng: item.lng
      };
      return next;
    });
    setActiveSuggestionIdx(null);
    setLiveGeocodeResults([]);
  };

  const addParticipant = () => {
    const colors = ['bg-indigo-600', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-600', 'bg-sky-500', 'bg-purple-600'];
    setParticipants((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Teman ${prev.length + 1}`,
        address: '',
        color: colors[prev.length % colors.length],
        lat: -7.27 + (Math.random() - 0.5) * 0.05,
        lng: 112.75 + (Math.random() - 0.5) * 0.05
      }
    ]);
    setErrorMessage('');
  };

  const removeParticipant = (index) => {
    if (participants.length <= 2) {
      setErrorMessage('Minimal 2 teman ya, agar titik tengahnya bisa dihitung!');
      return;
    }
    setParticipants((prev) => prev.filter((_, idx) => idx !== index));
    setErrorMessage('');
  };

  const handleUseMyLocation = (index) => {
    if (!navigator.geolocation) {
      updateParticipant(index, 'address', 'Lokasi Saya (Gubeng, Surabaya)');
      return;
    }

    setLocatingIdx(index);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const streetAddress = await reverseGeocode(lat, lng);
          setParticipants((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              address: streetAddress,
              lat,
              lng
            };
            return next;
          });
        } catch {
          setParticipants((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              address: `Lokasi GPS Saya (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              lat,
              lng
            };
            return next;
          });
        } finally {
          setLocatingIdx(null);
        }
      },
      () => {
        setLocatingIdx(null);
        setErrorMessage('Gagal mendeteksi sinyal GPS. Menggunakan lokasi default.');
        updateParticipant(index, 'address', 'Lokasi Saya (Gubeng, Surabaya)');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const toggleStudentTag = (tagKey) => {
    setSelectedStudentTags((prev) =>
      prev.includes(tagKey) ? prev.filter((t) => t !== tagKey) : [...prev, tagKey]
    );
  };

  // Calculation trigger
  const handleCalculate = async () => {
    const emptyAddress = participants.some((p) => !p.address.trim());
    if (emptyAddress) {
      setErrorMessage('Pastikan semua teman sudah diisi alamat titik berangkatnya ya!');
      return;
    }
    if (participants.length < 2) {
      setErrorMessage('Minimal 2 orang teman untuk mencari titik tengah yang adil!');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const payload = {
        participants,
        transportMode,
        category,
        radius,
        preferences: selectedStudentTags
      };

      const result = await calculateWithFallback(payload, forceSimulation);

      const optimalName = result.data.optimal_point?.name || 'Dharmahusada';
      const maxDiff = result.data.optimal_point?.max_diff_minutes || 3;
      const minDur = result.data.optimal_point?.min_duration_minutes || 11;
      const maxDur = result.data.optimal_point?.max_duration_minutes || 14;

      setCalculationResult({
        optimalPoint: optimalName,
        optimalLat: result.data.optimal_point?.lat || -7.2685,
        optimalLng: result.data.optimal_point?.lng || 112.76,
        fairnessScore: result.data.optimal_point?.fairness_score || 'Sangat Adil',
        timeDiff: `${maxDiff} menit`,
        minDuration: `${minDur} menit`,
        maxDuration: `${maxDur} menit`,
        routes: (result.data.participant_routes || []).map((r, i) => {
          const distNum = parseFloat(r.distance) || (3.5 + i * 1.1);
          return {
            name: `${r.name} (${r.address || 'Lokasi'})`,
            duration: r.duration || `${10 + i * 2} mnt`,
            distance: r.distance || `${distNum.toFixed(1)} km`,
            distNum,
            color: participants[i]?.color || 'bg-indigo-600'
          };
        }),
        recommendations: result.data.recommendations || DEFAULT_RECOMMENDATIONS
      });

      // Save to History automatically
      const newSession = {
        id: 'session-' + Date.now(),
        date:
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ', ' +
          new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        participantCount: participants.length,
        participants: JSON.parse(JSON.stringify(participants)),
        optimalPoint: optimalName,
        topCafe: result.data.recommendations?.[0]?.name || 'Historica Coffee & Pastry',
        timeDiff: `Beda ${maxDiff} menit`
      };

      setHistorySessions((prev) => [newSession, ...prev.slice(0, 9)]);

      setIsLoading(false);
      setActiveTab('results');
      resetMapZoom();
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Terjadi kendala saat kalkulasi. Menggunakan mode simulasi offline.');
    }
  };

  // Restore history session
  const handleRestoreSession = (session) => {
    setParticipants(JSON.parse(JSON.stringify(session.participants)));
    setActiveTab('results');
    resetMapZoom();
  };

  const handleDeleteHistoryItem = (id) => {
    setHistorySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistorySessions([]);
    try {
      localStorage.removeItem('tengahin_history_sessions');
    } catch (e) {}
  };

  // Map Controls
  const handleFocusCafe = (cafe) => {
    setFocusedCafe(cafe);
    setMapScale(1.3);
    setMapTranslate({
      x: (50 - cafe.x) * 3.5,
      y: (50 - cafe.y) * 3.5
    });
  };

  const resetMapZoom = () => {
    setFocusedCafe(null);
    setMapScale(1);
    setMapTranslate({ x: 0, y: 0 });
  };

  // Clean Share Text Formatter (No emojis)
  const generateShareText = () => {
    const topCafe = calculationResult.recommendations[0] || DEFAULT_RECOMMENDATIONS[0];
    const participantRoutes = calculationResult.routes
      .map((p) => {
        const gasCost = Math.round(p.distNum * 500);
        return `- ${p.name}: ${p.duration} (${p.distance}) ~Bensin Rp ${gasCost.toLocaleString('id-ID')}`;
      })
      .join('\n');

    return `[TengahIn — Rekomendasi Titik Temu Adil]
========================================
Lokasi Optimal: ${calculationResult.optimalPoint}
Selisih Waktu: Cuma beda ${calculationResult.timeDiff} (${calculationResult.minDuration} - ${calculationResult.maxDuration})

Tempat Rekomendasi: ${topCafe.name}
Kecocokan: ${topCafe.score} (${topCafe.note})
Google Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(topCafe.name + ' Surabaya')}

Estimasi Perjalanan Teman:
${participantRoutes}

Dihitung adil menggunakan TengahIn.`;
  };

  const handleCopySummary = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row bg-slate-50 text-slate-800 font-body animate-fade-in overflow-hidden relative">
      
      {/* ================= LEFT SIDEBAR (Collapsible Desktop & Mobile) ================= */}
      <aside
        className={`w-full lg:w-[440px] shrink-0 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col h-[65vh] lg:h-screen shadow-lg z-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:-ml-[440px] pointer-events-none opacity-0'
        }`}
      >
        {/* Sidebar Header */}
        <header className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="font-headline font-bold text-lg text-slate-900 leading-tight">TengahIn</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Workspace Titik Temu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Simulation Toggle */}
            <button
              type="button"
              onClick={() => setForceSimulation(!forceSimulation)}
              title="Klik untuk beralih antara Mode Simulasi dan Backend Live"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border transition ${
                forceSimulation
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${forceSimulation ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{forceSimulation ? 'Simulasi' : 'Live API'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Cara Kerja Logika AI"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </button>

            {/* Collapse Sidebar Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Sembunyikan Panel (Peta Penuh)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Sidebar Body */}
        <div className="flex-1 flex flex-col overflow-y-auto divide-y divide-slate-100">
          
          {/* 3 Tabs Switcher */}
          <div className="p-3.5 pb-0">
            <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'input'}
                onClick={() => setActiveTab('input')}
                className={`inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all text-[11px] sm:text-xs ${
                  activeTab === 'input'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Input</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'results'}
                onClick={() => setActiveTab('results')}
                className={`inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all text-[11px] sm:text-xs ${
                  activeTab === 'results'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Hasil</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all text-[11px] sm:text-xs ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Riwayat ({historySessions.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: INPUT LOKASI */}
          {activeTab === 'input' && !isLoading && (
            <div className="p-4 sm:p-5 flex flex-col gap-6 animate-fade-in">
              
              {/* Simulation Mode Info Banner */}
              {forceSimulation && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-fade-in">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Mode Simulasi Frontend:</strong> Input alamat terhubung ke OpenStreetMap &amp; kalkulasi berjalan otomatis secara lokal.
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section: Daftar Peserta */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Titik Berangkat Teman</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {participants.length} orang
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${p.color} shrink-0`}></span>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
                            placeholder="Nama teman"
                            className="w-full text-xs font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-400"
                          />
                        </div>
                        {participants.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeParticipant(idx)}
                            title="Hapus teman"
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Search Input with Live Nominatim OSM Autocomplete */}
                      <div className="relative address-input-wrapper">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={p.address}
                          onFocus={() => setActiveSuggestionIdx(idx)}
                          onChange={(e) => handleAddressTyping(idx, e.target.value)}
                          placeholder="Ketik alamat kos, kampus, atau jalan..."
                          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleUseMyLocation(idx)}
                          disabled={locatingIdx === idx}
                          title={locatingIdx === idx ? 'Sedang mendeteksi GPS...' : 'Gunakan Lokasi GPS Saya'}
                          className="w-7 h-7 rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition"
                        >
                          {locatingIdx === idx ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          ) : (
                            <Crosshair className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Autocomplete Dropdown (Live OSM + Popular spots) */}
                        {activeSuggestionIdx === idx && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 max-h-56 overflow-y-auto animate-fade-in divide-y divide-slate-100">
                            {isSearchingGeocode && (
                              <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                                <span>Mencari koordinat OpenStreetMap...</span>
                              </div>
                            )}

                            {liveGeocodeResults.length > 0 && (
                              <div>
                                <p className="px-3 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/50">
                                  Hasil Pencarian Alamat Nyata
                                </p>
                                {liveGeocodeResults.map((item, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onMouseDown={() => handlePickAddress(idx, item)}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            <div>
                              <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                Rekomendasi Lokasi Populer
                              </p>
                              {SURABAYA_SUGGESTIONS.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onMouseDown={() => handlePickAddress(idx, sug)}
                                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{sug.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addParticipant}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50/70 hover:border-indigo-300 font-semibold text-xs transition active:scale-98"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Teman Lagi</span>
                </button>
              </section>

              {/* Section: Preferensi Pertemuan */}
              <section className="flex flex-col gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Preferensi Tempat Kumpul</h3>

                {/* Mode Transportasi */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Mode Transportasi Utama</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransportMode('driving')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        transportMode === 'driving'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Mobil/Motor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransportMode('cycling')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        transportMode === 'cycling'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Sepeda</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransportMode('walking')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        transportMode === 'walking'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Jalan Kaki</span>
                    </button>
                  </div>
                </div>

                {/* Kategori Tempat */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Suasana / Kategori</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('cafe')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        category === 'cafe'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Kafe Nugas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('restaurant')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        category === 'restaurant'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Restoran</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('park')}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        category === 'park'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Trees className="w-3.5 h-3.5" />
                      <span>Taman</span>
                    </button>
                  </div>
                </div>

                {/* Quick Student Filters */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Fasilitas Wajib Mahasiswa</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStudentTag('colokan')}
                      className={`inline-flex items-center justify-start gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedStudentTags.includes('colokan')
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Banyak Colokan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStudentTag('wifi')}
                      className={`inline-flex items-center justify-start gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedStudentTags.includes('wifi')
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Wi-Fi Kencang</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStudentTag('midnight')}
                      className={`inline-flex items-center justify-start gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedStudentTags.includes('midnight')
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-purple-500" />
                      <span>Buka Larut / 24 Jam</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStudentTag('budget')}
                      className={`inline-flex items-center justify-start gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedStudentTags.includes('budget')
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Harga Ramah (&lt; 25k)</span>
                    </button>
                  </div>
                </div>

                {/* Radius Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Radius Pencarian Kafe</span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {radius} meter
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>200m (Dekat banget)</span>
                    <span>2000m (Jangkauan luas)</span>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-98 transition-all mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Hitung Titik Tengah Optimal</span>
                </button>
              </section>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="p-8 flex flex-col items-center justify-center gap-4 text-center my-auto animate-fade-in">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-indigo-600 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {forceSimulation ? 'Simulasi AI Menghitung Rute Adil...' : 'Menghubungkan ke Backend AI...'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Mengecek estimasi jalan riil dengan OSRM &amp; meminimalkan perbedaan waktu perjalanan.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="h-12 rounded-xl bg-slate-100 animate-pulse"></div>
                <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
                <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* TAB 2: HASIL & REKOMENDASI */}
          {activeTab === 'results' && !isLoading && (
            <div className="p-4 sm:p-5 flex flex-col gap-5 animate-fade-in">
              
              {/* Fairness Highlight Card */}
              <section className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Skor Keadilan Optimal</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 font-mono text-xs font-bold">
                    {calculationResult.fairnessScore}
                  </span>
                </div>

                <div>
                  <h3 className="font-headline text-2xl font-bold tracking-tight">Hanya beda {calculationResult.timeDiff}!</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Titik temu berada di <strong>{calculationResult.optimalPoint}</strong> — semua teman sampai hampir bersamaan.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs">
                  <div>
                    <span className="text-emerald-100 block text-[11px]">Waktu Tercepat:</span>
                    <strong className="font-mono text-sm">{calculationResult.minDuration}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-100 block text-[11px]">Waktu Terlama:</span>
                    <strong className="font-mono text-sm">{calculationResult.maxDuration}</strong>
                  </div>
                </div>
              </section>

              {/* Salin Rangkuman Card */}
              <section className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Share2 className="w-4 h-4 text-indigo-700" />
                    <span>Rangkuman Titik Temu</span>
                  </div>
                  {copiedToast && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300 animate-fade-in flex items-center gap-1">
                      <Check className="w-3 h-3" /> Berhasil disalin!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Salin ringkasan hasil titik temu ini ke clipboard untuk dibagikan ke teman-temanmu.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs shadow-xs transition active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Rangkuman ke Clipboard</span>
                  </button>
                </div>
              </section>

              {/* Ringkasan Durasi & Estimasi Biaya Tiap Peserta */}
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Estimasi Perjalanan &amp; Biaya</span>
                  <span className="text-slate-400">Rute Jalan Nyata</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl divide-y divide-slate-200 overflow-hidden">
                  {calculationResult.routes.map((route, rIdx) => {
                    const gasCost = Math.round(route.distNum * 500);
                    const ojolCost = Math.max(10000, Math.round(8500 + route.distNum * 1900));

                    return (
                      <div key={rIdx} className="px-3.5 py-2.5 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${route.color || 'bg-indigo-600'} shrink-0`}></span>
                            <span className="font-semibold text-slate-800 truncate">{route.name}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700 shrink-0">
                            {route.duration} · {route.distance}
                          </span>
                        </div>
                        {/* Student Cost Insights */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 pl-4">
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-medium">
                            <Fuel className="w-3 h-3 text-emerald-700" />
                            <span>Bensin: ~Rp {gasCost.toLocaleString('id-ID')}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded font-medium">
                            <Coins className="w-3 h-3 text-slate-500" />
                            <span>Ojol: ~Rp {ojolCost.toLocaleString('id-ID')}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Top 5 Rekomendasi Kafe */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <span>Rekomendasi Tempat (Top 5)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Radius {radius}m</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {calculationResult.recommendations.map((cafe, idx) => (
                    <article
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 ${
                        focusedCafe?.name === cafe.name
                          ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <header className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{cafe.name}</h4>
                          <p className="text-xs text-slate-500">{cafe.dist} dari titik optimal</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold shrink-0">
                          {cafe.score}
                        </span>
                      </header>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cafe.note}
                      </p>

                      <footer className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {/* Google Maps External Link */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name + ' Surabaya')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                          title="Buka rute navigasi di Google Maps"
                        >
                          <span>Buka di Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleFocusCafe(cafe)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shrink-0 transition"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Lihat di Peta</span>
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('input')}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition mt-1"
                >
                  <span>Ubah Peserta / Preferensi</span>
                </button>
              </section>
            </div>
          )}

          {/* TAB 3: RIWAYAT SESI */}
          {activeTab === 'history' && !isLoading && (
            <div className="p-4 sm:p-5 flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Riwayat Pencarian Titik</h3>
                  <p className="text-xs text-slate-500">Sesi yang pernah kamu hitung sebelumnya</p>
                </div>
                {historySessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Bersihkan
                  </button>
                )}
              </div>

              {historySessions.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
                    Belum ada riwayat pencarian. Saat kamu menghitung titik temu, hasilnya akan otomatis tercatat di sini.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {historySessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{session.date}</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {session.timeDiff}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-800">
                          Titik Optimal: {session.optimalPoint}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {session.participantCount} Teman · Tempat: {session.topCafe}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => handleRestoreSession(session)}
                          className="font-bold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Buka Sesi Ini →
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(session.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Hapus dari riwayat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </aside>

      {/* ================= RIGHT MAP CANVAS (Leaflet Tile Map + Vector Fallback) ================= */}
      <main className="relative flex-1 h-[35vh] lg:h-screen bg-slate-100 overflow-hidden flex flex-col justify-between p-4 z-10">
        
        {/* VIEW 1: Real Interactive Leaflet OpenStreetMap */}
        {mapViewMode === 'leaflet' ? (
          <div className="absolute inset-0 z-0">
            <MapView
              participants={participants}
              optimalPoint={{
                name: calculationResult.optimalPoint,
                lat: calculationResult.optimalLat,
                lng: calculationResult.optimalLng
              }}
              recommendations={calculationResult.recommendations}
              radius={radius}
              focusedCafe={focusedCafe}
              onSelectCafe={handleFocusCafe}
              sidebarOpen={sidebarOpen}
            />
          </div>
        ) : (
          /* VIEW 2: Stylized Vector SVG Map */
          <div
            id="map-viewport"
            style={{
              transform: `scale(${mapScale}) translate(${mapTranslate.x}px, ${mapTranslate.y}px)`,
              transformOrigin: 'center center'
            }}
            className="absolute inset-0 transition-transform duration-500 ease-out select-none cursor-grab active:cursor-grabbing"
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid slice"
              aria-label="Peta vektor titik temu Surabaya"
            >
              <rect width="1000" height="800" fill="#F8FAFC" />
              <path
                d="M0 140 H1000 M0 320 H1000 M0 520 H1000 M0 680 H1000 M160 0 V800 M380 0 V800 M620 0 V800 M840 0 V800"
                stroke="#E2E8F0"
                strokeWidth="2"
              />
              <path d="M510 0 C530 200 470 400 500 800" stroke="#CBD5E1" strokeWidth="20" fill="none" opacity="0.7" />
              <path d="M80 620 L480 390 L860 560" stroke="#E2E8F0" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M520 150 L480 390" stroke="#E2E8F0" strokeWidth="12" fill="none" strokeLinecap="round" />

              <path
                d="M820 520 Q650 420 480 390"
                stroke="#4F46E5"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-dash-flow"
                fill="none"
              />
              <path
                d="M520 180 Q500 280 480 390"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-dash-flow"
                fill="none"
              />
              <path
                d="M160 560 Q310 470 480 390"
                stroke="#F43F5E"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-dash-flow"
                fill="none"
              />

              <circle
                cx="480"
                cy="390"
                r="115"
                fill="#10B981"
                fillOpacity="0.08"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse-glow"
              />
            </svg>

            {/* Pins on Vector */}
            <div className="absolute left-[82%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white shadow-md border-2 border-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 shadow-xs font-bold text-[10px] text-slate-800">
                {participants[0]?.name || 'Raka'}
              </span>
            </div>

            <div className="absolute left-[52%] top-[22%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white shadow-md border-2 border-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 shadow-xs font-bold text-[10px] text-slate-800">
                {participants[1]?.name || 'Sinta'}
              </span>
            </div>

            <div className="absolute left-[16%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group">
              <div className="w-9 h-9 rounded-full bg-rose-500 text-white shadow-md border-2 border-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 shadow-xs font-bold text-[10px] text-slate-800">
                {participants[2]?.name || 'Dimas'}
              </span>
            </div>

            <div className="absolute left-[48%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-20">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-14 h-14 rounded-full bg-emerald-400 opacity-30 animate-ping"></div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-xl border-3 border-white flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-700 text-white shadow-md font-bold text-xs tracking-tight inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Titik Temu Optimal · {calculationResult.optimalPoint}</span>
              </span>
            </div>
          </div>
        )}

        {/* Map Header Controls & Floating Open Button */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Button to Re-open Sidebar if collapsed */}
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200 shadow-md hover:bg-slate-50 text-xs font-bold transition active:scale-95"
              >
                <PanelLeft className="w-4 h-4 text-indigo-600" />
                <span>Buka Panel Kontrol</span>
              </button>
            )}

            {/* Mode Map Switcher (Leaflet Real Tiles vs Stylized Vector) */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapViewMode('leaflet')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  mapViewMode === 'leaflet'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peta Asli (OSM)
              </button>
              <button
                type="button"
                onClick={() => setMapViewMode('vector')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  mapViewMode === 'vector'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peta Vektor
              </button>
            </div>
          </div>

          {/* Integrations Indicator Pill */}
          <div className="pointer-events-auto hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs text-xs font-medium text-slate-700 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Terintegrasi:</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 border-l border-slate-200 pl-2">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>OSRM</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 border-l border-slate-200 pl-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Overpass</span>
              </span>
            </div>
          </div>
        </div>

        {/* Floating Legend (Bottom Left) */}
        <div className="relative z-20 self-start bg-white/95 backdrop-blur-xs border border-slate-200 rounded-2xl px-3.5 py-2 shadow-md flex flex-wrap items-center gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>Peserta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Titik Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-indigo-600 bg-white"></span>
            <span>Kafe</span>
          </div>
        </div>

      </main>

      {/* ================= MODAL: CARA KERJA AI ================= */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAiModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-lg w-full text-slate-800 relative max-h-[90vh] overflow-y-auto">
            <header className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Logika Fairness</span>
                </div>
                <h2 className="text-xl font-bold font-headline text-slate-900">
                  Cara Kerja AI TengahIn
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  3 tahap perhitungan matematis agar waktu tempuh semua orang seimbang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                aria-label="Tutup dialog"
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex flex-col gap-3 my-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Titik Awal (Geometric Center)</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                    Menghitung rata-rata koordinat seluruh teman sebagai titik awal sebelum mulai menguji rute jalan.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Optimasi Waktu Tempuh Nyata (Minimax Fairness)</h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-relaxed">
                    AI mengecek rute jalan raya asli (OSRM) dan menggeser titik secara iteratif dengan algoritma <em>Hill Climbing</em> sampai <strong>waktu perjalanan orang yang paling jauh bisa ditekan serendah mungkin</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Kurasi Kafe &amp; Tempat Nugas Terdekat</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                    Setelah titik optimal ketemu, sistem memindai tempat nongkrong di sekitarnya dan memprioritaskan tempat yang ramah buat nugas (Wi-Fi, colokan, rating tinggi).
                  </p>
                </div>
              </div>
            </div>

            <footer className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition"
              >
                Mengerti (Esc)
              </button>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}
