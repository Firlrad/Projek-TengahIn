import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Scale,
  Coffee,
  Users,
  Compass,
  CheckCircle2,
  X,
  Navigation,
  HelpCircle,
  Clock,
  ChevronDown,
  ShieldCheck,
  Zap
} from 'lucide-react';

// Reusable Scroll-Reveal Component using IntersectionObserver
function Reveal({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage({ onStartSearching }) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Keyboard Escape listener & Body scroll-lock for Modal
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

  const handleStart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onStartSearching();
  };

  // Smooth scroll handler for navbar links (with header offset)
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      q: "Perlu daftar atau bikin akun dulu gak?",
      a: "Gak perlu sama sekali! TengahIn bisa langsung kamu pakai gratis tanpa registrasi, tanpa login, dan tanpa install aplikasi. Buka webnya, masukkan lokasi teman, langsung jadi."
    },
    {
      q: "Bisa dipakai untuk berapa orang sekaligus?",
      a: "Bebas! Mulai dari berdua, bertiga, sampai sekelompok geng nugas (5 orang atau lebih). Algoritma akan mencari titik temu yang selisih waktu tempuhnya paling adil bagi seluruh peserta."
    },
    {
      q: "Apakah ini cuma bisa dipakai di Surabaya?",
      a: "Bisa dipakai di kota mana saja di Indonesia. Selama lokasinya terhubung rute jalan raya resmi, sistem pemetaan rute kami (OSRM) bisa menghitung estimasi waktu tempuh nyatanya."
    },
    {
      q: "Kafé yang direkomendasikan beneran cocok buat nugas?",
      a: "Ya! Sistem kami memfilter tempat nongkrong di sekitar titik optimal dan memprioritaskan kafe atau coworking space yang punya fasilitas ramah nugas: banyak colokan listrik, koneksi Wi-Fi yang layak, dan ulasan bagus."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-body animate-fade-in">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1 transition-transform active:scale-95"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="font-headline font-bold text-xl text-slate-900 tracking-tight">TengahIn</span>
            </div>
          </div>

          <nav aria-label="Navigasi utama" className="flex items-center gap-3 sm:gap-6">
            <a
              href="#cara-kerja"
              onClick={(e) => scrollToSection(e, 'cara-kerja')}
              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-2 py-1"
            >
              Cara Kerja
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-2 py-1"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-2 py-1"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Kenapa Adil?</span>
            </button>
            <button
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-sm hover:bg-indigo-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <span>Mulai Cari Titik</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Copywriting with smooth entrance */}
            <Reveal className="lg:col-span-6 flex flex-col items-start gap-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Smart Fair-Routing · Nongkrong adil tanpa debat</span>
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.18] tracking-tight text-balance">
                Nongkrong &amp; Nugas Bareng, Gak Pake Drama Kejauhan.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-pretty">
                Gak perlu debat 1 jam di grup chat cuma buat nanya <span className="italic font-medium text-slate-700">"kumpul di mana nih?"</span>. <strong>TengahIn</strong> otomatis carikan titik temu paling seimbang berdasarkan waktu tempuh jalan asli, plus rekomendasi kafe yang pas buat nugas.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <span>Cari Titik Temu Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-slate-700 border border-slate-200 font-semibold hover:bg-slate-50 active:scale-95 transition text-sm sm:text-base shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>Gimana Cara Kerjanya?</span>
                </button>
              </div>

              {/* Social proof bullet & Integrations */}
              <div className="flex flex-col gap-2 pt-1 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Menghitung estimasi rute jalan riil · Bukan sekadar garis lurus peta</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Terintegrasi dengan:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    <Compass className="w-3 h-3 text-indigo-600" /> OpenStreetMap (OSRM)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> FastAPI Engine
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    <MapPin className="w-3 h-3 text-rose-500" /> Overpass Places API
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Right Interactive Visual Card with smooth entrance */}
            <Reveal delay={150} className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-3.5 sm:p-4 shadow-xl shadow-slate-100 flex flex-col gap-3.5 hover:shadow-2xl transition-shadow duration-300">
                
                {/* Mockup Canvas */}
                <div className="relative rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 overflow-hidden min-h-[320px] p-4 sm:p-5 flex flex-col justify-between">
                  
                  {/* Map Grid & Curves */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 500 320" fill="none" aria-hidden="true">
                    <path d="M0 80 H500 M0 160 H500 M0 240 H500 M100 0 V320 M250 0 V320 M400 0 V320" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M40 260 Q150 200 250 155" stroke="#4F46E5" strokeWidth="3" strokeDasharray="6 4" className="animate-dash-flow" />
                    <path d="M420 230 Q335 185 250 155" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6 4" className="animate-dash-flow" />
                    <path d="M190 50 Q220 100 250 155" stroke="#F43F5E" strokeWidth="3" strokeDasharray="6 4" className="animate-dash-flow" />
                  </svg>

                  {/* Top Floating Fairness Pill */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-xs border border-emerald-200">
                      <Scale className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Beda waktu cuma 3 menit!</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white text-slate-600 border border-slate-200 text-xs font-mono font-medium shadow-xs">
                      Surabaya
                    </span>
                  </div>

                  {/* Center Optimal Point Marker */}
                  <div className="relative z-10 self-center my-auto flex flex-col items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-14 h-14 rounded-full bg-emerald-400 opacity-30 animate-ping"></div>
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white">
                        <MapPin className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-800 text-center inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Titik Optimal · Dharmahusada</span>
                    </span>
                  </div>

                  {/* Bottom Participant Pills */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
                      Amas (ITS): 12 mnt
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      Rehan (Unair B): 11 mnt
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                      Faiz (Pakuwon): 14 mnt
                    </span>
                  </div>
                </div>

                {/* Recommended Cafe Card Preview */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">Historica Coffee &amp; Pastry</p>
                      <p className="text-xs text-slate-600 truncate">180 m dari titik tengah · Banyak colokan &amp; Wi-Fi kencang</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold shrink-0">
                    94% Match
                  </span>
                </div>

              </div>
            </Reveal>

          </div>
        </section>

        {/* Section: 3 Langkah Praktis */}
        <section id="cara-kerja" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-200">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simpel &amp; Cepat</span>
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900">
                  3 Langkah Praktis Cari Titik Temu
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Cepat, adil, transparan, dan nggak ada yang merasa dikorbankan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline self-start md:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md py-1"
              >
                <span>Pelajari cara algoritma menghitung</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <Reveal delay={100}>
              <article className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-bold text-indigo-600 tracking-wider uppercase">Langkah 1</span>
                <h3 className="font-bold text-base text-slate-900">Input Lokasi Teman-Temanmu</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cukup ketik alamat kosan, kampus, atau aktifkan GPS masing-masing teman yang mau ikut nongkrong.
                </p>
              </article>
            </Reveal>

            {/* Card 2 */}
            <Reveal delay={200}>
              <article className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Scale className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-bold text-emerald-600 tracking-wider uppercase">Langkah 2</span>
                <h3 className="font-bold text-base text-slate-900">AI Hitung Jalur Paling Adil</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Algoritma memeriksa rute jalan raya sungguhan agar waktu tempuh semua orang seimbang dan selisihnya seminimal mungkin.
                </p>
              </article>
            </Reveal>

            {/* Card 3 */}
            <Reveal delay={300}>
              <article className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-bold text-amber-600 tracking-wider uppercase">Langkah 3</span>
                <h3 className="font-bold text-base text-slate-900">Pilih Tempat &amp; Langsung OTW</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dapatkan rekomendasi kafe dan coworking space terbaik tepat di sekitar titik temu, lengkap dengan jarak dan fasilitasnya.
                </p>
              </article>
            </Reveal>

          </div>
        </section>

        {/* Section: FAQ */}
        <section id="faq" className="scroll-mt-24 max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-200">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Segala hal yang perlu kamu ketahui sebelum mulai mencari titik temu.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <Reveal key={index} delay={index * 80}>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs hover:border-slate-300">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ease-out ${
                          isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Bottom Banner CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <Reveal delay={100}>
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100">
              <div className="text-center sm:text-left">
                <h3 className="font-headline text-2xl sm:text-3xl font-bold">Siap Nongkrong Tanpa Ribet?</h3>
                <p className="text-indigo-100 text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
                  Masukkan titik berangkat teman-temanmu sekarang dan temukan lokasi kumpul paling adil dalam hitungan detik.
                </p>
              </div>
              <button
                onClick={handleStart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm sm:text-base shadow-sm hover:bg-indigo-50 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
              >
                <span>Mulai Cari Titik Temu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
          <p>
            <strong>TengahIn</strong> — Fair Meeting Point untuk Mahasiswa.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleStart}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
            >
              Buka Workspace Peta →
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Penjelasan AI (Accessible, Dismissable via ESC and click-outside) */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAiModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-modal-title"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-lg w-full text-slate-800 relative max-h-[90vh] overflow-y-auto">
            
            <header className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Logika Fairness</span>
                </div>
                <h2 id="ai-modal-title" className="text-xl font-bold font-headline text-slate-900">
                  Kenapa Dibilang Paling Adil?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Sistem kami dirancang agar tidak ada satu orang pun yang merasa dikorbankan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                aria-label="Tutup dialog"
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex flex-col gap-3 my-4">
              
              {/* Stage 1 */}
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

              {/* Stage 2 */}
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

              {/* Stage 3 */}
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

            <footer className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Tutup (Esc)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  handleStart();
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Coba Sekarang
              </button>
            </footer>

          </div>
        </div>
      )}
    </div>
  );
}
