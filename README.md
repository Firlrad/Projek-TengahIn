# TengahIn — Fair Meeting Point

Platform cerdas berbasis web untuk mencari titik temu paling adil (*Fair Meeting Point*) bagi kelompok mahasiswa dengan mempertimbangkan jarak, rute perjalanan, waktu tempuh, dan rekomendasi tempat kumpul (*cafe, coworking space, library*).

---

## 👥 Tim & Peran Pengembang
- **Rehan**: Project Manager & UI/UX Designer
- **Amas**: Frontend Engineer
- **Faiz**: Backend Engineer
- **Firly**: AI & Algorithm Engineer

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Leaflet / React-Leaflet, Axios, Lucide React
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, HTTPX, NumPy, GeoPy, Polyline
- **Routing & Maps**: OpenStreetMap (OSRM) & Overpass API

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### 1. Menjalankan Backend
Pastikan Anda sudah berada di root direktori proyek:

```bash
cd backend

# Buat virtual environment
py -m venv venv
# Atau jika python terdaftar di PATH:
# python -m venv venv

# Aktivasi virtual environment:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
# .\venv\Scripts\activate.bat
# Mac/Linux:
# source venv/bin/activate

# Install dependensi
pip install -r requirements.txt

# Siapkan file environment
cp .env.example .env

# Jalankan server FastAPI
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- API Interactive Docs (Swagger): `http://127.0.0.1:8000/docs`

---

### 2. Menjalankan Frontend
Buka terminal baru:

```bash
cd frontend

# Install package
npm install

# Jalankan development server
npm run dev
```
- Akses aplikasi web di browser: `http://localhost:5173`
