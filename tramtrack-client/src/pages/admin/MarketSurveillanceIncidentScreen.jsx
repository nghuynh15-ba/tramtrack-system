import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw, ImageIcon, AlertTriangle, X } from 'lucide-react';
import {
  dsBaoCao, anhBaoCao, xuLyBaoCao, laLoiHetPhien, laLoiKetNoi, LoiKhongDuQuyen,
} from '../../services/api';
import { gioVietNam } from '../../services/ma';

/**
 * Xử lý báo cáo của người tiêu dùng — GET /qt/bao-cao, PATCH /qt/bao-cao/:id.
 *
 * Bản trước là một bảng sự cố vẽ sẵn với bản đồ, mức độ nghiêm trọng và nút
 * "khóa lô" không gọi gì. Bản này chỉ hiện báo cáo thật và cho đổi trạng thái.
 *
 * Báo cáo mà `serial_tim_thay` là null nghĩa là người gửi khai một serial
 * KHÔNG có trong hệ thống của cơ sở này. Đó là loại đáng chú ý nhất: có thể là
 * tem làm giả với serial bịa, hoặc người gửi gõ nhầm. Màn hình đánh dấu riêng.
 */

const LY_DO = {
  MA_KHONG_TON_TAI: 'Mã không có trên hệ thống',
  MA_DA_KICH_HOAT: 'Báo mã đã kích hoạt trước đó',
  TEM_BI_RACH: 'Tem rách / đã cào / dán lại',
  NGHI_HANG_GIA: 'Nghi hàng giả',
  KHAC: 'Khác',
};

const TRANG_THAI = {
  MOI: { ten: 'Mới', mau: 'bg-rose-100 text-rose-800' },
  DANG_XU_LY: { ten: 'Đang xử lý', mau: 'bg-amber-100 text-amber-800' },
  DA_XU_LY: { ten: 'Đã xử lý', mau: 'bg-emerald-100 text-emerald-800' },
  BO_QUA: { ten: 'Bỏ qua', mau: 'bg-slate-200 text-slate-700' },
};

const LOC = [['', 'Tất cả'], ['MOI', 'Mới'], ['DANG_XU_LY', 'Đang xử lý'], ['DA_XU_LY', 'Đã xử lý'], ['BO_QUA', 'Bỏ qua']];

export default function MarketSurveillanceIncidentScreen({ onHetPhien }) {
  const [loc, setLoc] = useState('');
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState(null);
  const [dang, setDang] = useState(true);
  const [anhMo, setAnhMo] = useState(null);       // { id, anh: [] } | { id, dang: true } | { id, loi }
  const [phongTo, setPhongTo] = useState(null);

  const xuLyLoi = useCallback((e, macDinh) => {
    if (laLoiHetPhien(e)) { if (onHetPhien) onHetPhien(); return null; }
    if (e instanceof LoiKhongDuQuyen) return 'Vai trò của bạn không có quyền thực hiện việc này.';
    if (laLoiKetNoi(e)) return 'Chưa nối được máy chủ. Thử lại sau vài giây.';
    return e.message || macDinh;
  }, [onHetPhien]);

  const tai = useCallback(async () => {
    setDang(true);
    setLoi(null);
    try {
      const kq = await dsBaoCao(loc || undefined);
      setDs(kq.bao_cao);
    } catch (e) {
      const m = xuLyLoi(e, 'Không đọc được danh sách báo cáo');
      if (m) setLoi(m);
    } finally {
      setDang(false);
    }
  }, [loc, xuLyLoi]);

  useEffect(() => { tai(); }, [tai]);

  // Đổi trạng thái: cập nhật ngay trên màn hình, máy chủ từ chối thì trả về như cũ.
  async function doiTrangThai(bc, moi) {
    if (bc.trang_thai === moi) return;
    const cu = bc.trang_thai;
    setLoi(null);
    setDs((t) => t.map((x) => (x.id === bc.id ? { ...x, trang_thai: moi } : x)));
    try {
      await xuLyBaoCao(bc.id, moi);
    } catch (e) {
      setDs((t) => t.map((x) => (x.id === bc.id ? { ...x, trang_thai: cu } : x)));
      const m = xuLyLoi(e, 'Không đổi được trạng thái');
      if (m) setLoi(`Chưa lưu được thay đổi cho báo cáo #${bc.id}. ${m}`);
    }
  }

  async function xemAnh(bc) {
    if (anhMo && anhMo.id === bc.id) { setAnhMo(null); return; }
    setAnhMo({ id: bc.id, dang: true });
    try {
      const kq = await anhBaoCao(bc.id);
      setAnhMo({ id: bc.id, anh: kq.anh.map((a) => a.anh) });
    } catch (e) {
      const m = xuLyLoi(e, 'Không tải được ảnh');
      setAnhMo(m ? { id: bc.id, loi: m } : null);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1000px] font-sans text-[#0A1A12]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider">Báo cáo người tiêu dùng</h1>
          <p className="text-sm text-[#4F6357] mt-1">Phản ánh gửi tới cơ sở của bạn. Hệ thống không kết luận chai nào là giả.</p>
        </div>
        <button onClick={tai} disabled={dang} className="flex items-center gap-2 bg-white border border-emerald-900/15 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50">
          {dang ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Tải lại
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {LOC.map(([v, ten]) => (
          <button
            key={v || 'tat-ca'}
            onClick={() => setLoc(v)}
            className={`px-4 py-2 rounded-full text-sm border ${loc === v ? 'bg-[#135E3E] text-white border-[#135E3E] font-semibold' : 'bg-white border-emerald-900/15 text-[#4F6357] hover:border-[#135E3E]/50'}`}
          >
            {ten}
          </button>
        ))}
      </div>

      {loi && <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm mb-6">{loi}</div>}
      {dang && !ds && <p className="text-sm text-[#4F6357]">Đang tải…</p>}
      {ds && ds.length === 0 && !dang && (
        <div className="bg-white border border-emerald-900/10 rounded-2xl p-8 text-center text-sm text-[#4F6357]">
          Không có báo cáo nào{loc ? ' ở trạng thái này' : ''}.
        </div>
      )}

      <div className="space-y-4">
        {(ds || []).map((bc) => {
          const tt = TRANG_THAI[bc.trang_thai] || TRANG_THAI.MOI;
          const khongCoTrongHeThong = bc.serial_tim_thay === null;
          return (
            <article key={bc.id} className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold">#{bc.id}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tt.mau}`}>{tt.ten}</span>
                </div>
                <span className="font-mono text-[11px] text-[#4F6357]">{gioVietNam(bc.tao_luc)}</span>
              </div>

              <p className="font-semibold mb-1">{LY_DO[bc.ly_do] || bc.ly_do}</p>
              <p className="font-mono text-sm mb-1">Serial khai: {bc.serial_khai_bao}{bc.ma_lo ? ` · lô ${bc.ma_lo}` : ''}</p>

              {khongCoTrongHeThong && (
                <p className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-[12px] font-semibold rounded-lg px-2.5 py-1 my-2">
                  <AlertTriangle size={13} /> Serial này không có trong hệ thống của cơ sở: có thể gõ nhầm, hoặc là tem làm giả.
                </p>
              )}

              {bc.noi_mua && <p className="text-sm mt-2"><span className="text-[#4F6357]">Mua ở:</span> {bc.noi_mua}</p>}
              {bc.noi_dung && <p className="text-sm mt-2 whitespace-pre-line leading-relaxed">{bc.noi_dung}</p>}
              <p className="text-[12px] text-[#4F6357] mt-2">
                Liên hệ: {bc.lien_he || 'không để lại'}{bc.tinh_uoc_tinh ? ` · Nơi gửi (ước tính): ${bc.tinh_uoc_tinh}` : ''}
              </p>

              {bc.so_anh > 0 && (
                <div className="mt-3">
                  <button onClick={() => xemAnh(bc)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#135E3E] border border-[#135E3E]/30 rounded-lg px-3 py-1.5 hover:bg-emerald-50">
                    <ImageIcon size={15} /> {anhMo && anhMo.id === bc.id ? 'Ẩn ảnh' : `Xem ${bc.so_anh} ảnh bằng chứng`}
                  </button>
                  {anhMo && anhMo.id === bc.id && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {anhMo.dang && <Loader2 size={20} className="animate-spin text-[#135E3E]" />}
                      {anhMo.loi && <p className="text-rose-700 text-sm">{anhMo.loi}</p>}
                      {(anhMo.anh || []).map((a, i) => (
                        <button key={i} onClick={() => setPhongTo(a)} className="block">
                          <img src={a} alt={`Ảnh bằng chứng ${i + 1}`} className="h-32 w-32 object-cover rounded-xl border border-emerald-900/15" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-900/10">
                {Object.entries(TRANG_THAI).map(([ma, v]) => (
                  <button
                    key={ma}
                    onClick={() => doiTrangThai(bc, ma)}
                    disabled={bc.trang_thai === ma}
                    className={`px-3 py-1.5 rounded-lg text-[13px] border ${bc.trang_thai === ma ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-emerald-900/20 hover:bg-emerald-50 font-semibold'}`}
                  >
                    {v.ten}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {phongTo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPhongTo(null)} role="dialog" aria-label="Ảnh phóng to">
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center" aria-label="Đóng"><X size={18} /></button>
          <img src={phongTo} alt="Ảnh bằng chứng" className="max-w-full max-h-full object-contain bg-white rounded-lg" />
        </div>
      )}
    </div>
  );
}
