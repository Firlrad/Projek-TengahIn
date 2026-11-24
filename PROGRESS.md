# Rekap Progres & Panduan Tugas Tim TengahIn
**Target Rilis: 7 Desember 2026**  
**Repositori:** [github.com/Firlrad/Projek-TengahIn](https://github.com/Firlrad/Projek-TengahIn)  
**Versi Dokumen:** 2.0.0 (Status per 25 November 2026)

---

## Ringkasan Eksekutif & Status Tim

TengahIn adalah platform pencarian titik temu adil (*Fair Meeting Point*) berbasis web untuk mahasiswa. 

Status pengerjaan saat ini:
* **Amas (Frontend Developer):** **~95% (Selesai)** — Antarmuka web responsif (Landing Page & Workspace), peta Leaflet.js dengan rute beranimasi, geocoding Nominatim, integrasi GPS + Reverse Geocoding, serta mode simulasi cerdas berbasis Haversine sudah aktif dan teruji 100% tanpa error build.
* **Rehan (PM & UI/UX):** **30% (Dalam Antrean)** — Struktur repositori dan alur branching Git telah disiapkan. Menunggu pengerjaan 5 skenario pengujian Surabaya, penyusunan laporan akhir, slide presentasi, dan video demo.
* **Faiz (Backend & API Developer):** **0% (Belum Dimulai / Siap Dikerjakan)** — Seluruh file implementasi backend telah dibersihkan agar Faiz dapat membangun arsitektur server FastAPI (OOP) dan integrasi API eksternal secara mandiri sesuai panduan step-by-step di bawah.
* **Firly (Algorithm & AI Specialist):** **0% (Belum Dimulai / Siap Dikerjakan)** — Seluruh file algoritma telah dibersihkan agar Firly dapat merancang fungsi Centroid, Hill Climbing (*Minimax Fairness*), dan *Weighted Scoring* secara mandiri sesuai panduan step-by-step di bawah.

---

## 1. Amas — Frontend Developer (Status: ~95% Selesai)

### Tanggung Jawab
Membangun tampilan web responsif, form input dinamis, integrasi GPS & geocoding, visualisasi peta interaktif Leaflet.js, serta mode simulasi mandiri.

### Deliverable yang Telah Selesai
* [x] **Landing Page (`frontend/src/components/LandingPage.jsx`):** Desain modern-minimalis, scroll-reveal halus via IntersectionObserver, modal edukasi cara kerja AI, FAQ accordion, bebas emoji klise.
* [x] **Workspace (`frontend/src/components/Workspace.jsx`):**
  * Sidebar collapsible (lebar desktop 420px & drawer mobile).
  * Input peserta dinamis (+/- peserta, tombol GPS Geolocation API dengan indikator loading, dan Reverse Geocoding otomatis via Nominatim).
  * Autocomplete pencarian alamat OpenStreetMap (Nominatim API dengan debounce 500ms dan *click-outside detector*).
  * Tabulasi 3 mode: Input Peserta, Hasil Titik Temu, dan Riwayat Pencarian (`localStorage`).
  * Filter preferensi mahasiswa (Colokan banyak, WiFi kencang, Buka 24 Jam, Ramah kantong).
  * Kalkulator estimasi biaya bensin motor (km/liter) & tarif ojek online.
  * Tombol Salin Ringkasan teks ke clipboard.
* [x] **Peta Interaktif (`frontend/src/components/MapView.jsx`):**
  * Basemap OpenStreetMap tiles dengan Leaflet.js.
  * Pin HTML custom marker untuk setiap peserta & pin emas animasi *pulsing emerald* untuk titik temu optimal.
  * Garis rute jalan raya beranimasi putus-putus (*animated dash flow*).
  * Sinkronisasi ukuran peta dinamis menggunakan `ResizeObserver` saat sidebar dibuka/ditutup.
  * Fitur pan/fly-to otomatis ke kafe yang dipilih pengguna.
* [x] **Layanan API & Mode Simulasi (`frontend/src/services/api.js`):**
  * Mendukung pemanggilan endpoint `POST /api/find-meeting-point` dan `POST /api/calculate-meeting-point`.
  * Mode simulasi cerdas otomatis menggunakan rumus matematika Haversine riil jika backend belum dijalankan, sehingga frontend dapat didemokan tanpa server backend.
* [x] **Uji Kompilasi:** `npm run build` sukses 100% tanpa error (2.17 detik).

### Tugas Tersisa Menjelang 7 Desember 2026
* [ ] Pengujian integrasi live ke server FastAPI saat Faiz dan Firly selesai membangun backend.
* [ ] Konfigurasi deployment frontend ke Vercel atau Netlify.

---

## 2. Panduan Tugas Step-by-Step: Rehan (Project Manager & UI/UX Designer)
**Status: 30% | Target Selesai: 5 Desember 2026**

Rehan bertanggung jawab atas pengujian kualitas, skenario empiris, dan seluruh dokumen presentasi tim.

### Step 1: Menyusun 5 Skenario Uji Lokasi Nyata Surabaya
Buat file dokumentasi skenario pengujian di `docs/skenario_pengujian.md` yang mencakup 5 kasus uji keberangkatan mahasiswa:
1. **Skenario 1 (Surabaya Timur & Gubeng):** Titik berangkat dari ITS Sukolilo, Unair Kampus B, dan UPN Veteran Rungkut. (Ekspektasi: titik temu di sekitar Kertajaya / Dharmahusada).
2. **Skenario 2 (Surabaya Barat & Pusat):** Titik berangkat dari Universitas Ciputra (CitraLand), Pakuwon Mall, dan Tunjungan Plaza. (Ekspektasi: titik temu di sekitar Mayjend Sungkono / Diponegoro).
3. **Skenario 3 (Surabaya Selatan & Utara):** Titik berangkat dari UINSA Ahmad Yani, Royal Plaza Wonokromo, dan Jembatan Merah Perak. (Ekspektasi: titik temu di sekitar Darmo / Basuki Rahmat).
4. **Skenario 4 (Kelompok 4 Orang Lintas Wilayah):** ITS (Timur), Ciputra (Barat), UINSA (Selatan), Kenjeran (Utara).
5. **Skenario 5 (Kelompok 5 Orang):** Uji batas maksimal dengan titik berangkat tersebar di 5 penjuru Surabaya.
*Catatan untuk Rehan:* Masukkan alamat-alamat ini ke dalam antarmuka Workspace buatan Amas untuk memvalidasi kelayakan titik temu dan rute yang dihasilkan.

### Step 2: Menyusun Dokumen Laporan Akhir Proyek
Susun draf laporan akhir proyek dengan sistematika:
1. **Bab 1 — Pendahuluan:** Latar belakang masalah mahasiswa kesulitan menentukan titik temu yang adil (*problem statement*), tujuan, dan batasan masalah.
2. **Bab 2 — Landasan Teori & Algoritma:** Penjelasan metode Geometri Centroid, konsep keadilan *Minimax Fairness*, dan algoritma optimasi lokal *Hill Climbing*.
3. **Bab 3 — Perancangan Sistem & Arsitektur:** Arsitektur frontend (React, Tailwind, Leaflet), arsitektur backend (FastAPI, OSRM, Overpass), dan diagram alur data JSON.
4. **Bab 4 — Hasil Pengujian & Evaluasi:** Tabel perbandingan waktu tempuh dari 5 skenario uji (perbandingan sebelum memakai AI vs sesudah memakai AI).
5. **Bab 5 — Penutup:** Kesimpulan dan saran pengembangan berikutnya.

### Step 3: Membuat Slide Presentasi
Siapkan file presentasi (PowerPoint / Canva / Google Slides) berdurasi 10–15 menit:
* Slide 1: Judul Proyek, Logo TengahIn, dan Nama Anggota Tim serta perannya.
* Slide 2: Masalah Utama (debat lokasi kumpul mahasiswa, ketimpangan waktu tempuh).
* Slide 3: Solusi TengahIn & Fitur Unggulan (Peta interaktif, filter colokan/wifi, estimasi bensin).
* Slide 4: Cara Kerja AI (Penjelasan sederhana Hill Climbing & Minimax Fairness).
* Slide 5: Demo Aplikasi (tangkapan layar atau rekaman live antarmuka web).
* Slide 6: Hasil Pengujian 5 Skenario Nyata di Surabaya.
* Slide 7: Tech Stack, Kesimpulan, dan Sesi Tanya Jawab.

### Step 4: Merekam Video Demo Cadangan
* Rekam video layar (screencast) berdurasi 2–3 menit yang memperlihatkan:
  1. Halaman Landing Page (fitur dan penjelasan AI).
  2. Masuk ke halaman Workspace.
  3. Memasukkan 3 lokasi peserta (contoh: ITS, Unair, Pakuwon).
  4. Menekan tombol "Hitung Titik Tengah Optimal".
  5. Menampilkan hasil rute beranimasi di peta Leaflet, perbandingan waktu, dan daftar rekomendasi kafe.
* *Tujuan:* Video ini digunakan sebagai cadangan jika koneksi internet di ruang presentasi mengalami kendala pada 7 Desember 2026.

---

## 3. Panduan Tugas Step-by-Step: Faiz (Backend & API Developer)
**Status: 0% (Belum Dimulai) | Target Selesai: 28 November 2026**

Faiz bertugas membangun server Python FastAPI, mengelola request/response data JSON, dan menghubungkan API eksternal (OSRM & Overpass API).

### Step 1: Setup Lingkungan Kerja Backend
1. Buka terminal di folder `backend/`.
2. Buat dan aktifkan virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1   # Windows PowerShell
   ```
3. Install dependensi dari `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
4. Pastikan file `.env` sudah siap (salin dari `.env.example`).

### Step 2: Membuat Skema Data Pydantic (`backend/app/models/schemas.py`)
Faiz perlu membuat kelas validasi data agar format JSON cocok dengan kebutuhan frontend Amas:
* `Coordinates`: model koordinat latitude (`lat: float`) dan longitude (`lng: float`).
* `Participant`: model peserta berisi `id: str`, `name: str`, `location: Coordinates`, dan `address: Optional[str]`.
* `MeetingPointRequest`: model request dari frontend berisi `participants: List[Participant]`, `transport_mode: Optional[str] = 'driving'`, `category: Optional[str] = 'cafe'`, dan `radius: Optional[int] = 800`.
* `OptimalPointResponse`: model data titik optimal (nama tempat, lat, lng, skor keadilan, selisih waktu menit).
* `RouteDetail`: model data rute tiap peserta (nama, durasi teks, jarak teks, polyline rute).
* `MeetingPointResponse`: model response gabungan yang mengembalikan `optimal_point`, `participant_routes`, dan `recommendations`.

### Step 3: Implementasi Layanan Routing OSRM (`backend/app/services/route_service.py`)
Faiz membuat kelas atau fungsi asinkron menggunakan pustaka `httpx` untuk memanggil OSRM API:
* **Fungsi 1: `get_route(origin_lat, origin_lng, dest_lat, dest_lng, mode='driving')`**
  * Memanggil URL: `https://router.project-osrm.org/route/v1/{mode}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson`
  * Mengembalikan: jarak dalam meter (`distance`), durasi dalam detik (`duration`), dan daftar koordinat garis jalan (`geometry.coordinates`).
* **Fungsi 2: `get_table_matrix(coordinates_list, mode='driving')`**
  * Memanggil OSRM Table Service untuk mendapatkan matriks durasi perjalanan antar seluruh titik sekaligus secara cepat.

### Step 4: Implementasi Layanan Tempat Overpass API (`backend/app/services/place_service.py`)
Faiz membuat fungsi pencarian POI (*Point of Interest*) di sekitar koordinat titik optimal:
* **Fungsi: `search_nearby_places(lat, lng, radius=800, category='cafe')`**
  * Membangun query Overpass QL untuk mencari node/way dengan tag `[amenity=cafe]` atau `[amenity=restaurant]` dalam radius yang ditentukan.
  * Memanggil endpoint: `https://overpass-api.de/api/interpreter`
  * Parsing output JSON menjadi daftar tempat berisi: nama tempat, jarak ke titik tengah, koordinat lat/lng, dan fasilitas (wifi, stopkontak jika ada di OSM tags).

### Step 5: Membangun Server FastAPI & Endpoint Utama (`backend/app/main.py`)
1. Inisialisasi aplikasi FastAPI dengan konfigurasi CORS (`CORSMiddleware`) mengizinkan `http://localhost:5173`.
2. Tambahkan endpoint `GET /` untuk health check:
   ```json
   {"status": "healthy", "service": "TengahIn Backend API", "version": "1.0.0"}
   ```
3. Tambahkan endpoint utama **`POST /api/find-meeting-point`**:
   * Terima request sesuai skema `MeetingPointRequest`.
   * Panggil modul AI Firly (`optimizer.optimize_meeting_point`) untuk mendapatkan koordinat titik tengah optimal.
   * Panggil `route_service` untuk menghitung rute riil dan waktu tempuh tiap peserta ke titik optimal tersebut.
   * Panggil `place_service` untuk mengambil 5 kafe rekomendasi terdekat.
   * Panggil fungsi scoring Firly untuk merangking kafe terbaik.
   * Kembalikan response JSON lengkap ke frontend.

### Step 6: Pengujian & Deployment
* Jalankan server lokal: `uvicorn app.main:app --reload --port 8000`.
* Uji endpoint via Swagger UI di browser: [http://localhost:8000/docs](http://localhost:8000/docs).
* Deploy server backend ke layanan hosting gratis/terjangkau seperti Render atau Railway.

---

## 4. Panduan Tugas Step-by-Step: Firly (Algorithm & AI Specialist)
**Status: 0% (Belum Dimulai) | Target Selesai: 28 November 2026**

Firly bertanggung jawab atas logika matematis dan kecerdasan buatan agar titik temu yang dipilih benar-benar adil untuk seluruh peserta.

### Step 1: Implementasi Perhitungan Centroid Awal (`backend/app/ai/optimizer.py`)
Firly membuat fungsi dasar untuk menentukan titik awal pencarian:
* **Fungsi: `calculate_centroid(coordinates: List[Tuple[float, float]]) -> Tuple[float, float]`**
* Menggunakan NumPy untuk menghitung rata-rata koordinat lintang dan bujur:
  $$\text{Lat}_{\text{awal}} = \frac{1}{N}\sum_{i=1}^N \text{Lat}_i, \quad \text{Lng}_{\text{awal}} = \frac{1}{N}\sum_{i=1}^N \text{Lng}_i$$
* Titik centroid ini menjadi titik awal (*seed location*) sebelum dioptimasi oleh algoritma Hill Climbing.

### Step 2: Perancangan Fungsi Objektif Keadilan (*Minimax Fairness*)
Dalam kasus kelompok mahasiswa, titik tengah geometris sering kali tidak adil karena kondisi jalan, kemacetan, atau hambatan geografis. Firly merumuskan fungsi objektif:
* Hitung waktu tempuh $T_i$ untuk setiap peserta $i \in \{1, 2, \dots, N\}$.
* Hitung selisih waktu tempuh maksimal dan minimal:
  $$\text{Disparity} = \max(T_1, T_2, \dots, T_N) - \min(T_1, T_2, \dots, T_N)$$
* Hitung standar deviasi waktu tempuh:
  $$\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (T_i - \bar{T})^2}$$
* **Fungsi Skor Penalti (Objective Function yang ingin diminimalkan):**
  $$\text{Cost}(x) = \text{Disparity} + \alpha \cdot \sigma$$
  (dengan $\alpha \approx 0.5$ sebagai pembobot variasi).

### Step 3: Implementasi Algoritma Optimasi Hill Climbing
Firly mengimplementasikan algoritma pencarian lokal berulang (*iterative local search*):
* **Fungsi: `optimize_meeting_point(participants_coords, route_calculator, max_iterations=20)`**
  1. Mulai dari titik awal $x_0 = \text{Centroid}$.
  2. Evaluasi $\text{Cost}(x_0)$ menggunakan estimasi waktu tempuh dari tiap peserta.
  3. Bentuk kandidat tetangga di sekeliling titik saat ini pada 4 atau 8 arah mata angin dengan jarak langkah (*step size*) tertentu (misal: radius 250m dan 500m).
  4. Untuk setiap kandidat tetangga, hitung nilai $\text{Cost}$.
  5. Jika ditemukan tetangga yang memiliki nilai $\text{Cost}$ lebih kecil daripada titik saat ini:
     * Pindahkan titik optimal ke tetangga tersebut.
     * Ulangi pencarian.
  6. Jika seluruh tetangga menghasilkan $\text{Cost}$ yang lebih buruk atau selisihnya sudah di bawah ambang batas konvergensi (< 1 menit), hentikan algoritma dan kembalikan titik terbaik.

### Step 4: Pemeringkatan Tempat Rekomendasi / Weighted Scoring (`backend/app/ai/scoring.py`)
Setelah titik temu optimal ditemukan dan daftar kafe didapatkan dari Overpass API, Firly membuat rumus pemeringkatan:
* **Fungsi: `rank_places(places, preferences)`**
* Berikan skor 0–100 untuk setiap kafe berdasarkan kriteria:
  $$\text{Score} = w_1 \cdot S_{\text{jarak}} + w_2 \cdot S_{\text{colokan}} + w_3 \cdot S_{\text{wifi}} + w_4 \cdot S_{\text{harga}}$$
  * $S_{\text{jarak}}$: Semakin dekat dari titik optimal, semakin tinggi skornya.
  * $S_{\text{fasilitas}}$: Bonus skor jika tempat memiliki stopkontak dan wifi kencang.
* Urutkan tempat dari skor tertinggi dan ambil 3–5 rekomendasi teratas untuk dikirimkan ke Faiz.

### Step 5: Pengujian Kuantitatif & Validasi untuk Laporan Rehan
* Jalankan perbandingan matematis antara **Centroid Biasa** vs **Optimasi AI Hill Climbing Minimax** pada 5 skenario Surabaya milik Rehan.
* Catat tabel selisih waktu tempuh:
  * *Sebelum AI (Centroid):* Selisih waktu antara peserta terjauh dan terdekat = misal 14 menit.
  * *Sesudah AI (Hill Climbing):* Selisih waktu terpangkas menjadi = misal 3–4 menit.
* Serahkan data tabel ini kepada Rehan sebagai materi bab pengujian dan slide presentasi.

---

## Matriks Jadwal Kerja Tim Menuju 7 Desember 2026

```
24 - 25 Nov: [Amas]  Frontend Selesai v1.0 (Landing Page, Workspace, Peta, Geocoding, Mock)
26 - 28 Nov: [Faiz]  Implementasi FastAPI, OSRM Service, Overpass Service
             [Firly] Implementasi Centroid, Hill Climbing Minimax, & Scoring Tempat
29 Nov - 1 Des: [Amas + Faiz + Firly] Integrasi Penuh Frontend <-> Backend API
2 - 4 Des:   [Rehan] Pengujian 5 Skenario Nyata Surabaya & Dokumentasi
             [Firly] Validasi Akurasi & Pembuatan Tabel Metrik Perbandingan AI
5 - 6 Des:   [Semua] Deployment Online (Vercel + Cloud Backend), Slide & Video Demo Cadangan
7 Des 2026:  FINAL RELEASE & PRESENTASI PROYEK TENGAHIN
```
