import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/context/UserContext'

interface Annotation {
  id: string
  elementPath: string
  elementText: string
  note: string
  timestamp: string
  pageUrl: string
  screenshot?: string
}

export function AdminAnnotationMode() {
  const { adminRole } = useUser()
  const [isActive, setIsActive] = useState(false)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [note, setNote] = useState('')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  // Only available for super_admin and admin
  const canAnnotate = adminRole === 'super_admin' || adminRole === 'admin'

  // Get element path for identification
  const getElementPath = (element: HTMLElement): string => {
    const path: string[] = []
    let current: HTMLElement | null = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      
      if (current.id) {
        selector += `#${current.id}`
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim()).join('.')
        if (classes) selector += `.${classes}`
      }
      
      path.unshift(selector)
      current = current.parentElement
    }
    
    return path.join(' > ')
  }

  // Get element description
  const getElementDescription = (element: HTMLElement): string => {
    const text = element.innerText?.slice(0, 50) || ''
    const tag = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ')[0]}` : ''
    
    return `<${tag}${id}${classes}> ${text ? `"${text}..."` : ''}`
  }

  // Handle element hover
  const handleMouseOver = useCallback((e: MouseEvent) => {
    if (!isActive) return
    
    const target = e.target as HTMLElement
    if (target.closest('.admin-annotation-ui')) return // Ignore our own UI
    
    setHoveredElement(target)
    target.style.outline = '2px dashed #EF4444'
    target.style.outlineOffset = '2px'
    target.style.cursor = 'crosshair'
  }, [isActive])

  // Handle element hover out
  const handleMouseOut = useCallback((e: MouseEvent) => {
    if (!isActive) return
    
    const target = e.target as HTMLElement
    if (target.closest('.admin-annotation-ui')) return
    
    target.style.outline = ''
    target.style.outlineOffset = ''
    target.style.cursor = ''
    setHoveredElement(null)
  }, [isActive])

  // Handle element click
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return
    
    const target = e.target as HTMLElement
    if (target.closest('.admin-annotation-ui')) return
    
    e.preventDefault()
    e.stopPropagation()
    
    setSelectedElement(target)
    setShowNoteModal(true)
  }, [isActive])

  // Toggle annotation mode
  const toggleMode = () => {
    setIsActive(!isActive)
    if (isActive) {
      // Clean up any highlighted elements
      document.querySelectorAll('[style*="outline"]').forEach(el => {
        (el as HTMLElement).style.outline = ''
        ;(el as HTMLElement).style.outlineOffset = ''
        ;(el as HTMLElement).style.cursor = ''
      })
    }
  }

  // Save annotation
  const saveAnnotation = () => {
    if (!selectedElement || !note.trim()) return

    const annotation: Annotation = {
      id: Date.now().toString(),
      elementPath: getElementPath(selectedElement),
      elementText: getElementDescription(selectedElement),
      note: note.trim(),
      timestamp: new Date().toISOString(),
      pageUrl: window.location.pathname,
    }

    setAnnotations(prev => [...prev, annotation])
    
    // Log to console for easy copying
    console.log('📝 NEW ANNOTATION:', annotation)
    
    // Copy to clipboard
    const annotationText = `
📝 ANNOTATION
Page: ${annotation.pageUrl}
Element: ${annotation.elementText}
Path: ${annotation.elementPath}
Note: ${annotation.note}
Time: ${new Date(annotation.timestamp).toLocaleString()}
    `.trim()
    
    navigator.clipboard.writeText(annotationText).then(() => {
      alert('Annotation saved and copied to clipboard!')
    })

    // Reset
    setNote('')
    setShowNoteModal(false)
    setSelectedElement(null)
  }

  // Keyboard shortcut: Cmd/Ctrl + Shift + A
  useEffect(() => {
    if (!canAnnotate) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        toggleMode()
      }
      
      // ESC to cancel
      if (e.key === 'Escape' && isActive) {
        setIsActive(false)
        setShowNoteModal(false)
        setSelectedElement(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canAnnotate, isActive])

  // Add event listeners when active
  useEffect(() => {
    if (!isActive) return

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('click', handleClick, true)
    }
  }, [isActive, handleMouseOver, handleMouseOut, handleClick])

  // Export annotations
  const exportAnnotations = () => {
    const dataStr = JSON.stringify(annotations, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `toolstoy-annotations-${Date.now()}.json`
    link.click()
  }

  if (!canAnnotate) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleMode}
        className={`admin-annotation-ui fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
          isActive
            ? 'bg-[#EF4444] hover:bg-[#DC2626]'
            : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
        }`}
        title={isActive ? 'Exit Annotation Mode (Cmd+Shift+A)' : 'Enter Annotation Mode (Cmd+Shift+A)'}
      >
        {isActive ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        )}
      </button>

      {/* Active Mode Indicator */}
      {isActive && (
        <div className="admin-annotation-ui fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#EF4444] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="font-semibold text-sm">Annotation Mode Active - Click any element</span>
        </div>
      )}

      {/* Hovered Element Info */}
      {isActive && hoveredElement && !showNoteModal && (
        <div className="admin-annotation-ui fixed bottom-24 right-6 z-[9999] bg-[#1A1A1A] text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
          <p className="text-xs font-mono">{getElementDescription(hoveredElement)}</p>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedElement && (
        <div className="admin-annotation-ui fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Add Annotation</h3>
            
            <div className="mb-4 p-3 bg-[#F5F5F5] rounded-lg">
              <p className="text-xs text-[#6B7280] mb-1">Selected Element:</p>
              <p className="text-sm font-mono text-[#1A1A1A]">{getElementDescription(selectedElement)}</p>
              <p className="text-xs text-[#6B7280] mt-2">Path:</p>
              <p className="text-xs font-mono text-[#6B7280] break-all">{getElementPath(selectedElement)}</p>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What needs to be changed or noted about this element?"
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveAnnotation}
                disabled={!note.trim()}
                className="flex-1 bg-[#1A1A1A] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Copy to Clipboard
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false)
                  setSelectedElement(null)
                  setNote('')
                }}
                className="px-6 border border-[#E5E7EB] text-[#6B7280] py-2 rounded-lg font-medium text-sm hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Annotations List */}
      {annotations.length > 0 && (
        <div className="admin-annotation-ui fixed bottom-24 left-6 z-[9999] bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-[#1A1A1A]">
              Annotations ({annotations.length})
            </h4>
            <button
              onClick={exportAnnotations}
              className="text-xs text-[#6B7280] hover:text-[#1A1A1A] underline"
            >
              Export JSON
            </button>
          </div>
          <div className="space-y-2">
            {annotations.slice(-5).reverse().map((ann) => (
              <div key={ann.id} className="border border-[#E5E7EB] rounded p-2">
                <p className="text-xs font-mono text-[#6B7280] mb-1">{ann.elementText}</p>
                <p className="text-sm text-[#1A1A1A]">{ann.note}</p>
                <p className="text-xs text-[#6B7280] mt-1">{ann.pageUrl}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Cursor Style */}
      {isActive && (
        <style>{`
          * {
            cursor: crosshair !important;
          }
          .admin-annotation-ui, .admin-annotation-ui * {
            cursor: default !important;
          }
        `}</style>
      )}
    </>
  )
}
