import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, Leaf, Droplet, ShieldCheck, MapPin, Clock, Lock, FileCheck } from 'lucide-react';

const DURATION = 5000;

export default function CinematicTraceabilityStory({
  onClose,
  onViewCOA
}) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentChapter(c => Math.min(3, c + 1));
        setProgress(0);
      } else if (e.key === 'ArrowLeft') {
        setCurrentChapter(c => Math.max(0, c - 1));
        setProgress(0);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (30 / DURATION) * 100;
        if (next >= 100) {
          clearInterval(interval);
          if (currentChapter < 3) {
            setTimeout(() => {
              setCurrentChapter(c => c + 1);
              setProgress(0);
            }, 0);
          }
          return 100; // Cap at 100 on last slide
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused, currentChapter]);

  // Touch Handlers for Mobile Pause/Resume
  const handlePointerDown = () => setIsPaused(true);
  const handlePointerUp = () => setIsPaused(false);

  // Click Navigation (Left/Right halves)
  const handleScreenClick = (e) => {
    const { clientX } = e;
    const { innerWidth } = window;
    // Don't trigger if they clicked inside the HUD cards (we stopPropagation on cards)
    if (clientX < innerWidth / 2) {
      // Prev
      if (currentChapter > 0) {
        setCurrentChapter(c => c - 1);
        setProgress(0);
      } else {
        setProgress(0);
      }
    } else {
      // Next
      if (currentChapter < 3) {
        setCurrentChapter(c => c + 1);
        setProgress(0);
      } else {
        setProgress(100);
      }
    }
  };

  const preventProp = (e) => e.stopPropagation();

  // Dynamic counter for Chapter 3
  const [cineoleValue, setCineoleValue] = useState(0);
  useEffect(() => {
    if (currentChapter === 2) {
      setCineoleValue((progress / 100) * 71.05);
    }
  }, [progress, currentChapter]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#F6F8F5] text-[#0A1A12] overflow-hidden select-none font-sans"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleScreenClick}
    >
      
      {/* ======================= BACKGROUND VISUALS ======================= */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Chapter 1 Visual: Ken Burns Specimen */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${currentChapter === 0 ? 'opacity-100' : 'opacity-0'}`}>
          <img 
            src="/assets/botanical/melaleuca-specimen.png" 
            alt="Melaleuca Leaf" 
            className="w-full h-full object-cover opacity-15 scale-105 animate-[kenburns_20s_ease-out_infinite alternate]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F6F8F5] via-transparent to-[#F6F8F5]" />
        </div>

        {/* Chapter 2 Visual: Steam & Distillation */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${currentChapter === 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-emerald-50/40" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-500/10 to-transparent animate-pulse" />
          {/* Mock steam particles */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/40 blur-3xl rounded-full animate-[float_4s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full animate-[float_6s_ease-in-out_infinite_reverse]" />
        </div>

        {/* Chapter 3 Visual: GC-MS Grid & Laser */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${currentChapter === 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: 'linear-gradient(#135E3E 1px, transparent 1px), linear-gradient(90deg, #135E3E 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Laser Sweep */}
          <div className="absolute inset-y-0 left-0 w-1 bg-[#135E3E] shadow-[0_0_20px_#135E3E] animate-[laserSweep_3s_ease-in-out_infinite]" />
          {/* Mock Spectrum Graph */}
          <svg className="absolute inset-x-0 bottom-[20%] w-full h-64 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,90 L20,90 L25,40 L30,90 L60,90 L65,70 L70,90 L120,90 L130,20 L135,90" stroke="#135E3E" strokeWidth="0.5" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* Chapter 4 Visual: Security Seal Close-up */}
        <div className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${currentChapter === 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-[120vw] h-[120vw] sm:w-[80vw] sm:h-[80vw] rounded-full border border-emerald-900/10 absolute opacity-50 animate-[spin_40s_linear_infinite]" />
          <div className="w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] rounded-full border border-[#8C6928]/20 absolute opacity-50 animate-[spin_30s_linear_infinite_reverse]" />
          <Lock size={200} strokeWidth={1} className="text-emerald-900/5" />
        </div>

      </div>

      {/* ======================= HUD OVERLAYS ======================= */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        
        {/* TOP HUD: Progress Bars & Header */}
        <div className="w-full pt-4 px-4 sm:px-6 z-20">
          {/* Progress Bars */}
          <div className="flex gap-2 w-full max-w-4xl mx-auto mb-4 pointer-events-auto">
            {[0, 1, 2, 3].map(idx => (
              <div 
                key={idx} 
                className="h-1.5 flex-1 bg-emerald-900/15 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setCurrentChapter(idx); setProgress(0); }}
              >
                <div 
                  className={`h-full bg-[#135E3E] transition-all ease-linear ${idx === currentChapter ? 'duration-[30ms]' : 'duration-300'}`}
                  style={{ width: idx < currentChapter ? '100%' : idx === currentChapter ? `${progress}%` : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Header Controls */}
          <div className="flex items-center justify-between max-w-4xl mx-auto pointer-events-auto">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-emerald-900/10 flex items-center justify-center text-[#0A1A12] hover:bg-white transition-all">
              <ChevronLeft size={20} />
            </button>

            <div className="bg-white/70 backdrop-blur-md border border-emerald-900/10 px-4 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold text-[#135E3E] tracking-widest uppercase">
              HÀNH TRÌNH DƯỢC LIỆU // LÔ LO-2026-Q3-08
            </div>

            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }} className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-emerald-900/10 flex items-center justify-center text-[#0A1A12] hover:bg-white transition-all">
                {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
              </button>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-emerald-900/10 flex items-center justify-center text-[#0A1A12] hover:bg-white transition-all">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM HUD: Floating Glass Cards */}
        <div className="w-full pb-8 sm:pb-12 px-4 sm:px-6 max-w-4xl mx-auto pointer-events-auto" onClick={preventProp} onPointerDown={preventProp}>
          
          {/* Chapter 1 Card */}
          <div className={`transition-all duration-700 absolute bottom-8 sm:bottom-12 left-4 sm:left-6 right-4 sm:right-6 max-w-4xl mx-auto ${currentChapter === 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/85 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,26,18,0.08)]">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-[#8C6928] tracking-widest mb-3">CHẶNG 01 / 04 · KHỞI NGUYÊN DƯỢC LIỆU</div>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-[#0A1A12] mb-6">Thu Hái Búp Lá Lúc Bình Minh</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="flex items-center gap-3 bg-emerald-900/5 px-4 py-3 rounded-2xl">
                  <MapPin size={18} className="text-[#135E3E]" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#4F6357] tracking-wider">Tọa độ Vùng Trồng</div>
                    <div className="font-mono text-sm text-[#0A1A12] font-semibold">11°18'N 106°05'E</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-900/5 px-4 py-3 rounded-2xl">
                  <Clock size={18} className="text-[#135E3E]" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#4F6357] tracking-wider">Thời Gian Kỷ Lục</div>
                    <div className="font-mono text-sm text-[#0A1A12] font-semibold">05:30 AM · 12/08</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[#135E3E] font-medium text-sm">
                <Leaf size={16} /> 100% Cành Lá Tràm Năm Gân Tự Nhiên
              </div>
            </div>
          </div>

          {/* Chapter 2 Card */}
          <div className={`transition-all duration-700 absolute bottom-8 sm:bottom-12 left-4 sm:left-6 right-4 sm:right-6 max-w-4xl mx-auto ${currentChapter === 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/85 backdrop-blur-xl border border-amber-900/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(140,105,40,0.08)]">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-[#8C6928] tracking-widest mb-3">CHẶNG 02 / 04 · QUY TRÌNH HỒI LƯU</div>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-[#0A1A12] mb-6">Chiết Xuất Tinh Túy Bằng Hơi Nước</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col gap-1 bg-amber-900/5 px-4 py-3 rounded-2xl border border-amber-900/10">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#8C6928] tracking-wider">
                    <span>Nhiệt độ nồi</span>
                    <span className="font-mono">100°C</span>
                  </div>
                  <div className="w-full h-1 bg-amber-900/10 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#8C6928] animate-[pulse_1s_ease-in-out_infinite]" />
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-900/5 px-4 py-3 rounded-2xl border border-amber-900/10">
                  <Clock size={18} className="text-[#8C6928]" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#8C6928] tracking-wider">Chu kỳ chưng cất</div>
                    <div className="font-mono text-sm text-[#0A1A12] font-semibold">06:00:00 Giờ liên tục</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[#8C6928] font-medium text-sm">
                <Droplet size={16} /> Thu hồi từng giọt tinh dầu nguyên bản không pha tạp
              </div>
            </div>
          </div>

          {/* Chapter 3 Card */}
          <div className={`transition-all duration-700 absolute bottom-8 sm:bottom-12 left-4 sm:left-6 right-4 sm:right-6 max-w-4xl mx-auto ${currentChapter === 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/85 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(19,94,62,0.08)] text-center sm:text-left">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-[#135E3E] tracking-widest mb-3">CHẶNG 03 / 04 · CHUẨN HÓA DƯỢC ĐIỂN</div>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-[#0A1A12] mb-6">Định Lượng Hoạt Chất Y Học</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-6 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-900/10">
                <div className="shrink-0 font-mono text-5xl sm:text-6xl font-bold text-[#135E3E] tabular-nums">
                  {cineoleValue.toFixed(2)}<span className="text-3xl text-[#4F6357]">%</span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-[#0A1A12] text-lg mb-1 uppercase tracking-wider">1,8-CINEOLE</div>
                  <div className="font-mono text-xs text-[#135E3E] font-semibold bg-[#135E3E]/10 px-3 py-1.5 rounded-lg inline-block">
                    CHUẨN DƯỢC ĐIỂN: ≥ 60.0%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#4F6357] font-medium text-sm">
                <FileCheck size={16} className="text-[#135E3E]" /> Phiếu kiểm nghiệm số COA-2026-8821 · Có chữ ký số
              </div>
            </div>
          </div>

          {/* Chapter 4 Card */}
          <div className={`transition-all duration-700 absolute bottom-8 sm:bottom-12 left-4 sm:left-6 right-4 sm:right-6 max-w-4xl mx-auto ${currentChapter === 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
            <div className="bg-white/85 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,26,18,0.08)]">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-[#8C6928] tracking-widest mb-3">CHẶNG 04 / 04 · ĐÓNG MÃ KHỐI SHA-256</div>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-[#0A1A12] mb-6">Mỗi Giọt Dầu, Một Định Danh Độc Bản</h2>
              
              <div className="flex flex-col gap-3 mb-6 bg-[#0A1A12]/5 p-4 sm:p-5 rounded-2xl border border-emerald-900/10">
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#4F6357] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-[#135E3E]" /> PUBLIC SERIAL
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#0A1A12] tracking-widest">TDT-2026-004821</div>
                
                <div className="w-full h-[1px] bg-emerald-900/10 my-1" />
                
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#4F6357] font-bold uppercase tracking-widest">
                  <Lock size={14} className="text-[#8C6928]" /> ARGON2ID HASH
                </div>
                <div className="font-mono text-[11px] sm:text-sm text-[#8C6928] font-bold break-all">
                  0x8F9B2A...49C1E5
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={onViewCOA}
                  className="w-full sm:flex-1 bg-gradient-to-r from-[#9E7B3B] to-[#7E5C20] text-white font-semibold py-4 px-6 rounded-2xl shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-[13px] sm:text-sm uppercase tracking-wide"
                >
                  Xem Bảng COA & Chứng Thư ↗
                </button>
                <button 
                  onClick={() => { setCurrentChapter(0); setProgress(0); }}
                  className="w-full sm:w-auto bg-white border border-emerald-900/15 text-[#0A1A12] font-semibold py-4 px-6 rounded-2xl transition-all text-[13px] sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-50"
                >
                  <Play size={16} /> Xem Lại (Replay)
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes laserSweep {
          0% { left: -10%; }
          50% { left: 110%; }
          100% { left: -10%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes kenburns {
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, -2%); }
        }
      `}</style>
    </div>
  );
}
