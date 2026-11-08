/**
 * Chuẩn hoá và kiểm tra hình thức serial / mã bí mật ở phía giao diện.
 *
 * Đây là BẢN SAO của src/lib/codes.js phía máy chủ. Hai bản phải khớp nhau,
 * và nếu sửa bảng chữ hay độ dài mã thì phải sửa cả hai.
 *
 * Việc kiểm tra ở đây KHÔNG phải để bảo mật — người ta sửa được mọi thứ chạy
 * trong trình duyệt. Máy chủ vẫn kiểm tra lại y nguyên. Mục đích duy nhất là
 * để người gõ sai một ký tự biết ngay tại chỗ, thay vì phải chờ một lượt gọi
 * mạng rồi nhận về câu trả lời cố ý mơ hồ "không xác thực được".
 */

/** 31 ký tự, đã bỏ 0 1 O I L để người nhập tay không nhầm. */
export const BANG_CHU = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const DO_DAI_MA = 12;

/** Bỏ gạch, khoảng trắng, viết hoa — dùng ngay khi người dùng gõ. */
export function chuanHoaMa(nhapVao) {
  return String(nhapVao || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Đúng độ dài và chỉ gồm ký tự trong bảng. */
export function maDungDinhDang(ma) {
  if (typeof ma !== 'string' || ma.length !== DO_DAI_MA) return false;
  for (const c of ma) if (!BANG_CHU.includes(c)) return false;
  return true;
}

/**
 * Ký tự không nằm trong bảng chữ — dùng để nhắc đúng chỗ sai.
 * Hay gặp nhất: người dùng gõ O thay vì 0, hoặc I thay vì 1, mà tem thì
 * không bao giờ in năm ký tự đó.
 */
export function kyTuLa(ma) {
  const la = [];
  for (const c of chuanHoaMa(ma)) {
    if (!BANG_CHU.includes(c) && !la.includes(c)) la.push(c);
  }
  return la;
}

/** Chia thành ba nhóm bốn ký tự để hiện giống hệt chữ in trên tem. */
export function dinhDangMa(ma) {
  return (chuanHoaMa(ma).match(/.{1,4}/g) || []).join('-');
}

export function serialDungDinhDang(s) {
  return /^TDT-\d{4}-\d{6}$/.test(String(s || '').toUpperCase());
}

/** Chuẩn hoá serial người dùng gõ tay: viết hoa, bỏ khoảng trắng. */
export function chuanHoaSerial(nhapVao) {
  return String(nhapVao || '').toUpperCase().replace(/\s+/g, '');
}

/**
 * Lấy serial ra từ chuỗi mà máy quét đọc được.
 *
 * Mã QR trên tem không chứa serial trần mà chứa cả đường dẫn, dạng
 *   https://<tên miền>/s/TDT-2026-000001
 * vì như vậy người dùng chụp bằng camera mặc định của điện thoại là mở được
 * ngay, không cần cài gì. Máy quét trong ứng dụng thì nhận về đúng chuỗi đó,
 * nên phải tách serial ra.
 *
 * Trả về null khi chuỗi quét được không chứa serial nào — ví dụ người dùng
 * quét một mã QR bất kỳ. Khi đó màn hình hiện lại chuỗi đã quét để họ hiểu
 * mình vừa quét nhầm thứ gì, chứ không báo "hàng giả".
 */
export function serialTuChuoiQuet(chuoi) {
  const khop = String(chuoi || '').match(/TDT-\d{4}-\d{6}/i);
  return khop ? khop[0].toUpperCase() : null;
}

/** Cắt bớt chuỗi quét được trước khi hiện lên màn hình. */
export function catNgan(chuoi, toiDa = 72) {
  const s = String(chuoi || '').trim();
  return s.length > toiDa ? `${s.slice(0, toiDa)}…` : s;
}

/** Giờ Việt Nam, dạng 09:14:32 — 12/08/2026. Nhận chuỗi ISO từ máy chủ. */
export function gioVietNam(isoHoacNull) {
  if (!isoHoacNull) return null;
  const d = new Date(isoHoacNull);
  if (Number.isNaN(d.getTime())) return null;
  const gio = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const ngay = d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  return `${gio} — ${ngay}`;
}

/** Ngày không kèm giờ, dùng cho ngày chưng cất. */
export function ngayVietNam(isoHoacNull) {
  if (!isoHoacNull) return null;
  const d = new Date(isoHoacNull);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}
