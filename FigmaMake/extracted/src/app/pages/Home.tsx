import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Showcase } from '../components/Showcase';
import { HowItWorks } from '../components/HowItWorks';
import { WorksAnywhere } from '../components/WorksAnywhere';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';
import { DemoModal } from '../components/DemoModal';
import { WaveDivider } from '../components/WaveDivider';

export function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState('Side by Side');

  const handleDemoClick = (layout?: string) => {
    setSelectedLayout(layout || 'Side by Side');
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#36454F]">
      <Navbar />
      <main>
        <Hero onDemoClick={() => handleDemoClick()} />
        <WaveDivider color="#36454F" />
        <Showcase onCardClick={handleDemoClick} />
        <WaveDivider color="#2A343C" flip />
        <HowItWorks />
        <WaveDivider color="#36454F" />
        <WorksAnywhere />
        <WaveDivider color="#36454F" flip />
        <CTA />
      </main>
      <Footer />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} layout={selectedLayout} />
    </div>
  );
}