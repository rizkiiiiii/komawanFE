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
 
const mockUser = {
  id: "dummy-uid",
  email: "demo@cloudfile.local",
  user_metadata: { full_name: "Demo User" }
};

export const supabase = supabaseUrl.includes("dummyurl")
  ? {
      auth: {
        signUp: async () => ({ data: { user: mockUser }, error: null }),
        signInWithPassword: async () => {
          // Fake triggering a reload so getSession can pick up the token we just saved in Auth.jsx
          setTimeout(() => window.location.reload(), 500);
          return { data: { user: mockUser }, error: null };
        },
        signOut: async () => {
          localStorage.removeItem('token');
          localStorage.removeItem('roles');
          setTimeout(() => window.location.reload(), 100);
          return { error: null };
        },
        getSession: async () => {
          const hasToken = !!localStorage.getItem('token');
          return { data: { session: hasToken ? { user: mockUser } : null }, error: null };
        },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      storage: {
        from: () => ({
          upload: async (path) => ({ data: { path }, error: null }),
          list: async () => ({ data: [], error: null }),
          remove: async () => ({ data: [], error: null }),
          createSignedUrl: async () => ({ data: { signedUrl: "https://dummy.url/file" }, error: null }),
          move: async () => ({ data: {}, error: null }),
          download: async () => ({ data: new Blob(["File ini hanya dummy karena Supabase belum di-setup."]), error: null }),
        }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        upsert: () => ({ select: async () => ({ data: [{}], error: null }) })
      })
    }
  : createClient(supabaseUrl, supabaseKey);
 
// Hanya untuk debugging manual dari DevTools Console — otomatis tidak ikut ke production build
if (process.env.NODE_ENV !== 'production') {
  window.supabase = supabase;
}
 