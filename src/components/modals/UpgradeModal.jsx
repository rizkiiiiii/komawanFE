import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { T, FREE_STORAGE, PRO_STORAGE, FREE_MAX_FILE, PRO_MAX_FILE } from '../../theme'
import { formatSize } from '../../utils'

export default function UpgradeModal({ onClose, onUpgradeSuccess }) {
  const [step, setStep] = useState('compare') // 'compare' | 'loading' | 'success'

  function handleActivate() {
    setStep('loading')
    setTimeout(() => {
      setStep('success')
      // Notify parent after short delay so user sees success screen first
      setTimeout(() => onUpgradeSuccess && onUpgradeSuccess(), 2200)
    }, 1600)
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',
        backdropFilter:'blur(14px)',display:'flex',alignItems:'center',
        justifyContent:'center',zIndex:2000,padding:20}} onClick={onClose}>
      <motion.div
        initial={{opacity:0,scale:0.85,y:40}} animate={{opacity:1,scale:1,y:0}}
        transition={{type:'spring',stiffness:300,damping:25}}
        onClick={e => e.stopPropagation()}
        style={{background:T.bgCardSolid,backdropFilter:'blur(24px)',
          border:`1px solid rgba(245,158,11,0.2)`,borderRadius:24,padding:32,
          width:500,maxHeight:'90vh',overflowY:'auto',
          boxShadow:`0 32px 80px rgba(0,0,0,0.15)`}}>

        <AnimatePresence mode='wait'>

          {/* ── STEP 1: Plan Comparison ── */}
          {step === 'compare' && (
            <motion.div key='compare'
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-10}}>

              <div style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',marginBottom:22}}>
                <h2 style={{margin:0,fontSize:20,fontWeight:900,background:T.gradientGold,
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  ⚡ Upgrade ke Pro
                </h2>
                <motion.button whileHover={{scale:1.1,background:T.redBg}} onClick={onClose}
                  style={{background:T.bgCard,color:T.text,padding:'7px 13px',borderRadius:9,
                    border:`1px solid ${T.border}`,cursor:'pointer',fontSize:13}}>✕</motion.button>
              </div>

              {/* Plan comparison cards */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:22}}>
                {[
                  {
                    name:'🆓 Free', tag:'Plan sekarang', isPro:false,
                    features:[
                      ['Storage',          formatSize(FREE_STORAGE)],
                      ['Max upload',       formatSize(FREE_MAX_FILE)],
                      ['Share link',       '1 jam'],
                      ['Priority support', '✗'],
                      ['Analytics',        '✗'],
                    ]
                  },
                  {
                    name:'⚡ Pro', tag:'POPULER', isPro:true,
                    features:[
                      ['Storage',          formatSize(PRO_STORAGE)],
                      ['Max upload',       formatSize(PRO_MAX_FILE)],
                      ['Share link',       '7 hari'],
                      ['Priority support', '✓'],
                      ['Analytics',        '✓'],
                    ]
                  }
                ].map(plan => (
                  <div key={plan.name}
                    style={{background:plan.isPro
                      ?'linear-gradient(145deg,rgba(245,158,11,0.1),rgba(239,68,68,0.06))'
                      :T.bgCard,
                      borderRadius:16,padding:16,position:'relative',
                      border:`1px solid ${plan.isPro?'rgba(245,158,11,0.35)':T.border}`}}>
                    <div style={{position:'absolute',top:-10,right:12,
                      background:plan.isPro?T.gradientGold:'rgba(255,255,255,0.1)',
                      borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:900,
                      color:plan.isPro?'white':T.textMuted}}>
                      {plan.tag}
                    </div>
                    <p style={{margin:'0 0 14px',fontSize:14,fontWeight:900,
                      color:plan.isPro?T.gold:T.text}}>{plan.name}</p>
                    {plan.features.map(([k,v]) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',
                        fontSize:11,marginBottom:6}}>
                        <span style={{color:T.textMuted}}>{k}</span>
                        <span style={{
                          color:v==='✗'?T.textMuted:plan.isPro?T.gold:T.green,
                          fontWeight:600}}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Benefit highlight */}
              <div style={{background:'rgba(245,158,11,0.06)',border:`1px solid rgba(245,158,11,0.2)`,
                borderRadius:14,padding:'12px 16px',marginBottom:10}}>
                {[
                  '☁️  Storage 10× lebih besar — dari 1 GB ke 10 GB',
                  '🚀  Upload file hingga 500 MB per file*',
                  '🔗  Share link aktif 7 hari (bukan 1 jam)',
                ].map(t => (
                  <p key={t} style={{margin:'4px 0',fontSize:12,color:T.textSub}}>{t}</p>
                ))}
              </div>

              <p style={{fontSize:9,color:T.textMuted,margin:'0 0 16px',
                lineHeight:1.5,fontStyle:'italic'}}>
                *Batas upload 500MB akan aktif penuh setelah infrastruktur di-upgrade ke Supabase Pro Plan
              </p>

              <motion.button onClick={handleActivate}
                whileHover={{scale:1.03,boxShadow:`0 8px 28px rgba(245,158,11,0.45)`}}
                whileTap={{scale:0.97}}
                style={{width:'100%',padding:14,borderRadius:14,
                  background:T.gradientGold,color:'white',
                  fontSize:15,fontWeight:900,border:'none',
                  cursor:'pointer',fontFamily:'Arial',
                  boxShadow:`0 4px 16px rgba(245,158,11,0.3)`}}>
                ⚡ Aktifkan Pro (Demo)
              </motion.button>

              <p style={{fontSize:10,color:T.textMuted,textAlign:'center',marginTop:10}}>
                Simulasi aktivasi untuk demonstrasi arsitektur · Tidak ada transaksi nyata
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: Loading ── */}
          {step === 'loading' && (
            <motion.div key='loading'
              initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              exit={{opacity:0}} style={{textAlign:'center',padding:'40px 0'}}>
              <motion.div
                animate={{rotate:360}}
                transition={{duration:1,repeat:Infinity,ease:'linear'}}
                style={{fontSize:56,marginBottom:20,display:'inline-block'}}>⚡</motion.div>
              <p style={{color:T.text,fontSize:17,fontWeight:900,margin:'0 0 8px'}}>
                Mengaktifkan Pro Plan...
              </p>
              <p style={{color:T.textMuted,fontSize:12}}>Menyiapkan storage 10 GB untukmu</p>
              {/* Progress bar */}
              <div style={{maxWidth:260,margin:'20px auto 0',
                background:'rgba(255,255,255,0.06)',borderRadius:10,height:6,overflow:'hidden'}}>
                <motion.div
                  initial={{width:'0%'}} animate={{width:'100%'}}
                  transition={{duration:1.4,ease:'easeInOut'}}
                  style={{height:6,borderRadius:10,background:T.gradientGold}}/>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && (
            <motion.div key='success'
              initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              style={{textAlign:'center',padding:'20px 0'}}>
              <motion.div
                animate={{scale:[0,1.3,1],rotate:[0,20,-10,0]}}
                transition={{duration:0.7,type:'spring'}}
                style={{fontSize:68,marginBottom:16}}>🎉</motion.div>
              <h3 style={{margin:'0 0 8px',fontSize:22,fontWeight:900,
                background:T.gradientGold,WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent'}}>
                Pro Plan Aktif!
              </h3>
              <p style={{color:T.textMuted,fontSize:13,margin:'0 0 4px',lineHeight:1.8}}>
                Storage kamu sekarang <strong style={{color:T.gold}}>10 GB</strong><br/>
                Upload hingga <strong style={{color:T.gold}}>500 MB</strong> per file*<br/>
                Share link aktif <strong style={{color:T.gold}}>7 hari</strong>
              </p>
              <p style={{fontSize:9,color:T.textMuted,margin:'0 0 18px',fontStyle:'italic'}}>
                *aktif penuh setelah infrastruktur di-upgrade ke Supabase Pro Plan
              </p>
              {/* Feature badges */}
              <div style={{display:'flex',justifyContent:'center',gap:8,
                flexWrap:'wrap',marginBottom:24}}>
                {['10 GB Storage','500 MB Upload*','Share 7 Hari','Priority Support','Analytics'].map(f => (
                  <span key={f} style={{fontSize:11,fontWeight:700,
                    background:'rgba(245,158,11,0.12)',color:T.gold,
                    padding:'4px 10px',borderRadius:20,
                    border:`1px solid rgba(245,158,11,0.25)`}}>✓ {f}</span>
                ))}
              </div>
              <motion.button onClick={onClose}
                whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                style={{padding:'12px 36px',borderRadius:14,background:T.gradientGold,
                  color:'white',fontSize:14,fontWeight:900,border:'none',
                  cursor:'pointer',fontFamily:'Arial',
                  boxShadow:`0 4px 16px rgba(245,158,11,0.3)`}}>
                Kembali ke Dashboard
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
