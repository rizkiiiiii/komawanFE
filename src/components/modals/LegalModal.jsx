import { motion } from 'framer-motion'
import { T } from '../../theme'

const CONTENT = {
  terms: [
    ['Ketentuan Umum', 'Platform manajemen file berbasis cloud untuk proyek akademik Komputasi Awan UNIKOM 2026. Dengan mendaftar, Anda menyetujui syarat berikut.'],
    ['Penggunaan Layanan', 'Free Plan: storage 1 GB, maks upload 50 MB/file. Pro Plan: storage 10 GB, maks upload 500 MB/file.'],
    ['Konten yang Dilarang', 'Dilarang mengunggah konten yang melanggar hak cipta, mengandung malware, bersifat ilegal, atau mengandung konten SARA dan pornografi.'],
    ['Keamanan Akun', 'Pengguna bertanggung jawab menjaga kerahasiaan kredensial. Autentikasi via Supabase Auth dengan enkripsi standar industri dan Row Level Security.'],
    ['Penghentian Layanan', 'Kami berhak menangguhkan akses pengguna yang melanggar ketentuan.'],
  ],
  privacy: [
    ['Informasi yang Dikumpulkan', 'Email, nama lengkap, kata sandi terenkripsi (bcrypt), metadata file, dan log aktivitas.'],
    ['Penggunaan Informasi', 'Untuk autentikasi dan penyediaan layanan. Kami tidak menjual data ke pihak ketiga.'],
    ['Keamanan Data', 'Seluruh data dienkripsi. File disimpan di distributed storage nodes dengan Row Level Security — data antar pengguna sepenuhnya terisolasi.'],
    ['Hak Pengguna', 'Anda berhak mengakses, mengunduh, dan menghapus semua file kapan saja.'],
  ]
}

export default function LegalModal({ type, onClose }) {
  const isTerms = type === 'terms'
  const content = CONTENT[type]
  const gradient = isTerms ? T.gradient : T.gradientPink
  const title = isTerms ? '📜 Syarat & Ketentuan' : '🔒 Kebijakan Privasi'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 2000, padding: 20
      }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(10,10,14,0.95)', backdropFilter: 'blur(24px)',
          border: `1px solid ${T.borderStrong}`, borderRadius: 24,
          width: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: `0 32px 80px rgba(0,0,0,0.9)`
        }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
          </h2>
          <motion.button whileHover={{ scale: 1.1, background: T.redBg }} whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ background: 'transparent', color: T.text, padding: 8, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>
            ✕
          </motion.button>
        </div>

        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {content.map(([t, b]) => (
            <div key={t} style={{ marginBottom: 20 }}>
              <p style={{ color: T.text, fontWeight: 700, margin: '0 0 6px', fontSize: 14 }}>{t}</p>
              <p style={{ margin: 0, color: T.textSub, fontSize: 13, lineHeight: 1.6 }}>{b}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 28px', borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', margin: '0 0 16px' }}>
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} · CloudFile
          </p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            style={{ width: '100%', padding: '14px', borderRadius: 100, background: gradient, color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px rgba(79,70,229,0.3)` }}>
            ✓ Saya Mengerti
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  )
}