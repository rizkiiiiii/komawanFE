# 📁 Komawan - File Management SaaS (Frontend)

Selamat datang di *repository* Frontend untuk **Komawan**, sebuah aplikasi manajemen file berbasis Software as a Service (SaaS). 

Aplikasi ini dibangun menggunakan **React** dan didesain untuk memberikan pengalaman pengguna yang cepat, responsif, dan aman dalam mengelola file layaknya Google Drive.

## ✨ Fitur Utama

- **Secure File Storage**: Upload, download, dan manajemen file dengan aman.
- **Role-Based Access Control**: Manajemen limitasi dan kuota otomatis berdasarkan *role* pengguna (Free vs Pro).
- **Modern User Interface**: Antarmuka yang bersih dan interaktif untuk pengalaman manajemen file terbaik.
- **Supabase Integration**: Terintegrasi penuh dengan Supabase Storage untuk penyimpanan file tingkat lanjut, dikawal dengan Row Level Security (RLS).
- **Real-time Sync**: Sinkronisasi state yang aman antara Frontend, Supabase, dan Laravel Backend.

## 🚀 Teknologi yang Digunakan

- **Framework**: React.js
- **Styling**: Vanilla CSS / Modern UI
- **Storage & RLS**: Supabase
- **HTTP Client**: Axios (terkoneksi ke Laravel API)
- **State Management**: React Hooks

## 🛠️ Cara Menjalankan di Lokal (Development)

1. **Clone Repository ini**
   ```bash
   git clone https://github.com/baihaqii08/Komawan-FE.git
   cd Komawan-FE
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di folder utama aplikasi dan isi dengan kredensial Supabase dan API Backend kamu:
   ```env
   REACT_APP_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[ANON-KEY-KAMU]
   REACT_APP_API_URL=http://localhost:8000/api/v1
   ```

4. **Jalankan Aplikasi**
   ```bash
   npm start
   ```
   Aplikasi akan terbuka otomatis di `http://localhost:3000`.

## 📦 Deployment

Aplikasi ini siap untuk di-deploy ke berbagai platform modern seperti **Vercel**, **Netlify**, atau **Cloudflare Pages** cukup dengan menggunakan perintah build standar:
```bash
npm run build
```

---
*Dibuat untuk keperluan responsi dan demonstrasi manajemen file berbasis SaaS.*
