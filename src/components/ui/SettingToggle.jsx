import { motion } from 'framer-motion'
import { T } from '../../theme'

export default function SettingToggle({ label, sub, value, onChange }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
      padding:'10px 12px',background:T.bgCard,borderRadius:10,
      marginBottom:6,border:`1px solid ${T.border}`}}>
      <div>
        <p style={{margin:0,fontSize:12,color:T.text,fontWeight:600}}>{label}</p>
        <p style={{margin:'2px 0 0',fontSize:10,color:T.textMuted}}>{sub}</p>
      </div>
      <motion.div whileTap={{scale:0.9}} onClick={() => onChange(!value)}
        style={{width:40,height:22,borderRadius:11,cursor:'pointer',
          background:value?T.primary:'rgba(255,255,255,0.1)',
          display:'flex',alignItems:'center',padding:'0 3px',
          transition:'background 0.2s',flexShrink:0}}>
        <motion.div animate={{x:value?18:0}}
          transition={{type:'spring',stiffness:500,damping:30}}
          style={{width:16,height:16,borderRadius:'50%',background:'white',
            boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
      </motion.div>
    </div>
  )
}
