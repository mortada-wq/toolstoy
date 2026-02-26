import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Save, X, Upload, Trash2 } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

export function EditCharacter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: 'Nike Air Max Guide',
    product: 'Nike Air Max 97',
    personalityType: 'expert',
    vibeTags: ['Trustworthy', 'Technical', 'Warm'],
    signaturePhrase: "Let's find your perfect fit!",
    openingLine: 'Hey there! Ready to step up your sneaker game?',
    seriousness: 40,
    formality: 35,
    enthusiasm: 70,
    qaPairs: [
      { question: 'What sizes are available?', answer: 'We have sizes 6-13 in stock.' },
      { question: 'Is this true to size?', answer: 'Yes, these fit true to size.' },
    ],
  });

  const vibeTags = [
    'Trustworthy', 'Playful', 'Premium', 'No-nonsense',
    'Technical', 'Warm', 'Witty', 'Straight-talking',
  ];

  const toggleVibeTag = (tag: string) => {
    if (formData.vibeTags.includes(tag)) {
      setFormData({ ...formData, vibeTags: formData.vibeTags.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, vibeTags: [...formData.vibeTags, tag] });
    }
  };

  const handleSave = () => {
    // Save logic here
    navigate('/dashboard/characters');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5DC] mb-2">Edit Character</h1>
          <p className="text-[#FFDAB9]/70">Modify your character's settings</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/characters')}
          className="text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="space-y-4">
            <InputField
              label="Character Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
            />
            <InputField
              label="Product Name"
              value={formData.product}
              onChange={(value) => setFormData({ ...formData, product: value })}
            />
          </div>
        </Section>

        <SectionDivider />

        {/* Personality */}
        <Section title="Personality">
          <div className="mb-4">
            <label className="block text-[#F5F5DC] text-sm font-medium mb-3">Vibe Tags</label>
            <div className="flex flex-wrap gap-3">
              {vibeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleVibeTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.vibeTags.includes(tag)
                      ? 'bg-gradient-to-r from-[#FF8C00] to-[#B8860B] text-[#F5F5DC]'
                      : 'bg-[#2A343C] text-[#FFDAB9]/70 border border-[#B8860B]/30 hover:border-[#DAA520]/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <SectionDivider />

        {/* Voice */}
        <Section title="Voice & Tone">
          <div className="space-y-4 mb-6">
            <InputField
              label="Signature Phrase"
              value={formData.signaturePhrase}
              onChange={(value) => setFormData({ ...formData, signaturePhrase: value })}
            />
            <InputField
              label="Opening Line"
              value={formData.openingLine}
              onChange={(value) => setFormData({ ...formData, openingLine: value })}
            />
          </div>

          <div className="space-y-6">
            <SliderControl
              label="Tone"
              leftLabel="Serious"
              rightLabel="Playful"
              value={formData.seriousness}
              onChange={(val) => setFormData({ ...formData, seriousness: val })}
            />
            <SliderControl
              label="Style"
              leftLabel="Formal"
              rightLabel="Casual"
              value={formData.formality}
              onChange={(val) => setFormData({ ...formData, formality: val })}
            />
            <SliderControl
              label="Energy"
              leftLabel="Reserved"
              rightLabel="Enthusiastic"
              value={formData.enthusiasm}
              onChange={(val) => setFormData({ ...formData, enthusiasm: val })}
            />
          </div>
        </Section>

        <SectionDivider />

        {/* Knowledge Base */}
        <Section title="Knowledge Base">
          <div className="space-y-3 mb-4">
            {formData.qaPairs.map((pair, index) => (
              <div key={index} className="bg-[#2A343C] border border-[#B8860B]/30 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[#F5F5DC] font-medium text-sm mb-1">{pair.question}</p>
                    <p className="text-[#FFDAB9]/70 text-sm">{pair.answer}</p>
                  </div>
                  <button className="text-[#CD5C5C] hover:text-[#CD5C5C]/70 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 border-2 border-dashed border-[#B8860B]/40 rounded-lg text-[#FF8C00] hover:border-[#FF8C00] hover:bg-[#FF8C00]/5 transition-all text-sm font-medium">
            + Add Q&A Pair
          </button>
        </Section>

        <SectionDivider />

        {/* Widget Settings */}
        <Section title="Widget Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#2A343C] rounded-lg border border-[#B8860B]/30">
              <div>
                <p className="text-[#F5F5DC] font-medium text-sm">Widget Visibility</p>
                <p className="text-[#FFDAB9]/60 text-xs">Show character on your website</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[#1E262E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FF8C00] peer-checked:to-[#B8860B]"></div>
              </label>
            </div>
          </div>
        </Section>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-12">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-8 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
        <button
          onClick={() => navigate('/dashboard/characters')}
          className="flex-1 py-4 px-8 bg-[#2A343C] hover:bg-[#1E262E] text-[#FFDAB9] font-semibold rounded-full transition-all border border-[#B8860B]/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#F5F5DC] mb-4">{title}</h2>
      <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      className="h-[1px] my-4"
      style={{
        background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
        opacity: 0.3,
      }}
    />
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-[#F5F5DC] text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-lg text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
      />
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
