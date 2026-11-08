import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Đơn vị hành chính hiện hành: 34 tỉnh/thành và 3.321 xã/phường/đặc khu theo
 * Nghị quyết 202/2025/QH15 (sau sắp xếp có hiệu lực từ 1/7/2025). Cấp
 * quận/huyện không còn.
 *
 * Máy chủ giữ bản sao riêng để KIỂM TRA mã người dùng gửi lên, không tin giao
 * diện: mã xã phải thuộc đúng tỉnh đã chọn.
 */
const duLieu = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'dvhc.json'), 'utf8')
);

const TINH = new Map(duLieu.t.map(([ma, ten]) => [ma, ten]));
const XA = new Map();   // `${maTinh}:${maXa}` -> tên
for (const [maTinh, ds] of Object.entries(duLieu.x)) {
  for (const [maXa, ten] of ds) XA.set(`${maTinh}:${maXa}`, ten);
}

export const tenTinh = (maTinh) => TINH.get(maTinh) || null;
export const tenXa = (maTinh, maXa) => XA.get(`${maTinh}:${maXa}`) || null;

/** maXa có thể rỗng (người mua chỉ chọn tỉnh). Có thì phải thuộc đúng tỉnh. */
export function khuVucHopLe(maTinh, maXa) {
  if (!TINH.has(maTinh)) return false;
  if (maXa === null || maXa === undefined || maXa === '') return true;
  return XA.has(`${maTinh}:${maXa}`);
}
