import { T } from './theme'
import { Image, FileText, FileSpreadsheet, Archive, Film, Music, Code, File } from 'lucide-react'

export function getFileInfo(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext))
    return { icon: <Image size={24} />, color: T.pink, bg: T.pinkBg, isImage: true }
  if (ext === 'pdf')
    return { icon: <FileText size={24} />, color: T.red, bg: T.redBg, isImage: false }
  if (['doc','docx'].includes(ext))
    return { icon: <FileText size={24} />, color: T.blue, bg: T.blueBg, isImage: false }
  if (['xls','xlsx','csv'].includes(ext))
    return { icon: <FileSpreadsheet size={24} />, color: T.green, bg: T.greenBg, isImage: false }
  if (['zip','rar','7z'].includes(ext))
    return { icon: <Archive size={24} />, color: T.yellow, bg: T.yellowBg, isImage: false }
  if (['mp4','mov','avi','mkv'].includes(ext))
    return { icon: <Film size={24} />, color: T.orange, bg: T.orangeBg, isImage: false }
  if (['mp3','wav','ogg'].includes(ext))
    return { icon: <Music size={24} />, color: T.pink, bg: T.pinkBg, isImage: false }
  if (['js','jsx','ts','tsx','py','html','css','json'].includes(ext))
    return { icon: <Code size={24} />, color: T.blue, bg: T.blueBg, isImage: false }
  return { icon: <File size={24} />, color: T.textSub, bg: T.bgCard, isImage: false }
}

export function formatSize(b) {
  if (!b || b===0) return '0 B'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  if (b < 1073741824) return (b/1048576).toFixed(2) + ' MB'
  return (b/1073741824).toFixed(2) + ' GB'
}

export function formatName(n) { return n.replace(/^\d+_/,'') }
export function getInitials(e) { return e ? e[0].toUpperCase() : '?' }
export function getAvatarColor(e) {
  const c = ['#7C6FFF','#FF6B9D','#0EA5E9','#10B981','#F97316']
  return c[e.charCodeAt(0) % c.length]
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}