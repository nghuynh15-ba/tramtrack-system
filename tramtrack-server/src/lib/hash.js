import { hash, verify, Algorithm } from '@node-rs/argon2';

/**
 * Tham số Argon2id.
 *
 * memoryCost 19456 KiB ≈ 19 MiB, timeCost 2, parallelism 1 — đây là mức
 * khuyến nghị hiện hành cho Argon2id. Con số 19 MiB là thứ đưa vào quyển:
 * kẻ tấn công muốn dò mã phải trả 19 MiB bộ nhớ cho MỖI lần thử, nên không
 * dò song song hàng loạt bằng card đồ hoạ được.
 *
 * Muối sinh ngẫu nhiên riêng cho từng tem và nằm sẵn trong chuỗi băm trả về,
 * nên không cần cột muối riêng trong cơ sở dữ liệu.
 */
export const THAM_SO = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function bamMa(maTho) {
  return hash(maTho, THAM_SO);
}

export async function doiChieuMa(maTho, chuoiBam) {
  try {
    return await verify(chuoiBam, maTho, THAM_SO);
  } catch {
    return false;
  }
}

/**
 * Băm giả dùng để làm phẳng thời gian phản hồi.
 *
 * Khi serial không tồn tại, nếu trả lời ngay lập tức thì kẻ dò mã đo thời gian
 * là biết serial nào có thật — rồi tập trung dò mã bí mật của đúng serial đó.
 * Vì vậy trường hợp không tìm thấy vẫn chạy một phép đối chiếu Argon2id giả
 * để tốn xấp xỉ cùng thời lượng.
 */
let bamGia = null;

export async function khoiDongBamGia() {
  if (!bamGia) bamGia = await hash('KHONGTONTAI00', THAM_SO);
  return bamGia;
}

export async function tieuTonThoiGianTuongDuong() {
  const h = await khoiDongBamGia();
  await verify(h, 'SAI000000000', THAM_SO).catch(() => false);
}

/** Đo thời gian băm một lần — số liệu này đưa vào Chương 5 */
export async function doThoiGianBam() {
  const t0 = process.hrtime.bigint();
  await bamMa('DOTHOIGIAN12');
  const t1 = process.hrtime.bigint();
  return Number(t1 - t0) / 1e6; // mili giây
}
