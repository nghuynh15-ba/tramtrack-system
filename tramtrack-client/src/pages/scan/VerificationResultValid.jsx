import React from 'react';
import { Check, ShieldCheck, ArrowUpRight, Droplet, Fingerprint, FileText, FlaskConical, CalendarDays, Info } from 'lucide-react';
import { gioVietNam, ngayVietNam } from '../../services/ma';

/**
 * Kết quả Tầng 2: HỢP LỆ — mã đúng và đây là lần kích hoạt đầu tiên.
 *
 * Mọi con số trên màn này đến từ câu trả lời của máy chủ. Không có giá trị nào
 * được viết sẵn trong tệp: trước đây màn này có batchData mặc định đầy đủ, nên
 * khi giao diện chưa nối máy chủ nó vẫn hiện ra một chai "hợp lệ" hoàn chỉnh
 * với cineole 71,05 %. Một màn xác thực tự bày ra được kết quả hợp lệ mà không
 * cần máy chủ là lỗi nghiêm trọng nhất mà màn này có thể mắc.
 *
 * Nên bây giờ thiếu dữ liệu thì ô đó nói là thiếu, và prop batchData không có
 * giá trị mặc định nào ngoài một đối tượng rỗng.
 */
export default function VerificationResultValid({
  batchData = {},
  /** true khi kết quả được xác nhận lại qua Tầng 1 sau một lần mất mạng */
  xacNhanLai = false,
  /** true chỉ ở các màn trình diễn dưới /demo — không bao giờ ở luồng thật */
  laDuLieuMau = false,
  onViewJourney,
  onViewSafetyGuide,
  /** Khung tùy chọn đặt dưới lời nhắc kích hoạt, ví dụ ô chọn khu vực */
  khuVuc = null,
}) {
  const loTrinhDien = /demo/i.test(String(batchData.batchId || ''));
  const gioKichHoat = gioVietNam(batchData.activatedAt) || batchData.activatedAt || null;
  const ngayChungCat = ngayVietNam(batchData.distillationDate) || batchData.distillationDate || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] text-[#0A1A12] py-8 lg:py-12 px-4 sm:px-6 flex flex-col justify-between font-sans relative overflow-x-hidden">

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(#0A1A12 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto relative z-10">

        {loTrinhDien && (
        <div className="w-full mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-amber-900" role="note">
          <span className="mt-0.5 inline-block px-2 py-0.5 rounded bg-amber-200 text-[10px] font-bold uppercase tracking-wider shrink-0">Lô trình diễn</span>
          <span className="text-[12px] leading-snug">Dữ liệu trong lô này là minh họa để trình diễn quy trình, không phải sản phẩm đang lưu hành.</span>
        </div>
        )}

        {/* 1. Dấu xác thực */}
        <div className="flex flex-col items-center text-center w-full mb-6">
          <div className="relative mb-5 flex items-center justify-center w-[88px] h-[88px] rounded-full bg-emerald-50 border-2 border-[#8C6928]/40 shadow-[0_0_30px_rgba(19,94,62,0.15)] animate-[scale-in_0.5s_ease-out]">
            <div className="absolute inset-2 rounded-full border border-emerald-900/10 animate-[spin_10s_linear_infinite] opacity-50" />
            <Check size={40} strokeWidth={2} className="text-[#135E3E]" />
          </div>

          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-xl text-[#0A1A12] mb-1">
            XÁC THỰC THÀNH CÔNG
          </h1>
          <h2 className="font-serif italic text-[#8C6928] text-2xl mb-4">
            Kích hoạt lần đầu · Mã khớp serial
          </h2>

          {gioKichHoat && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-900/5 border border-emerald-900/10 font-mono text-[10px] sm:text-[11px] text-[#135E3E] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#135E3E] animate-pulse" />
              THỜI ĐIỂM GHI NHẬN: {gioKichHoat}
            </div>
          )}
        </div>

        {/* Chú thích khi kết quả được xác nhận lại sau một lần mất mạng */}
        {xacNhanLai && (
          <div className="w-full bg-sky-500/8 border border-sky-600/20 rounded-2xl p-4 flex items-start gap-3 mb-5">
            <Info size={20} className="text-sky-700 shrink-0 mt-0.5" />
            <p className="text-sky-950 text-[13px] leading-relaxed">
              Lần gửi trước bị mất kết nối giữa đường. Hệ thống đã đối chiếu lại và xác nhận
              chính yêu cầu của bạn đã tới máy chủ và kích hoạt thành công — đây không phải
              lần kích hoạt thứ hai.
            </p>
          </div>
        )}

        {/* 2. Hồ sơ lô */}
        <div className="w-full bg-white/90 backdrop-blur-xl border border-emerald-900/10 rounded-[24px] p-5 sm:p-6 shadow-[0_15px_40px_rgba(10,26,18,0.06)] space-y-6 mb-6">

          <div className="flex flex-col border-b border-emerald-900/10 pb-5">
            <h3 className="text-lg sm:text-xl font-bold text-[#0A1A12] mb-1">
              {batchData.productName || 'Tinh dầu tràm năm gân'}
            </h3>
            <p className="text-[#4F6357] text-sm font-medium italic font-serif">Melaleuca quinquenervia</p>
            {laDuLieuMau && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-block px-2.5 py-1 rounded bg-[#8C6928]/10 text-[#8C6928] text-xs font-bold uppercase tracking-wider">
                  DỮ LIỆU MẪU
                </span>
                <span className="text-[#4F6357] text-xs">Màn trình diễn, không nối máy chủ</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <O nhan="Số serial công khai" giaTri={batchData.serial} bieuTuong={<Fingerprint size={13} />} mono />
            <O nhan="Ngày chưng cất" giaTri={ngayChungCat} bieuTuong={<CalendarDays size={13} />} mono />
            <O nhan="Mã lô định danh" giaTri={batchData.batchId} bieuTuong={<Fingerprint size={13} />} mono />
            <O nhan="Số phiếu kiểm nghiệm" giaTri={batchData.coaId} bieuTuong={<FileText size={13} />} mono />
            <div className="col-span-2">
              <O nhan="Đơn vị kiểm nghiệm" giaTri={batchData.lab} bieuTuong={<FlaskConical size={13} />} />
            </div>
          </div>
        </div>

        {/* 3. Dải chứng cứ */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <The
            bieuTuong={<Droplet size={14} className="text-[#135E3E]" />}
            nhan="1,8-CINEOLE"
            chinh={batchData.cineoleRate || '—'}
            phu="Theo phiếu kiểm nghiệm lô"
            manhChinh
          />
          <The
            bieuTuong={<Fingerprint size={14} className="text-[#8C6928]" />}
            nhan="MÃ BÍ MẬT"
            chinh="ĐÃ KHỚP"
            phu="Đối chiếu bằng Argon2id"
          />
          <The
            bieuTuong={<ShieldCheck size={14} className="text-[#135E3E]" />}
            nhan="KÍCH HOẠT"
            chinh="LẦN ĐẦU"
            phu="Chưa từng được dùng trước đó"
          />
        </div>

        {/* 4. Cảnh báo một lần */}
        <div className="w-full bg-amber-500/10 border border-amber-600/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-8">
          <div className="shrink-0 mt-0.5">
            <ShieldCheck size={24} className="text-amber-600" />
          </div>
          <p className="text-amber-900 text-[13px] leading-relaxed font-medium">
            Mã của chai này vừa được kích hoạt và từ giờ không dùng lại được nữa. Nếu sau này
            có ai nhập đúng mã này lần thứ hai, hệ thống sẽ hiện{' '}
            <span className="font-bold text-amber-700">cảnh báo kèm mốc thời gian lần kích hoạt đầu</span>{' '}
            — chính là lần của bạn vừa rồi.
          </p>
        </div>

        {khuVuc}
      </div>

      {/* 5. Hành động */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 relative z-10 pb-4">
        <button
          onClick={onViewJourney}
          className="w-full bg-gradient-to-r from-[#9E7B3B] to-[#7E5C20] text-white font-semibold py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(142,105,40,0.25)] hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(142,105,40,0.3)] transition-all duration-300 flex items-center justify-center gap-2 text-[13px] sm:text-sm uppercase tracking-wide"
        >
          Xem hành trình của lô
          <ArrowUpRight size={18} className="opacity-80" />
        </button>

        <button
          onClick={onViewSafetyGuide}
          className="w-full bg-white/80 backdrop-blur-md border border-emerald-900/15 text-[#0A1A12] hover:bg-white font-medium py-3.5 px-6 rounded-2xl transition-all text-sm flex items-center justify-center"
        >
          Hướng dẫn sử dụng an toàn
        </button>
      </div>
    </div>
  );
}

function O({ nhan, giaTri, bieuTuong, mono = false }) {
  const co = giaTri !== null && giaTri !== undefined && giaTri !== '';
  return (
    <div>
      <p className="text-[10px] sm:text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <span className="opacity-60">{bieuTuong}</span>
        {nhan}
      </p>
      <p className={`${mono ? 'font-mono' : ''} text-sm ${co ? 'text-[#0A1A12] font-medium' : 'text-[#8F9E96] italic'}`}>
        {co ? giaTri : 'cơ sở chưa khai'}
      </p>
    </div>
  );
}

function The({ bieuTuong, nhan, chinh, phu, manhChinh = false }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-emerald-900/10 rounded-2xl p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 shadow-sm">
      <div className="flex items-center gap-2 sm:mb-1">
        {bieuTuong}
        <span className="font-mono text-[10px] font-bold text-[#4F6357]">{nhan}</span>
      </div>
      <div className="text-right sm:text-left">
        <div className={`font-mono font-bold leading-none ${manhChinh ? 'text-[#135E3E] text-lg' : 'text-[#0A1A12] text-base'}`}>
          {chinh}
        </div>
        <div className="text-[9px] text-[#4F6357] mt-1 sm:mt-1.5 font-medium">{phu}</div>
      </div>
    </div>
  );
}
