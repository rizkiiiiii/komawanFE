import { motion, AnimatePresence } from 'framer-motion'
import { T } from '../theme'

export default function Toast({ message, type }) {
  const color = type==='error'?T.red:type==='info'?T.blue:T.green
  const bg    = type==='error'?T.redBg:type==='info'?T.blueBg:T.greenBg
  const icon  = type==='error'?'❌':type==='info'?'ℹ️':'✅'
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{opacity:0,y:-80,scale:0.8}}
          animate={{opacity:1,y:0,scale:1}}
          exit={{opacity:0,y:-80,scale:0.8}}
          transition={{type:'spring',stiffness:400,damping:20}}
          style={{position:'fixed',top:24,right:24,zIndex:9999,
            padding:'14px 20px',borderRadius:16,
            display:'flex',alignItems:'center',gap:10,
            background:bg,border:`1px solid ${color}44`,
            backdropFilter:'blur(20px)',
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
            color,fontSize:13,fontWeight:'bold',maxWidth:340}}>
          <motion.span animate={{rotate:[0,15,-15,0]}} transition={{duration:0.5}}>
            {icon}
          </motion.span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}