# Panduan Kontribusi Proyek TengahIn

Seluruh pengembang (**Rehan, Amas, Faiz, Firly**) wajib menaati panduan ini demi kelancaran integrasi dan menjaga branch produksi tetap stabil.

---

## 1. Aturan Dasar Percabangan (Branching Model)
1. **Branch `main`**: Digunakan untuk kode yang sudah stabil dan siap rilis.
2. **Branch `dev`**: Branch integrasi utama. Seluruh fitur digabungkan ke sini.
3. **Dilarang langsung push ke `main` atau `dev`.**
4. Sebelum mulai ngoding tugas baru, **WAJIB** membuat branch baru dari `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b <tipe>/<nama>-<fitur>
   ```

---

## 2. Format Penamaan Branch
Gunakan format: `<tipe>/<nama_panggilan>-<nama_tugas>`

- **Feature baru (`feat/`)**:
  - `feat/amas-map-view`
  - `feat/faiz-osrm-routing`
  - `feat/firly-fairness-algorithm`
- **Perbaikan bug (`fix/`)**:
  - `fix/amas-leaflet-render`
  - `fix/faiz-cors-issue`
- **Dokumentasi & Desain (`docs/` / `design/`)**:
  - `docs/rehan-api-spec`
  - `docs/rehan-ui-prototype`

---

## 3. Standar Pesan Commit (Conventional Commits)
Gunakan format pesan commit yang jelas:
- `feat: add ParticipantForm component with dynamic inputs`
- `fix: resolve coordinate bounding box parsing in overpass service`
- `docs: update API endpoints documentation in README`
- `refactor: optimize geometric median calculation algorithm`
- `chore: update dependencies in requirements.txt`

---

## 4. Alur Pull Request (PR)
1. Push branch Anda ke remote GitHub:
   ```bash
   git push -u origin <nama-branch>
   ```
2. Buka GitHub repositori dan buat **Pull Request** dengan target branch **`dev`** (bukan `main`).
3. Beri deskripsi singkat mengenai perubahan yang Anda lakukan.
4. Minta minimal 1 anggota tim untuk melakukan review kode sebelum di-*merge*.
