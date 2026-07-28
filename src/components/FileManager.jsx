import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { T, FREE_STORAGE, FREE_MAX_FILE, PRO_STORAGE, PRO_MAX_FILE } from '../theme'
import { formatSize, formatName, getInitials, copyToClipboard } from '../utils'
import useIsMobile from '../hooks/useIsMobile'
import Toast from './Toast'
import FileCard from './FileCard'
import ProfileMenu from './ProfileMenu'
import PreviewModal from './modals/PreviewModal'
import RenameModal from './modals/RenameModal'
import UpgradeModal from './modals/UpgradeModal'
import ConfirmModal from './modals/ConfirmModal'
import ContextMenu from './ContextMenu'
import api from '../api'
import { Database, HardDrive, Search, FolderPlus, UploadCloud, Grid3X3, List, RefreshCw, Trash2, X, LogOut } from 'lucide-react'

function CloudBg({ top, left, bottom, right, opacity = 0.4, delay = 0, scale = 1 }) {
  return (
    <motion.div
      style={{ position: 'absolute', top, left, bottom, right, zIndex: 0, opacity, color: '#E2E8F0', pointerEvents: 'none', transform: `scale(${scale})` }}
      animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}>
      <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.154.008-.306.023-.456C11.535 15.112 9.878 16 8 16c-2.761 0-5-2.239-5-5s2.239-5 5-5c.484 0 .95.069 1.385.195C10.364 4.316 12.029 3 14 3c3.314 0 6 2.686 6 6 0 .152-.006.301-.016.448C21.71 9.93 23 11.317 23 13c0 2.209-1.791 4-4 4h-1.5z"/></svg>
    </motion.div>
  )
}

export default function FileManager({ user, onOpenAdmin }) {
  const isMobile = useIsMobile()
  const [files, setFiles]             = useState([])
  const [uploading, setUploading]     = useState(false)
  const [uploadProgress, setProgress] = useState(0)
  const [toast, setToast]             = useState({ msg: '', type: 'success' })
  const [currentFolder, setFolder]    = useState('root')
  const [folders, setFolders]         = useState([])
  const [newFolderName, setNewFolder] = useState('')
  const [showNewFolder, setShowNew]   = useState(false)
  const [search, setSearch]           = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [previewUrl, setPreviewUrl]   = useState('')
  const [renameFile, setRenameFile]   = useState(null)
  const [dragOver, setDragOver]       = useState(false)
  const [viewMode, setViewMode]       = useState('grid')
  const [selected, setSelected]       = useState([])
  const [sortBy, setSortBy]           = useState('date')
  const [showProfile, setShowProfile] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isPro, setIsPro]             = useState(false)
  const [trashFilesCount, setTrashFilesCount] = useState(0)
  const [confirmState, setConfirmState] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [isDragging, setIsDragging]   = useState(false)
  const [settings, setSettingsState]  = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cfm_settings') || '{}')
      return {
        notifyUpload:  saved.notifyUpload  ?? true,
        autoRefresh:   saved.autoRefresh   ?? false,
        confirmDelete: saved.confirmDelete ?? true,
        autoPreview:   saved.autoPreview   ?? false,
      }
    } catch {
      return { notifyUpload: true, autoRefresh: false, confirmDelete: true, autoPreview: false }
    }
  })
  const profileRef = useRef()

  function updateSetting(key, value) {
    setSettingsState(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('cfm_settings', JSON.stringify(next))
      return next
    })
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }

  function askConfirm(message, onConfirm) { setConfirmState({ message, onConfirm }) }
  function askConfirmDelete(message, onConfirm) {
    if (!settings.confirmDelete) { onConfirm(); return }
    setConfirmState({ message, onConfirm })
  }

  function handleContextMenu(e, file) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, file })
  }

  function basePath() {
    return currentFolder === 'root' ? user.id : `${user.id}/${currentFolder}`
  }

  useEffect(() => { loadFiles() },   [currentFolder, sortBy])
  useEffect(() => { loadFolders() }, [])
  useEffect(() => { loadProfile() }, [])
  useEffect(() => {
    if (!settings.autoRefresh) return
    const iv = setInterval(() => { loadFiles(); loadFolders() }, 8000)
    return () => clearInterval(iv)
  }, [settings.autoRefresh, currentFolder, sortBy])
  useEffect(() => {
    const h = e => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function loadTrashCount() {
    try {
      const res = await api.get('/files/trash')
      setTrashFilesCount(res.data.data?.length || 0)
    } catch (e) { console.warn(e) }
  }

  async function loadFiles() {
    try {
      const url = currentFolder === 'trash' ? '/files/trash' : '/files'
      const res = await api.get(url, { params: { folder_id: currentFolder } })
      if (res.data && res.data.data) {
        const mapped = res.data.data.map(f => ({
          id: f.id,
          name: f.filename,
          original_name: f.original_name,
          size: f.size,
          metadata: { size: f.size },
          created_at: f.deleted_at || f.created_at,
          is_trashed: currentFolder === 'trash',
          storage_path: f.storage_path
        }))
        setFiles(mapped)
        if (currentFolder === 'trash') {
          setTrashFilesCount(mapped.length)
        } else {
          loadTrashCount()
        }
      }
    } catch (e) { showToast('Gagal memuat file', 'error') }
  }

  async function loadFolders() {
    try {
      const { data, error } = await supabase.storage.from('files').list(user.id)
      if (error) throw error
      setFolders(data.filter(f => !f.metadata).map(f => f.name))
    } catch (e) { showToast('Gagal memuat folder: ' + e.message, 'error') }
  }

  async function loadProfile() {
    try {
      const { data, error } = await supabase.from('profiles')
        .select('is_pro').eq('id', user.id).maybeSingle()
      if (error) throw error
      if (data) {
        setIsPro(data.is_pro)
      } else {
        await supabase.from('profiles').upsert({ id: user.id, is_pro: false })
        setIsPro(false)
      }
    } catch (e) { console.warn('Gagal memuat profil:', e.message) }
  }

  async function persistUpgrade() {
    try {
      const { data, error } = await supabase.from('profiles')
        .upsert({ id: user.id, is_pro: true, updated_at: new Date().toISOString() }).select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('RLS policy mungkin memblokir operasi ini')
      setIsPro(true)
      showToast('Pro Plan aktif! ⚡', 'success')
    } catch (e) { showToast('Gagal upgrade: ' + e.message, 'error') }
  }

  function persistDowngrade() {
    askConfirm('Turunkan ke Free Plan? Fitur Pro akan hilang.', async () => {
      try {
        const { data, error } = await supabase.from('profiles')
          .upsert({ id: user.id, is_pro: false, updated_at: new Date().toISOString() }).select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('RLS policy mungkin memblokir operasi ini')
        setIsPro(false)
        showToast('Kembali ke Free Plan', 'info')
      } catch (e) { showToast('Gagal downgrade: ' + e.message, 'error') }
    })
  }

  async function uploadFile(file) {
    if (!file) return
    const maxFile = isPro ? PRO_MAX_FILE : FREE_MAX_FILE
    if (file.size > maxFile) {
      showToast(`Maks ${formatSize(maxFile)} per file (${isPro ? 'Pro' : 'Free'} Plan)`, 'error'); return
    }
    setUploading(true); setProgress(0)
    const iv = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 150)
    try {
      const actualFilename = `${Date.now()}_${file.name}`
      const storagePath = `${basePath()}/${actualFilename}`
      const { error } = await supabase.storage.from('files').upload(storagePath, file)
      if (error) throw error
      try {
        await api.post('/files/sync', { filename: actualFilename, original_name: file.name, size: file.size, storage_path: storagePath, folder_id: currentFolder })
        if (settings.notifyUpload) showToast('File berhasil diupload! 🎉')
      } catch (syncErr) { 
        console.warn('Backend sync gagal:', syncErr) 
        showToast('Sync gagal: ' + (syncErr.response?.data?.message || syncErr.message), 'error')
      }
      loadFiles()
    } catch (e) { showToast('Upload gagal: ' + e.message, 'error') }
    finally { clearInterval(iv); setProgress(100); setTimeout(() => { setUploading(false); setProgress(0) }, 600) }
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim().replace(/[^\w\s-]/g, '')
    if (!name) { showToast('Nama folder tidak valid!', 'error'); return }
    try {
      const { error } = await supabase.storage.from('files')
        .upload(`${user.id}/${name}/.emptyFolderPlaceholder`, new Blob(['']), { upsert: false })
      if (error) throw error
      setNewFolder(''); setShowNew(false)
      showToast(`Folder "${name}" dibuat! 📁`); loadFolders()
    } catch (e) { showToast('Gagal buat folder: ' + e.message, 'error') }
  }

  function handleDeleteFolder(folderName) {
    askConfirmDelete(`Hapus folder "${folderName}" beserta isinya?`, async () => {
      try {
        const fp = `${user.id}/${folderName}`
        const { data: contents } = await supabase.storage.from('files').list(fp)
        if (contents?.length) {
          const paths = contents.map(f => `${fp}/${f.name}`)
          const { data, error } = await supabase.storage.from('files').remove(paths)
          if (error) throw error
          if (data && data.length === 0) throw new Error("Akses ditolak oleh Policy Supabase (RLS). Cek SQL Dashboard.")
          try { await api.post('/files/sync-delete', { paths }) } catch (e) { console.warn(e) }
        }
        await supabase.storage.from('files').remove([`${fp}/.emptyFolderPlaceholder`])
        if (currentFolder === folderName) setFolder('root')
        showToast(`Folder "${folderName}" dihapus!`); loadFolders()
      } catch (e) { showToast('Gagal hapus folder: ' + e.message, 'error') }
    })
  }

  async function handleDownload(fileName) {
    try {
      const fileObj = files.find(f => f.name === fileName)
      const path = fileObj?.storage_path || `${basePath()}/${fileName}`
      const { data, error } = await supabase.storage.from('files').download(path)
      if (error) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement('a'); a.href = url; a.download = formatName(fileName); a.click()
      URL.revokeObjectURL(url)
      showToast('File diunduh! ⬇️', 'info')
    } catch (e) { showToast('Gagal unduh: ' + e.message, 'error') }
  }

  function handleDelete(fileName) {
    const fileObj = files.find(f => f.name === fileName)
    if (!fileObj) return

    const isTrashed = currentFolder === 'trash'
    const confirmMsg = isTrashed
      ? `Hapus "${formatName(fileName)}" secara PERMANEN? File tidak akan bisa dipulihkan.`
      : `Pindahkan "${formatName(fileName)}" ke Tong Sampah?`

    askConfirmDelete(confirmMsg, async () => {
      try {
        if (isTrashed) {
          // Permanent delete from Supabase storage
          const path = fileObj.storage_path || `${basePath()}/${fileName}`
          const { error } = await supabase.storage.from('files').remove([path])
          if (error) throw error
          // Permanent delete from Laravel database
          await api.delete(`/files/${fileObj.id}/force`)
          showToast('File terhapus permanen! 🗑️', 'info')
        } else {
          // Soft delete from database (Supabase storage kept intact for recovery)
          await api.delete(`/files/${fileObj.id}`)
          showToast('File dipindahkan ke Tong Sampah 🗑️', 'success')
        }
        setSelected(s => s.filter(f => f !== fileName))
        loadFiles()
      } catch (e) { showToast('Gagal menghapus: ' + e.message, 'error') }
    })
  }

  function handleDeleteSelected() {
    const isTrashed = currentFolder === 'trash'
    const confirmMsg = isTrashed
      ? `Hapus permanen ${selected.length} file yang dipilih?`
      : `Pindahkan ${selected.length} file ke Tong Sampah?`

    askConfirmDelete(confirmMsg, async () => {
      try {
        const fileObjs = files.filter(f => selected.includes(f.name))
        
        if (isTrashed) {
          const paths = fileObjs.map(f => f.storage_path)
          const { error } = await supabase.storage.from('files').remove(paths)
          if (error) throw error
          await Promise.all(fileObjs.map(f => api.delete(`/files/${f.id}/force`)))
          showToast(`${selected.length} file terhapus permanen! 🗑️`, 'info')
        } else {
          await Promise.all(fileObjs.map(f => api.delete(`/files/${f.id}`)))
          showToast(`${selected.length} file dipindahkan ke Tong Sampah 🗑️`, 'success')
        }
        setSelected([]); loadFiles()
      } catch (e) { showToast('Gagal menghapus: ' + e.message, 'error') }
    })
  }

  async function handleRestore(fileName) {
    const fileObj = files.find(f => f.name === fileName)
    if (!fileObj) return
    try {
      await api.put(`/files/${fileObj.id}/restore`)
      showToast('File berhasil dipulihkan! ↺', 'success')
      setSelected(s => s.filter(f => f !== fileName))
      loadFiles()
    } catch (e) { showToast('Gagal memulihkan file: ' + e.message, 'error') }
  }

  function handleEmptyTrash() {
    if (files.length === 0) return
    askConfirmDelete('Kosongkan semua file di Tong Sampah? Tindakan ini permanen!', async () => {
      try {
        // Remove all files from Supabase storage first
        const paths = files.filter(f => f.storage_path).map(f => f.storage_path)
        if (paths.length > 0) {
          const { error } = await supabase.storage.from('files').remove(paths)
          if (error) throw error
        }
        await api.delete('/files/trash/empty')
        showToast('Tong sampah berhasil dikosongkan! 🧹', 'success')
        setSelected([])
        loadFiles()
      } catch (e) { showToast('Gagal mengosongkan sampah: ' + e.message, 'error') }
    })
  }

  async function handleShare(fileName) {
    try {
      const fileObj = files.find(f => f.name === fileName)
      const path = fileObj?.storage_path || `${basePath()}/${fileName}`
      const { data } = supabase.storage.from('files').getPublicUrl(path)
      await copyToClipboard(data.publicUrl)
      showToast('Link disalin! 🔗', 'info')
    } catch (e) { showToast('Gagal share: ' + e.message, 'error') }
  }

  async function getPreviewUrl(file) {
    const path = file.storage_path || `${basePath()}/${file.name}`
    const { data } = supabase.storage.from('files').getPublicUrl(path)
    return data.publicUrl
  }

  async function handlePreview(file) {
    try {
      const url = await getPreviewUrl(file)
      setPreviewUrl(url); setPreviewFile(file)
    } catch (e) { showToast('Gagal preview: ' + e.message, 'error') }
  }

  async function handleRename(file, newName) {
    try {
      const oldPath = file.storage_path || `${basePath()}/${file.name}`
      const newPath = `${basePath()}/${Date.now()}_${newName}`
      const { error } = await supabase.storage.from('files').move(oldPath, newPath)
      if (error) throw error
      await api.put(`/files/${file.id}`, { name: newName, storage_path: newPath })
      showToast('Berhasil di-rename! ✏️'); setRenameFile(null); loadFiles()
    } catch (e) { showToast('Gagal rename: ' + e.message, 'error') }
}

  const handleDropZone = e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) uploadFile(e.dataTransfer.files[0]) }
  const currentStorage = isPro ? PRO_STORAGE : FREE_STORAGE
  const filtered  = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  const totalSize = files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
  const usedPct   = Math.min((totalSize / currentStorage) * 100, 100)
  const init      = getInitials(user.email)
  const isNearLimit = usedPct > 80

  return (
    <div
      style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif", color: T.text, position: 'relative', overflowX: 'hidden' }}
      onDragEnter={e => { e.preventDefault(); setIsDragging(true) }}
      onDragOver={e => e.preventDefault()}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false) }}
      onDrop={async e => {
        e.preventDefault(); setIsDragging(false)
        for (const f of Array.from(e.dataTransfer.files)) await uploadFile(f)
      }}
    >
      {/* Background clouds */}
      <CloudBg top="5%" left="-5%" delay={0} />
      <CloudBg bottom="10%" right="-5%" delay={2} />

      {/* ===== NAVBAR ===== */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${T.border}`, padding: isMobile ? '12px 16px' : '12px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: T.gradient, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px rgba(99, 102, 241, 0.2)` }}>
            <span style={{ color: '#fff', fontSize: 18 }}>☁</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: T.text }}>CloudFile</div>
            {!isMobile && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>Sistem Manajemen File</div>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 14px', borderRadius: 100, border: `1px solid ${T.border}` }}>
              <Database size={13} color={isNearLimit ? T.red : T.accent} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isNearLimit ? T.red : T.text }}>
                {formatSize(totalSize)} <span style={{ color: T.textMuted, fontWeight: 400 }}>/ {formatSize(currentStorage)}</span>
              </span>
            </div>
          )}

          <AnimatePresence>
            {selected.length > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }} onClick={handleDeleteSelected}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.redBg, color: T.red, border: `1px solid ${T.red}44`, borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Trash2 size={14} /> Hapus ({selected.length})
              </motion.button>
            )}
            {currentFolder === 'trash' && selected.length === 0 && files.length > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }} onClick={handleEmptyTrash}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.redBg, color: T.red, border: `1px solid ${T.red}44`, borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Trash2 size={14} /> Kosongkan Sampah
              </motion.button>
            )}
          </AnimatePresence>

          <div ref={profileRef} style={{ position: 'relative' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 12px rgba(99, 102, 241, 0.2)` }}>
              {init}
            </motion.div>
            <AnimatePresence>
              {showProfile && (
                <ProfileMenu user={user} totalFiles={files.length} totalSize={totalSize} totalFolders={folders.length}
                  isPro={isPro}
                  onUpgrade={() => { setShowProfile(false); setShowUpgrade(true) }}
                  onDowngrade={persistDowngrade}
                  settings={settings} onSettingChange={updateSetting} onOpenAdmin={onOpenAdmin} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      <div style={{ display: 'flex', gap: 0, maxWidth: 1440, margin: '0 auto' }}>

        {!isMobile && (
          <motion.aside initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}
            style={{ width: 260, flexShrink: 0, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20, borderRight: `1px solid ${T.border}`, minHeight: 'calc(100vh - 64px)', position: 'sticky', top: 64, alignSelf: 'flex-start' }}>

            <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <HardDrive size={16} color={T.accent} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.textSub }}>Storage</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: isPro ? '#EAB308' : T.textMuted, background: isPro ? '#FEFCE8' : '#F3F4F6', padding: '2px 8px', borderRadius: 100, border: `1px solid ${isPro ? '#EAB308' : T.border}` }}>
                  {isPro ? '⚡ Pro' : 'Free'}
                </span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: '-0.03em' }}>{formatSize(totalSize)}</p>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: T.textMuted }}>dari {formatSize(currentStorage)}</p>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${usedPct}%` }} transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 3, background: isNearLimit ? T.red : T.gradient }} />
              </div>
              {isNearLimit && !isPro && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowUpgrade(true)}
                  style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 12, background: T.gradient, color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ⚡ Upgrade ke Pro
                </motion.button>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.textSub }}>Folder</span>
                <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowNew(!showNewFolder)}
                  style={{ width: 28, height: 28, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.textSub }}>
                  <FolderPlus size={14} />
                </motion.button>
              </div>

              <AnimatePresence>
                {showNewFolder && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={newFolderName} onChange={e => setNewFolder(e.target.value)}
                        placeholder='Nama folder...' onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        autoFocus
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${T.accent}`, fontSize: 13, outline: 'none', background: '#fff', color: T.text, fontFamily: 'inherit' }} />
                      <motion.button whileTap={{ scale: 0.95 }} onClick={handleCreateFolder}
                        style={{ padding: '8px 12px', borderRadius: 10, background: T.gradient, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                        +
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[{ id: 'root', label: '🏠 Semua File', count: currentFolder === 'root' ? files.length : undefined }, ...folders.map(f => ({ id: f, label: `📁 ${f}` })), { id: 'trash', label: '🗑️ Tong Sampah', count: trashFilesCount }].map(item => (
                  <motion.div key={item.id} whileHover={{ x: 4 }}
                    style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', borderRadius: 12, cursor: 'pointer', background: currentFolder === item.id ? `${T.accent}12` : 'transparent', color: currentFolder === item.id ? T.accent : (item.id === 'trash' ? T.red : T.textSub), fontWeight: currentFolder === item.id ? 700 : 500, fontSize: 14, transition: 'all 0.15s', border: currentFolder === item.id ? `1px solid ${T.accent}44` : '1px solid transparent' }}
                    onClick={() => setFolder(item.id)}>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.count !== undefined && (
                      <span style={{ fontSize: 11, color: currentFolder === item.id ? T.accent : T.textMuted, background: currentFolder === item.id ? `${T.accent}12` : '#F3F4F6', padding: '2px 7px', borderRadius: 100 }}>{item.count}</span>
                    )}
                    {item.id !== 'root' && item.id !== 'trash' && (
                      <motion.button whileHover={{ color: T.red }} onClick={e => { e.stopPropagation(); handleDeleteFolder(item.id) }}
                        style={{ marginLeft: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                        <X size={12} />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}

        <main style={{ flex: 1, padding: isMobile ? '20px 16px' : '28px 32px', minWidth: 0, position: 'relative', zIndex: 1 }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDropZone}
            style={{
              border: `2px dashed ${dragOver ? T.accent : T.border}`,
              borderRadius: 24, padding: isMobile ? '28px 16px' : '36px 32px', textAlign: 'center',
              background: dragOver ? `${T.accent}05` : '#fff',
              transition: 'all 0.25s', marginBottom: 24,
            }}>
            <motion.div animate={dragOver ? { scale: 1.2, rotate: [0, -10, 10, 0] } : { y: [0, -8, 0] }}
              transition={dragOver ? { duration: 0.3 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <UploadCloud size={isMobile ? 36 : 44} color={dragOver ? T.accent : T.textMuted} style={{ marginBottom: 12 }} />
            </motion.div>

            <p style={{ margin: '0 0 6px', fontSize: isMobile ? 15 : 17, fontWeight: 700, color: dragOver ? T.accent : T.text }}>
              {dragOver ? 'Lepas untuk upload!' : 'Seret & lepas file ke sini'}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: T.textMuted }}>
              Atau klik tombol di bawah · Maks. {formatSize(isPro ? PRO_MAX_FILE : FREE_MAX_FILE)}/file
            </p>

            {uploading && (
              <div style={{ maxWidth: 240, margin: '0 auto 16px', height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${uploadProgress}%` }} transition={{ ease: 'easeOut' }}
                  style={{ height: '100%', background: T.gradient, borderRadius: 3 }} />
              </div>
            )}

            <input type="file" id="fileInput" multiple style={{ display: 'none' }} onChange={e => { for (const f of Array.from(e.target.files)) uploadFile(f) }} />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById('fileInput').click()} disabled={uploading}
              style={{ background: T.gradient, color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: uploading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
              {uploading ? `Mengupload ${uploadProgress}%...` : '📎 Pilih File'}
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', padding: '8px 16px', borderRadius: 100, border: `1px solid ${T.border}`, flex: '1 1 180px' }}>
              <Search size={15} color={T.textMuted} />
              <input placeholder='Cari file...' value={search} onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: T.text, width: '100%', fontFamily: 'inherit' }} />
              {search && <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSearch('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex' }}><X size={14} /></motion.button>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 13, outline: 'none', cursor: 'pointer', background: '#fff', color: T.text, fontFamily: 'inherit' }}>
                <option value='date'>Terbaru</option>
                <option value='name'>Nama A-Z</option>
              </select>

              <div style={{ display: 'flex', background: '#fff', borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                {[['grid', <Grid3X3 size={16} />], ['list', <List size={16} />]].map(([mode, icon]) => (
                  <motion.button key={mode} whileTap={{ scale: 0.9 }} onClick={() => setViewMode(mode)}
                    style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', background: viewMode === mode ? T.accent : 'transparent', color: viewMode === mode ? '#fff' : T.textMuted, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                    {icon}
                  </motion.button>
                ))}
              </div>

              <motion.button whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.4 }} onClick={loadFiles}
                style={{ padding: '8px 10px', borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={16} />
              </motion.button>
            </div>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: T.textMuted }}>
              <span style={{ fontWeight: 700, color: T.text }}>{filtered.length}</span> file
              {currentFolder !== 'root' && <span> di <span style={{ color: T.accent }}>📁 {currentFolder}</span></span>}
            </span>
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  style={{ fontSize: 12, color: T.accent, fontWeight: 700, background: `${T.accent}22`, padding: '4px 12px', borderRadius: 100, border: `1px solid ${T.accent}44` }}>
                  {selected.length} dipilih
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Files grid/list */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '80px 20px', border: `2px dashed ${T.borderStrong}`, borderRadius: 24, background: 'rgba(255,255,255,0.01)' }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: 64, marginBottom: 16 }}>📭</motion.div>
              <p style={{ color: T.textSub, fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Folder ini masih kosong</p>
              <p style={{ color: T.textMuted, fontSize: 14, margin: 0 }}>Upload file pertamamu di atas!</p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
              <AnimatePresence>
                {filtered.map((f, i) => (
                  <FileCard key={f.name} f={f} index={i} viewMode='grid'
                    onPreview={handlePreview} onRename={setRenameFile}
                    onShare={handleShare} onDownload={handleDownload} onDelete={handleDelete}
                    onRestore={handleRestore}
                    selected={selected.includes(f.name)}
                    autoPreview={settings.autoPreview}
                    onFetchPreviewUrl={getPreviewUrl}
                    onContextMenu={handleContextMenu}
                    onSelect={n => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n])} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {filtered.map((f, i) => (
                  <FileCard key={f.name} f={f} index={i} viewMode='list'
                    onPreview={handlePreview} onRename={setRenameFile}
                    onShare={handleShare} onDownload={handleDownload} onDelete={handleDelete}
                    onRestore={handleRestore}
                    selected={selected.includes(f.name)}
                    autoPreview={settings.autoPreview}
                    onFetchPreviewUrl={getPreviewUrl}
                    onContextMenu={handleContextMenu}
                    onSelect={n => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n])} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(3,3,5,0.92)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `3px dashed ${T.accent}`, pointerEvents: 'none' }}>
            <motion.div animate={{ y: [-20, 0, -20], scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <UploadCloud size={80} color={T.accent} />
            </motion.div>
            <p style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginTop: 20 }}>Lepas file untuk upload</p>
            <p style={{ color: T.textMuted, fontSize: 14 }}>ke {currentFolder === 'root' ? 'Semua File' : currentFolder}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS & OVERLAYS */}
      <Toast message={toast.msg} type={toast.type} />
      {previewFile && <PreviewModal file={previewFile} url={previewUrl} onClose={() => setPreviewFile(null)} />}
      {renameFile && <RenameModal fileName={renameFile.name} onRename={n => handleRename(renameFile, n)} onClose={() => setRenameFile(null)} />}
      {confirmState && (
        <ConfirmModal message={confirmState.message}
          onCancel={() => setConfirmState(null)}
          onConfirm={async () => { await confirmState.onConfirm(); setConfirmState(null) }} />
      )}
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgradeSuccess={() => { persistUpgrade(); setShowUpgrade(false) }} />
      )}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} file={contextMenu.file}
          onClose={() => setContextMenu(null)}
          actions={{
            onPreview: handlePreview,
            onRename: setRenameFile,
            onShare: f => handleShare(f.name),
            onDownload: f => handleDownload(f.name),
            onDelete: f => handleDelete(f.name),
            onRestore: f => handleRestore(f.name),
          }} />
      )}
    </div>
  )
}
