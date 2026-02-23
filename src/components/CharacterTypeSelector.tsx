import { useState } from 'react'
import { AvatarCustomizer } from './AvatarCustomizer'

interface AvatarConfig {
  faceShape: 'round' | 'oval' | 'square' | 'heart'
  skinTone: string
  eyeType: 'round' | 'almond' | 'hooded' | 'upturned'
  eyeColor: string
  eyebrowType: 'straight' | 'arched' | 'thick' | 'thin'
  noseType: 'button' | 'straight' | 'hooked' | 'rounded'
  mouthType: 'smile' | 'neutral' | 'laugh' | 'serious'
  hairStyle: 'short' | 'medium' | 'long' | 'bald' | 'buzz'
  hairColor: string
  accessory: 'none' | 'glasses' | 'sunglasses' | 'earrings'
  backgroundColor: string
}

const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  faceShape: 'round',
  skinTone: '#FDBCB4',
  eyeType: 'round',
  eyeColor: '#8B4513',
  eyebrowType: 'straight',
  noseType: 'button',
  mouthType: 'smile',
  hairStyle: 'short',
  hairColor: '#000000',
  accessory: 'none',
  backgroundColor: '#3B82F6',
}

type CharacterType = 'product-morphing' | 'head-only' | 'avatar'

interface CharacterTypeSelectorProps {
  onTypeSelect: (type: CharacterType, config?: AvatarConfig) => void
  selectedType?: CharacterType
}

function ProductMorphingIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  )
}

function HeadOnlyIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="6" />
      <path d="M12 14v8M8 22h8M16 6l4-4M20 2h-4" />
    </svg>
  )
}

function AvatarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M12 12v8M8 20h8M16 8l4-4M20 4h-4M8 8l-4-4M4 4h4" />
    </svg>
  )
}

export function CharacterTypeSelector({ onTypeSelect, selectedType }: CharacterTypeSelectorProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)

  const characterTypes = [
    {
      id: 'product-morphing' as CharacterType,
      title: 'Product Morphing',
      description: 'Transform your product into an animated character',
      icon: <ProductMorphingIcon />,
      details: 'AI morphs your product image into a living character'
    },
    {
      id: 'head-only' as CharacterType,
      title: 'Head Only',
      description: 'Create a sidekick-style character',
      icon: <HeadOnlyIcon />,
      details: 'Floating head character perfect for chat widgets'
    },
    {
      id: 'avatar' as CharacterType,
      title: 'Custom Avatar',
      description: 'Premium brand-ready character',
      icon: <AvatarIcon />,
      details: 'Professional illustrated avatar tailored to your brand'
    }
  ]

  const handleAvatarChange = (config: AvatarConfig) => {
    setAvatarConfig(config)
    onTypeSelect('avatar', config) // Keep parent in sync for generation
  }

  const handleTypeSelect = (type: CharacterType) => {
    if (type === 'avatar') {
      const config = avatarConfig ?? DEFAULT_AVATAR_CONFIG
      setAvatarConfig(config)
      onTypeSelect(type, config)
    } else {
      onTypeSelect(type)
    }
  }

  return (
    <div className="space-y-8">
      {/* Character Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Character Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {characterTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${
                  selectedType === type.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {type.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{type.details}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Customizer - Only show when avatar is selected */}
      {selectedType === 'avatar' && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Design Your Character</h3>
          <p className="text-sm text-slate-600 mb-4">Create a professional, brand-ready avatar for your e-commerce assistant.</p>
          <AvatarCustomizer onAvatarChange={handleAvatarChange} />
          
          <div className="mt-6 p-4 bg-slate-100/80 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Professional output:</strong> Your avatar will be generated as a polished, high-fidelity illustration suitable for corporate and retail use.
            </p>
          </div>
        </div>
      )}

      {/* Product Morphing Info */}
      {selectedType === 'product-morphing' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Morphing Details</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">AI-Powered Transformation</h4>
                <p className="text-sm text-gray-600">Our AI analyzes your product and creates an animated character that maintains brand recognition</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Multiple Variations</h4>
                <p className="text-sm text-gray-600">Get 3 different character styles to choose from</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Head Only Info */}
      {selectedType === 'head-only' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Head-Only Character Details</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sidekick Style</h4>
                <p className="text-sm text-gray-600">Perfect floating head character for chat widgets and assistants</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Minimal Distraction</h4>
                <p className="text-sm text-gray-600">Focus on conversation without full body animations</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
