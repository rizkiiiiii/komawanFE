import { motion } from 'framer-motion'
import { T } from '../theme'
import { formatSize, getInitials } from '../utils'
import api from '../api'

export default function ProfileMenu({ user, totalFiles, totalSize, totalFolders, isPro,
  onUpgrade, onDowngrade, settings, onSettingChange, onOpenAdmin }) {

  const roles = JSON.parse(localStorage.getItem('roles') || '[]')
  const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')

  return (
    <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
      style={{
        position: 'absolute', top: 'calc(100% + 12px)', right: 0, zIndex: 200,
        background: T.bgCard, borderRadius: 24, padding: 24, width: 320,
        border: `1px solid ${T.borderStrong}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)', cursor: 'default'
      }}>

      {/* User info */}
      <div style={{ padding: '0 0 20px', borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
            {getInitials(user.email)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || (user.email && user.email.split('@')[0])}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {[
          { n: totalFiles, l: 'File' },
          { n: totalFolders, l: 'Folder' },
          { n: formatSize(totalSize), l: 'Terpakai' },
        ].map(s => (
          <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.bg, borderRadius: 12, padding: '12px 16px', border: `1px solid ${T.border}` }}>
            <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>{s.l}</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>{s.n}</p>
          </div>
        ))}
      </div>

      {/* Plan */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: T.textSub }}>Paket saat ini</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isPro ? '#EAB308' : T.textMuted }}>
            {isPro ? '⚡ Pro Plan' : 'Free Plan'}
          </span>
        </div>
        <motion.button whileHover={{ scale: 1.01, boxShadow: isPro ? 'none' : `0 6px 16px ${T.accentGlow}` }} whileTap={{ scale: 0.98 }}
          onClick={isPro ? onDowngrade : onUpgrade}
          style={{ width: '100%', marginTop: 4, padding: '10px', borderRadius: 100, background: isPro ? 'transparent' : T.gradient, color: isPro ? T.textSub : '#fff', border: isPro ? `1px solid ${T.border}` : 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {isPro ? 'Turunkan ke Free' : '⚡ Upgrade ke Pro'}
        </motion.button>
      </div>

      {/* Settings */}
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: `1px solid ${T.border}` }}>
        {[
          { key: 'notifyUpload', label: 'Notifikasi upload' },
          { key: 'autoRefresh', label: 'Refresh otomatis' },
          { key: 'confirmDelete', label: 'Konfirmasi hapus' },
          { key: 'autoPreview', label: 'Preview otomatis' },
        ].map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: T.textSub }}>{s.label}</span>
            <div onClick={() => onSettingChange(s.key, !settings[s.key])}
              style={{ width: 36, height: 20, borderRadius: 100, cursor: 'pointer', background: settings[s.key] ? T.accent : 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', padding: 2, justifyContent: settings[s.key] ? 'flex-end' : 'flex-start', transition: 'all 0.2s', boxShadow: settings[s.key] ? `0 0 8px ${T.accentGlow}` : 'none' }}>
              <motion.div layout style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Admin */}
      {isAdmin && (
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}` }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onOpenAdmin}
            style={{ width: '100%', padding: '10px', borderRadius: 100, background: T.gradientGold, color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(234,179,8,0.3)' }}>
            👑 Buka Panel Admin
          </motion.button>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '12px 20px 18px' }}>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={async () => {
            try { await api.post('/auth/logout') } catch (err) {}
            localStorage.removeItem('token')
            localStorage.removeItem('roles')
            localStorage.removeItem('suppress_auth_event')

            // Bersihkan sesi Supabase secara manual & instan (gak nunggu network),
            // biar logout gak pernah "macet" gara-gara koneksi lambat.
            Object.keys(localStorage)
              .filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
              .forEach(k => localStorage.removeItem(k))

            const { supabase } = await import('../supabaseClient')
            supabase.auth.signOut().catch(() => {}) // proses revoke di background, gak ditunggu

            window.location.href = '/'
          }}
          style={{ width: '100%', padding: '10px', borderRadius: 100, background: T.redBg, color: T.red, border: `1px solid ${T.red}33`, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Keluar
        </motion.button>
      </div>
    </motion.div>
  )
}