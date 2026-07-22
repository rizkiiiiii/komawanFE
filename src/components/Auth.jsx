import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import { supabase } from '../supabaseClient'
import { T } from '../theme'
import useIsMobile from '../hooks/useIsMobile'
import LegalModal from './modals/LegalModal'

function CloudBg({ top, left, bottom, right, opacity = 0.4, delay = 0 }) {
  return (
    <motion.div
      style={{ position: 'absolute', top, left, bottom, right, zIndex: 0, opacity, color: '#E2E8F0', pointerEvents: 'none' }}
      animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}>
      <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.154.008-.306.023-.456C11.535 15.112 9.878 16 8 16c-2.761 0-5-2.239-5-5s2.239-5 5-5c.484 0 .95.069 1.385.195C10.364 4.316 12.029 3 14 3c3.314 0 6 2.686 6 6 0 .152-.006.301-.016.448C21.71 9.93 23 11.317 23 13c0 2.209-1.791 4-4 4h-1.5z"/></svg>
    </motion.div>
  )
}

export default function Auth({ onBackToLanding }) {
  const isMobile = useIsMobile()
  const [mode, setMode]             = useState('login')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [name, setName]             = useState('')
  const [otp, setOtp]               = useState('')
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [resending, setResending]   = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [legalModal, setLegalModal] = useState(null)

  useEffect(() => {
    let timer
    if (resendCooldown > 0) timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const isLogin = mode === 'login'
  const isError = message && !message.toLowerCase().includes('berhasil') && !message.toLowerCase().includes('dikirim') && !message.toLowerCase().includes('diverifikasi')

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) { setMessage('Lengkapi semua kolom.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Format email tidak valid.'); return }
    if (!isLogin && password.length < 8) { setMessage('Kata sandi minimal 8 karakter.'); return }
    setLoading(true); setMessage('')
    try {
      if (mode === 'login') {
        const laravelRes = await api.post('/auth/login', { email, password })
        const { token, user: laravelUser } = laravelRes.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('roles', JSON.stringify(laravelUser.roles?.map(r => r.name) || []))
        const { error: sbError } = await supabase.auth.signInWithPassword({ email, password })
        if (sbError) {
          localStorage.removeItem('token'); localStorage.removeItem('roles')
          throw new Error('Akun belum sinkron dengan storage: ' + sbError.message)
        }
      } else {
        await api.post('/auth/register', { name: name || email.split('@')[0], email, password, password_confirmation: password })
        localStorage.setItem('suppress_auth_event', '1')
        const { error: sbError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name || email.split('@')[0] } } })
        if (sbError) {
          localStorage.removeItem('suppress_auth_event')
          try { await api.post('/auth/register-rollback', { email }) } catch (_) {}
          throw new Error('Registrasi storage gagal: ' + sbError.message + '. Silakan coba daftar ulang.')
        }
        await supabase.auth.signOut()
        localStorage.removeItem('token'); localStorage.removeItem('roles'); localStorage.removeItem('suppress_auth_event')
        setMessage('Kode verifikasi telah dikirim ke email kamu.')
        setMode('otp')
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Koneksi bermasalah, coba lagi.')
    } finally { setLoading(false) }
  }

  async function handleVerifyOtp() {
    if (!otp.trim() || otp.trim().length !== 6) { setMessage('Masukkan 6 digit kode.'); return }
    setLoading(true); setMessage('')
    try {
      await api.post('/auth/verify-otp', { email, otp: otp.trim() })
      setMessage('Email berhasil diverifikasi. Silakan masuk.')
      setOtp(''); setMode('login')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Kode salah atau kadaluarsa.')
    } finally { setLoading(false) }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return
    setResending(true); setMessage('')
    try {
      await api.post('/auth/resend-otp', { email })
      setMessage('Kode baru telah dikirim.'); setResendCooldown(60)
    } catch (err) { setMessage(err.response?.data?.message || 'Gagal mengirim ulang kode.') }
    finally { setResending(false) }
  }

  async function handleForgotPassword() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Masukkan email yang valid.'); return }
    setLoading(true); setMessage('')
    try {
      await api.post('/auth/forgot-password', { email })
      setMessage('Kode pemulihan telah dikirim ke email.'); setMode('reset')
    } catch (err) { setMessage(err.response?.data?.message || 'Gagal mengirim kode pemulihan.') }
    finally { setLoading(false) }
  }

  async function handleResetPassword() {
    if (!otp.trim() || otp.trim().length !== 6) { setMessage('Masukkan 6 digit kode pemulihan.'); return }
    if (password.length < 8) { setMessage('Kata sandi baru minimal 8 karakter.'); return }
    setLoading(true); setMessage('')
    try {
      await api.post('/auth/reset-password', { email, otp: otp.trim(), password })
      setMessage('Password berhasil direset! Silakan login.')
      setOtp(''); setPassword(''); setMode('login')
    } catch (err) { setMessage(err.response?.data?.message || 'Gagal mereset password.') }
    finally { setLoading(false) }
  }

  const input = (props) => (
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box', outline: 'none', border: 'none',
        borderBottom: `1px solid ${T.borderStrong}`, fontSize: 15, fontFamily: 'Inter, inherit',
        background: 'transparent', color: T.text, padding: '12px 0', marginBottom: 24,
        transition: 'border-color 0.2s',
        ...props.style,
      }}
      onFocus={e => e.target.style.borderBottomColor = T.accent}
      onBlur={e => e.target.style.borderBottomColor = T.borderStrong}
    />
  )

  const label = (text) => (
    <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>{text}</label>
  )

  const primaryBtn = (onClick, children, disabled) => (
    <motion.button onClick={onClick} disabled={disabled || loading}
      whileHover={{ scale: 1.02, boxShadow: `0 14px 30px ${T.accentGlow}` }} whileTap={{ scale: 0.97 }}
      style={{ width: '100%', padding: '15px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: T.gradient, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 20px ${T.accentGlow}`, marginBottom: 16 }}>
      {children}
    </motion.button>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '24px 16px' : 24, boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>

      <CloudBg top="-5%" left="-5%" delay={0} />
      <CloudBg bottom="10%" right="-10%" delay={2} />

      <AnimatePresence>
        {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
      </AnimatePresence>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        onClick={onBackToLanding}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, cursor: 'pointer', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 36, height: 36, background: T.gradient, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${T.accentGlow}` }}>
          <span style={{ color: '#fff', fontSize: 18 }}>☁</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: '-0.02em' }}>CloudFile</span>
      </motion.div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode='wait'>
          <motion.div key={mode}
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: T.bgCard, borderRadius: 28, padding: isMobile ? 28 : 44, border: `1px solid ${T.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>

            {/* OTP */}
            {mode === 'otp' && (
              <>
                <h1 style={{ fontWeight: 800, fontSize: 26, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Verifikasi Email</h1>
                <p style={{ fontSize: 14, color: T.textSub, margin: '0 0 32px', lineHeight: 1.6 }}>
                  Masukkan 6 digit kode yang dikirim ke <br />
                  <span style={{ color: T.text, fontWeight: 600 }}>{email}</span>
                </p>
                {label('Kode OTP')}
                {input({ type: 'text', inputMode: 'numeric', maxLength: 6, value: otp, onChange: e => setOtp(e.target.value.replace(/\D/g, '')), onKeyDown: e => e.key === 'Enter' && handleVerifyOtp(), placeholder: '000000', style: { textAlign: 'center', letterSpacing: 12, fontSize: 28, fontWeight: 800 } })}
                {primaryBtn(handleVerifyOtp, loading ? 'Memverifikasi...' : '✓ Verifikasi')}
                <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted }}>
                  Tidak terima kode?{' '}
                  <span onClick={handleResendOtp} style={{ color: resendCooldown > 0 ? T.textMuted : T.accent, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {resending ? 'Mengirim...' : resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim Ulang'}
                  </span>
                </p>
              </>
            )}

            {/* FORGOT */}
            {mode === 'forgot' && (
              <>
                <h1 style={{ fontWeight: 800, fontSize: 26, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Lupa Password?</h1>
                <p style={{ fontSize: 14, color: T.textSub, margin: '0 0 32px', lineHeight: 1.6 }}>Masukkan email untuk menerima kode pemulihan.</p>
                {label('Email')}
                {input({ type: 'email', value: email, onChange: e => setEmail(e.target.value), onKeyDown: e => e.key === 'Enter' && handleForgotPassword(), placeholder: 'nama@email.com' })}
                {primaryBtn(handleForgotPassword, loading ? 'Mengirim...' : 'Kirim Kode Pemulihan')}
                <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted }}>
                  <span onClick={() => { setMode('login'); setMessage('') }} style={{ color: T.accent, cursor: 'pointer', fontWeight: 600 }}>← Kembali ke login</span>
                </p>
              </>
            )}

            {/* RESET */}
            {mode === 'reset' && (
              <>
                <h1 style={{ fontWeight: 800, fontSize: 26, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Reset Password</h1>
                <p style={{ fontSize: 14, color: T.textSub, margin: '0 0 32px', lineHeight: 1.6 }}>Masukkan kode pemulihan dan password baru.</p>
                {label('Kode Pemulihan')}
                {input({ type: 'text', inputMode: 'numeric', maxLength: 6, value: otp, onChange: e => setOtp(e.target.value.replace(/\D/g, '')), placeholder: '000000' })}
                {label('Password Baru')}
                {input({ type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: 'Min. 8 karakter' })}
                {primaryBtn(handleResetPassword, loading ? 'Menyimpan...' : 'Simpan Password Baru')}
              </>
            )}

            {/* LOGIN / REGISTER */}
            {(mode === 'login' || mode === 'register') && (
              <>
                <h1 style={{ fontWeight: 800, fontSize: 28, color: T.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  {isLogin ? 'Selamat datang kembali' : 'Buat akun baru'}
                </h1>
                <p style={{ fontSize: 14, color: T.textSub, margin: '0 0 36px', lineHeight: 1.5 }}>
                  {isLogin ? 'Masuk ke CloudFile Manager kamu' : 'Bergabung dengan CloudFile Manager'}
                </p>

                {!isLogin && (
                  <div style={{ marginBottom: 4 }}>
                    {label('Nama Lengkap')}
                    {input({ type: 'text', value: name, onChange: e => setName(e.target.value), placeholder: 'Nama kamu' })}
                  </div>
                )}

                {label('Email')}
                {input({ type: 'email', value: email, onChange: e => setEmail(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), placeholder: 'nama@email.com' })}

                {label('Password')}
                <div style={{ position: 'relative' }}>
                  {input({ type: showPass ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), placeholder: isLogin ? 'Kata sandi' : 'Min. 8 karakter', style: { paddingRight: 36 } })}
                  <span onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 0, top: 12, cursor: 'pointer', fontSize: 13, color: T.textMuted, userSelect: 'none' }}>
                    {showPass ? '🙈' : '👁️'}
                  </span>
                </div>

                {isLogin && (
                  <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 24 }}>
                    <span onClick={() => { setMode('forgot'); setMessage('') }} style={{ fontSize: 12, color: T.accent, cursor: 'pointer', fontWeight: 600 }}>
                      Lupa kata sandi?
                    </span>
                  </div>
                )}

                {!isLogin && (
                  <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 20, lineHeight: 1.6, textAlign: 'center' }}>
                    Dengan mendaftar, kamu menyetujui{' '}
                    <span onClick={() => setLegalModal('terms')} style={{ color: T.accent, fontWeight: 600, cursor: 'pointer' }}>Syarat & Ketentuan</span>
                    {' '}dan{' '}
                    <span onClick={() => setLegalModal('privacy')} style={{ color: T.accent, fontWeight: 600, cursor: 'pointer' }}>Kebijakan Privasi</span>
                    {' '}kami.
                  </p>
                )}

                {primaryBtn(handleSubmit, loading ? 'Memproses...' : (isLogin ? '→ Masuk sekarang' : '→ Buat akun'))}

                <AnimatePresence>
                  {message && (
                    <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ marginBottom: 16, fontSize: 13, color: isError ? T.red : T.green, textAlign: 'center', background: isError ? T.redBg : T.greenBg, padding: '10px 16px', borderRadius: 12, border: `1px solid ${isError ? T.red + '33' : T.green + '33'}` }}>
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div style={{ textAlign: 'center', fontSize: 14, color: T.textMuted }}>
                  {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                  <span onClick={() => { setMode(isLogin ? 'register' : 'login'); setMessage('') }} style={{ color: T.accent, cursor: 'pointer', fontWeight: 700 }}>
                    {isLogin ? 'Daftar gratis' : 'Masuk'}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}