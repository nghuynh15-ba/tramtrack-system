import React from 'react';

const FacilityLegalDossierScreen = () => {
  return (
    <div className="bg-[#F6F8F5] text-[#0A1A12] py-4 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. Thanh Tiêu Đề Quản Trị */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase text-2xl text-[#0A1A12]">
              HỒ SƠ PHÁP LÝ CƠ SỞ & CHỨNG THƯ SỐ
            </h1>
            <p className="font-['IBM_Plex_Mono'] text-xs text-[#135E3E] mt-1">
              MÃ CƠ SỞ: FAC-TN-2026-08 // QUẢN TRỊ DANH TÍNH DOANH NGHIỆP
            </p>
          </div>
          <div className="bg-emerald-50 border border-[#135E3E]/20 text-[#135E3E] px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
            <span>XÁC THỰC DOANH NGHIỆP OCOP: CẤP CAO NHẤT</span>
            <svg className="w-5 h-5 text-[#135E3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>

        {/* 2. Thẻ Thông Tin Doanh Nghiệp & Định Danh eKYC */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-[#135E3E] font-['Be_Vietnam_Pro']">Thông Tin Doanh Nghiệp & Định Danh eKYC</h2>
            <button className="text-sm font-medium border border-[#135E3E]/30 text-[#135E3E] px-4 py-2 rounded-lg hover:bg-[#135E3E]/5 transition-colors">
              Cập Nhật Thông Tin Doanh Nghiệp
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tên pháp nhân</p>
                <p className="font-medium text-[15px]">HỢP TÁC XÃ DƯỢC LIỆU TRÀM NAM BỘ</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Người đại diện pháp luật</p>
                <p className="font-medium text-[15px]">Nguyễn Văn Hưng</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mã số thuế</p>
                <p className="font-['IBM_Plex_Mono'] font-medium text-[15px]">3901234567</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Địa chỉ xưởng chưng cất</p>
                <p className="font-medium text-[15px]">Ấp Tân Lập, Xã Tân Bình, Huyện Tân Biên, Tỉnh Tây Ninh</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Diện tích vùng tràm liên kết</p>
                <p className="font-medium text-[15px]">45 Hécta <span className="text-gray-500 text-sm font-normal">(Rừng tràm năm gân chuẩn hóa)</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Số lượng nồi chưng cất</p>
                <p className="font-medium text-[15px]">03 Nồi lôi cuốn hơi nước công nghiệp</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Công suất</p>
                <p className="font-medium text-[15px]">1,200 Lít tinh dầu nguyên chất / năm</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Kho Tài Liệu Chứng Nhận Số Hóa */}
        <div>
          <h2 className="font-['IBM_Plex_Mono'] text-xs text-[#4F6357] uppercase tracking-wider mb-4 font-semibold">
            DANH MỤC HỒ SƠ & CHỨNG NHẬN ĐÃ KIỂM ĐỊNH
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-white/95 border border-emerald-900/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#135E3E]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-[#135E3E] mb-3 pr-8">Chứng Nhận OCOP 4 Sao</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
                <p><span className="text-gray-400">Số quyết định:</span> 48/QĐ-UBND Tỉnh Tây Ninh</p>
                <p><span className="text-gray-400">Ngày cấp:</span> 15/01/2025 · <span className="text-gray-400">Hết hạn:</span> 15/01/2028</p>
                <p className="font-['IBM_Plex_Mono'] text-xs text-gray-500 truncate"><span className="text-gray-400">Mã băm file:</span> SHA-256: 0x9b2a...77e</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CÒN HIỆU LỰC
                </span>
                <button className="text-sm font-medium text-[#135E3E] hover:underline flex items-center gap-1">
                  Xem Bản Scan PDF <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/95 border border-emerald-900/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#135E3E]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="font-bold text-[#135E3E] mb-3 pr-8">Giấy Đủ Điều Kiện An Toàn Vệ Sinh</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
                <p><span className="text-gray-400">Cấp bởi:</span> Chi cục Quản lý Chất lượng Nông Lâm Sản & Thủy sản</p>
                <p><span className="text-gray-400">Số:</span> 014/2025/ATTP</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CÒN HIỆU LỰC
                </span>
                <button className="text-sm font-medium text-[#135E3E] hover:underline flex items-center gap-1">
                  Xem Bản Scan PDF <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/95 border border-emerald-900/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#135E3E]" fill="currentColor" viewBox="0 0 24 24"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-[#135E3E] mb-3 pr-8">Phiếu Phân Tích Thổ Nhưỡng & Nguồn Nước</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
                <p>Phục vụ tiêu chuẩn khai thác bền vững Net Zero.</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> ĐÃ LƯU TRỮ TRÊN SỔ CÁI
                </span>
                <button className="text-sm font-medium text-[#135E3E] hover:underline flex items-center gap-1">
                  Xem Bản Scan PDF <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Trạm Quản Trị Chữ Ký Số Mẻ Cất */}
        <div className="bg-[#FDFBF7] border border-[#8C6928]/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-['IBM_Plex_Mono'] text-sm text-[#8C6928] font-bold">
              CẶP KHÓA MẬT MÃ KÝ SỐ MẺ CẤT (ECDSA SECP256K1)
            </h2>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              KMS HARDWARE SECURITY: HOẠT ĐỘNG <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Khóa Công Khai (Public Key)</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-white border border-[#8C6928]/20 rounded-xl p-3 flex-grow font-['IBM_Plex_Mono'] text-[12px] text-gray-700 break-all shadow-inner overflow-x-auto flex items-center">
                  04:8F:9B:2A:44:E1:98:C0:71:A4:B2:99:3F:10:E6:AA:5D:82:19:0B:44:3C:99:12:8A:F7:21:BB:08:44:E1:98:C0:71:A4:B2:99:3F:10:E6:AA:5D:82:19
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button className="flex-1 bg-white border border-[#8C6928]/30 text-[#8C6928] hover:bg-[#8C6928]/5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Sao chép
                  </button>
                  <button className="flex-1 bg-[#8C6928] text-white hover:bg-[#735520] px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Xuất X.509
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#8C6928]/5 rounded-xl p-4 border border-[#8C6928]/10 flex gap-3 items-start">
              <svg className="w-5 h-5 text-[#8C6928] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <p className="text-sm text-gray-700 leading-relaxed">
                Khóa bí mật được lưu trữ trong phân vùng mã hóa phần cứng. Dùng để sinh chữ ký số cho mẻ cất và xác thực dữ liệu in tem Argon2id mà không bên thứ ba nào can thiệp được.
              </p>
            </div>

            <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium mt-6">Nhật ký ký số gần nhất (Mini Audit Log)</p>
               <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-100 text-sm overflow-hidden">
                 <div className="p-3.5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-gray-700">Ký duyệt mẻ <span className="font-['IBM_Plex_Mono'] font-medium text-[#135E3E]">LO-2026-Q3-08</span></span>
                   </div>
                   <span className="text-gray-500 font-['IBM_Plex_Mono'] text-xs">08:30 14/08/2026</span>
                 </div>
                 <div className="p-3.5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-gray-700">Ký duyệt lô <span className="font-['IBM_Plex_Mono'] font-medium text-[#135E3E]">LO-2026-Q3-07</span></span>
                   </div>
                   <span className="text-gray-500 font-['IBM_Plex_Mono'] text-xs">15:45 10/08/2026</span>
                 </div>
                 <div className="p-3.5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-gray-700">Ký duyệt mẻ <span className="font-['IBM_Plex_Mono'] font-medium text-[#135E3E]">LO-2026-Q3-06</span></span>
                   </div>
                   <span className="text-gray-500 font-['IBM_Plex_Mono'] text-xs">09:15 05/08/2026</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 5. Phân Quyền Nhân Sự & Tài Khoản Xưởng */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#135E3E] font-['Be_Vietnam_Pro']">Phân Quyền Nhân Sự & Tài Khoản Xưởng</h2>
            <button className="text-sm font-medium bg-[#135E3E] text-white px-4 py-2 rounded-lg hover:bg-[#0f4a31] transition-colors shadow-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Thêm Nhân Sự
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Nhân sự</th>
                  <th className="pb-3 font-medium">Vai trò & Quyền hạn</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#135E3E]/10 flex items-center justify-center text-[#135E3E] font-bold text-sm">
                      NH
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Quản Đốc Nguyễn Văn Hưng</p>
                      <p className="text-xs text-gray-500">hung.nv@tramnambo.vn</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                      Chủ tài khoản - Toàn quyền
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang hoạt động
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-gray-400 hover:text-[#135E3E] p-1 rounded transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm">
                      TN
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">KTV Trần Thị Ngọc</p>
                      <p className="text-xs text-gray-500">ngoc.tt@tramnambo.vn</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      Nhập liệu mẻ cất & Tải phiếu GC-MS
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang hoạt động
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-gray-400 hover:text-[#135E3E] p-1 rounded transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-700 font-bold text-sm">
                      MH
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">KTV Lê Minh Hoàng</p>
                      <p className="text-xs text-gray-500">hoang.lm@tramnambo.vn</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                      Vận hành máy in tem & Xuất file in
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang hoạt động
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-gray-400 hover:text-[#135E3E] p-1 rounded transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacilityLegalDossierScreen;
