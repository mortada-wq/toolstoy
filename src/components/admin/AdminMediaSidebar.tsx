import { useState, useEffect } from 'react'

interface MediaFolder {
  id: string
  name: string
  description?: string
  assetCount: number
  createdAt: string
}

interface AdminMediaSidebarProps {
  onFolderSelect?: (folderId: string) => void
  selectedFolderId?: string | null
}

export function AdminMediaSidebar({ onFolderSelect, selectedFolderId }: AdminMediaSidebarProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/admin/media-folders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to load folders')
      
      const data = await response.json()
      const sorted = (data.folders || []).sort((a: MediaFolder, b: MediaFolder) => 
        a.name.localeCompare(b.name)
      )
      setFolders(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name is required')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/admin/media-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription,
        }),
      })

      if (!response.ok) throw new Error('Failed to create folder')

      setNewFolderName('')
      setNewFolderDescription('')
      setShowCreateForm(false)
      await loadFolders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its assets?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/admin/media-folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete folder')

      await loadFolders()
      if (selectedFolderId === folderId) {
        onFolderSelect?.(null as any)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder')
    }
  }

  return (
    <div className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Admin Media</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full px-3 py-2 bg-[#5B7C99] text-white rounded-md text-[12px] font-medium hover:bg-[#4A6B85] transition-all"
        >
          + Create Folder
        </button>
      </div>

      {/* Create Folder Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded-md text-[12px] mb-2"
          />
          <textarea
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded-md text-[12px] mb-2 resize-none h-16"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateFolder}
              className="flex-1 px-2 py-1.5 bg-[#5B7C99] text-white rounded-md text-[11px] font-medium hover:bg-[#4A6B85]"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-2 py-1.5 bg-[#E5E7EB] text-[#6B7280] rounded-md text-[11px] font-medium hover:bg-[#D1D5DB]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-[#FEE2E2] border-b border-[#FECACA]">
          <p className="text-[12px] text-[#DC2626]">{error}</p>
        </div>
      )}

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-[12px] text-[#6B7280]">Loading...</div>
        ) : folders.length === 0 ? (
          <div className="p-4 text-center text-[12px] text-[#6B7280]">No folders yet</div>
        ) : (
          <div className="space-y-1 p-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`p-3 rounded-md cursor-pointer transition-all group ${
                  selectedFolderId === folder.id
                    ? 'bg-[#5B7C99] text-white'
                    : 'bg-white text-[#1A1A1A] hover:bg-[#F3F4F6]'
                }`}
                onClick={() => onFolderSelect?.(folder.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{folder.name}</p>
                    <p className={`text-[11px] ${selectedFolderId === folder.id ? 'text-white/70' : 'text-[#6B7280]'}`}>
                      {folder.assetCount} assets
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFolder(folder.id)
                    }}
                    className={`ml-2 px-2 py-1 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedFolderId === folder.id
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
