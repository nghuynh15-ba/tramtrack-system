import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, Plus, Search, FlaskConical, Droplet, CheckCircle2,
  Printer, Eye, BookOpen, Lock, Clock, Loader2, RefreshCcw, AlertCircle,
} from 'lucide-react';
import { dsLo, LoiHetPhien, LoiKhongDuQuyen, laLoiKetNoi } from '../../services/api';
import { ngayVietNam } from '../../services/ma';

/**
 * Danh sách lô của cơ sở — GET /api/v1/qt/lo
 *
 * Bản trước là mảng MOCK_BATCHES viết cứng bốn lô, với chín trường mà máy chủ
 * không hề trả về: nồi cất số mấy, sản lượng bao nhiêu chai 50ml, và một cột
 * "Trạng Thái Sổ Cái" ghi LOCKED SHA-256 trên từng dòng. Chín trường đó đã bỏ.
 *
 * Máy chủ chỉ trả về đúng 11 trường, và mọi con số trên trang này — kể cả ba
 * thẻ tổng ở đầu và số trong ngoặc của các chip lọc — đều tính ra từ chúng.
 *
 * Lưu ý về kiểu: `ham_luong_cineole` là cột numeric trong PostgreSQL và thư
 * viện pg trả nó về dưới dạng CHUỖI để không mất độ chính xác. Phải Number()
 * trước khi gọi toFixed, nếu không là lỗi "toFixed is not a function".
 */

const TRANG_THAI = {
  NHAP:         { nhan: 'Nháp',          mau: 'bg-slate-100 text-slate-700' },
  DA_PHAT_HANH: { nhan: 'Đã phát hành',  mau: 'bg-emerald-50 text-[#135E3E] border border-emerald-200' },
  DA_THU_HOI:   { nhan: 'Đã thu hồi',    mau: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

export default function BatchManagementScreen({
  onBack,
  onNavigateToCreateBatch,
  onSinhMa,
  onXemTem,
  onXemTruoc,
  onHetPhien,
}) {
  const [lo, setLo]               = useState(null);   // null = đang nạp
  const [loi, setLoi]             = useState(null);
  const [tuKhoa, setTuKhoa]       = useState('');
  const [trangThai, setTrangThai] = useState('all');
  const [dangNap, setDangNap]     = useState(false);

  const nap = useCallback(async () => {
    setDangNap(true);
    setLoi(null);
    try {
      const kq = await dsLo();
      setLo(kq.lo || []);
    } catch (e) {
      if (e instanceof LoiHetPhien) { onHetPhien?.(); return; }
      if (e instanceof LoiKhongDuQuyen) {
        setLoi('Vai trò của bạn không được xem danh sách lô.');
        setLo([]);
        return;
      }
      setLoi(laLoiKetNoi(e) ? 'Không nối được tới máy chủ.' : e.message);
      setLo([]);
    } finally {
      setDangNap(false);
    }
  }, [onHetPhien]);

  useEffect(() => {
    let huy = false;
    (async () => {
      if (!huy) await nap();
    })();
    // StrictMode của React 18 chạy effect hai lần ở chế độ phát triển.
    return () => { huy = true; };
  }, [nap]);

  const ds       = lo || [];
  const tongTem  = ds.reduce((s, l) => s + (l.so_tem || 0), 0);
  const tongKich = ds.reduce((s, l) => s + (l.da_kich_hoat || 0), 0);
  const demTrang = (t) => ds.filter((l) => l.trang_thai === t).length;

  const hienThi = ds.filter((l) => {
    const khopTen   = !tuKhoa.trim() || l.ma_lo.includes(tuKhoa.trim().toUpperCase());
    const khopTrang = trangThai === 'all' || l.trang_thai === trangThai;
    return khopTen && khopTrang;
  });

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#0A1A12] py-8 px-4 sm:px-6 lg:px-8 font-sans pb-20">
      <div className="max-w-[1400px] mx-auto">

        {/* 1. Thanh đầu trang */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm p-5 rounded-3xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-slate-50 border border-emerald-900/10 text-[#0A1A12] hover:bg-emerald-50 hover:text-[#135E3E] transition-all"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div>
              {/* Tên cơ sở đã hiện ở thanh bên, lấy từ phiếu đăng nhập — không
                  lặp lại ở đây, và nhất là không viết cứng tên một HTX. */}
              <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider text-[#0A1A12] leading-tight">
                QUẢN LÝ LÔ SẢN XUẤT
              </h1>
              <p className="text-[13px] text-[#4F6357] mt-1">
                Mỗi lô là một mẻ chưng cất, có phiếu kiểm nghiệm riêng và dải tem riêng.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button
              onClick={nap}
              disabled={dangNap}
              className="bg-white border border-[#135E3E] text-[#135E3E] font-semibold py-3 px-5 rounded-xl shadow-sm hover:bg-emerald-50 transition-all text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wide disabled:opacity-60"
            >
              {dangNap ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              Nạp lại
            </button>
            <button
              onClick={onNavigateToCreateBatch}
              className="bg-gradient-to-r from-[#8C6928] to-[#6E501C] text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wide"
            >
              <Plus size={18} strokeWidth={2.5} /> Khởi tạo lô mới
            </button>
          </div>
        </div>

        {loi && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-rose-900 text-[13px] leading-relaxed">{loi}</p>
          </div>
        )}

        {/* 2. Ba thẻ tổng — tính từ danh sách thật, không viết cứng.
               Thẻ "Tinh Dầu Thu Hồi 420 Lít" đã bỏ: không có trường nào trong
               hệ thống đo sản lượng tinh dầu. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <The
            nhan="Số lô của cơ sở"
            so={lo === null ? '—' : ds.length}
            donVi="lô"
            bieuTuong={<FlaskConical size={16} className="text-[#8C6928]" />}
          />
          <The
            nhan="Tem đã sinh"
            so={lo === null ? '—' : tongTem.toLocaleString('vi-VN')}
            donVi="tem"
            bieuTuong={<CheckCircle2 size={16} className="text-[#8C6928]" />}
          />
          <The
            nhan="Tem đã kích hoạt"
            so={lo === null ? '—' : tongKich.toLocaleString('vi-VN')}
            donVi={tongTem ? `${Math.round((tongKich / tongTem) * 100)}%` : '—'}
            bieuTuong={<Droplet size={16} className="text-[#135E3E]" />}
            noiBat
          />
        </div>

        {/* 3. Thanh lọc */}
        <div className="bg-white/95 border border-emerald-900/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between shadow-sm mb-6">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[#4F6357]" />
            </div>
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value.toUpperCase())}
              placeholder="Tìm theo mã lô, ví dụ LO-2026-Q4-DEMO"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-[#0A1A12] focus:border-[#135E3E] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              ['all', 'Tất cả', ds.length],
              ['DA_PHAT_HANH', 'Đã phát hành', demTrang('DA_PHAT_HANH')],
              ['NHAP', 'Nháp', demTrang('NHAP')],
              ['DA_THU_HOI', 'Đã thu hồi', demTrang('DA_THU_HOI')],
            ].map(([ma, nhan, so]) => (
              <button
                key={ma}
                onClick={() => setTrangThai(ma)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  trangThai === ma
                    ? 'bg-[#0A1A12] text-white'
                    : 'bg-slate-50 text-[#4F6357] hover:bg-slate-100'
                }`}
              >
                {nhan} ({so})
              </button>
            ))}
          </div>
        </div>

        {/* 4. Bảng lô */}
        <div className="bg-white border border-emerald-900/10 rounded-[24px] overflow-hidden shadow-sm mb-6">
          {lo === null ? (
            <div className="p-16 text-center text-[#4F6357] text-sm flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Đang nạp danh sách lô…
            </div>
          ) : ds.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-[#4F6357] text-sm mb-1">Cơ sở của bạn chưa có lô nào.</p>
              <p className="text-[#4F6357] text-[13px] mb-5">
                Một lô cần mã lô và tên dòng sản phẩm; muốn phát hành thì phải có thêm
                số phiếu kiểm nghiệm và hàm lượng cineole.
              </p>
              <button
                onClick={onNavigateToCreateBatch}
                className="inline-flex items-center gap-2 bg-[#135E3E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0A3D27] transition-colors"
              >
                <Plus size={16} /> Khởi tạo lô đầu tiên
              </button>
            </div>
          ) : hienThi.length === 0 ? (
            <div className="p-16 text-center text-[#4F6357] text-sm">
              Không có lô nào khớp bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-emerald-900/10 text-[10px] sm:text-xs text-[#4F6357] uppercase tracking-wider font-bold">
                    <th className="py-5 px-6">Mã lô &amp; dòng sản phẩm</th>
                    <th className="py-5 px-4">Ngày chưng cất</th>
                    <th className="py-5 px-4">Số tem đã sinh</th>
                    <th className="py-5 px-4">Phiếu kiểm nghiệm</th>
                    <th className="py-5 px-4 w-48">Tem đã kích hoạt</th>
                    <th className="py-5 px-4">Trạng thái lô</th>
                    <th className="py-5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {hienThi.map((l, i) => (
                    <tr
                      key={l.ma_lo}
                      className={`border-b border-emerald-900/5 hover:bg-emerald-50/30 transition-colors ${
                        i === hienThi.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-[13px] text-[#0A1A12] mb-0.5">
                          {l.ma_lo}
                        </div>
                        <div className="text-[11px] text-[#4F6357] font-medium">
                          {l.ten_dong_sp || <span className="italic text-slate-400">chưa khai</span>}
                        </div>
                        {/* Tên loài là hằng số của đề tài, không phải dữ liệu lô */}
                        <div className="text-[10px] text-slate-400 italic">
                          Melaleuca quinquenervia
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-[13px] text-[#0A1A12] font-semibold">
                          {ngayVietNam(l.ngay_chung_cat) || (
                            <span className="text-slate-400 italic font-normal">chưa khai</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[12px] font-bold text-[#0A1A12]">
                          <FlaskConical size={12} className="text-[#4F6357]" />
                          {(l.so_tem || 0).toLocaleString('vi-VN')} tem
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {l.so_phieu_coa && l.ham_luong_cineole !== null ? (
                          <div>
                            <span className="font-mono font-bold text-[#135E3E] text-[13px]">
                              {Number(l.ham_luong_cineole).toFixed(2)}% cineole
                            </span>
                            <div className="font-mono text-[10px] text-[#4F6357] mt-0.5">
                              {l.so_phieu_coa}
                            </div>
                            {l.don_vi_kiem_nghiem && (
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                                {l.don_vi_kiem_nghiem}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="inline-flex items-center gap-1.5 text-amber-700 text-[11px] font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md"
                            title="Máy chủ chặn phát hành lô chưa có số phiếu COA và hàm lượng cineole"
                          >
                            <Clock size={12} /> Chưa có phiếu
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {l.so_tem > 0 ? (
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-[#4F6357] mb-1.5">
                              <span>
                                {l.da_kich_hoat.toLocaleString('vi-VN')} /{' '}
                                {l.so_tem.toLocaleString('vi-VN')}
                              </span>
                              <span className="text-[#135E3E]">
                                {Math.round((l.da_kich_hoat / l.so_tem) * 100)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#135E3E]"
                                style={{ width: `${(l.da_kich_hoat / l.so_tem) * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">
                            Chưa sinh tem
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md ${
                            TRANG_THAI[l.trang_thai]?.mau || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {l.trang_thai === 'DA_PHAT_HANH' && <Lock size={12} />}
                          {TRANG_THAI[l.trang_thai]?.nhan || l.trang_thai}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onXemTem?.(l.ma_lo)}
                            className="p-2 rounded-lg text-[#4F6357] hover:bg-slate-100 hover:text-[#0A1A12] transition-colors"
                            title="Xem danh sách tem của lô"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onXemTruoc?.(l.ma_lo)}
                            className="p-2 rounded-lg text-[#4F6357] hover:bg-slate-100 hover:text-[#135E3E] transition-colors"
                            title="Xem trước hành trình như người mua thấy"
                          >
                            <BookOpen size={16} />
                          </button>
                          <button
                            onClick={() => onSinhMa?.(l.ma_lo)}
                            className="p-2 rounded-lg text-[#4F6357] hover:bg-slate-100 hover:text-[#8C6928] transition-colors"
                            title="Sinh mã và xuất tệp in tem"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. Số lượng — máy chủ trả tối đa 200 lô một lượt nên chưa cần phân trang */}
        {lo !== null && ds.length > 0 && (
          <p className="text-sm text-[#4F6357] font-medium">
            Hiển thị <span className="font-bold text-[#0A1A12]">{hienThi.length}</span> trong{' '}
            <span className="font-bold text-[#0A1A12]">{ds.length}</span> lô của cơ sở
          </p>
        )}
      </div>
    </div>
  );
}

function The({ nhan, so, donVi, bieuTuong, noiBat = false }) {
  return (
    <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[#4F6357] text-xs font-bold uppercase tracking-wider">{nhan}</p>
        {bieuTuong}
      </div>
      <div className={`font-mono text-3xl font-bold ${noiBat ? 'text-[#135E3E]' : 'text-[#0A1A12]'}`}>
        {so}{' '}
        <span className="text-sm font-sans text-[#4F6357] font-medium uppercase tracking-wide">
          {donVi}
        </span>
      </div>
    </div>
  );
}
