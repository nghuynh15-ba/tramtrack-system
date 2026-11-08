import { khuVucHopLe, tenTinh, tenXa } from './dvhc.js';

/**
 * Hành trình của lô: ba chặng do cơ sở tự khai (nguyên liệu, chưng cất, đóng chai).
 * Chặng kiểm nghiệm lấy từ các cột sẵn có của lô nên không nằm ở đây.
 *
 * Mọi trường đều tùy chọn. Trường nào trống thì người mua thấy "Cơ sở chưa cung cấp",
 * hệ thống không tự điền thay. Địa điểm của từng chặng được chọn riêng, không lấy
 * từ địa chỉ đăng ký của cơ sở.
 *
 * Trả về { loi } nếu đầu vào sai, hoặc { gia_tri } (null nếu không có gì để lưu).
 */

const CHANG = {
  nguyen_lieu: { chu: ['don_vi_cung_ung'], ngay: ['ngay_thu_hai'], so: {}, diaDiem: true },
  chung_cat:   { chu: ['co_so', 'so_me'], ngay: [], so: { gio_chung_cat: [0.5, 72, false] }, diaDiem: true },
  dong_chai:   { chu: ['noi'], ngay: ['ngay_dong_chai'], so: { quy_cach_ml: [1, 5000, true], so_chai: [1, 1000000, true] }, diaDiem: true },
};
const NHAN = {
  don_vi_cung_ung: 'Đơn vị cung ứng', co_so: 'Cơ sở chưng cất', so_me: 'Số mẻ/nồi', noi: 'Nơi đóng chai',
  ngay_thu_hai: 'Ngày thu hái', ngay_dong_chai: 'Ngày đóng chai',
  gio_chung_cat: 'Thời gian chưng cất', quy_cach_ml: 'Quy cách chai', so_chai: 'Số chai',
};
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const ngayHopLe = (s) => NGAY.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const homNay = () => new Date().toISOString().slice(0, 10);

export function lamSachHanhTrinh(vao, ngayChungCat) {
  if (vao === undefined || vao === null) return { gia_tri: null };
  if (typeof vao !== 'object' || Array.isArray(vao)) return { loi: 'Hành trình không đúng định dạng' };

  const ra = {};
  for (const [ten, cfg] of Object.entries(CHANG)) {
    const c = vao[ten];
    if (c === undefined || c === null) continue;
    if (typeof c !== 'object' || Array.isArray(c)) return { loi: 'Dữ liệu chặng không đúng định dạng' };
    const o = {};

    for (const k of cfg.chu) {
      const v = String(c[k] ?? '').trim();
      if (!v) continue;
      if (v.length > 120) return { loi: `${NHAN[k]} quá dài (tối đa 120 ký tự)` };
      o[k] = v;
    }
    for (const k of cfg.ngay) {
      const v = String(c[k] ?? '').trim();
      if (!v) continue;
      if (!ngayHopLe(v)) return { loi: `${NHAN[k]} không hợp lệ` };
      if (v > homNay()) return { loi: `${NHAN[k]} không được ở tương lai` };
      o[k] = v;
    }
    for (const [k, [min, max, nguyen]] of Object.entries(cfg.so)) {
      if (c[k] === undefined || c[k] === null || c[k] === '') continue;
      const n = Number(c[k]);
      if (!Number.isFinite(n) || n < min || n > max || (nguyen && !Number.isInteger(n))) {
        return { loi: `${NHAN[k]} phải từ ${min} đến ${max}${nguyen ? ' (số nguyên)' : ''}` };
      }
      o[k] = n;
    }
    if (cfg.diaDiem) {
      const mt = String(c.ma_tinh ?? '');
      const mx = c.ma_xa ? String(c.ma_xa) : null;
      if (mt) {
        if (!khuVucHopLe(mt, mx)) return { loi: 'Tỉnh hoặc xã/phường không hợp lệ' };
        o.ma_tinh = mt;
        if (mx) o.ma_xa = mx;
      }
    }
    if (Object.keys(o).length) ra[ten] = o;
  }

  // Thứ tự thời gian: thu hái ≤ chưng cất ≤ đóng chai (chỉ kiểm khi có đủ hai ngày).
  const thu = ra.nguyen_lieu?.ngay_thu_hai;
  const cat = ngayChungCat ? String(ngayChungCat).slice(0, 10) : null;
  const chai = ra.dong_chai?.ngay_dong_chai;
  if (thu && cat && thu > cat) return { loi: 'Ngày thu hái phải trước hoặc cùng ngày chưng cất' };
  if (cat && chai && chai < cat) return { loi: 'Ngày đóng chai phải sau hoặc cùng ngày chưng cất' };
  if (thu && chai && thu > chai) return { loi: 'Ngày thu hái phải trước ngày đóng chai' };

  return { gia_tri: Object.keys(ra).length ? ra : null };
}

/** Thêm tên tỉnh/xã để giao diện không cần tải danh sách hành chính. */
export function hanhTrinhCongKhai(ht) {
  if (!ht || typeof ht !== 'object') return null;
  const ra = {};
  for (const [ten, c] of Object.entries(ht)) {
    const o = { ...c };
    if (c.ma_tinh) {
      o.ten_tinh = tenTinh(c.ma_tinh);
      o.ten_xa = c.ma_xa ? tenXa(c.ma_tinh, c.ma_xa) : null;
    }
    ra[ten] = o;
  }
  return ra;
}
