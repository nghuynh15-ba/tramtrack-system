import React, { useRef, useState } from 'react';
import {
  Lock, Loader2, ArrowLeft, Eye, EyeOff, AlertCircle, HelpCircle, ShieldQuestion,
  RefreshCcw,
} from 'lucide-react';
import { kichHoatTang2, traCuuTang1, laLoiKetNoi } from '../../../services/api';
import {
  chuanHoaMa, maDungDinhDang, dinhDangMa, kyTuLa, DO_DAI_MA,
} from '../../../services/ma';
import { LockedScreen, RecalledScreen } from '../../../components/common/StateScreens';
import VerificationResultValid from '../../scan/VerificationResultValid';
import KhuVucTuChon from '../../../components/KhuVucTuChon';
import VerificationResultWarning from '../../scan/VerificationResultWarning';
import VerificationResultInvalid from '../../scan/VerificationResultInvalid';

/**
 * TẦNG 2 — kích hoạt sau khi cào lớp phủ.
 *
 * Màn này cố ý KHÔNG đổi đường dẫn khi có kết quả. Kết quả được vẽ ngay tại
 * /a/:serial và chỉ nằm trong bộ nhớ.
 *
 * Lý do: nếu điều hướng sang /result-valid rồi người dùng bấm tải lại trang,
 * màn hình sẽ vẽ lại "HỢP LỆ" từ một đường dẫn trống rỗng — tức là giao diện
 * tự khẳng định một điều mà máy chủ không còn khẳng định nữa (lần gọi thứ hai
 * sẽ là CẢNH BÁO vì tem đã kích hoạt). Giữ kết quả trong bộ nhớ thì tải lại
 * trang là về đúng ô nhập mã, và lần gửi sau nhận đúng câu trả lời thật.
 */
export default function ActivateTier2Screen({
  serial,
  onXemHanhTrinh,
  onHuongDanAnToan,
  onBaoCao,
  onQuetLai,
  onDong,
}) {
  const [ma, setMa] = useState('');
  const [hienMa, setHienMa] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [ketQua, setKetQua] = useState(null);
  const [loiNhap, setLoiNhap] = useState(null);

  /**
   * Trạng thái "không rõ": đã gửi yêu cầu kích hoạt nhưng mất kết nối trước
   * khi nhận được câu trả lời.
   *
   * Đây là trường hợp nguy hiểm nhất của cả luồng và rất dễ bỏ sót. Kích hoạt
   * là việc KHÔNG HOÀN LẠI ĐƯỢC: rất có thể máy chủ đã ghi xong rồi mới mất
   * mạng. Nếu để người dùng bấm gửi lại một cách mù quáng thì lần hai sẽ nhận
   * về CẢNH BÁO — một báo động giả do chính lỗi mạng tạo ra, trên một chai
   * hoàn toàn thật.
   *
   * Nên ở đây không có nút "gửi lại". Có nút "kiểm tra lại trạng thái": nó gọi
   * Tầng 1 và suy luận bằng mốc thời gian — nếu tem vừa được kích hoạt trong
   * vòng vài phút thì đó chính là yêu cầu của người dùng này đã tới đích.
   */
  const [khongRo, setKhongRo] = useState(null);   // { thongDiep, luc }
  const [dangDoiChieu, setDangDoiChieu] = useState(false);
  const oNhap = useRef(null);

  const maSach = chuanHoaMa(ma);
  const duKyTu = maSach.length === DO_DAI_MA;
  const kyTuKhongCo = kyTuLa(ma);

  async function gui() {
    const la = kyTuLa(ma);
    if (la.length) {
      setLoiNhap(
        `Tem không in ký tự ${la.join(', ')}. Năm ký tự 0 1 O I L bị bỏ khỏi bảng mã để khỏi nhầm — hãy đọc lại dưới ánh sáng rõ.`
      );
      return;
    }
    if (!maDungDinhDang(maSach)) {
      setLoiNhap(`Mã phải đủ ${DO_DAI_MA} ký tự. Bạn đang nhập ${maSach.length}.`);
      return;
    }

    setLoiNhap(null);
    setDangGui(true);
    const luc = Date.now();
    try {
      const kq = await kichHoatTang2(serial, maSach);
      setKetQua(kq);
      setMa('');            // không giữ lại mã bí mật trong bộ nhớ giao diện
    } catch (e) {
      setKhongRo({
        luc,
        thongDiep: laLoiKetNoi(e)
          ? e.message
          : 'Máy chủ gặp sự cố trong lúc xử lý yêu cầu.',
      });
      setMa('');
    } finally {
      setDangGui(false);
    }
  }

  /** Dùng Tầng 1 để biết yêu cầu lúc trước đã tới đích hay chưa. */
  async function doiChieuTrangThai() {
    setDangDoiChieu(true);
    try {
      const t1 = await traCuuTang1(serial);

      if (t1.ket_qua === 'DA_THU_HOI') {
        setKetQua(t1);
        setKhongRo(null);
        return;
      }
      if (t1.ket_qua !== 'TIM_THAY') {
        setKetQua(t1);
        setKhongRo(null);
        return;
      }

      if (!t1.da_kich_hoat) {
        // Yêu cầu chưa từng tới máy chủ. Cho nhập lại là an toàn.
        setKhongRo(null);
        setLoiNhap('Yêu cầu lúc trước chưa tới máy chủ. Hãy nhập lại mã.');
        oNhap.current?.focus();
        return;
      }

      // Đã kích hoạt. Mốc thời gian quyết định đây là ai.
      const cachBaoLau = Date.now() - new Date(t1.kich_hoat_luc).getTime();
      const CUA_SO_MS = 5 * 60 * 1000;

      if (cachBaoLau >= 0 && cachBaoLau < CUA_SO_MS) {
        // Vừa kích hoạt xong, trong cửa sổ chỉ có thể là yêu cầu của chính
        // người đang đứng đây. Coi như HỢP LỆ.
        setKetQua({
          ket_qua: 'HOP_LE',
          serial: t1.serial,
          kich_hoat_luc: t1.kich_hoat_luc,
          lo: t1.lo,
          xac_nhan_lai: true,
        });
      } else {
        // Kích hoạt từ lâu trước đó — đây là tình huống CẢNH BÁO thật.
        setKetQua({
          ket_qua: 'CANH_BAO',
          serial: t1.serial,
          bang_chung: {
            kich_hoat_dau_luc: t1.kich_hoat_luc,
            kich_hoat_dau_tinh: null,
            hien_vi_tri: false,
          },
          lo: t1.lo,
        });
      }
      setKhongRo(null);
    } catch {
      setKhongRo((k) => ({
        ...k,
        thongDiep: 'Vẫn chưa nối được tới máy chủ. Hãy thử lại khi có mạng.',
      }));
    } finally {
      setDangDoiChieu(false);
    }
  }

  /* ---------------- vẽ kết quả khi đã có ---------------- */

  if (ketQua) {
    if (ketQua.ket_qua === 'HOP_LE') {
      return (
        <VerificationResultValid
          batchData={{
            serial: ketQua.serial,
            batchId: ketQua.lo?.ma_lo,
            cineoleRate:
              ketQua.lo?.ham_luong_cineole === null || ketQua.lo?.ham_luong_cineole === undefined
                ? null
                : `${Number(ketQua.lo.ham_luong_cineole).toFixed(2)} %`,
            distillationDate: ketQua.lo?.ngay_chung_cat,
            activatedAt: ketQua.kich_hoat_luc,
            coaId: ketQua.lo?.so_phieu_coa,
            lab: ketQua.lo?.don_vi_kiem_nghiem,
            productName: ketQua.lo?.ten_dong_sp,
          }}
          xacNhanLai={Boolean(ketQua.xac_nhan_lai)}
          khuVuc={<KhuVucTuChon serial={ketQua.serial} dau={ketQua.khu_vuc_dau} />}
          onViewJourney={() => onXemHanhTrinh?.({ lo: ketQua.lo, serial: ketQua.serial })}
          onViewSafetyGuide={onHuongDanAnToan}
        />
      );
    }

    if (ketQua.ket_qua === 'CANH_BAO') {
      return (
        <VerificationResultWarning
          serialNumber={ketQua.serial}
          firstActivatedAt={ketQua.bang_chung?.kich_hoat_dau_luc}
          firstLocation={ketQua.bang_chung?.kich_hoat_dau_tinh}
          hienViTri={Boolean(ketQua.bang_chung?.hien_vi_tri)}
          onReportFake={onBaoCao}
          onViewBatchInfo={() => onXemHanhTrinh?.({ lo: ketQua.lo, serial: ketQua.serial })}
        />
      );
    }

    if (ketQua.ket_qua === 'BI_KHOA') {
      return (
        <LockedScreen serial={ketQua.serial} moKhoaLuc={ketQua.mo_khoa_luc} onDong={onDong} />
      );
    }

    if (ketQua.ket_qua === 'DA_THU_HOI') {
      return (
        <RecalledScreen
          serial={ketQua.serial}
          lyDo={ketQua.thu_hoi?.ly_do}
          thoiDiem={ketQua.thu_hoi?.thoi_diem}
          lo={ketQua.lo}
          onBaoCao={onBaoCao}
          onDong={onDong}
        />
      );
    }

    // KHONG_XAC_THUC_DUOC — máy chủ cố ý không nói là serial sai hay mã sai.
    return (
      <VerificationResultInvalid
        invalidCode={ketQua.serial || serial}
        nguonGoc="tang-2"
        onRetry={() => setKetQua(null)}
        onReportFake={onBaoCao}
      />
    );
  }

  /* ---------------- màn "không rõ kết quả" ---------------- */

  if (khongRo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7F7F6] via-[#F1F1EF] to-[#E9E9E6] text-[#1A1A18] flex flex-col justify-between py-8 px-5 sm:px-6 font-sans">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto text-center">
          <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-white border border-[#1A1A18]/10 shadow-sm mb-6">
            <ShieldQuestion size={36} className="text-[#6B6B66]" strokeWidth={2} />
          </div>

          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-base sm:text-lg mb-2">
            Chưa rõ kết quả
          </h1>
          <p className="text-[#55554F] text-sm leading-relaxed mb-1">{khongRo.thongDiep}</p>
          <p className="text-[#55554F] text-[13px] leading-relaxed mb-6">
            Yêu cầu kích hoạt có thể đã tới máy chủ, cũng có thể chưa. Đừng gửi lại ngay —
            hãy để hệ thống đối chiếu trước, để không tạo ra một cảnh báo giả trên chính
            chai của bạn.
          </p>

          <div className="font-mono text-xs text-[#55554F] bg-white border border-[#1A1A18]/10 rounded-xl px-4 py-2.5">
            Serial: <span className="font-bold text-[#1A1A18]">{serial}</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-2">
          <button
            onClick={doiChieuTrangThai}
            disabled={dangDoiChieu}
            className="w-full bg-[#1A1A18] text-white font-semibold py-4 rounded-2xl text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#2C2C28] transition-colors"
          >
            {dangDoiChieu ? <Loader2 size={17} className="animate-spin" /> : <RefreshCcw size={17} />}
            {dangDoiChieu ? 'Đang đối chiếu' : 'Kiểm tra lại trạng thái'}
          </button>
          <button
            onClick={onDong}
            className="w-full bg-white border border-[#1A1A18]/15 font-medium py-3.5 rounded-2xl text-sm hover:bg-[#F1F1EF] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- ô nhập mã ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E1A14] via-[#121F18] to-[#0A1410] text-white flex flex-col justify-between py-8 px-5 sm:px-6 font-sans relative overflow-x-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#DFBA73 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto relative z-10">
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={onDong}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition-colors"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#DFBA73]/15 border border-[#DFBA73]/25 font-mono text-[10px] font-bold tracking-wider text-[#DFBA73]">
            <Lock size={11} />
            TẦNG 2 · ĐÃ CÀO TEM
          </div>
          <div className="w-9" />
        </div>

        <div className="w-full text-center mb-7">
          <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl mb-2.5">
            Nhập mã dưới lớp cào
          </h1>
          <p className="text-white/60 text-[13.5px] leading-relaxed">
            12 ký tự in dưới dải phủ bạc. Mã này chỉ dùng được{' '}
            <span className="text-[#DFBA73] font-semibold">một lần duy nhất</span>.
          </p>
        </div>

        <div className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/45 font-bold">
            Serial công khai
          </span>
          <span className="font-mono font-bold text-sm tracking-wider text-white">{serial}</span>
        </div>

        <div className="w-full mb-2">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
            Mã bí mật
          </label>
          <div className="relative">
            <input
              ref={oNhap}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
              type={hienMa ? 'text' : 'password'}
              placeholder="XXXX-XXXX-XXXX"
              value={hienMa ? dinhDangMa(maSach) : maSach}
              onChange={(e) => {
                setMa(chuanHoaMa(e.target.value).slice(0, DO_DAI_MA));
                setLoiNhap(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && duKyTu && !dangGui) gui();
              }}
              className={`w-full bg-black/35 border rounded-2xl px-4 py-4 font-mono text-lg tracking-[0.18em] text-white placeholder-white/25 outline-none transition-colors pr-12 ${
                loiNhap
                  ? 'border-rose-400/60 focus:border-rose-400'
                  : 'border-white/15 focus:border-[#DFBA73]'
              }`}
            />
            <button
              type="button"
              onClick={() => setHienMa(!hienMa)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
            >
              {hienMa ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1">
            <span className="font-mono text-[11px] text-white/35">
              {maSach.length}/{DO_DAI_MA}
            </span>
            {kyTuKhongCo.length > 0 && (
              <span className="font-mono text-[11px] text-amber-300 font-semibold">
                tem không in {kyTuKhongCo.join(' ')}
              </span>
            )}
          </div>
        </div>

        {loiNhap && (
          <div className="w-full bg-rose-500/12 border border-rose-400/25 rounded-2xl p-3.5 flex items-start gap-2.5 mb-4">
            <AlertCircle size={17} className="text-rose-300 shrink-0 mt-0.5" />
            <p className="text-rose-100 text-[13px] leading-relaxed">{loiNhap}</p>
          </div>
        )}

        <div className="w-full bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-start gap-3">
          <HelpCircle size={17} className="text-[#DFBA73] shrink-0 mt-0.5" />
          <p className="text-white/55 text-[12.5px] leading-relaxed">
            Bảng mã bỏ năm ký tự <span className="font-mono text-white/80">0 1 O I L</span> để
            không nhầm lẫn. Nếu thấy giống số 0 thì đó là chữ O, thấy giống số 1 thì đó là
            chữ J hoặc chữ T.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col gap-3 relative z-10 pt-7 pb-2">
        <button
          onClick={gui}
          disabled={!duKyTu || dangGui}
          className="w-full bg-gradient-to-r from-[#DFBA73] to-[#B8923F] text-[#0A1410] font-bold py-4 rounded-2xl text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed hover:brightness-105 transition-all"
        >
          {dangGui ? <Loader2 size={18} className="animate-spin" /> : <Lock size={17} />}
          {dangGui ? 'Đang xác thực' : 'Xác thực và kích hoạt'}
        </button>
        <button
          onClick={onQuetLai}
          className="w-full text-white/45 hover:text-white/75 text-[12px] font-medium underline underline-offset-4 py-2 transition-colors"
        >
          Quét lại mã QR
        </button>
      </div>
    </div>
  );
}
