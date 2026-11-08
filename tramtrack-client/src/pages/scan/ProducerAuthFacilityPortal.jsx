import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ChevronRight, User,
         AlertCircle, LogOut, Building2, BadgeCheck } from 'lucide-react';
import { dangNhap, layNguoi, xoaPhieu, laLoiKetNoi } from '../../services/api';

const TEN_VAI_TRO = {
  quan_tri:    'Quản trị cơ sở',
  nhap_lieu:   'Nhập liệu',
  kiem_nghiem: 'Kiểm nghiệm',
  nguoi_xem:   'Chỉ xem',
};

export default function ProducerAuthFacilityPortal({ onBack, onDangNhapXong }) {
  const [email, setEmail]             = useState('');
  const [matKhau, setMatKhau]         = useState('');
  const [hienMatKhau, setHien]        = useState(false);
  const [dangGui, setDangGui]         = useState(false);
  const [loi, setLoi]                 = useState(null);
  // Đã có phiếu trong sessionStorage thì vào thẳng màn xác nhận,
  // không bắt đăng nhập lại khi người dùng chỉ tải lại trang.
  const [nguoi, setNguoi]             = useState(() => layNguoi());

  async function guiDangNhap(e) {
    e.preventDefault();
    if (dangGui) return;
    setLoi(null);
    setDangGui(true);
    try {
      const n = await dangNhap(email.trim().toLowerCase(), matKhau);
      setMatKhau('');            // đừng giữ mật khẩu trong state
      setNguoi(n);
    } catch (err) {
      setLoi(laLoiKetNoi(err)
        ? 'Không nối được tới máy chủ. Kiểm tra cửa sổ đang chạy máy chủ.'
        : err.message);
    } finally {
      setDangGui(false);
    }
  }

  function dangXuat() {
    xoaPhieu();
    setNguoi(null);
    setEmail('');
    setMatKhau('');
  }

  if (nguoi) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] text-[#0A1A12] flex items-center justify-center p-4 lg:p-8 font-sans">
        <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-[32px] p-6 sm:p-10 shadow-[0_15px_50px_rgba(10,26,18,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-[#135E3E] to-[#0A1A12]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-emerald-900/10 flex items-center justify-center mb-4 mt-6">
              <img src="/assets/botanical/logo-icon.png" alt="TramTrack" className="h-12 w-auto object-contain" />
            </div>

            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#135E3E] border border-emerald-900/15 px-3 py-1 rounded-full text-[11px] font-mono font-bold mb-3 uppercase tracking-widest">
                <BadgeCheck size={12} strokeWidth={3} /> ĐÃ ĐĂNG NHẬP
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 font-['Be_Vietnam_Pro']">
                {nguoi.co_so?.ten || 'Cơ sở sản xuất'}
              </h2>
              <div className="font-mono text-[#4F6357] text-sm">
                Mã cơ sở: <span className="font-bold text-[#135E3E]">{nguoi.co_so?.ma_co_so || '—'}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
                <User size={18} className="text-[#8C6928] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#4F6357] font-bold uppercase tracking-wider mb-1">Người đăng nhập</p>
                  <p className="text-sm font-medium leading-snug">{nguoi.ho_ten || nguoi.email}</p>
                  <p className="text-[11px] text-[#4F6357] font-mono truncate">{nguoi.email}</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
                <Building2 size={18} className="text-[#8C6928] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#4F6357] font-bold uppercase tracking-wider mb-1">Vai trò</p>
                  <p className="text-sm font-medium leading-snug">
                    {TEN_VAI_TRO[nguoi.vai_tro] || nguoi.vai_tro}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[12.5px] text-[#4F6357] leading-relaxed text-center mb-7 px-2">
              Mọi lô, tem và báo cáo bạn thấy sau đây đều chỉ trong phạm vi cơ sở này.
              Máy chủ đọc mã cơ sở ra từ phiếu đăng nhập, không từ giao diện.
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onDangNhapXong?.(nguoi)}
                className="flex-1 bg-gradient-to-r from-[#135E3E] to-[#0D442C] text-white font-semibold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
              >
                Quản lý lô và tem <ChevronRight size={16} />
              </button>
              <button
                onClick={dangXuat}
                className="w-full sm:w-auto bg-white border border-rose-900/15 text-rose-700 hover:bg-rose-50 font-semibold py-4 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#0A1A12] flex flex-col lg:flex-row font-sans">
      
      {/* LEFT COLUMN: Brand Heritage Stage (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A1A12] via-[#0D241A] to-[#04120A] text-white p-12 xl:p-20 flex-col justify-between relative overflow-hidden">
        {/* Glowing Orb */}
        <div className="w-[450px] h-[450px] bg-emerald-600/15 rounded-full blur-[120px] absolute -top-12 -left-12 pointer-events-none" />
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-500/30 flex items-center justify-center shadow-lg">
            <img src="/assets/botanical/logo-icon.png" alt="TramTrack" className="h-6 w-auto object-contain" />
          </div>
          <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-widest">
            TRAMTRACK ENTERPRISE // B2B SECURE CORE
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-3xl xl:text-4xl text-white mb-2 leading-tight">
            MINH BẠCH NGUỒN GỐC.
          </h1>
          <h2 className="font-serif italic text-[#DFC18A] text-2xl xl:text-3xl mb-6">
            Bảo Chứng Từng Giọt Tinh Dầu.
          </h2>
          <p className="text-emerald-50/70 text-base xl:text-lg max-w-md leading-relaxed font-light">
            Hệ thống quản trị định danh độc bản giúp các hợp tác xã và xưởng chưng cất tràm bảo vệ uy tín thương hiệu, ngăn chặn hàng giả pha tạp và nâng tầm giá trị dược liệu OCOP.
          </p>
        </div>

        {/* Bottom Metrics */}
        <div className="relative z-10 w-full max-w-lg backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 grid grid-cols-2 gap-6 mt-12">
          <div className="border-r border-white/10 pr-6">
            <div className="font-mono text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-[11px] text-emerald-100/60 uppercase tracking-wider font-semibold">Mã Băm Độc Bản</div>
            <div className="text-xs text-emerald-100/40 mt-1 font-mono">Bảo mật chuẩn Argon2id</div>
          </div>
          <div className="pl-2">
            <div className="font-mono text-3xl font-bold text-[#DFC18A] mb-1">71.05%</div>
            <div className="text-[11px] text-emerald-100/60 uppercase tracking-wider font-semibold">Cineole Lô Mẫu</div>
            <div className="text-xs text-emerald-100/40 mt-1 font-mono">Theo phiếu kiểm nghiệm GC-MS</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Portal Access Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center relative min-h-screen lg:min-h-0">
        
        <div className="w-full max-w-xl mx-auto flex flex-col relative z-10">
          
          <button 
            onClick={onBack}
            className="mb-10 lg:mb-12 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-emerald-900/10 text-[#0A1A12] shadow-sm hover:scale-105 transition-all self-start"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          
          <div className="mb-8">
            <h1 className="font-['Be_Vietnam_Pro'] font-bold text-2xl sm:text-3xl text-[#0A1A12] mb-2 uppercase tracking-wide">
              ĐĂNG NHẬP HỆ THỐNG
            </h1>
            <p className="font-['Be_Vietnam_Pro'] text-sm sm:text-base text-[#4F6357]">
              Dành riêng cho cơ sở sản xuất, HTX tràm và cán bộ giám sát.
            </p>
          </div>

          <form onSubmit={guiDangNhap} className="space-y-5 mb-8">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#4F6357] uppercase tracking-wider mb-1.5 ml-1">
                Email tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-[#4F6357]/60" />
                </div>
                <input 
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoi(null); }}
                  placeholder="quantri@tramtrack.vn"
                  className="w-full bg-white border border-emerald-900/15 focus:border-[#135E3E] rounded-2xl py-3.5 pl-11 pr-4 text-sm sm:text-base text-[#0A1A12] outline-none transition-all placeholder:text-[#4F6357]/40 shadow-sm font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#4F6357] uppercase tracking-wider mb-1.5 ml-1">
                Mật Khẩu Quản Trị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#4F6357]/60" />
                </div>
                <input 
                  type={hienMatKhau ? "text" : "password"}
                  autoComplete="current-password"
                  value={matKhau}
                  onChange={(e) => { setMatKhau(e.target.value); setLoi(null); }}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-emerald-900/15 focus:border-[#135E3E] rounded-2xl py-3.5 pl-11 pr-12 text-sm sm:text-base text-[#0A1A12] outline-none transition-all placeholder:text-[#4F6357]/40 shadow-sm font-mono"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setHien(!hienMatKhau)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#4F6357] hover:text-[#135E3E] transition-colors"
                >
                  {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Phiên nằm trong sessionStorage: đóng tab là hết. Không có ô
                "ghi nhớ" vì phiếu này mở được toàn bộ dữ liệu của cơ sở.
                Cũng chưa có luồng quên mật khẩu — việc đó làm bằng script
                dat-lai-mat-khau ở máy chủ. */}
            <p className="text-[12px] text-[#4F6357] leading-relaxed pt-1">
              Phiên làm việc kết thúc khi bạn đóng tab. Mất mật khẩu thì liên hệ
              quản trị cơ sở để cấp lại.
            </p>

            {loi && (
  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5">
    <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
    <p className="text-rose-900 text-[13px] leading-relaxed">{loi}</p>
  </div>
)}
            <button 
              type="submit"
              disabled={dangGui || !email || !matKhau}
              className="w-full bg-gradient-to-r from-[#8C6928] to-[#6E501C] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(140,105,40,0.25)] hover:shadow-[0_12px_30px_rgba(140,105,40,0.35)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_25px_rgba(140,105,40,0.25)] transition-all text-[13px] sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2"
            >
           {dangGui ? 'Đang xác thực…' : 'Vào bảng điều khiển'}
            </button>
          </form>

        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
