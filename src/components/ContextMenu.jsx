import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { T } from '../theme'
import { Download, Edit2, Share2, Trash2, Eye } from 'lucide-react'

export default function ContextMenu({ x, y, file, onClose, actions }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('contextmenu', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
    }
  }, [onClose])

  const menuStyle = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 260),
    left: Math.min(x, window.innerWidth - 210),
    zIndex: 9999,
  }

  const handleAction = (e, actionFn) => {
    e.stopPropagation()
    actionFn(file)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.93, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...menuStyle,
          width: 210,
          background: T.bgCard,
          border: `1px solid ${T.borderStrong}`,
          borderRadius: 16,
          padding: 8,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {file.name}
          </p>
        </div>

        <ContextMenuItem icon={<Eye size={14} />} label="Preview" onClick={(e) => handleAction(e, actions.onPreview)} />
        <ContextMenuItem icon={<Download size={14} />} label="Download" onClick={(e) => handleAction(e, actions.onDownload)} />
        <ContextMenuItem icon={<Share2 size={14} />} label="Share Link" onClick={(e) => handleAction(e, actions.onShare)} />
        <ContextMenuItem icon={<Edit2 size={14} />} label="Rename" onClick={(e) => handleAction(e, actions.onRename)} />
        <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
        <ContextMenuItem icon={<Trash2 size={14} />} label="Hapus" onClick={(e) => handleAction(e, actions.onDelete)} danger />
      </motion.div>
    </AnimatePresence>
  )
}

function ContextMenuItem({ icon, label, onClick, danger }) {
  const hoverBg = danger ? T.redBg : T.bgCardHover

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px',
        background: 'transparent', border: 'none', color: danger ? T.red : T.text,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 10, textAlign: 'left',
        transition: 'background 0.2s', fontFamily: 'inherit'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
