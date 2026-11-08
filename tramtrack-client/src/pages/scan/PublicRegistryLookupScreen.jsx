import React, { useState } from 'react';
import { ArrowLeft, Search, FileText, CheckCircle2, AlertOctagon, XCircle, FileBadge, Download, ExternalLink, ShieldCheck, FileKey, ScanLine } from 'lucide-react';

/**
 * Tra cứu SỐ CÔNG BỐ SẢN PHẨM của Sở Y tế — không phải tra cứu serial tem.
 *
 * Hai việc này khác nhau và dễ lẫn: serial tem do TramTrack phát hành và tra ở
 * /s/:serial qua máy chủ của mình; số công bố mỹ phẩm do Sở Y tế cấp và nằm
 * trên cổng thông tin của Sở, mà hệ thống này CHƯA nối vào.
 *
 * Nên dữ liệu dưới đây là dữ liệu mẫu, và màn hình phải tự khai điều đó ngay
 * trên đầu trang. Một màn tra cứu trông như đang hỏi cơ quan nhà nước nhưng
 * thực ra đọc một đối tượng viết sẵn trong tệp là thứ không được để người xem
 * hiểu nhầm — nhất là trước hội đồng.
 */
const DU_LIEU_MAU = {
  '18/2026/CBMP-TN': {
    status: 'VALID',
    productName: 'Tinh dầu tràm năm gân TramTrack nguyên chất 100%',
    regNumber: '18/2026/CBMP-TN',
    date: '20/03/2026',
    duration: '05 năm',
    agency: 'Sở Y tế Tỉnh Tây Ninh',
    unit: 'Hợp tác xã Dược liệu Tràm Nam Bộ',
    taxCode: '3901234567',
    address: 'Huyện Tân Biên, Tỉnh Tây Ninh',
    category: 'Mỹ phẩm / Dược liệu bôi ngoài & xông hơi'
  },
  '04/2024/CBMP-HUE': {
    status: 'EXPIRED',
    productName: 'Tinh dầu tràm cung đình nguyên chất',
    regNumber: '04/2024/CBMP-HUE',
    date: '10/01/2019',
    duration: '05 năm',
    agency: 'Sở Y tế Tỉnh Thừa Thiên Huế',
    unit: 'Công ty TNHH Dược Liệu Xanh',
    taxCode: '3300123999',
    address: 'TP Huế, Tỉnh Thừa Thiên Huế',
    category: 'Mỹ phẩm'
  }
};

export default function PublicRegistryLookupScreen({ onBack, onNavigateToScan }) {
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null); // null, { status, data }, 'NOT_FOUND'
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e, query = searchValue) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setSearchValue(query.toUpperCase());

    setTimeout(() => {
      const data = DU_LIEU_MAU[query.toUpperCase()];
      if (data) {
        setSearchResult({ status: data.status, data });
      } else {
        setSearchResult('NOT_FOUND');
      }
      setIsSearching(false);
    }, 800);
  };

  const handleQuickTest = (code) => {
    handleSearch(null, code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] text-[#0A1A12] py-8 lg:py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      
      {/* 1. Header Section */}
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-10 relative z-10">
        <button 
          onClick={onBack}
          className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-emerald-900/10 text-[#0A1A12] shadow-sm hover:scale-105 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-900/15 rounded-full mb-5">
          <ShieldCheck size={14} className="text-[#135E3E]" />
          <span className="font-mono text-[11px] text-[#135E3E] font-bold uppercase tracking-widest">
            PUBLIC HEALTH REGISTRY // SỞ Y TẾ
          </span>
        </div>
        
        <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-2xl sm:text-3xl text-[#135E3E] mb-2">
          TRA CỨU HỒ SƠ CÔNG BỐ
        </h1>
        <h2 className="font-serif italic text-[#8C6928] text-lg sm:text-xl mb-4">
          Xác Thực Pháp Lý & Đơn Vị Chịu Trách Nhiệm
        </h2>
        <p className="text-[#4F6357] text-[13px] sm:text-sm max-w-lg leading-relaxed mb-5">
          Nhập số tiếp nhận Phiếu công bố sản phẩm in trên vỏ hộp để đối chiếu đơn vị chịu trách nhiệm và hiệu lực pháp lý trên Cổng thông tin.
        </p>

        {/* Màn này chưa nối cổng thông tin thật — phải nói rõ, không để hiểu nhầm. */}
        <div className="w-full max-w-lg bg-amber-500/10 border border-amber-600/25 rounded-2xl px-4 py-3.5 text-left flex items-start gap-3">
          <FileBadge size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="text-amber-900 text-[12.5px] leading-relaxed">
            <span className="font-bold uppercase tracking-wide">Màn hình mô phỏng.</span>{' '}
            Hệ thống chưa nối với Cổng thông tin của Sở Y tế, nên kết quả dưới đây là dữ liệu
            mẫu để minh hoạ phần tích hợp dự kiến. Để tra cứu con tem thật, hãy dùng{' '}
            <a href="/scan" className="font-semibold underline underline-offset-2">máy quét mã QR</a>.
          </p>
        </div>
      </div>

      {/* 2. Search Dock & Quick Chips */}
      <div className="max-w-2xl mx-auto w-full relative z-10 mb-8">
        <form 
          onSubmit={handleSearch}
          className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_30px_rgba(10,26,18,0.06)] border border-emerald-900/15 flex items-center gap-2 mb-4"
        >
          <div className="pl-3 sm:pl-4 text-[#4F6357]">
            <Search size={20} />
          </div>
          <input 
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            placeholder="Nhập số công bố (VD: 18/2026/CBMP-TN)..."
            className="flex-1 bg-transparent border-none outline-none font-mono uppercase text-sm sm:text-base placeholder:normal-case placeholder:font-sans placeholder:text-[#4F6357]/60"
          />
          <button 
            type="submit"
            disabled={!searchValue.trim() || isSearching}
            className="bg-gradient-to-r from-[#9E7B3B] to-[#7E5C20] text-white font-semibold py-3 sm:py-3.5 px-5 sm:px-8 rounded-xl shadow-md hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2 whitespace-nowrap text-sm uppercase tracking-wide"
          >
            {isSearching ? 'Đang Xử Lý...' : 'Tra Cứu'}
          </button>
        </form>

        {/* Quick Test Chips */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <span className="font-mono text-xs text-[#4F6357]">Mã mẫu thử nghiệm:</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => handleQuickTest('18/2026/CBMP-TN')} className="px-3 py-1.5 bg-emerald-900/5 hover:bg-emerald-900/10 border border-emerald-900/10 rounded-full font-mono text-[10px] sm:text-[11px] text-[#135E3E] font-medium transition-colors">
              18/2026/CBMP-TN
            </button>
            <button onClick={() => handleQuickTest('04/2024/CBMP-HUE')} className="px-3 py-1.5 bg-amber-900/5 hover:bg-amber-900/10 border border-amber-900/10 rounded-full font-mono text-[10px] sm:text-[11px] text-amber-700 font-medium transition-colors">
              04/2024/CBMP-HUE
            </button>
            <button onClick={() => handleQuickTest('99/9999/FAKE-00')} className="px-3 py-1.5 bg-rose-900/5 hover:bg-rose-900/10 border border-rose-900/10 rounded-full font-mono text-[10px] sm:text-[11px] text-rose-700 font-medium transition-colors">
              99/9999/FAKE-00
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dossier Result Card */}
      {searchResult && (
        <div className="max-w-2xl mx-auto w-full relative z-10 mb-8 animate-[scale-in_0.3s_ease-out]">
          
          {searchResult === 'NOT_FOUND' ? (
            <div className="bg-white/95 backdrop-blur-xl border border-rose-900/15 rounded-3xl p-8 sm:p-10 shadow-lg text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <XCircle size={32} strokeWidth={2} className="text-rose-600" />
              </div>
              <h3 className="font-['Be_Vietnam_Pro'] text-xl font-bold text-[#991B1B] mb-2 uppercase tracking-wide">
                Không Tìm Thấy Hồ Sơ
              </h3>
              <p className="text-[#4F6357] text-sm sm:text-base leading-relaxed max-w-md">
                Số công bố <strong className="font-mono text-[#0A1A12]">{searchValue}</strong> không tồn tại trên hệ thống dữ liệu của Sở Y Tế. Vui lòng kiểm tra lại kí tự hoặc nguồn gốc sản phẩm.
              </p>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-900/5">
              
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-emerald-900/10 pb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0A1A12] mb-1 leading-tight">
                    {searchResult.data.productName}
                  </h3>
                  <div className="font-mono text-[#135E3E] font-bold text-lg">
                    {searchResult.data.regNumber}
                  </div>
                </div>
                
                <div className="shrink-0">
                  {searchResult.status === 'VALID' ? (
                    <div className="bg-emerald-50 text-[#135E3E] border border-emerald-900/15 px-4 py-2 rounded-full font-semibold text-[11px] sm:text-xs flex items-center gap-2 whitespace-nowrap shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#135E3E] animate-pulse" />
                      HIỆU LỰC: ĐANG LƯU HÀNH
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-700 border border-amber-900/15 px-4 py-2 rounded-full font-semibold text-[11px] sm:text-xs flex items-center gap-2 whitespace-nowrap shadow-sm">
                      <AlertOctagon size={14} strokeWidth={2.5} />
                      HIỆU LỰC: ĐÃ HẾT HẠN
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Cơ quan tiếp nhận</p>
                  <p className="text-[#0A1A12] font-medium text-sm sm:text-base">{searchResult.data.agency}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Dòng sản phẩm</p>
                  <p className="text-[#0A1A12] font-medium text-sm sm:text-base">{searchResult.data.category}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Ngày ký ban hành</p>
                  <p className="font-mono text-[#0A1A12] font-semibold text-sm">{searchResult.data.date}</p>
                  <p className="text-[#4F6357] text-[11px] mt-0.5">Thời hạn: {searchResult.data.duration}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Mã số thuế / GPKD</p>
                  <p className="font-mono text-[#0A1A12] font-semibold text-sm">{searchResult.data.taxCode}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Đơn vị chịu trách nhiệm đưa SP ra thị trường</p>
                  <p className="text-[#0A1A12] font-bold text-sm sm:text-base uppercase mb-0.5">{searchResult.data.unit}</p>
                  <p className="text-[#4F6357] text-sm">{searchResult.data.address}</p>
                </div>
              </div>

              {/* Digital Scan Preview Box */}
              <div className="bg-[#F9FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
                  <FileBadge size={32} strokeWidth={1.5} className="text-[#8C6928]" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-semibold text-[#0A1A12] text-sm mb-1">Bản Scan Phiếu Công Bố Y Tế</h4>
                  <p className="text-xs text-[#4F6357] mb-3">Tài liệu số hóa đã được xác thực bởi chứng thư số (CA).</p>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <button className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#135E3E] hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-900/10 transition-colors">
                      <ExternalLink size={14} /> Xem Toàn Văn (PDF)
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#4F6357] hover:text-[#0A1A12] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
                      <Download size={14} /> Tải Xuống
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 4. Footer & MAKEX Disclaimer */}
      <div className="max-w-2xl mx-auto w-full relative z-10 flex flex-col gap-6 items-center pb-12">
        <button 
          onClick={onNavigateToScan}
          className="w-full sm:w-auto bg-white border border-[#135E3E] text-[#135E3E] hover:bg-emerald-50 font-bold py-3.5 px-8 rounded-2xl shadow-sm transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
        >
          <ScanLine size={18} /> Quét Mã QR Để Xác Thực Từng Đơn Vị Chai Này
        </button>
        
        <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-2xl p-4 text-[11px] sm:text-xs text-[#4F6357] leading-relaxed flex items-start gap-3">
          <FileKey size={18} className="shrink-0 mt-0.5 opacity-60" />
          <p>
            <strong className="font-semibold text-[#0A1A12]">Lưu ý đề tài MAKEX 2026:</strong> Dữ liệu công bố hiện được mô phỏng từ tập dữ liệu thực tế do nhóm thu thập theo quy định hiện hành. Hệ thống đã xây dựng sẵn module RESTful API để kết nối trực tiếp với Cổng thông tin một cửa của Bộ Y tế và các Sở Y tế khi mở cổng liên thông quốc gia.
          </p>
        </div>
      </div>

    </div>
  );
}
