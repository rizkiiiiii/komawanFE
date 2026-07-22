import { createClient } from "@supabase/supabase-js";
 
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
 
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Konfigurasi Supabase hilang: pastikan REACT_APP_SUPABASE_URL dan " +
    "REACT_APP_SUPABASE_ANON_KEY sudah di-set (.env.local untuk development, " +
    "atau Environment Variables di Vercel untuk production)."
  );
}
 
export const supabase = createClient(supabaseUrl, supabaseKey);
 
// Hanya untuk debugging manual dari DevTools Console — otomatis tidak ikut ke production build
if (process.env.NODE_ENV !== 'production') {
  window.supabase = supabase;
}
 