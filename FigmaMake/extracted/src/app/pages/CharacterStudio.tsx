import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Upload, ArrowRight, Sparkles, MessageSquare, Brain, Rocket, CheckCircle, Copy } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

const STEPS = [
  { number: 0, label: 'Choose', icon: Sparkles },
  { number: 1, label: 'Product', icon: Upload },
  { number: 2, label: 'Personality', icon: Brain },
  { number: 3, label: 'Voice', icon: MessageSquare },
  { number: 4, label: 'Knowledge', icon: Brain },
  { number: 5, label: 'Launch', icon: Rocket },
];

export function CharacterStudio() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    characterType: '',
    productImage: null as File | null,
    personalityType: '',
    vibeTags: [] as string[],
    characterName: '',
    signaturePhrase: '',
    openingLine: '',
    seriousness: 50,
    formality: 50,
    enthusiasm: 50,
    productUrl: '',
    qaPairs: [] as Array<{ question: string; answer: string }>,
    selectedVariation: 0,
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      // Launch - start generation
      setIsGenerating(true);
      // Simulate generation
      setTimeout(() => {
        setIsGenerating(false);
        setIsComplete(true);
      }, 5000);
    }
  };

  const StepIndicator = () => (
    <div className="mb-12">
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#FF8C00] ring-4 ring-[#FF8C00]/20' 
                      : isCompleted
                      ? 'bg-[#DAA520]'
                      : 'bg-[#2A343C] border-2 border-[#B8860B]/30'
                  }`}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-[#F5F5DC]" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#F5F5DC]' : 'text-[#FFDAB9]/40'}`} />
                  )}
                </motion.div>
                <span className={`text-xs mt-2 ${isActive ? 'text-[#FF8C00]' : 'text-[#FFDAB9]/60'}`}>
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="relative w-16 lg:w-24 h-[2px] mx-2 mb-6">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: isCompleted 
                        ? 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)' 
                        : 'rgba(184, 134, 11, 0.2)',
                      backgroundSize: isCompleted ? '200% 100%' : '100% 100%',
                      animation: isCompleted ? 'gradientFlow 3s ease infinite' : 'none',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  if (isGenerating) {
    return <GeneratingState />;
  }

  if (isComplete) {
    return <CompleteState formData={formData} updateFormData={updateFormData} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      <StepIndicator />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && <Step0Choose formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {currentStep === 1 && <Step1Product formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {currentStep === 2 && <Step2Personality formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {currentStep === 3 && <Step3Voice formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {currentStep === 4 && <Step4Knowledge formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {currentStep === 5 && <Step5Launch formData={formData} onNext={handleNext} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Step 0: Choose Type
function Step0Choose({ formData, updateFormData, onNext }: any) {
  const types = [
    {
      id: 'alive',
      title: "It's Alive!",
      subtitle: 'Product Morphing Character',
      description: 'Your product literally comes to life with animated features and personality.',
      example: 'e.g., Sneaker with expressive laces',
    },
    {
      id: 'talking-head',
      title: 'The Talking Head',
      subtitle: 'Expert Guide',
      description: 'A professional avatar that embodies your product expertise.',
      example: 'e.g., Tech expert for gadgets',
    },
    {
      id: 'big-shot',
      title: 'The Big Shot',
      subtitle: 'Celebrity Persona',
      description: 'A charismatic character that makes your product irresistible.',
      example: 'e.g., Fashion guru for apparel',
    },
    {
      id: 'walking-wardrobe',
      title: 'The Walking Wardrobe',
      subtitle: 'Fashion Consultant',
      description: 'A style expert who knows everything about fashion and fit.',
      example: 'e.g., Personal stylist character',
    },
    {
      id: 'best-seller',
      title: 'The Best Seller',
      subtitle: 'Sales Assistant',
      description: 'An enthusiastic helper focused on converting customers.',
      example: 'e.g., Energetic sales character',
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#F5F5DC] mb-3 text-center">
        What kind of character do you want to create?
      </h2>
      <p className="text-[#FFDAB9]/70 text-center mb-8">
        Choose the style that best fits your product and audience
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {types.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => updateFormData({ characterType: type.id })}
            whileHover={{ scale: 1.02 }}
            className={`relative text-left p-6 rounded-xl border-2 transition-all ${
              formData.characterType === type.id
                ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                : 'border-[#B8860B]/30 bg-[#2A343C] hover:border-[#DAA520]/50'
            }`}
          >
            {/* Gradient stroke accent */}
            {formData.characterType === type.id && (
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                style={{
                  background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
                }}
              />
            )}

            {/* Video/placeholder area */}
            <div className="h-32 bg-[#1E262E] rounded-lg mb-4 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-[#FF8C00]/30" />
            </div>

            <h3 className="text-[#F5F5DC] font-bold text-lg mb-1">{type.title}</h3>
            <p className="text-[#FF8C00] text-sm font-medium mb-2">{type.subtitle}</p>
            <p className="text-[#FFDAB9]/70 text-sm mb-2">{type.description}</p>
            <p className="text-[#6A6A6A] text-xs">{type.example}</p>

            {/* Selection indicator */}
            {formData.characterType === type.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF8C00] rounded-full flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-[#F5F5DC]" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!formData.characterType}
        className="w-full py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] disabled:bg-[#6A6A6A] disabled:cursor-not-allowed text-[#F5F5DC] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
      >
        Next: Upload Product
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Step 1: Product Upload
function Step1Product({ formData, updateFormData, onNext }: any) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateFormData({ productImage: e.target.files[0] });
    }
  };

  return (
    <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-8">
      {/* Gradient accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{
          background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
        }}
      />

      <h2 className="text-2xl font-bold text-[#F5F5DC] mb-2">Your product or tool</h2>
      <p className="text-[#FFDAB9]/70 mb-6">Upload a clear image of your product</p>

      <label className="block">
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          formData.productImage 
            ? 'border-[#DAA520] bg-[#DAA520]/5' 
            : 'border-[#B8860B]/40 hover:border-[#DAA520] hover:bg-[#DAA520]/5'
        }`}>
          {formData.productImage ? (
            <div>
              <CheckCircle className="w-12 h-12 text-[#DAA520] mx-auto mb-3" />
              <p className="text-[#F5F5DC] font-medium">{formData.productImage.name}</p>
              <button 
                onClick={(e) => { e.preventDefault(); updateFormData({ productImage: null }); }}
                className="text-[#CD5C5C] text-sm mt-2 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-[#FF8C00] mx-auto mb-3" />
              <p className="text-[#F5F5DC] font-medium mb-1">Drop your product image here</p>
              <p className="text-[#FFDAB9]/60 text-sm">or click to browse</p>
              <p className="text-[#6A6A6A] text-xs mt-2">JPG or PNG, max 10MB</p>
            </>
          )}
        </div>
      </label>

      <button
        onClick={onNext}
        disabled={!formData.productImage}
        className="w-full mt-8 py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] disabled:bg-[#6A6A6A] disabled:cursor-not-allowed text-[#F5F5DC] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
      >
        Next: Personality
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Step 2: Personality
function Step2Personality({ formData, updateFormData, onNext }: any) {
  const personalities = [
    { id: 'expert', icon: '🎓', title: 'Expert', description: 'Knowledgeable and authoritative' },
    { id: 'entertainer', icon: '🎭', title: 'Entertainer', description: 'Fun and engaging' },
    { id: 'advisor', icon: '💼', title: 'Advisor', description: 'Helpful and trustworthy' },
    { id: 'enthusiast', icon: '⭐', title: 'Enthusiast', description: 'Passionate and energetic' },
  ];

  const vibeTags = [
    'Trustworthy', 'Playful', 'Premium', 'No-nonsense', 
    'Technical', 'Warm', 'Witty', 'Straight-talking',
  ];

  const toggleVibeTag = (tag: string) => {
    const current = formData.vibeTags || [];
    if (current.includes(tag)) {
      updateFormData({ vibeTags: current.filter((t: string) => t !== tag) });
    } else {
      updateFormData({ vibeTags: [...current, tag] });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#F5F5DC] mb-2">Character Personality</h2>
      <p className="text-[#FFDAB9]/70 mb-8">Define how your character thinks and acts</p>

      {/* Personality Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {personalities.map((type) => (
          <button
            key={type.id}
            onClick={() => updateFormData({ personalityType: type.id })}
            className={`p-4 rounded-xl border transition-all text-center ${
              formData.personalityType === type.id
                ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                : 'border-[#B8860B]/30 bg-[#2A343C] hover:border-[#DAA520]/50'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <h4 className="text-[#F5F5DC] font-semibold text-sm mb-1">{type.title}</h4>
            <p className="text-[#FFDAB9]/60 text-xs">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Vibe Tags */}
      <h3 className="text-[#F5F5DC] font-semibold mb-3">Choose vibe tags</h3>
      <div className="flex flex-wrap gap-3 mb-8">
        {vibeTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleVibeTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              formData.vibeTags?.includes(tag)
                ? 'bg-gradient-to-r from-[#FF8C00] to-[#B8860B] text-[#F5F5DC]'
                : 'bg-[#2A343C] text-[#FFDAB9]/70 border border-[#B8860B]/30 hover:border-[#DAA520]/50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!formData.personalityType}
        className="w-full py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] disabled:bg-[#6A6A6A] disabled:cursor-not-allowed text-[#F5F5DC] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
      >
        Next: Voice
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Step 3: Voice
function Step3Voice({ formData, updateFormData, onNext }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#F5F5DC] mb-2">Name and voice your character</h2>
      <p className="text-[#FFDAB9]/70 mb-8">Give your character a unique identity</p>

      <div className="space-y-6 mb-8">
        {/* Inputs */}
        <div>
          <label className="block text-[#F5F5DC] text-sm font-medium mb-2">Character Name</label>
          <input
            type="text"
            value={formData.characterName}
            onChange={(e) => updateFormData({ characterName: e.target.value })}
            placeholder="e.g., Nike Max Helper"
            className="w-full px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#F5F5DC] text-sm font-medium mb-2">Signature Phrase</label>
          <input
            type="text"
            value={formData.signaturePhrase}
            onChange={(e) => updateFormData({ signaturePhrase: e.target.value })}
            placeholder="e.g., Let's find your perfect fit!"
            className="w-full px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#F5F5DC] text-sm font-medium mb-2">Opening Line</label>
          <input
            type="text"
            value={formData.openingLine}
            onChange={(e) => updateFormData({ openingLine: e.target.value })}
            placeholder="e.g., Hey there! Ready to step up your sneaker game?"
            className="w-full px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
          />
        </div>

        {/* Sliders */}
        <div className="space-y-6 pt-4">
          <SliderControl
            label="Tone"
            leftLabel="Serious"
            rightLabel="Playful"
            value={formData.seriousness}
            onChange={(val) => updateFormData({ seriousness: val })}
          />
          <SliderControl
            label="Style"
            leftLabel="Formal"
            rightLabel="Casual"
            value={formData.formality}
            onChange={(val) => updateFormData({ formality: val })}
          />
          <SliderControl
            label="Energy"
            leftLabel="Reserved"
            rightLabel="Enthusiastic"
            value={formData.enthusiasm}
            onChange={(val) => updateFormData({ enthusiasm: val })}
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.characterName}
        className="w-full py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] disabled:bg-[#6A6A6A] disabled:cursor-not-allowed text-[#F5F5DC] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
      >
        Next: Knowledge Base
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function SliderControl({ label, leftLabel, rightLabel, value, onChange }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-[#F5F5DC] font-medium">{label}</span>
        <span className="text-[#FFDAB9]/60">{value}%</span>
      </div>
      <Slider.Root
        className="relative flex items-center w-full h-5"
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={100}
        step={1}
      >
        <Slider.Track className="relative bg-[#2A343C] rounded-full h-2 flex-grow">
          <Slider.Range className="absolute bg-gradient-to-r from-[#DAA520] to-[#FF8C00] rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 bg-[#FF8C00] rounded-full hover:bg-[#B7410E] focus:outline-none focus:ring-4 focus:ring-[#FF8C00]/20 transition-colors" />
      </Slider.Root>
      <div className="flex justify-between text-xs text-[#6A6A6A] mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// Step 4: Knowledge
function Step4Knowledge({ formData, updateFormData, onNext }: any) {
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  const addQAPair = () => {
    if (newQ && newA) {
      updateFormData({ 
        qaPairs: [...(formData.qaPairs || []), { question: newQ, answer: newA }] 
      });
      setNewQ('');
      setNewA('');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#F5F5DC] mb-2">Build your character's knowledge base</h2>
      <p className="text-[#FFDAB9]/70 mb-8">Teach your character about your product</p>

      {/* Product URL */}
      <div className="mb-6">
        <label className="block text-[#F5F5DC] text-sm font-medium mb-2">Product Page URL (optional)</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.productUrl}
            onChange={(e) => updateFormData({ productUrl: e.target.value })}
            placeholder="https://yourstore.com/product"
            className="flex-1 px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
          />
          <button className="px-6 py-3 bg-[#DAA520] hover:bg-[#B8860B] text-[#F5F5DC] font-medium rounded-lg transition-colors">
            Generate Q&A
          </button>
        </div>
      </div>

      {/* Q&A List */}
      {formData.qaPairs && formData.qaPairs.length > 0 && (
        <div className="space-y-3 mb-6">
          {formData.qaPairs.map((pair: any, index: number) => (
            <div key={index} className="bg-[#2A343C] border border-[#B8860B]/30 rounded-lg p-4">
              <p className="text-[#F5F5DC] font-medium text-sm mb-1">{pair.question}</p>
              <p className="text-[#FFDAB9]/70 text-sm">{pair.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Q&A */}
      <div className="border-2 border-dashed border-[#B8860B]/40 rounded-xl p-6 mb-8">
        <h3 className="text-[#F5F5DC] font-semibold mb-4">Add custom Q&A pair</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="Question"
            className="w-full px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
          />
          <textarea
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            placeholder="Answer"
            rows={3}
            className="w-full px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors resize-none"
          />
          <button 
            onClick={addQAPair}
            className="px-4 py-2 bg-[#2A343C] hover:bg-[#1E262E] text-[#FF8C00] font-medium rounded-lg transition-colors border border-[#B8860B]/30"
          >
            + Add Pair
          </button>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
      >
        Next: Launch
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Step 5: Launch Summary
function Step5Launch({ formData, onNext }: any) {
  return (
    <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-8">
      {/* Gradient accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{
          background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
        }}
      />

      <h2 className="text-2xl font-bold text-[#F5F5DC] mb-6 text-center">Ready to launch!</h2>

      {/* Summary */}
      <div className="space-y-4 mb-6">
        <SummaryItem label="Character Type" value={formData.characterType || 'Not set'} />
        <SummaryItem label="Character Name" value={formData.characterName || 'Not set'} />
        <SummaryItem label="Personality" value={formData.personalityType || 'Not set'} />
        <SummaryItem label="Vibe Tags" value={formData.vibeTags?.join(', ') || 'None'} />
      </div>

      {/* Info Box */}
      <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-lg p-4 mb-8">
        <p className="text-[#FFDAB9] text-sm">
          <strong className="text-[#FF8C00]">Amazon Bedrock</strong> will generate:
        </p>
        <ul className="text-[#FFDAB9]/70 text-sm mt-2 space-y-1 ml-4">
          <li>• 3 character variations</li>
          <li>• Complete personality profile</li>
          <li>• Animation states (idle, thinking, talking)</li>
          <li>• Embeddable widget code</li>
        </ul>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
      >
        <Rocket className="w-5 h-5" />
        Generate My Character
      </button>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#B8860B]/20">
      <span className="text-[#FFDAB9]/60 text-sm">{label}</span>
      <span className="text-[#F5F5DC] text-sm font-medium">{value}</span>
    </div>
  );
}

// Generating State
function GeneratingState() {
  const steps = [
    'Analyzing image...',
    'Building soul...',
    'Generating variations...',
    'Creating animations...',
  ];

  return (
    <div className="max-w-2xl mx-auto p-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-3xl font-bold text-[#F5F5DC] mb-3">
          Toolstizer is cooking your character...
        </h2>
        <p className="text-[#FFDAB9]/70 mb-12">This usually takes 2-3 minutes</p>

        {/* Central Orb */}
        <div className="relative w-48 h-48 mx-auto mb-12">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF8C00] via-[#DAA520] to-[#B8860B] opacity-30 blur-xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-8 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center"
          >
            <Sparkles className="w-16 h-16 text-[#F5F5DC]" />
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5 }}
              className="flex items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#FF8C00] border-t-transparent rounded-full"
              />
              <span className="text-[#FFDAB9] text-sm">{step}</span>
            </motion.div>
          ))}
        </div>

        <p className="text-[#6A6A6A] text-sm mt-8">
          <a href="/dashboard" className="text-[#FF8C00] hover:underline">Back to Dashboard</a>
        </p>
      </motion.div>
    </div>
  );
}

// Complete State
function CompleteState({ formData, updateFormData }: any) {
  const variations = [
    { id: 0, name: 'Variation 1', thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
    { id: 1, name: 'Variation 2', thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
    { id: 2, name: 'Variation 3', thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
  ];

  const animationStates = ['Idle', 'Thinking', 'Talking', 'Excited', 'Confused'];

  return (
    <div className="max-w-3xl mx-auto p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-[#F5F5DC]" />
        </motion.div>
        <h2 className="text-3xl font-bold text-[#F5F5DC] mb-2">Your character is ready!</h2>
        <p className="text-[#FFDAB9]/70">Choose your favorite variation and deploy</p>
      </motion.div>

      {/* Variations */}
      <div className="mb-8">
        <h3 className="text-[#F5F5DC] font-semibold mb-4">Select Variation</h3>
        <div className="grid grid-cols-3 gap-4">
          {variations.map((variation) => (
            <button
              key={variation.id}
              onClick={() => updateFormData({ selectedVariation: variation.id })}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                formData.selectedVariation === variation.id
                  ? 'border-[#FF8C00]'
                  : 'border-[#B8860B]/30 hover:border-[#DAA520]/50'
              }`}
            >
              <img src={variation.thumb} alt={variation.name} className="w-full aspect-square object-cover" />
              {formData.selectedVariation === variation.id && (
                <div className="absolute inset-0 bg-[#FF8C00]/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#FF8C00] flex items-center justify-center">
                    <Check className="w-6 h-6 text-[#F5F5DC]" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Animation States */}
      <div className="mb-8">
        <h3 className="text-[#F5F5DC] font-semibold mb-4">Animation States</h3>
        <div className="flex flex-wrap gap-2">
          {animationStates.map((state) => (
            <span 
              key={state}
              className="px-4 py-2 bg-[#2A343C] border border-[#B8860B]/30 rounded-full text-[#FFDAB9] text-sm"
            >
              {state}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 px-6 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all">
          View Widget Demo
        </button>
        <button className="flex-1 py-4 px-6 bg-[#2A343C] hover:bg-[#DAA520]/20 text-[#DAA520] font-semibold rounded-full transition-all border border-[#B8860B]/30 flex items-center justify-center gap-2">
          <Copy className="w-5 h-5" />
          Copy Embed Code
        </button>
      </div>
    </div>
  );
}
