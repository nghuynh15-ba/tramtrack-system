import React, { useState } from 'react';
import { ArrowLeft, ScanLine, Search, Box, CheckCircle2, ShieldCheck, FileCheck, FileSignature, MapPin, Hash, ShieldAlert, AlertTriangle, ChevronRight } from 'lucide-react';

export default function DistributorBatchAcceptancePortal({ onBack }) {
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle', 'valid', 'invalid', 'signed'
  const [inputValue, setInputValue] = useState('');

  // Generate 50 mock items
  const mockItems = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    serial: `TDT-2026-${(4801 + i).toString().padStart(6, '0')}`,
    isIntact: true,
    algo: 'Argon2id Encrypted',
    note: 'Hàng chuẩn kho'
  }));

  // Create an invalid mock where some items are scratched
  const invalidMockItems = mockItems.map(item => {
    if (item.id === 12 || item.id === 28) {
      return { ...item, isIntact: false, note: 'Đã cào lớp phủ bạc!' };
    }
    return item;
  });

  const currentItems = scanStatus === 'invalid' ? invalidMockItems : mockItems;
  const intactCount = currentItems.filter(item => item.isIntact).length;

  const handleDemoScan = (type) => {
    setInputValue(type === 'valid' ? 'CARTON-2026-Q3-08-C12' : 'CARTON-ERR-FAKE-99');
    setScanStatus(type);
  };

  const handleSign = () => {
    setScanStatus('signed');
  };

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#0A1A12] py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-[1200px] mx-auto">
        
        {/* 1. Intake Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-emerald-900/10 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white border border-emerald-900/10 text-[#0A1A12] hover:bg-emerald-50 hover:text-[#135E3E] shadow-sm transition-all"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider text-[#0A1A12] leading-tight">
                NGHIỆM THU KIỆN HÀNG ĐẠI LÝ
              </h1>
              <div className="font-mono text-[10px] sm:text-xs text-[#135E3E] font-bold mt-1 tracking-widest uppercase">
                CỔNG XÁC THỰC B2B // PHÂN PHỐI & BẢO HÀNH CHUỖI CUNG ỨNG
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-emerald-900/15 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-[#135E3E] rounded-full flex items-center justify-center text-white">
              <MapPin size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4F6357] uppercase tracking-wider">Đại Lý Dược Liệu Tây Nam Bộ</p>
              <p className="font-mono text-xs font-bold text-[#0A1A12]">Mã: AGENT-CT-09</p>
            </div>
          </div>
        </div>

        {/* 2. Carton Scanner Dock */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 w-full space-y-4">
            <button className="w-full bg-gradient-to-r from-[#135E3E] to-[#0A3D27] text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2">
              <ScanLine size={18} /> Bật Camera Quét Mã Master QR Trên Thùng Carton <ChevronRight size={16} />
            </button>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6357]/60" />
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hoặc nhập mã kiện (VD: CARTON-2026-Q3-08-C12)..." 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-[13px] font-mono font-medium text-[#0A1A12] focus:border-[#135E3E] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 bg-emerald-900/5 p-4 rounded-2xl border border-emerald-900/10">
            <p className="text-[10px] font-bold text-[#4F6357] uppercase tracking-wider mb-3">TÀI KHOẢN TRẢI NGHIỆM (DEMO)</p>
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => handleDemoScan('valid')}
                className="px-4 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-900/10 rounded-xl font-mono text-[11px] text-[#135E3E] font-bold transition-colors shadow-sm text-left flex items-center justify-between gap-2"
              >
                [Mẫu: Kiện 50 Chai Hợp Lệ] <CheckCircle2 size={14} />
              </button>
              <button 
                onClick={() => handleDemoScan('invalid')}
                className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-emerald-900/10 rounded-xl font-mono text-[11px] text-rose-700 font-bold transition-colors shadow-sm text-left flex items-center justify-between gap-2"
              >
                [Mẫu: Kiện Bị Lỗi Tráo Tem] <AlertTriangle size={14} />
              </button>
            </div>
          </div>
        </div>

        {(scanStatus === 'valid' || scanStatus === 'invalid' || scanStatus === 'signed') && (
          <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
            
            {/* 3. Consignment Custody Dossier */}
            <div className="bg-[#0A1A12] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/30 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5 mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <Box size={24} className="text-[#8C6928]" />
                  <div>
                    <p className="text-[10px] text-emerald-100/60 uppercase font-bold tracking-wider mb-1">MÃ KIỆN MASTER (MASTER CARTON)</p>
                    <p className="font-mono text-xl sm:text-2xl font-bold text-white tracking-widest">CARTON-2026-Q3-08-C12</p>
                  </div>
                </div>
                
                <div className="bg-emerald-900/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-right">
                  <p className="text-[9px] text-emerald-200/70 uppercase font-bold tracking-wider mb-0.5">TRẠNG THÁI NIÊM PHONG XƯỞNG</p>
                  <p className="font-mono text-xs font-bold text-emerald-400 flex items-center justify-end gap-1.5">
                    XUẤT XƯỞNG HỢP LỆ <CheckCircle2 size={12} />
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div>
                  <p className="text-[10px] text-emerald-100/60 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><Hash size={12} /> LÔ SẢN XUẤT GỐC</p>
                  <p className="text-sm font-bold text-white">LO-2026-Q3-08</p>
                  <p className="text-[11px] text-emerald-100/80 italic mt-0.5">Melaleuca quinquenervia 100%</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-100/60 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><Box size={12} /> QUY CÁCH ĐÓNG GÓI</p>
                  <p className="text-sm font-bold text-[#DFC18A]">Thùng 50 chai x 50ml</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-100/60 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><FileCheck size={12} /> PHIẾU COA ĐÍNH KÈM</p>
                  <p className="text-sm font-bold text-emerald-400">1,8-Cineole 71.05%</p>
                  <p className="text-[10px] text-emerald-100/60 font-mono mt-0.5 uppercase">(Kiểm nghiệm GC-MS hợp chuẩn)</p>
                </div>
              </div>
            </div>

            {/* 4. Unit Seal Integrity Checklist */}
            <div className="bg-white border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-emerald-900/5 p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-900/10">
                <h3 className="font-mono text-xs font-bold text-[#4F6357] uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} /> DANH SÁCH 50 ĐƠN VỊ SẢN PHẨM TRONG THÙNG
                </h3>
                
                <div className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border
                  ${scanStatus === 'invalid' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-[#135E3E] border-emerald-200'}
                `}>
                  {scanStatus === 'invalid' ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
                  {intactCount}/50 CHAI NGUYÊN BẢN ({Math.round((intactCount/50)*100)}% CHƯA CÀO PIN)
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="sticky top-0 bg-white/95 backdrop-blur z-10 shadow-sm">
                    <tr className="border-b border-emerald-900/10 text-[9px] sm:text-[10px] text-[#4F6357] uppercase tracking-widest font-bold">
                      <th className="py-3 px-6 w-16 text-center">STT</th>
                      <th className="py-3 px-4">Số Serial Công Khai</th>
                      <th className="py-3 px-4">Trạng Thái Lớp Cào</th>
                      <th className="py-3 px-4">Thuật Toán Bảo Vệ</th>
                      <th className="py-3 px-6 text-right">Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {currentItems.map((item) => (
                      <tr key={item.id} className={`border-b border-emerald-900/5 transition-colors ${!item.isIntact ? 'bg-rose-50/50' : 'hover:bg-emerald-50/30'}`}>
                        <td className="py-3 px-6 text-center font-mono text-xs text-slate-400 font-bold">{String(item.id).padStart(2, '0')}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#0A1A12] text-[13px]">{item.serial}</td>
                        <td className="py-3 px-4">
                          {item.isIntact ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-[#135E3E] text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                              <CheckCircle2 size={10} /> LỚP CÀO NGUYÊN VẸN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-100 border border-rose-200 text-rose-700 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                              <ShieldAlert size={10} /> ĐÃ BỊ CÀO XƯỚC
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#4F6357]">{item.algo}</td>
                        <td className={`py-3 px-6 text-right text-xs font-semibold ${item.isIntact ? 'text-slate-400 italic' : 'text-rose-600'}`}>
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Stock-In Digital Handover */}
            {scanStatus !== 'signed' ? (
              <div className={`border-2 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all shadow-sm
                ${scanStatus === 'invalid' ? 'bg-rose-50 border-rose-900/20' : 'bg-[#FDFBF7] border-[#8C6928]/30'}
              `}>
                <div className="flex-1 flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center
                    ${scanStatus === 'invalid' ? 'bg-rose-200 text-rose-700' : 'bg-amber-100 text-[#8C6928]'}
                  `}>
                    {scanStatus === 'invalid' ? <ShieldAlert size={24} /> : <FileSignature size={24} />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-2
                      ${scanStatus === 'invalid' ? 'text-rose-700' : 'text-[#8C6928]'}
                    `}>
                      {scanStatus === 'invalid' ? 'TỪ CHỐI NGHIỆM THU KIỆN HÀNG' : 'CAM KẾT NHẬP KHO ĐẠI LÝ'}
                    </h4>
                    <p className={`text-xs leading-relaxed max-w-xl
                      ${scanStatus === 'invalid' ? 'text-rose-800' : 'text-[#4F6357]'}
                    `}>
                      {scanStatus === 'invalid' 
                        ? 'Phát hiện 02 chai bị cào xước tem bảo mật trước khi bóc thùng. Xin vui lòng niêm phong lại kiện hàng và gửi báo cáo lỗi về bộ phận quản lý rủi ro của HTX.'
                        : 'Bằng việc ký số nghiệm thu, đại lý xác nhận đã nhận đủ 50 chai còn nguyên lớp cào tem bảo mật. Vị trí kho của đại lý sẽ được gắn vào dữ liệu định tuyến để giám sát chống bán lấn vùng và hàng giả.'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={scanStatus === 'valid' ? handleSign : null}
                  className={`shrink-0 font-bold py-4 px-8 rounded-2xl transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-md
                    ${scanStatus === 'invalid' 
                      ? 'bg-rose-600 text-white hover:bg-rose-700' 
                      : 'bg-gradient-to-r from-[#8C6928] to-[#6E501C] text-white hover:scale-[1.02] hover:shadow-lg'}
                  `}
                >
                  {scanStatus === 'invalid' ? 'Lập Biên Bản Trả Hàng' : 'Ký Số Nghiệm Thu & Nhập Kho ↗'}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-[#135E3E]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm animate-[fade-in_0.3s_ease-out]">
                <div className="flex items-center gap-4">
                  <CheckCircle2 size={32} className="text-[#135E3E]" />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#135E3E] mb-1">
                      ĐÃ KÝ SỐ NGHIỆM THU THÀNH CÔNG
                    </h4>
                    <p className="font-mono text-xs text-[#135E3E]/80">
                      Chữ ký đại lý: AGENT-CT-09-SIGNED-OK · Thời gian: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => {setScanStatus('idle'); setInputValue('');}} className="bg-white border border-[#135E3E] text-[#135E3E] font-bold py-3 px-6 rounded-xl hover:bg-emerald-100 transition-colors text-xs uppercase tracking-wide">
                  Quét Kiện Mới
                </button>
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}
