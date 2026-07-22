import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { T } from '../../theme'
import api from '../../api'
import { formatSize, formatName, getInitials } from '../../utils'
import useIsMobile from '../../hooks/useIsMobile'
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

  function showToast(msg, type='success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:'', type:'success' }), 3500)
  }

  // Ambil roles dari localStorage yang diset saat login Laravel
  const roles = JSON.parse(localStorage.getItem('roles') || '[]')
  const isSuperAdmin = roles.includes('SUPER_ADMIN')
  const isAdminRole = roles.includes('ADMIN')

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  async function fetchData(tab) {
    setLoading(true)
    try {
      if (tab === 'stats') {
        const res = await api.get('/admin/stats')
        setStats(res.data.data)
      } else if (tab === 'users') {
        const res = await api.get('/users')
        setUsers(res.data.data)
      } else if (tab === 'files') {
        const res = await api.get('/admin/files')
        setFiles(res.data.data)
      } else if (tab === 'logs') {
        const res = await api.get('/admin/audit-logs')
        setLogs(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleBan(userId) {
    if (!window.confirm('Yakin ingin memblokir permanen pengguna ini?')) return
    try {
      await api.put(`/users/${userId}/ban`)
      showToast('Pengguna diblokir permanen', 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal memblokir: ' + err.message, 'error') }
  }

  async function handleUnban(userId) {
    try {
      await api.put(`/users/${userId}/unban`)
      showToast('Blokir dibuka', 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal membuka blokir: ' + err.message, 'error') }
  }

  async function handleSuspend(userId) {
    const hours = prompt('Berapa jam ingin menangguhkan (suspend) pengguna ini? (1-12)')
    if (!hours) return
    try {
      await api.put(`/users/${userId}/suspend`, { hours: parseInt(hours) })
      showToast(`Pengguna ditangguhkan selama ${hours} jam`, 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal menangguhkan: ' + err.message, 'error') }
  }

  async function handleUnsuspend(userId) {
    try {
      await api.put(`/users/${userId}/unsuspend`)
      showToast('Penangguhan dicabut', 'success')
      fetchData('users')
    } catch (err) { showToast('Gagal membuka penangguhan: ' + err.message, 'error') }
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
                                  background:u.status==='active'?T.green:u.status==='suspended'?T.yellow:T.red}}/>
                                <span style={{fontSize:13,fontWeight:600,
                                  color:u.status==='active'?T.green:u.status==='suspended'?T.yellow:T.red}}>
                                  {u.status.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td style={{padding:'16px 20px',textAlign:'right'}}>
                              <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                                {!isSA && (
                                  <>
                                    {isSuperAdmin && (
                                      u.status !== 'banned' ? (
                                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleBan(u.id)}
                                          style={{background:T.redBg,color:T.red,border:`1px solid rgba(196,69,58,0.2)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>Ban</motion.button>
                                      ) : (
                                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleUnban(u.id)}
                                          style={{background:T.greenBg,color:T.green,border:`1px solid rgba(59,122,87,0.2)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>Unban</motion.button>
                                      )
                                    )}
                                    {(!isA || isSuperAdmin) && (
                                      <>
                                        {u.status !== 'suspended' && u.status !== 'banned' && (
                                          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleSuspend(u.id)}
                                            style={{background:T.yellowBg,color:T.yellow,border:`1px solid rgba(212,163,44,0.2)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>Suspend</motion.button>
                                        )}
                                        {u.status === 'suspended' && (
                                          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleUnsuspend(u.id)}
                                            style={{background:T.greenBg,color:T.green,border:`1px solid rgba(59,122,87,0.2)`,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600}}>Unsuspend</motion.button>
                                        )}
                                      </>
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
                              <span style={{fontWeight:600,color:T.text,fontSize:14}}>{formatName(f.original_name)}</span>
                            </div>
                          </td>
                          <td style={{padding:'16px 20px',color:T.textSub,fontSize:13}}>
                            {formatSize(f.size)}
                          </td>
                          <td style={{padding:'16px 20px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:24,height:24,borderRadius:'50%',background:T.gradient,color:'#fff',
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>
                                {getInitials(f.user?.email || '?')}
                              </div>
                              <span style={{fontSize:13,color:T.textSub}}>{f.user?.email}</span>
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