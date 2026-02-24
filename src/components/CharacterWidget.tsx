import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SubscriptionTier, getStateNamesForTier } from '../../amplify/functions/soul-engine/animation-states';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface CharacterConfig {
  id: string;
  name: string;
  imageUrl: string;
  videoStates: Record<string, string>; // state name -> video URL
  dominantColor: string; // hex color
  capabilities: CapabilityManifest;
  subscriptionTier: SubscriptionTier;
  description?: string;
  createdAt?: string;
}

export interface CapabilityManifest {
  visual?: {
    rotate3D?: boolean;
    showImage?: boolean;
    playVideo?: boolean;
    animation?: boolean;
  };
  audio?: {
    voiceControl?: boolean;
    soundEffects?: boolean;
    ambientMusic?: boolean;
  };
  spatial?: {
    positionControl?: boolean;
    resizeControl?: boolean;
    minimizeOption?: boolean;
  };
}

export interface WidgetState {
  currentAnimation: string;
  isMinimized: boolean;
  positionState: PositionState;
  isVoiceActive: boolean;
  isLoaded: boolean;
  isPreloading: boolean;
  sentimentScore: number;
  confidenceScore: number;
  lastMessage?: string;
  lastMessageType?: 'user' | 'character';
}

export type PositionState = 'intimate' | 'balanced' | 'ambient';

export type AnimationState = 'idle' | 'thinking' | 'talking' | 'greeting' | 'happy' | 'confused' | 'listening' | 'farewell' | 'excited' | 'sad' | 'surprised' | 'error';

// ============================================================================
// CSS Custom Properties
// ============================================================================

const CSS_VARIABLES = {
  '--chat-width': '480px',
  '--chat-height': '640px',
  '--character-primary': '#5B7C99', // jeans blue default
  '--character-secondary': '#8B7355', // brown/tan default
  '--character-neutral': '#6B7280', // gray default
  '--character-bg': 'rgba(255, 255, 255, 0.98)',
  '--character-border': 'rgba(91, 124, 153, 0.1)', // 10% character color
  '--character-shadow': 'rgba(0, 0, 0, 0.05)',
  '--character-radius': '32px',
  '--character-transition': 'cubic-bezier(0.2, 0.9, 0.3, 1)',
} as const;

// ============================================================================
// Position State Configuration
// ============================================================================

const POSITION_CONFIG: Record<PositionState, { scale: number; width: string }> = {
  intimate: { scale: 1.0, width: '70%' },
  balanced: { scale: 0.8, width: '50%' },
  ambient: { scale: 0.4, width: '30%' },
};

const MOBILE_POSITION_CONFIG: Record<PositionState, { scale: number; width: string }> = {
  intimate: { scale: 1.0, width: '90%' },
  balanced: { scale: 0.8, width: '80%' },
  ambient: { scale: 0.6, width: '60%' },
};

// ============================================================================
// CharacterWidget Component
// ============================================================================

interface CharacterWidgetProps {
  config: CharacterConfig;
  onStateChange?: (state: WidgetState) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const CharacterWidget: React.FC<CharacterWidgetProps> = ({
  config,
  onStateChange,
  onError,
  className = '',
}) => {
  // ==========================================================================
  // State Management
  // ==========================================================================
  const [widgetState, setWidgetState] = useState<WidgetState>({
    currentAnimation: 'idle',
    isMinimized: false,
    positionState: 'balanced',
    isVoiceActive: false,
    isLoaded: false,
    isPreloading: true,
    sentimentScore: 0.5,
    confidenceScore: 0.8,
  });

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [videoElements, setVideoElements] = useState<Map<string, HTMLVideoElement>>(new Map());
  const [isMobile, setIsMobile] = useState(false);
  const [currentPositionConfig, setCurrentPositionConfig] = useState(POSITION_CONFIG.balanced);
  const [messages, setMessages] = useState<Array<{id: string; text: string; type: 'user' | 'character'; timestamp: Date}>>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);

  // ==========================================================================
  // Initialization
  // ==========================================================================
  useEffect(() => {
    // Initialize widget
    initializeWidget();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Update position config based on mobile state
    const config = isMobile ? MOBILE_POSITION_CONFIG : POSITION_CONFIG;
    setCurrentPositionConfig(config[widgetState.positionState]);
  }, [widgetState.positionState, isMobile]);

  useEffect(() => {
    // Load available states for subscription tier
    const states = getStateNamesForTier(config.subscriptionTier);
    setAvailableStates(states);
    
    // Preload videos
    preloadVideos(states);
  }, [config.subscriptionTier, config.videoStates]);

  useEffect(() => {
    // Notify parent of state changes
    onStateChange?.(widgetState);
  }, [widgetState, onStateChange]);

  // ==========================================================================
  // Core Functions
  // ==========================================================================
  const validateCapabilityManifest = useCallback((manifest: CapabilityManifest): boolean => {
    try {
      // Check if manifest is an object
      if (!manifest || typeof manifest !== 'object') {
        console.warn('Invalid capability manifest: not an object');
        return false;
      }

      // Validate visual capabilities
      if (manifest.visual) {
        const validVisualProps = ['rotate3D', 'showImage', 'playVideo', 'animation'];
        for (const prop in manifest.visual) {
          if (!validVisualProps.includes(prop)) {
            console.warn(`Invalid visual capability: ${prop}`);
            return false;
          }
          if (typeof manifest.visual[prop as keyof typeof manifest.visual] !== 'boolean') {
            console.warn(`Visual capability ${prop} must be boolean`);
            return false;
          }
        }
      }

      // Validate audio capabilities
      if (manifest.audio) {
        const validAudioProps = ['voiceControl', 'soundEffects', 'ambientMusic'];
        for (const prop in manifest.audio) {
          if (!validAudioProps.includes(prop)) {
            console.warn(`Invalid audio capability: ${prop}`);
            return false;
          }
          if (typeof manifest.audio[prop as keyof typeof manifest.audio] !== 'boolean') {
            console.warn(`Audio capability ${prop} must be boolean`);
            return false;
          }
        }
      }

      // Validate spatial capabilities
      if (manifest.spatial) {
        const validSpatialProps = ['positionControl', 'resizeControl', 'minimizeOption'];
        for (const prop in manifest.spatial) {
          if (!validSpatialProps.includes(prop)) {
            console.warn(`Invalid spatial capability: ${prop}`);
            return false;
          }
          if (typeof manifest.spatial[prop as keyof typeof manifest.spatial] !== 'boolean') {
            console.warn(`Spatial capability ${prop} must be boolean`);
            return false;
          }
        }
      }

      // Log capability manifest for debugging
      console.log('Valid capability manifest loaded:', manifest);
      return true;
    } catch (error) {
      console.error('Failed to validate capability manifest:', error);
      return false;
    }
  }, []);

  const initializeWidget = () => {
    try {
      // Validate capability manifest
      if (!validateCapabilityManifest(config.capabilities)) {
        console.warn('Using default capabilities due to invalid manifest');
        // Set default capabilities
        config.capabilities = {
          visual: { animation: true },
          spatial: { positionControl: true, minimizeOption: true },
        };
      }

      // Load position preference from localStorage
      const savedPosition = localStorage.getItem('character-widget-position') as PositionState;
      if (savedPosition && POSITION_CONFIG[savedPosition]) {
        setWidgetState(prev => ({ ...prev, positionState: savedPosition }));
      }

      // Set initial animation state
      setWidgetState(prev => ({ ...prev, isLoaded: true }));
    } catch (error) {
      console.error('Failed to initialize widget:', error);
      onError?.(error as Error);
    }
  };

  const extractDominantColor = useCallback(async (imageUrl: string): Promise<string> => {
    // If dominant color is already provided in config, use it
    if (config.dominantColor) {
      return config.dominantColor;
    }

    try {
      // Create a canvas to analyze the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '#5B7C99'; // Default jeans blue

      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple color extraction: get average color
          let r = 0, g = 0, b = 0;
          let count = 0;
          
          // Sample pixels (every 10th pixel for performance)
          for (let i = 0; i < data.length; i += 40) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          
          if (count > 0) {
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            
            // Convert to hex
            const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            resolve(hexColor);
          } else {
            resolve('#5B7C99'); // Default jeans blue
          }
        };
        
        img.onerror = () => {
          resolve('#5B7C99'); // Default on error
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.warn('Failed to extract dominant color:', error);
      return '#5B7C99'; // Default jeans blue
    }
  }, [config.dominantColor]);

  const applyCSSVariables = useCallback(async () => {
    if (!widgetRef.current) return;

    const element = widgetRef.current;
    
    // Extract or use dominant color
    const primaryColor = await extractDominantColor(config.imageUrl);
    
    // Apply all CSS variables
    Object.entries(CSS_VARIABLES).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });

    // Apply character-specific colors
    element.style.setProperty('--character-primary', primaryColor);
    element.style.setProperty('--character-secondary', '#8B7355'); // brown/tan
    element.style.setProperty('--character-neutral', '#6B7280'); // gray
    
    // Generate derived colors using color-mix with proper percentages
    element.style.setProperty('--character-bg', `color-mix(in srgb, ${primaryColor} 3%, white)`);
    element.style.setProperty('--character-border', `color-mix(in srgb, ${primaryColor} 10%, transparent)`);
    element.style.setProperty('--character-shadow', `color-mix(in srgb, ${primaryColor} 2%, transparent)`);
    
    // Message bubble colors
    element.style.setProperty('--user-message-bg', `color-mix(in srgb, ${primaryColor} 8%, white)`);
    element.style.setProperty('--character-message-border', `color-mix(in srgb, ${primaryColor} 8%, transparent)`);
    element.style.setProperty('--hover-border', `color-mix(in srgb, ${primaryColor} 30%, transparent)`);
    element.style.setProperty('--hover-shadow', `color-mix(in srgb, ${primaryColor} 20%, transparent)`);
    
    // Special needs dock colors
    element.style.setProperty('--dock-bg', `color-mix(in srgb, ${primaryColor} 5%, transparent)`);
    element.style.setProperty('--dock-hover-bg', `color-mix(in srgb, ${primaryColor} 15%, transparent)`);
    
    // Control colors
    element.style.setProperty('--control-bg', `color-mix(in srgb, ${primaryColor} 3%, transparent)`);
    element.style.setProperty('--control-hover-bg', `color-mix(in srgb, ${primaryColor} 15%, transparent)`);
    element.style.setProperty('--control-active-bg', `color-mix(in srgb, ${primaryColor} 25%, transparent)`);
    
    // Radial gradient background for character area
    element.style.setProperty('--character-radial-bg', 
      `radial-gradient(circle at center, color-mix(in srgb, ${primaryColor} 5%, transparent) 0%, transparent 70%)`);
    
    console.log('Applied character theme with primary color:', primaryColor);
  }, [config.imageUrl, extractDominantColor]);

  useEffect(() => {
    // Apply CSS custom properties when component mounts or config changes
    applyCSSVariables();
  }, [applyCSSVariables]);

  const preloadVideos = async (states: string[]) => {
    try {
      setWidgetState(prev => ({ ...prev, isPreloading: true }));

      const videoPool = new Map<string, HTMLVideoElement>();
      const preloadPromises: Promise<void>[] = [];
      
      for (const state of states) {
        const videoUrl = config.videoStates[state];
        if (!videoUrl) {
          console.warn(`No video URL found for state: ${state}`);
          continue;
        }

        const preloadPromise = new Promise<void>((resolve) => {
          const video = document.createElement('video');
          video.src = videoUrl;
          video.preload = 'auto';
          video.muted = true;
          video.loop = state === 'idle'; // Only idle loops continuously
          video.playsInline = true;
          
          // Set video attributes for better performance
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', '');
          
          // Handle video loading
          const handleLoaded = () => {
            videoPool.set(state, video);
            console.log(`Preloaded video for state: ${state}`);
            resolve();
          };
          
          const handleError = (_error: Event | string) => {
            console.warn(`Failed to preload video for state: ${state}`);
            // Create a fallback video element with error handling
            const fallbackVideo = document.createElement('video');
            fallbackVideo.muted = true;
            fallbackVideo.loop = state === 'idle';
            videoPool.set(state, fallbackVideo);
            resolve(); // Continue even if one video fails
          };
          
          video.onloadeddata = handleLoaded;
          video.oncanplaythrough = handleLoaded;
          video.onerror = handleError;
          
          // Start loading
          video.load();
          
          // Timeout for slow connections
          setTimeout(() => {
            if (!video.readyState) {
              console.warn(`Video preload timeout for state: ${state}`);
              handleError(new Event('timeout'));
            }
          }, 10000); // 10 second timeout
        });

        preloadPromises.push(preloadPromise);
      }

      // Wait for all videos to preload (or fail gracefully)
      await Promise.allSettled(preloadPromises);
      
      setVideoElements(videoPool);
      setWidgetState(prev => ({ ...prev, isPreloading: false }));
      
      // Log preload results
      const loadedCount = Array.from(videoPool.values()).filter(v => v.readyState > 0).length;
      console.log(`Video preloading complete: ${loadedCount}/${states.length} states loaded`);
      
    } catch (error) {
      console.error('Video preloading failed:', error);
      setWidgetState(prev => ({ ...prev, isPreloading: false }));
    }
  };

  // ==========================================================================
  // Animation State Management
  // ==========================================================================

  const [animationState, setAnimationState] = useState({
    current: 'idle',
    previous: 'idle',
    isTransitioning: false,
    priority: 0, // Higher priority states can interrupt lower priority ones
  });

  // State priority mapping (higher number = higher priority)
  const STATE_PRIORITY: Record<string, number> = {
    error: 100,      // Highest priority - errors should be shown immediately
    farewell: 90,     // Goodbye takes precedence
    greeting: 80,      // Greeting is important but not critical
    thinking: 70,     // Thinking state
    talking: 60,       // Talking state
    happy: 50,         // Emotional states
    confused: 50,
    excited: 50,
    sad: 50,
    surprised: 50,
    listening: 40,      // Listening state
    idle: 10,          // Default/fallback state
  };

  // State machine for animation transitions
  const stateMachine = useRef({
    currentState: 'idle',
    previousState: 'idle',
    isTransitioning: false,
    
    canTransition(from: string, to: string): boolean {
      // Define valid state transitions
      const validTransitions: Record<string, string[]> = {
        idle: ['thinking', 'talking', 'greeting', 'happy', 'confused', 'listening', 'farewell'],
        thinking: ['idle', 'talking', 'idle'],
        talking: ['idle', 'thinking', 'idle'],
        greeting: ['idle'],
        happy: ['idle'],
        confused: ['idle'],
        listening: ['idle', 'thinking', 'talking'],
        farewell: ['idle'],
      };
      
      return validTransitions[from]?.includes(to) ?? false;
    },
    
    transition(toState: string): boolean {
      if (this.canTransition(this.currentState, toState)) {
        this.previousState = this.currentState;
        this.currentState = toState;
        return true;
      }
      return false;
    }
  });

  const changeAnimationState = useCallback((newState: string, force: boolean = false) => {
    // Check if state is available for current tier
    if (!availableStates.includes(newState)) {
      console.warn(`State "${newState}" not available for tier "${config.subscriptionTier}". Falling back to idle.`);
      newState = 'idle';
    }

    // Check if we have a video for this state
    const videoUrl = config.videoStates[newState];
    if (!videoUrl) {
      console.warn(`No video URL for state "${newState}", falling back to idle`);
      newState = 'idle';
    }

    // Check priority - only interrupt if new state has higher priority
    const currentPriority = STATE_PRIORITY[animationState.current] || 0;
    const newPriority = STATE_PRIORITY[newState] || 0;
    
    if (newPriority < currentPriority && !force) {
      console.log(`Not interrupting ${animationState.current} (prio ${currentPriority}) with ${newState} (prio ${newPriority})`);
      return;
    }

    // Check if we can transition from current state
    if (!stateMachine.current.canTransition(animationState.current, newState) && !force) {
      console.warn(`Invalid state transition: ${animationState.current} -> ${newState}`);
      return;
    }

    // Stop current animation
    if (currentVideoRef.current) {
      currentVideoRef.current.pause();
      currentVideoRef.current = null;
    }

    // Play new animation if we have a video element for it
    const videoElement = videoElements.get(newState);
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play().catch(err => {
        console.error(`Failed to play video for state ${newState}:`, err);
        // Fallback to idle
        if (newState !== 'idle') {
          changeAnimationState('idle', true);
        }
      });
      currentVideoRef.current = videoElement;
    }

    // Update state
    setAnimationState(prev => ({
      current: newState,
      previous: prev.current,
      isTransitioning: true,
      priority: STATE_PRIORITY[newState] || 0
    }));

    // Handle one-time animations
    if (newState === 'greeting' || newState === 'farewell') {
      const videoDuration = 6000; // 6 seconds for video
      setTimeout(() => {
        if (animationState.current === newState) { // Only if we're still in this state
          changeAnimationState('idle', true);
        }
      }, videoDuration);
    }

    // Update widget state
    setWidgetState(prev => ({ ...prev, currentAnimation: newState }));
  }, [availableStates, config.videoStates, videoElements, animationState.current]);

  // State triggers for conversation context
  const triggerThinking = useCallback(() => {
    changeAnimationState('thinking');
  }, [changeAnimationState]);

  const triggerTalking = useCallback(() => {
    changeAnimationState('talking');
  }, [changeAnimationState]);

  const triggerListening = useCallback(() => {
    if (availableStates.includes('listening')) {
      changeAnimationState('listening');
    }
  }, [availableStates, changeAnimationState]);

  // Sentiment-based triggers
  const triggerHappy = useCallback(() => {
    if (availableStates.includes('happy')) {
      changeAnimationState('happy');
    }
  }, [availableStates, changeAnimationState]);

  // Update sentiment and confidence
  const updateSentiment = useCallback((score: number) => {
    setWidgetState(prev => ({ ...prev, sentimentScore: score }));
    
    // Trigger happy state for positive sentiment
    if (score > 0.7) {
      triggerHappy();
    }
  }, [triggerHappy]);

  // ==========================================================================
  // Position State Management
  // ==========================================================================
  const changePositionState = useCallback((newPosition: PositionState) => {
    setWidgetState(prev => ({ ...prev, positionState: newPosition }));
    
    // Save to localStorage
    try {
      localStorage.setItem('character-widget-position', newPosition);
    } catch (error) {
      console.warn('Failed to save position preference:', error);
    }
  }, []);

  const toggleMinimize = useCallback(() => {
    setWidgetState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  const toggleVoice = useCallback(() => {
    setWidgetState(prev => ({ ...prev, isVoiceActive: !prev.isVoiceActive }));
  }, []);

  // Chat functions
  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      type: 'user' as const,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Update widget state with last message
    setWidgetState(prev => ({ 
      ...prev, 
      lastMessage: inputText,
      lastMessageType: 'user'
    }));

    // Trigger listening state
    triggerListening();
    
    // Simulate AI response after delay
    setIsTyping(true);
    setTimeout(() => {
      // Add character response
      const characterMessage = {
        id: (Date.now() + 1).toString(),
        text: `I understand you said: "${inputText}". How can I help you further?`,
        type: 'character' as const,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, characterMessage]);
      setIsTyping(false);
      
      // Update widget state
      setWidgetState(prev => ({ 
        ...prev, 
        lastMessage: characterMessage.text,
        lastMessageType: 'character'
      }));

      // Trigger appropriate animation states
      triggerThinking();
      setTimeout(() => triggerTalking(), 500);
      setTimeout(() => {
        // Update sentiment based on message content
        const sentiment = Math.random(); // Simulated sentiment analysis
        updateSentiment(sentiment);
      }, 1000);
    }, 1500);
  }, [inputText, triggerListening, triggerThinking, triggerTalking, updateSentiment]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ==========================================================================
  // Render Functions
  // ==========================================================================
  const renderVideoPlayer = () => {
    const currentVideo = videoElements.get(widgetState.currentAnimation);
    
    if (!currentVideo && !widgetState.isPreloading) {
      return (
        <div className="character-image-fallback">
          <img 
            src={config.imageUrl} 
            alt={config.name}
            className="character-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 'var(--character-radius)',
              filter: widgetState.isMinimized ? 'saturate(0.5)' : 'none',
              transition: 'filter 400ms ease',
            }}
          />
        </div>
      );
    }

    return (
      <div 
        ref={videoContainerRef}
        className="character-video-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--character-radius)',
          background: widgetState.isPreloading 
            ? 'radial-gradient(circle at center, var(--character-bg) 0%, color-mix(in srgb, var(--character-primary) 5%, transparent) 100%)'
            : 'transparent',
        }}
      >
        {widgetState.isPreloading && (
          <div 
            className="video-loading-indicator"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--character-neutral)',
              fontSize: '14px',
              fontWeight: 400,
            }}
          >
            <div 
              className="loading-spinner"
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--character-border)',
                borderTop: '3px solid var(--character-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Preloading animation states...</span>
            <div 
              className="loading-progress"
              style={{
                width: '120px',
                height: '4px',
                backgroundColor: 'var(--character-border)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div 
                className="loading-progress-bar"
                style={{
                  width: '60%',
                  height: '100%',
                  backgroundColor: 'var(--character-primary)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}
        
        {/* Video elements are managed in the video pool */}
        <div className="video-pool-container" />
        
        {/* Fallback image if video fails */}
        {!widgetState.isPreloading && !currentVideo && (
          <div className="video-fallback">
            <img 
              src={config.imageUrl} 
              alt={config.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: widgetState.isMinimized ? 'saturate(0.5)' : 'none',
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderControls = () => {
    const controls = [
      { id: 'voice', icon: '🔊', label: 'Voice', action: toggleVoice, active: widgetState.isVoiceActive },
      { id: 'position', icon: '↔️', label: 'Position', action: () => {
        const positions: PositionState[] = ['intimate', 'balanced', 'ambient'];
        const currentIndex = positions.indexOf(widgetState.positionState);
        const nextIndex = (currentIndex + 1) % positions.length;
        changePositionState(positions[nextIndex]);
      }},
      { id: 'minimize', icon: widgetState.isMinimized ? '↗️' : '↙️', label: widgetState.isMinimized ? 'Expand' : 'Minimize', action: toggleMinimize },
      { id: 'close', icon: '✕', label: 'Close', action: () => console.log('Close widget') },
    ];

    return (
      <div 
        className="widget-controls"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          opacity: 0.3,
          transition: 'opacity 200ms var(--character-transition)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.3';
        }}
      >
        {controls.map(control => (
          <button
            key={control.id}
            className={`control-button ${control.active ? 'active' : ''}`}
            onClick={control.action}
            title={control.label}
            aria-label={control.label}
            style={{
              background: 'var(--control-bg, rgba(91, 124, 153, 0.03))',
              border: '1px solid var(--character-border, rgba(91, 124, 153, 0.1))',
              borderRadius: '20px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: 'var(--character-neutral, #6B7280)',
              fontSize: '14px',
              fontWeight: 400,
              transition: 'all 200ms var(--character-transition)',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--control-hover-bg, rgba(91, 124, 153, 0.15))';
              e.currentTarget.style.borderColor = 'var(--hover-border, rgba(91, 124, 153, 0.3))';
              e.currentTarget.style.boxShadow = '0 2px 8px var(--hover-shadow, rgba(91, 124, 153, 0.2))';
              e.currentTarget.style.color = 'var(--character-primary, #5B7C99)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--control-bg, rgba(91, 124, 153, 0.03))';
              e.currentTarget.style.borderColor = 'var(--character-border, rgba(91, 124, 153, 0.1))';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.color = 'var(--character-neutral, #6B7280)';
            }}
          >
            <span 
              className="control-icon"
              style={{
                fontSize: '16px',
                transition: 'transform 200ms var(--character-transition)',
              }}
            >
              {control.icon}
            </span>
            <span 
              className="control-label"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                opacity: 0,
                maxWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'all 200ms var(--character-transition)',
              }}
            >
              {control.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderSpecialNeedsDock = () => {
    const { capabilities } = config;
    const hasSpecialCapabilities = 
      capabilities.visual?.rotate3D || 
      capabilities.visual?.showImage || 
      capabilities.visual?.playVideo ||
      capabilities.audio?.soundEffects ||
      capabilities.audio?.ambientMusic;

    if (!hasSpecialCapabilities) return null;

    const specialControls = [
      { id: 'rotate3D', icon: '🔄', label: '3D Rotate', enabled: capabilities.visual?.rotate3D },
      { id: 'showImage', icon: '🖼️', label: 'Show Image', enabled: capabilities.visual?.showImage },
      { id: 'playVideo', icon: '🎬', label: 'Play Video', enabled: capabilities.visual?.playVideo },
      { id: 'soundEffects', icon: '🔊', label: 'Sound Effects', enabled: capabilities.audio?.soundEffects },
      { id: 'ambientMusic', icon: '🎵', label: 'Ambient Music', enabled: capabilities.audio?.ambientMusic },
    ].filter(control => control.enabled);

    return (
      <div 
        className="special-needs-dock"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
          gap: '8px',
          padding: '12px 16px',
          background: 'var(--dock-bg, rgba(91, 124, 153, 0.05))',
          backdropFilter: 'blur(8px)',
          borderRadius: '48px',
          border: '1px solid var(--character-border, rgba(91, 124, 153, 0.1))',
          boxShadow: '0 4px 16px var(--character-shadow, rgba(0, 0, 0, 0.05))',
          zIndex: 10,
          animation: 'dockRise 0.5s ease',
        }}
      >
        {specialControls.map(control => (
          <button
            key={control.id}
            className="special-control-button"
            title={control.label}
            aria-label={control.label}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '24px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: 'var(--character-neutral, #6B7280)',
              fontSize: '12px',
              fontWeight: 400,
              transition: 'all 200ms var(--character-transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dock-hover-bg, rgba(91, 124, 153, 0.15))';
              e.currentTarget.style.color = 'var(--character-primary, #5B7C99)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--character-neutral, #6B7280)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span 
              className="special-control-icon"
              style={{
                fontSize: '20px',
                transition: 'transform 200ms var(--character-transition)',
              }}
            >
              {control.icon}
            </span>
            <span 
              className="special-control-label"
              style={{
                fontSize: '11px',
                fontWeight: 500,
                opacity: 0.8,
              }}
            >
              {control.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderMessageBubble = (message: string, type: 'user' | 'character') => {
    return (
      <div 
        className={`message-bubble ${type}`}
        style={{
          maxWidth: '80%',
          marginBottom: '12px',
          alignSelf: type === 'user' ? 'flex-end' : 'flex-start',
          transition: 'all 300ms var(--character-transition)',
        }}
      >
        <div 
          className="message-content"
          style={{
            padding: '16px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            boxShadow: '0 2px 8px var(--character-shadow, rgba(0, 0, 0, 0.05))',
            transition: 'all 300ms var(--character-transition)',
            ...(type === 'user' ? {
              background: 'var(--user-message-bg, rgba(91, 124, 153, 0.08))',
              color: 'var(--character-primary, #5B7C99)',
              border: 'none',
            } : {
              background: 'white',
              color: '#1A1A1A',
              border: '1px solid var(--character-message-border, rgba(91, 124, 153, 0.08))',
            })
          }}
          onMouseEnter={(e) => {
            if (type === 'character') {
              e.currentTarget.style.borderColor = 'var(--hover-border, rgba(91, 124, 153, 0.3))';
              e.currentTarget.style.boxShadow = '0 4px 16px var(--hover-shadow, rgba(91, 124, 153, 0.2))';
            }
          }}
          onMouseLeave={(e) => {
            if (type === 'character') {
              e.currentTarget.style.borderColor = 'var(--character-message-border, rgba(91, 124, 153, 0.08))';
              e.currentTarget.style.boxShadow = '0 2px 8px var(--character-shadow, rgba(0, 0, 0, 0.05))';
            }
          }}
        >
          {message}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // Render Component
  // ==========================================================================
  return (
    <div
      ref={widgetRef}
      className={`character-widget ${className} ${widgetState.isMinimized ? 'minimized' : ''} ${widgetState.positionState}`}
      style={{
        width: 'var(--chat-width, 480px)',
        height: 'var(--chat-height, 640px)',
        maxWidth: '100%',
        maxHeight: '100vh',
        position: 'relative',
        backgroundColor: 'var(--character-bg, rgba(255, 255, 255, 0.98))',
        borderRadius: isMobile ? '24px' : 'var(--character-radius, 32px)',
        border: '1px solid var(--character-border, rgba(91, 124, 153, 0.1))',
        boxShadow: '0 4px 24px var(--character-shadow, rgba(0, 0, 0, 0.05))',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        transition: 'all 400ms var(--character-transition)',
        transform: `scale(${currentPositionConfig.scale})`,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Character Video/Image Area */}
      <div 
        className="character-area"
        style={{
          flex: widgetState.isMinimized ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: isMobile ? '24px' : 'var(--character-radius, 32px)',
          margin: widgetState.isMinimized ? '10%' : '5%',
          background: 'var(--character-radial-bg, radial-gradient(circle at center, rgba(91, 124, 153, 0.05) 0%, transparent 70%))',
          transition: 'all 400ms var(--character-transition)',
          transform: widgetState.isMinimized ? 'scale(0.4)' : 'scale(1)',
          filter: widgetState.isMinimized ? 'saturate(0.5)' : 'none',
        }}
      >
        {renderVideoPlayer()}
        
        {/* Invisible-until-hover Controls */}
        <div className="hover-controls">
          {renderControls()}
        </div>
      </div>

      {/* Chat Interface (not shown in minimized state) */}
      {!widgetState.isMinimized && (
        <div 
          className="chat-interface"
          style={{
            flex: 0.4,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px 20px',
            overflow: 'hidden',
          }}
        >
          {/* Messages Container */}
          <div 
            className="messages-container"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {messages.length === 0 ? (
              <div 
                className="welcome-message"
                style={{
                  textAlign: 'center',
                  color: 'var(--character-neutral, #6B7280)',
                  fontSize: '14px',
                  padding: '32px 16px',
                }}
              >
                <p style={{ marginBottom: '8px', fontWeight: 500 }}>Hello! I'm {config.name}</p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Send a message to start chatting</p>
              </div>
            ) : (
              messages.map(message => renderMessageBubble(message.text, message.type))
            )}
            
            {isTyping && (
              <div 
                className="typing-indicator"
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 16px',
                  background: 'white',
                  borderRadius: '24px',
                  border: '1px solid var(--character-message-border, rgba(91, 124, 153, 0.08))',
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <div 
                  className="typing-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--character-primary, #5B7C99)',
                    animation: 'typing 1.4s infinite',
                  }}
                />
                <div 
                  className="typing-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--character-primary, #5B7C99)',
                    animation: 'typing 1.4s infinite 0.2s',
                  }}
                />
                <div 
                  className="typing-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--character-primary, #5B7C99)',
                    animation: 'typing 1.4s infinite 0.4s',
                  }}
                />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div 
            className="input-area"
            style={{
              display: 'flex',
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--character-border, rgba(91, 124, 153, 0.1))',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${config.name}...`}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid var(--character-border, rgba(91, 124, 153, 0.1))',
                background: 'var(--character-bg, rgba(255, 255, 255, 0.98))',
                color: '#1A1A1A',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 200ms var(--character-transition)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--character-primary, #5B7C99)';
                e.target.style.boxShadow = '0 0 0 2px var(--character-border, rgba(91, 124, 153, 0.1))';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--character-border, rgba(91, 124, 153, 0.1))';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: '24px',
                border: 'none',
                background: 'var(--character-primary, #5B7C99)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                opacity: inputText.trim() ? 1 : 0.5,
                transition: 'all 200ms var(--character-transition)',
              }}
              onMouseEnter={(e) => {
                if (inputText.trim()) {
                  e.currentTarget.style.background = 'color-mix(in srgb, var(--character-primary, #5B7C99) 100%, black 10%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (inputText.trim()) {
                  e.currentTarget.style.background = 'var(--character-primary, #5B7C99)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Special Needs Dock */}
      {!widgetState.isMinimized && renderSpecialNeedsDock()}

      {/* Message Preview (in minimized state) */}
      {widgetState.isMinimized && widgetState.lastMessage && (
        <div 
          className="minimized-preview"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            animation: 'breathing 4s ease-in-out infinite',
          }}
        >
          {renderMessageBubble(widgetState.lastMessage, widgetState.lastMessageType || 'character')}
        </div>
      )}

      {/* Loading Indicator */}
      {widgetState.isPreloading && (
        <div className="global-loading">
          <div className="loading-content">
            <div className="loading-spinner" />
            <p>Loading character animations...</p>
          </div>
        </div>
      )}

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <div>State: {widgetState.currentAnimation}</div>
          <div>Position: {widgetState.positionState}</div>
          <div>Tier: {config.subscriptionTier}</div>
          <div>Available States: {availableStates.join(', ')}</div>
        </div>
      )}

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.005); }
        }
        
        @keyframes dockRise {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes waveform {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        
        .character-widget.minimized .character-area {
          animation: breathing 4s ease-in-out infinite;
        }
        
        .special-needs-dock {
          animation: dockRise 0.5s ease;
        }
        
        .control-button.active .control-icon {
          animation: waveform 1s ease-in-out infinite;
        }
        
        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: var(--character-border, rgba(91, 124, 153, 0.1));
          border-radius: 3px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: var(--character-primary, #5B7C99);
        }
      `}</style>
    </div>
  );
};

export default CharacterWidget;