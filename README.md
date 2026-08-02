# ☁️ CloudFile (Sistem Manajemen File Komputasi Awan)

CloudFile adalah aplikasi manajemen file berbasis cloud (seperti Google Drive) berkinerja tinggi yang dibangun dengan arsitektur **Modern Full-Serverless**. Proyek ini memungkinkan pengguna untuk mendaftar, mengunggah file, mengorganisir folder, dan berlangganan paket penyimpanan.

---

## 🏗️ Arsitektur Proyek (Serverless BaaS)

Proyek ini telah sepenuhnya bertransformasi dari arsitektur tradisional (menggunakan Backend khusus seperti Laravel) menjadi arsitektur **Serverless**. Artinya, aplikasi Frontend (*React*) berinteraksi secara langsung dengan layanan *Backend-as-a-Service* (Firebase & Supabase) tanpa memerlukan *server backend* perantara.

Ini menghasilkan aplikasi yang jauh lebih cepat, hemat biaya server, dan memiliki tingkat ketersediaan (uptime) yang tinggi.

### 🛠️ Teknologi yang Digunakan (Tech Stack)

1. **Frontend (UI & Logika Klien)**
   - **React.js**: Framework utama untuk membangun antarmuka pengguna secara modular (SPA).
   - **Framer Motion**: Pustaka animasi untuk menghasilkan transisi dan interaksi mikro (micro-animations) yang *smooth* dan terasa premium.
   - **Vanilla CSS**: Digunakan untuk styling kustom penuh tanpa batasan framework, memungkinkan desain *glassmorphism* dan palet warna dinamis.
   - **Lucide React**: Kumpulan ikon modern.

2. **Otentikasi & Keamanan (KTP Digital)**
   - **Firebase Authentication**: Menangani pendaftaran pengguna, login, validasi kata sandi, dan pengiriman **Email Verifikasi** secara otomatis. Firebase bertindak sebagai gerbang keamanan utama.

3. **Database (Penyimpanan Data Terstruktur)**
   - **Supabase (PostgreSQL)**: Database relasional canggih.
   - **Tabel `profiles`**: Menyimpan data pengguna (ID Firebase, role, status langganan Pro, status Ban).
   - **Tabel `audit_logs`**: Mencatat setiap aktivitas pengguna dan admin secara *real-time* (Log Login, Upload, Hapus, Rename, dll).
   - **RPC (Remote Procedure Call)**: Fungsi kustom PostgreSQL (`get_system_stats`, `get_all_storage_objects`) yang berjalan langsung di mesin database untuk komputasi instan statistik aplikasi.

4. **Storage (Penyimpanan File Fisik)**
   - **Supabase Storage**: Object storage skala besar (berbasis AWS S3 under the hood). Digunakan untuk menyimpan seluruh file yang diunggah pengguna.
   - Sistem direktori diakali menggunakan simulasi path (contoh: `[UserID]/[NamaFolder]/[NamaFile.ext]`).

---

## 🌟 Fitur Utama

### 👤 Fitur Pengguna (User)
- **Sistem Akun Otomatis**: Daftar, Verifikasi Email, Login.
- **Manajemen File & Folder**: Upload file (mendukung *Drag & Drop*), Bikin Folder, Rename, Pindahkan ke Tong Sampah, Hapus Permanen.
- **Preview File**: Pratinjau langsung di dalam browser untuk file gambar, PDF, dan video.
- **Sistem Kuota Terukur**: 
  - *Free Plan*: Penyimpanan 1 GB, maksimal ukuran 50MB per file.
  - *Pro Plan*: Penyimpanan 10 GB, maksimal ukuran 500MB per file.

### 🛡️ Fitur Administrator (Super Admin)
- **Dasbor Real-time**: Memonitor total file, total ukuran storage yang terpakai, dan jumlah pengguna secara instan dari Database.
- **File Explorer Global**: Admin dapat melihat seluruh file yang baru saja diunggah oleh semua pengguna.
- **Manajemen Pengguna (Hakim Sistem)**:
  - **Ban & Unban**: Blokir dan buka blokir akun secara permanen (menghalangi/mengizinkan akses masuk ke dalam sistem).
  - **Role Management**: Bisa mengangkat user biasa menjadi Admin atau menurunkan Admin menjadi user biasa.
- **Detektif Audit Log**: Semua aktivitas dari seluruh aplikasi terekam jejaknya (Waktu, Email Pelaku, Aksi, dan Detail) dan tidak bisa dihapus oleh pengguna biasa.

---

## 🔐 Keamanan & RLS (Row Level Security)

Karena kita menggunakan arsitektur *Serverless*, keamanan data dijaga ketat di tingkat *Database* menggunakan **Row Level Security (RLS)** dari Supabase.
- Tabel `profiles` dan `audit_logs` diatur sedemikian rupa agar Frontend yang menggunakan *Anon Key* dapat beroperasi secara penuh, namun tetap menjaga isolasi data per-pengguna menggunakan manipulasi parameter di sisi *client*.
- Tabel `storage` dikonfigurasi untuk hanya mengizinkan pengguna membaca/menulis file di dalam direktori `[UserID]` mereka sendiri, mencegah pengguna meretas dan mengambil file pengguna lain.

---

## 🚀 Panduan Deployment (Hosting)

Jika mendeploy (hosting) aplikasi ini ke Vercel atau Netlify, **WAJIB** untuk mendaftarkan Environment Variables berikut di pengaturan Dashboard Hosting (karena file `.env` tidak ikut di-push ke Git):

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

Lalu lakukan *Redeploy* agar mesin hosting dapat merender aplikasi dengan koneksi yang valid ke Firebase dan Supabase.
