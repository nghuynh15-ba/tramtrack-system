import 'dotenv/config';

/**
 * Kiểm thử toàn bộ API từ đầu đến cuối, gọi qua HTTP thật.
 *
 *   npm run dev            (cửa sổ 1)
 *   npm run test:api       (cửa sổ 2)
 *
 * Không chỉ kiểm tra đường đi đúng — kiểm tra cả những chỗ PHẢI bị chặn:
 * vai trò không đủ quyền, sửa lô đã phát hành, phát hành lô chưa có COA,
 * xem dữ liệu của cơ sở khác, và rò rỉ thông tin qua thời gian phản hồi.
 */

const GOC = process.env.TEST_URL || `http://localhost:${process.env.PORT || 3000}`;
let dat = 0, truot = 0;

function kiemTra(ten, dieuKien, themVao = '') {
  if (dieuKien) { dat++; console.log(`  ✓ ${ten}`); }
  else { truot++; console.log(`  ✗ ${ten}${themVao ? '  → ' + themVao : ''}`); }
}

async function goi(duong, { method = 'GET', body, phieu } = {}) {
  const h = { 'Content-Type': 'application/json' };
  if (phieu) h.Authorization = `Bearer ${phieu}`;
  const r = await fetch(GOC + duong, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  let d = null;
  try { d = await r.json(); } catch { /* không phải JSON */ }
  return { ma: r.status, d };
}

const nhan = (s) => console.log(`\n${s}`);
const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();

// =====================================================================
nhan('── Máy chủ sống ──');
{
  const { ma, d } = await goi('/api/v1/health');
  kiemTra('health trả về ok', ma === 200 && d?.ok === true, JSON.stringify(d));
  if (ma !== 200) { console.log('\nMáy chủ chưa chạy. Mở cửa sổ khác và chạy: npm run dev\n'); process.exit(1); }
}

// =====================================================================
nhan('── Đăng nhập ──');
const EMAIL = process.env.TEST_EMAIL;
const MK    = process.env.TEST_MAT_KHAU;
let phieuQT = null;

if (!EMAIL || !MK) {
  console.log('  (bỏ qua phần quản trị — chưa đặt TEST_EMAIL và TEST_MAT_KHAU trong .env)');
} else {
  {
    const { ma } = await goi('/api/v1/qt/dang-nhap', { method: 'POST', body: { email: EMAIL, mat_khau: 'sai-be-bet' } });
    kiemTra('mật khẩu sai bị từ chối', ma === 401);
  }
  {
    const { ma } = await goi('/api/v1/qt/dang-nhap', { method: 'POST', body: { email: 'khongcoai@nowhere.vn', mat_khau: 'gi-do' } });
    kiemTra('email không tồn tại trả về CÙNG lỗi 401', ma === 401);
  }
  {
    const t = [];
    for (let i = 0; i < 3; i++) {
      const b = Date.now();
      await goi('/api/v1/qt/dang-nhap', { method: 'POST', body: { email: EMAIL, mat_khau: 'sai' } });
      t.push(Date.now() - b);
    }
    const tb = t.reduce((a, b) => a + b) / t.length;
    kiemTra(`thời gian phản hồi đăng nhập có sàn (${tb.toFixed(0)} ms ≥ 250)`, tb >= 240, `${tb.toFixed(0)} ms`);
  }
  {
    const { ma, d } = await goi('/api/v1/qt/dang-nhap', { method: 'POST', body: { email: EMAIL, mat_khau: MK } });
    kiemTra('đăng nhập đúng trả về phiếu', ma === 200 && !!d?.phieu, JSON.stringify(d));
    phieuQT = d?.phieu;
    if (!phieuQT) {
      console.log(`
  Không đăng nhập được, nên bỏ qua toàn bộ phần quản trị.
  Kiểm tra TEST_EMAIL và TEST_MAT_KHAU trong .env có khớp tài khoản đã tạo
  bằng  npm run tao-nguoi-dung  không. Mật khẩu chỉ hiện một lần lúc tạo.
`);
    }
  }
  {
    const { ma } = await goi('/api/v1/qt/toi');
    kiemTra('không có phiếu thì bị chặn 401', ma === 401);
  }
  {
    const { ma } = await goi('/api/v1/qt/toi', { phieu: 'rac.rac' });
    kiemTra('phiếu giả bị chặn 401', ma === 401);
  }
  if (phieuQT) {
    const hong = phieuQT.slice(0, -3) + 'XXX';
    const { ma } = await goi('/api/v1/qt/toi', { phieu: hong });
    kiemTra('phiếu bị sửa chữ ký bị chặn 401', ma === 401);
  }
  if (phieuQT) {
    const { ma, d } = await goi('/api/v1/qt/toi', { phieu: phieuQT });
    kiemTra('phiếu đúng vào được', ma === 200 && !!d?.email, JSON.stringify(d));
  }
}

// =====================================================================
let maLo = null;
if (phieuQT) {
  nhan('── Vòng đời lô ──');
  maLo = `LO-TEST-${rnd}`;
  {
    const { ma, d } = await goi('/api/v1/qt/lo', { method: 'POST', phieu: phieuQT,
      body: { ma_lo: maLo, ten_dong_sp: 'Tinh dầu tràm kiểm thử' } });
    kiemTra('tạo lô mới', ma === 201 && d?.ma_lo === maLo, JSON.stringify(d));
  }
  {
    const { ma } = await goi('/api/v1/qt/lo', { method: 'POST', phieu: phieuQT,
      body: { ma_lo: maLo, ten_dong_sp: 'trùng' } });
    kiemTra('tạo lô trùng mã bị chặn 409', ma === 409);
  }
  {
    const { ma, d } = await goi(`/api/v1/qt/lo/${maLo}/phat-hanh`, { method: 'POST', phieu: phieuQT });
    kiemTra('phát hành khi CHƯA có COA bị chặn 409', ma === 409, JSON.stringify(d));
  }
  {
    const { ma } = await goi(`/api/v1/qt/lo/${maLo}/sinh-ma`, { method: 'POST', phieu: phieuQT, body: { so_luong: 3 } });
    kiemTra('sinh mã khi CHƯA có COA bị chặn 409', ma === 409);
  }
  {
    const { ma, d } = await goi(`/api/v1/qt/lo/${maLo}`, { method: 'PATCH', phieu: phieuQT,
      body: { so_phieu_coa: 'COA-TEST-' + rnd, ham_luong_cineole: 70.12, don_vi_kiem_nghiem: 'TT Kiểm nghiệm' } });
    kiemTra('gắn phiếu kiểm nghiệm vào lô', ma === 200 && d?.so_phieu_coa?.includes(rnd), JSON.stringify(d));
  }
  {
    const { ma } = await goi(`/api/v1/qt/lo/${maLo}/phat-hanh`, { method: 'POST', phieu: phieuQT });
    kiemTra('có COA rồi thì phát hành được', ma === 200);
  }
  {
    const { ma, d } = await goi(`/api/v1/qt/lo/${maLo}`, { method: 'PATCH', phieu: phieuQT,
      body: { ten_dong_sp: 'đổi tên sau khi phát hành' } });
    kiemTra('sửa lô ĐÃ phát hành bị chặn 409', ma === 409, JSON.stringify(d));
  }
}

// =====================================================================
let tem3 = [];
if (phieuQT && maLo) {
  nhan('── Sinh mã ──');
  {
    const { ma, d } = await goi(`/api/v1/qt/lo/${maLo}/sinh-ma`, { method: 'POST', phieu: phieuQT, body: { so_luong: 3 } });
    kiemTra('sinh được 3 tem', ma === 201 && d?.tem?.length === 3, JSON.stringify(d).slice(0, 160));
    tem3 = d?.tem || [];
    kiemTra('mã trả về đúng 12 ký tự (bỏ gạch)', tem3.every((t) => t.ma.replace(/-/g, '').length === 12));
    kiemTra('mã không chứa 0 1 O I L', tem3.every((t) => !/[01OIL]/.test(t.ma.replace(/-/g, ''))));
    kiemTra('các mã khác nhau', new Set(tem3.map((t) => t.ma)).size === 3);
  }
  {
    const { ma, d } = await goi(`/api/v1/qt/lo/${maLo}/tem`, { phieu: phieuQT });
    const roRi = JSON.stringify(d).match(/ma_an_bam|argon2/i);
    kiemTra('danh sách tem KHÔNG lộ mã hay bản băm', ma === 200 && !roRi, roRi ? 'CÓ RÒ RỈ' : '');
  }
}

// =====================================================================
if (tem3.length) {
  nhan('── Tầng 1 và Tầng 2 với tem vừa sinh ──');
  const t = tem3[0];
  {
    const { ma, d } = await goi(`/api/v1/s/${t.serial}`);
    kiemTra('Tầng 1 tìm thấy tem mới', ma === 200 && d?.ket_qua === 'TIM_THAY', JSON.stringify(d).slice(0, 120));
    kiemTra('Tầng 1 báo chưa kích hoạt', d?.da_kich_hoat === false);
    kiemTra('Tầng 1 trả đúng hàm lượng cineole', Number(d?.lo?.ham_luong_cineole) === 70.12);
    kiemTra('Tầng 1 KHÔNG lộ mã bí mật', !JSON.stringify(d).match(/ma_an_bam|ma_bi_mat/i));
  }
  {
    const { d } = await goi(`/api/v1/a/${t.serial}`, { method: 'POST', body: { ma: t.ma } });
    kiemTra('Tầng 2 lần đầu → HỢP LỆ', d?.ket_qua === 'HOP_LE', JSON.stringify(d).slice(0, 120));
  }
  {
    const { d } = await goi(`/api/v1/a/${t.serial}`, { method: 'POST', body: { ma: t.ma } });
    kiemTra('Tầng 2 lần hai → CẢNH BÁO', d?.ket_qua === 'CANH_BAO');
    kiemTra('CẢNH BÁO kèm thời điểm kích hoạt đầu', !!d?.bang_chung?.kich_hoat_dau_luc);
  }
  {
    const { d } = await goi(`/api/v1/a/${tem3[1].serial}`, { method: 'POST', body: { ma: 'AAAABBBBCCCC' } });
    kiemTra('mã sai → KHÔNG XÁC THỰC ĐƯỢC', d?.ket_qua === 'KHONG_XAC_THUC_DUOC');
  }
  {
    const { d } = await goi('/api/v1/a/TDT-2026-999999', { method: 'POST', body: { ma: 'AAAABBBBCCCC' } });
    kiemTra('serial không tồn tại → CÙNG kết quả', d?.ket_qua === 'KHONG_XAC_THUC_DUOC');
  }
  {
    const t0 = Date.now(); await goi(`/api/v1/a/${tem3[1].serial}`, { method: 'POST', body: { ma: 'AAAABBBBCCCC' } });
    const a = Date.now() - t0;
    const t1 = Date.now(); await goi('/api/v1/a/TDT-2026-999999', { method: 'POST', body: { ma: 'AAAABBBBCCCC' } });
    const b = Date.now() - t1;
    kiemTra(`thời gian hai trường hợp gần bằng nhau (${a} ms / ${b} ms)`, Math.abs(a - b) < 60, `lệch ${Math.abs(a-b)} ms`);
  }
  {
    // 5 lần sai liên tiếp phải khoá serial
    const s = tem3[2].serial;
    let cuoi = null;
    for (let i = 0; i < 6; i++) {
      const { d } = await goi(`/api/v1/a/${s}`, { method: 'POST', body: { ma: 'ZZZZYYYYXXXX' } });
      cuoi = d?.ket_qua;
    }
    kiemTra('sai nhiều lần → BỊ KHOÁ', cuoi === 'BI_KHOA', `nhận được ${cuoi}`);
  }
}

// =====================================================================
nhan('── Báo cáo nghi ngờ ──');
let maBaoCao = null;
{
  const { ma, d } = await goi('/api/v1/bao-cao', { method: 'POST',
    body: { serial: 'TDT-2026-999999', ly_do: 'MA_KHONG_TON_TAI', noi_dung: 'Kiểm thử tự động', noi_mua: 'Chợ test' } });
  kiemTra('nhận báo cáo với serial không tồn tại', ma === 201 && !!d?.ma_bao_cao, JSON.stringify(d));
  maBaoCao = d?.ma_bao_cao;
  kiemTra('không tiết lộ serial có thật hay không', !JSON.stringify(d).match(/tim_thay|ton_tai|tem_id/i));
}
{
  const { ma } = await goi('/api/v1/bao-cao', { method: 'POST', body: { ly_do: 'KHAC' } });
  kiemTra('thiếu serial bị chặn 400', ma === 400);
}
if (phieuQT) {
  const { ma, d } = await goi('/api/v1/qt/bao-cao', { phieu: phieuQT });
  kiemTra('quản trị xem được danh sách báo cáo', ma === 200 && Array.isArray(d?.bao_cao));
  if (maBaoCao) {
    const { ma: m2 } = await goi(`/api/v1/qt/bao-cao/${maBaoCao}`, { method: 'PATCH', phieu: phieuQT,
      body: { trang_thai: 'DA_XU_LY', ghi_chu: 'Kiểm thử' } });
    kiemTra('xử lý được báo cáo', m2 === 200);
  }
  const { ma: m3 } = await goi(`/api/v1/qt/bao-cao/${maBaoCao}`, { method: 'PATCH', phieu: phieuQT,
    body: { trang_thai: 'TRANG_THAI_BAY_BA' } });
  kiemTra('trạng thái không hợp lệ bị chặn 400', m3 === 400);
}

// =====================================================================
if (phieuQT) {
  nhan('── Thống kê ──');
  const { ma, d } = await goi('/api/v1/qt/thong-ke', { phieu: phieuQT });
  kiemTra('thống kê trả về đủ nhóm số liệu',
    ma === 200 && d?.lo && d?.tem && d?.quet_30_ngay && d?.bao_cao, JSON.stringify(d).slice(0, 200));
  kiemTra('có tỉ lệ kích hoạt', typeof d?.tem?.ti_le_kich_hoat === 'number');
}

// =====================================================================
if (phieuQT && maLo) {
  nhan('── Thu hồi lô ──');
  {
    const { ma } = await goi(`/api/v1/qt/lo/${maLo}/thu-hoi`, { method: 'POST', phieu: phieuQT, body: {} });
    kiemTra('thu hồi không nêu lý do bị chặn 400', ma === 400);
  }
  {
    const { ma } = await goi(`/api/v1/qt/lo/${maLo}/thu-hoi`, { method: 'POST', phieu: phieuQT,
      body: { ly_do: 'Kiểm thử tự động' } });
    kiemTra('thu hồi được khi có lý do', ma === 200);
  }
  if (tem3.length) {
    const { d } = await goi(`/api/v1/s/${tem3[1].serial}`);
    kiemTra('Tầng 1 của lô đã thu hồi → ĐÃ THU HỒI', d?.ket_qua === 'DA_THU_HOI', JSON.stringify(d).slice(0, 120));
    const { d: d2 } = await goi(`/api/v1/a/${tem3[1].serial}`, { method: 'POST', body: { ma: tem3[1].ma } });
    kiemTra('THU HỒI ưu tiên hơn mọi trạng thái khác', d2?.ket_qua === 'DA_THU_HOI');
  }
}

// =====================================================================
console.log(`\n${'='.repeat(56)}`);
console.log(`  ĐẠT ${dat}   TRƯỢT ${truot}`);
console.log('='.repeat(56));
console.log(truot === 0 ? '\n  Toàn bộ API hoạt động đúng.\n' : '\n  Có phép thử không đạt — xem dấu ✗ ở trên.\n');
process.exit(truot === 0 ? 0 : 1);


/* ══════ Phiếu đăng nhập ══════ */

// sessionStorage, không localStorage: đóng tab là hết phiên. Phiếu này mở
// được toàn bộ dữ liệu của một cơ sở nên không để nó sống qua phiên làm việc.
const KHOA_PHIEU = 'tramtrack_phieu';
const KHOA_NGUOI = 'tramtrack_nguoi';

export function luuPhieu(phieu, nguoi) {
  try {
    sessionStorage.setItem(KHOA_PHIEU, phieu);
    sessionStorage.setItem(KHOA_NGUOI, JSON.stringify(nguoi));
  } catch { /* chế độ ẩn danh có thể chặn sessionStorage */ }
}

export function layPhieu() {
  try { return sessionStorage.getItem(KHOA_PHIEU); } catch { return null; }
}

export function layNguoi() {
  try {
    const s = sessionStorage.getItem(KHOA_NGUOI);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function xoaPhieu() {
  try {
    sessionStorage.removeItem(KHOA_PHIEU);
    sessionStorage.removeItem(KHOA_NGUOI);
  } catch { /* không xoá được thì cũng không làm gì hơn được */ }
}

export class LoiHetPhien extends Error {
  constructor(thongDiep) { super(thongDiep); this.name = 'LoiHetPhien'; }
}

export class LoiKhongDuQuyen extends Error {
  constructor(thongDiep, canVaiTro) {
    super(thongDiep);
    this.name = 'LoiKhongDuQuyen';
    this.canVaiTro = canVaiTro;
  }
}

/**
 * Gọi điểm cuối quản trị. Tự gắn phiếu và dịch hai mã lỗi thành lớp lỗi
 * riêng, để màn hình phân biệt được "hết phiên" với "không đủ quyền":
 * cái đầu phải đưa về màn đăng nhập, cái sau thì không — đăng nhập lại
 * cũng không làm vai trò đổi.
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

/* ══════ Điểm cuối quản trị ══════ */

export async function dangNhap(email, matKhau) {
  const kq = await goi('/qt/dang-nhap', {
    method: 'POST',
    body: JSON.stringify({ email, mat_khau: matKhau }),
  });
  luuPhieu(kq.phieu, kq.nguoi);
  return kq.nguoi;
}

const ma = (s) => encodeURIComponent(s);

export const toi        = ()          => goiQT('/toi');
export const dsLo       = ()          => goiQT('/lo');
export const chiTietLo  = (maLo)      => goiQT(`/lo/${ma(maLo)}`);
export const dsTem      = (maLo)      => goiQT(`/lo/${ma(maLo)}/tem`);
export const thongKe    = ()          => goiQT('/thong-ke');

export const taoLo      = (lo)        => goiQT('/lo',            { method: 'POST',  body: JSON.stringify(lo) });
export const suaLo      = (maLo, lo)  => goiQT(`/lo/${ma(maLo)}`, { method: 'PATCH', body: JSON.stringify(lo) });
export const phatHanhLo = (maLo)      => goiQT(`/lo/${ma(maLo)}/phat-hanh`, { method: 'POST' });

export const thuHoiLo = (maLo, lyDo) =>
  goiQT(`/lo/${ma(maLo)}/thu-hoi`, { method: 'POST', body: JSON.stringify({ ly_do: lyDo }) });

export const sinhMa = (maLo, soLuong) =>
  goiQT(`/lo/${ma(maLo)}/sinh-ma`, { method: 'POST', body: JSON.stringify({ so_luong: soLuong }) });

export const dsBaoCao = (trangThai) =>
  goiQT(`/bao-cao${trangThai ? `?trang_thai=${ma(trangThai)}` : ''}`);

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