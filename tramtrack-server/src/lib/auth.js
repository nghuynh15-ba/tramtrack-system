import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Phiếu đăng nhập ký bằng HMAC-SHA256.
 *
 * Cố ý KHÔNG dùng thư viện JWT. Toàn bộ cơ chế gói trong bốn chục dòng dưới
 * đây, đọc hiểu và giải thích được khi bảo vệ — mà công năng thì đúng bằng
 * thứ mình cần: một chuỗi khách giữ, máy chủ xác minh được là do mình phát,
 * và hết hạn sau một khoảng.
 *
 * Dạng phiếu:  <thân mã base64url>.<chữ ký base64url>
 * Thân mã:     JSON { id, co_so_id, vai_tro, het_han }
 *
 * Phiếu KHÔNG mã hoá — ai cầm cũng đọc được nội dung. Nên không bao giờ
 * đặt thứ bí mật vào đây. Chữ ký chỉ bảo đảm nội dung không bị sửa.
 */

const KHOA = process.env.TOKEN_SECRET || '';
const HAN_GIO = Number(process.env.TOKEN_HAN_GIO || 12);

if (!KHOA || KHOA.length < 32) {
  console.error(
    'Thiếu TOKEN_SECRET trong .env, hoặc chuỗi ngắn hơn 32 ký tự.\n' +
    'Sinh một chuỗi ngẫu nhiên bằng lệnh:\n' +
    "  node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\""
  );
  process.exit(1);
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function ky(than) {
  return createHmac('sha256', KHOA).update(than).digest('base64url');
}

export function taoPhieu({ id, co_so_id, vai_tro }) {
  const het_han = Date.now() + HAN_GIO * 3600_000;
  const than = b64(JSON.stringify({ id, co_so_id, vai_tro, het_han }));
  return `${than}.${ky(than)}`;
}

/** Trả về nội dung phiếu nếu hợp lệ, null nếu sai chữ ký hoặc đã hết hạn */
export function docPhieu(phieu) {
  if (typeof phieu !== 'string' || !phieu.includes('.')) return null;
  const [than, chuKy] = phieu.split('.');
  if (!than || !chuKy) return null;

  // So sánh chữ ký theo thời gian hằng định, không dùng dấu bằng thường:
  // so sánh chuỗi bình thường dừng ngay ở ký tự đầu khác nhau, nên đo thời
  // gian là dò dần ra được chữ ký đúng.
  const dung = ky(than);
  const a = Buffer.from(chuKy), b = Buffer.from(dung);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const noi_dung = JSON.parse(Buffer.from(than, 'base64url').toString('utf8'));
    if (!noi_dung.het_han || Date.now() > noi_dung.het_han) return null;
    return noi_dung;
  } catch {
    return null;
  }
}

/** Dùng cho script tạo người dùng */
export function sinhKhoaNgauNhien() {
  return randomBytes(48).toString('base64url');
}

/**
 * Dấu xác nhận quyền ghi khu vực cho MỘT tem vừa kích hoạt.
 *
 * Máy chủ phát dấu này trong câu trả lời HỢP LỆ, và chỉ người vừa nhập đúng mã
 * mới có nó. Người khác biết serial cũng không ghi được khu vực cho tem đó.
 * Không lưu gì xuống cơ sở dữ liệu: tính lại từ serial và thời điểm kích hoạt.
 */
export function kyKhuVuc(serial, kichHoatLuc) {
  const luc = new Date(kichHoatLuc).toISOString();
  return ky(`khu-vuc|${serial}|${luc}`);
}

export function dungDauKhuVuc(dau, serial, kichHoatLuc) {
  if (typeof dau !== 'string') return false;
  const dung = kyKhuVuc(serial, kichHoatLuc);
  const x = Buffer.from(dau), y = Buffer.from(dung);
  return x.length === y.length && timingSafeEqual(x, y);
}
