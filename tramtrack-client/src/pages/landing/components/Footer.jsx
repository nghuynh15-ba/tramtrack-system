import React from 'react';
import { ShieldCheck, Sparkles, ArrowRight, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FDFBF7] border-t border-[#135E3E]/10 pt-12 pb-6 relative overflow-hidden text-[#0A1A12]">
      <div className="container max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-10">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="inline-flex items-center gap-2 no-underline group">
              <img
                src="/assets/botanical/logo-icon.png"
                alt="TramTrack"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col justify-center">
                <div className="text-[16px] sm:text-[18px] font-extrabold tracking-widest leading-none flex items-center">
                  <span className="text-[#26442E]">TRAM</span>
                  <span className="text-[#9C7D4D]">TRACK</span>
                </div>
              </div>
            </a>
            
            <p className="text-gray-600 text-xs leading-relaxed max-w-sm">
              Hệ thống định danh và xác thực nguồn gốc tinh dầu tràm năm gân. Cung cấp sự minh bạch tuyệt đối từ nông trại đến tay người tiêu dùng.
            </p>
            
            {/* Contact Info Added */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-gray-700 group">
                <div className="w-8 h-8 rounded-full bg-white border border-[#135E3E]/10 flex items-center justify-center text-[#135E3E] group-hover:bg-[#135E3E] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Phone size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Hotline hỗ trợ</span>
                  <a href="tel:0345757415" className="font-mono text-sm font-bold text-[#0A1A12] hover:text-[#9E7B3B] transition-colors">
                    0345 757 415
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-700 group">
                <div className="w-8 h-8 rounded-full bg-white border border-[#135E3E]/10 flex items-center justify-center text-[#135E3E] group-hover:bg-[#135E3E] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Mail size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Email liên hệ</span>
                  <a href="mailto:nguyenthinhuhuynh8261@gmail.com" className="font-medium text-[#0A1A12] hover:text-[#9E7B3B] transition-colors">
                    nguyenthinhuhuynh8261@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* System status */}
          <div className="space-y-4">
            <h4 className="text-[#135E3E] font-bold uppercase tracking-[0.15em] text-[10px]">Trạng Thái Hệ Thống</h4>
            <div className="bg-white border border-[#135E3E]/10 rounded-xl p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <span className="font-mono text-xs font-bold text-[#0A1A12]">Đang hoạt động</span>
              </div>
              <div className="font-mono text-[10px] text-gray-500 tracking-wider">
                Uptime 99.97% · Core API v2.0
              </div>
            </div>
          </div>

          {/* MakeX badge & Admin */}
          <div className="space-y-4">
            <h4 className="text-[#135E3E] font-bold uppercase tracking-[0.15em] text-[10px]">Chứng Nhận</h4>
            <div className="bg-gradient-to-br from-white to-[#9E7B3B]/5 border border-[#9E7B3B]/20 rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-[#9E7B3B]/10 flex items-center justify-center text-[#9E7B3B] shrink-0">
                <Sparkles size={14} />
              </div>
              <div>
                <div className="font-serif font-bold text-[15px] text-[#0A1A12] mb-0.5">MakeX 2026</div>
                <div className="font-mono text-[10px] text-gray-500 leading-relaxed">
                  Dự án đạt chứng thực Khoa học
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#135E3E]/10 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-gray-500 tracking-wider">
            © {currentYear} TramTrack. Mọi quyền được bảo lưu.
          </p>

          <a href="/admin" className="group flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-[#135E3E] transition-colors uppercase tracking-widest">
            <ShieldCheck size={12} />
            Cổng Quản Trị
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
      </div>
    </footer>
  );
}
