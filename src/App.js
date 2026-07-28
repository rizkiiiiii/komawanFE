import { useState, useEffect } from 'react'
import api from './api'
import Aurora from './components/Aurora'
import Stars from './components/Stars'
import Auth from './components/Auth'
import FileManager from './components/FileManager'
import { motion } from 'framer-motion'
import { T } from './theme'
import LandingPage from './components/LandingPage'
import AdminDashboard from './components/admin/AdminDashboard'

function Loading() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',background:T.bg,fontFamily:'Arial',
      position:'relative',overflow:'hidden'}}>
      <Aurora/><Stars/>
      <div style={{textAlign:'center',position:'relative',zIndex:1}}>
        <motion.div animate={{scale:[1,1.15,1],rotate:[0,10,-10,0]}}
          transition={{duration:2,repeat:Infinity}}
          style={{fontSize:72,marginBottom:20,
            filter:`drop-shadow(0 0 24px ${T.primaryGlow})`}}>☁️</motion.div>
        <motion.p animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.5,repeat:Infinity}}
          style={{fontSize:16,color:T.textSub,fontWeight:600,margin:'0 0 24px'}}>
          Loading CloudFile Manager...
        </motion.p>
        <div style={{display:'flex',justifyContent:'center',gap:8}}>
          {[0,1,2].map(i => (
            <motion.div key={i}
              animate={{scale:[1,1.6,1],opacity:[0.3,1,0.3],y:[0,-8,0]}}
              transition={{duration:0.8,repeat:Infinity,delay:i*0.18}}
              style={{width:9,height:9,borderRadius:'50%',background:T.primary,
                boxShadow:`0 0 8px ${T.primaryGlow}`}}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('user') // 'user' | 'admin'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me').then(res => {
        setUser(res.data.data)
        setLoading(false)
      }).catch(err => {
        console.warn('Gagal fetch user:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('roles')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const [showLanding, setShowLanding] = useState(true)

if (loading) return <Loading/>
if (user) {
  if (viewMode === 'admin') {
    return <AdminDashboard user={user} onBack={() => setViewMode('user')} />
  }
  return <FileManager user={user} onOpenAdmin={() => setViewMode('admin')} />
}
if (showLanding) return <LandingPage onGetStarted={() => setShowLanding(false)}/>
return <Auth onBackToLanding={() => setShowLanding(true)}/>
}
