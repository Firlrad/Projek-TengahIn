# TengahIn — Fair Meeting Point

Platform cerdas berbasis web untuk mencari titik temu paling adil (*Fair Meeting Point*) bagi kelompok mahasiswa dengan mempertimbangkan jarak, rute perjalanan jalan raya, waktu tempuh berkeadilan (*Minimax Fairness* via Hill Climbing), serta rekomendasi tempat kumpul (*cafe, coworking space, library*) yang ramah kantong.

Target Penyelesaian & Presentasi: **7 Desember 2026**

---

## Tim Pengembang & Status Progres

| Anggota Tim | Peran Utama | Status Progres | Keterangan Pengerjaan |
| :--- | :--- | :---: | :--- |
| **Amas** | Frontend Developer | **~95% (Selesai)** | Antarmuka web responsif, Leaflet, Geocoding, GPS, dan Simulasi Haversine aktif 100%. |
| **Rehan** | Project Manager & UI/UX Designer | **30% (Antrean)** | Struktur Git & wireframe siap. Menunggu penyusunan 5 skenario uji Surabaya & slide. |
| **Faiz** | Backend & API Developer | **0% (Siap Mulai)** | Direktori backend bersih, siap dibangun sesuai panduan step-by-step. |
| **Firly** | Algorithm & AI Specialist | **85% (Hampir Selesai)** | Direktori modul AI bersih, siap dirancang sesuai panduan step-by-step. |

Panduan tugas step-by-step lengkap untuk Rehan, Faiz, dan Firly tersedia di dokumen [PROGRESS.md](PROGRESS.md).

---

## Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Leaflet / React-Leaflet, Axios, Lucide React
* **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, HTTPX, NumPy, GeoPy, Polyline
* **Routing & Maps**: OpenStreetMap (OSRM API) & Overpass API

---

## Panduan Menjalankan Frontend (Amas)

Antarmuka web saat ini sudah siap dijalankan dan diuji coba secara mandiri:

```bash
cd frontend

# 1. Install dependensi (cukup sekali di awal)
npm install

# 2. Jalankan development server
npm run dev
```

* Buka browser di [http://localhost:5173](http://localhost:5173).
* *Catatan:* Karena backend Faiz dan Firly masih dalam tahap persiapan pengerjaan, antarmuka frontend secara otomatis mengaktifkan **Mode Simulasi Cerdas Berbasis Haversine**. Seluruh fitur (penambahan teman, pencarian alamat OpenStreetMap, deteksi GPS, kalkulasi titik tengah, dan visualisasi rute beranimasi di peta) dapat diuji coba secara langsung tanpa perlu menunggu server backend dinyalakan.

---

## Panduan Memulai Backend untuk Faiz & Firly

Faiz dan Firly dapat mulai mengerjakan tugas masing-masing di direktori `backend/`:

```bash
cd backend

# 1. Buat dan aktifkan virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# source venv/bin/activate    # macOS / Linux

# 2. Install dependensi
pip install -r requirements.txt

# 3. Siapkan file environment
copy .env.example .env

# 4. Jalankan server (setelah file main.py dibuat oleh Faiz)
uvicorn app.main:app --reload --port 8000
```

Ikuti langkah-langkah detail implementasi file di [PROGRESS.md](PROGRESS.md):
* **Faiz**: Mulai dari `backend/app/models/schemas.py`, lalu `route_service.py`, `place_service.py`, dan `main.py`.
* **Firly**: Mulai dari `backend/app/ai/optimizer.py` (Centroid & Hill Climbing Minimax) dan `scoring.py`.

---

## Alur Kerja Kolaborasi Git (Workflow)

Seluruh pengembang wajib mengikuti aturan branching tim:
1. Jangan melakukan push langsung ke branch `main`.
2. Selalu tarik kode terbaru dari branch `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/<nama-kamu>-<nama-fitur>
   ```
3. Lakukan commit teratur dan buka Pull Request (PR) ke branch `dev`.
4. Panduan lengkap tersedia di [CONTRIBUTING.md](CONTRIBUTING.md).
