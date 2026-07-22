import { ChevronRight, Home } from 'lucide-react'
import { T } from '../theme'

export default function Breadcrumbs({ currentFolder, onNavigate }) {
  // Split the folder path if it's nested (currently flat, but good for future-proofing)
  const paths = currentFolder === 'root' ? [] : currentFolder.split('/')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: T.textSub, marginBottom: 16 }}>
      <div 
        onClick={() => onNavigate('root')}
        style={{ 
          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          color: currentFolder === 'root' ? T.text : T.textMuted,
          fontWeight: currentFolder === 'root' ? 600 : 500,
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = T.text}
        onMouseLeave={e => e.currentTarget.style.color = currentFolder === 'root' ? T.text : T.textMuted}
      >
        <Home size={16} />
        <span>Home</span>
      </div>

      {paths.map((path, index) => {
        const isLast = index === paths.length - 1
        return (
          <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronRight size={14} color={T.textMuted} />
            <span 
              style={{ 
                color: isLast ? T.text : T.textMuted,
                fontWeight: isLast ? 600 : 500,
                cursor: isLast ? 'default' : 'pointer'
              }}
            >
              {path}
            </span>
          </div>
        )
      })}
    </div>
  )
}
