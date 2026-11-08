import React, { useState } from 'react';
import { Droplets, Sparkles, Leaf } from 'lucide-react';

const HOTSPOTS = [
  {
    id: 'flower',
    top: '15%',
    left: '52%',
    label: 'Ngọn hoa',
    description: 'Hoa trắng dạng bàn chải, nhị dài tỏa hương đặc trưng. Cụm hoa mọc thành bông hình trụ, là đặc điểm phân loại chính xác nhất.',
    icon: Sparkles,
  },
  {
    id: 'leaf',
    top: '42%',
    left: '30%',
    label: 'Lá Tràm 5 Gân',
    description: 'Đúng 5 gân dọc chạy song song — đặc trưng riêng của Melaleuca quinquenervia. Hàm lượng 1,8-Cineole dồi dào, là nguồn hoạt chất chính.',
    icon: Droplets,
  },
  {
    id: 'bark',
    top: '75%',
    left: '55%',
    label: 'Thân cành',
    description: 'Vỏ xốp bong từng lớp mỏng như giấy (paperbark), tích lũy tannin. Thích nghi xuất sắc với hệ sinh thái ngập phèn miền Tây.',
    icon: Leaf,
  },
];

export default function SpecimenSection() {
  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <section className="relative py-32 bg-white overflow-hidden" id="specimen">
      
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#135E3E]/5 to-[#9E7B3B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 lg:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-20 lg:gap-24">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#135E3E]/20 bg-[#135E3E]/5 text-[#135E3E] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-sm">
            <Leaf size={14} />
            Hệ sinh thái tự nhiên
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#0A1A12] leading-[1.15] mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9E7B3B] to-[#CBA258] italic font-normal text-3xl sm:text-4xl lg:text-5xl block mb-3">Melaleuca quinquenervia</span>
            Mẫu Chuẩn <br className="hidden lg:block"/>
            <span className="text-[#135E3E]">Dược Liệu</span>
          </h2>
          
          <p className="text-gray-600 font-medium leading-relaxed text-lg mb-12 max-w-xl mx-auto lg:mx-0">
            Mỗi lô tinh dầu đều được đối chiếu khắt khe với mẫu chuẩn thực vật học. Chúng tôi cam kết bảo tồn tính nguyên bản của Tràm Năm Gân, đảm bảo đúng loài và đúng nguồn gốc sinh thái ngập phèn.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto lg:mx-0">
            <div className="bg-[#FDFBF7] p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(19,94,62,0.06)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-4xl font-serif font-bold text-[#135E3E] mb-2 group-hover:scale-105 origin-left transition-transform">100%</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Thuần Chủng</div>
            </div>
            <div className="bg-[#FDFBF7] p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(158,123,59,0.06)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-4xl font-serif font-bold text-[#9E7B3B] mb-2 group-hover:scale-105 origin-left transition-transform">Chuẩn</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Dược Điển VN</div>
            </div>
          </div>
        </div>

        {/* Right Content - Interactive Specimen */}
        <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none mx-auto flex justify-center mt-10 lg:mt-0">
          
          {/* Subtle Glow behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[450px] bg-[#135E3E]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-[420px]">
            <img
              src="/assets/botanical/melaleuca-specimen.png"
              alt="Cành mẫu dược liệu Melaleuca quinquenervia — Tràm năm gân"
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(10,26,18,0.2)] hover:scale-105 transition-transform duration-1000 ease-out"
            />

            {/* Hotspots */}
            {HOTSPOTS.map((hs, index) => (
              <div
                key={hs.id}
                className="absolute z-20 cursor-pointer group"
                style={{ top: hs.top, left: hs.left }}
                onMouseEnter={() => setActiveHotspot(hs.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
              >
                {/* Hotspot Dot */}
                <div className="relative flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute w-full h-full bg-[#9E7B3B]/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute w-4 h-4 bg-[#9E7B3B] rounded-full shadow-[0_0_20px_rgba(158,123,59,0.8)] border-2 border-white group-hover:scale-125 transition-transform duration-300" />
                </div>

                {/* Tooltip */}
                <div 
                  className={`absolute ${index === 1 ? 'right-full mr-4 top-1/2 -translate-y-1/2 origin-right' : 'left-1/2 bottom-full mb-4 -translate-x-1/2 origin-bottom'} 
                    w-[280px] sm:w-[320px] bg-white/95 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#135E3E]/10 transition-all duration-300 z-30 pointer-events-none
                    ${activeHotspot === hs.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#135E3E]/5 flex items-center justify-center text-[#135E3E]">
                      <hs.icon size={18} />
                    </div>
                    <span className="font-serif font-bold text-[#0A1A12] text-xl">{hs.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {hs.description}
                  </p>
                  
                  {/* Tooltip Arrow */}
                  <div className={`absolute w-4 h-4 bg-white/95 backdrop-blur-xl border-[#135E3E]/10 rotate-45 
                    ${index === 1 ? 'right-[-8.5px] top-1/2 -translate-y-1/2 border-t border-r' : '-bottom-2 left-1/2 -translate-x-1/2 border-b border-r'}`} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Hint */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
            <Sparkles size={14} className="text-[#9E7B3B]" />
            Chạm vào điểm sáng để khám phá
          </div>

        </div>
      </div>
    </section>
  );
}
