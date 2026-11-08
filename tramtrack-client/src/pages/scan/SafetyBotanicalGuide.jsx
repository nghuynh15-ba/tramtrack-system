import React, { useState } from 'react';
import { ArrowLeft, Baby, HeartHandshake, UserPlus, Wind, AlertTriangle, ShieldAlert, ShieldCheck, Droplet, ThermometerSun, EyeOff, PackageCheck, Cross, TriangleAlert } from 'lucide-react';

export default function SafetyBotanicalGuide({
  onBack,
  onReportFake
}) {
  const [activeTab, setActiveTab] = useState('baby');

  const tabs = [
    { id: 'baby', label: 'Trẻ Sơ Sinh & Trẻ Nhỏ', icon: Baby },
    { id: 'mom', label: 'Mẹ Bầu & Sau Sinh', icon: HeartHandshake },
    { id: 'adult', label: 'Người Lớn & Cao Tuổi', icon: UserPlus },
    { id: 'diffuse', label: 'Xông Hơi & Khuếch Tán', icon: Wind },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] text-[#0A1A12] py-8 lg:py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(#135E3E 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* 1. Header Section */}
        <div className="flex flex-col items-start mb-10">
          <button 
            onClick={onBack}
            className="mb-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-emerald-900/10 text-[#0A1A12] shadow-sm hover:scale-105 transition-all"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#135E3E]/10 border border-[#135E3E]/15 font-mono text-[10px] sm:text-[11px] text-[#135E3E] font-bold tracking-widest uppercase mb-4">
            CLINICAL PROTOCOL // DƯỢC ĐIỂN VIỆT NAM V
          </div>
          
          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-widest text-2xl sm:text-3xl lg:text-4xl text-[#0A1A12] mb-2">
            HƯỚNG DẪN SỬ DỤNG AN TOÀN
          </h1>
          <h2 className="font-serif italic text-[#8C6928] text-xl sm:text-2xl mb-4">
            Chuẩn Y Khoa Cho Tinh Dầu Tràm Năm Gân 100%
          </h2>
          
          <p className="text-[#4F6357] text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Hoạt chất 1,8-Cineole tự nhiên đạt 71.05% có tính kháng khuẩn mạnh. Vui lòng tuân thủ liều lượng khuyến cáo dưới đây để đạt hiệu quả trị liệu tối ưu và an toàn nhất.
          </p>
        </div>

        {/* 2. Segmented Audience Tabs */}
        <div className="w-full bg-white/90 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-4 sm:p-6 shadow-[0_15px_40px_rgba(10,26,18,0.06)] mb-10">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-semibold text-[13px] sm:text-sm border
                    ${isActive 
                      ? 'bg-[#135E3E] text-white border-[#135E3E] shadow-md' 
                      : 'bg-emerald-900/5 text-[#4F6357] border-transparent hover:bg-emerald-900/10'
                    }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-[#4F6357]'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="w-full min-h-[220px] transition-all duration-500">
            {activeTab === 'baby' && (
              <div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
                <div className="bg-rose-50 border border-rose-900/15 rounded-xl p-3 flex items-start gap-2.5 mb-2">
                  <AlertTriangle size={18} className="text-rose-700 shrink-0 mt-0.5" />
                  <span className="text-[12px] sm:text-[13px] text-rose-900 font-semibold">KHÔNG thoa trực tiếp lên da mặt, cánh mũi hoặc vết thương hở của trẻ.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F6F8F5] p-4 rounded-2xl border border-emerald-900/5">
                    <h4 className="font-bold text-[#135E3E] text-sm mb-2 flex items-center gap-2"><Droplet size={14}/> Pha nước tắm</h4>
                    <p className="text-[13px] text-[#4F6357] leading-relaxed">Nhỏ 3 – 5 giọt vào chậu nước ấm (37°C), khuấy đều trước khi tắm. Không cần tráng lại bằng nước lã.</p>
                  </div>
                  <div className="bg-[#F6F8F5] p-4 rounded-2xl border border-emerald-900/5">
                    <h4 className="font-bold text-[#135E3E] text-sm mb-2 flex items-center gap-2"><ThermometerSun size={14}/> Giữ ấm chống ho đêm</h4>
                    <p className="text-[13px] text-[#4F6357] leading-relaxed">Nhỏ 1 giọt vào lòng bàn chân, massage nhẹ nhàng huyệt Dũng Tuyền rồi đeo tất mỏng trước khi ngủ.</p>
                  </div>
                  <div className="bg-[#F6F8F5] p-4 rounded-2xl border border-emerald-900/5">
                    <h4 className="font-bold text-[#135E3E] text-sm mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Chống côn trùng cắn</h4>
                    <p className="text-[13px] text-[#4F6357] leading-relaxed">Nhỏ 1 giọt vào gấu áo, yếm hoặc vạt gối nằm của bé để xua đuổi muỗi và côn trùng an toàn.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mom' && (
              <div className="space-y-4 animate-[fade-in_0.3s_ease-out] flex flex-col justify-center h-full">
                <div className="bg-[#F6F8F5] p-5 rounded-2xl border border-emerald-900/5 flex items-start gap-4">
                  <HeartHandshake size={24} className="text-[#135E3E] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-[#0A1A12] text-sm mb-2">Giữ ấm & Thông khí huyết</h4>
                    <p className="text-[13px] text-[#4F6357] leading-relaxed">Thoa vùng lưng eo, dọc cột sống và lòng bàn chân để giải cảm, giữ ấm cơ thể sau sinh hoặc khi thay đổi thời tiết.</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-900/15 rounded-2xl p-4 flex items-start gap-3">
                  <TriangleAlert size={20} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-900 font-medium leading-relaxed">Lưu ý: Sử dụng thận trọng trong 3 tháng đầu thai kỳ. Trong giai đoạn nhạy cảm này, ưu tiên liệu pháp khuếch tán hương phòng nhẹ nhàng thay vì xoa bóp trực tiếp.</p>
                </div>
              </div>
            )}

            {activeTab === 'adult' && (
              <div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F6F8F5] p-5 rounded-2xl border border-emerald-900/5 h-full">
                    <h4 className="font-bold text-[#135E3E] text-sm mb-2">Xông mũi họng</h4>
                    <p className="text-[13px] text-[#4F6357] leading-relaxed">Nhỏ 2 – 3 giọt tinh dầu vào cốc nước sôi (khoảng 80°C). Trùm khăn nhẹ và hít sâu hơi nước bốc lên để hỗ trợ tan đờm, thông xoang và sát khuẩn vòm họng.</p>
                  </div>
                  <div className="bg-[#F6F8F5] p-5 rounded-2xl border border-emerald-900/5 h-full">
                    <h4 className="font-bold text-[#135E3E] text-sm mb-2">Xoa bóp xương khớp</h4>
                    <p className="text-[13px] text-[#4F6357] leading-relaxed">Pha 2-3 giọt tràm cùng một lượng dầu nền (như dầu dừa, dầu olive, hoặc dầu massage). Xoa bóp trực tiếp lên vùng cơ khớp bị đau nhức, mỏi mệt.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'diffuse' && (
              <div className="space-y-4 animate-[fade-in_0.3s_ease-out] flex flex-col justify-center h-full">
                <div className="bg-[#F6F8F5] p-6 rounded-2xl border border-emerald-900/5 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-900/10 shrink-0">
                    <Wind size={28} className="text-[#135E3E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A1A12] text-base mb-2">Liệu Pháp Không Gian Sạch</h4>
                    <p className="text-[13px] sm:text-sm text-[#4F6357] leading-relaxed">
                      Sử dụng cho máy khuếch tán hoặc đèn xông: Nhỏ <strong className="text-[#135E3E]">4 – 6 giọt</strong> cho phòng có diện tích từ 15 – 25m². Hương tràm giúp tạo ion kháng khuẩn không khí, khử mùi nấm mốc và mang lại cảm giác thư thái tự nhiên.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. The 4 Golden Protocols */}
        <div className="w-full my-8">
          <h3 className="font-mono text-[12px] font-bold text-[#0A1A12] uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#135E3E]" /> 4 QUY TẮC AN TOÀN BẮT BUỘC
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white/60 backdrop-blur-sm border border-emerald-900/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
              <div className="text-[#8C6928] font-bold text-lg font-mono">01</div>
              <div>
                <h4 className="font-bold text-[#0A1A12] text-[13px] uppercase tracking-wide mb-1">Chỉ Dùng Ngoài Da & Xông Hơi</h4>
                <p className="text-[12px] text-[#4F6357] leading-relaxed">Tuyệt đối không được uống trực tiếp tinh dầu dưới mọi hình thức để tránh ngộ độc.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-emerald-900/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
              <div className="text-[#8C6928] font-bold text-lg font-mono">02</div>
              <div>
                <h4 className="font-bold text-[#0A1A12] text-[13px] uppercase tracking-wide mb-1">Tránh Xa Vùng Mắt & Màng Nhầy</h4>
                <p className="text-[12px] text-[#4F6357] leading-relaxed">Tinh dầu nguyên chất nồng độ cao có thể gây bỏng rát giác mạc và niêm mạc mỏng.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-emerald-900/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
              <div className="text-[#8C6928] font-bold text-lg font-mono">03</div>
              <div>
                <h4 className="font-bold text-[#0A1A12] text-[13px] uppercase tracking-wide mb-1">Thử Phản Ứng (Patch Test)</h4>
                <p className="text-[12px] text-[#4F6357] leading-relaxed">Với làn da cực kỳ nhạy cảm, thoa 1 giọt pha loãng lên mặt trong cổ tay và theo dõi 24h.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-emerald-900/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
              <div className="text-[#8C6928] font-bold text-lg font-mono">04</div>
              <div>
                <h4 className="font-bold text-[#0A1A12] text-[13px] uppercase tracking-wide mb-1">Bảo Quản Khép Kín</h4>
                <p className="text-[12px] text-[#4F6357] leading-relaxed">Đậy chặt nắp sau khi dùng, bảo quản dưới 30°C, tránh ánh nắng để không làm oxy hóa Cineole.</p>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Clinical First-Aid Box */}
        <div className="w-full bg-rose-50/70 backdrop-blur-md border border-rose-900/15 rounded-3xl p-6 sm:p-8 shadow-sm mb-10">
          <div className="font-mono text-[13px] font-bold text-[#991B1B] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Cross size={18} strokeWidth={2.5} /> QUY TRÌNH XỬ LÝ SỰ CỐ KHẨN CẤP
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 border border-rose-900/10 rounded-2xl p-5">
              <h4 className="font-bold text-rose-900 text-sm mb-2 flex items-center gap-2">
                <EyeOff size={16} /> Tình huống: Dính vào mắt
              </h4>
              <p className="text-[13px] text-rose-950 leading-relaxed font-medium">
                <strong className="text-[#991B1B]">KHÔNG DÙNG NƯỚC RỬA NGAY</strong> (dầu không tan trong nước và sẽ loang làm rát hơn). Dùng tăm bông hoặc bông tẩy trang thấm dầu thực vật ăn được (dầu ô liu, dầu dừa) hoặc sữa tươi không đường lau nhẹ vùng mắt để hòa tan tinh dầu, sau đó chớp mắt nhiều lần trong nước muối sinh lý (0.9%).
              </p>
            </div>
            
            <div className="bg-white/80 border border-rose-900/10 rounded-2xl p-5">
              <h4 className="font-bold text-rose-900 text-sm mb-2 flex items-center gap-2">
                <PackageCheck size={16} /> Tình huống: Uống nhầm
              </h4>
              <p className="text-[13px] text-rose-950 leading-relaxed font-medium">
                <strong className="text-[#991B1B]">KHÔNG cố gắng gây nôn mửa.</strong> Cho nạn nhân uống ngay nhiều nước ấm hoặc sữa tươi nguyên kem để làm loãng nồng độ và bọc niêm mạc dạ dày. Đưa ngay đến trung tâm y tế hoặc bệnh viện gần nhất kèm theo vỏ/chai tinh dầu để bác sĩ xác định hoạt chất.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
          <button 
            onClick={onBack}
            className="w-full sm:w-auto bg-[#8C6928] hover:bg-[#7E5C20] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm uppercase tracking-wide"
          >
            Quay Về Chứng Thư Xác Thực
          </button>
          
          <button 
            onClick={onReportFake}
            className="w-full sm:w-auto bg-white border border-rose-500/30 text-rose-700 hover:bg-rose-50 font-semibold py-3.5 px-8 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
          >
            Báo Cáo Nghi Ngờ Hàng Giả Khi Da Bị Rát Cồn
          </button>
        </div>

      </div>
    </div>
  );
}
