import { useState } from 'react'

export function BedrockPlaygroundSimple() {
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVariations, setGeneratedVariations] = useState<string[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProductImage(null)
    setProductImagePreview(null)
    setProductName('')
    setBrandName('')
  }

  const handleGenerate = async () => {
    if (!productImage || !productName) {
      alert('Please upload product image and enter product name')
      return
    }

    setIsGenerating(true)
    setGeneratedVariations([])
    setSelectedVariation(null)

    try {
      // Simulate generation
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      // Mock 3 variations
      setGeneratedVariations([
        'https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=Variation+1',
        'https://via.placeholder.com/512x512/10B981/FFFFFF?text=Variation+2',
        'https://via.placeholder.com/512x512/F59E0B/FFFFFF?text=Variation+3',
      ])
    } catch (err) {
      alert('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = (index: number) => {
    setSelectedVariation(index)
  }

  const handleMakeLive = () => {
    if (selectedVariation === null) {
      alert('Please select a variation first')
      return
    }
    alert('Character is now live!')
  }

  return (
    <div className="p-5 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-semibold text-[24px] text-[#1A1A1A]">Toolstizer - Product to Character</h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Upload your product image and transform it into a living character
        </p>
      </div>

      {/* PRODUCT IMAGE UPLOAD - MAIN FEATURE */}
      <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-lg p-8 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-[22px] text-white">Step 1: Upload Product Image</h2>
            <p className="text-[15px] text-white/90">The main input - your product becomes a character!</p>
          </div>
        </div>

        {!productImagePreview ? (
          <label className="block cursor-pointer">
            <div className="border-3 border-dashed border-white/50 rounded-xl p-16 text-center hover:border-white/70 hover:bg-white/10 transition-all">
              <svg className="w-20 h-20 text-white/70 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-white font-bold text-[20px] mb-2">Drop product image here or click to upload</p>
              <p className="text-white/80 text-[15px]">PNG, JPG, WEBP up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        ) : (
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={productImagePreview}
                  alt="Product preview"
                  className="w-full md:w-56 h-56 object-cover rounded-lg border-4 border-white/30 shadow-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white text-[18px]">Product Details</h3>
                  <button
                    onClick={handleRemoveImage}
                    className="text-white/80 hover:text-white text-[14px] underline font-medium"
                  >
                    Remove & Upload Different
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium text-[14px] mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Wireless Headphones"
                      className="w-full bg-white/20 border-2 border-white/30 rounded-lg px-4 py-3 text-white text-[15px] placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium text-[14px] mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g., AudioTech"
                      className="w-full bg-white/20 border-2 border-white/30 rounded-lg px-4 py-3 text-white text-[15px] placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    />
                  </div>
                </div>

                {productName && (
                  <div className="mt-4 p-4 bg-[#10B981]/20 rounded-lg border-2 border-[#10B981]/40">
                    <p className="text-white font-medium text-[14px]">
                      ✓ Ready to transform <span className="font-bold">{productName}</span> into a living character!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      {productImagePreview && productName && (
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-lg font-semibold text-[16px] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isGenerating ? '🔥 Toolstizer is cooking your character...' : '🚀 Generate 3 Character Variations'}
          </button>
        </div>
      )}

      {/* Generated Variations */}
      {generatedVariations.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-[18px] text-[#1A1A1A] mb-4">
            Pick Your Favorite Character
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedVariations.map((url, index) => (
              <div
                key={index}
                onClick={() => handleApprove(index)}
                className={`relative border-4 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedVariation === index
                    ? 'border-[#10B981] ring-4 ring-[#10B981]/30 scale-105'
                    : 'border-[#E5E7EB] hover:border-[#6B7280]'
                }`}
              >
                <img src={url} alt={`Variation ${index + 1}`} className="w-full" />
                
                <div className="absolute top-3 left-3 bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full">
                  #{index + 1}
                </div>
                
                {selectedVariation === index && (
                  <div className="absolute top-3 right-3 bg-[#10B981] text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </div>
                )}
                
                {selectedVariation !== index && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                    <span className="opacity-0 hover:opacity-100 bg-white text-[#1A1A1A] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Click to Select
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedVariation !== null && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleMakeLive}
                className="flex-1 bg-[#10B981] text-white py-3 rounded-lg font-semibold text-[15px] hover:bg-[#059669] transition-all"
              >
                ✓ Make This Character Live
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 border-2 border-[#E5E7EB] text-[#1A1A1A] py-3 rounded-lg font-semibold text-[15px] hover:bg-[#F5F5F5] transition-all"
              >
                Regenerate 3 New Variations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
