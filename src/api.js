import axios from 'axios';
import { supabase } from './supabaseClient';

const BASE_URL = "https://komawan-be.noeronlabs.cloud/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let handling401 = false; // cegah beberapa request 401 sekaligus memicu logout berkali-kali

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (!handling401) {
        handling401 = true
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        // Penting: logout dari Supabase juga. App.js menentukan tampilan
        // (FileManager vs Auth) berdasarkan sesi Supabase, bukan token
        // Laravel. Kalau cuma token Laravel yang dihapus, App.js masih
        // anggap user login -> render FileManager lagi -> fetch lagi ->
        // 401 lagi -> infinite reload loop.
        await supabase.auth.signOut()
        // Tidak perlu window.location.href -- App.js sudah dengar
        // perubahan sesi lewat onAuthStateChange dan otomatis pindah
        // ke halaman Auth begitu sesi hilang.
        handling401 = false
      }
    }
    return Promise.reject(error);
  }
);

export default api;
