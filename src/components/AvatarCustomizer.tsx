import { useState } from 'react'

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

const SKIN_TONES = [
  { name: 'Light', value: '#FDBCB4' },
  { name: 'Medium Light', value: '#F1C27D' },
  { name: 'Medium', value: '#E0AC69' },
  { name: 'Medium Dark', value: '#C68642' },
  { name: 'Dark', value: '#8D5524' },
]

const EYE_COLORS = [
  { name: 'Brown', value: '#8B4513' },
  { name: 'Blue', value: '#1E90FF' },
  { name: 'Green', value: '#228B22' },
  { name: 'Hazel', value: '#8B7355' },
  { name: 'Gray', value: '#808080' },
]

const HAIR_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Brown', value: '#4B3621' },
  { name: 'Blonde', value: '#F5DEB3' },
  { name: 'Red', value: '#8B4513' },
  { name: 'Gray', value: '#708090' },
  { name: 'White', value: '#F5F5F5' },
]

const BG_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Teal', value: '#14B8A6' },
]

export function AvatarCustomizer({ onAvatarChange }: { onAvatarChange: (config: AvatarConfig) => void }) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
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
  })

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    const newConfig = { ...avatarConfig, ...updates }
    setAvatarConfig(newConfig)
    onAvatarChange(newConfig)
  }

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{ backgroundColor: avatarConfig.backgroundColor }}
        >
          <div className="relative">
            {/* Face */}
            <div 
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center relative`}
              style={{ 
                backgroundColor: avatarConfig.skinTone,
                borderRadius: avatarConfig.faceShape === 'square' ? '20%' : 
                           avatarConfig.faceShape === 'heart' ? '50% 50% 45% 45%' : '50%'
              }}
            >
              {/* Eyes */}
              <div className="flex gap-3 mb-1">
                <div 
                  className={`w-3 h-3 rounded-full`}
                  style={{ 
                    backgroundColor: avatarConfig.eyeColor,
                    borderRadius: avatarConfig.eyeType === 'almond' ? '50% 30%' : '50%'
                  }}
                />
                <div 
                  className={`w-3 h-3 rounded-full`}
                  style={{ 
                    backgroundColor: avatarConfig.eyeColor,
                    borderRadius: avatarConfig.eyeType === 'almond' ? '50% 30%' : '50%'
                  }}
                />
              </div>
              
              {/* Eyebrows */}
              <div className="flex gap-3 mb-1">
                <div 
                  className={`h-0.5`}
                  style={{ 
                    backgroundColor: '#000000',
                    width: avatarConfig.eyebrowType === 'thick' ? '12px' : '8px',
                    height: avatarConfig.eyebrowType === 'thick' ? '2px' : '1px',
                  }}
                />
                <div 
                  className={`h-0.5`}
                  style={{ 
                    backgroundColor: '#000000',
                    width: avatarConfig.eyebrowType === 'thick' ? '12px' : '8px',
                    height: avatarConfig.eyebrowType === 'thick' ? '2px' : '1px',
                  }}
                />
              </div>

              {/* Nose */}
              <div 
                className={`mb-1`}
                style={{
                  width: '4px',
                  height: '6px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: avatarConfig.noseType === 'button' ? '50%' : '20%'
                }}
              />

              {/* Mouth */}
              <div 
                className="w-6 h-1"
                style={{ 
                  backgroundColor: '#000000',
                  borderRadius: avatarConfig.mouthType === 'smile' ? '50%' : '0%',
                  height: avatarConfig.mouthType === 'laugh' ? '2px' : '1px'
                }}
              />
            </div>

            {/* Hair */}
            {avatarConfig.hairStyle !== 'bald' && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  width: avatarConfig.hairStyle === 'long' ? '80px' : 
                         avatarConfig.hairStyle === 'medium' ? '70px' : '60px',
                  height: avatarConfig.hairStyle === 'long' ? '40px' : 
                         avatarConfig.hairStyle === 'medium' ? '30px' : '20px',
                  backgroundColor: avatarConfig.hairColor,
                  borderRadius: '50% 50% 20% 20%',
                  top: avatarConfig.hairStyle === 'long' ? '-15px' : 
                        avatarConfig.hairStyle === 'medium' ? '-10px' : '-5px'
                }}
              />
            )}

            {/* Accessories */}
            {avatarConfig.accessory === 'glasses' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="w-6 h-6 border-2 border-black rounded-full" />
                <div className="w-6 h-6 border-2 border-black rounded-full" />
              </div>
            )}
            {avatarConfig.accessory === 'sunglasses' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="w-6 h-6 bg-gray-800 rounded-full" />
                <div className="w-6 h-6 bg-gray-800 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Face Shape */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Face Shape</label>
          <select 
            value={avatarConfig.faceShape}
            onChange={(e) => updateConfig({ faceShape: e.target.value as AvatarConfig['faceShape'] })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="round">Round</option>
            <option value="oval">Oval</option>
            <option value="square">Square</option>
            <option value="heart">Heart</option>
          </select>
        </div>

        {/* Skin Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skin Tone</label>
          <div className="flex gap-2">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => updateConfig({ skinTone: tone.value })}
                className={`w-8 h-8 rounded-full border-2 ${
                  avatarConfig.skinTone === tone.value ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: tone.value }}
                title={tone.name}
              />
            ))}
          </div>
        </div>

        {/* Eye Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Eye Type</label>
          <select 
            value={avatarConfig.eyeType}
            onChange={(e) => updateConfig({ eyeType: e.target.value as AvatarConfig['eyeType'] })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="round">Round</option>
            <option value="almond">Almond</option>
            <option value="hooded">Hooded</option>
            <option value="upturned">Upturned</option>
          </select>
        </div>

        {/* Eye Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Eye Color</label>
          <div className="flex gap-2">
            {EYE_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateConfig({ eyeColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 ${
                  avatarConfig.eyeColor === color.value ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Hair Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hair Style</label>
          <select 
            value={avatarConfig.hairStyle}
            onChange={(e) => updateConfig({ hairStyle: e.target.value as AvatarConfig['hairStyle'] })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="bald">Bald</option>
            <option value="buzz">Buzz Cut</option>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        {/* Hair Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hair Color</label>
          <div className="flex gap-2">
            {HAIR_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateConfig({ hairColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 ${
                  avatarConfig.hairColor === color.value ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Accessory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accessory</label>
          <select 
            value={avatarConfig.accessory}
            onChange={(e) => updateConfig({ accessory: e.target.value as AvatarConfig['accessory'] })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="none">None</option>
            <option value="glasses">Glasses</option>
            <option value="sunglasses">Sunglasses</option>
            <option value="earrings">Earrings</option>
          </select>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <div className="flex gap-2">
            {BG_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateConfig({ backgroundColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 ${
                  avatarConfig.backgroundColor === color.value ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
