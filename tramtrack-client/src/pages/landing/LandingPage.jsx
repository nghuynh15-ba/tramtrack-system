import React from 'react';
import { QrCode } from 'lucide-react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TwoTierSection from './components/TwoTierSection';
import ProductsSection from './components/ProductsSection';
import JourneySection from './components/JourneySection';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TwoTierSection />
        <ProductsSection />
        <JourneySection />
      </main>
      <Footer />
      
      {/* Mobile FAB */}
      <a href="/scan" className="fixed bottom-6 right-6 z-40 lg:hidden flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#135E3E] to-[#0A3D27] text-white shadow-[0_0_20px_rgba(19,94,62,0.6)] hover:scale-105 transition-transform duration-300">
        <QrCode size={24} className="text-[#DFBA73]" />
      </a>
    </>
  );
}
