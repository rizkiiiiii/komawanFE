import { motion } from 'framer-motion'
import { T } from '../../theme'

export default function StatCard({ icon, label, value, gradient, delay, sub }) {
  return (
    <motion.div
      initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
      transition={{delay,type:'spring'}}
      whileHover={{y:-5,boxShadow:'0 20px 48px rgba(0,0,0,0.5)'}}
      style={{background:T.bgCard,backdropFilter:'blur(20px)',
        border:`1px solid ${T.border}`,borderRadius:18,
        padding:'16px 18px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,
        background:gradient,borderRadius:'50%',filter:'blur(35px)',opacity:0.3}}/>
      <div style={{display:'flex',alignItems:'center',gap:12,position:'relative'}}>
        <motion.div whileHover={{rotate:15,scale:1.1}}
          style={{width:42,height:42,borderRadius:13,background:gradient,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:18,boxShadow:'0 4px 16px rgba(0,0,0,0.4)',flexShrink:0}}>
          {icon}
        </motion.div>
        <div>
          <p style={{margin:0,fontSize:10,color:T.textMuted,fontWeight:600,
            textTransform:'uppercase',letterSpacing:0.5}}>{label}</p>
          <p style={{margin:'2px 0 0',fontSize:19,fontWeight:900,color:T.text}}>{value}</p>
          {sub && <p style={{margin:'1px 0 0',fontSize:10,color:T.textMuted}}>{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}