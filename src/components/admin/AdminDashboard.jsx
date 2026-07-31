import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { T } from '../../theme'
import { supabase } from '../../supabaseClient'
import { formatSize, formatName, getInitials } from '../../utils'
import Toast from '../Toast'

const TABS = [
  { id: 'stats', label: '📊 Ikhtisar' },
  { id: 'users', label: '👥 Pengguna' },
  { id: 'files', label: '📁 Semua File' },
  { id: 'logs', label: '📝 Audit Log' },
]

export default function AdminDashboard({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [files, setFiles] = useState([])
  const [logs, setLogs]   = useState([])
  const [toast, setToast] = useState({ msg:'', type:'success' })
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' })
  const [adminLoading, setAdminLoading] = useState(false)
  const accessRevokedRef = useRef(false) // cegah loop kalau 403 kepanggil berkali-kali

  function showToast(msg, type='success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:'', type:'success' }), 3500)
  }

  // Ambil roles dari localStorage yang diset saat login Laravel
  const roles = JSON.parse(localStorage.getItem('roles') || '[]')
  const isSuperAdmin = roles.includes('SUPER_ADMIN')

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  async function fetchData(tab) {
    setLoading(true)
    try {
      if (tab === 'stats') {
        const { data, error } = await supabase.rpc('get_system_stats')
        if (!error && data) {
          setStats(data)
        }
      } else if (tab === 'users') {
        const { data } = await supabase.from('profiles').select('*')
        setUsers((data || []).map(p => ({
          id: p.id,
          name: p.email ? p.email.split('@')[0] : 'Unknown',
          email: p.email || 'Tanpa Email',
          roles: [{ name: p.role || 'USER' }],
          status: p.status || 'active'
        })))
      } else if (tab === 'files') {
        const { data, error } = await supabase.rpc('get_all_storage_objects')
        const { data: profiles } = await supabase.from('profiles').select('id, email')
        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p.email }), {})

        if (!error && data) {
          const filesWithEmail = data.map(f => {
            const uid = (f.name || '').split('/')[0]
            return { ...f, user_email: profileMap[uid] || 'Anonim' }
          })
          setFiles(filesWithEmail)
        }
      } else if (tab === 'logs') {
        const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
        setLogs(data || [])
      }
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat data', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleBan(userId) {
    if (!window.confirm('Yakin ingin membanned (blokir) pengguna ini secara permanen?')) return
    try {
      const { data, error } = await supabase.from('profiles').update({ status: 'banned' }).eq('id', userId).select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('RLS memblokir aksi ini atau user tidak ditemukan')
      await supabase.from('audit_logs').insert([{ user_email: user.email, action: 'Ban User', details: `Banned user ID: ${userId}` }])
      showToast('Pengguna berhasil di-ban! 🚫', 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal mem-ban: ' + err.message, 'error') }
  }

  async function handleUnban(userId) {
    if (!window.confirm('Yakin ingin membuka blokir (unban) pengguna ini?')) return
    try {
      const { data, error } = await supabase.from('profiles').update({ status: 'active', unsuspend_at: null }).eq('id', userId).select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('RLS memblokir aksi ini atau user tidak ditemukan')
      await supabase.from('audit_logs').insert([{ user_email: user.email, action: 'Unban User', details: `Unbanned user ID: ${userId}` }])
      showToast('Ban berhasil dicabut! ✅', 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal unban: ' + err.message, 'error') }
  }

  async function handlePromoteAdmin(userId, userName) {
    if (!window.confirm(`Yakin ingin mempromosikan "${userName}" menjadi Admin?`)) return
    try {
      const { data, error } = await supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', userId).select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('RLS memblokir aksi ini atau user tidak ditemukan')
      await supabase.from('audit_logs').insert([{ user_email: user.email, action: 'Promote Admin', details: `Promoted ${userName} to ADMIN` }])
      showToast('Berhasil dijadikan Admin! ⭐', 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal mempromosikan admin: ' + err.message, 'error') }
  }

  async function handleDemoteUser(userId, userName) {
    if (!window.confirm(`Yakin ingin mengembalikan peran "${userName}" menjadi User biasa?`)) return
    try {
      const { data, error } = await supabase.from('profiles').update({ role: 'USER' }).eq('id', userId).select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('RLS memblokir aksi ini atau user tidak ditemukan')
      showToast('Peran dikembalikan ke User 👤', 'info')
      fetchData('users')
    } catch (err) { showToast('Gagal mengubah peran: ' + err.message, 'error') }
  }

  async function handleCreateAdmin(e) {
    e.preventDefault()
    showToast('Buat admin dari Firebase console', 'error')
  }

  const statCards = [
    { label: 'Total Pengguna', value: stats?.total_users, color: T.accent, bg: T.orangeBg },
    { label: 'Total Admin', value: stats?.total_admins, color: T.blue, bg: T.blueBg },
    { label: 'Total File', value: stats?.total_files, color: T.pink, bg: T.pinkBg },
    { label: 'Storage Digunakan', value: formatSize(stats?.total_storage), color: T.green, bg: T.greenBg },
  ]

  return (
    <div style={{minHeight:'100vh',background:T.bg,fontFamily:'Inter, Arial, sans-serif',
      position:'relative',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      
      <Toast message={toast.msg} type={toast.type}/>

      {/* Background Decor */}
      <div style={{position:'absolute',top:-150,left:-150,width:400,height:400,
        background:T.gradientGold,filter:'blur(120px)',opacity:0.15,borderRadius:'50%',zIndex:0,pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-100,right:-100,width:500,height:500,
        background:T.gradientBlue,filter:'blur(140px)',opacity:0.1,borderRadius:'50%',zIndex:0,pointerEvents:'none'}}/>

      {/* Header */}
      <header style={{padding:'24px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',
        position:'relative',zIndex:10,borderBottom:`1px solid ${T.borderStrong}`,background:'rgba(255,255,255,0.7)',
        backdropFilter:'blur(24px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={onBack}
            style={{background:T.bgSolid,border:`1px solid ${T.border}`,width:40,height:40,
              borderRadius:12,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
            ←
          </motion.button>
          <div>
            <h1 style={{margin:0,fontSize:22,fontWeight:900,color:T.text,
              background:T.gradientGold,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              Admin Panel
            </h1>
            <p style={{margin:0,fontSize:13,color:T.textMuted}}>Kelola sistem dengan kekuatan super</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{display:'flex',background:T.bgSolid,padding:6,borderRadius:16,border:`1px solid ${T.border}`}}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)}
              style={{position:'relative',padding:'8px 20px',cursor:'pointer',fontSize:14,fontWeight:600,
                color:activeTab===t.id?'#fff':T.textSub,zIndex:1}}>
              {activeTab === t.id && (
                <motion.div layoutId="admTab"
                  style={{position:'absolute',inset:0,background:T.gradientGold,borderRadius:10,zIndex:-1,
                    boxShadow:`0 4px 12px rgba(184,134,46,0.3)`}}
                  transition={{type:'spring',stiffness:300,damping:25}}/>
              )}
              {t.label}
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{flex:1,padding:'40px',position:'relative',zIndex:10,overflowY:'auto'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          
          <AnimatePresence mode="wait">
            
            {/* STATS TAB */}
            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:24}}>
                  {loading ? (
                     [1,2,3,4].map(i => (
                       <div key={i} style={{height:140,background:T.bgCard,borderRadius:24,border:`1px solid ${T.border}`}} 
                         className="skeleton"/>
                     ))
                  ) : statCards.map((sc, i) => (
                    <motion.div key={sc.label}
                      initial={{opacity:0,scale:0.9,rotateX:-10}} animate={{opacity:1,scale:1,rotateX:0}}
                      transition={{delay:i*0.1,type:'spring'}}
                      whileHover={{y:-6,boxShadow:`0 20px 40px ${sc.bg}`}}
                      style={{background:T.bgCard,borderRadius:24,padding:28,border:`1px solid ${T.border}`,
                        display:'flex',flexDirection:'column',justifyContent:'space-between',
                        backdropFilter:'blur(20px)',transformPerspective:1000}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                        <div style={{width:12,height:12,borderRadius:'50%',background:sc.color,
                          boxShadow:`0 0 10px ${sc.color}`}}/>
                        <span style={{fontSize:14,fontWeight:600,color:T.textSub}}>{sc.label}</span>
                      </div>
                      <div style={{fontSize:42,fontWeight:900,color:T.text,letterSpacing:'-0.03em'}}>
                        {sc.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                style={{background:T.bgCard,borderRadius:24,border:`1px solid ${T.border}`,overflow:'hidden',
                  boxShadow:'0 20px 50px rgba(0,0,0,0.05)'}}>
                
                {/* Header dengan tombol + Buat Admin */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:`1px solid ${T.border}`}}>
                  <div>
                    <h3 style={{margin:0,fontSize:16,fontWeight:800,color:T.text}}>Daftar Pengguna</h3>
                    <p style={{margin:'2px 0 0',fontSize:12,color:T.textMuted}}>Kelola akun pengguna, peran, dan penangguhan akses</p>
                  </div>
                  {isSuperAdmin && (
                    <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      onClick={() => setShowCreateAdmin(true)}
                      style={{padding:'10px 18px',borderRadius:12,background:T.gradientGold,
                        color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',
                        boxShadow:'0 4px 14px rgba(184,134,46,0.3)',display:'flex',alignItems:'center',gap:6}}>
                      <span>+</span> Buat Admin Baru
                    </motion.button>
                  )}
                </div>

                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
                    <thead>
                      <tr style={{background:'rgba(255,255,255,0.4)',borderBottom:`1px solid ${T.border}`}}>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Pengguna</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Peran</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Status</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase',textAlign:'right'}}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i}><td colSpan={4} style={{padding:20}}><div className="skeleton" style={{height:40,borderRadius:8}}/></td></tr>
                        ))
                      ) : users.map((u, i) => {
                        const isSA = u.roles.some(r => r.name === 'SUPER_ADMIN')
                        const isA = u.roles.some(r => r.name === 'ADMIN')
                        return (
                          <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}}
                            style={{borderBottom:`1px solid ${T.border}`,transition:'background 0.2s'}}
                            onMouseEnter={e => e.currentTarget.style.background = T.bgSolid}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{padding:'16px 20px'}}>
                              <div style={{display:'flex',alignItems:'center',gap:12}}>
                                <div style={{width:40,height:40,borderRadius:'50%',background:T.gradient,color:'#fff',
                                  display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>
                                  {getInitials(u.email)}
                                </div>
                                <div>
                                  <div style={{fontWeight:700,color:T.text,fontSize:14}}>{u.name || '-'}</div>
                                  <div style={{color:T.textSub,fontSize:12}}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{padding:'16px 20px'}}>
                              <span style={{padding:'4px 10px',borderRadius:20,fontSize:10,fontWeight:700,
                                background:isSA?T.orangeBg:isA?T.blueBg:T.bgSolid,
                                color:isSA?T.orange:isA?T.blue:T.textSub, border:`1px solid ${T.border}`}}>
                                {isSA ? 'SUPER ADMIN' : isA ? 'ADMIN' : 'USER'}
                              </span>
                            </td>
                            <td style={{padding:'16px 20px'}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <div style={{width:8,height:8,borderRadius:'50%',
                                  background:u.status==='active'?T.green:T.red}}/>
                                <span style={{fontSize:13,fontWeight:600,
                                  color:u.status==='active'?T.green:T.red}}>
                                  {u.status.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td style={{padding:'16px 20px',textAlign:'right'}}>
                              <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                                {!isSA && (
                                  <>
                                    {isSuperAdmin && (
                                      !isA ? (
                                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handlePromoteAdmin(u.id, u.name || u.email)}
                                          style={{background:T.orangeBg,color:T.orange,border:`1px solid rgba(234,179,8,0.3)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:700}}>⭐ Make Admin</motion.button>
                                      ) : (
                                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleDemoteUser(u.id, u.name || u.email)}
                                          style={{background:T.bgSolid,color:T.textSub,border:`1px solid ${T.border}`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>👤 Demote User</motion.button>
                                      )
                                    )}
                                    {isSuperAdmin && (
                                      u.status !== 'banned' ? (
                                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleBan(u.id)}
                                          style={{background:T.redBg,color:T.red,border:`1px solid rgba(196,69,58,0.2)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>Ban</motion.button>
                                      ) : (
                                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleUnban(u.id)}
                                          style={{background:T.greenBg,color:T.green,border:`1px solid rgba(59,122,87,0.2)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>Unban</motion.button>
                                      )
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* FILES TAB */}
            {activeTab === 'files' && (
              <motion.div key="files" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                style={{background:T.bgCard,borderRadius:24,border:`1px solid ${T.border}`,overflow:'hidden',
                  boxShadow:'0 20px 50px rgba(0,0,0,0.05)'}}>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
                    <thead>
                      <tr style={{background:'rgba(255,255,255,0.4)',borderBottom:`1px solid ${T.border}`}}>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Nama File</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Ukuran</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Pemilik</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i}><td colSpan={4} style={{padding:20}}><div className="skeleton" style={{height:40,borderRadius:8}}/></td></tr>
                        ))
                      ) : files.map((f, i) => (
                        <motion.tr key={f.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                          style={{borderBottom:`1px solid ${T.border}`,transition:'background 0.2s'}}
                          onMouseEnter={e => e.currentTarget.style.background = T.bgSolid}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{padding:'16px 20px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:12}}>
                              <div style={{width:32,height:32,borderRadius:8,background:T.primaryGlow,
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                                📄
                              </div>
                              <span style={{fontWeight:600,color:T.text,fontSize:14}}>{formatName((f.name || '').split('/').pop())}</span>
                            </div>
                          </td>
                          <td style={{padding:'16px 20px',color:T.textSub,fontSize:13}}>
                            {formatSize(f.metadata?.size || 0)}
                          </td>
                          <td style={{padding:'16px 20px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:24,height:24,borderRadius:'50%',background:T.gradient,color:'#fff',
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>
                                {getInitials(f.user_email)}
                              </div>
                              <span style={{fontSize:13,color:T.textSub}}>{f.user_email}</span>
                            </div>
                          </td>
                          <td style={{padding:'16px 20px',color:T.textSub,fontSize:12}}>
                            {new Date(f.created_at).toLocaleString('id-ID')}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {!loading && files.length === 0 && (
                     <div style={{padding:40,textAlign:'center',color:T.textMuted,fontSize:14}}>Belum ada file di server.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div key="logs" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                style={{background:T.bgCard,borderRadius:24,border:`1px solid ${T.border}`,overflow:'hidden',
                  boxShadow:'0 20px 50px rgba(0,0,0,0.05)'}}>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
                    <thead>
                      <tr style={{background:'rgba(255,255,255,0.4)',borderBottom:`1px solid ${T.border}`}}>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Waktu</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Pengguna</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Aksi</th>
                        <th style={{padding:'20px',fontSize:12,color:T.textMuted,fontWeight:700,textTransform:'uppercase'}}>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i}><td colSpan={4} style={{padding:20}}><div className="skeleton" style={{height:40,borderRadius:8}}/></td></tr>
                        ))
                      ) : logs.map((log, i) => (
                        <motion.tr key={log.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                          style={{borderBottom:`1px solid ${T.border}`,transition:'background 0.2s'}}
                          onMouseEnter={e => e.currentTarget.style.background = T.bgSolid}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{padding:'16px 20px',color:T.textSub,fontSize:12,whiteSpace:'nowrap'}}>
                            {new Date(log.created_at).toLocaleString('id-ID')}
                          </td>
                          <td style={{padding:'16px 20px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:24,height:24,borderRadius:'50%',background:T.gradient,color:'#fff',
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>
                                {getInitials(log.user?.email || '?')}
                              </div>
                              <span style={{fontSize:13,color:T.text,fontWeight:600}}>{log.user?.email || 'System'}</span>
                            </div>
                          </td>
                          <td style={{padding:'16px 20px'}}>
                            <span style={{padding:'4px 10px',borderRadius:20,fontSize:10,fontWeight:700,
                              background:T.bgSolid,color:T.primary,border:`1px solid ${T.border}`}}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{padding:'16px 20px',color:T.textSub,fontSize:13}}>
                            {log.details}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {!loading && logs.length === 0 && (
                     <div style={{padding:40,textAlign:'center',color:T.textMuted,fontSize:14}}>Belum ada riwayat aktivitas.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* MODAL CREATE ADMIN BARU */}
      <AnimatePresence>
        {showCreateAdmin && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(12px)',
              display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:20}}
            onClick={() => setShowCreateAdmin(false)}>
            <motion.form initial={{scale:0.92,y:15}} animate={{scale:1,y:0}} exit={{scale:0.92,y:15}}
              onSubmit={handleCreateAdmin} onClick={e => e.stopPropagation()}
              style={{background:T.bgCard,border:`1px solid ${T.borderStrong}`,borderRadius:24,
                padding:28,width:'100%',maxWidth:420,boxShadow:'0 24px 60px rgba(0,0,0,0.3)'}}>
              
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <div style={{width:44,height:44,borderRadius:14,background:T.orangeBg,
                  border:`1px solid ${T.orange}44`,display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:22}}>
                  👑
                </div>
                <div>
                  <h3 style={{margin:0,fontSize:18,fontWeight:800,color:T.text}}>Buat Akun Admin Baru</h3>
                  <p style={{margin:'2px 0 0',fontSize:12,color:T.textMuted}}>Daftarkan Admin dengan hak akses sistem</p>
                </div>
              </div>

              <div style={{marginBottom:14}}>
                <label style={{display:'block',marginBottom:6,fontSize:12,fontWeight:700,color:T.textSub}}>Nama Lengkap</label>
                <input type="text" required placeholder="Masukkan nama"
                  value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})}
                  style={{width:'100%',boxSizing:'border-box',padding:'12px 14px',borderRadius:12,
                    background:T.bgSolid,border:`1px solid ${T.borderStrong}`,color:T.text,
                    fontSize:14,outline:'none'}} />
              </div>

              <div style={{marginBottom:14}}>
                <label style={{display:'block',marginBottom:6,fontSize:12,fontWeight:700,color:T.textSub}}>Email Admin</label>
                <input type="email" required placeholder="admin@domain.com"
                  value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})}
                  style={{width:'100%',boxSizing:'border-box',padding:'12px 14px',borderRadius:12,
                    background:T.bgSolid,border:`1px solid ${T.borderStrong}`,color:T.text,
                    fontSize:14,outline:'none'}} />
              </div>

              <div style={{marginBottom:22}}>
                <label style={{display:'block',marginBottom:6,fontSize:12,fontWeight:700,color:T.textSub}}>Password (Min. 6 Karakter)</label>
                <input type="password" required minLength={6} placeholder="••••••••"
                  value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                  style={{width:'100%',boxSizing:'border-box',padding:'12px 14px',borderRadius:12,
                    background:T.bgSolid,border:`1px solid ${T.borderStrong}`,color:T.text,
                    fontSize:14,outline:'none'}} />
              </div>

              <div style={{display:'flex',gap:10}}>
                <button type="button" onClick={() => setShowCreateAdmin(false)}
                  style={{flex:1,padding:'12px',borderRadius:12,background:'transparent',
                    color:T.text,border:`1px solid ${T.border}`,cursor:'pointer',fontSize:13,fontWeight:600}}>
                  Batal
                </button>
                <button type="submit" disabled={adminLoading}
                  style={{flex:1,padding:'12px',borderRadius:12,background:T.gradientGold,
                    color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,
                    boxShadow:'0 4px 14px rgba(184,134,46,0.3)'}}>
                  {adminLoading ? 'Memproses...' : 'Buat Admin'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for Skeleton */}
      <style>{`
        .skeleton {
          background: linear-gradient(90deg, ${T.bgSolid} 25%, #fff 50%, ${T.bgSolid} 75%);
          background-size: 200% 100%;
          animation: skeletonLoad 1.5s infinite;
        }
        @keyframes skeletonLoad {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
