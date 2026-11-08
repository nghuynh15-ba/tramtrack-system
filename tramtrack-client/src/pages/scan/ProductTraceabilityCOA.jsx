import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Droplet, FlaskConical, Activity, FileText, X } from 'lucide-react';

/**
 * Hồ sơ kiểm nghiệm của một lô.
 *
 * Chỉ vẽ những gì máy chủ thật sự có: mã lô, ngày chưng cất, hàm lượng
 * 1,8-cineole, số phiếu COA, đơn vị kiểm nghiệm và (nếu cơ sở đã tải lên) ảnh
 * phiếu. Trước đây màn này có sẵn giờ thu hái, nồi số 03, biểu đồ GC-MS vẽ
 * tay kèm dấu "PASSED", hàm lượng Limonene/Terpineol và câu "khóa vào sổ cái
 * phi tập trung" — tất cả đều là chữ cố định, hiện giống hệt cho mọi lô.
 *
 * Các thông tin này do cơ sở sản xuất tự khai khi tạo lô. Hệ thống chưa đối
 * chiếu với phòng kiểm nghiệm, và màn hình nói rõ điều đó.
 */

function ngayDayDu(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ProductTraceabilityCOA({ batchInfo = {}, onBack, onNavigateToGuide }) {
  const [phongTo, setPhongTo] = useState(false);

  const cineole = batchInfo.cineole === null || batchInfo.cineole === undefined
    ? null : Number(batchInfo.cineole);
  const coCineole = cineole !== null && Number.isFinite(cineole);
  const ngay = ngayDayDu(batchInfo.distilledAt);
  const anh = batchInfo.anhPhieuCoa || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] text-[#0A1A12] py-8 lg:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={onBack}
          className="mb-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm hover:scale-105 transition-all"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-widest text-2xl sm:text-3xl mb-1">
          Hồ sơ kiểm nghiệm
        </h1>
        <h2 className="font-serif italic text-[#8C6928] text-xl sm:text-2xl mb-6">
          Lô {batchInfo.batch || '—'}
        </h2>

        {batchInfo.serial && (
          <div className="font-mono text-sm font-bold bg-white/80 border border-emerald-900/10 rounded-xl px-4 py-2 inline-block mb-8">
            Tem: {batchInfo.serial}
          </div>
        )}

        {/* Thông tin lô */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/95 border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#135E3E] mb-2">
              <Droplet size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Ngày chưng cất</span>
            </div>
            <p className="font-semibold">{ngay || 'Chưa ghi nhận'}</p>
          </div>
          <div className="bg-white/95 border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#135E3E] mb-2">
              <FlaskConical size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Đơn vị kiểm nghiệm</span>
            </div>
            <p className="font-semibold">{batchInfo.lab || 'Chưa ghi nhận'}</p>
          </div>
        </div>

        {/* Hàm lượng cineole */}
        <div className="bg-white/95 border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="font-mono text-[11px] font-bold text-[#135E3E] uppercase tracking-widest mb-5 flex items-center gap-2">
            <Activity size={16} /> Hàm lượng 1,8-Cineole
          </div>

          {coCineole ? (
            <>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-[#4F6357]">Theo phiếu kiểm nghiệm của lô</span>
                <span className="font-mono font-bold text-[#135E3E] text-2xl">{cineole.toFixed(2)}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-900/10 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-[60%] w-[1.5px] bg-[#8C6928] z-10" />
                <div className="h-full bg-[#135E3E] rounded-full" style={{ width: `${Math.min(cineole, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#4F6357] font-mono mt-1">
                <span>0%</span>
                <span className="text-[#8C6928] font-bold">mốc tham khảo 60%</span>
                <span>100%</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#4F6357]">Lô này chưa có hàm lượng cineole được ghi nhận.</p>
          )}
        </div>

        {/* Phiếu COA */}
        <div className="bg-white/95 border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="font-mono text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={16} /> Phiếu kiểm nghiệm
          </div>

          <p className="text-sm mb-4">
            Số phiếu: <strong className="font-mono text-[#135E3E]">{batchInfo.coaId || 'Chưa ghi nhận'}</strong>
          </p>

          {anh ? (
            <button
              type="button"
              onClick={() => setPhongTo(true)}
              className="block w-full rounded-2xl border border-emerald-900/15 overflow-hidden bg-[#F0F3EF] hover:opacity-95"
            >
              <img src={anh} alt={`Ảnh phiếu kiểm nghiệm ${batchInfo.coaId || ''}`} className="w-full max-h-[420px] object-contain" />
              <span className="block text-xs text-[#135E3E] font-bold py-2">Bấm để phóng to</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-[#F6F8F5] p-6 text-center text-sm text-[#4F6357]">
              Cơ sở chưa tải ảnh phiếu kiểm nghiệm cho lô này.
            </div>
          )}

          <p className="text-[12px] text-[#4F6357] leading-relaxed mt-4">
            Các thông tin trên do cơ sở sản xuất khai khi tạo lô. TramTrack lưu lại và ghi nhật ký mọi thay đổi,
            nhưng <strong>chưa đối chiếu trực tiếp với phòng kiểm nghiệm</strong>. Bạn có thể hỏi cơ sở hoặc
            phòng kiểm nghiệm để xác nhận số phiếu.
          </p>
        </div>

        {onNavigateToGuide && (
          <div className="flex justify-center pb-8">
            <button
              onClick={onNavigateToGuide}
              className="bg-gradient-to-r from-[#9E7B3B] to-[#7E5C20] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md text-sm uppercase tracking-wide flex items-center gap-2"
            >
              Xem hướng dẫn sử dụng <ArrowUpRight size={18} />
            </button>
          </div>
        )}
      </div>

      {phongTo && anh && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPhongTo(false)}
          role="dialog"
          aria-label="Ảnh phiếu kiểm nghiệm phóng to"
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center" aria-label="Đóng">
            <X size={18} />
          </button>
          <img src={anh} alt="Phiếu kiểm nghiệm" className="max-w-full max-h-full object-contain bg-white rounded-lg" />
        </div>
      )}
    </div>
  );
}
