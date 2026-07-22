import { useState } from 'react'
import { motion } from 'framer-motion'
import { T } from '../../theme'
import { formatName } from '../../utils'

// Karakter yang bisa merusak path storage (terutama '/') atau tidak valid di kebanyakan filesystem
const UNSAFE_CHARS = new RegExp('[\\\\/:*?"<>|]', 'g')

export default function RenameModal({ fileName, onRename, onClose }) {
  const ext = fileName.includes('.') ? fileName.split('.').pop() : ''
  const [newName, setNewName] = useState(
    formatName(fileName).replace(/\.[^.]+$/,'')
  )
  const [error, setError] = useState('')

  const handleConfirm = () => {
    const cleaned = newName.replace(UNSAFE_CHARS, '').trim()
    if (!cleaned) {
      setError('Nama file tidak boleh kosong atau hanya berisi karakter tidak valid (/ \\ : * ? " < > |)')
      return
    }
    if (cleaned.length > 200) {
      setError('Nama file maksimal 200 karakter')
      return
    }
    onRename(ext ? `${cleaned}.${ext}` : cleaned)
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(10px)',display:'flex',alignItems:'center',
        justifyContent:'center',zIndex:1000}}>
      <motion.div
        initial={{opacity:0,scale:0.8,y:40}} animate={{opacity:1,scale:1,y:0}}
        transition={{type:'spring',stiffness:300,damping:25}}
        style={{background:T.bgCardSolid,backdropFilter:'blur(24px)',
          border:`1px solid ${T.border}`,borderRadius:24,padding:32,width:380,
          boxShadow:`0 32px 80px rgba(0,0,0,0.15)`}}>
        <h3 style={{margin:'0 0 20px',fontSize:18,color:T.text,fontWeight:800}}>
          ✏️ Rename File
        </h3>
        <div style={{background:T.bgCard,borderRadius:12,padding:'10px 14px',
          marginBottom:16,fontSize:13,color:T.textMuted,border:`1px solid ${T.border}`}}>
          Nama lama: <strong style={{color:T.text}}>{formatName(fileName)}</strong>
        </div>
        <input value={newName}
          onChange={e => { setNewName(e.target.value); setError('') }}
          onKeyDown={e => e.key==='Enter' && handleConfirm()}
          style={{width:'100%',padding:'13px 16px',borderRadius:14,
            border:`1.5px solid ${error?T.red:T.primary}`,fontSize:14,boxSizing:'border-box',
            outline:'none',background:'rgba(22,35,63,0.04)',
            color:T.text,marginBottom:8}}
          autoFocus/>
        {error && (
          <p style={{fontSize:11,color:T.red,margin:'0 0 12px',lineHeight:1.5}}>
            ⚠️ {error}
          </p>
        )}
        {ext && (
          <p style={{fontSize:12,color:T.textMuted,margin:'0 0 20px'}}>
            Ekstensi: .{ext}
          </p>
        )}
        <div style={{display:'flex',gap:10}}>
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            onClick={onClose}
            style={{flex:1,padding:13,borderRadius:14,background:T.bgCard,
              color:T.text,fontSize:14,border:`1px solid ${T.border}`,
              cursor:'pointer',fontWeight:'bold',fontFamily:'Arial'}}>
            Batal
          </motion.button>
          <motion.button
            whileHover={{scale:1.02,boxShadow:`0 8px 24px ${T.primaryGlow}`}}
            whileTap={{scale:0.98}} onClick={handleConfirm}
            style={{flex:1,padding:13,borderRadius:14,background:T.gradient,
              color:'white',fontSize:14,fontWeight:'bold',border:'none',
              cursor:'pointer',fontFamily:'Arial',
              boxShadow:`0 4px 16px ${T.primaryGlow}`}}>
            ✅ Rename
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
