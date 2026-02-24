import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'

interface PromptTemplate {
  id: string
  name: string
  template: string
  description: string
  is_active: boolean
  variables: string[]
  version: number
  parent_template_id: string | null
  created_at: string
  updated_at: string
}

interface TemplateAnalytics {
  totalGenerations: number
  successfulGenerations: number
  failedGenerations: number
  successRate: number
  avgCostUsd: number | null
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
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState(SAMPLE_DATA)
  const [previewPrompt, setPreviewPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<Record<string, TemplateAnalytics>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'updated_at' | 'version'>('updated_at')

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const params = new URLSearchParams({ filter: filterMode, sort: sortBy })
      if (searchQuery) params.set('search', searchQuery)
      const data = await apiGet<PromptTemplate[]>(`/api/prompt-templates?${params}`)
      setTemplates(data)
    } catch (err) {
      console.error('Failed to load templates:', err)
      setErrorMessage('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }, [filterMode, sortBy, searchQuery])

  // Load templates on mount and when filters change
  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  const loadAnalytics = async (templateId: string) => {
    try {
      const data = await apiGet<TemplateAnalytics>(`/api/prompt-templates/${templateId}/analytics`)
      setAnalytics((prev) => ({ ...prev, [templateId]: data }))
    } catch (err) {
      console.error('Failed to load analytics for template', templateId, err)
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

  const handleSaveTemplate = async () => {
    setIsSaving(true)
    setValidationErrors([])
    setErrorMessage(null)
    try {
      const payload = { name: templateName, template, description: templateDescription }
      if (editingTemplateId) {
        await apiPut(`/api/prompt-templates/${editingTemplateId}`, payload)
      } else {
        await apiPost('/api/prompt-templates', payload)
      }
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      setEditingTemplateId(null)
      setTemplate(DEFAULT_TEMPLATE)
      setTemplateName('Default Template')
      setTemplateDescription('Standard character generation template')
      void loadTemplates()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save template'
      setErrorMessage(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivateTemplate = async (templateId: string) => {
    setErrorMessage(null)
    try {
      await apiPost(`/api/prompt-templates/${templateId}/activate`)
      void loadTemplates()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to activate template')
    }
  }

  const handleDeleteTemplate = async (templateId: string, isActive: boolean) => {
    if (isActive) {
      setErrorMessage('Cannot delete the currently active template')
      return
    }
    if (!confirm('Delete this template? This action cannot be undone.')) return
    setErrorMessage(null)
    try {
      await apiDelete(`/api/prompt-templates/${templateId}`)
      void loadTemplates()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete template')
    }
  }

  const handleEditTemplate = (t: PromptTemplate) => {
    setEditingTemplateId(t.id)
    setTemplate(t.template)
    setTemplateName(t.name)
    setTemplateDescription(t.description)
    setPreviewPrompt('')
    void loadAnalytics(t.id)
  }

  const handleResetToDefault = () => {
    if (confirm('Reset to default template? This will discard your changes.')) {
      setTemplate(DEFAULT_TEMPLATE)
      setTemplateName('Default Template')
      setTemplateDescription('Standard character generation template')
      setPreviewPrompt('')
      setEditingTemplateId(null)
      setValidationErrors([])
    }
  }

  const handleExportAll = async () => {
    try {
      const data = await apiPost<{ templates: unknown[] }>('/api/prompt-templates/export', {})
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt-templates-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export templates:', err)
      setErrorMessage('Failed to export templates')
    }
  }

  return (
    <div className="p-5 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-semibold text-[24px] text-[#1A1A1A]">Prompt Template Library</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Manage and deploy prompt templates for character generation
          </p>
        </div>
        <button
          onClick={handleExportAll}
          className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg text-[13px] font-medium hover:bg-[#F5F5F5] transition-all"
        >
          Export All
        </button>
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

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-[#F5F1ED] border border-[#8B7355] rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-[#5C4A3A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-[14px] text-[#5C4A3A]">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-[#8B7355] hover:text-[#5C4A3A]">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Template List & Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="flex-1 min-w-[160px] border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
              />
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as 'all' | 'active' | 'inactive')}
                className="border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
              >
                <option value="all">All Templates</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'updated_at' | 'version')}
                className="border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B7C99]"
              >
                <option value="updated_at">Last Updated</option>
                <option value="name">Name</option>
                <option value="version">Version</option>
              </select>
            </div>
            {!isLoading && (
              <p className="text-[11px] text-[#9CA3AF] mt-2">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Template List */}
          {isLoading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 text-center text-[#6B7280] text-[14px]">Loading templates…</div>
          ) : templates.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 text-center text-[#6B7280] text-[14px]">
              No templates found. Create one using the editor below.
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <h2 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Templates</h2>
              <div className="space-y-2">
                {templates.map((t) => {
                  const a = analytics[t.id]
                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        t.is_active
                          ? 'border-[#5B7C99] bg-[#5B7C99]/5'
                          : 'border-[#E5E7EB] hover:border-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-[14px] text-[#1A1A1A]">{t.name}</h3>
                            {t.is_active && (
                              <span className="px-2 py-0.5 bg-[#5B7C99] text-white text-[11px] rounded-full font-medium">Active</span>
                            )}
                            <span className="text-[11px] text-[#9CA3AF]">v{t.version}</span>
                          </div>
                          <p className="text-[12px] text-[#6B7280] mt-1">{t.description}</p>
                          {a && (
                            <p className="text-[11px] text-[#9CA3AF] mt-1">
                              {a.totalGenerations} gen · {Math.round(a.successRate * 100)}% success
                              {a.avgCostUsd != null ? ` · avg $${a.avgCostUsd.toFixed(3)}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditTemplate(t)}
                            className="px-2 py-1 border border-[#E5E7EB] text-[#6B7280] text-[11px] rounded font-medium hover:bg-[#F5F5F5]"
                          >
                            Edit
                          </button>
                          {!t.is_active && (
                            <>
                              <button
                                onClick={() => handleActivateTemplate(t.id)}
                                className="px-2 py-1 border border-[#5B7C99] text-[#5B7C99] text-[11px] rounded font-medium hover:bg-[#5B7C99]/10"
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(t.id, t.is_active)}
                                className="px-2 py-1 border border-[#E5E7EB] text-[#9CA3AF] text-[11px] rounded font-medium hover:bg-[#F5F5F5]"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Template Editor */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[16px] text-[#1A1A1A]">
                {editingTemplateId ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                onClick={handleResetToDefault}
                className="text-[13px] text-[#6B7280] hover:text-[#1A1A1A] underline"
              >
                Reset to Default
              </button>
            </div>

            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-[#F5F1ED] border border-[#8B7355] rounded-lg">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((e, i) => (
                    <li key={i} className="text-[12px] text-[#5C4A3A]">{e}</li>
                  ))}
                </ul>
              </div>
            )}

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
                onClick={() => void handleSaveTemplate()}
                disabled={isSaving}
                className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-lg font-medium text-[14px] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? 'Saving...' : editingTemplateId ? 'Update Template' : 'Save Template'}
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
              <h3 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Generated Prompt Preview</h3>
              <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E5E7EB]">
                <pre className="text-[12px] text-[#1A1A1A] whitespace-pre-wrap font-mono">
                  {previewPrompt}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Variables & Sample Data */}
        <div className="space-y-4">
          {/* Available Variables */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Required Variables</h3>
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
            <h3 className="font-semibold text-[16px] text-[#1A1A1A] mb-4">Sample Data for Preview</h3>
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
                  Editing an active template's text creates a new version. Activate it to make it live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
