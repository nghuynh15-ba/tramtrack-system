import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Calendar, Leaf, FileSignature, CheckCircle2, AlertTriangle,
  FileCheck, ShieldCheck, Hash, Building2, Eye, X,
} from 'lucide-react';
import { taoLo, laLoiHetPhien, laLoiKetNoi } from '../../services/api';
import { nenAnh } from '../../services/anh';
import ChonDiaDiem from '../../components/ChonDiaDiem';
import HanhTrinhLo from '../../components/HanhTrinhLo';

/**
 * Tạo lô — GỌI THẬT POST /api/v1/qt/lo.
 *
 * Năm bước: nhận diện lô → nguyên liệu & chưng cất → kiểm nghiệm → đóng chai → xác nhận.
 * Kiểm nghiệm (cineole, số phiếu, đơn vị, ẢNH PHIẾU) là bắt buộc. Nguyên liệu, chưng
 * cất và đóng chai là tùy chọn: để trống thì trang hành trình ghi "Cơ sở chưa cung cấp".
 * Vùng trồng, nơi chưng cất và nơi đóng chai chọn riêng vì có thể ở các tỉnh khác nhau.
 * Bước xác nhận có nút xem trước đúng như người mua sẽ thấy.
 *
 * Số lượng tem KHÔNG hỏi ở đây — hỏi ở bước sinh mã, nơi nó thực sự được dùng.
 * Tạo lô xong chỉ có lô ở trạng thái NHAP. Chưa có tem, chưa phát hành.
 */

const DONG_SP = [
  'Tinh dầu tràm năm gân nguyên chất',
  'Tinh dầu tràm gió nguyên chất',
];

/** Gợi ý mã lô theo ngày hôm nay; người dùng sửa được. */
function goiYMaLo() {
  const d = new Date();
  const hai = (n) => String(n).padStart(2, '0');
  return `LO-${d.getFullYear()}-${hai(d.getMonth() + 1)}${hai(d.getDate())}`;
}

export default function BatchCreationWizard({ onCancel, onComplete, onHetPhien }) {
  const [buoc, setBuoc] = useState(1);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState(null);

  const [f, setF] = useState({
    maLo: goiYMaLo(),
    tenDongSp: DONG_SP[0],
    ngayChungCat: '',
    cineole: '',
    soPhieuCoa: '',
    donViKiemNghiem: '',
    anhCoa: null,
    // Nguyên liệu
    nlTinh: '', nlXa: '', nlNgay: '', nlDonVi: '',
    // Chưng cất
    ccCoSo: '', ccTinh: '', ccXa: '', ccSoMe: '', ccGio: '',
    // Đóng chai
    dcNoi: '', dcTinh: '', dcXa: '', dcNgay: '', dcMl: '', dcSoChai: '',
  });
  const [dl, setDl] = useState(null);        // danh sách tỉnh/xã, nạp một lần
  const [xemTruoc, setXemTruoc] = useState(false);
  useEffect(() => {
    let huy = false;
    import('../../data/dvhc.json').then((m) => { if (!huy) setDl(m.default || m); }).catch(() => {});
    return () => { huy = true; };
  }, []);
  const [loiAnh, setLoiAnh] = useState(null);
  const chonAnh = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setLoiAnh(null);
    try { dat('anhCoa', await nenAnh(file)); }
    catch (err) { setLoiAnh(err.message); }
  };
  const dat = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const maLoChuan = f.maLo.trim().toUpperCase();
  const cineoleSo = f.cineole === '' ? null : Number(f.cineole);

  const buoc1Dung = /^[A-Z0-9][A-Z0-9-]{2,39}$/.test(maLoChuan) && f.ngayChungCat;
  const buoc2Dung =
    cineoleSo !== null && Number.isFinite(cineoleSo) && cineoleSo > 0 && cineoleSo <= 100 &&
    f.soPhieuCoa.trim() && f.donViKiemNghiem.trim() && f.anhCoa;

  const homNay = (() => {
    const d = new Date();
    const hai = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
  })();
  const soTrong = (v, min, max, nguyen) => {
    if (v === '') return true;
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max && (!nguyen || Number.isInteger(n));
  };
  // Lỗi hiển thị ngay dưới biểu mẫu để khỏi chờ máy chủ từ chối.
  const loiBuoc2 =
    (f.nlNgay && f.nlNgay > homNay && 'Ngày thu hái không được ở tương lai.') ||
    (f.nlNgay && f.ngayChungCat && f.nlNgay > f.ngayChungCat && 'Ngày thu hái phải trước hoặc cùng ngày chưng cất.') ||
    (!soTrong(f.ccGio, 0.5, 72, false) && 'Thời gian chưng cất phải từ 0,5 đến 72 giờ.') ||
    null;
  const loiBuoc4 =
    (f.dcNgay && f.dcNgay > homNay && 'Ngày đóng chai không được ở tương lai.') ||
    (f.dcNgay && f.ngayChungCat && f.dcNgay < f.ngayChungCat && 'Ngày đóng chai phải sau hoặc cùng ngày chưng cất.') ||
    (!soTrong(f.dcMl, 1, 5000, true) && 'Quy cách chai phải là số nguyên từ 1 đến 5000 ml.') ||
    (!soTrong(f.dcSoChai, 1, 1000000, true) && 'Số chai phải là số nguyên dương.') ||
    null;

  /** Chỉ đưa vào các trường đã nhập; chặng trống thì không gửi. */
  const taoHanhTrinh = () => {
    const chang = (o) => {
      const r = {};
      for (const [k, v] of Object.entries(o)) if (v !== '' && v !== null && v !== undefined) r[k] = v;
      return Object.keys(r).length ? r : null;
    };
    const so = (v) => (v === '' ? '' : Number(v));
    const ht = {};
    const a = chang({ ma_tinh: f.nlTinh, ma_xa: f.nlXa, ngay_thu_hai: f.nlNgay, don_vi_cung_ung: f.nlDonVi.trim() });
    const b = chang({ co_so: f.ccCoSo.trim(), ma_tinh: f.ccTinh, ma_xa: f.ccXa, so_me: f.ccSoMe.trim(), gio_chung_cat: so(f.ccGio) });
    const c = chang({ noi: f.dcNoi.trim(), ma_tinh: f.dcTinh, ma_xa: f.dcXa, ngay_dong_chai: f.dcNgay, quy_cach_ml: so(f.dcMl), so_chai: so(f.dcSoChai) });
    if (a) ht.nguyen_lieu = a;
    if (b) ht.chung_cat = b;
    if (c) ht.dong_chai = c;
    return Object.keys(ht).length ? ht : null;
  };

  const gui = async () => {
    setLoi(null);
    setDangGui(true);
    try {
      const lo = await taoLo({
        ma_lo: maLoChuan,
        ten_dong_sp: f.tenDongSp,
        ngay_chung_cat: f.ngayChungCat,
        ham_luong_cineole: cineoleSo,
        so_phieu_coa: f.soPhieuCoa.trim(),
        don_vi_kiem_nghiem: f.donViKiemNghiem.trim(),
        anh_phieu_coa: f.anhCoa,
        hanh_trinh: taoHanhTrinh() || undefined,
      });
      if (onComplete) onComplete(lo.ma_lo);
    } catch (e) {
      if (laLoiHetPhien(e)) { if (onHetPhien) onHetPhien(); return; }
      if (laLoiKetNoi(e)) setLoi('Chưa nối được máy chủ nên lô CHƯA được tạo. Kiểm tra mạng rồi bấm lại.');
      else setLoi(e.message || 'Không tạo được lô');
    } finally {
      setDangGui(false);
    }
  };

  const tenDiaDiem = (maTinh, maXa) => {
    if (!maTinh || !dl) return '';
    const t = (dl.t.find(([ma]) => ma === maTinh) || [])[1] || '';
    const x = maXa ? ((dl.x[maTinh] || []).find(([ma]) => ma === maXa) || [])[1] || '' : '';
    return [x, t].filter(Boolean).join(', ');
  };
  const loXemTruoc = {
    ma_lo: maLoChuan,
    ten_dong_sp: f.tenDongSp,
    ngay_chung_cat: f.ngayChungCat || null,
    ham_luong_cineole: cineoleSo,
    so_phieu_coa: f.soPhieuCoa.trim(),
    don_vi_kiem_nghiem: f.donViKiemNghiem.trim(),
    anh_phieu_coa: f.anhCoa,
    hanh_trinh: taoHanhTrinh(),
  };

  const cacBuoc = [
    { num: 1, title: 'NHẬN DIỆN LÔ' },
    { num: 2, title: 'NGUYÊN LIỆU & CHƯNG CẤT' },
    { num: 3, title: 'KIỂM NGHIỆM (COA)' },
    { num: 4, title: 'ĐÓNG CHAI' },
    { num: 5, title: 'XÁC NHẬN & TẠO LÔ' },
  ];

  const nhan = 'block text-xs font-bold text-[#4F6357] uppercase tracking-wider mb-2 ml-1';
  const o = 'w-full px-4 py-3 bg-slate-50 border border-emerald-900/15 rounded-xl text-sm font-medium text-[#0A1A12] focus:border-[#135E3E] outline-none';

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#0A1A12] py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-10">
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white border border-emerald-900/10 hover:bg-emerald-50 hover:text-[#135E3E] shadow-sm transition-all"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider">
              KHỞI TẠO LÔ SẢN XUẤT MỚI
            </h1>
            <div className="font-mono text-xs text-[#135E3E] font-bold mt-1 tracking-widest">
              MÃ LÔ: <span className="text-[#0A1A12] bg-emerald-50 px-2 py-0.5 rounded">{maLoChuan || '—'}</span>
            </div>
          </div>
        </div>

        {/* Thanh bước */}
        <div className="flex items-center justify-between w-full mb-10 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-900/10 -z-10 -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#135E3E] to-[#8C6928] -z-10 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${((buoc - 1) / 4) * 100}%` }}
          />
          {cacBuoc.map((s) => {
            const hienTai = buoc === s.num;
            const qua = buoc > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center bg-[#F6F8F5] px-2 sm:px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                  ${hienTai ? 'bg-white border-[#8C6928] text-[#8C6928] shadow-md'
                    : qua ? 'bg-[#135E3E] border-[#135E3E] text-white'
                    : 'bg-white border-emerald-900/20 text-[#4F6357]'}`}>
                  {qua ? <CheckCircle2 size={20} /> : `0${s.num}`}
                </div>
                <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-3 whitespace-nowrap hidden sm:block
                  ${hienTai ? 'text-[#0A1A12]' : qua ? 'text-[#135E3E]' : 'text-[#4F6357]/60'}`}>
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Cột trái: biểu mẫu */}
          <div className="w-full lg:w-[65%] shrink-0">
            <div className="bg-white/95 border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm">

              {buoc === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className={nhan}>Mã lô <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6357]/60" />
                      <input
                        type="text" value={f.maLo} onChange={(e) => dat('maLo', e.target.value)}
                        className={`${o} pl-11 font-mono font-bold uppercase`}
                      />
                    </div>
                    <p className="text-[11px] text-[#4F6357] mt-1.5 ml-1">
                      Chữ in hoa, số và dấu gạch ngang, 3–40 ký tự. Mã lô không đổi được sau khi tạo.
                    </p>
                  </div>

                  <div>
                    <label className={nhan}>Dòng sản phẩm</label>
                    <div className="relative">
                      <Leaf size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6357]/60" />
                      <select value={f.tenDongSp} onChange={(e) => dat('tenDongSp', e.target.value)} className={`${o} pl-11`}>
                        {DONG_SP.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={nhan}>Ngày chưng cất <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6357]/60" />
                      <input
                        type="date" value={f.ngayChungCat} onChange={(e) => dat('ngayChungCat', e.target.value)}
                        className={`${o} pl-11`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {buoc === 2 && (
                <div className="space-y-6">
                  <p className="text-xs text-[#4F6357] bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
                    Không bắt buộc, nhưng đây là nội dung chặng 1 và 2 của trang hành trình mà người mua xem.
                    Để trống thì trang ghi “Cơ sở chưa cung cấp”. Vùng trồng và nơi chưng cất chọn riêng
                    vì thường không cùng một nơi.
                  </p>

                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#135E3E]">Chặng 1 · Nguyên liệu</h3>
                  <ChonDiaDiem dl={dl} tinh={f.nlTinh} xa={f.nlXa} o={o} nhan={nhan}
                    onChange={({ tinh, xa }) => setF((p) => ({ ...p, nlTinh: tinh, nlXa: xa }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={nhan}>Ngày thu hái</label>
                      <input type="date" max={homNay} value={f.nlNgay} onChange={(e) => dat('nlNgay', e.target.value)} className={o} />
                    </div>
                    <div>
                      <label className={nhan}>Đơn vị / người cung ứng lá</label>
                      <input type="text" maxLength={120} value={f.nlDonVi} onChange={(e) => dat('nlDonVi', e.target.value)}
                        placeholder="Tên hợp tác xã hoặc hộ trồng" className={o} />
                    </div>
                  </div>

                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#135E3E] pt-2">Chặng 2 · Chưng cất</h3>
                  <p className="text-[11px] text-[#4F6357] -mt-3 ml-1">Ngày chưng cất đã nhập ở bước 1.</p>
                  <div>
                    <label className={nhan}>Cơ sở chưng cất</label>
                    <input type="text" maxLength={120} value={f.ccCoSo} onChange={(e) => dat('ccCoSo', e.target.value)}
                      placeholder="Tên cơ sở hoặc xưởng chưng cất" className={o} />
                  </div>
                  <ChonDiaDiem dl={dl} tinh={f.ccTinh} xa={f.ccXa} o={o} nhan={nhan}
                    onChange={({ tinh, xa }) => setF((p) => ({ ...p, ccTinh: tinh, ccXa: xa }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={nhan}>Mẻ / nồi</label>
                      <input type="text" maxLength={120} value={f.ccSoMe} onChange={(e) => dat('ccSoMe', e.target.value)}
                        placeholder="Ví dụ: Mẻ 3, nồi số 2" className={o} />
                    </div>
                    <div>
                      <label className={nhan}>Thời gian chưng cất (giờ)</label>
                      <input type="number" step="0.5" min="0.5" max="72" value={f.ccGio} onChange={(e) => dat('ccGio', e.target.value)}
                        placeholder="Ví dụ: 4" className={o} />
                    </div>
                  </div>

                  {loiBuoc2 && <p role="alert" className="text-sm text-rose-700">{loiBuoc2}</p>}
                </div>
              )}

              {buoc === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className={nhan}>Hàm lượng 1,8-Cineole (%) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F6357] font-bold text-sm">%</span>
                      <input
                        type="number" step="0.01" min="0" max="100" value={f.cineole}
                        onChange={(e) => dat('cineole', e.target.value)} placeholder="Ví dụ: 71.05"
                        className={`${o} font-mono font-bold`}
                      />
                    </div>
                    {cineoleSo !== null && Number.isFinite(cineoleSo) && (
                      <div className="mt-2">
                        {cineoleSo >= 60 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#135E3E] border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} /> Từ 60% trở lên
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-[#B45309] border border-amber-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            <AlertTriangle size={12} /> Dưới 60%
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-[#4F6357] mt-1.5 ml-1">
                      Nhập đúng số ghi trên phiếu kiểm nghiệm. Ngưỡng 60% chỉ là mốc tham khảo, hệ thống không chặn.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={nhan}>Số phiếu COA <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <FileCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6357]/60" />
                        <input
                          type="text" value={f.soPhieuCoa} onChange={(e) => dat('soPhieuCoa', e.target.value)}
                          placeholder="Ví dụ: COA-2026-8821" className={`${o} pl-11 font-mono`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={nhan}>Đơn vị kiểm nghiệm <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6357]/60" />
                        <input
                          type="text" value={f.donViKiemNghiem} onChange={(e) => dat('donViKiemNghiem', e.target.value)}
                          placeholder="Tên phòng kiểm nghiệm" className={`${o} pl-11`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={nhan}>Ảnh phiếu kiểm nghiệm <span className="text-rose-500">*</span></label>
                    {f.anhCoa ? (
                      <div className="border border-emerald-900/15 rounded-2xl p-3 bg-emerald-50/50 flex items-center gap-4">
                        <img src={f.anhCoa} alt="Phiếu kiểm nghiệm" className="h-24 w-auto rounded-lg border border-emerald-900/10 bg-white" />
                        <div className="text-xs text-[#4F6357] flex-1">
                          Đã nén còn khoảng {Math.round(f.anhCoa.length / 1024)} KB.
                          Người mua sẽ xem được ảnh này khi quét tem.
                        </div>
                        <button type="button" onClick={() => dat('anhCoa', null)} className="text-xs text-[#991B1B] font-bold hover:underline px-2">Xóa</button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-emerald-900/20 rounded-2xl p-6 text-center hover:border-[#135E3E] hover:bg-emerald-50/30 cursor-pointer bg-white">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chonAnh} className="hidden" />
                        <p className="text-sm font-semibold">Chọn ảnh chụp hoặc scan phiếu (JPG, PNG)</p>
                        <p className="text-xs text-[#4F6357] mt-1">Ảnh được tự nén nhỏ trước khi gửi. Phiếu PDF cần chụp hoặc xuất thành ảnh.</p>
                      </label>
                    )}
                    {loiAnh && <p role="alert" className="text-xs text-rose-700 mt-2 ml-1">{loiAnh}</p>}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                    <strong>Ảnh phiếu là bắt buộc</strong>: không có ảnh thì không tạo được lô.
                    Số phiếu, đơn vị và hàm lượng do cơ sở tự khai; hệ thống chưa đối chiếu với phòng kiểm nghiệm.
                    Người mua sẽ thấy rõ điều này trên trang hồ sơ.
                  </div>
                </div>
              )}

              {buoc === 4 && (
                <div className="space-y-6">
                  <p className="text-xs text-[#4F6357] bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
                    Không bắt buộc. Nơi đóng chai có thể khác nơi chưng cất. Đây là chặng 4 của trang hành trình.
                  </p>
                  <div>
                    <label className={nhan}>Nơi đóng chai</label>
                    <input type="text" maxLength={120} value={f.dcNoi} onChange={(e) => dat('dcNoi', e.target.value)}
                      placeholder="Tên cơ sở đóng chai" className={o} />
                  </div>
                  <ChonDiaDiem dl={dl} tinh={f.dcTinh} xa={f.dcXa} o={o} nhan={nhan}
                    onChange={({ tinh, xa }) => setF((p) => ({ ...p, dcTinh: tinh, dcXa: xa }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={nhan}>Ngày đóng chai</label>
                      <input type="date" max={homNay} value={f.dcNgay} onChange={(e) => dat('dcNgay', e.target.value)} className={o} />
                    </div>
                    <div>
                      <label className={nhan}>Quy cách (ml)</label>
                      <input type="number" step="1" min="1" max="5000" value={f.dcMl} onChange={(e) => dat('dcMl', e.target.value)}
                        placeholder="Ví dụ: 50" className={o} />
                    </div>
                    <div>
                      <label className={nhan}>Số chai</label>
                      <input type="number" step="1" min="1" value={f.dcSoChai} onChange={(e) => dat('dcSoChai', e.target.value)}
                        placeholder="Ví dụ: 300" className={o} />
                    </div>
                  </div>
                  {loiBuoc4 && <p role="alert" className="text-sm text-rose-700">{loiBuoc4}</p>}
                </div>
              )}

              {buoc === 5 && (
                <div className="space-y-5">
                  <p className="text-sm text-[#4F6357]">Kiểm tra lại trước khi tạo. Lô đã tạo có thể sửa khi còn ở trạng thái nháp, nhưng không đổi được mã lô.</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ['Mã lô', maLoChuan],
                      ['Dòng sản phẩm', f.tenDongSp],
                      ['Ngày chưng cất', f.ngayChungCat],
                      ['1,8-Cineole', `${cineoleSo} %`],
                      ['Số phiếu COA', f.soPhieuCoa.trim()],
                      ['Đơn vị kiểm nghiệm', f.donViKiemNghiem.trim()],
                      ['Ảnh phiếu', 'Đã đính kèm'],
                      ['Vùng trồng', tenDiaDiem(f.nlTinh, f.nlXa) || 'Chưa khai'],
                      ['Cơ sở chưng cất', [f.ccCoSo.trim(), tenDiaDiem(f.ccTinh, f.ccXa)].filter(Boolean).join(' · ') || 'Chưa khai'],
                      ['Đóng chai', [f.dcNoi.trim(), tenDiaDiem(f.dcTinh, f.dcXa), f.dcMl ? `${f.dcMl} ml` : ''].filter(Boolean).join(' · ') || 'Chưa khai'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k}</dt>
                        <dd className="font-semibold mt-0.5 break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={() => setXemTruoc(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#135E3E]/40 text-[#135E3E] font-bold text-sm px-5 py-3 rounded-xl hover:bg-emerald-50"
                  >
                    <Eye size={16} /> Xem trước hành trình như người mua thấy
                  </button>

                  <div className="bg-emerald-900/5 p-4 rounded-xl border border-emerald-900/10 flex gap-3">
                    <ShieldCheck size={20} className="text-[#135E3E] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#4F6357] leading-relaxed">
                      Tạo lô chưa sinh tem nào. Bước kế tiếp là <strong>sinh mã</strong>: bạn nhập số lượng tem,
                      hệ thống tạo serial và mã bí mật, rồi tải ngay tệp CSV để đưa đi in.
                      Lô chỉ được phát hành khi sinh mã.
                    </p>
                  </div>

                  {loi && (
                    <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm">
                      {loi}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-emerald-900/10 flex flex-col-reverse sm:flex-row justify-between gap-4">
                <button
                  onClick={() => { setLoi(null); setBuoc(buoc - 1); }}
                  disabled={dangGui}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${buoc > 1 ? 'bg-slate-100 text-[#4F6357] hover:bg-slate-200' : 'invisible'}`}
                >
                  Quay Lại
                </button>

                {buoc < 5 ? (
                  <button
                    onClick={() => setBuoc(buoc + 1)}
                    disabled={(buoc === 1 && !buoc1Dung) || (buoc === 2 && Boolean(loiBuoc2)) || (buoc === 3 && !buoc2Dung) || (buoc === 4 && Boolean(loiBuoc4))}
                    className="bg-[#8C6928] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#7a5a21] text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp Tục
                  </button>
                ) : (
                  <button
                    onClick={gui}
                    disabled={dangGui}
                    className="bg-gradient-to-r from-[#135E3E] to-[#0A3D27] text-white font-bold py-3 px-8 rounded-xl shadow-md text-sm uppercase tracking-wide disabled:opacity-60 disabled:cursor-wait"
                  >
                    {dangGui ? 'Đang tạo lô…' : 'Tạo lô & sang bước sinh mã'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: xem trước */}
          <div className="w-full lg:w-[35%] shrink-0">
            <div className="bg-white/90 border border-emerald-900/10 rounded-3xl p-6 shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-6 border-b border-emerald-900/10 pb-4">
                <FileSignature size={16} className="text-[#8C6928]" />
                <span className="font-mono text-xs text-[#8C6928] font-bold tracking-widest uppercase">Xem trước thông tin lô</span>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Mã lô</p>
                  <p className="font-mono font-bold text-lg bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-200">
                    {maLoChuan || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Dòng sản phẩm</p>
                  <p className="text-sm font-bold text-[#135E3E] leading-snug">{f.tenDongSp}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">1,8-Cineole</p>
                  <div className="flex items-end gap-2">
                    <span className="font-mono text-2xl font-bold text-[#8C6928] leading-none">
                      {cineoleSo !== null && Number.isFinite(cineoleSo) ? cineoleSo.toFixed(2) : '—'}
                    </span>
                    <span className="text-xs font-bold text-[#8C6928] mb-0.5">%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ngày chưng cất</p>
                    <p className="font-mono text-sm font-bold">{f.ngayChungCat || '—'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Phiếu COA</p>
                    <p className="font-mono text-sm font-bold break-all">{f.soPhieuCoa.trim() || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {xemTruoc && (
        <HanhTrinhLo lo={loXemTruoc} xemTruoc onClose={() => setXemTruoc(false)} />
      )}
    </div>
  );
}
