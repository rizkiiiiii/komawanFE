import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { T } from '../theme'
import { getFileInfo, formatSize, formatName } from '../utils'
import { MoreVertical } from 'lucide-react'

export default function FileCard({
  f, index, viewMode,
  onContextMenu,
  selected, onSelect,
  autoPreview, onFetchPreviewUrl
}) {
  const { icon, color, bg, isImage } = getFileInfo(f.name)
  const [hoverUrl, setHoverUrl] = useState(null)
  const [hoverLoading, setHoverLoading] = useState(false)
  const hoverTimer = useRef(null)

  function handleMouseEnter() {
    if (!autoPreview || !isImage || !onFetchPreviewUrl) return
    hoverTimer.current = setTimeout(async () => {
      setHoverLoading(true)
      try {
        const url = await onFetchPreviewUrl(f)
        setHoverUrl(url)
      } catch { /* silent */ } finally { setHoverLoading(false) }
    }, 200)
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimer.current)
    setHoverUrl(null)
    setHoverLoading(false)
  }

  const handleContextMenu = (e) => { e.preventDefault(); onContextMenu(e, f) }

  const hoverThumb = (positionStyle) => (
    <AnimatePresence>
      {(hoverLoading || hoverUrl) && (
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}
          style={{ position: 'absolute', zIndex: 50, pointerEvents: 'none', width: 160, height: 160, borderRadius: 16, overflow: 'hidden', background: T.bgCardSolid, border: `1px solid ${T.borderStrong}`, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...positionStyle }}>
          {hoverUrl
            ? <img src={hoverUrl} alt={formatName(f.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 11, color: T.textMuted }}>Memuat…</span>}
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (viewMode === 'grid') return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03, duration: 0.25, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -6, boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${selected ? T.accent : T.borderStrong}` }}
      onClick={() => onSelect(f.name)}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: 18, border: `1px solid ${selected ? T.accent : T.border}`,
        padding: 16, cursor: 'pointer',
        background: selected ? `${T.accent}12` : T.bgCard,
        textAlign: 'center', position: 'relative',
        boxShadow: selected ? `0 0 0 1px ${T.accent}44, 0 8px 24px rgba(79,70,229,0.1)` : '0 4px 16px rgba(0,0,0,0.03)',
        transition: 'border-color 0.2s, background 0.2s',
      }}>
      {hoverThumb({ bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' })}
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
          style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, background: T.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', boxShadow: `0 2px 8px ${T.accentGlow}` }}>✓</motion.div>
      )}
      <motion.button onClick={(e) => { e.stopPropagation(); handleContextMenu(e) }} whileHover={{ scale: 1.1, color: T.text }}
        style={{ position: 'absolute', top: 10, left: 10, background: 'transparent', border: 'none', color: T.textMuted, cursor: 'pointer', padding: 4, borderRadius: 6, zIndex: 10 }}>
        <MoreVertical size={16} />
      </motion.button>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, margin: '0 auto 12px', border: `1px solid ${color}33`, boxShadow: `0 4px 16px ${bg}` }}>
        {icon}
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {formatName(f.name)}
      </p>
      <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>
        {formatSize(f.metadata?.size)}
      </p>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      whileHover={{ x: 2, background: T.bgCardHover, borderColor: T.borderStrong }}
      onClick={() => onSelect(f.name)}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', border: `1px solid ${selected ? T.accent : T.border}`,
        borderRadius: 14, cursor: 'pointer',
        background: selected ? `${T.accent}12` : T.bgCard,
        position: 'relative',
        transition: 'all 0.15s',
      }}>
      {hoverThumb({ bottom: 'calc(100% + 10px)', left: 0 })}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0, border: `1px solid ${color}33`, boxShadow: `0 2px 8px ${bg}` }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {formatName(f.name)}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: T.textMuted }}>
            {formatSize(f.metadata?.size)}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 20, height: 20, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', flexShrink: 0, boxShadow: `0 2px 8px ${T.accentGlow}` }}>✓</motion.div>
        )}
        <motion.button onClick={(e) => { e.stopPropagation(); handleContextMenu(e) }} whileHover={{ scale: 1.1, color: T.text }}
          style={{ background: 'transparent', border: 'none', color: T.textMuted, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
          <MoreVertical size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}
