import { useState } from 'react'

interface AssetUploadPanelProps {
  folderId: string | null
  onUploadComplete?: () => void
}

export function AssetUploadPanel({ folderId, onUploadComplete }: AssetUploadPanelProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  if (!folderId) {
    return (
      <div className="p-6 text-center text-[13px] text-[#6B7280]">
        Select a folder to upload assets
      </div>
    )
  }

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Allowed: PNG, JPG, WebP, MP4, WebM'
    }

    if (file.size > maxSize) {
      return 'File size exceeds 50MB limit'
    }

    return null
  }

  const handleFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('assetName', file.name)

      const token = localStorage.getItem('authToken')
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setProgress(0)
          setUploading(false)
          onUploadComplete?.()
        } else {
          setError('Upload failed')
          setUploading(false)
        }
      })

      xhr.addEventListener('error', () => {
        setError('Upload error')
        setUploading(false)
      })

      xhr.open('POST', `/api/admin/media-folders/${folderId}/assets`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Upload Asset</h3>

      {error && (
        <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-md">
          <p className="text-[12px] text-[#DC2626]">{error}</p>
        </div>
      )}

      {uploading ? (
        <div className="space-y-3">
          <div className="w-full bg-[#E5E7EB] rounded-full h-2">
            <div
              className="bg-[#5B7C99] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[12px] text-[#6B7280] text-center">{progress}% uploaded</p>
        </div>
      ) : (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`block cursor-pointer transition-all ${
            dragActive ? 'bg-[#EBF8FF] border-[#5B7C99]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
          } border-2 border-dashed rounded-lg p-8 text-center`}
        >
          <p className="text-[14px] font-medium text-[#1A1A1A] mb-1">
            Drop file or click to upload
          </p>
          <p className="text-[12px] text-[#6B7280] mb-4">
            PNG, JPG, WebP, MP4, WebM up to 50MB
          </p>
          <input
            type="file"
            onChange={handleInputChange}
            accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}
