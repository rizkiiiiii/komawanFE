import { motion, AnimatePresence } from 'framer-motion'
import { T } from '../../theme'
import { getFileInfo, formatName } from '../../utils'

export default function PreviewModal({ file, url, onClose }) {
  const { isImage, icon } = getFileInfo(file.name)
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',
          backdropFilter:'blur(14px)',display:'flex',alignItems:'center',
          justifyContent:'center',zIndex:1000}} onClick={onClose}>
        <motion.div
          initial={{opacity:0,scale:0.8,y:40}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.8,y:40}}
          transition={{type:'spring',stiffness:300,damping:25}}
          onClick={e => e.stopPropagation()}
          style={{background:T.bgCardSolid,backdropFilter:'blur(24px)',
            border:`1px solid ${T.border}`,borderRadius:24,padding:28,
            maxWidth:'86vw',maxHeight:'86vh',overflow:'auto',
            boxShadow:`0 32px 80px rgba(0,0,0,0.15)`}}>
          <div style={{display:'flex',justifyContent:'space-between',
            alignItems:'center',marginBottom:18}}>
            <h3 style={{margin:0,fontSize:15,color:T.text,fontWeight:700}}>
              {formatName(file.name)}
            </h3>
            <motion.button whileHover={{scale:1.1,background:T.redBg}}
              whileTap={{scale:0.9}} onClick={onClose}
              style={{background:T.bgCard,color:T.text,padding:'8px 14px',
                borderRadius:10,border:`1px solid ${T.border}`,
                cursor:'pointer',fontSize:13,fontWeight:'bold',
                transition:'background 0.2s'}}>✕ Tutup</motion.button>
          </div>
          {isImage
            ? <motion.img initial={{opacity:0}} animate={{opacity:1}} src={url}
                alt={file.name}
                style={{maxWidth:'100%',maxHeight:'65vh',borderRadius:14,
                  objectFit:'contain',display:'block',margin:'0 auto',
                  boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}/>
            : <div style={{textAlign:'center',padding:'40px 60px'}}>
                <motion.div animate={{scale:[1,1.1,1],rotate:[0,5,-5,0]}}
                  transition={{duration:2,repeat:Infinity}}
                  style={{fontSize:80}}>{icon}</motion.div>
                <p style={{color:T.textMuted,fontSize:14,marginTop:16}}>
                  Preview tidak tersedia
                </p>
              </div>
          }
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}