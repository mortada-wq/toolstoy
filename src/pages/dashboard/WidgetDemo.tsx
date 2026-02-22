import React, { useState } from 'react';
import CharacterWidget, { CharacterConfig } from '../../components/CharacterWidget';
import { SubscriptionTier } from '../../amplify/functions/soul-engine/animation-states';

const WidgetDemo: React.FC = () => {
  const [widgetState, setWidgetState] = useState<any>(null);

  // Demo character configuration
  const demoCharacter: CharacterConfig = {
    id: 'demo-char-1',
    name: 'Alex the Expert',
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
    videoStates: {
      idle: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thinking: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      talking: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      greeting: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      happy: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      confused: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      listening: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      farewell: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    },
    dominantColor: '#5B7C99', // jeans blue
    capabilities: {
      visual: {
        rotate3D: true,
        showImage: true,
        playVideo: true,
        animation: true,
      },
      audio: {
        voiceControl: true,
        soundEffects: true,
        ambientMusic: false,
      },
      spatial: {
        positionControl: true,
        resizeControl: true,
        minimizeOption: true,
      },
    },
    subscriptionTier: SubscriptionTier.ENTERPRISE,
    description: 'A demo character showing all widget features',
    createdAt: new Date().toISOString(),
  };

  const proCharacter: CharacterConfig = {
    ...demoCharacter,
    id: 'demo-char-2',
    name: 'Pro Character',
    subscriptionTier: SubscriptionTier.PRO,
    capabilities: {
      visual: {
        animation: true,
        showImage: true,
      },
      spatial: {
        positionControl: true,
        minimizeOption: true,
      },
    },
  };

  const freeCharacter: CharacterConfig = {
    ...demoCharacter,
    id: 'demo-char-3',
    name: 'Free Character',
    subscriptionTier: SubscriptionTier.FREE,
    capabilities: {
      visual: {
        animation: true,
      },
    },
  };

  const characters = [demoCharacter, proCharacter, freeCharacter];
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConfig>(demoCharacter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Character Widget Demo</h1>
          <p className="text-gray-600 mt-2">
            Interactive demo of the CharacterWidget component with multi-state animations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Widget Preview</h2>
              <div className="flex justify-center items-center min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                <CharacterWidget
                  config={selectedCharacter}
                  onStateChange={setWidgetState}
                  onError={(error) => console.error('Widget error:', error)}
                  className="shadow-2xl"
                />
              </div>
            </div>

            {/* Widget State Info */}
            {widgetState && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Widget State</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(widgetState).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{key}</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Character Selection</h2>
              <div className="space-y-3">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedCharacter.id === char.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {char.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{char.name}</div>
                        <div className="text-sm text-gray-500">{char.subscriptionTier} Tier</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Character Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Character</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{selectedCharacter.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tier</div>
                  <div className="font-medium text-gray-900">{selectedCharacter.subscriptionTier}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Capabilities</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCharacter.capabilities.visual && Object.entries(selectedCharacter.capabilities.visual)
                      .filter(([_, enabled]) => enabled)
                      .map(([capability]) => (
                        <span key={capability} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {capability}
                        </span>
                      ))}
                    {selectedCharacter.capabilities.audio && Object.entries(selectedCharacter.capabilities.audio)
                      .filter(([_, enabled]) => enabled)
                      .map(([capability]) => (
                        <span key={capability} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {capability}
                        </span>
                      ))}
                    {selectedCharacter.capabilities.spatial && Object.entries(selectedCharacter.capabilities.spatial)
                      .filter(([_, enabled]) => enabled)
                      .map(([capability]) => (
                        <span key={capability} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {capability}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Widget Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Widget Features</h2>
              <ul className="space-y-3">
                {[
                  'Multi-state video animations',
                  'Character color theming',
                  'Three position states',
                  'Minimalist chat interface',
                  'Special Needs Dock',
                  'Invisible-until-hover controls',
                  'Smooth transitions',
                  'Responsive design',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="text-lg font-medium text-gray-900">1. Chat with Character</div>
              <p className="text-gray-600">
                Type a message in the chat input to see the character respond with animation states.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-lg font-medium text-gray-900">2. Try Controls</div>
              <p className="text-gray-600">
                Hover over the character area to see invisible controls. Try position, minimize, and voice toggles.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-lg font-medium text-gray-900">3. Switch Characters</div>
              <p className="text-gray-600">
                Select different characters to see how capabilities and subscription tiers affect the widget.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetDemo;