import React, { useState, useEffect } from 'react';

const hotspotsData = [
  { 
    id: 1, 
    name: 'Thân Vỏ Xốp Giấy Trắng', 
    desc: 'Vỏ cây cấu tạo nhiều lớp mỏng như giấy, chứa tinh dầu bảo vệ cây khỏi vi khuẩn. Dược điển Việt Nam V ghi nhận tác dụng kháng khuẩn bề mặt.', 
    hash: 'SHA-256: 0x9b2a...77e', 
    img: 'https://images.unsplash.com/photo-1596568259160-593b4eebca27?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 
    style: { left: '8%', top: '15%', width: '22%', height: '60%' } 
  },
  { 
    id: 2, 
    name: 'Phiến Lá Tràm 5 Gân Dọc', 
    desc: 'Lá nguyên thon dài 5-10cm, có 5 gân dọc song song đặc trưng. Đây là bộ phận chứa hàm lượng Cineole cao nhất (lên đến 75%) khi thu hái lúc bình minh.', 
    hash: 'SHA-256: 0x1f8c...33b', 
    img: 'https://images.unsplash.com/photo-1620054813589-23d2402fc209?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 
    style: { left: '32%', top: '22%', width: '18%', height: '45%' } 
  },
  { 
    id: 3, 
    name: 'Cụm Búp Hoa Tràm Chùy Trắng', 
    desc: 'Hoa tự bông đuôi sóc, màu trắng kem. Cung cấp hương thơm dịu nhẹ đặc trưng cho tinh dầu tràm năm gân, giúp giảm căng thẳng thần kinh.', 
    hash: 'SHA-256: 0x4a19...88c', 
    img: 'https://images.unsplash.com/photo-1507026330999-63a23a1a1f81?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 
    style: { left: '56%', top: '12%', width: '20%', height: '55%' } 
  },
  { 
    id: 4, 
    name: 'Vùng Thổ Nhưỡng Tây Ninh', 
    desc: 'Đất xám bạc màu trên nền phù sa cổ. Khí hậu nắng nóng quanh năm ép cây tràm sinh tiết lượng tinh dầu vượt trội với độ tinh khiết cao chuẩn OCOP.', 
    hash: 'SHA-256: 0x7c99...11d', 
    img: 'https://images.unsplash.com/photo-1598444321683-1254346af0b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 
    style: { left: '80%', top: '10%', width: '18%', height: '58%' } 
  }
];

const Mascot = ({ pose, active }) => {
  return (
    <div className={`relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${pose === 'celebrating' ? 'scale-[1.3] -translate-y-12' : pose === 'peeking' ? 'scale-110 -translate-y-4' : 'scale-100'}`}>
      {/* Hào quang ngọc bích (Aura Halo) */}
      <div className={`absolute w-[140px] h-[140px] bg-[#135E3E]/20 rounded-full animate-pulse blur-[15px] transition-all duration-700 ${pose !== 'idle' ? 'scale-125 bg-[#8C6928]/30' : ''}`} style={{ boxShadow: '0 0 45px rgba(19, 94, 62, 0.25)' }}></div>
      
      {/* Bộ đệm bóng đáy (Shadow Pulse) */}
      <div className={`absolute -bottom-8 w-16 h-3 bg-black/20 rounded-[100%] animate-pulse blur-[2px] transition-all duration-700 ${pose === 'celebrating' ? 'scale-75 opacity-50' : 'scale-100'}`}></div>

      {/* Khối cấu trúc hình thể Bé Tràm */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Đỉnh đầu đính viên ngọc & Mũ lá tràm */}
        <div className="relative -mb-3 flex flex-col items-center z-20">
          <div className={`w-2.5 h-3.5 bg-gradient-to-b from-[#8C6928] to-[#FCD34D] rotate-45 rounded-[2px] mb-1 z-30 transition-shadow duration-500 ${pose !== 'idle' ? 'shadow-[0_0_15px_rgba(252,211,77,0.8)]' : 'shadow-[0_0_5px_rgba(140,105,40,0.5)]'}`}></div>
          <div className="flex gap-0.5 items-end">
            <div className={`w-3.5 h-7 bg-gradient-to-b from-[#3F8D5E] to-[#135E3E] rounded-full -rotate-45 transform origin-bottom translate-x-1.5 transition-transform duration-500 ${pose === 'peeking' ? 'rotate-[-35deg]' : ''}`}></div>
            <div className={`w-4.5 h-9 bg-gradient-to-b from-[#3F8D5E] to-[#135E3E] rounded-full z-10 transition-transform duration-500 ${pose === 'celebrating' ? '-translate-y-1' : ''}`} style={{ width: '1.125rem' }}></div>
            <div className={`w-3.5 h-7 bg-gradient-to-b from-[#3F8D5E] to-[#135E3E] rounded-full rotate-45 transform origin-bottom -translate-x-1.5 transition-transform duration-500 ${pose === 'peeking' ? 'rotate-[35deg]' : ''}`}></div>
          </div>
        </div>

        {/* Khuôn mặt tròn */}
        <div className="relative w-16 h-14 bg-[#FFF7EE] rounded-[35px] shadow-sm flex flex-col items-center pt-2 z-10 border border-[#8C6928]/10 overflow-hidden">
          {/* Đôi má hồng */}
          <div className={`absolute top-6 left-1.5 w-3 h-2 bg-[#FFB9A3]/80 rounded-full blur-[1px] transition-opacity duration-300 ${pose === 'peeking' ? 'opacity-100 scale-125' : 'opacity-70'}`}></div>
          <div className={`absolute top-6 right-1.5 w-3 h-2 bg-[#FFB9A3]/80 rounded-full blur-[1px] transition-opacity duration-300 ${pose === 'peeking' ? 'opacity-100 scale-125' : 'opacity-70'}`}></div>
          
          {/* Đôi mắt */}
          <div className="flex gap-3 mb-1 mt-1 relative z-20 transition-all duration-300">
            <div className="w-2.5 h-2.5 flex items-center justify-center">
              {pose === 'peeking' || pose === 'celebrating' ? (
                 <div className="w-2.5 h-1.5 border-t-[2.5px] border-[#0A1A12] rounded-t-full mb-1"></div>
              ) : (
                <div className="w-2.5 h-2.5 bg-[#0A1A12] rounded-full relative">
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="w-2.5 h-2.5 flex items-center justify-center">
              {pose === 'peeking' || pose === 'celebrating' ? (
                 <div className="w-2.5 h-1.5 border-t-[2.5px] border-[#0A1A12] rounded-t-full mb-1"></div>
              ) : (
                <div className="w-2.5 h-2.5 bg-[#0A1A12] rounded-full relative">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Khuôn miệng */}
          <div className="relative z-20 mt-0.5 transition-all duration-300">
            {pose === 'peeking' || pose === 'celebrating' ? (
              <div className="w-3 h-3.5 bg-[#991B1B] rounded-full border border-black/10 shadow-inner flex flex-col justify-end overflow-hidden">
                <div className="w-full h-1.5 bg-[#FFB9A3] rounded-t-full mt-auto"></div>
              </div>
            ) : (
              <div className="w-2.5 h-1 border-b-[2px] border-[#0A1A12] rounded-b-full"></div>
            )}
          </div>
        </div>

        {/* Cánh tay vẫy chào */}
        <div 
          className={`absolute -right-2 top-[45%] w-6 h-2.5 bg-[#FFF7EE] rounded-full origin-left z-0 border border-[#8C6928]/10 shadow-sm transition-all duration-500 ${pose === 'idle' ? 'animate-wave' : pose === 'celebrating' ? '-rotate-[120deg] -translate-y-2 translate-x-1' : '-rotate-[20deg]'}`} 
          style={{ transformOrigin: 'left center' }}
        ></div>
        
        {/* Tay trái tĩnh */}
        <div 
          className={`absolute -left-2 top-[45%] w-6 h-2.5 bg-[#FFF7EE] rounded-full origin-right z-0 border border-[#8C6928]/10 shadow-sm transition-all duration-500 ${pose === 'celebrating' ? 'rotate-[120deg] -translate-y-2 -translate-x-1' : 'rotate-[30deg]'}`} 
          style={{ transformOrigin: 'right center' }}
        ></div>
      </div>
    </div>
  )
}

const BotanicalStage1PeekabooStory = ({ onClose, onNext }) => {
  const [completedHotspots, setCompletedHotspots] = useState([]);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [mascotPose, setMascotPose] = useState('idle'); // 'idle', 'peeking', 'celebrating'
  const [typedText, setTypedText] = useState('');
  
  const fullText = "Chào bạn! Rừng tràm năm gân Tây Ninh đang vào lúc 05:30 sáng — thời điểm búp lá ngậm sương dồi dào Cineole nhất. Bạn hãy cùng mình chạm vào 4 điểm sáng trên các cành tràm để khám phá tiêu bản nguyên liệu nhé!";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40); // Typewriter speed
    return () => clearInterval(interval);
  }, []);

  const handleHotspotClick = (id) => {
    if (!completedHotspots.includes(id)) {
      setCompletedHotspots(prev => [...prev, id]);
    }
    setActiveHotspot(id);
    setMascotPose('peeking');
  };

  useEffect(() => {
    if (completedHotspots.length === 4) {
      setTimeout(() => {
        setMascotPose('celebrating');
        setActiveHotspot(null);
      }, 1000);
    }
  }, [completedHotspots.length]);

  const activeHotspotData = hotspotsData.find(h => h.id === activeHotspot);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F6F8F5] text-[#0A1A12] overflow-hidden select-none font-sans">
      {/* 1. Lớp nền (Cinematic Background Layer) */}
      <img 
        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
        alt="Rừng tràm bình minh" 
        className="object-cover w-full h-full absolute inset-0 filter brightness-105 contrast-95 scale-105 animate-slow-pan"
        draggable="false"
      />
      {/* Lớp phủ gradient sương mai mờ ảo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A12]/40 via-[#0A1A12]/10 to-transparent mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none"></div>

      {/* 2. Thanh Điều Hướng Đỉnh Trang */}
      <div className="relative z-40">
        <div className="flex w-full gap-1 p-1">
          <div className="h-1.5 flex-1 bg-white rounded-full overflow-hidden border border-[#8C6928]/30 shadow-[0_0_10px_rgba(19,94,62,0.3)] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#135E3E] to-[#8C6928]"></div>
          </div>
          <div className="h-1.5 flex-1 bg-white/40 backdrop-blur-sm rounded-full"></div>
          <div className="h-1.5 flex-1 bg-white/40 backdrop-blur-sm rounded-full"></div>
          <div className="h-1.5 flex-1 bg-white/40 backdrop-blur-sm rounded-full"></div>
        </div>

        <div className="flex items-center justify-between px-6 pt-5">
          <div className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-sm flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#135E3E] flex items-center justify-center">
               <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#135E3E] font-bold tracking-widest uppercase">
              CHẶNG 01 / 04 // VÙNG NGUYÊN LIỆU BẢN ĐỊA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block font-['IBM_Plex_Mono'] text-xs font-medium text-[#135E3E] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-900/10 shadow-sm">
              TÂY NINH 05:30 AM · 24°C
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-gray-800 hover:bg-white/80 transition-colors shadow-sm"
              title="Bỏ qua"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Hệ Thống 4 Hotspot Thực Vật Học */}
      <div className="absolute inset-0 z-20">
        {hotspotsData.map((hotspot) => {
          const isDone = completedHotspots.includes(hotspot.id);
          const isActive = activeHotspot === hotspot.id;
          return (
            <div 
              key={hotspot.id}
              className="absolute flex items-center justify-center"
              style={hotspot.style}
            >
              <button
                onClick={() => handleHotspotClick(hotspot.id)}
                className="relative group focus:outline-none focus-visible:ring-4 ring-white/50 rounded-full"
                aria-label={`Chi tiết ${hotspot.name}`}
              >
                {!isDone ? (
                  <div className="w-12 h-12 rounded-full border-2 border-white/60 shadow-[0_0_0_8px_rgba(255,255,255,0.15)] animate-pulse flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform cursor-pointer hover:border-white hover:bg-white/30">
                     <div className="w-3.5 h-3.5 bg-[#FCD34D] rounded-full shadow-[0_0_15px_rgba(252,211,77,1)] animate-ping relative">
                       <div className="absolute inset-0 bg-white rounded-full scale-50"></div>
                     </div>
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isActive ? 'bg-[#8C6928] border-2 border-[#FCD34D] scale-110 shadow-[0_0_20px_rgba(140,105,40,0.5)]' : 'bg-white/90 border-2 border-[#135E3E] backdrop-blur-sm'}`}>
                     <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#135E3E]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                
                {/* Hotspot Hover Label */}
                {!isDone && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none">
                    {hotspot.name}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Linh Vật Bé Tràm Ú Òa & Hiệu Ứng Chuyển Động */}
      <div 
        className="absolute z-30 transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none"
        style={{ 
          left: completedHotspots.length === 4 ? '50%' : '22%', 
          top: completedHotspots.length === 4 ? '45%' : '60%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Mascot pose={mascotPose} active={activeHotspot !== null} />
      </div>

      {/* 5. Khung Bong Bóng Đối Thoại */}
      <div className={`absolute transition-all duration-700 z-40 ${activeHotspot !== null || completedHotspots.length === 4 ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'} hidden md:block`} style={{ left: '28%', bottom: '15%', maxWidth: '420px' }}>
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-5 shadow-[0_15px_35px_rgba(10,26,18,0.12)] relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/95 border-l border-b border-emerald-900/10 rotate-45 transform"></div>
          
          <h4 className="font-['IBM_Plex_Mono'] text-[#135E3E] text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wide">
            BÉ TRÀM // THUYẾT MINH THỰC ĐỊA
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h4>
          <p className="text-[#0A1A12] text-sm leading-relaxed font-medium min-h-[80px]">
            {typedText}
            {typedText.length < fullText.length && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#8C6928] animate-pulse align-middle"></span>}
          </p>
          
          <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500 font-['IBM_Plex_Mono'] border-t border-gray-100 pt-3">
             <span>TIẾN ĐỘ THU HÁI: {completedHotspots.length}/4</span>
             <div className="flex gap-1">
               {[1,2,3,4].map(num => (
                 <div key={num} className={`w-2 h-2 rounded-full ${completedHotspots.includes(num) ? 'bg-[#135E3E]' : 'bg-gray-200'}`}></div>
               ))}
             </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Dock for Dialog */}
      <div className={`absolute md:hidden inset-x-4 bottom-4 transition-all duration-700 z-40 ${activeHotspot !== null || completedHotspots.length === 4 ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-2xl p-4 shadow-[0_10px_25px_rgba(10,26,18,0.15)] relative">
          <h4 className="font-['IBM_Plex_Mono'] text-[#135E3E] text-[10px] font-bold mb-1.5 flex items-center gap-2 uppercase tracking-wide">
            BÉ TRÀM // THUYẾT MINH THỰC ĐỊA
          </h4>
          <p className="text-[#0A1A12] text-xs leading-relaxed font-medium">
            {typedText}
          </p>
        </div>
      </div>

      {/* Thẻ giám định mẫu khi click vào Hotspot */}
      <div className={`fixed right-4 md:right-8 bottom-4 md:bottom-8 max-w-sm w-[calc(100%-2rem)] md:w-full bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-5 md:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-50 transition-all duration-500 ease-out transform ${activeHotspot !== null ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        {activeHotspotData && (
          <>
            <button 
              onClick={() => {
                setActiveHotspot(null);
                setMascotPose('idle');
              }} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#135E3E]/10 flex items-center justify-center text-[#135E3E] shrink-0 border border-[#135E3E]/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="font-bold text-[#0A1A12] text-base md:text-lg font-['Be_Vietnam_Pro'] pr-6 leading-tight">
                {activeHotspotData.name}
              </h3>
            </div>
            
            <div className="rounded-xl overflow-hidden mb-4 border border-gray-100 relative shadow-inner">
              <img src={activeHotspotData.img} alt={activeHotspotData.name} className="w-full h-36 md:h-44 object-cover" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-['IBM_Plex_Mono']">
                <svg className="w-3 h-3 text-[#FCD34D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                MACRO LENS
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-5 leading-relaxed bg-[#F6F8F5] p-3 rounded-xl border border-gray-100">
              {activeHotspotData.desc}
            </p>
            
            <div className="bg-[#135E3E]/5 px-3 py-2.5 rounded-lg border border-[#135E3E]/20 flex items-center justify-between shadow-sm">
              <span className="text-[10px] md:text-xs text-[#135E3E] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Mã Hash
              </span>
              <span className="font-['IBM_Plex_Mono'] text-[10px] md:text-xs text-emerald-800 font-medium">
                {activeHotspotData.hash}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 6. Modal Hoàn Thành Chặng & Chuyển Bước */}
      {completedHotspots.length === 4 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0A1A12]/80 backdrop-blur-md animate-fade-in px-4">
          <div className="bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center transform animate-pop-in relative overflow-hidden mt-32">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8C6928] via-[#FCD34D] to-[#8C6928]"></div>
            
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-5 relative z-10">
               <div className="absolute inset-0 border-2 border-emerald-300 rounded-full animate-ping opacity-60"></div>
               <svg className="w-10 h-10 text-[#8C6928]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            
            <p className="text-[10px] md:text-xs font-bold text-[#135E3E] tracking-widest uppercase mb-2">
              THU HÁI NGUYÊN LIỆU ĐẠT CHUẨN 100% ✓
            </p>
            <h2 className="font-['Lora'] italic text-2xl md:text-3xl text-[#0A1A12] mb-3 font-medium">
              Hoàn Tất Thu Hái!
            </h2>
            <p className="text-gray-600 text-sm mb-8 px-2 md:px-4 leading-relaxed">
              1,200kg lá tươi nguyên bản đã sẵn sàng nạp vào nồi chưng cất áp suất. Hệ thống chuẩn bị chuyển sang giai đoạn gia nhiệt.
            </p>
            
            <button 
              onClick={onNext}
              className="w-full bg-gradient-to-r from-[#8C6928] to-[#6E501C] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(140,105,40,0.3)] hover:shadow-[0_15px_30px_rgba(140,105,40,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group flex items-center justify-center gap-2"
            >
              Tiếp Tục: Sang Chặng 02 
              <span className="hidden md:inline">— Chưng Cất 100°C</span>
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Global Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(40deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slow-pan {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }
        .animate-slow-pan {
          animation: slow-pan 30s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default BotanicalStage1PeekabooStory;
