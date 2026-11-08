import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, FileSearch, MapPin, Clock } from 'lucide-react';
import { gioVietNam } from '../../services/ma';

/**
 * Kết quả Tầng 2: CẢNH BÁO — mã đúng, nhưng đã có người kích hoạt trước đó.
 *
 * ĐÂY LÀ MÀN CÓ LỜI VĂN KHÓ NHẤT CỦA CẢ HỆ THỐNG, và bản trước đã viết sai.
 *
 * Bản trước nói chai trong tay người dùng "có nguy cơ rất cao đã bị sao chép".
 * Câu đó vượt quá những gì hệ thống biết. Nếu mã bị rò rỉ ngay từ khâu in —
 * ai đó ở nhà in chụp lại bảng mã trước khi dán lớp phủ — thì kẻ làm giả kích
 * hoạt TRƯỚC, và người đang đọc màn này chính là chủ chai thật. Hệ thống không
 * có cách nào phân biệt hai trường hợp, nên không được chọn một.
 *
 * Nguyên tắc đã chốt: hệ thống công bố SỰ KIỆN ĐÃ GHI NHẬN (mã này được kích
 * hoạt lúc nào, ở tỉnh nào nếu biết), và nói rõ cả hai cách giải thích. Người
 * dùng có một dữ kiện mà hệ thống không có — con tem đang nằm trong tay họ còn
 * nguyên hay đã bị cào — và chính dữ kiện đó mới kết luận được.
 *
 * Bản trước cũng hiện "ĐÂY LÀ LƯỢT QUÉT THỨ 04" với scanCount mặc định là 4.
 * Con số đó không có trong câu trả lời của máy chủ, tức là nó được bịa ra. Đã
 * bỏ hẳn.
 */
export default function VerificationResultWarning({
  serialNumber,
  /** chuỗi ISO từ máy chủ: bang_chung.kich_hoat_dau_luc */
  firstActivatedAt,
  /** tỉnh của lần kích hoạt đầu — chỉ hiện khi hienViTri */
  firstLocation,
  hienViTri = false,
  onReportFake,
  onViewBatchInfo,
}) {
  const gioDau = gioVietNam(firstActivatedAt);
  const gioHienTai = gioVietNam(new Date().toISOString());

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F8F3EA] to-[#F1E9DC] text-[#1A140A] py-8 lg:py-12 px-4 sm:px-6 flex flex-col justify-between font-sans relative overflow-x-hidden">

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(#B45309 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto relative z-10">

        {/* 1. Đầu màn */}
        <div className="flex flex-col items-center text-center w-full mb-6">
          <div className="relative mb-5 flex items-center justify-center w-[88px] h-[88px] rounded-full bg-amber-100/70 border-2 border-[#B45309]/30 shadow-[0_0_35px_rgba(180,83,9,0.15)] animate-[scale-in_0.5s_ease-out]">
            <div className="absolute inset-2 rounded-full border border-amber-700/10 animate-[pulse_2s_ease-in-out_infinite]" />
            <ShieldAlert size={40} strokeWidth={2} className="text-[#B45309]" />
          </div>

          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-lg sm:text-xl text-[#B45309] mb-1">
            MÃ NÀY ĐÃ ĐƯỢC KÍCH HOẠT TRƯỚC ĐÓ
          </h1>
          <h2 className="font-serif italic text-[#78350F] text-xl sm:text-2xl mb-4">
            Mã đúng, nhưng đây không phải lần đầu
          </h2>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-mono text-[11px] text-[#92400E] font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse" />
            {serialNumber}
          </div>
        </div>

        {/* 2. Bằng chứng — chỉ sự kiện, không phán quyết */}
        <div className="w-full bg-white/95 backdrop-blur-xl border border-amber-900/15 rounded-[24px] p-5 sm:p-6 shadow-[0_15px_40px_rgba(180,83,9,0.08)] space-y-5 mb-5">

          <div className="flex flex-col items-center border-b border-amber-900/10 pb-4">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#92400E] font-semibold tracking-wider">
              SỰ KIỆN HỆ THỐNG ĐÃ GHI NHẬN
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Lần kích hoạt đầu */}
            <div className="bg-stone-50 border border-stone-900/10 rounded-2xl p-4 flex flex-col gap-2.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-stone-500/60" />
              <div className="font-mono text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                LẦN KÍCH HOẠT ĐẦU TIÊN
              </div>
              <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-end">
                <div>
                  <div className="text-[10px] text-stone-600 uppercase font-semibold flex items-center gap-1">
                    <Clock size={10} /> Thời gian
                  </div>
                  <div className="font-mono font-medium text-stone-900 text-sm sm:text-base">
                    {gioDau || 'không ghi được mốc thời gian'}
                  </div>
                </div>
                {hienViTri && firstLocation && (
                  <div className="sm:text-right">
                    <div className="text-[10px] text-stone-600 uppercase font-semibold flex items-center gap-1 sm:justify-end">
                      <MapPin size={10} /> Tỉnh ước tính
                    </div>
                    <div className="font-medium text-stone-900 text-[13px] sm:text-sm">{firstLocation}</div>
                  </div>
                )}
              </div>
              {hienViTri && firstLocation && (
                <p className="text-[11px] text-stone-600 leading-snug pt-1">
                  Tỉnh ước tính từ địa chỉ mạng, có thể lệch — mạng di động ở Việt Nam thường
                  dùng NAT nên không phải lúc nào cũng tra được đúng.
                </p>
              )}
            </div>

            <div className="w-0.5 h-3 bg-amber-900/10 mx-auto" />

            {/* Lượt hiện tại */}
            <div className="bg-amber-50/80 border border-amber-600/20 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/70" />
              <div className="font-mono text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                LƯỢT NHẬP MÃ CỦA BẠN
              </div>
              <div className="flex flex-col gap-1 sm:gap-0 sm:flex-row sm:justify-between sm:items-end">
                <div>
                  <div className="text-[10px] text-amber-900/60 uppercase font-semibold flex items-center gap-1">
                    <Clock size={10} /> Thời gian
                  </div>
                  <div className="font-mono font-medium text-amber-950 text-sm sm:text-base">{gioHienTai}</div>
                </div>
                <div className="sm:text-right mt-1 sm:mt-0">
                  <div className="text-[10px] text-amber-900/60 uppercase font-semibold">Mã bí mật</div>
                  <div className="font-semibold text-amber-700 text-[13px] sm:text-sm">Khớp</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Hai cách giải thích — phần không được rút gọn */}
        <div className="w-full bg-white/70 border border-amber-900/10 rounded-2xl p-5 mb-5">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#92400E] mb-3">
            Hệ thống không kết luận chai nào thật
          </h3>
          <p className="text-[13px] text-[#1A140A] leading-relaxed mb-4">
            Một mã chỉ kích hoạt được một lần, nên việc nó đã kích hoạt rồi có đúng hai cách
            giải thích — và hệ thống không có đủ dữ kiện để chọn:
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="font-mono font-bold text-[#B45309] text-sm shrink-0">1.</span>
              <p className="text-[13px] text-[#1A140A] leading-relaxed">
                Con tem bạn đang cầm là <span className="font-semibold">bản sao</span> của một
                con tem thật đã được dùng. Khi đó chai thật là chai đã kích hoạt lúc trên.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-mono font-bold text-[#B45309] text-sm shrink-0">2.</span>
              <p className="text-[13px] text-[#1A140A] leading-relaxed">
                Mã bị <span className="font-semibold">rò rỉ từ khâu in</span> và kẻ làm giả
                kích hoạt trước. Khi đó chai thật lại chính là chai trong tay bạn, còn lần
                kích hoạt lúc trên là của hàng giả.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-900/10">
            <p className="text-[13px] text-[#1A140A] leading-relaxed">
              <span className="font-semibold">Dữ kiện chỉ bạn có:</span> trước khi nhập mã,
              lớp phủ bạc trên con tem này còn nguyên hay đã bị cào sẵn? Nếu nó đã bị cào sẵn
              từ trước khi bạn mua, đó là dấu hiệu rõ nhất.
            </p>
          </div>
        </div>

        {/* 4. Khuyến nghị */}
        <div className="w-full bg-rose-500/5 border border-rose-600/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-8">
          <div className="shrink-0 mt-0.5">
            <AlertTriangle size={24} className="text-rose-600" />
          </div>
          <p className="text-rose-900 text-[13px] leading-relaxed font-medium">
            Hãy tạm ngừng sử dụng, giữ lại chai, con tem và hoá đơn, rồi gửi thông tin cho cơ
            sở sản xuất. Chỉ cơ sở mới đối chiếu được lượt kích hoạt này với sổ xuất hàng của
            họ để biết con tem đi về đâu.
          </p>
        </div>
      </div>

      {/* 5. Hành động */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 relative z-10 pb-4">
        <button
          onClick={onReportFake}
          className="w-full bg-gradient-to-r from-[#C25E00] to-[#9A4600] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(154,70,0,0.25)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 text-[13px] sm:text-sm uppercase tracking-wide"
        >
          <AlertCircle size={18} strokeWidth={2.5} />
          Gửi thông tin cho cơ sở sản xuất
        </button>

        <button
          onClick={onViewBatchInfo}
          className="w-full bg-white backdrop-blur-md border border-amber-900/15 text-[#1A140A] hover:bg-amber-50 font-semibold py-3.5 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <FileSearch size={16} className="text-amber-800" />
          Xem hồ sơ lô sản xuất
        </button>
      </div>
    </div>
  );
}
