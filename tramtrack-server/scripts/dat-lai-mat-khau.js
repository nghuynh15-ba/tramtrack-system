import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { pool, truyVan } from '../src/db.js';
import { bamMa } from '../src/lib/hash.js';

/**
 * Đặt lại mật khẩu cho một tài khoản đã có.
 *
 *   node scripts/dat-lai-mat-khau.js --email quantri@tramtrack.vn
 *
 * Mật khẩu cũ KHÔNG đọc lại được — cơ sở dữ liệu chỉ giữ bản băm Argon2id
 * một chiều. Script này không khôi phục mật khẩu cũ, nó đặt một mật khẩu
 * mới và in ra đúng một lần.
 *
 * Không nhận mật khẩu qua tham số dòng lệnh: gõ mật khẩu ở PowerShell là
 * nó nằm lại trong lịch sử lệnh.
 */

const args = process.argv.slice(2);
const doc = (t, m) => { const i = args.indexOf(`--${t}`); return i >= 0 && args[i+1] ? args[i+1] : m; };

const email = String(doc('email', '')).toLowerCase().trim();

if (!email) {
  // Không biết email thì liệt kê ra cho chọn — chỉ hiện email và vai trò,
  // không bao giờ hiện thứ gì liên quan tới mật khẩu.
  const { rows } = await truyVan(
    `SELECT n.email, n.ho_ten, n.vai_tro, n.kich_hoat, c.ten AS co_so
       FROM nguoi_dung n JOIN co_so c ON c.id = n.co_so_id
      ORDER BY n.id`
  );
  if (rows.length === 0) {
    console.log('\nChưa có tài khoản nào. Tạo tài khoản đầu tiên bằng:\n  npm run tao-nguoi-dung\n');
  } else {
    console.log('\nCác tài khoản hiện có:\n');
    for (const r of rows) {
      console.log(`  ${r.email}`);
      console.log(`     ${r.ho_ten} · ${r.vai_tro} · ${r.co_so}${r.kich_hoat ? '' : ' · ĐÃ KHOÁ'}\n`);
    }
    console.log('Đặt lại mật khẩu cho một tài khoản:');
    console.log('  npm run dat-lai-mat-khau -- --email <email ở trên>\n');
  }
  await pool.end();
  process.exit(0);
}

const matKhau = randomBytes(12).toString('base64url');

const { rows } = await truyVan(
  `UPDATE nguoi_dung SET mat_khau_bam = $2 WHERE email = $1
   RETURNING id, email, ho_ten, vai_tro`,
  [email, await bamMa(matKhau)]
);

if (rows.length === 0) {
  console.error(`\nKhông tìm thấy tài khoản ${email}.`);
  console.error('Chạy không kèm --email để xem danh sách tài khoản hiện có.\n');
  await pool.end();
  process.exit(1);
}

const n = rows[0];
console.log(`
================ ĐÃ ĐẶT LẠI MẬT KHẨU ================

  Họ tên   : ${n.ho_ten}
  Vai trò  : ${n.vai_tro}

  Email    : ${n.email}
  Mật khẩu : ${matKhau}

=====================================================

  Mật khẩu này chỉ hiện ĐÚNG MỘT LẦN. Chép ngay.

  Dán vào .env để chạy npm run test:api:

    TEST_EMAIL=${n.email}
    TEST_MAT_KHAU=${matKhau}
`);

await pool.end();
