import React, { useEffect, useState } from 'react';

export default function GlobalSplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Fade out sequence
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for the exit animation to finish before calling onComplete
      setTimeout(() => {
        onComplete();
      }, 1000); 
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Split words for staggered letter animations
  const word1 = "TRAM".split("");
  const word2 = "TRACK".split("");

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out bg-[#FAFAF8] dark:bg-[#020503] ${
        fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* --- Scanner Viewfinder Corners --- */}
      <div className="absolute top-6 sm:top-12 left-6 sm:left-12 w-16 h-16 border-t-2 border-l-2 border-[#135E3E]/30 dark:border-[#DFBA73]/40 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-6 sm:top-12 right-6 sm:right-12 w-16 h-16 border-t-2 border-r-2 border-[#135E3E]/30 dark:border-[#DFBA73]/40 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-12 w-16 h-16 border-b-2 border-l-2 border-[#135E3E]/30 dark:border-[#DFBA73]/40 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-6 sm:bottom-12 right-6 sm:right-12 w-16 h-16 border-b-2 border-r-2 border-[#135E3E]/30 dark:border-[#DFBA73]/40 rounded-br-3xl pointer-events-none" />

      {/* --- Tech Grid Background --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(19,94,62,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(19,94,62,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(223,186,115,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(223,186,115,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      {/* --- Ambient Background Lights (Matching Hero Section) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-emerald-200/60 to-teal-100/30 dark:from-emerald-900/30 dark:to-[#0A1A12] blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-[#DFBA73]/40 via-amber-100/20 to-transparent dark:from-[#8C6928]/30 dark:via-[#135E3E]/20 dark:to-transparent blur-[140px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* --- Floating Botanical Particles (Pollen/Dust) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-[#8C6928] dark:bg-[#DFBA73]"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float-up ${Math.random() * 5 + 5}s linear infinite`,
              animationDelay: `-${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* --- HUD Rings & Logo Container --- */}
        <div className="relative mb-6 flex justify-center items-center w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] animate-[float_5s_ease-in-out_infinite]">
          
          {/* Central Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 dark:opacity-30">
            <div className="w-full h-[1px] bg-[#135E3E] dark:bg-[#DFBA73]" />
            <div className="absolute h-full w-[1px] bg-[#135E3E] dark:bg-[#DFBA73]" />
          </div>

          {/* High-Tech Spectral Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {/* Outer Ring */}
            <div className="absolute w-full h-full rounded-full border border-dashed border-emerald-900/15 dark:border-emerald-500/30 animate-[spin_120s_linear_infinite]" />
            {/* Middle Ring */}
            <div className="absolute w-[80%] h-[80%] rounded-full border border-emerald-900/5 dark:border-emerald-500/10 shadow-[inset_0_0_40px_rgba(19,94,62,0.05)]" />
            {/* Inner Data Ring */}
            <svg className="absolute w-[65%] h-[65%] animate-[spin_40s_linear_infinite_reverse] opacity-40 dark:opacity-60" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="url(#gradientRingSplash)" strokeWidth="0.5" strokeDasharray="4 2 1 2" />
              <defs>
                <linearGradient id="gradientRingSplash" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#135E3E" />
                  <stop offset="50%" stopColor="#8C6928" />
                  <stop offset="100%" stopColor="#135E3E" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Scanning Laser Line (Full Circle) */}
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-20">
             <div 
               className="w-full bg-gradient-to-b from-transparent via-[#8C6928]/40 dark:via-[#DFBA73]/40 to-transparent h-[4px] absolute left-0 shadow-[0_0_20px_#8C6928] dark:shadow-[0_0_20px_#DFBA73]" 
               style={{ animation: 'scan 3s ease-in-out infinite' }}
             />
          </div>

          {/* Core Glow */}
          <div className="absolute w-[50%] h-[50%] bg-white/60 dark:bg-[#8C6928]/40 blur-[50px] rounded-full animate-pulse z-0" />
          
          <img
            src="/assets/botanical/logo-icon.png"
            alt="TramTrack Logo"
            className="relative h-40 sm:h-56 lg:h-72 w-auto object-contain drop-shadow-[0_10px_35px_rgba(10,35,22,0.2)] dark:drop-shadow-[0_0_50px_rgba(223,186,115,0.5)] z-10"
          />
        </div>
      </div>

      {/* --- High-Tech Initialization Status --- */}
      <div className="absolute bottom-16 sm:bottom-20 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8C6928] dark:bg-[#DFBA73] animate-ping" />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8C6928] dark:bg-[#DFBA73] animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8C6928] dark:bg-[#DFBA73] animate-ping" style={{ animationDelay: '0.4s' }} />
        </div>
        <span className="font-mono text-[10px] sm:text-xs tracking-[0.3em] text-[#135E3E] dark:text-[#DFBA73] uppercase opacity-70 animate-pulse">
          Thiết lập kết nối bảo mật...
        </span>
      </div>

      {/* --- Custom CSS Keyframes --- */}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
        }
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-letter-spacing {
          0% { opacity: 0; letter-spacing: 0em; }
          100% { opacity: 1; letter-spacing: 0.3em; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
