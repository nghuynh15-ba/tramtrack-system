import React, { useState } from 'react';
import { 
  Leaf, Map, ShieldAlert, FlaskConical, Plus, KeyRound, Box, FileSignature, Printer,
  QrCode, Menu, Bell, Smartphone, Globe, LogOut, ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

const TEN_VAI_TRO = {
  quan_tri:    'Quản trị cơ sở',
  nhap_lieu:   'Nhập liệu',
  kiem_nghiem: 'Kiểm nghiệm',
  nguoi_xem:   'Chỉ xem',
};

/** Chữ cái đầu của họ tên để làm ảnh đại diện chữ. */
function chuCaiDau(nguoi) {
  const ten = (nguoi?.ho_ten || nguoi?.email || '?').trim();
  const phan = ten.split(/\s+/).filter(Boolean);
  if (phan.length === 0) return '?';
  if (phan.length === 1) return phan[0].slice(0, 2).toUpperCase();
  return (phan[0][0] + phan[phan.length - 1][0]).toUpperCase();
}

const MENU_GROUPS = [
  {
    title: 'GIÁM SÁT THỊ TRƯỜNG',
    items: [
      // badge: 6 trước đây là số viết cứng. Số báo cáo mới là dữ liệu thật
      // của GET /qt/thong-ke, nên để màn hình tự hiện, không bịa ở menu.
      { id: 'dashboard', label: 'Bảng Điều Khiển', icon: Map, path: '/dashboard' },
      { id: 'surveillance', label: 'Báo Cáo Người Tiêu Dùng', icon: ShieldAlert, path: '/surveillance' }
    ]
  },
  {
    title: 'SẢN XUẤT & MẬT MÃ',
    items: [
      { id: 'batches', label: 'Sổ Cái Quản Lý Lô', icon: FlaskConical, path: '/batches' },
      { id: 'create-batch', label: 'Khởi Tạo Lô Mới', icon: Plus, path: '/create-batch' },
      { id: 'mint-export', label: 'Sinh Mã & Xuất File In Tem', icon: KeyRound, path: '/mint-export' },
      { id: 'stamp-design', label: 'Thiết Kế Tem & Xuất Bản In', icon: QrCode, path: '/stamp-design' },
      { id: 'print-stamps', label: 'Quản Lý In Tem Đích', icon: Printer, path: '/print-stamps' }
    ]
  },
  {
    title: 'PHÂN PHỐI & LOGISTICS',
    items: [
      { id: 'distributor', label: 'Nghiệm Thu Kiện Đại Lý', icon: Box, path: '/distributor-portal' }
    ]
  },
  {
    title: 'PHÁP LÝ & HỆ THỐNG',
    items: [
      { id: 'facility', label: 'Hồ Sơ Pháp Lý Cơ Sở', icon: FileSignature, path: '/facility-legal' }
    ]
  }
];

function B2BAdminSidebar({ isCollapsed, toggleCollapse, currentPath, navigateTo, nguoi, onDangXuat }) {
  return (
    <div className={`shrink-0 bg-white border-r border-emerald-900/10 flex flex-col transition-all duration-300 shadow-sm relative ${isCollapsed ? 'w-[80px]' : 'w-[280px] hidden md:flex'}`}>
      
      {/* Branding */}
      <div className={`p-4 sm:p-6 border-b border-emerald-900/10 ${isCollapsed ? 'items-center flex flex-col' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#135E3E] to-[#0A1A12] border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
            <Leaf size={20} className="text-[#8C6928]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-['Be_Vietnam_Pro'] font-bold text-sm text-[#0A1A12] truncate">TRAMTRACK</span>
              <span className="font-mono text-[10px] text-[#135E3E] font-bold tracking-widest truncate">KHU QUẢN TRỊ</span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          /* Tên và mã cơ sở lấy từ phiếu đăng nhập. Trước đây ba dòng này
             viết cứng tên một HTX và một chứng nhận OCOP 4 sao mà máy chủ
             không hề trả về — đó là giấy tờ bịa. */
          <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-2xl p-3 mt-5">
            <h4 className="font-bold text-[12px] text-[#0A1A12] mb-1 leading-snug">
              {nguoi?.co_so?.ten || 'Cơ sở sản xuất'}
            </h4>
            <p className="font-mono text-[11px] text-[#8C6928] font-bold">
              {nguoi?.co_so?.ma_co_so || '—'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {MENU_GROUPS.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h5 className="px-3 text-[10px] font-bold text-[#4F6357] uppercase tracking-wider mb-2">
                {group.title}
              </h5>
            )}
            <ul className="space-y-1">
              {group.items.map(item => {
                const isActive = currentPath === item.path;
                return (
                  <li key={item.id}>
                    <button 
                      onClick={() => navigateTo && navigateTo(item.path)}
                      title={isCollapsed ? item.label : ''}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} py-2.5 px-3 rounded-xl transition-all
                        ${isActive 
                          ? 'bg-[#135E3E] text-white font-semibold shadow-sm' 
                          : 'text-[#0A1A12]/80 hover:bg-emerald-900/5 hover:text-[#135E3E]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? 'text-emerald-300' : 'text-[#8C6928]'} />
                        {!isCollapsed && <span className="font-['Be_Vietnam_Pro'] text-[13px] text-left truncate leading-tight">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-emerald-500/30 text-white' : 'bg-rose-100 text-rose-700'}`}>
                          {String(item.badge).padStart(2, '0')}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-emerald-900/10 bg-slate-50">
        
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#8C6928] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {chuCaiDau(nguoi)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[12px] font-bold text-[#0A1A12] truncate leading-snug">
                  {nguoi?.ho_ten || nguoi?.email || 'Chưa đăng nhập'}
                </span>
                <span className="text-[10px] text-[#4F6357] truncate">
                  {TEN_VAI_TRO[nguoi?.vai_tro] || nguoi?.vai_tro || '—'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onDangXuat}
            className={`shrink-0 p-2 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
            title="Đăng xuất"
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      
    </div>
  );
}

function B2BTopHeader({ toggleCollapse, isCollapsed, currentPath }) {
  // Simple logic to map path to breadcrumb
  let breadcrumbTitle = 'Bảng Điều Khiển';
  if (currentPath === '/dashboard') breadcrumbTitle = 'Bản Đồ Nhiệt Cảnh Báo';
  if (currentPath === '/batches') breadcrumbTitle = 'Sổ Cái Quản Lý Lô';
  if (currentPath === '/create-batch') breadcrumbTitle = 'Khởi Tạo Lô Mới';
  if (currentPath === '/mint-export') breadcrumbTitle = 'Sinh Mã & Xuất File In Tem';
  if (currentPath === '/stamp-design') breadcrumbTitle = 'Thiết Kế Tem & Xuất Bản In';
  if (currentPath === '/print-stamps') breadcrumbTitle = 'Quản Lý In Tem Đích';
  if (currentPath === '/distributor-portal') breadcrumbTitle = 'Nghiệm Thu Kiện Đại Lý';
  if (currentPath === '/surveillance') breadcrumbTitle = 'Báo Cáo Người Tiêu Dùng';
  if (currentPath === '/facility-legal') breadcrumbTitle = 'Hồ Sơ Pháp Lý Cơ Sở';

  return (
    <header className="h-16 border-b border-emerald-900/10 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleCollapse}
          className="p-2 -ml-2 rounded-lg text-[#0A1A12] hover:bg-emerald-900/5 transition-colors hidden md:block"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </button>
        <button className="p-2 -ml-2 rounded-lg text-[#0A1A12] hover:bg-emerald-900/5 transition-colors block md:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#4F6357] uppercase tracking-wider">
          <span className="opacity-60">Hệ Thống Nội Bộ</span>
          <span>/</span>
          <span className="text-[#0A1A12]">{breadcrumbTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 rounded-lg text-[#0A1A12] hover:bg-emerald-900/5 transition-colors" title="Thông báo hệ thống">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
        </button>
        <button className="p-2 rounded-lg text-[#0A1A12] hover:bg-emerald-900/5 transition-colors" title="Trang người tiêu dùng">
          <Smartphone size={18} />
        </button>
        <div className="h-6 w-[1px] bg-emerald-900/10 mx-1 hidden sm:block" />
        <button className="flex items-center gap-1.5 p-2 rounded-lg text-[#0A1A12] hover:bg-emerald-900/5 transition-colors font-bold text-[11px] uppercase tracking-wider hidden sm:flex">
          <Globe size={16} /> VI <span className="text-[#4F6357] font-normal mx-0.5">|</span> EN
        </button>
      </div>
    </header>
  );
}

export default function PrivateLayout({ children, currentPath, navigateTo, nguoi, onDangXuat }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8F5] flex font-sans overflow-hidden">
      
      {/* Sidebar Desktop */}
      <B2BAdminSidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        currentPath={currentPath}
        navigateTo={navigateTo}
        nguoi={nguoi}
        onDangXuat={onDangXuat}
      />
      
      {/* Cột Nội Dung Chính */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <B2BTopHeader 
          toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
          isCollapsed={isCollapsed} 
          currentPath={currentPath}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(19, 94, 62, 0.15); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(19, 94, 62, 0.3); 
        }
      `}</style>
    </div>
  );
}
