import React, { useState } from 'react';
import {
  ArrowLeft, ShieldAlert, Check, ShieldCheck, AlertTriangle, Loader2, AlertCircle, Info, Camera, X,
} from 'lucide-react';
import { guiBaoCao, laLoiKetNoi } from '../../services/api';
import { gioVietNam } from '../../services/ma';
import { nenAnh } from '../../services/anh';

/**
 * Người tiêu dùng gửi báo cáo nghi ngờ — POST /api/v1/bao-cao.
 *
 * Bản trước chỉ giả lập: handleSubmit đặt hẹn 600 ms rồi hiện mã sự cố
 * CASE-2026-9812 viết cứng trong tệp. Bây giờ mã báo cáo là số thật do máy chủ
 * cấp, và người dùng có thể đọc cho cơ sở sản xuất để tra lại.
 *
 * Ba thứ đã bỏ vì chúng bịa ra bằng chứng không có thật:
 *   - Nút "Lấy toạ độ hiện tại (GPS)" chỉ gán sẵn một địa chỉ ở Tây Ninh.
 *   - Hai ô tải ảnh chỉ gán đường dẫn tới một ảnh mẫu trong thư mục assets.
 *     Nay thay bằng ảnh thật: chụp/chọn, nén ở trình duyệt, gửi kèm báo cáo.
 *   - Dòng cuối trang nói dữ liệu truyền tới "hệ thống giám sát thị trường phi
 *     tập trung TramCheck" — sai tên dự án và sai cả kiến trúc, hệ thống này
 *     không phi tập trung.
 */

const DAU_HIEU = [
  { id: 'activated', label: 'Hệ thống báo mã đã kích hoạt trước đó', lyDo: 'MA_DA_KICH_HOAT' },
  { id: 'not_found', label: 'Mã quét không có trên hệ thống', lyDo: 'MA_KHONG_TON_TAI' },
  { id: 'scratched', label: 'Tem đã bị cào lớp bạc trước khi mua', lyDo: 'TEM_BI_RACH' },
  { id: 'torn', label: 'Tem bị rách, bong hoặc có dấu dán lại', lyDo: 'TEM_BI_RACH' },
  { id: 'smell', label: 'Dầu có mùi cồn nồng hoặc gây rát da', lyDo: 'NGHI_HANG_GIA' },
  { id: 'package', label: 'Bao bì nhoè mực, chai bị cạy nắp', lyDo: 'NGHI_HANG_GIA' },
];

/** Máy chủ nhận một lý do. Chọn cái cụ thể nhất, phần còn lại ghi vào nội dung. */
const TOI_DA_ANH = 2;
const KY_TU_MOI_ANH = 150000;

const UU_TIEN = ['MA_DA_KICH_HOAT', 'MA_KHONG_TON_TAI', 'TEM_BI_RACH', 'NGHI_HANG_GIA'];

export default function ConsumerFraudReportScreen({ initialSerial = '', onClose }) {
  const [chon, setChon] = useState([]);
  const [noiMua, setNoiMua] = useState('');
  const [moTa, setMoTa] = useState('');
  const [lienHe, setLienHe] = useState('');
  const [anh, setAnh] = useState([]);
  const [loiAnh, setLoiAnh] = useState(null);
  const [dangNen, setDangNen] = useState(false);

  async function chonAnh(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setLoiAnh(null);
    setDangNen(true);
    try {
      const them = [];
      for (const f of files.slice(0, TOI_DA_ANH - anh.length)) {
        them.push(await nenAnh(f, KY_TU_MOI_ANH));
      }
      setAnh((truoc) => [...truoc, ...them].slice(0, TOI_DA_ANH));
      if (files.length > TOI_DA_ANH - anh.length) setLoiAnh(`Chỉ đính kèm được tối đa ${TOI_DA_ANH} ảnh.`);
    } catch (err) {
      setLoiAnh(err.message || 'Không đọc được ảnh');
    } finally {
      setDangNen(false);
    }
  }

  const [dangGui, setDangGui] = useState(false);
  const [daGui, setDaGui] = useState(null);     // { ma_bao_cao, tao_luc }
  const [loi, setLoi] = useState(null);

  const doi = (id) =>
    setChon((truoc) => (truoc.includes(id) ? truoc.filter((i) => i !== id) : [...truoc, id]));

  const duGui = chon.length > 0 || noiMua.trim() || moTa.trim();

  async function gui(e) {
    e.preventDefault();
    if (!duGui || dangGui) return;

    const daChon = DAU_HIEU.filter((d) => chon.includes(d.id));
    const lyDo = UU_TIEN.find((l) => daChon.some((d) => d.lyDo === l)) || 'KHAC';

    const noiDung = [
      daChon.length ? `Dấu hiệu người gửi chọn: ${daChon.map((d) => d.label).join('; ')}.` : '',
      moTa.trim(),
    ].filter(Boolean).join('\n');

    setLoi(null);
    setDangGui(true);
    try {
      const kq = await guiBaoCao({
        serial: initialSerial,
        ly_do: lyDo,
        noi_dung: noiDung || null,
        noi_mua: noiMua.trim() || null,
        lien_he: lienHe.trim() || null,
        anh_bang_chung: anh.length ? anh : undefined,
      });
      setDaGui(kq);
    } catch (err) {
      setLoi(
        laLoiKetNoi(err)
          ? `${err.message}. Báo cáo chưa được gửi — hãy thử lại khi có mạng.`
          : err.message || 'Không gửi được báo cáo.'
      );
    } finally {
      setDangGui(false);
    }
  }

  /* ---------------- đã gửi ---------------- */

  if (daGui) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F6F8F5] flex flex-col items-center justify-center p-6 text-center font-sans overflow-y-auto">
        <div className="relative mb-6 flex items-center justify-center w-[96px] h-[96px] rounded-full bg-emerald-50 border-2 border-[#8C6928]/40 shadow-[0_0_40px_rgba(19,94,62,0.15)] animate-[scale-in_0.5s_ease-out]">
          <ShieldCheck size={48} strokeWidth={1.5} className="text-[#135E3E]" />
        </div>

        <h2 className="font-serif italic text-2xl sm:text-3xl text-[#0A1A12] mb-4">
          Cơ sở sản xuất đã nhận báo cáo
        </h2>

        <div className="font-mono text-[#8C6928] text-sm font-bold bg-[#8C6928]/10 px-5 py-3 rounded-xl border border-[#8C6928]/20 mb-2">
          MÃ BÁO CÁO: #{daGui.ma_bao_cao}
        </div>
        {gioVietNam(daGui.tao_luc) && (
          <div className="font-mono text-[11px] text-[#4F6357] mb-6">
            Tiếp nhận lúc {gioVietNam(daGui.tao_luc)}
          </div>
        )}

        <p className="text-[#4F6357] text-sm leading-relaxed max-w-md mx-auto mb-3 font-medium">
          Hãy ghi lại mã báo cáo này. Khi liên hệ cơ sở sản xuất, đọc mã đó để họ tra đúng
          phản ánh của bạn.
        </p>
        <p className="text-[#4F6357] text-[13px] leading-relaxed max-w-md mx-auto mb-8">
          Giữ lại chai, con tem và hoá đơn. Nếu cơ sở cần ảnh, họ sẽ liên hệ theo số bạn để lại.
        </p>

        <button
          onClick={onClose}
          className="w-full max-w-xs bg-[#135E3E] hover:bg-emerald-900 text-white font-semibold py-4 px-6 rounded-2xl shadow-md transition-colors text-sm uppercase tracking-wide"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  /* ---------------- biểu mẫu ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F6F8F5] to-[#EFF3EC] text-[#0A1A12] py-8 lg:py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-2xl mx-auto relative z-10">

        <div className="flex flex-col items-start mb-8">
          <button
            onClick={onClose}
            className="mb-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-emerald-900/10 shadow-sm hover:scale-105 transition-transform"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>

          <h1 className="font-['Be_Vietnam_Pro'] font-bold uppercase tracking-wider text-xl sm:text-2xl text-[#991B1B] mb-1 flex items-center gap-2">
            <AlertTriangle size={24} strokeWidth={2.5} className="mt-0.5" />
            GỬI THÔNG TIN CHO CƠ SỞ SẢN XUẤT
          </h1>
          <h2 className="font-serif italic text-[#8C6928] text-lg sm:text-xl mb-4">
            Không cần đăng nhập, không cần khai tên
          </h2>

          {initialSerial && (
            <div className="w-full bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-2 font-semibold">
              <span className="font-mono text-[11px] uppercase tracking-wide">SERIAL ĐANG PHẢN ÁNH</span>
              <span className="font-mono text-sm text-[#991B1B]">{initialSerial}</span>
            </div>
          )}
        </div>

        <form onSubmit={gui} className="space-y-6 pb-10">

          <section className="bg-white/95 backdrop-blur-xl border border-amber-900/15 rounded-3xl p-5 sm:p-7 shadow-[0_15px_40px_rgba(180,83,9,0.06)]">
            <div className="font-mono text-[11px] sm:text-xs font-bold text-[#135E3E] uppercase tracking-widest mb-4">
              01 // DẤU HIỆU BẠN GẶP PHẢI
            </div>
            <div className="flex flex-wrap gap-2.5">
              {DAU_HIEU.map((d) => {
                const daChon = chon.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => doi(d.id)}
                    className={`px-4 py-2.5 rounded-full text-[13px] sm:text-sm transition-all duration-300 border text-left flex items-center gap-2 ${
                      daChon
                        ? 'bg-emerald-900/10 border-[#135E3E] text-[#135E3E] font-semibold'
                        : 'bg-white border-emerald-900/15 text-[#4F6357] hover:border-[#135E3E]/50'
                    }`}
                  >
                    {daChon && <Check size={14} strokeWidth={3} className="shrink-0" />}
                    {d.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white/95 backdrop-blur-xl border border-amber-900/15 rounded-3xl p-5 sm:p-7 shadow-[0_15px_40px_rgba(180,83,9,0.06)]">
            <div className="font-mono text-[11px] sm:text-xs font-bold text-[#135E3E] uppercase tracking-widest mb-4">
              02 // BẠN MUA Ở ĐÂU
            </div>
            <input
              type="text"
              value={noiMua}
              onChange={(e) => setNoiMua(e.target.value)}
              placeholder="Tên tiệm, chợ, sàn thương mại điện tử hoặc địa chỉ"
              className="w-full bg-transparent border-b-2 border-emerald-900/20 focus:border-[#135E3E] py-3 text-sm sm:text-base outline-none transition-colors placeholder:text-[#4F6357]/60"
            />
            <p className="text-[12px] text-[#4F6357] mt-3 leading-relaxed">
              Đây là thông tin hữu ích nhất với cơ sở sản xuất: nó cho họ biết con tem đã đi
              về đâu so với sổ xuất hàng.
            </p>
          </section>

          <section className="bg-white/95 backdrop-blur-xl border border-amber-900/15 rounded-3xl p-5 sm:p-7 shadow-[0_15px_40px_rgba(180,83,9,0.06)]">
            <div className="font-mono text-[11px] sm:text-xs font-bold text-[#135E3E] uppercase tracking-widest mb-4">
              03 // MÔ TẢ THÊM (TÙY CHỌN)
            </div>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value.slice(0, 1500))}
              rows={4}
              placeholder="Ví dụ: tem đã bị cào sẵn khi người bán đưa chai cho tôi, lớp bạc chỉ còn một nửa."
              className="w-full bg-[#F6F8F5] border border-emerald-900/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#135E3E] transition-colors resize-none leading-relaxed"
            />
            <div className="mt-5">
              <div className="text-[13px] font-semibold text-[#0A1A12] mb-2">
                Ảnh bằng chứng (tùy chọn, tối đa {TOI_DA_ANH} ảnh)
              </div>
              <div className="flex flex-wrap gap-3">
                {anh.map((a, i) => (
                  <div key={i} className="relative">
                    <img src={a} alt={`Ảnh bằng chứng ${i + 1}`} className="h-24 w-24 object-cover rounded-xl border border-emerald-900/15" />
                    <button
                      type="button"
                      onClick={() => setAnh((t) => t.filter((_, k) => k !== i))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow"
                      aria-label="Bỏ ảnh này"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {anh.length < TOI_DA_ANH && (
                  <label className={`h-24 w-24 rounded-xl border-2 border-dashed border-emerald-900/25 flex flex-col items-center justify-center gap-1 text-[#4F6357] text-[11px] cursor-pointer hover:border-[#135E3E] hover:bg-emerald-50/40 ${dangNen ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" accept="image/*" multiple onChange={chonAnh} className="hidden" />
                    {dangNen ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    {dangNen ? 'Đang xử lý' : 'Chụp / chọn ảnh'}
                  </label>
                )}
              </div>
              {loiAnh && <p role="alert" className="text-rose-700 text-[12.5px] mt-2">{loiAnh}</p>}
              <div className="flex items-start gap-2.5 mt-3 bg-sky-500/8 border border-sky-600/15 rounded-xl p-3.5">
                <Info size={16} className="text-sky-700 shrink-0 mt-0.5" />
                <p className="text-sky-950 text-[12.5px] leading-relaxed">
                  Nên chụp rõ con tem (cả mặt trước lẫn lớp bạc) và nhãn chai. Ảnh được thu nhỏ
                  trên máy bạn trước khi gửi và chỉ cơ sở sản xuất xem được.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/95 backdrop-blur-xl border border-amber-900/15 rounded-3xl p-5 sm:p-7 shadow-[0_15px_40px_rgba(180,83,9,0.06)]">
            <div className="font-mono text-[11px] sm:text-xs font-bold text-[#8C6928] uppercase tracking-widest mb-4">
              04 // LIÊN HỆ (TÙY CHỌN)
            </div>
            <input
              type="text"
              inputMode="tel"
              value={lienHe}
              onChange={(e) => setLienHe(e.target.value)}
              placeholder="Số điện thoại hoặc Zalo, nếu bạn muốn nhận kết quả xác minh"
              className="w-full bg-transparent border-b-2 border-amber-900/20 focus:border-[#8C6928] py-3 text-sm sm:text-base outline-none transition-colors placeholder:text-[#4F6357]/60"
            />
            <p className="text-[12px] text-[#4F6357] mt-3 leading-relaxed">
              Để trống vẫn gửi được. Hệ thống không lưu địa chỉ mạng của bạn.
            </p>
          </section>

          {loi && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={19} className="text-rose-600 shrink-0 mt-0.5" />
              <p className="text-rose-900 text-[13px] leading-relaxed">{loi}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={!duGui || dangGui}
              className="w-full bg-gradient-to-r from-[#991B1B] to-[#7F1D1D] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_30px_rgba(153,27,27,0.25)] hover:scale-[1.01] disabled:opacity-45 disabled:hover:scale-100 transition-all text-sm sm:text-base uppercase tracking-wide flex items-center justify-center gap-2"
            >
              {dangGui ? <Loader2 size={19} className="animate-spin" /> : <ShieldAlert size={19} />}
              {dangGui ? 'Đang gửi' : 'Gửi báo cáo'}
            </button>
            <p className="text-center text-[11px] sm:text-xs text-[#4F6357] px-4 font-medium leading-relaxed">
              Báo cáo đi trực tiếp tới cơ sở sản xuất đã phát hành con tem. Hệ thống không ghi
              địa chỉ mạng của người gửi — bảng sự kiện quét không có cột IP.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
