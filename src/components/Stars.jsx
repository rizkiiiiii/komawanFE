import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Stars() {
  const stars = useRef(
    [...Array(70)].map(() => ({
      left:`${Math.random()*100}%`,
      top:`${Math.random()*100}%`,
      size:Math.random()<0.15?3:1.5,
      dur:1.5+Math.random()*3,
      delay:Math.random()*5
    }))
  ).current
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
      {stars.map((s,i) => (
        <motion.div key={i}
          animate={{opacity:[0,0.9,0],scale:[0.5,1,0.5]}}
          transition={{duration:s.dur,repeat:Infinity,delay:s.delay,ease:'easeInOut'}}
          style={{position:'absolute',width:s.size,height:s.size,
            borderRadius:'50%',background:'white',left:s.left,top:s.top}}/>
      ))}
    </div>
  )
}