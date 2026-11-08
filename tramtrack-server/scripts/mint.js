import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { pool, truyVan } from '../src/db.js';
import { sinhMaBiMat, dinhDangMa, taoSerial } from '../src/lib/codes.js';
import { bamMa } from '../src/lib/hash.js';

/**
 * Sinh mã cho một lô và xuất tệp để dựng bản in.
 *
 *   node scripts/mint.js --lo LO-2026-Q4-01 --so 30
 *
 * CẢNH BÁO QUAN TRỌNG
 * Tệp CSV xuất ra chứa mã bí mật ở dạng ĐỌC ĐƯỢC. Đó là toàn bộ giá trị
 * của lô tem này. Cơ sở dữ liệu chỉ giữ bản băm nên không tái tạo lại được
 * mã từ đó — nghĩa là mất tệp này thì phải huỷ cả dải tem và sinh lại.
 *
 * Quy trình đúng: sinh → in ngay → dán lớp cào → XOÁ TỆP.
 * Không gửi tệp này qua tin nhắn, không để trên máy sau khi in xong.
 */

const args = process.argv.slice(2);
function doc(ten, mac_dinh) {
  const i = args.indexOf(`--${ten}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : mac_dinh;
}

const maLo = doc('lo');
const soLuong = Number(doc('so', '30'));

if (!maLo) {
  console.error('Thiếu --lo. Ví dụ: node scripts/mint.js --lo LO-2026-Q4-01 --so 30');
  process.exit(1);
}

const { rows: loRows } = await truyVan(
  'SELECT id, ma_lo, trang_thai, so_phieu_coa, ham_luong_cineole FROM lo WHERE ma_lo = $1',
  [maLo]
);

if (loRows.length === 0) {
  console.error(`Không tìm thấy lô ${maLo}.`);
  process.exit(1);
}

const lo = loRows[0];

// Quy tắc nghiệp vụ đã chốt: phải có phiếu kiểm nghiệm mới được sinh mã.
if (!lo.so_phieu_coa || lo.ham_luong_cineole === null) {
  console.error(
    `Lô ${maLo} chưa có phiếu kiểm nghiệm. Theo quy tắc đã chốt, phải có COA\n` +
    'mới được phát hành lô và sinh mã. Cập nhật so_phieu_coa và ham_luong_cineole trước.'
  );
  process.exit(1);
}

// Số thứ tự lấy từ chuỗi số toàn hệ thống, không đếm theo lô — đếm theo lô
// thì lô thứ hai sinh lại TDT-2026-000001 và đâm vào lô thứ nhất.
const { rows: soRows } = await truyVan(
  `SELECT nextval('tem_so_thu_tu')::bigint AS n FROM generate_series(1, $1)`, [soLuong]
);
const nam = new Date().getFullYear();

const BASE = process.env.PUBLIC_BASE_URL || 'https://tramtrack.vn';
const dong = [['serial', 'ma_bi_mat', 'url_tang_1', 'url_tang_2']];

console.log(`Đang sinh ${soLuong} tem cho lô ${maLo}...`);

for (let i = 0; i < soLuong; i++) {
  const serial = taoSerial(nam, soRows[i].n);
  const ma = sinhMaBiMat();
  const bam = await bamMa(ma);

  await truyVan(
    'INSERT INTO tem (serial, ma_an_bam, lo_id) VALUES ($1, $2, $3)',
    [serial, bam, lo.id]
  );

  dong.push([serial, dinhDangMa(ma), `${BASE}/s/${serial}`, `${BASE}/a/${serial}`]);
  if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/${soLuong}\n`);
}

await truyVan(
  `UPDATE lo SET trang_thai = 'DA_PHAT_HANH' WHERE id = $1 AND trang_thai <> 'DA_THU_HOI'`,
  [lo.id]
);

const ten = `IN-${maLo}-${Date.now()}.csv`;
writeFileSync(ten, dong.map((r) => r.join(',')).join('\n'), 'utf8');

console.log(`
Đã sinh xong ${soLuong} tem.
Tệp để dựng bản in: ${ten}

  !!  Tệp này chứa mã bí mật dạng đọc được.
  !!  In xong, dán lớp cào xong thì XOÁ NGAY.
  !!  Cơ sở dữ liệu không giữ bản thô nên không khôi phục lại được.
`);

await pool.end();
