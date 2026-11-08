import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function DecryptionSplash({ serialNumber = 'TDT-2026-004821', onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Staggered Animation Sequence
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1200);

    // Auto complete at 2.2s
    const tComplete = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2200);

    // Progress bar fills over 2s
    const startTime = Date.now();
    const duration = 2000; 
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 30);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tComplete);
      clearInterval(interval);
    };
  }, [onComplete]);

  const displaySerial = (serialNumber || '').includes('TDT') ? serialNumber : `TDT-2026-${serialNumber || '004821'}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#F6F8F5] text-[#0A1A12] flex flex-col justify-between p-6 lg:p-10 overflow-hidden font-sans">
      
      {/* Specimen Canvas Area */}
      <div className="flex-1 w-full flex justify-center items-center relative z-10">
        
        {/* Main Interactive Stage bounded container */}
        <div className="relative w-full max-w-[800px] h-[520px] lg:h-[620px] flex justify-center items-center">
          
          {/* Main Specimen Image without borders */}
          <img 
            src="/assets/botanical/melaleuca-specimen.png" 
            alt="Melaleuca quinquenervia Specimen" 
            className="h-[520px] lg:h-[620px] w-auto object-contain mx-auto relative z-10 drop-shadow-xl"
          />

          {/* Laser Scan Effect Overlay on the container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 rounded-3xl mask-image-vertical">
            <div className="absolute inset-x-0 w-full animate-[scanVertical_3s_linear_infinite]">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#135E3E]/50 to-transparent shadow-[0_0_12px_#135E3E]" />
            </div>
          </div>

          {/* Leader Lines SVG Layer (Elbow Lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <style>{`
              .leader-line {
                stroke-dasharray: 3 3;
                stroke-dashoffset: 50;
                animation: drawDash 0.8s linear forwards;
              }
              @keyframes drawDash {
                to { stroke-dashoffset: 0; }
              }
              .mask-image-vertical {
                mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
              }
            `}</style>
            
            {/* Line 1 (Flower): Node (50,10) to Card (92,10) to (92,8) */}
            {phase >= 1 && (
              <path className="leader-line" d="M 50 10 L 92 10 L 92 8" stroke="#8C6928" strokeOpacity="0.4" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
            )}

            {/* Line 2 (Leaf): Node (45,36) to Card (6,36) to (6,34) */}
            {phase >= 2 && (
              <path className="leader-line" d="M 45 36 L 6 36 L 6 34" stroke="#8C6928" strokeOpacity="0.4" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
            )}

            {/* Line 3 (Bark): Node (50,75) to Card (92,75) to (92,73) */}
            {phase >= 3 && (
              <path className="leader-line" d="M 50 75 L 92 75 L 92 73" stroke="#8C6928" strokeOpacity="0.4" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
            )}
          </svg>

          {/* Hotspot Node 1 (Flower) */}
          <div className="absolute top-[10%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#8C6928]/40 animate-ping" />
              <div className="w-[6px] h-[6px] bg-[#8C6928] rounded-full shadow-[0_0_8px_#8C6928]" />
            </div>
          </div>

          {/* Hotspot Node 2 (Leaf) */}
          <div className="absolute top-[36%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#8C6928]/40 animate-ping" />
              <div className="w-[6px] h-[6px] bg-[#8C6928] rounded-full shadow-[0_0_8px_#8C6928]" />
            </div>
          </div>

          {/* Hotspot Node 3 (Bark) */}
          <div className="absolute top-[75%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#8C6928]/40 animate-ping" />
              <div className="w-[6px] h-[6px] bg-[#8C6928] rounded-full shadow-[0_0_8px_#8C6928]" />
            </div>
          </div>

          {/* HUD Badge 1 (Flower) */}
          <div 
            className={`absolute z-30 top-[8%] right-[8%] -translate-y-1/2 transition-all duration-500 transform ${phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          >
            <div className="backdrop-blur-md bg-white/90 border border-emerald-900/10 rounded-xl px-4 py-2.5 shadow-[0_8px_20px_rgba(10,26,18,0.06)] flex items-center gap-3">
              <span className="font-mono text-[9px] sm:text-[11px] text-[#0A1A12] leading-none whitespace-nowrap">SHA-256 // CHUỖI BĂM TOÀN VẸN</span>
              <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-900/10 px-2 py-1 rounded font-mono text-[9px] font-medium shrink-0 leading-none">
                SECURED <CheckCircle2 size={11} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* HUD Badge 2 (Leaf) */}
          <div 
            className={`absolute z-30 top-[34%] left-[6%] -translate-y-1/2 transition-all duration-500 transform ${phase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          >
            <div className="backdrop-blur-md bg-white/90 border border-emerald-900/10 rounded-xl px-4 py-2.5 shadow-[0_8px_20px_rgba(10,26,18,0.06)] flex items-center gap-3">
              <span className="font-mono text-[9px] sm:text-[11px] text-[#0A1A12] leading-none whitespace-nowrap">1,8-CINEOLE: 71.05% // 5 GÂN DƯỢC ĐIỂN</span>
              <div className="flex items-center gap-1 text-[#135E3E] bg-[#135E3E]/10 border border-transparent px-2 py-1 rounded font-mono text-[9px] font-medium shrink-0 leading-none">
                VERIFIED <CheckCircle2 size={11} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* HUD Badge 3 (Bark) */}
          <div 
            className={`absolute z-30 top-[73%] right-[8%] -translate-y-1/2 transition-all duration-500 transform ${phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          >
            <div className="backdrop-blur-md bg-white/90 border border-emerald-900/10 rounded-xl px-4 py-2.5 shadow-[0_8px_20px_rgba(10,26,18,0.06)] flex items-center gap-3">
              <span className="font-mono text-[9px] sm:text-[11px] text-[#0A1A12] leading-none whitespace-nowrap">ARGON2ID // VỎ THÂN NIÊM PHONG</span>
              <div className="flex items-center gap-1 text-[#135E3E] bg-[#135E3E]/10 border border-transparent px-2 py-1 rounded font-mono text-[9px] font-medium shrink-0 leading-none">
                VERIFIED <CheckCircle2 size={11} strokeWidth={2.5} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Dock */}
      <div className="w-full relative z-20 mt-4 shrink-0 flex flex-col items-center">
        <div className="font-mono text-[10px] sm:text-[11px] text-[#4F6357] uppercase tracking-wider mb-2">
          [DECRYPTING SPECIMEN ATTRIBUTES...] SERIAL: {displaySerial}
        </div>
        <div className="w-72 h-1 bg-emerald-900/10 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-gradient-to-r from-[#135E3E] to-[#8C6928] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scanVertical {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
