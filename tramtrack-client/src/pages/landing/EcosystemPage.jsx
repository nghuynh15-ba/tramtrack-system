import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Droplets, Sparkles, Leaf, BookOpen, Map, TestTube, Sun, Info, Bird, Fish, Wind, Sprout, ShieldCheck, MapPin } from 'lucide-react';

const SPECIMEN_PARTS = [
  {
    id: 'flower',
    label: 'Ngọn hoa',
    description: 'Hoa mọc thành bông đuôi sóc màu trắng ngà hoặc kem. Khác biệt rõ rệt giúp nhận diện chính xác so với các loài tràm khác.',
    icon: Sparkles,
    boxStyles: { top: '4%', left: '42%', width: '16%', height: '18%' },
    pointerStyles: { top: '50%', left: '100%', width: '120px' },
    tooltipStyles: { top: '50%', left: 'calc(100% + 120px)', transform: 'translateY(-50%)' },
    align: 'right'
  },
  {
    id: 'leaf',
    label: 'Lá hình mũi mác',
    description: 'Phiến lá có 5 gân chạy dọc song song rõ rệt. Hàm lượng 1,8-Cineole dồi dào, là đặc tính phân loại cốt lõi phân biệt với tràm gió (Melaleuca cajuputi).',
    icon: Leaf,
    boxStyles: { top: '24%', left: '20%', width: '60%', height: '35%' },
    pointerStyles: { top: '50%', right: '100%', width: '80px' },
    tooltipStyles: { top: '50%', right: 'calc(100% + 80px)', transform: 'translateY(-50%)' },
    align: 'left'
  },
  {
    id: 'bark',
    label: 'Thân vỏ (Paperbark)',
    description: 'Vỏ xốp mềm, bong tróc thành nhiều lớp mỏng xếp chồng. Hệ rễ bám sâu giúp cây đứng vững trên nền đất yếu, ngập nước hoặc phèn chua.',
    icon: Droplets,
    boxStyles: { top: '60%', left: '45%', width: '10%', height: '32%' },
    pointerStyles: { top: '50%', left: '100%', width: '120px' },
    tooltipStyles: { top: '50%', left: 'calc(100% + 120px)', transform: 'translateY(-50%)' },
    align: 'right'
  },
];

export default function EcosystemPage() {
  const [activePart, setActivePart] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0A1A12] flex flex-col font-sans overflow-hidden selection:bg-[#9E7B3B] selection:text-white">
      <Navbar />
      
      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4 bg-[#FDFBF7]">
          {/* Parallax Background Aura */}
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#135E3E]/5 rounded-full blur-[120px] pointer-events-none"
            style={{ transform: `translate(-50%, ${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#9E7B3B]/10 rounded-full blur-[100px] pointer-events-none"
            style={{ transform: `translate(0, ${scrollY * -0.2}px)` }}
          />

          <div className="container max-w-4xl mx-auto relative z-10 text-center mt-12">
            <div className="flex flex-col items-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#135E3E]/20 bg-[#135E3E]/5 text-[#135E3E] text-xs font-bold uppercase tracking-[0.2em] shadow-sm animate-[fade-in-up_1s_ease-out]">
                <Leaf size={14} />
                Hệ Sinh Thái Tự Nhiên
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif leading-[1.1] text-[#0A1A12] animate-[fade-in-up_1s_ease-out_0.2s_both]">
                  Tràm Năm Gân<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9E7B3B] to-[#7E5C20] italic font-normal text-4xl md:text-6xl mt-4 block">Melaleuca quinquenervia</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium animate-[fade-in-up_1s_ease-out_0.4s_both] max-w-3xl mx-auto mt-6">
                  Không chỉ là một vùng nguyên liệu, đây là một quần xã sinh học ngập nước đa dạng. Nơi Tràm Năm Gân vươn mình mạnh mẽ trên vùng đất phèn chua, mang lại giá trị sinh thái, kinh tế xanh và hướng tới mục tiêu Net Zero bền vững.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 1. NHẬN DIỆN SINH HỌC & ĐẶC ĐIỂM ================= */}
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="container max-w-7xl mx-auto px-4">
            
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
               <div className="text-[#9E7B3B] font-bold tracking-[0.2em] uppercase text-sm mb-4">01. Nhận diện cốt lõi</div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-[#0A1A12]">
                Giải Phẫu Hình Thái Tràm 5 Gân
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Sự khác biệt hoàn toàn với tràm gió (Melaleuca cajuputi). Đưa chuột (hoặc chạm) vào các vùng để khám phá những đặc điểm tiến hoá giúp loài cây này sinh tồn trên đất ngập phèn.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center">
              {/* Diagram Aura */}
              <div className="absolute inset-0 bg-[#135E3E]/5 rounded-full blur-[100px] scale-90 pointer-events-none" />
              
              {/* Image Container */}
              <div className="relative w-full max-w-[360px] flex items-center justify-center mb-12 md:mb-0">
                <img
                  src="/assets/botanical/melaleuca-specimen.png"
                  alt="Giải phẫu Melaleuca quinquenervia"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />
                
                {/* Desktop Interactive Overlay */}
                <div className="hidden md:block absolute inset-0 z-20">
                  {SPECIMEN_PARTS.map((part, idx) => {
                    const isActive = activePart === part.id;
                    const isHoveringAny = activePart !== null;
                    
                    return (
                      <div
                        key={part.id}
                        className="absolute group"
                        style={part.boxStyles}
                        onMouseEnter={() => setActivePart(part.id)}
                        onMouseLeave={() => setActivePart(null)}
                      >
                        {/* The Bounding Box Frame */}
                        <div className={`relative w-full h-full border border-dashed transition-all duration-300 ${isActive ? 'border-[#9E7B3B] bg-[#9E7B3B]/10 scale-105 z-30 shadow-[0_0_20px_rgba(158,123,59,0.15)] rounded-lg' : 'border-[#135E3E]/40 bg-[#135E3E]/5 cursor-pointer hover:border-[#135E3E]/70 rounded-lg'}`}>
                           <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#135E3E] text-white flex items-center justify-center text-[8px] font-bold">{idx+1}</div>
                        </div>

                        {/* Connecting Line */}
                        <div 
                          className={`absolute h-[1px] transition-all duration-500 origin-left pointer-events-none ${isActive ? 'bg-[#9E7B3B]' : 'bg-[#135E3E]/40'}`}
                          style={{
                            ...part.pointerStyles,
                            transformOrigin: part.align === 'left' ? 'right center' : 'left center',
                            opacity: isActive ? 1 : (isHoveringAny ? 0.3 : 1)
                          }}
                        >
                          <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border transition-colors duration-300 ${isActive ? 'bg-[#9E7B3B] border-white' : 'bg-[#135E3E]/40 border-transparent'}`} 
                               style={{ [part.align === 'left' ? 'left' : 'right']: '-4px' }} 
                          />
                        </div>

                        {/* Content Panel */}
                        <div 
                          className={`absolute w-[280px] lg:w-[320px] p-6 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[1.5rem] pointer-events-none ${isActive ? 'opacity-100 scale-100 z-40 translate-y-0' : (isHoveringAny ? 'opacity-30 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0')}`}
                          style={part.tooltipStyles}
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${isActive ? 'bg-[#9E7B3B]/10 border-[#9E7B3B]/30 text-[#9E7B3B]' : 'bg-[#135E3E]/5 border-[#135E3E]/10 text-[#135E3E]'}`}>
                              <part.icon size={18} />
                            </div>
                            <h3 className="font-serif font-bold text-[#0A1A12] text-xl">{part.label}</h3>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {part.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Mobile Numbers Overlay */}
                <div className="md:hidden absolute inset-0 z-20 pointer-events-none">
                   {SPECIMEN_PARTS.map((part, idx) => (
                      <div key={part.id} className="absolute" style={part.boxStyles}>
                        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#135E3E] border-4 border-white text-white flex items-center justify-center font-bold shadow-lg">
                          {idx + 1}
                        </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Mobile Content List */}
              <div className="md:hidden w-full max-w-md mx-auto space-y-4 relative z-20">
                {SPECIMEN_PARTS.map((part, idx) => (
                  <div key={part.id} className="p-6 bg-[#FDFBF7] border border-gray-100 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#135E3E] text-white flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="font-serif font-bold text-[#0A1A12] text-xl">{part.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {part.description}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ================= 2. ĐA DẠNG SINH HỌC ================= */}
        <section className="py-24 bg-[#FDFBF7] relative border-t border-gray-100">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#9E7B3B] font-bold tracking-[0.2em] uppercase text-sm mb-4">02. Cấu trúc sinh thái</div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-[#0A1A12]">
                Đa Dạng Sinh Học Vùng Ngập Nước
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Bức tranh toàn cảnh về quần xã sinh vật cộng sinh xoay quanh rừng Tràm Năm Gân.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 bg-[#135E3E]/5 rounded-2xl flex items-center justify-center text-[#135E3E] mb-6">
                  <Sprout size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Thảm thực vật</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Các loài phụ sinh, rêu, dương xỉ bám trên thân cây; tầng nước phong phú với sen, súng, bèo và các loài tảo bản địa.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 bg-[#9E7B3B]/10 rounded-2xl flex items-center justify-center text-[#9E7B3B] mb-6">
                  <Bird size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Chim nước</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Trở thành môi trường làm tổ và kiếm ăn trú ẩn an toàn của nhiều loài hoang dã như cò, diệc, cồng cộc, trích cồ.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <Fish size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Hệ thủy sinh & bò sát</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Hệ sinh thái dưới nước vô cùng trù phú với các loài cá đồng (cá lóc, rô, sặc), ếch nhái, rắn nước và rùa đầm lầy.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <Wind size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Dịch vụ sinh thái</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Lọc phèn, lắng đọng phù sa, làm sạch nguồn nước mặt, điều hòa vi khí hậu và giảm thiểu nguy cơ cháy rừng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. GIÁ TRỊ KINH TẾ XANH ================= */}
        <section className="py-24 bg-white relative border-t border-gray-100">
          <div className="container max-w-7xl mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#9E7B3B] font-bold tracking-[0.2em] uppercase text-sm mb-4">03. Sinh kế tuần hoàn</div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-[#0A1A12]">
                Giá Trị Kinh Tế Xanh
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Phát triển kinh tế bền vững không xâm hại đến cấu trúc tự nhiên của rừng, mang lại sinh kế ổn định cho cộng đồng địa phương.
              </p>
            </div>

            <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] bg-white">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFBF7] border-b border-gray-100">
                    <th className="py-6 px-8 text-[#0A1A12] font-serif font-bold text-lg w-1/3">Sản phẩm / Giá trị</th>
                    <th className="py-6 px-8 text-[#0A1A12] font-serif font-bold text-lg w-1/3">Đặc tính nổi bật</th>
                    <th className="py-6 px-8 text-[#0A1A12] font-serif font-bold text-lg w-1/3">Ứng dụng thực tế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#135E3E]/10 flex items-center justify-center text-[#135E3E]">
                          <Droplets size={16} />
                        </div>
                        <span className="font-bold text-[#0A1A12]">Tinh dầu Niaouli (Tràm 5 gân)</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-gray-600 font-medium text-sm leading-relaxed">
                      Hàm lượng 1,8-Cineole (Eucalyptol) cao (50–65%), mùi hương thanh dịu và ít hăng hơn tràm gió.
                    </td>
                    <td className="py-6 px-8 text-gray-600 font-medium text-sm leading-relaxed">
                      Dược liệu đường hô hấp, sản phẩm kháng khuẩn, mỹ phẩm, xông tinh dầu cao cấp.
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9E7B3B]/10 flex items-center justify-center text-[#9E7B3B]">
                          <Sun size={16} />
                        </div>
                        <span className="font-bold text-[#0A1A12]">Mật ong hoa tràm</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-gray-600 font-medium text-sm leading-relaxed">
                      Mật có màu hổ phách sẫm tuyệt đẹp, giàu khoáng chất, vị thanh đậm đặc trưng của hệ sinh thái ngập nước.
                    </td>
                    <td className="py-6 px-8 text-gray-600 font-medium text-sm leading-relaxed">
                      Thực phẩm hữu cơ cao cấp, dược liệu bồi bổ sức khỏe tự nhiên.
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                          <Leaf size={16} />
                        </div>
                        <span className="font-bold text-[#0A1A12]">Sinh khối & Cọc cừ</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-gray-600 font-medium text-sm leading-relaxed">
                      Khả năng tái sinh chồi rất nhanh sau khai thác tỉa thưa; gỗ có đặc tính chịu ngập nước cực tốt.
                    </td>
                    <td className="py-6 px-8 text-gray-600 font-medium text-sm leading-relaxed">
                      Gia cố công trình trên nền đất yếu, sản xuất than sinh học (biochar) giúp cải tạo đất.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= 4. BỂ CHỨA CARBON ================= */}
        <section className="py-24 relative overflow-hidden bg-[#0A1A12]">
          {/* Background image overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A12] to-transparent opacity-80" />
          
          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
            <div className="text-[#9E7B3B] font-bold tracking-[0.2em] uppercase text-sm mb-4">04. Hành trình xanh</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-12">
              Bể Chứa Carbon & Mục Tiêu Net Zero
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 text-left max-w-5xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2rem]">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                  <Leaf size={24} />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4">Cơ chế lưu trữ Blue/Wetland Carbon</h3>
                <p className="text-gray-300 leading-relaxed">
                  Hệ sinh thái đất ngập nước tràm 5 gân có khả năng cô lập carbon vượt trội. Không chỉ tích lũy ở sinh khối thân - cành - lá, một lượng khổng lồ chất hữu cơ còn được bảo quản trong tầng trầm tích và than bùn ngập nước, nơi quá trình phân hủy yếm khí diễn ra rất chậm, khóa chặt Carbon hàng thế kỷ.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2rem]">
                <div className="w-12 h-12 bg-[#9E7B3B]/20 rounded-2xl flex items-center justify-center text-[#9E7B3B] mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4">Tiềm năng tín chỉ carbon</h3>
                <p className="text-gray-300 leading-relaxed">
                  Chúng tôi đang xây dựng hệ thống thu thập dữ liệu về diện tích, sinh khối tích lũy hàng năm bằng công nghệ viễn thám kết hợp thực địa. Mục tiêu hướng đến các dự án bảo tồn kết hợp cấp chứng chỉ bù trừ phát thải, đóng góp vào mục tiêu Net Zero toàn cầu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5. DU LỊCH & GIÁO DỤC ================= */}
        <section className="py-24 bg-[#FDFBF7]">
          <div className="container max-w-7xl mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#9E7B3B] font-bold tracking-[0.2em] uppercase text-sm mb-4">05. Gắn kết cộng đồng</div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-[#0A1A12]">
                Du Lịch Sinh Thái & Giáo Dục
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Lan tỏa giá trị thiên nhiên qua những trải nghiệm thực tế trân trọng hệ sinh thái.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500">
                <div className="h-48 rounded-xl bg-gray-100 mb-6 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1621217734133-c28fa47b3be5?q=80&w=2070&auto=format&fit=crop" alt="Chèo SUP" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Hoạt động ít phát thải</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Trải nghiệm tuyến chèo SUP/kayak xuyên rừng ngập nước vào mùa nước nổi; tham gia các tour ngắm chim tĩnh lặng vào bình minh và hoàng hôn.
                </p>
              </div>

              <div className="group bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500">
                <div className="h-48 rounded-xl bg-gray-100 mb-6 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1550503080-60b5a6104991?q=80&w=2070&auto=format&fit=crop" alt="Bản địa" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Trải nghiệm bản địa</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tham quan quy trình chưng cất tinh dầu theo chuỗi giá trị sạch; trải nghiệm tự tay thu hoạch mật ong hoa tràm cùng cư dân địa phương.
                </p>
              </div>

              <div className="group bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500">
                <div className="h-48 rounded-xl bg-gray-100 mb-6 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2070&auto=format&fit=crop" alt="Bảo tồn" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0A1A12] mb-3">Quy chuẩn xanh</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Áp dụng nghiêm ngặt bộ nguyên tắc ứng xử du lịch không rác thải (Leave No Trace), bảo vệ nguyên vẹn thảm thực vật và chim hoang dã.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
