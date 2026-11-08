import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck, ScanLine, Droplet, FileText, FlaskConical, CalendarDays,
  AlertTriangle, ArrowRight, ArrowLeft, Fingerprint, Eye,
} from 'lucide-react';
import { traCuuTang1, laLoiKetNoi } from '../../../services/api';
import { serialDungDinhDang, gioVietNam, ngayVietNam } from '../../../services/ma';
import { LoadingScreen, ConnectionErrorScreen, RecalledScreen } from '../../../components/common/StateScreens';
import VerificationResultInvalid from '../../scan/VerificationResultInvalid';

/**
 * TẦNG 1 — tra cứu khi con tem CÒN NGUYÊN.
 *
 * Đây là màn mà toàn bộ đóng góp của đề tài nằm ở: người mua đứng ở quầy, chưa
 * trả tiền, chưa được phép cào lớp phủ của người bán. Họ quét mã QR công khai
 * và nhận về hai thứ:
 *
 *   1. Hồ sơ lô — chưng cất ngày nào, cineole bao nhiêu, phiếu kiểm nghiệm số
 *      mấy, ai kiểm. Đây là phần "truy xuất".
 *   2. Mã này đã từng được kích hoạt chưa. Đây là phần "xác thực" làm được mà
 *      không phá tem.
 *
 * Điểm thứ hai là chỗ mạnh nhất và cũng dễ viết sai nhất. Nếu mã đã kích hoạt
 * mà con tem trong tay người mua còn nguyên lớp cào, thì hai dữ kiện đó mâu
 * thuẫn nhau, và mâu thuẫn ấy là tín hiệu đáng dừng lại. Nhưng hệ thống KHÔNG
 * được kết luận chai nào giả: mã rò rỉ từ khâu in thì lần kích hoạt đầu tiên
 * mới là lần của hàng giả. Hệ thống công bố sự kiện, người mua tự kết luận.
 */
export default function VerifyTier1Screen({
  serial,
  onKichHoat,     // sang Tầng 2
  onXemHanhTrinh,
  onBaoCao,
  onQuetLai,
  onDong,
}) {
  const [trangThai, setTrangThai] = useState('dang-tra');  // dang-tra | xong | mat-ket-noi
  const [duLieu, setDuLieu] = useState(null);
  const [loi, setLoi] = useState(null);

  const tra = useCallback(async () => {
    setTrangThai('dang-tra');
    setLoi(null);
    try {
      const kq = await traCuuTang1(serial);
      setDuLieu(kq);
      setTrangThai('xong');
    } catch (e) {
      // Chỉ lỗi kết nối mới sang màn riêng. Mọi phán quyết về con tem đều
      // nằm trong ket_qua của một câu trả lời thành công.
      setLoi(e);
      setTrangThai('mat-ket-noi');
    }
  }, [serial]);

  useEffect(() => {
    if (!serialDungDinhDang(serial)) {
      // Không gọi máy chủ cho chuỗi sai hình thức — nhưng cũng không nói giả.
      setDuLieu({ ket_qua: 'KHONG_TIM_THAY', serial });
      setTrangThai('xong');
      return;
    }
    tra();
  }, [serial, tra]);

  if (trangThai === 'dang-tra') {
    return <LoadingScreen nhan="Đang tra cứu hồ sơ lô" phu={serial} />;
  }

  if (trangThai === 'mat-ket-noi') {
    return (
      <ConnectionErrorScreen
        serial={serial}
        thongDiep={
          laLoiKetNoi(loi)
            ? loi.message
            : 'Máy chủ đang gặp sự cố và chưa trả lời được.'
        }
        onThuLai={tra}
        onDong={onDong}
      />
    );
  }

  if (duLieu.ket_qua === 'DA_THU_HOI') {
    return (
      <RecalledScreen
        serial={duLieu.serial}
        lyDo={duLieu.thu_hoi?.ly_do}
        thoiDiem={duLieu.thu_hoi?.thoi_diem}
        lo={duLieu.lo}
        onBaoCao={onBaoCao}
        onDong={onDong}
      />
    );
  }

  if (duLieu.ket_qua === 'KHONG_TIM_THAY') {
    return (
      <VerificationResultInvalid
        invalidCode={duLieu.serial || serial}
        nguonGoc="tang-1"
        onRetry={onQuetLai}
        onReportFake={onBaoCao}
      />
    );
  }

  // ket_qua === 'TIM_THAY'
  const daKichHoat = Boolean(duLieu.da_kich_hoat);
  const lo = duLieu.lo || {};
  const gioKichHoat = gioVietNam(duLieu.kich_hoat_luc);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between py-8 px-5 sm:px-6 font-sans relative overflow-x-hidden ${
        daKichHoat
          ? 'bg-gradient-to-b from-[#FDFBF7] via-[#F8F3EA] to-[#F1E9DC] text-[#1A140A]'
          : 'bg-gradient-to-b from-[#F6F8F5] via-[#EFF3EC] to-[#E9EFE6] text-[#0A1A12]'
      }`}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(${daKichHoat ? '#B45309' : '#0A1A12'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto relative z-10">

        {/* Nhãn tầng — người dùng phải biết mình đang ở bước nào */}
        <div className="w-full flex items-center justify-between mb-5">
          <button
            onClick={onDong}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 border border-black/5 shadow-sm hover:bg-white transition-colors"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-black/5 font-mono text-[10px] font-bold tracking-wider">
            <Eye size={11} className={daKichHoat ? 'text-[#B45309]' : 'text-[#135E3E]'} />
            TẦNG 1 · TEM CHƯA CÀO
          </div>
          <div className="w-9" />
        </div>

        {/demo/i.test(String(lo.ma_lo || '')) && (
        <div className="w-full mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-amber-900" role="note">
          <span className="mt-0.5 inline-block px-2 py-0.5 rounded bg-amber-200 text-[10px] font-bold uppercase tracking-wider shrink-0">Lô trình diễn</span>
          <span className="text-[12px] leading-snug">Dữ liệu trong lô này là minh họa để trình diễn quy trình, không phải sản phẩm đang lưu hành.</span>
        </div>
        )}

        {/* 1. Kết luận của Tầng 1 */}
        <div className="flex flex-col items-center text-center w-full mb-6">
          <div
            className={`relative mb-5 flex items-center justify-center w-[84px] h-[84px] rounded-full border-2 shadow-sm ${
              daKichHoat
                ? 'bg-amber-100/70 border-[#B45309]/30'
                : 'bg-emerald-50 border-[#8C6928]/35'
            }`}
          >
            {daKichHoat ? (
              <AlertTriangle size={36} strokeWidth={2} className="text-[#B45309]" />
            ) : (
              <ShieldCheck size={38} strokeWidth={2} className="text-[#135E3E]" />
            )}
          </div>

          <h1
            className={`font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-base sm:text-lg mb-1 ${
              daKichHoat ? 'text-[#B45309]' : 'text-[#0A1A12]'
            }`}
          >
            {daKichHoat ? 'Mã này đã được kích hoạt' : 'Mã này chưa ai kích hoạt'}
          </h1>
          <h2
            className={`font-serif italic text-lg sm:text-xl mb-4 ${
              daKichHoat ? 'text-[#78350F]' : 'text-[#8C6928]'
            }`}
          >
            {daKichHoat ? 'Hãy đối chiếu với con tem trong tay bạn' : 'Có trong hệ thống, chưa từng mở niêm'}
          </h2>

          <div
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-wide border ${
              daKichHoat
                ? 'bg-amber-500/15 border-amber-500/30 text-[#92400E]'
                : 'bg-emerald-900/5 border-emerald-900/10 text-[#135E3E]'
            }`}
          >
            <Fingerprint size={12} />
            {duLieu.serial}
          </div>
        </div>

        {/* 2. Giải thích — phần quan trọng nhất của màn này */}
        {daKichHoat ? (
          <div className="w-full bg-white border border-amber-900/15 rounded-[22px] p-5 mb-5 shadow-[0_12px_32px_rgba(180,83,9,0.07)]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#92400E] mb-2.5">
              Hệ thống ghi nhận được gì
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#1A140A] mb-4">
              Mã bí mật của serial này đã được dùng để kích hoạt
              {gioKichHoat ? (
                <> vào lúc <span className="font-mono font-bold">{gioKichHoat}</span></>
              ) : (
                ' trước đó'
              )}
              .
            </p>

            <div className="bg-amber-50/70 border border-amber-600/20 rounded-2xl p-4">
              <p className="text-[13px] leading-relaxed text-amber-950 font-medium">
                Nếu lớp phủ bạc trên con tem bạn đang cầm{' '}
                <span className="font-bold">vẫn còn nguyên</span>, thì hai dữ kiện này không
                khớp nhau — vì về nguyên tắc chỉ người cào lớp phủ mới đọc được mã để kích hoạt.
                Đây là lúc nên dừng lại và hỏi người bán.
              </p>
            </div>

            <p className="text-[12.5px] leading-relaxed text-[#4F4232] mt-4">
              Hệ thống chỉ công bố <span className="font-semibold">sự kiện đã ghi nhận</span>,
              không kết luận chai nào thật chai nào giả. Nếu mã bị rò rỉ ngay từ khâu in thì
              lần kích hoạt đầu tiên mới là lần của hàng giả — nên bản thân con tem bạn đang
              cầm chưa bị kết luận gì.
            </p>
          </div>
        ) : (
          <div className="w-full bg-white border border-emerald-900/10 rounded-[22px] p-5 mb-5 shadow-[0_12px_32px_rgba(10,26,18,0.05)]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#135E3E] mb-2.5">
              Hệ thống ghi nhận được gì
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#0A1A12] mb-4">
              Serial này có thật trong hệ thống và mã bí mật của nó{' '}
              <span className="font-semibold">chưa từng được dùng để kích hoạt</span>. Đây là
              trạng thái đúng của một chai chưa qua tay ai.
            </p>
            <div className="bg-emerald-50/70 border border-emerald-900/10 rounded-2xl p-4">
              <p className="text-[13px] leading-relaxed text-emerald-950 font-medium">
                Bạn vừa kiểm tra xong mà chưa phải cào gì cả. Chỉ cào lớp phủ bạc{' '}
                <span className="font-bold">sau khi đã mua</span> — cào là mở niêm, và chỉ
                kích hoạt được một lần duy nhất.
              </p>
            </div>
          </div>
        )}

        {/* 3. Hồ sơ lô — phần truy xuất nguồn gốc */}
        <div className="w-full bg-white/90 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 sm:p-6 shadow-[0_12px_32px_rgba(10,26,18,0.05)] mb-6">
          <div className="border-b border-black/5 pb-4 mb-5">
            <h3 className="text-base sm:text-lg font-bold mb-0.5">
              {lo.ten_dong_sp || 'Tinh dầu tràm năm gân'}
            </h3>
            <p className="text-[#4F6357] text-[13px] italic font-serif">Melaleuca quinquenervia</p>
          </div>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <HoSo
              bieuTuong={<Fingerprint size={13} />}
              nhan="Mã lô"
              giaTri={lo.ma_lo}
              mono
            />
            <HoSo
              bieuTuong={<CalendarDays size={13} />}
              nhan="Ngày chưng cất"
              giaTri={ngayVietNam(lo.ngay_chung_cat)}
              mono
            />
            <HoSo
              bieuTuong={<Droplet size={13} />}
              nhan="Hàm lượng 1,8-cineole"
              giaTri={
                lo.ham_luong_cineole === null || lo.ham_luong_cineole === undefined
                  ? null
                  : `${Number(lo.ham_luong_cineole).toFixed(2)} %`
              }
              mono
              noiBat
            />
            <HoSo
              bieuTuong={<FileText size={13} />}
              nhan="Số phiếu kiểm nghiệm"
              giaTri={lo.so_phieu_coa}
              mono
            />
            <div className="col-span-2">
              <HoSo
                bieuTuong={<FlaskConical size={13} />}
                nhan="Đơn vị kiểm nghiệm"
                giaTri={lo.don_vi_kiem_nghiem}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hành động */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 relative z-10 pb-3">
        {daKichHoat ? (
          <>
            <button
              onClick={onBaoCao}
              className="w-full bg-gradient-to-r from-[#C25E00] to-[#9A4600] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(154,70,0,0.22)] hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 text-[13px] sm:text-sm uppercase tracking-wide"
            >
              <AlertTriangle size={17} strokeWidth={2.5} />
              Gửi thông tin cho cơ sở sản xuất
            </button>
            <button
              onClick={onKichHoat}
              className="w-full bg-white border border-amber-900/15 font-semibold py-3.5 px-6 rounded-2xl text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <ScanLine size={16} className="text-amber-800" />
              Tôi đã cào tem — nhập mã để kiểm tra tiếp
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onKichHoat}
              className="w-full bg-gradient-to-r from-[#9E7B3B] to-[#7E5C20] text-white font-semibold py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(142,105,40,0.22)] hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 text-[13px] sm:text-sm uppercase tracking-wide"
            >
              Tôi đã mua — cào tem và kích hoạt
              <ArrowRight size={17} className="opacity-85" />
            </button>
            <button
              onClick={() => onXemHanhTrinh?.({ lo, serial: duLieu.serial })}
              className="w-full bg-white/80 border border-emerald-900/12 font-medium py-3.5 px-6 rounded-2xl text-sm hover:bg-white transition-colors flex items-center justify-center"
            >
              Xem hành trình của lô
            </button>
          </>
        )}
        <button
          onClick={onQuetLai}
          className="mt-1 text-center text-[#4F6357] hover:opacity-70 text-[11px] sm:text-xs font-medium underline underline-offset-4 transition-opacity"
        >
          Quét con tem khác
        </button>
      </div>
    </div>
  );
}

/** Một dòng hồ sơ. Thiếu dữ liệu thì nói thiếu, không bịa. */
function HoSo({ bieuTuong, nhan, giaTri, mono = false, noiBat = false }) {
  const co = giaTri !== null && giaTri !== undefined && giaTri !== '';
  return (
    <div>
      <p className="text-[10px] sm:text-[11px] font-semibold text-[#4F6357] uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <span className="opacity-60">{bieuTuong}</span>
        {nhan}
      </p>
      <p
        className={`${mono ? 'font-mono' : ''} ${
          noiBat ? 'text-[#135E3E] font-bold text-base' : 'font-medium text-sm'
        } ${co ? '' : 'text-[#8F9E96] italic font-normal'}`}
      >
        {co ? giaTri : 'cơ sở chưa khai'}
      </p>
    </div>
  );
}
