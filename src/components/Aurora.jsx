import { motion } from 'framer-motion'

export default function Aurora() {
  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0,background:'#FAFAFA'}}>
      {[
        {c:'rgba(24,24,27,0.03)',s:700,x:'5%',y:'5%',d:12},
        {c:'rgba(228,228,231,0.08)',s:500,x:'55%',y:'15%',d:15},
        {c:'rgba(212,212,216,0.05)',s:450,x:'25%',y:'55%',d:18},
        {c:'rgba(24,24,27,0.02)',s:400,x:'70%',y:'65%',d:14},
      ].map((a,i) => (
        <motion.div key={i}
          animate={{x:[0,15,-10,0],y:[0,-15,10,0],scale:[1,1.05,0.98,1]}}
          transition={{duration:a.d,repeat:Infinity,ease:'linear',delay:i*2}}
          style={{position:'absolute',width:a.s,height:a.s,borderRadius:'50%',
            background:a.c,filter:'blur(100px)',left:a.x,top:a.y}}/>
      ))}
      <div style={{position:'absolute',inset:0,
        backgroundImage:'radial-gradient(rgba(24,24,27,0.04) 1px,transparent 1px)',
        backgroundSize:'32px 32px'}}/>
    </div>
  )
}