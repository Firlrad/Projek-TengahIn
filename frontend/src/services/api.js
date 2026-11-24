import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
};

export const calculateMeetingPoint = async (payload) => {
  try {
    const response = await apiClient.post('/api/find-meeting-point', payload);
    return response.data;
  } catch {
    const response = await apiClient.post('/api/calculate-meeting-point', payload);
    return response.data;
  }
};

// Reverse geocoding helper via OpenStreetMap Nominatim
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'id' } }
    );
    const data = await res.json();
    if (data?.display_name) {
      return data.display_name.split(',').slice(0, 3).join(',');
    }
  } catch {
    // fallback
  }
  return `Area Sekitar (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

// Hitung jarak Haversine (km)
const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Mode Cerdas: Mencoba menghubungkan ke backend terlebih dahulu.
// Jika endpoint backend belum online, otomatis beralih ke simulasi matematika riil.
export const calculateWithFallback = async (payload, forceSimulation = false) => {
  if (!forceSimulation) {
    try {
      let response;
      try {
        response = await apiClient.post('/api/find-meeting-point', payload);
      } catch {
        response = await apiClient.post('/api/calculate-meeting-point', payload);
      }
      if (response && response.data && (response.data.optimal_point || response.data.optimalPoint)) {
        return {
          data: response.data,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn('Backend live API belum aktif, beralih ke Mode Simulasi Cerdas:', err.message);
    }
  }

  // Simulasi kalkulasi alami dengan jeda proses halus
  await new Promise((res) => setTimeout(res, 850));

  // Hitung koordinat centroid geometris riil dari peserta
  const validParticipants = payload.participants.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number'
  );

  let optLat = -7.2685;
  let optLng = 112.76;

  if (validParticipants.length > 0) {
    optLat = validParticipants.reduce((acc, p) => acc + p.lat, 0) / validParticipants.length;
    optLng = validParticipants.reduce((acc, p) => acc + p.lng, 0) / validParticipants.length;
  }

  // Hitung jarak jalan raya estimasi (faktor rute darat ~1.3x jarak lurus)
  const participantRoutes = payload.participants.map((p, idx) => {
    const pLat = typeof p.lat === 'number' ? p.lat : optLat + (Math.random() - 0.5) * 0.04;
    const pLng = typeof p.lng === 'number' ? p.lng : optLng + (Math.random() - 0.5) * 0.04;

    const straightDist = calculateHaversineKm(pLat, pLng, optLat, optLng);
    const roadDist = Math.max(0.7, parseFloat((straightDist * 1.35).toFixed(1)));
    
    // Kecepatan motor perkotaan rata-rata 25-30 km/jam + lampu merah 3-4 menit
    const durationMin = Math.max(6, Math.round((roadDist / 26) * 60 + 3));

    return {
      id: p.id || idx + 1,
      name: p.name || `Teman ${idx + 1}`,
      address: p.address || 'Titik Berangkat',
      lat: pLat,
      lng: pLng,
      duration: `${durationMin} mnt`,
      distance: `${roadDist} km`,
      distNum: roadDist,
      durationNum: durationMin,
    };
  });

  const durations = participantRoutes.map((r) => r.durationNum);
  const minDur = Math.min(...durations);
  const maxDur = Math.max(...durations);
  const maxDiff = maxDur - minDur;

  let fairnessRating = 'Sangat Adil';
  if (maxDiff > 8) fairnessRating = 'Cukup Adil';
  else if (maxDiff > 5) fairnessRating = 'Adil';

  // Daftar nama tempat rekomendasi dinamis berpusat di titik optimal
  const cafeTemplates = [
    { name: 'Historica Coffee & Pastry', note: 'Wi-Fi 100 Mbps · Stopkontak tiap meja · Tenang', score: '95% Match' },
    { name: 'Kopi Nalar Co-Working', note: 'Ruang diskusi lega · Parkir motor/mobil luas · Buka 24 Jam', score: '92% Match' },
    { name: 'Teras Senja Cafe', note: 'Harga mahasiswa (< 20rb) · Buka sampai 23.00 · Outdoor adem', score: '89% Match' },
    { name: 'Oost Koffie & Space', note: 'Area indoor AC dingin & outdoor banyak colokan', score: '86% Match' },
    { name: 'Titik Temu Mahasiswa', note: 'Menu kopi & camilan terjangkau · Dekat akses jalan utama', score: '83% Match' },
  ];

  const recommendations = cafeTemplates.map((item, idx) => {
    const offsets = [
      [-0.002, -0.0015],
      [0.0018, 0.0022],
      [-0.003, 0.0028],
      [0.0025, -0.002],
      [0.001, -0.0032],
    ];
    const cLat = optLat + offsets[idx % offsets.length][0];
    const cLng = optLng + offsets[idx % offsets.length][1];
    const distMeter = Math.round(calculateHaversineKm(optLat, optLng, cLat, cLng) * 1000);

    return {
      name: item.name,
      dist: `${distMeter} m`,
      score: item.score,
      note: item.note,
      lat: cLat,
      lng: cLng,
      x: 50 + offsets[idx % offsets.length][1] * 3000,
      y: 50 + offsets[idx % offsets.length][0] * 3000,
    };
  });

  // Tentukan nama wilayah titik tengah
  let optimalAreaName = 'Dharmahusada';
  if (optLng < 112.7) optimalAreaName = 'Mayjend Sungkono, Surabaya Barat';
  else if (optLng > 112.78) optimalAreaName = 'Kertajaya, Surabaya Timur';
  else if (optLat < -7.31) optimalAreaName = 'Wonokromo, Surabaya Selatan';
  else if (optLat > -7.25) optimalAreaName = 'Perak, Surabaya Utara';
  else optimalAreaName = 'Gubeng / Tegalsari, Surabaya Pusat';

  return {
    isSimulated: true,
    data: {
      optimal_point: {
        name: optimalAreaName,
        lat: optLat,
        lng: optLng,
        fairness_score: fairnessRating,
        max_diff_minutes: maxDiff,
        min_duration_minutes: minDur,
        max_duration_minutes: maxDur,
      },
      participant_routes: participantRoutes,
      recommendations,
    },
  };
};
