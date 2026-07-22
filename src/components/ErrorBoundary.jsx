import { Component } from 'react'

// Sengaja tidak pakai Framer Motion / komponen lain di sini — kalau error justru
// berasal dari salah satu dependency itu, fallback UI ini tidak boleh ikut gagal.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Di production, ganti console.error ini dengan pengiriman ke error-tracking
    // service (mis. Sentry) kalau nanti ditambahkan.
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#07071A', color: '#E2E8F0', fontFamily: 'Arial',
          padding: 24, textAlign: 'center', boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>
            Terjadi Kesalahan Tak Terduga
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 24px', maxWidth: 380, lineHeight: 1.6 }}>
            Aplikasi mengalami error yang tidak terduga. Silakan muat ulang halaman.
            Kalau masalah berlanjut, coba logout lalu login kembali.
          </p>
          <button onClick={this.handleReload} style={{
            padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7C6FFF,#FF6B9D)', color: 'white',
            fontSize: 14, fontWeight: 800, fontFamily: 'Arial'
          }}>
            🔄 Muat Ulang Halaman
          </button>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details style={{ marginTop: 28, maxWidth: 500, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontSize: 11, color: '#64748B' }}>
                Detail teknis (hanya tampil di development)
              </summary>
              <pre style={{
                fontSize: 10, color: '#F87171', whiteSpace: 'pre-wrap',
                background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8,
                marginTop: 8, overflowX: 'auto'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
