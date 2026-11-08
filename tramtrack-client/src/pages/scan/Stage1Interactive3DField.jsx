import React, { useState, useEffect, useRef } from 'react';

const hotspotsData = [
  { 
    id: 1, 
    title: 'Bảo Chứng Vùng Nguyên Liệu Chuẩn Hóa Dược Liệu', 
    desc: 'Đảm bảo minh bạch nguồn gốc và tuân thủ các quy chuẩn chất lượng cao nhất cho nguyên liệu.',
    style: { right: '14%', top: '22%', width: '180px', height: '80px' } 
  },
  { 
    id: 2, 
    title: 'Kỹ Thuật Thu Hái Thủ Công 100% Búp Lá Ngậm Dầu', 
    desc: 'Bảo vệ vẹn nguyên hàm lượng tinh dầu quý giá nhờ thao tác thu hái tỉ mỉ bằng tay vào sáng sớm.',
    style: { left: '48%', top: '62%', width: '90px', height: '90px' } 
  },
  { 
    id: 3, 
    title: 'Hệ Sinh Thái Hữu Cơ & Chỉ Số Sinh Học Net Zero', 
    desc: 'Bảo tồn đa dạng sinh học, không sử dụng hóa chất độc hại, hướng tới tương lai phát triển bền vững.',
    style: { left: '8%', top: '76%', width: '90px', height: '90px' } 
  }
];

const particles = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: `${3 + Math.random() * 7}s`,
  delay: `${Math.random() * 5}s`,
  size: `${Math.random() * 4 + 2}px`,
  isDew: Math.random() > 0.5
}));

const Stage1Interactive3DField = ({ onClose, onNext }) => {
  const [completed, setCompleted] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = ((e.clientX / innerWidth) - 0.5) * 30; // max 15px translation
    const y = ((e.clientY / innerHeight) - 0.5) * 30;
    setMousePos({ x, y });
  };

  const handleHotspotClick = (id) => {
    if (!completed.includes(id)) {
      setCompleted(prev => [...prev, id]);
    }
    setActiveId(id);
  };

  const allDone = completed.length === hotspotsData.length;
  const activeData = hotspotsData.find(h => h.id === activeId);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#F6F8F5] text-[#0A1A12] overflow-hidden select-none font-sans"
    >
      {/* 1. Lớp nền Background */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform scale-105"
        style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px) scale(1.05)` }}
      >
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Cánh đồng tràm 3D" 
          className="w-full h-full object-cover"
          draggable="false"
        />
        {/* Lớp phủ sương mai */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-[#135E3E]/10 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* Hiệu ứng khí quyển bổ trợ (Hạt bụi & Giọt sương) */}
      <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute rounded-full animate-float-particle ${p.isDew ? 'bg-white/60 blur-[1px]' : 'bg-[#FCD34D]/70 blur-[0.5px]'}`}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
              boxShadow: p.isDew ? '0 0 5px rgba(255,255,255,0.8)' : '0 0 4px rgba(252,211,77,0.5)'
            }}
          ></div>
        ))}
      </div>

      {/* 4. Thanh Tiến Trình & Header */}
      <div className="absolute top-0 left-0 w-full z-40">
        <div className="flex w-full gap-1 p-1">
          <div className="h-1.5 flex-1 bg-white rounded-full overflow-hidden border border-[#8C6928]/30 shadow-[0_0_10px_rgba(19,94,62,0.4)] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#135E3E] to-[#8C6928] w-full animate-slide-right"></div>
          </div>
          <div className="h-1.5 flex-1 bg-white/30 backdrop-blur-sm rounded-full"></div>
          <div className="h-1.5 flex-1 bg-white/30 backdrop-blur-sm rounded-full"></div>
          <div className="h-1.5 flex-1 bg-white/30 backdrop-blur-sm rounded-full"></div>
        </div>

        <div className="flex items-center justify-between px-6 pt-5">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
             <div className="w-6 h-6 rounded bg-[#135E3E] flex items-center justify-center">
               <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#135E3E] font-bold tracking-widest uppercase">
               CHẶNG 01 / 04 // VÙNG NGUYÊN LIỆU BẢN ĐỊA
             </span>
          </div>

          <button 
            onClick={onClose}
            className="hidden md:flex font-['IBM_Plex_Mono'] text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/50 shadow-sm hover:bg-white transition-colors items-center gap-2"
          >
            Bỏ qua về trang kết quả
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
          
          <button 
            onClick={onClose}
            className="md:hidden w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/50 flex items-center justify-center text-gray-800 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* 3. Hệ Thống 3 Hotspots */}
      <div className="absolute inset-0 z-20">
        {hotspotsData.map((hotspot) => {
          const isDone = completed.includes(hotspot.id);
          const isActive = activeId === hotspot.id;
          
          return (
            <div 
              key={hotspot.id}
              className="absolute flex items-center justify-center cursor-pointer group"
              style={{ ...hotspot.style, transform: `translate(-50%, -50%) translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)` }}
              onClick={() => handleHotspotClick(hotspot.id)}
            >
              {!isDone ? (
                <div className="w-14 h-14 rounded-full border-2 border-[#8C6928]/60 shadow-[0_0_0_8px_rgba(140,105,40,0.2)] animate-pulse flex items-center justify-center bg-[#8C6928]/20 backdrop-blur-sm group-hover:scale-110 group-hover:border-[#FCD34D] transition-transform">
                   <div className="w-4 h-4 bg-[#FCD34D] rounded-full shadow-[0_0_15px_rgba(252,211,77,1)] animate-ping relative">
                     <div className="absolute inset-0 bg-white rounded-full scale-50"></div>
                   </div>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isActive ? 'bg-[#8C6928] border-2 border-[#FCD34D] scale-110 shadow-[0_0_20px_rgba(140,105,40,0.5)]' : 'bg-white/90 border-2 border-[#135E3E] backdrop-blur-sm'}`}>
                   <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#135E3E]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Chi tiết Hotspot */}
      {activeData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0A1A12]/60 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl transform animate-pop-in relative">
             <button 
                onClick={() => setActiveId(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="w-12 h-12 rounded-full bg-[#135E3E]/10 flex items-center justify-center text-[#135E3E] mb-4 border border-[#135E3E]/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-[#0A1A12] text-xl font-['Be_Vietnam_Pro'] leading-tight mb-3">
                {activeData.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {activeData.desc}
              </p>
              
              <button 
                onClick={() => setActiveId(null)}
                className="w-full py-3 rounded-xl bg-[#F6F8F5] border border-gray-200 text-[#0A1A12] font-semibold hover:bg-gray-100 transition-colors"
              >
                Đã hiểu
              </button>
           </div>
        </div>
      )}

      {/* 2. Linh Vật Bé Tràm Ú Òa */}
      <div 
        className={`absolute z-30 transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none ${allDone ? 'scale-125' : ''}`}
        style={{ 
          left: '42%', 
          top: isLoaded ? '38%' : '52%',
          transform: `translate(-50%, -50%) translate(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px) ${allDone ? 'scale(1.15)' : 'scale(1)'}`,
          opacity: isLoaded ? 1 : 0
        }}
      >
        <div className="relative">
          {/* Lõi ngực hình giọt ngọc phát sáng nhịp thở */}
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-8 h-10 bg-[#B45309]/40 rounded-full blur-[10px] animate-pulse z-0"></div>
          
          {/* Hình ảnh Linh vật thực tế (Fallback nếu thiếu ảnh) */}
          <div className="w-[140px] h-[180px] relative z-10 drop-shadow-2xl flex items-center justify-center">
            {/* Nếu bạn có file be-tram-mascot.png ở folder public, nó sẽ hiển thị ở đây */}
            <img 
              src="/be-tram-mascot.png" 
              alt="Bé Tràm" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback UI nếu không tìm thấy ảnh
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback Mascot CSS */}
            <div className="hidden absolute inset-0 flex-col items-center justify-center" style={{ display: 'none' }}>
               <div className="w-16 h-16 bg-[#FFF7EE] rounded-full shadow-lg border-2 border-[#135E3E]/10 flex flex-col items-center justify-center relative">
                 <div className="flex gap-2 mb-1">
                   <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                   <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                 </div>
                 <div className="w-3 h-1.5 border-b-2 border-black rounded-b-full"></div>
                 {/* Lõi ngực ngọc hổ phách */}
                 <div className="absolute -bottom-4 w-4 h-6 bg-gradient-to-b from-[#FCD34D] to-[#B45309] rounded-b-full rounded-t-sm shadow-[0_0_10px_rgba(180,83,9,0.8)] animate-pulse border border-white/40"></div>
               </div>
               <div className="absolute -right-4 top-4 w-8 h-3 bg-[#FFF7EE] rounded-full origin-left animate-wave border-2 border-[#135E3E]/10"></div>
            </div>
          </div>
        </div>

        {/* Bóng thoại */}
        {!allDone && (
          <div className="absolute left-[120%] top-0 min-w-[280px] max-w-[320px] bg-white/90 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-5 shadow-[0_15px_35px_rgba(10,26,18,0.12)] animate-slide-in-right opacity-0 animate-delay-1000 hidden md:block">
            <div className="absolute -left-3 top-6 w-4 h-4 bg-white/90 border-l border-b border-emerald-900/10 rotate-45 transform"></div>
            <p className="text-[#0A1A12] text-sm leading-relaxed font-medium">
              Chào bạn! Rừng tràm năm gân đang vào sớm mai trong lành nhất. Bạn hãy chạm vào 3 điểm sáng để cùng mình kiểm tra tiêu chuẩn vùng trồng nhé! ✨
            </p>
          </div>
        )}
      </div>
      
      {/* Mobile Bóng Thoại */}
      {!allDone && (
        <div className="absolute md:hidden bottom-8 left-4 right-4 z-30">
          <div className="bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-2xl p-4 shadow-lg animate-slide-up-fade opacity-0 animate-delay-1000">
            <p className="text-[#0A1A12] text-xs leading-relaxed font-medium">
              Chào bạn! Rừng tràm năm gân đang vào sớm mai trong lành nhất. Bạn hãy chạm vào 3 điểm sáng để cùng mình kiểm tra tiêu chuẩn vùng trồng nhé! ✨
            </p>
          </div>
        </div>
      )}

      {/* Nút Chuyển Chặng */}
      {allDone && (
        <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center animate-slide-up-fade px-4">
          <button 
            onClick={onNext}
            className="max-w-md w-full bg-gradient-to-r from-[#8C6928] to-[#6E501C] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(140,105,40,0.3)] hover:shadow-[0_15px_30px_rgba(140,105,40,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Tiếp Tục: Sang Chặng 02 
            <span className="hidden md:inline">— Chưng Cất Hơi Nước 100°C</span>
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      )}

      {/* Global Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-50vh) scale(0.5); opacity: 0; }
        }
        .animate-float-particle {
          animation-name: float-particle;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes slide-right {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-slide-right {
          animation: slide-right 1s ease-out forwards;
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-fade {
          animation: slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-delay-1000 {
          animation-delay: 1s;
        }
      `}} />
    </div>
  );
};

export default Stage1Interactive3DField;
