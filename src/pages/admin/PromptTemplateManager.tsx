import { useState, useEffect } from 'react'

interface PromptTemplate {
  id: string
  name: string
  template: string
  description: string
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

const DEFAULT_TEMPLATE = `Professional 3D character mascot design representing {PRODUCT_NAME}.

Style: Modern, friendly, approachable
Art Direction: Clean illustration style, vibrant colors inspired by {PRODUCT_COLORS}
Character Design: Anthropomorphic representation of {PRODUCT_TYPE}, incorporating key visual elements from the product
Personality: {CHARACTER_TYPE} - {VIBE_TAGS}
Composition: Full body character, centered, facing forward
Background: Simple gradient or solid color, professional
Quality: High detail, professional illustration, suitable for e-commerce
Technical: 1024x1024, PNG with transparency, optimized for web

Avoid: Realistic humans, dark themes, complex backgrounds, text overlays`

const SAMPLE_DATA = {
  productName: 'Wireless Headphones',
  productType: 'Electronics - Audio Device',
  productColors: 'Midnight Blue, Silver, Black',
  characterType: 'Friendly Robot',
  vibeTags: 'Modern, Tech-savvy, Helpful',
}

const VARIABLES = [
  { name: '{PRODUCT_NAME}', description: 'Product name from user input', example: 'Wireless Headphones' },
  { name: '{PRODUCT_TYPE}', description: 'Auto-detected product category', example: 'Electronics - Audio Device' },
  { name: '{PRODUCT_COLORS}', description: 'Colors extracted from product image', example: 'Blue, Silver, Black' },
  { name: '{CHARACTER_TYPE}', description: 'User-selected character style', example: 'Friendly Robot' },
  { name: '{VIBE_TAGS}', description: 'User-selected personality traits', example: 'Modern, Helpful' },
]

export function PromptTemplateManager() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [templateName, setTemplateName] = useState('Default Template')
  const [templateDescription, setTemplateDescription] = useState('Standard character generation template')
  const [sampleData, setSampleData] = useState(SAMPLE_DATA)
  const [previewPrompt, setPreviewPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [_isLoading, _setIsLoading] = useState(true)
  const [_activeTemplateId, _setActiveTemplateId] = useState<string | null>(null)

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    _setIsLoading(true)
    try {
      // TODO: Implement API call to fetch templates
      // const response = await fetch('/api/prompt-templates')
      // const data = await response.json()
      // setTemplates(data)
      
      // Mock data for now
      setTemplates([])
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      _setIsLoading(false)
    }
  }

  const generatePreview = () => {
    let preview = template
    preview = preview.replace(/{PRODUCT_NAME}/g, sampleData.productName)
    preview = preview.replace(/{PRODUCT_TYPE}/g, sampleData.productType)
    preview = preview.replace(/{PRODUCT_COLORS}/g, sampleData.productColors)
    preview = preview.replace(/{CHARACTER_TYPE}/g, sampleData.characterType)
    preview = preview.replace(/{VIBE_TAGS}/g, sampleData.vibeTags)
    setPreviewPrompt(preview)
  }

  const handleTestGeneration = async () => {
    generatePreview()
    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      // TODO: Call actual Bedrock API for test generation
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setGeneratedImage('https://via.placeholder.com/512x512/5B7C99/FFFFFF?text=Test+Character')
    } catch (err) {
      alert('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveTemplate = async () => {
    setIsSaving(true)
    try {
      // TODO: Call API to save template
      // await fetch('/api/prompt-templates', {
      //   method: 'POST',
      //   body: JSON.stringify({ name: templateName, template, description: templateDescription })
      // })
      
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      loadTemplates()
    } catch (err) {
      alert('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivateTemplate = async (templateId: string) => {
    try {
      // TODO: Call API to activate template
      // await fetch(`/api/prompt-templates/${templateId}/activate`, { method: 'POST' })
      
      _setActiveTemplateId(templateId)
      loadTemplates()
    } catch (err) {
      alert('Failed to activate template')
    }
  }

  const handleResetToDefault = () => {
    if (confirm('Reset to default template? This will discard your changes.')) {
      setTemplate(DEFAULT_TEMPLATE)
      setTemplateName('Default Template')
      setTemplateDescription('Standard character generation template')
      setPreviewPrompt('')
      setGeneratedImage(null)
    }
  }

  return (
    <div className="p-5 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-semibold text-[24px] text-[#1A1A1A]">Master Prompt Template</h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Control how all user products are transformed into characters
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-4 bg-white border border-[#5B7C99] rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-[#5B7C99]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-[14px] text-[#1A1A1A] font-medium">Template saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Template List & Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Template List */}
          {templates.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <h2 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Saved Templates</h2>
              <div className="space-y-2">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      t.is_active
                        ? 'border-[#5B7C99] bg-[#5B7C99]/5'
                        : 'border-[#E5E7EB] hover:border-[#6B7280]'
                    }`}
                    onClick={() => {
                      setTemplate(t.template)
                      setTemplateName(t.name)
                      setTemplateDescription(t.description)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-[14px] text-[#1A1A1A]">{t.name}</h3>
                        <p className="text-[12px] text-[#6B7280] mt-1">{t.description}</p>
                      </div>
                      {t.is_active ? (
                        <span className="px-2 py-1 bg-[#5B7C99] text-white text-[11px] rounded-full font-medium">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivateTemplate(t.id)
                          }}
                          className="px-2 py-1 border border-[#6B7280] text-[#6B7280] text-[11px] rounded-full font-medium hover:bg-[#F5F5F5]"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Editor */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[16px] text-[#1A1A1A]">Template Editor</h2>
              <button
                onClick={handleResetToDefault}
                className="text-[13px] text-[#6B7280] hover:text-[#1A1A1A] underline"
              >
                Reset to Default
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Description</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                  placeholder="Brief description of this template"
                />
              </div>
            </div>

            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-3 text-[13px] font-mono min-h-[400px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
              placeholder="Enter your master prompt template..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-lg font-medium text-[14px] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </button>
              <button
                onClick={generatePreview}
                className="px-6 border border-[#E5E7EB] text-[#1A1A1A] py-3 rounded-lg font-medium text-[14px] hover:bg-[#F5F5F5] transition-all"
              >
                Preview
              </button>
            </div>
          </div>

          {/* Preview Prompt */}
          {previewPrompt && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[16px] text-[#1A1A1A]">Generated Prompt Preview</h3>
                <button
                  onClick={handleTestGeneration}
                  disabled={isGenerating}
                  className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg font-medium text-[13px] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGenerating ? 'Generating...' : 'Test Generate'}
                </button>
              </div>

              <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E5E7EB]">
                <pre className="text-[12px] text-[#1A1A1A] whitespace-pre-wrap font-mono">
                  {previewPrompt}
                </pre>
              </div>
            </div>
          )}

          {/* Test Generation Result */}
          {generatedImage && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <h3 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Test Generation Result</h3>
              <img src={generatedImage} alt="Test character" className="w-full max-w-md mx-auto rounded-lg" />
            </div>
          )}
        </div>

        {/* Right Column - Variables & Sample Data */}
        <div className="space-y-4">
          {/* Available Variables */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Available Variables</h3>
            <div className="space-y-3">
              {VARIABLES.map((variable) => (
                <div key={variable.name} className="border-b border-[#F5F5F5] pb-3 last:border-0">
                  <code className="text-[13px] font-mono text-[#5B7C99] bg-white px-2 py-1 rounded border border-[#5B7C99]/20">
                    {variable.name}
                  </code>
                  <p className="text-[12px] text-[#6B7280] mt-1">{variable.description}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 italic">Example: {variable.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Data Editor */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Sample Data for Testing</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Product Name</label>
                <input
                  type="text"
                  value={sampleData.productName}
                  onChange={(e) => setSampleData({ ...sampleData, productName: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Product Type</label>
                <input
                  type="text"
                  value={sampleData.productType}
                  onChange={(e) => setSampleData({ ...sampleData, productType: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Product Colors</label>
                <input
                  type="text"
                  value={sampleData.productColors}
                  onChange={(e) => setSampleData({ ...sampleData, productColors: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Character Type</label>
                <input
                  type="text"
                  value={sampleData.characterType}
                  onChange={(e) => setSampleData({ ...sampleData, characterType: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Vibe Tags</label>
                <input
                  type="text"
                  value={sampleData.vibeTags}
                  onChange={(e) => setSampleData({ ...sampleData, vibeTags: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
                />
              </div>
            </div>
          </div>

          {/* Template Info */}
          <div className="bg-[#F5F1ED] border border-[#8B7355] rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#5C4A3A] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-[13px] font-medium text-[#5C4A3A]">Important</p>
                <p className="text-[12px] text-[#5C4A3A] mt-1">
                  This template affects ALL user character generations. Test thoroughly before activating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
