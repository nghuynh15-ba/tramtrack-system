import React, { useState } from 'react';
import { Search, QrCode, ShieldCheck, Leaf, AlertCircle } from 'lucide-react';
import { chuanHoaSerial, serialTuChuoiQuet, serialDungDinhDang } from '../../../services/ma';

/** Điều hướng kiểu của dự án: đổi địa chỉ rồi báo cho App vẽ lại. */
function di(duongDan) {
  window.history.pushState({}, '', duongDan);
  window.dispatchEvent(new Event('popstate'));
  window.scrollTo(0, 0);
}

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState('verify');
  const [serial, setSerial] = useState('');
  const [loi, setLoi] = useState(null);

  /**
   * Cả hai thẻ đều hỏi SERIAL công khai, vì cả hai tầng đều bắt đầu từ nó:
   * Tầng 2 không thể kích hoạt nếu chỉ có mã cào mà không biết tem nào.
   * Khác nhau ở đích đến — tra cứu hay kích hoạt.
   */
  function traCuu() {
    const tho = serial.trim();
    if (!tho) { setLoi('Hãy nhập serial in trên tem.'); return; }
    const s = serialTuChuoiQuet(tho) || chuanHoaSerial(tho);
    if (!serialDungDinhDang(s)) {
      setLoi('Serial có dạng TDT-2026-000000 — bốn chữ số năm, rồi sáu chữ số.');
      return;
    }
    setLoi(null);
    di(activeTab === 'verify' ? `/s/${s}` : `/a/${s}`);
  }

  return (
    <section className="relative min-h-[100vh] pt-32 pb-20 overflow-hidden bg-[#FDFBF7] text-[#0A1A12] flex flex-col justify-center selection:bg-[#135E3E] selection:text-white">
      {/* Botanical Background Auras */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#9E7B3B]/10 to-transparent rounded-full blur-[100px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#135E3E]/10 to-transparent rounded-full blur-[100px] pointer-events-none -translate-x-1/3 -translate-y-1/2" />
      
      {/* Decorative leaf watermark (pure CSS shapes) */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#135E3E]/5 rounded-[100px] rotate-45 blur-2xl" />

      <div className="container max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Typography & Search ── */}
          <div className="lg:col-span-7 flex flex-col text-center lg:text-left z-20">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#135E3E]/20 bg-white/50 text-[#135E3E] text-xs font-bold uppercase tracking-[0.2em] animate-[fade-in-up_1s_ease-out] w-fit mx-auto lg:mx-0 mb-8 shadow-sm backdrop-blur-sm">
              <ShieldCheck size={14} />
              Nền tảng Truy xuất Độc quyền
            </div>
            
            {/* Headline */}
            <div className="space-y-6 mb-10">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.8rem] font-extrabold font-serif leading-[1.1] text-[#0A1A12] animate-[fade-in-up_1s_ease-out_0.2s_both]">
                Minh bạch <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135E3E] to-[#9E7B3B] italic font-normal text-6xl sm:text-7xl lg:text-[5.5rem] mt-2 block drop-shadow-sm">
                  Từng Giọt Tràm
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed font-medium animate-[fade-in-up_1s_ease-out_0.4s_both] max-w-xl mx-auto lg:mx-0">
                Hệ thống số hóa hành trình tinh dầu Tràm Năm Gân đầu tiên tại Việt Nam. Dữ liệu được bảo vệ bằng mật mã học, chặn đứng mọi rủi ro làm giả.
              </p>
            </div>

            {/* Interactive Search Box */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] p-4 sm:p-5 shadow-[0_20px_50px_rgba(10,26,18,0.05)] max-w-2xl mx-auto lg:mx-0 animate-[fade-in-up_1s_ease-out_0.6s_both] w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9E7B3B]/5 to-transparent opacity-50" />
              <div className="relative">
                <div className="flex bg-[#135E3E]/5 p-1.5 rounded-2xl w-fit mb-5 mx-auto lg:mx-0">
                  <button
                    onClick={() => setActiveTab('verify')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                      activeTab === 'verify' ? 'bg-white text-[#135E3E] shadow-sm scale-100' : 'text-gray-500 hover:text-[#0A1A12] scale-95 hover:scale-100'
                    }`}
                  >
                    Kiểm tra lô
                  </button>
                  <button
                    onClick={() => setActiveTab('lookup')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                      activeTab === 'lookup' ? 'bg-white text-[#135E3E] shadow-sm scale-100' : 'text-gray-500 hover:text-[#0A1A12] scale-95 hover:scale-100'
                    }`}
                  >
                    Mã cào bảo mật
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Search size={20} className="text-[#9E7B3B] group-focus-within:text-[#135E3E] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={serial}
                      onChange={(e) => { setSerial(e.target.value.toUpperCase()); setLoi(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') traCuu(); }}
                      placeholder={activeTab === 'verify'
                        ? 'Nhập serial trên tem, VD: TDT-2026-900001'
                        : 'Nhập serial trên tem để sang bước nhập mã cào'}
                      className="w-full h-full bg-white border border-[#135E3E]/10 rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-[#0A1A12] placeholder-gray-400 focus:border-[#135E3E] focus:ring-2 focus:ring-[#135E3E]/10 outline-none transition-all shadow-inner"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <a href="/scan" className="bg-white border border-[#135E3E]/10 text-[#135E3E] px-5 py-4 rounded-2xl font-bold hover:bg-[#135E3E]/5 hover:border-[#135E3E] hover:scale-105 transition-all duration-300 shadow-sm flex items-center justify-center group" title="Quét Mã QR">
                      <QrCode size={22} className="group-hover:scale-110 transition-transform" />
                    </a>
                    <button
                      onClick={traCuu}
                      className="bg-gradient-to-r from-[#135E3E] to-[#0A1A12] text-white px-8 py-4 rounded-2xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-300 shadow-[0_15px_30px_rgba(19,94,62,0.25)] flex items-center justify-center"
                    >
                      Tra Cứu
                    </button>
                  </div>
                </div>

                {loi && (
                  <div className="mt-3 flex items-start gap-2 text-left">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-rose-700 text-[13px] leading-relaxed font-medium">{loi}</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* ── Right Column: Majestic Seal/Badge ── */}
          <div className="lg:col-span-5 flex justify-center items-center relative h-[450px] lg:h-[600px] animate-[fade-in_1.5s_ease-out] mt-10 lg:mt-0">
            
            {/* Spinning Golden Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] rounded-full border border-dashed border-[#9E7B3B]/30 animate-[spin_40s_linear_infinite]" />
               <div className="absolute w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full border border-[#135E3E]/15 animate-[spin_60s_linear_infinite_reverse]" />
            </div>

            {/* Glowing Backdrop */}
            <div className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-gradient-to-br from-[#DFBA73]/30 to-[#135E3E]/20 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '4s' }} />

            {/* The Huge Seal */}
            <div className="relative z-20 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full bg-white/40 backdrop-blur-xl border border-white shadow-[0_30px_60px_rgba(19,94,62,0.1)] flex flex-col items-center justify-center p-4 hover:scale-105 transition-transform duration-700">
               
               {/* Inner gold ring */}
               <div className="absolute inset-4 rounded-full border-[2px] border-[#9E7B3B]/30 flex items-center justify-center">
                 <div className="absolute inset-2 rounded-full border border-[#135E3E]/20 border-dashed animate-[spin_30s_linear_infinite]" />
               </div>

               <Leaf size={48} className="text-[#135E3E] mb-3 drop-shadow-md" strokeWidth={1.5} />
               <div className="font-serif text-[#0A1A12] text-2xl font-bold tracking-wider text-center leading-tight">
                 100% PURE
                 <br />
                 <span className="text-[#9E7B3B] text-xl italic font-normal">Melaleuca</span>
               </div>
               
               <div className="mt-4 flex items-center gap-2 bg-[#135E3E]/5 px-3 py-1 rounded-full border border-[#135E3E]/10">
                 <ShieldCheck size={12} className="text-[#135E3E]" />
                 {/* Trước đây dòng này ghi "Verified by Blockchain". Hệ thống
                     không dùng blockchain — và chính việc không dùng mới là
                     điểm phân biệt với các giải pháp truy xuất theo lô. */}
                 <span className="text-[9px] font-bold text-[#135E3E] uppercase tracking-widest">Định danh từng chai</span>
               </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute top-[15%] right-0 lg:-right-4 z-30 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-3 animate-[float-gentle_4s_ease-in-out_infinite]">
              <div className="w-10 h-10 rounded-full bg-[#135E3E]/10 flex items-center justify-center text-[#135E3E]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Argon2id Hash</div>
                <div className="text-sm font-bold text-[#0A1A12]">Bảo mật tuyệt đối</div>
              </div>
            </div>

            <div className="absolute bottom-[15%] left-0 lg:-left-4 z-30 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-3 animate-[float-gentle_5s_ease-in-out_infinite_reverse]">
              <div className="w-10 h-10 rounded-full bg-[#9E7B3B]/10 flex items-center justify-center text-[#9E7B3B]">
                <Search size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kiểm nghiệm</div>
                <div className="text-sm font-bold text-[#0A1A12]">COA Chuẩn Quốc Tế</div>
              </div>
            </div>
            
          </div>

        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  );
}
