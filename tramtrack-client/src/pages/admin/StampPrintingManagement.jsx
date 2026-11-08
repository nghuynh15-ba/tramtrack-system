import React, { useCallback, useEffect, useState } from 'react';
import {
  Printer, Search, RefreshCcw, CheckCircle2, AlertCircle, Loader2, ArrowLeft, MapPin,
} from 'lucide-react';
import { dsTem, LoiHetPhien, LoiKhongDuQuyen, laLoiKetNoi } from '../../services/api';
import { gioVietNam } from '../../services/ma';

/**
 * Danh sách tem của một lô — GET /api/v1/qt/lo/:maLo/tem
 *
 * Bản trước là một hàng đợi in giả: mảng `batches` viết cứng trong tệp với
 * trạng thái Ready / Printing / Completed và một cột phần trăm tiến độ, như
 * thể hệ thống đang điều khiển máy in. Không có điểm cuối nào như vậy, và cũng
 * không nên có — việc in do nhà in làm từ tệp CSV mà `sinh-ma` xuất ra.
 *
 * Thứ máy chủ thật sự trả về, và cũng là thứ cơ sở cần xem, là trạng thái từng
 * con tem trong lô: con nào đã có người kích hoạt, lúc nào, ở tỉnh nào. Điểm
 * cuối này KHÔNG BAO GIỜ trả về mã bí mật hay bản băm của nó.
 */
export default function StampPrintingManagement({ maLo, onBack, onHetPhien }) {
  const [tem, setTem]       = useState(null);   // null = đang nạp
  const [loi, setLoi]       = useState(null);
  const [tuKhoa, setTuKhoa] = useState('');
  const [dangNap, setDangNap] = useState(false);

  const nap = useCallback(async () => {
    if (!maLo) return;
    setDangNap(true);
    setLoi(null);
    try {
      const kq = await dsTem(maLo);
      setTem(kq.tem || []);
    } catch (e) {
      if (e instanceof LoiHetPhien) { onHetPhien?.(); return; }
      if (e instanceof LoiKhongDuQuyen) { setLoi('Vai trò của bạn không được xem danh sách tem.'); return; }
      setLoi(laLoiKetNoi(e) ? 'Không nối được tới máy chủ.' : e.message);
    } finally {
      setDangNap(false);
    }
  }, [maLo, onHetPhien]);

  useEffect(() => {
    let huy = false;
    (async () => {
      if (huy) return;
      await nap();
    })();
    return () => { huy = true; };
  }, [nap]);

  // Chốt này phải nằm SAU mọi hook. Đặt trước hook là lỗi "Rendered fewer
  // hooks than expected" vì hai lần vẽ gọi số hook khác nhau.
  if (!maLo) {
    return (
      <div className="p-6 sm:p-8 max-w-3xl">
        <h1 className="text-xl font-bold text-[#0A1A12] mb-2">Chưa chọn lô nào</h1>
        <p className="text-sm text-[#4F6357] mb-5">
          Màn này hiện trạng thái từng con tem của một lô, nên cần biết lô nào.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-[#135E3E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0A3D27] transition-colors"
        >
          <ArrowLeft size={16} /> Về danh sách lô
        </button>
      </div>
    );
  }

  const loc = (tem || []).filter((t) =>
    !tuKhoa.trim() || t.serial.includes(tuKhoa.trim().toUpperCase())
  );
  const daKichHoat = (tem || []).filter((t) => t.trang_thai === 'DA_KICH_HOAT').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1A12] flex items-center gap-2">
            <Printer className="text-[#135E3E]" size={28} /> Tem của lô
          </h1>
          <p className="text-sm text-[#4F6357] mt-1">
            Mã lô <span className="font-mono font-bold text-[#0A1A12]">{maLo}</span>
            {tem && <> · {tem.length} tem · {daKichHoat} đã kích hoạt</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="bg-white border border-emerald-900/15 text-[#0A1A12] px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Danh sách lô
          </button>
          <button
            onClick={nap}
            disabled={dangNap}
            className="bg-[#135E3E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0A3D27] transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {dangNap ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
            Nạp lại
          </button>
        </div>
      </div>

      {/* Lưu ý về việc in — việc in không do hệ thống này điều khiển */}
      <div className="bg-amber-500/10 border border-amber-600/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="text-amber-900 text-[13px] leading-relaxed">
          Hệ thống không điều khiển máy in. Tem được in từ tệp CSV mà bước sinh mã
          xuất ra, và tệp đó chứa mã bí mật dạng đọc được — in xong, dán lớp cào xong
          thì xoá tệp.
        </p>
      </div>

      {loi && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <p className="text-rose-900 text-[13px] leading-relaxed">{loi}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-900/10 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value.toUpperCase())}
            placeholder="Tìm theo serial, ví dụ 900001"
            className="w-full bg-[#F6F8F5] border border-emerald-900/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono outline-none focus:border-[#135E3E] transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-900/10 overflow-hidden">
        {tem === null ? (
          <div className="p-10 text-center text-[#4F6357] text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Đang nạp danh sách tem…
          </div>
        ) : tem.length === 0 ? (
          <div className="p-10 text-center text-[#4F6357] text-sm">
            Lô này chưa sinh con tem nào.
          </div>
        ) : loc.length === 0 ? (
          <div className="p-10 text-center text-[#4F6357] text-sm">
            Không có serial nào khớp “{tuKhoa}”.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-emerald-900/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Serial</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Kích hoạt lúc</th>
                  <th className="p-4">Tỉnh ước tính</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loc.map((t) => (
                  <tr key={t.serial} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#0A1A12]">{t.serial}</td>
                    <td className="p-4">
                      {t.trang_thai === 'DA_KICH_HOAT' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 size={12} /> Đã kích hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                          Chưa kích hoạt
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-[13px]">
                      {gioVietNam(t.kich_hoat_luc) || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-4 text-gray-600 text-[13px]">
                      {t.kich_hoat_tinh ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-[#8C6928]" /> {t.kich_hoat_tinh}
                        </span>
                      ) : (
                        <span className="text-gray-300">không rõ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tem !== null && tem.length > 0 && (
        <p className="text-[12px] text-[#4F6357] mt-4 leading-relaxed">
          Cột tỉnh ước tính thường trống: tỉnh được tra từ địa chỉ mạng, mà mạng di
          động ở Việt Nam dùng NAT nên phần lớn lượt quét không tra ra được.
        </p>
      )}
    </div>
  );
}
