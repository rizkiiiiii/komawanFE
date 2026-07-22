import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { T } from '../theme'
import { ShieldCheck, Server, Zap } from 'lucide-react'

function Cloud({ top, left, bottom, right, opacity = 0.4, delay = 0, scale = 1, blur = 0, driftX = 30 }) {
  return (
    <motion.div
      style={{ position: 'absolute', top, left, bottom, right, zIndex: 0, opacity, color: '#E2E8F0',
        pointerEvents: 'none', filter: blur ? `blur(${blur}px)` : 'none' }}
      initial={{ scale: scale * 0.9 }}
      animate={{ y: [0, -18, 0], x: [0, driftX, 0], scale: [scale*0.98, scale*1.02, scale*0.98] }}
      transition={{ duration: 10 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}>
      <svg width={240 * scale} height={240 * scale} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.154.008-.306.023-.456C11.535 15.112 9.878 16 8 16c-2.761 0-5-2.239-5-5s2.239-5 5-5c.484 0 .95.069 1.385.195C10.364 4.316 12.029 3 14 3c3.314 0 6 2.686 6 6 0 .152-.006.301-.016.448C21.71 9.93 23 11.317 23 13c0 2.209-1.791 4-4 4h-1.5z"/>
      </svg>
    </motion.div>
  )
}

function CountUp({ target, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const num = parseFloat(target)
    if (isNaN(num)) { setVal(target); return }
    const duration = 1200
    const startTime = performance.now()
    function tick(now) {
      const p = Math.min((now - startTime) / duration, 1)
      setVal((num * p).toFixed(target.includes('.') ? 1 : 0))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])
  return <span ref={ref}>{isNaN(parseFloat(target)) ? target : val}{suffix}</span>
}

function WordReveal({ text, delay = 0, style }) {
  const words = text.split(' ')
  return (
    <span style={{display:'inline'}}>
      {words.map((w, i) => (
        <span key={i} style={{display:'inline-block',overflow:'hidden',verticalAlign:'top'}}>
          <motion.span
            initial={{y:'100%'}} animate={{y:0}}
            transition={{duration:0.6,delay:delay+i*0.05,ease:[0.22,1,0.36,1]}}
            style={{display:'inline-block',...style}}>
            {w}{i < words.length-1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function FeatureCard({ icon, title, desc, i }) {
  return (
    <motion.div initial={{opacity:0,y:30,rotateX:-8}} whileInView={{opacity:1,y:0,rotateX:0}}
      viewport={{once:true}} transition={{duration:0.6,delay:i*0.12,ease:[0.22,1,0.36,1]}}
      whileHover={{y:-6,rotateX:4,rotateY:i===1?0:(i===0?-4:4), boxShadow:`0 20px 40px rgba(0,0,0,0.1)`}}
      style={{background:T.bgCard,borderRadius:24,padding:'32px 28px',
        flex:'1 1 260px',maxWidth:300,border:`1px solid ${T.border}`,
        backdropFilter:'blur(12px)',
        transformStyle:'preserve-3d',transformPerspective:800}}>
      <div style={{width:48,height:48,background:T.bg,border:`1px solid ${T.borderStrong}`,borderRadius:14,
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:20}}>
        {icon}
      </div>
      <h3 style={{fontSize:17,fontWeight:600,color:T.text,margin:'0 0 10px'}}>{title}</h3>
      <p style={{fontSize:14,color:T.textMuted,lineHeight:1.7,margin:0}}>{desc}</p>
    </motion.div>
  )
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{fontFamily:'Inter, Arial, sans-serif', background: T.bg, color: T.text}}>

      <nav style={{position:'fixed',top:0,left:0,right:0,padding:'16px 5%',
        display:'flex',justifyContent:'space-between',alignItems:'center',
        background:'rgba(255,255,255,0.8)',backdropFilter:'blur(10px)',borderBottom:`1px solid ${T.border}`,
        zIndex:100,transition:'all 0.3s'}}>
        
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <div style={{width:36,height:36,background:T.gradient,borderRadius:12,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:`0 4px 16px ${T.accentGlow}`}}>
            <span style={{color:'#fff',fontSize:18}}>☁</span>
          </div>
          <span style={{fontWeight:800,fontSize:20,color:T.text,letterSpacing:'-0.02em'}}>CloudFile</span>
        </div>

        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <span onClick={()=>scrollTo('fitur')} style={{cursor:'pointer',fontSize:14,fontWeight:600,color:T.textSub,transition:'color 0.2s'}}>Fitur</span>
          <span onClick={()=>scrollTo('cara-kerja')} style={{cursor:'pointer',fontSize:14,fontWeight:600,color:T.textSub,transition:'color 0.2s'}}>Cara Kerja</span>
          <motion.button onClick={onGetStarted}
            whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            style={{background:T.bgCard,color:T.text,border:`1px solid ${T.borderStrong}`,padding:'10px 20px',
              borderRadius:100,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            Masuk
          </motion.button>
          <motion.button onClick={onGetStarted}
            whileHover={{scale:1.02,boxShadow:`0 8px 24px ${T.accentGlow}`}} whileTap={{scale:0.98}}
            style={{background:T.gradient,color:'#fff',border:'none',padding:'10px 24px',
              borderRadius:100,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
              boxShadow:`0 4px 12px ${T.accentGlow}`}}>
            Mulai Gratis
          </motion.button>
        </div>
      </nav>

      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',textAlign:'center',
        padding:'120px 20px 80px',position:'relative',overflow:'hidden',
        background: T.bg}}>

        {/* Lapisan jauh - kecil, blur, pelan */}
        <Cloud top="10%" left="15%" scale={0.5} opacity={0.25} blur={2} delay={1} driftX={15}/>
        <Cloud top="60%" right="20%" scale={0.4} opacity={0.2} blur={3} delay={3} driftX={-15}/>

        {/* Lapisan tengah */}
        <Cloud top="15%" left="-5%" scale={1.2} delay={0} driftX={40}/>
        <Cloud top="25%" right="-2%" scale={0.8} delay={2} driftX={-35}/>
        <Cloud bottom="20%" left="10%" scale={0.6} delay={4} driftX={25}/>

        {/* Lapisan dekat - besar, tajam, cepat */}
        <Cloud bottom="5%" right="8%" scale={1.4} opacity={0.5} delay={1.5} driftX={-45}/>

        {/* Sun glow di belakang headline */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)',
            width:500, height:500, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            zIndex:0, pointerEvents:'none' }}/>

        <div style={{position:'relative',zIndex:1}}>
            <h1 style={{fontWeight:800,fontSize:56,color:T.text,margin:'0 0 24px',
                lineHeight:1.1,letterSpacing:'-0.03em'}}>
              <WordReveal text="Berkas Anda, selalu di atas" delay={0.1}/>{' '}
              <span style={{display:'inline-block',overflow:'hidden',verticalAlign:'top'}}>
                <motion.span initial={{y:'100%'}} animate={{y:0}}
                  transition={{duration:0.6,delay:0.4,ease:[0.22,1,0.36,1]}}
                  style={{display:'inline-block',background:T.gradient,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  awan
                </motion.span>
              </span>
            </h1>
            <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              transition={{duration:0.7,delay:0.5}}
              style={{fontSize:16,color:T.textMuted,margin:'0 auto 40px',maxWidth:440,lineHeight:1.6}}>
              Sistem manajemen file terdistribusi dengan keamanan berlapis dan verifikasi
              dua langkah, dibangun untuk kecepatan dan ketenangan pikiran.
            </motion.p>
        </div>
      </section>

      <div style={{background:T.bg,padding:'36px 40px',borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',justifyContent:'center',gap:80,flexWrap:'wrap',maxWidth:900,margin:'0 auto'}}>
          {[
            {n:'10',suf:' GB',l:'Storage per akun Pro'},
            {n:'2',suf:' langkah',l:'Verifikasi login'},
            {n:'99.9',suf:'%',l:'Uptime storage'},
            {n:'Singapura',suf:'',l:'Lokasi server'},
          ].map((s,i) => (
            <motion.div key={i} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{duration:0.5,delay:i*0.08}}
              style={{textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:T.text}}>
                <CountUp target={s.n} suffix={s.suf}/>
              </div>
              <div style={{fontSize:13,color:T.textMuted,marginTop:6,fontWeight:500}}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div id="fitur" style={{background:T.bg,padding:'100px 40px'}}>
        <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          transition={{duration:0.5}} style={{textAlign:'center',marginBottom:60}}>
          <h2 style={{fontWeight:800,fontSize:36,color:T.text,margin:'0 0 16px',letterSpacing:'-0.02em'}}>
            Dibangun untuk keamanan
          </h2>
          <p style={{fontSize:16,color:T.textSub,margin:0,maxWidth:500,marginLeft:'auto',marginRight:'auto',lineHeight:1.6}}>
            Tiga lapisan proteksi yang bekerja bersamaan setiap kali kamu mengakses berkas berhargamu.
          </p>
        </motion.div>
        <div style={{display:'flex',justifyContent:'center',gap:32,flexWrap:'wrap',maxWidth:1100,margin:'0 auto'}}>
          <FeatureCard i={0} icon={<ShieldCheck size={22} color={T.accent}/>} title="Verifikasi 2 Langkah"
            desc="Kode OTP dikirim ke email setiap kali masuk, mencegah akses tidak sah walau kata sandi bocor."/>
          <FeatureCard i={1} icon={<Server size={22} color={T.accent}/>} title="Storage Terdistribusi"
            desc="Data tersebar aman di banyak node dengan enkripsi RLS di setiap lapisan akses tingkat lanjut."/>
          <FeatureCard i={2} icon={<Zap size={22} color={T.accent}/>} title="Performa Tinggi"
            desc="Dibangun di atas infrastruktur modern untuk upload dan sinkronisasi yang sangat cepat."/>
        </div>
      </div>

      <div id="cara-kerja" style={{background:T.bgCard,padding:'100px 40px',borderTop:`1px solid ${T.border}`}}>
        <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          transition={{duration:0.6}}
          style={{textAlign:'center',fontWeight:800,fontSize:36,color:T.text,
            margin:'0 0 16px',letterSpacing:'-0.02em'}}>
          Cara Kerjanya
        </motion.h2>
        <motion.p initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          transition={{duration:0.6,delay:0.1}}
          style={{textAlign:'center',fontSize:14,color:T.textSub,margin:'0 0 48px'}}>
          Tiga langkah sederhana dari mendaftar sampai berbagi berkas
        </motion.p>
        <div style={{display:'flex',justifyContent:'center',gap:0,flexWrap:'wrap',
          maxWidth:900,margin:'0 auto',position:'relative'}}>
          {[
            {n:'01',t:'Daftar & Verifikasi',d:'Buat akun, lalu masukkan kode OTP yang dikirim ke email kamu.'},
            {n:'02',t:'Unggah Berkas',d:'Drag & drop atau pilih file tersimpan aman dengan enkripsi cloud.'},
            {n:'03',t:'Kelola & Bagikan',d:'Atur folder, buat tautan berbagi, dan pantau storage kapan saja.'},
          ].map((s,i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{duration:0.5,delay:i*0.15}}
              style={{flex:'1 1 240px',maxWidth:280,padding:'0 20px',position:'relative'}}>
              <div style={{fontSize:48,fontWeight:900,color:T.border,marginBottom:-24,marginLeft:-10}}>{s.n}</div>
              <h3 style={{fontSize:18,fontWeight:700,color:T.text,margin:'8px 0 12px',position:'relative'}}>{s.t}</h3>
              <p style={{fontSize:14,color:T.textMuted,lineHeight:1.7,margin:0}}>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{background:T.bg,padding:'100px 40px',textAlign:'center',position:'relative',overflow:'hidden',borderTop:`1px solid ${T.border}`}}>
        <motion.div initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
          transition={{duration:0.6}} style={{position:'relative',zIndex:2}}>
          <h2 style={{fontWeight:800,fontSize:40,color:T.text,margin:'0 0 16px',letterSpacing:'-0.02em'}}>
            Siap menyimpan berkas dengan aman?
          </h2>
          <p style={{fontSize:16,color:T.textSub,margin:'0 0 40px'}}>
            Gratis untuk 1 GB pertama, tidak perlu kartu kredit.
          </p>
          <motion.button whileHover={{scale:1.05,y:-2,boxShadow:`0 24px 48px ${T.accentGlow}`}}
            whileTap={{scale:0.96}} onClick={onGetStarted}
            style={{background:T.gradient,color:'#fff',fontWeight:700,fontSize:16,
              padding:'18px 40px',borderRadius:100,border:'none',cursor:'pointer',fontFamily:'inherit',
              boxShadow:`0 10px 30px ${T.accentGlow}`}}>
            Mulai Gratis Sekarang
          </motion.button>
        </motion.div>
      </div>

      <div style={{background:T.bgCard,padding:'40px 48px',borderTop:`1px solid ${T.border}`,
        display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,background:T.border,borderRadius:8,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:T.text,fontSize:14}}>☁</span>
          </div>
          <span style={{fontWeight:600,fontSize:14,color:T.text}}>CloudFile Manager</span>
        </div>
        <span style={{fontSize:13,color:T.textMuted}}>
          © 2026 CloudFile Manager · Hak Cipta Dilindungi
        </span>
      </div>
    </div>
  )
}
