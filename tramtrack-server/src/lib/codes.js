import { randomBytes } from 'node:crypto';

/**
 * Bảng chữ 31 ký tự.
 * Đã bỏ 0 1 O I L để người nhập tay không nhầm lẫn.
 * 31^12 ≈ 7,87 × 10^17 ≈ 2^59,4 — con số này đưa vào Chương 5 của quyển.
 */
export const BANG_CHU = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const DO_DAI_MA = 12;

if (BANG_CHU.length !== 31) {
  throw new Error('Bảng chữ phải có đúng 31 ký tự');
}

/**
 * Sinh mã bí mật bằng bộ sinh ngẫu nhiên an toàn.
 *
 * Dùng lấy mẫu có loại bỏ (rejection sampling) thay vì phép chia lấy dư,
 * vì 256 không chia hết cho 31: byte từ 248 trở lên bị loại.
 * Nếu dùng `byte % 31` thì các ký tự đầu bảng sẽ xuất hiện nhiều hơn,
 * làm giảm entropy thật so với con số công bố.
 */
export function sinhMaBiMat(doDai = DO_DAI_MA) {
  const n = BANG_CHU.length;        // 31
  const nguong = 256 - (256 % n);   // 248
  let ma = '';

  while (ma.length < doDai) {
    const bytes = randomBytes(doDai * 2);
    for (const b of bytes) {
      if (b >= nguong) continue;    // loại bỏ để không lệch phân phối
      ma += BANG_CHU[b % n];
      if (ma.length === doDai) break;
    }
  }
  return ma;
}

/** Chia mã thành ba nhóm bốn ký tự để in lên tem: 7KQM-R4XH-P9TW */
export function dinhDangMa(ma) {
  return (ma.match(/.{1,4}/g) || []).join('-');
}

/** Bỏ dấu gạch, khoảng trắng và viết hoa — dùng khi người dùng nhập tay */
export function chuanHoaMa(nhapVao) {
  return String(nhapVao || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Mã hợp lệ về mặt hình thức: đúng độ dài và chỉ gồm ký tự trong bảng */
export function maDungDinhDang(ma) {
  if (typeof ma !== 'string' || ma.length !== DO_DAI_MA) return false;
  for (const c of ma) if (!BANG_CHU.includes(c)) return false;
  return true;
}

/** Serial công khai in ngoài vỏ: TDT-2026-000001 */
export function taoSerial(nam, soThuTu) {
  return `TDT-${nam}-${String(soThuTu).padStart(6, '0')}`;
}

export function serialDungDinhDang(s) {
  return /^TDT-\d{4}-\d{6}$/.test(String(s || '').toUpperCase());
}
