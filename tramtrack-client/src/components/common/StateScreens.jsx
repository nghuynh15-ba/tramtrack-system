import React, { useState } from 'react';
import {
  Loader2, WifiOff, RefreshCcw, Lock, PackageX, AlertOctagon, ArrowLeft, Clock,
} from 'lucide-react';
import { kiemTraMayChu } from '../../services/api';
import { gioVietNam } from '../../services/ma';

/**
 * Các màn trạng thái dùng chung cho cả Tầng 1 và Tầng 2.
 *
 * Bốn màn này là phần hay bị bỏ quên nhất khi nối giao diện vào máy chủ, mà
 * lại là phần người dùng thật gặp nhiều nhất: mạng chập chờn ở chợ, lô bị thu
 * hồi, serial bị tạm khoá vì ai đó dò mã.
 *
 * Nguyên tắc chung của cả bốn: KHÔNG màn nào trong đây được nói sản phẩm thật
 * hay giả. Chúng chỉ nói hệ thống đang ở trạng thái nào.
 */

/* ------------------------------------------------------------------ */

export function LoadingScreen({ nhan = 'Đang tra cứu', phu }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] flex flex-col items-center justify-center px-6 font-sans">
      <div className="relative flex items-center justify-center w-[72px] h-[72px] mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-900/10" />
        <Loader2 size={34} className="text-[#135E3E] animate-spin" strokeWidth={2.2} />
      </div>
      <p className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-sm text-[#0A1A12] mb-1.5">
        {nhan}
      </p>
      {phu && (
        <p className="font-mono text-[11px] text-[#4F6357] tracking-wide text-center">{phu}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Chưa hỏi được máy chủ.
 *
 * Màn này cố ý trung tính về màu và lời văn: không xanh, không đỏ. Người dùng
 * phải hiểu rằng hệ thống CHƯA TRẢ LỜI, chứ không phải trả lời xấu. Một màn
 * đỏ ở đây sẽ làm người mua bỏ lại một chai thật chỉ vì wifi quán rớt.
 */
export function ConnectionErrorScreen({ thongDiep, serial, onThuLai, onDong }) {
  const [dangThu, setDangThu] = useState(false);

  const thuLai = async () => {
    setDangThu(true);
    try {
      await kiemTraMayChu();
    } catch {
      // Vẫn chưa được — cứ gọi lại onThuLai để màn gọi tự xử lý tiếp.
    } finally {
      setDangThu(false);
      onThuLai?.();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F6] via-[#F1F1EF] to-[#E9E9E6] text-[#1A1A18] flex flex-col justify-between py-8 px-5 sm:px-6 font-sans">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto text-center">
        <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-white border border-[#1A1A18]/10 shadow-sm mb-6">
          <WifiOff size={36} className="text-[#6B6B66]" strokeWidth={2} />
        </div>

        <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-base sm:text-lg text-[#1A1A18] mb-2">
          Chưa tra cứu được
        </h1>
        <p className="text-[#55554F] text-sm leading-relaxed mb-1">
          {thongDiep || 'Không nối được tới máy chủ TramTrack.'}
        </p>
        <p className="text-[#55554F] text-[13px] leading-relaxed mb-6">
          Đây là lỗi kết nối, <span className="font-semibold text-[#1A1A18]">không phải</span> kết
          luận về sản phẩm. Hệ thống chưa nói gì về con tem này.
        </p>

        {serial && (
          <div className="font-mono text-xs text-[#55554F] bg-white border border-[#1A1A18]/10 rounded-xl px-4 py-2.5 mb-6">
            Mã đang tra: <span className="font-bold text-[#1A1A18]">{serial}</span>
          </div>
        )}

        <div className="w-full bg-white/70 border border-[#1A1A18]/8 rounded-2xl p-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#55554F] mb-2">
            Nên thử
          </p>
          <ul className="space-y-1.5 text-[13px] text-[#1A1A18]/80 leading-snug">
            <li>· Kiểm tra wifi hoặc dữ liệu di động rồi bấm Tra cứu lại.</li>
            <li>· Nếu đang ở chỗ sóng yếu, ra chỗ thoáng hơn và thử lại.</li>
            <li>· Giữ nguyên con tem và hoá đơn cho tới khi tra được.</li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-2">
        <button
          onClick={thuLai}
          disabled={dangThu}
          className="w-full bg-[#1A1A18] text-white font-semibold py-4 rounded-2xl text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#2C2C28] transition-colors"
        >
          {dangThu ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <RefreshCcw size={17} />
          )}
          {dangThu ? 'Đang thử lại' : 'Tra cứu lại'}
        </button>
        <button
          onClick={onDong}
          className="w-full bg-white border border-[#1A1A18]/15 text-[#1A1A18] font-medium py-3.5 rounded-2xl text-sm hover:bg-[#F1F1EF] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Serial bị tạm khoá vì nhập sai mã quá nhiều lần.
 *
 * Lời văn ở đây phải trung lập: người bị khoá đôi khi chính là chủ chai thật
 * gõ sai năm lần, nhưng cũng có thể là kẻ đang dò mã. Hệ thống không biết là
 * ai, nên không nói ai.
 */
export function LockedScreen({ serial, moKhoaLuc, onDong }) {
  const gio = gioVietNam(moKhoaLuc);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7F4] via-[#F2F0EA] to-[#EAE6DC] text-[#1A160A] flex flex-col justify-between py-8 px-5 sm:px-6 font-sans">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto text-center">
        <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-white border border-[#8C6928]/25 shadow-sm mb-6">
          <Lock size={34} className="text-[#8C6928]" strokeWidth={2} />
        </div>

        <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-base sm:text-lg text-[#6B5012] mb-2">
          Mã này đang tạm khoá
        </h1>
        <p className="text-[#554D33] text-sm leading-relaxed mb-5">
          Đã có quá nhiều lần nhập sai mã bí mật cho serial này, nên hệ thống tạm dừng nhận
          thêm lần thử. Đây là cơ chế chặn dò mã tự động.
        </p>

        <div className="w-full bg-white border border-[#8C6928]/15 rounded-2xl px-5 py-4 mb-5">
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C6928] mb-1">
            Serial
          </div>
          <div className="font-mono font-bold text-[#1A160A] text-base tracking-wider mb-4">
            {serial}
          </div>
          {gio && (
            <>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C6928] mb-1 flex items-center justify-center gap-1.5">
                <Clock size={11} /> Mở lại lúc
              </div>
              <div className="font-mono font-medium text-[#1A160A] text-sm">{gio}</div>
            </>
          )}
        </div>

        <p className="text-[13px] text-[#554D33] leading-relaxed">
          Trong lúc chờ, hãy đọc lại 12 ký tự dưới lớp cào dưới ánh sáng rõ. Tem không bao
          giờ in năm ký tự <span className="font-mono font-bold">0 1 O I L</span> — nếu bạn
          thấy giống số 0 thì đó là chữ O, và ngược lại.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto pb-2">
        <button
          onClick={onDong}
          className="w-full bg-white border border-[#8C6928]/20 text-[#1A160A] font-medium py-3.5 rounded-2xl text-sm hover:bg-[#F2F0EA] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Lô đã bị thu hồi.
 *
 * Ưu tiên cao nhất trong mọi kết quả, kể cả cao hơn HỢP LỆ: một con tem thật
 * thuộc lô đã thu hồi thì việc nó thật không còn là điều người dùng cần biết
 * nhất. Màn này không nói hàng giả — nó nói đừng dùng.
 */
export function RecalledScreen({ serial, lyDo, thoiDiem, lo, onBaoCao, onDong }) {
  const gio = gioVietNam(thoiDiem);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F8] via-[#FAF1F1] to-[#F4E4E4] text-[#1A0A0A] flex flex-col justify-between py-8 px-5 sm:px-6 font-sans">
      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto text-center">
        <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-white border-2 border-[#991B1B]/25 shadow-sm mb-6 mt-4">
          <PackageX size={36} className="text-[#991B1B]" strokeWidth={2} />
        </div>

        <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-base sm:text-lg text-[#991B1B] mb-1">
          Lô này đã bị thu hồi
        </h1>
        <h2 className="font-serif italic text-[#7F1D1D] text-lg sm:text-xl mb-5">
          Vui lòng ngừng sử dụng
        </h2>

        <div className="w-full bg-white border border-rose-900/15 rounded-2xl p-5 text-left space-y-4 mb-5">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7F1D1D] mb-1">
              Serial
            </div>
            <div className="font-mono font-bold text-[#1A0A0A] text-sm tracking-wider">{serial}</div>
          </div>
          {lo?.ma_lo && (
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7F1D1D] mb-1">
                Mã lô
              </div>
              <div className="font-mono font-medium text-[#1A0A0A] text-sm">{lo.ma_lo}</div>
            </div>
          )}
          {gio && (
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7F1D1D] mb-1">
                Thời điểm thu hồi
              </div>
              <div className="font-mono font-medium text-[#1A0A0A] text-sm">{gio}</div>
            </div>
          )}
          {lyDo && (
            <div className="pt-3 border-t border-rose-900/10">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7F1D1D] mb-1.5">
                Lý do cơ sở công bố
              </div>
              <p className="text-[13px] text-[#1A0A0A] leading-relaxed">{lyDo}</p>
            </div>
          )}
        </div>

        <div className="w-full bg-rose-500/10 border border-rose-600/25 rounded-2xl p-4 flex items-start gap-3 text-left">
          <AlertOctagon size={22} className="text-rose-700 shrink-0 mt-0.5" />
          <p className="text-rose-950 text-[13px] leading-relaxed font-medium">
            Con tem này có thật trong hệ thống, nhưng cả lô đã được cơ sở sản xuất thu hồi.
            Hãy giữ lại chai và hoá đơn, rồi liên hệ nơi bán hoặc cơ sở sản xuất theo thông
            tin in trên bao bì.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col gap-3 pt-6 pb-2">
        <button
          onClick={onBaoCao}
          className="w-full bg-gradient-to-r from-[#991B1B] to-[#7F1D1D] text-white font-bold py-4 rounded-2xl text-[13px] sm:text-sm uppercase tracking-wide shadow-[0_8px_25px_rgba(153,27,27,0.22)] hover:scale-[1.01] transition-transform"
        >
          Gửi thông tin cho cơ sở sản xuất
        </button>
        <button
          onClick={onDong}
          className="w-full bg-white border border-rose-900/15 text-[#1A0A0A] font-medium py-3.5 rounded-2xl text-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
