import React from 'react';
import { ShieldX, AlertOctagon, XCircle, RefreshCcw, Send, CheckCircle2 } from 'lucide-react';
import { catNgan } from '../../services/ma';

/**
 * Không xác thực được.
 *
 * Màn này phục vụ hai tình huống khác nhau và lời văn phải khác nhau:
 *
 *   nguonGoc="tang-1"  tra cứu serial công khai mà không có trong hệ thống.
 *                      Hay gặp nhất là quét nhầm mã QR khác, hoặc gõ sai serial.
 *
 *   nguonGoc="tang-2"  đã nhập mã bí mật nhưng máy chủ không xác thực được.
 *                      Máy chủ CỐ Ý không cho biết là serial sai hay mã sai —
 *                      nếu phân biệt được thì kẻ dò mã biết mình đã tìm đúng
 *                      serial và chỉ còn phải dò 12 ký tự còn lại. Giao diện
 *                      phải tôn trọng điều đó, không được đoán hộ người dùng.
 *
 * Bản trước nói thẳng "Mã Định Danh Không Tồn Tại Trên Hệ Thống" cho cả hai
 * trường hợp. Ở Tầng 2 câu đó vừa sai (có thể serial tồn tại, chỉ mã sai) vừa
 * làm rò rỉ đúng cái thông tin máy chủ đang giấu.
 *
 * Và không màn nào ở đây được nói chữ "hàng giả": một mã không tra được thường
 * là lỗi gõ sai, không phải bằng chứng gì cả.
 */
export default function VerificationResultInvalid({
  invalidCode,
  nguonGoc = 'tang-1',
  onRetry,
  onReportFake,
}) {
  const laTang2 = nguonGoc === 'tang-2';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F8] via-[#FAF1F1] to-[#F5E6E6] text-[#1A0A0A] py-8 lg:py-12 px-4 sm:px-6 flex flex-col justify-between font-sans relative overflow-x-hidden">

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(#991B1B 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto relative z-10">

        {/* 1. Đầu màn */}
        <div className="flex flex-col items-center text-center w-full mb-6">
          <div className="relative mb-5 flex items-center justify-center w-[88px] h-[88px] rounded-full bg-rose-100/80 border-2 border-[#991B1B]/30 shadow-[0_0_35px_rgba(153,27,27,0.15)] animate-[scale-in_0.5s_ease-out]">
            <div className="absolute inset-2 rounded-full border border-rose-700/10 animate-[pulse_2s_ease-in-out_infinite]" />
            <ShieldX size={40} strokeWidth={2} className="text-[#991B1B]" />
          </div>

          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-lg sm:text-xl text-[#991B1B] mb-1">
            KHÔNG XÁC THỰC ĐƯỢC
          </h1>
          <h2 className="font-serif italic text-[#7F1D1D] text-xl sm:text-2xl mb-4">
            {laTang2 ? 'Mã vừa nhập không xác thực được' : 'Serial này không có trong hệ thống'}
          </h2>
        </div>

        {/* 2. Chuỗi đã tra */}
        <div className="w-full bg-white/95 backdrop-blur-xl border border-rose-900/15 rounded-[24px] p-5 sm:p-6 shadow-[0_15px_40px_rgba(153,27,27,0.08)] space-y-5 mb-6">

          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 border-b border-rose-900/10 pb-5">
            <div className="text-center sm:text-left min-w-0">
              <div className="font-mono text-[10px] sm:text-xs text-[#7F1D1D] uppercase font-bold tracking-wider mb-1">
                {laTang2 ? 'Serial đã gửi' : 'Chuỗi đã tra cứu'}
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold text-[#B91C1C] tracking-wider break-all">
                {catNgan(invalidCode) || '—'}
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end bg-rose-50 px-3 py-2 rounded-xl border border-rose-900/10 shrink-0">
              <div className="font-mono text-[10px] text-rose-800 font-bold mb-1">KẾT QUẢ</div>
              <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                KHÔNG KHỚP <XCircle size={14} className="text-[#991B1B]" strokeWidth={3} />
              </div>
            </div>
          </div>

          {laTang2 ? (
            <p className="text-[#1A0A0A] text-[13px] sm:text-sm leading-relaxed">
              Hệ thống không xác thực được yêu cầu này. Để không giúp người dò mã, máy chủ
              không cho biết là serial không tồn tại hay mã bí mật nhập sai — hai trường hợp
              trả về cùng một câu trả lời.{' '}
              <span className="font-semibold">Khả năng cao nhất là đọc sai một ký tự.</span>
            </p>
          ) : (
            <p className="text-[#1A0A0A] text-[13px] sm:text-sm leading-relaxed">
              Chuỗi này không khớp với con tem nào đã đăng ký trên hệ thống TramTrack. Nếu bạn
              vừa quét một mã QR, rất có thể đó là mã QR khác trên bao bì — mã vạch sản phẩm,
              mã khuyến mãi hoặc mã của nhà phân phối.
            </p>
          )}
        </div>

        {/* 3. Việc nên làm */}
        <div className="w-full bg-rose-500/10 border border-rose-600/25 rounded-2xl p-5 flex items-start gap-4 mb-6">
          <div className="shrink-0 mt-0.5">
            <AlertOctagon size={24} className="text-rose-700" />
          </div>
          <div className="text-rose-950 text-[13px] leading-relaxed font-medium">
            <strong className="text-rose-800 uppercase block mb-1.5 text-xs tracking-wider">
              Nên làm gì
            </strong>
            {laTang2 ? (
              <ul className="space-y-1.5">
                <li>· Đọc lại 12 ký tự dưới lớp cào dưới ánh sáng rõ, nhìn cả góc nghiêng.</li>
                <li>· Tem không in <span className="font-mono font-bold">0 1 O I L</span> — thấy giống số 0 thì đó là chữ O.</li>
                <li>· Kiểm tra cả serial in bên ngoài đã đúng chưa rồi thử lại.</li>
                <li>· Sau vài lần sai, hệ thống sẽ tạm khoá serial này 15 phút để chặn dò mã.</li>
              </ul>
            ) : (
              <ul className="space-y-1.5">
                <li>· Quét đúng mã QR nằm trên con tem TramTrack, không phải mã khác trên vỏ.</li>
                <li>· Nếu gõ tay, serial có dạng <span className="font-mono font-bold">TDT-2026-000000</span>.</li>
                <li>· Giữ lại sản phẩm và hoá đơn, rồi gửi thông tin cho cơ sở sản xuất.</li>
              </ul>
            )}
          </div>
        </div>

        {/* 4. Nhận dạng tem thật */}
        <div className="w-full bg-white/60 border border-[#1A0A0A]/5 rounded-2xl p-5 mb-8">
          <h3 className="font-semibold text-[13px] text-[#1A0A0A] mb-3 uppercase tracking-wider">
            Tem TramTrack trông thế nào
          </h3>
          <ul className="space-y-3">
            {[
              'Kích thước 30 × 20 mm, có mã QR công khai quét được khi tem còn nguyên.',
              'Có dải phủ bạc cào được, bên dưới là 12 ký tự chia ba nhóm bốn.',
              'Serial công khai in rõ ngay dưới mã QR, dạng TDT-2026-000000.',
              'Tem còn nguyên vẹn, không có dấu bóc dán lại hay dải phủ đã bị cào sẵn.',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#1A0A0A]/80 font-medium leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Hành động */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 relative z-10 pb-4">
        <button
          onClick={onRetry}
          className="w-full bg-gradient-to-r from-[#991B1B] to-[#7F1D1D] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(153,27,27,0.25)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 text-[13px] sm:text-sm uppercase tracking-wide"
        >
          <RefreshCcw size={17} strokeWidth={2.5} />
          {laTang2 ? 'Nhập lại mã' : 'Quét lại / nhập serial thủ công'}
        </button>

        <button
          onClick={onReportFake}
          className="w-full bg-white border border-rose-900/20 text-[#1A0A0A] hover:bg-rose-50 font-semibold py-3.5 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <Send size={16} className="text-rose-900/70" />
          Gửi thông tin cho cơ sở sản xuất
        </button>
      </div>
    </div>
  );
}
