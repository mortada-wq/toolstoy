import { useState } from 'react'

interface Asset {
  id: string
  assetName: string
  assetUrl: string
  assetType: string
  createdAt: string
}

interface AssetPreviewPanelProps {
  asset: Asset | null
  onDelete?: () => void
  onUseInGeneration?: (assetUrl: string) => void
}

export function AssetPreviewPanel({ asset, onDelete, onUseInGeneration }: AssetPreviewPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!asset) {
    return (
      <div className="p-6 text-center text-[13px] text-[#6B7280]">
        Select an asset to preview
      </div>
    )
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.assetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (confirm('Delete this asset?')) {
      onDelete?.()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const _getFileSize = (_url: string) => {
    // This is a placeholder - actual size would come from server
    return 'N/A'
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Asset Preview</h3>

      {/* Preview */}
      <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
        {asset.assetType.startsWith('image') ? (
          <img
            src={asset.assetUrl}
            alt={asset.assetName}
            className="w-full rounded-md max-h-64 object-cover"
          />
        ) : asset.assetType.startsWith('video') ? (
          <video
            src={asset.assetUrl}
            controls
            className="w-full rounded-md max-h-64"
          />
        ) : (
          <div className="p-8 text-center text-[12px] text-[#6B7280]">
            Preview not available
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-[12px]">
        <div>
          <p className="text-[#6B7280]">Name</p>
          <p className="text-[#1A1A1A] font-medium break-all">{asset.assetName}</p>
        </div>
        <div>
          <p className="text-[#6B7280]">Type</p>
          <p className="text-[#1A1A1A] font-medium">{asset.assetType}</p>
        </div>
        <div>
          <p className="text-[#6B7280]">Uploaded</p>
          <p className="text-[#1A1A1A] font-medium">{formatDate(asset.createdAt)}</p>
        </div>
      </div>

      {/* URL Copy */}
      <div className="space-y-2">
        <p className="text-[12px] text-[#6B7280]">Asset URL</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={asset.assetUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[11px] text-[#6B7280]"
          />
          <button
            onClick={handleCopyUrl}
            className="px-3 py-2 bg-[#5B7C99] text-white rounded-md text-[11px] font-medium hover:bg-[#4A6B85] transition-all"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
        <button
          onClick={() => onUseInGeneration?.(asset.assetUrl)}
          className="flex-1 px-3 py-2 bg-[#5B7C99] text-white rounded-md text-[12px] font-medium hover:bg-[#4A6B85] transition-all"
        >
          Use in Generation
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-2 bg-[#FEE2E2] text-[#DC2626] rounded-md text-[12px] font-medium hover:bg-[#FECACA] transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
