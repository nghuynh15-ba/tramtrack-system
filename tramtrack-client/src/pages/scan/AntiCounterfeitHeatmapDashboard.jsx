import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Loader2, ShieldAlert, Boxes, QrCode } from 'lucide-react';
import { thongKe, laLoiHetPhien, laLoiKetNoi, LoiKhongDuQuyen } from '../../services/api';

/**
 * Bảng điều khiển — GET /api/v1/qt/thong-ke.
 *
 * Chỉ hiện con số máy chủ đếm được của cơ sở này. Bản trước là bản đồ nhiệt với
 * điểm nóng vẽ sẵn. Khu vực nay lấy từ phần người mua tự chọn tỉnh/thành và
 * xã/phường sau khi kích hoạt (tùy chọn), không suy từ địa chỉ mạng.
 *
 * "Kích hoạt trùng" được diễn giải thận trọng: đó là số lần nhập đúng mã của
 * một tem đã kích hoạt trước đó. Nó không nói tem nào là giả.
 */

function The({ icon: Icon, nhan, so, ghiChu, nhan_manh }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${nhan_manh ? 'bg-amber-50 border-amber-300' : 'bg-white border-emerald-900/10'}`}>
      <div className={`flex items-center gap-2 mb-3 ${nhan_manh ? 'text-amber-800' : 'text-[#135E3E]'}`}>
        <Icon size={16} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{nhan}</span>
      </div>
      <div className="font-mono text-3xl font-bold text-[#0A1A12]">{Number(so ?? 0).toLocaleString('vi-VN')}</div>
      {ghiChu && <p className="text-[12px] text-[#4F6357] mt-2 leading-relaxed">{ghiChu}</p>}
    </div>
  );
}

export default function AntiCounterfeitHeatmapDashboard({ onBack, onHetPhien, onMoBaoCao }) {
  const [d, setD] = useState(null);
  const [loi, setLoi] = useState(null);
  const [dang, setDang] = useState(true);
  const [moTinh, setMoTinh] = useState(null);

  const tai = useCallback(async () => {
    setDang(true);
    setLoi(null);
    try {
      setD(await thongKe());
    } catch (e) {
      if (laLoiHetPhien(e)) { if (onHetPhien) onHetPhien(); return; }
      if (e instanceof LoiKhongDuQuyen) setLoi('Tài khoản này không có quyền xem thống kê.');
      else if (laLoiKetNoi(e)) setLoi('Chưa nối được máy chủ nên chưa có số liệu. Thử lại sau vài giây.');
      else setLoi(e.message || 'Không đọc được thống kê');
    } finally {
      setDang(false);
    }
  }, [onHetPhien]);

  useEffect(() => { tai(); }, [tai]);

  const q = d?.quet_30_ngay;
  // Gom (tỉnh, xã/phường) thành từng tỉnh, tỉnh nhiều tem nhất lên đầu.
  const nhomTinh = (() => {
    const m = new Map();
    for (const r of d?.khu_vuc || []) {
      if (!m.has(r.ma_tinh)) m.set(r.ma_tinh, { ma: r.ma_tinh, ten: r.ten_tinh, tong: 0, xa: [] });
      const g = m.get(r.ma_tinh);
      g.tong += r.so_tem;
      if (r.ten_xa) g.xa.push({ ten: r.ten_xa, so_tem: r.so_tem });
    }
    return [...m.values()].sort((a, b) => b.tong - a.tong);
  })();
  const temCoKhuVuc = nhomTinh.reduce((s, g) => s + g.tong, 0);
  const daKichHoat = d?.tem?.da_kich_hoat || 0;

  return (
    <div className="p-4 sm:p-8 max-w-[1100px] font-sans text-[#0A1A12]">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider">Bảng điều khiển</h1>
          <p className="text-sm text-[#4F6357] mt-1">Số liệu của cơ sở bạn, 30 ngày gần nhất.</p>
        </div>
        <button
          onClick={tai}
          disabled={dang}
          className="flex items-center gap-2 bg-white border border-emerald-900/15 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50"
        >
          {dang ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Tải lại
        </button>
      </div>

      {loi && (
        <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm mb-6">{loi}</div>
      )}

      {!d && dang && <p className="text-sm text-[#4F6357]">Đang tải số liệu…</p>}

      {d && (
        <>
          <h2 className="text-[11px] font-bold uppercase text-[#4F6357] tracking-wider mb-3">Tổng quan</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <The icon={Boxes} nhan="Số lô" so={d.lo.tong} ghiChu={d.lo.da_thu_hoi ? `${d.lo.da_thu_hoi} lô đã thu hồi` : null} />
            <The icon={QrCode} nhan="Số tem đã sinh" so={d.tem.tong} />
            <The icon={QrCode} nhan="Tem đã kích hoạt" so={d.tem.da_kich_hoat} ghiChu={`${d.tem.ti_le_kich_hoat}% số tem`} />
            <The
              icon={ShieldAlert} nhan="Báo cáo" so={d.bao_cao.tong}
              ghiChu={d.bao_cao.moi ? `${d.bao_cao.moi} báo cáo mới chưa xử lý` : 'Không có báo cáo mới'}
              nhan_manh={d.bao_cao.moi > 0}
            />
          </div>
          {d.bao_cao.moi > 0 && onMoBaoCao && (
            <button onClick={onMoBaoCao} className="mb-8 bg-[#991B1B] text-white font-bold text-sm px-5 py-3 rounded-xl shadow">
              Xem {d.bao_cao.moi} báo cáo mới
            </button>
          )}

          <h2 className="text-[11px] font-bold uppercase text-[#4F6357] tracking-wider mb-3">Lượt quét 30 ngày</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <The icon={QrCode} nhan="Tra cứu tầng 1" so={q.tra_cuu_t1} ghiChu="Quét QR khi tem còn nguyên" />
            <The icon={QrCode} nhan="Kích hoạt thành công" so={q.kich_hoat_ok} ghiChu="Lần nhập mã đầu tiên của một tem" />
            <The
              icon={AlertTriangle} nhan="Kích hoạt trùng" so={q.kich_hoat_trung} nhan_manh={q.kich_hoat_trung > 0}
              ghiChu="Nhập đúng mã của tem đã kích hoạt trước đó"
            />
            <The icon={QrCode} nhan="Nhập mã sai" so={q.ma_sai} ghiChu="Gồm cả serial không tồn tại" />
          </div>
          <p className="text-[12px] text-[#4F6357] leading-relaxed mb-8 max-w-3xl">
            <strong>Kích hoạt trùng không có nghĩa là tem giả.</strong> Có thể chính người mua thật quét lại,
            cũng có thể mã đã lộ từ trước. Hệ thống chỉ báo sự kiện, không kết luận chai nào là thật hay giả.
          </p>

          <h2 className="text-[11px] font-bold uppercase text-[#4F6357] tracking-wider mb-3">Khu vực kích hoạt tem</h2>
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
            {nhomTinh.length === 0 ? (
              <p className="text-sm text-[#4F6357] leading-relaxed">
                Chưa có tem nào kèm khu vực. Sau khi kích hoạt, người mua được mời chọn tỉnh/thành
                (không bắt buộc), số liệu sẽ hiện ở đây.
              </p>
            ) : (
              <>
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-[#4F6357]">
                      <th className="pb-2">Tỉnh / thành phố</th>
                      <th className="pb-2 text-right">Tem đã kích hoạt</th>
                      <th className="pb-2 text-right">Tỉ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nhomTinh.map((g) => (
                      <React.Fragment key={g.ma}>
                        <tr
                          className="border-t border-emerald-900/10 cursor-pointer hover:bg-emerald-50/50"
                          onClick={() => setMoTinh(moTinh === g.ma ? null : g.ma)}
                        >
                          <td className="py-2 font-medium">
                            {g.ten}{g.xa.length > 0 && <span className="text-[11px] text-[#4F6357]"> · {moTinh === g.ma ? 'thu gọn' : 'xem xã/phường'}</span>}
                          </td>
                          <td className="py-2 text-right font-mono font-bold">{g.tong}</td>
                          <td className="py-2 text-right font-mono text-[#4F6357]">{(g.tong / temCoKhuVuc * 100).toFixed(0)}%</td>
                        </tr>
                        {moTinh === g.ma && g.xa.map((x) => (
                          <tr key={x.ten} className="bg-slate-50/70">
                            <td className="py-1.5 pl-6 text-[13px] text-[#4F6357]">{x.ten}</td>
                            <td className="py-1.5 text-right font-mono text-[13px]">{x.so_tem}</td>
                            <td />
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                <p className="text-[12px] text-[#4F6357] leading-relaxed">
                  Mới có khu vực của <strong>{temCoKhuVuc}</strong> trên {daKichHoat} tem đã kích hoạt
                  {daKichHoat > 0 ? ` (${Math.round(temCoKhuVuc / daKichHoat * 100)}%)` : ''}.
                  Đây là khu vực người mua <strong>tự chọn</strong> nên chỉ phản ánh những người chịu khai,
                  chưa đại diện cho toàn bộ thị trường. Hệ thống không lưu vị trí chính xác hay địa chỉ mạng.
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
