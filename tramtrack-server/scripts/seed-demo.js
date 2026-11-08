import 'dotenv/config';
import { pool, truyVan } from '../src/db.js';
import { sinhMaBiMat, dinhDangMa, taoSerial } from '../src/lib/codes.js';
import { bamMa } from '../src/lib/hash.js';

/**
 * Dựng sẵn kịch bản demo ba con tem cho vòng chung kết.
 *
 *   node scripts/seed-demo.js
 *
 * Tem A — chưa kích hoạt. Quét Tầng 1 ra thông tin lô, quét Tầng 2 ra HỢP LỆ.
 * Tem B — đã kích hoạt sẵn từ hôm trước ở Cần Thơ. Quét Tầng 2 ra CẢNH BÁO
 *         kèm bằng chứng thời điểm và tỉnh.
 * Tem C — serial không có trong hệ thống. Chỉ cần in, không tạo trong CSDL.
 */

const MA_LO = 'LO-2026-Q4-DEMO';

await truyVan(
  `INSERT INTO lo (ma_lo, ten_dong_sp, ngay_chung_cat, ham_luong_cineole,
                   so_phieu_coa, don_vi_kiem_nghiem, trang_thai)
   VALUES ($1, 'Tinh dầu tràm năm gân nguyên chất', '2026-09-18', 71.05,
           'COA-2026-8821', 'Trung tâm Kiểm nghiệm Dược phẩm', 'DA_PHAT_HANH')
   ON CONFLICT (ma_lo) DO UPDATE SET trang_thai = 'DA_PHAT_HANH'`,
  [MA_LO]
);

const { rows } = await truyVan('SELECT id FROM lo WHERE ma_lo = $1', [MA_LO]);
const loId = rows[0].id;

await truyVan('DELETE FROM su_kien_quet WHERE tem_id IN (SELECT id FROM tem WHERE lo_id = $1)', [loId]);
await truyVan('DELETE FROM tem WHERE lo_id = $1', [loId]);

const nam = new Date().getFullYear();
const BASE = process.env.PUBLIC_BASE_URL || 'https://tramtrack.vn';
const ket = [];

// ---- Tem A: chưa kích hoạt ----
{
  const serial = taoSerial(nam, 900001);
  const ma = sinhMaBiMat();
  await truyVan('INSERT INTO tem (serial, ma_an_bam, lo_id) VALUES ($1,$2,$3)',
    [serial, await bamMa(ma), loId]);
  ket.push(['A', 'chưa kích hoạt → HỢP LỆ', serial, dinhDangMa(ma)]);
}

// ---- Tem B: đã kích hoạt sẵn ở Cần Thơ, ba ngày trước ----
{
  const serial = taoSerial(nam, 900002);
  const ma = sinhMaBiMat();
  await truyVan(
    `INSERT INTO tem (serial, ma_an_bam, lo_id, trang_thai, kich_hoat_luc, kich_hoat_tinh)
     VALUES ($1, $2, $3, 'DA_KICH_HOAT', now() - interval '3 days', 'Cần Thơ')`,
    [serial, await bamMa(ma), loId]
  );
  ket.push(['B', 'đã kích hoạt → CẢNH BÁO', serial, dinhDangMa(ma)]);
}

// ---- Tem C: không tạo trong CSDL ----
ket.push(['C', 'không tồn tại → KHÔNG XÁC THỰC ĐƯỢC', taoSerial(nam, 999999), '(mã bất kỳ)']);

console.log('\n=============== BA CON TEM DEMO ===============\n');
for (const [nhan, mo_ta, serial, ma] of ket) {
  console.log(`  TEM ${nhan} — ${mo_ta}`);
  console.log(`    serial : ${serial}`);
  console.log(`    mã ẩn  : ${ma}`);
  console.log(`    Tầng 1 : ${BASE}/s/${serial}`);
  console.log(`    Tầng 2 : ${BASE}/a/${serial}\n`);
}
console.log('Tem B đã được đặt sẵn là kích hoạt từ 3 ngày trước tại Cần Thơ,');
console.log('nên khi quét trên sân khấu sẽ ra CẢNH BÁO kèm bằng chứng.\n');
console.log('Ghi ba mã này ra giấy rồi xoá khỏi màn hình — đừng chụp màn hình gửi đi.\n');

await pool.end();
