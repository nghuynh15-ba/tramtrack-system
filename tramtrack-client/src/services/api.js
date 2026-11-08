/**
 * TramTrack — lớp gọi máy chủ duy nhất của giao diện.
 *
 * Mọi lần giao diện nói chuyện với máy chủ đều đi qua tệp này. Không có
 * fetch nào rải rác trong các màn hình. Lý do: phần dễ sai nhất của việc
 * nối giao diện vào máy chủ không phải là gọi được, mà là PHÂN BIỆT ĐƯỢC
 * "máy chủ nói mã này không hợp lệ" với "không hỏi được máy chủ".
 *
 * Trộn hai thứ đó lại là lỗi nghiêm trọng: người mua đứng ở quầy, mạng 3G
 * rớt, giao diện báo đỏ "không xác thực được" — họ bỏ lại một chai thật.
 * Hoặc ngược lại, lỗi mạng bị bỏ qua và giao diện mặc định báo xanh — một
 * chai giả được xác nhận là thật. Cả hai đều do cùng một chỗ lỏng.
 *
 * Nên ở đây có hai lớp lỗi riêng, và màn hình buộc phải xử lý riêng:
 *   LoiKetNoi  — chưa hỏi được máy chủ. KHÔNG được vẽ phán quyết nào.
 *   LoiMayChu  — hỏi được nhưng máy chủ trả mã lỗi. Cũng không phải phán quyết.
 *
 * Chỉ khi hàm trả về bình thường thì trong đó mới có `ket_qua` — và đó là
 * phán quyết duy nhất giao diện được phép hiển thị.
 */

/**
 * Để trống thì gọi đường dẫn tương đối (/api/v1/...) và Vite chuyển tiếp
 * sang cổng 3000 — xem server.proxy trong vite.config.js.
 *
 * Cách này được chọn thay vì ghi thẳng http://localhost:3000 vì hai lẽ:
 *   1. Cùng gốc nên không vướng CORS, không có yêu cầu preflight.
 *   2. Điện thoại trong cùng wifi mở http://192.168.x.x:5173 là gọi được
 *      ngay, không phải sửa lại địa chỉ máy chủ cho từng máy.
 * Khi triển khai thật thì đặt VITE_API_URL trỏ tới tên miền của API.
 */
const GOC = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/** Quá thời gian này coi như không hỏi được. 3G ở chợ chậm, nhưng không chậm thế. */
const CHO_TOI_DA_MS = 12000;

export class LoiKetNoi extends Error {
  constructor(thongDiep, quaThoiGian = false) {
    super(thongDiep);
    this.name = 'LoiKetNoi';
    this.quaThoiGian = quaThoiGian;
  }
}

export class LoiMayChu extends Error {
  constructor(thongDiep, maTrangThai) {
    super(thongDiep);
    this.name = 'LoiMayChu';
    this.maTrangThai = maTrangThai;
  }
}

/** Phân biệt được lỗi "chưa hỏi được" với mọi lỗi khác, dùng ở màn hình. */
export function laLoiKetNoi(e) {
  return e instanceof LoiKetNoi;
}

async function goi(duongDan, tuyChon = {}) {
  // choToiDaMs tách riêng khỏi phần còn lại: nó là tuỳ chọn của hàm này,
  // không phải của fetch. Sinh mã cần hạn rộng hơn nhiều vì mỗi con tem tốn
  // một phép băm Argon2id — 5000 tem mất khoảng 55 giây.
  const { choToiDaMs = CHO_TOI_DA_MS, ...conLai } = tuyChon;

  const dieuKhien = new AbortController();
  let quaThoiGian = false;
  const dongHo = setTimeout(() => {
    quaThoiGian = true;
    dieuKhien.abort();
  }, choToiDaMs);

  let phanHoi;
  try {
    phanHoi = await fetch(`${GOC}/api/v1${duongDan}`, {
      ...conLai,
      signal: dieuKhien.signal,
      // Chỉ khai Content-Type khi thực sự có thân yêu cầu. Khai ở GET sẽ
      // bắt trình duyệt gửi thêm một yêu cầu preflight khi khác gốc.
      headers: conLai.body
        ? { 'Content-Type': 'application/json', ...(conLai.headers || {}) }
        : conLai.headers,
    });
  } catch {
    throw new LoiKetNoi(
      quaThoiGian ? 'Máy chủ không trả lời kịp' : 'Không nối được tới máy chủ',
      quaThoiGian
    );
  } finally {
    clearTimeout(dongHo);
  }

  let duLieu = null;
  try {
    duLieu = await phanHoi.json();
  } catch {
    // Không phải JSON — để duLieu là null và xử lý ở dưới.
  }

  if (!phanHoi.ok) {
    // 5xx thường không phải lỗi của người dùng mà là máy chủ chưa sẵn sàng:
    // `node --watch` khởi động lại mỗi khi tệp máy chủ đổi, và yêu cầu rơi
    // đúng vào khoảng đó sẽ bị Vite trả 500 vì không nối được cổng 3000.
    // Câu "Máy chủ trả mã 500" không nói được điều đó.
    if (phanHoi.status >= 500) {
      throw new LoiMayChu(
        'Máy chủ chưa sẵn sàng — có thể đang khởi động lại. Chờ vài giây rồi thử lại.',
        phanHoi.status
      );
    }
    throw new LoiMayChu(
      duLieu?.loi || `Máy chủ trả mã ${phanHoi.status}`,
      phanHoi.status
    );
  }
  if (duLieu === null) {
    throw new LoiMayChu('Máy chủ trả dữ liệu không đọc được', phanHoi.status);
  }
  return duLieu;
}

/**
 * TẦNG 1 — tra cứu khi tem còn nguyên, chưa cào.
 * GET /api/v1/s/:serial
 *
 * ket_qua: TIM_THAY | KHONG_TIM_THAY | DA_THU_HOI
 */
export function traCuuTang1(serial) {
  return goi(`/s/${encodeURIComponent(serial)}`);
}

/**
 * TẦNG 2 — kích hoạt sau khi cào lớp phủ.
 * POST /api/v1/a/:serial   thân: { ma }
 *
 * ket_qua: HOP_LE | CANH_BAO | DA_THU_HOI | BI_KHOA | KHONG_XAC_THUC_DUOC
 *
 * Mã bí mật đi trong THÂN yêu cầu, không bao giờ trong đường dẫn: đường dẫn
 * nằm lại trong lịch sử trình duyệt và trong log của mọi proxy trên đường đi.
 */
export function kichHoatTang2(serial, ma) {
  return goi(`/a/${encodeURIComponent(serial)}`, {
    method: 'POST',
    body: JSON.stringify({ ma }),
  });
}

/**
 * Người tiêu dùng gửi báo cáo nghi ngờ. Không cần đăng nhập.
 * POST /api/v1/bao-cao
 */
export function guiBaoCao({ serial, ly_do, noi_dung, noi_mua, lien_he, anh_bang_chung }) {
  return goi('/bao-cao', {
    method: 'POST',
    body: JSON.stringify({ serial, ly_do, noi_dung, noi_mua, lien_he, anh_bang_chung }),
    // Có ảnh thì yêu cầu nặng hơn nhiều so với một đoạn chữ, mạng 3G cần thêm thời gian.
    choToiDaMs: 60000,
  });
}

/**
 * Người mua tự khai khu vực sau khi kích hoạt (tùy chọn).
 * PUT /api/v1/a/:serial/khu-vuc   thân: { dau, ma_tinh, ma_xa }
 * `dau` do máy chủ phát trong câu trả lời HỢP LỆ.
 */
export function guiKhuVuc(serial, dau, maTinh, maXa) {
  return goi(`/a/${encodeURIComponent(serial)}/khu-vuc`, {
    method: 'PUT',
    body: JSON.stringify({ dau, ma_tinh: maTinh, ma_xa: maXa || null }),
  });
}

/** Dùng ở màn mất kết nối để biết máy chủ đã sống lại chưa. */
export function kiemTraMayChu() {
  return goi('/health');
}

/* ══════════════════════ Phiếu đăng nhập ══════════════════════ */

/**
 * Dùng sessionStorage, không localStorage: đóng tab là hết phiên.
 *
 * Phiếu này mở được toàn bộ dữ liệu của một cơ sở — danh sách lô, danh sách
 * tem, báo cáo của người tiêu dùng. Để nó sống qua phiên làm việc trên một
 * máy dùng chung là rủi ro không cần thiết, nhất là máy ở xưởng.
 */
const KHOA_PHIEU = 'tramtrack_phieu';
const KHOA_NGUOI = 'tramtrack_nguoi';

export function luuPhieu(phieu, nguoi) {
  try {
    sessionStorage.setItem(KHOA_PHIEU, phieu);
    sessionStorage.setItem(KHOA_NGUOI, JSON.stringify(nguoi));
  } catch {
    // Chế độ ẩn danh hoặc trình duyệt chặn lưu trữ. Phiên vẫn chạy được
    // trong bộ nhớ cho tới khi tải lại trang.
  }
}

export function layPhieu() {
  try {
    return sessionStorage.getItem(KHOA_PHIEU);
  } catch {
    return null;
  }
}

export function layNguoi() {
  try {
    const s = sessionStorage.getItem(KHOA_NGUOI);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function xoaPhieu() {
  try {
    sessionStorage.removeItem(KHOA_PHIEU);
    sessionStorage.removeItem(KHOA_NGUOI);
  } catch {
    // Không xoá được thì cũng không làm gì hơn được.
  }
}

/** Phiên hết hạn hoặc chưa đăng nhập — màn hình phải đưa về màn đăng nhập. */
export class LoiHetPhien extends Error {
  constructor(thongDiep) {
    super(thongDiep);
    this.name = 'LoiHetPhien';
  }
}

/**
 * Vai trò không đủ quyền. KHÁC hẳn hết phiên: đăng nhập lại cũng không làm
 * vai trò đổi, nên màn hình phải giải thích chứ không đưa về đăng nhập.
 */
export class LoiKhongDuQuyen extends Error {
  constructor(thongDiep, canVaiTro) {
    super(thongDiep);
    this.name = 'LoiKhongDuQuyen';
    this.canVaiTro = canVaiTro;
  }
}

export function laLoiHetPhien(e) {
  return e instanceof LoiHetPhien;
}

/**
 * Gọi điểm cuối quản trị. Tự gắn phiếu và dịch hai mã lỗi thành lớp lỗi
 * riêng, để màn hình phân biệt được "hết phiên" với "không đủ quyền".
 */
async function goiQT(duongDan, tuyChon = {}) {
  const phieu = layPhieu();
  if (!phieu) throw new LoiHetPhien('Chưa đăng nhập');

  try {
    return await goi(`/qt${duongDan}`, {
      ...tuyChon,
      headers: { Authorization: `Bearer ${phieu}`, ...(tuyChon.headers || {}) },
    });
  } catch (e) {
    if (e instanceof LoiMayChu && e.maTrangThai === 401) {
      xoaPhieu();
      throw new LoiHetPhien('Phiên đã hết hạn, hãy đăng nhập lại');
    }
    if (e instanceof LoiMayChu && e.maTrangThai === 403) {
      throw new LoiKhongDuQuyen(e.message);
    }
    throw e;
  }
}

/* ══════════════════════ Điểm cuối quản trị ══════════════════════ */

/**
 * POST /api/v1/qt/dang-nhap
 *
 * Gọi `goi` chứ không `goiQT`: lúc đăng nhập thì chưa có phiếu nào để gắn.
 * Tên trường là `mat_khau`, không phải `password` — máy chủ đọc đúng tên đó.
 */
export async function dangNhap(email, matKhau) {
  const kq = await goi('/qt/dang-nhap', {
    method: 'POST',
    body: JSON.stringify({ email, mat_khau: matKhau }),
  });
  luuPhieu(kq.phieu, kq.nguoi);
  return kq.nguoi;
}

const ma = (s) => encodeURIComponent(s);

export const toi       = ()     => goiQT('/toi');
export const dsLo      = ()     => goiQT('/lo');
export const chiTietLo = (maLo) => goiQT(`/lo/${ma(maLo)}`);
export const dsTem     = (maLo) => goiQT(`/lo/${ma(maLo)}/tem`);
export const thongKe   = ()     => goiQT('/thong-ke');

export const taoLo = (lo) =>
  goiQT('/lo', { method: 'POST', body: JSON.stringify(lo) });

export const suaLo = (maLo, lo) =>
  goiQT(`/lo/${ma(maLo)}`, { method: 'PATCH', body: JSON.stringify(lo) });

/**
 * Gắn ảnh phiếu kiểm nghiệm cho lô đã tạo. Chỉ THÊM được, không THAY được:
 * máy chủ từ chối nếu lô đã có ảnh, vì người mua có thể đã xem ảnh cũ.
 */
export const ganAnhPhieu = (maLo, anh) =>
  goiQT(`/lo/${ma(maLo)}/anh-phieu`, {
    method: 'PUT',
    body: JSON.stringify({ anh_phieu_coa: anh }),
  });

export const phatHanhLo = (maLo) =>
  goiQT(`/lo/${ma(maLo)}/phat-hanh`, { method: 'POST' });

export const thuHoiLo = (maLo, lyDo) =>
  goiQT(`/lo/${ma(maLo)}/thu-hoi`, {
    method: 'POST',
    body: JSON.stringify({ ly_do: lyDo }),
  });

/**
 * Sinh mã cho một lô.
 *
 * Hạn chờ 5 phút thay vì 12 giây mặc định. Lý do: mỗi con tem tốn một phép
 * băm Argon2id khoảng 11 ms, nên 5000 tem mất khoảng 55 giây. Nếu yêu cầu bị
 * huỷ giữa đường thì máy chủ vẫn ghi xong tem vào cơ sở dữ liệu nhưng câu trả
 * lời chứa mã bí mật không ai nhận được — cả dải tem đó vĩnh viễn không kích
 * hoạt được, vì cơ sở dữ liệu chỉ giữ bản băm.
 */
export const sinhMa = (maLo, soLuong) =>
  goiQT(`/lo/${ma(maLo)}/sinh-ma`, {
    method: 'POST',
    body: JSON.stringify({ so_luong: soLuong }),
    choToiDaMs: 300000,
  });

export const dsBaoCao = (trangThai) =>
  goiQT(`/bao-cao${trangThai ? `?trang_thai=${ma(trangThai)}` : ''}`);

export const anhBaoCao = (id) => goiQT(`/bao-cao/${id}/anh`);

export const xuLyBaoCao = (id, trangThai, ghiChu) =>
  goiQT(`/bao-cao/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ trang_thai: trangThai, ghi_chu: ghiChu || null }),
  });

export const doiMatKhau = (cu, moi) =>
  goiQT('/doi-mat-khau', {
    method: 'POST',
    body: JSON.stringify({ mat_khau_cu: cu, mat_khau_moi: moi }),
  });
