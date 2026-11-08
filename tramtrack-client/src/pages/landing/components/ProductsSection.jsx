import React from 'react';
import { ArrowRight, ShoppingBag, Droplets, ShieldCheck, Leaf } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Tinh dầu Tràm Năm Gân',
    subtitle: 'Nguyên Bản',
    category: 'Essential Oil',
    image: '/assets/product-essential-oil.png',
    description: 'Chiết xuất 100% tinh khiết với hàm lượng 1,8-Cineole trên 60%. Kháng khuẩn, hỗ trợ hô hấp, giảm thiểu căng thẳng và thư giãn tuyệt đối.',
    tags: ['Nguyên chất', 'Trị liệu'],
    icon: Droplets,
    accent: 'from-[#135E3E]/20 to-[#9E7B3B]/20'
  },
  {
    id: 2,
    name: 'Sữa rửa tay thảo mộc',
    subtitle: 'Sát Khuẩn',
    category: 'Personal Care',
    image: '/assets/product-hand-wash.png',
    description: 'Kết hợp tinh dầu tràm tự nhiên và các dưỡng chất cấp ẩm, làm sạch sâu vi khuẩn mà không gây khô ráp da tay.',
    tags: ['Bảo vệ', 'Mềm mịn'],
    icon: ShieldCheck,
    accent: 'from-blue-500/20 to-teal-500/20'
  },
  {
    id: 3,
    name: 'Cao xoa bóp Tràm',
    subtitle: 'Tự Nhiên',
    category: 'Therapeutic Balm',
    image: '/assets/product-balm.png',
    description: 'Sáp dưỡng hòa quyện từ sáp ong rừng và tinh dầu tràm. Giữ ấm cơ thể, giảm nhức mỏi cơ khớp, xoa dịu vết côn trùng cắn.',
    tags: ['Giữ ấm', 'Tiện lợi'],
    icon: Leaf,
    accent: 'from-amber-500/20 to-orange-500/20'
  }
];

/** Điều hướng kiểu của dự án: đổi địa chỉ rồi báo cho App vẽ lại. */
function di(duongDan) {
  window.history.pushState({}, '', duongDan);
  window.dispatchEvent(new Event('popstate'));
  window.scrollTo(0, 0);
}

export default function ProductsSection() {
  return (
    <section className="relative py-32 bg-[#FDFBF7] overflow-hidden" id="products">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#9E7B3B]/10 to-transparent rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-[#135E3E]/10 to-transparent rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="container max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#135E3E]/20 bg-[#135E3E]/5 text-[#135E3E] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <ShoppingBag size={14} />
              Bộ Sưu Tập Sản Phẩm
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#0A1A12] leading-[1.1]">
              Tinh túy nguyên bản,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135E3E] to-[#9E7B3B] italic font-normal">Nuôi dưỡng tự nhiên</span>
            </h2>
          </div>
          <button
            onClick={() => di('/ecosystem')}
            className="hidden md:inline-flex items-center gap-2 text-[#0A1A12] font-bold tracking-widest uppercase text-sm border-b-2 border-[#9E7B3B] pb-1 hover:text-[#135E3E] hover:border-[#135E3E] transition-colors group"
          >
            Xem tất cả <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-[#135E3E]/10 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(19,94,62,0.12)] hover:border-[#135E3E]/30 transition-all duration-700 cursor-pointer transform hover:-translate-y-3">
              
              {/* Product Image Area */}
              <div className="relative aspect-[4/5] bg-[#FDFBF7] p-12 flex items-center justify-center overflow-hidden">
                {/* Soft glowing orb behind product */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr ${product.accent} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain relative z-20 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out mix-blend-multiply"
                />
                
                {/* Category Badge */}
                <div className="absolute top-6 left-6 z-30">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-[0.15em] text-[#0A1A12] shadow-sm border border-gray-100">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8 sm:p-10 flex flex-col flex-1 bg-white relative z-20">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#135E3E]/5 flex items-center justify-center text-[#9E7B3B]">
                    <product.icon size={14} />
                  </div>
                  <div className="flex gap-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-[#0A1A12] mb-1 group-hover:text-[#135E3E] transition-colors leading-snug">
                  {product.name}
                </h3>
                <div className="text-lg font-serif italic text-[#9E7B3B] mb-4">
                  {product.subtitle}
                </div>
                
                <p className="text-gray-600 text-[15px] leading-relaxed mb-8 flex-1">
                  {product.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-[#0A1A12] text-xs uppercase tracking-[0.2em] group-hover:text-[#135E3E] transition-colors">Khám phá</span>
                  <div className="w-12 h-12 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#135E3E] border border-gray-100 group-hover:bg-[#135E3E] group-hover:text-white group-hover:border-[#135E3E] transition-all duration-500 shadow-sm">
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <button
            onClick={() => di('/ecosystem')}
            className="inline-flex items-center gap-2 text-[#0A1A12] font-bold tracking-widest uppercase text-sm border-b-2 border-[#9E7B3B] pb-1 hover:text-[#135E3E] hover:border-[#135E3E] transition-colors group"
          >
            Xem tất cả <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
