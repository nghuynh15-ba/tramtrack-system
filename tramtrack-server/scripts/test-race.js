import 'dotenv/config';
import { pool, truyVan } from '../src/db.js';
import { sinhMaBiMat, taoSerial } from '../src/lib/codes.js';
import { bamMa } from '../src/lib/hash.js';

/**
 * Kiểm thử chống kích hoạt đồng thời.
 *
 *   node scripts/test-race.js
 *
 * Với mỗi vòng: tạo một tem mới, rồi bắn HAI yêu cầu kích hoạt SONG SONG
 * vào cùng con tem đó. Đúng một yêu cầu phải thắng.
 *
 * Nếu cả hai cùng thắng thì nghĩa là một tem sao chép lọt qua được — tức
 * là toàn bộ cơ chế vô hiệu. Đây là kịch bản kiểm thử số 7 trong tài liệu
 * kỹ thuật, và con số chạy ra đưa thẳng vào Chương 5 của quyển.
 */

const SO_VONG = Number(process.argv[2] || 100);
const MA_LO = 'LO-2026-TEST-RACE';

await truyVan(
  `INSERT INTO lo (ma_lo, ten_dong_sp, ham_luong_cineole, so_phieu_coa, trang_thai)
   VALUES ($1, 'Lô kiểm thử', 70.00, 'COA-TEST', 'DA_PHAT_HANH')
   ON CONFLICT (ma_lo) DO NOTHING`,
  [MA_LO]
);
const { rows: lo } = await truyVan('SELECT id FROM lo WHERE ma_lo = $1', [MA_LO]);
const loId = lo[0].id;

/** Đúng câu lệnh mà điểm cuối Tầng 2 dùng */
function kichHoat(temId) {
  return truyVan(
    `UPDATE tem
        SET trang_thai = 'DA_KICH_HOAT', kich_hoat_luc = now()
      WHERE id = $1 AND trang_thai = 'CHUA_KICH_HOAT'`,
    [temId]
  );
}

let thangMot = 0, thangHai = 0, thangKhong = 0;

console.log(`Chạy ${SO_VONG} vòng, mỗi vòng hai yêu cầu song song...\n`);

for (let i = 0; i < SO_VONG; i++) {
  const serial = taoSerial(2099, 100000 + i);
  const bam = await bamMa(sinhMaBiMat());

  const { rows } = await truyVan(
    `INSERT INTO tem (serial, ma_an_bam, lo_id) VALUES ($1,$2,$3)
     ON CONFLICT (serial) DO UPDATE SET trang_thai = 'CHUA_KICH_HOAT'
     RETURNING id`,
    [serial, bam, loId]
  );
  const temId = rows[0].id;

  const [a, b] = await Promise.all([kichHoat(temId), kichHoat(temId)]);
  const soThang = a.rowCount + b.rowCount;

  if (soThang === 1) thangMot++;
  else if (soThang === 2) thangHai++;
  else thangKhong++;
}

// dọn dẹp
await truyVan('DELETE FROM su_kien_quet WHERE tem_id IN (SELECT id FROM tem WHERE lo_id = $1)', [loId]);
await truyVan('DELETE FROM tem WHERE lo_id = $1', [loId]);
await truyVan('DELETE FROM lo WHERE id = $1', [loId]);

console.log('================= KẾT QUẢ =================');
console.log(`  Đúng một yêu cầu thắng   : ${thangMot}/${SO_VONG}  ← phải bằng ${SO_VONG}`);
console.log(`  Cả hai cùng thắng        : ${thangHai}/${SO_VONG}  ← phải bằng 0`);
console.log(`  Không yêu cầu nào thắng  : ${thangKhong}/${SO_VONG}  ← phải bằng 0`);
console.log('===========================================');
console.log(thangMot === SO_VONG ? '\nĐẠT — cơ chế chống kích hoạt đồng thời hoạt động đúng.\n'
                                 : '\nKHÔNG ĐẠT — xem lại câu lệnh cập nhật có điều kiện.\n');

await pool.end();
process.exit(thangMot === SO_VONG ? 0 : 1);
