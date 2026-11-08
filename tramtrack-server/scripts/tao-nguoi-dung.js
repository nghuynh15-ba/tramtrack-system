import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { pool, truyVan } from '../src/db.js';
import { bamMa } from '../src/lib/hash.js';

/**
 * Tạo cơ sở và tài khoản quản trị đầu tiên.
 *
 *   node scripts/tao-nguoi-dung.js --co-so "Công ty CP Pure Global" \
 *        --email quantri@pureoils.vn --ten "Nguyễn Văn A"
 *
 * Không nhận mật khẩu qua tham số dòng lệnh — mật khẩu gõ ở dòng lệnh sẽ nằm
 * lại trong lịch sử PowerShell. Script tự sinh một mật khẩu mạnh và in ra
 * đúng một lần.
 */

const args = process.argv.slice(2);
const doc = (t, m) => { const i = args.indexOf(`--${t}`); return i >= 0 && args[i+1] ? args[i+1] : m; };

const tenCoSo = doc('co-so', 'Cơ sở demo TramTrack');
const maCoSo  = doc('ma-co-so', 'CS-001');
const email   = String(doc('email', 'quantri@tramtrack.vn')).toLowerCase();
const hoTen   = doc('ten', 'Quản trị cơ sở');
const vaiTro  = doc('vai-tro', 'quan_tri');

const HOP_LE = ['quan_tri','nhap_lieu','kiem_nghiem','nguoi_xem'];
if (!HOP_LE.includes(vaiTro)) {
  console.error(`Vai trò không hợp lệ. Chọn một trong: ${HOP_LE.join(', ')}`);
  process.exit(1);
}

// Mật khẩu sinh ngẫu nhiên, đủ dài để không cần lo độ mạnh.
const matKhau = randomBytes(12).toString('base64url');

const { rows: cs } = await truyVan(
  `INSERT INTO co_so (ma_co_so, ten) VALUES ($1,$2)
   ON CONFLICT (ma_co_so) DO UPDATE SET ten = EXCLUDED.ten
   RETURNING id, ma_co_so, ten`,
  [maCoSo, tenCoSo]
);
const coSo = cs[0];

try {
  const { rows } = await truyVan(
    `INSERT INTO nguoi_dung (co_so_id, email, mat_khau_bam, ho_ten, vai_tro)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [coSo.id, email, await bamMa(matKhau), hoTen, vaiTro]
  );

  // Gắn các lô chưa có cơ sở vào cơ sở vừa tạo, để dữ liệu seed cũ dùng được.
  const { rowCount } = await truyVan(
    'UPDATE lo SET co_so_id = $1 WHERE co_so_id IS NULL', [coSo.id]
  );

  console.log(`
=================== TÀI KHOẢN ĐÃ TẠO ===================

  Cơ sở    : ${coSo.ten}  (${coSo.ma_co_so})
  Họ tên   : ${hoTen}
  Vai trò  : ${vaiTro}

  Email    : ${email}
  Mật khẩu : ${matKhau}

========================================================

  Mật khẩu chỉ hiện ĐÚNG MỘT LẦN này. Cơ sở dữ liệu chỉ lưu bản băm
  Argon2id nên không có cách nào xem lại. Chép ngay vào nơi an toàn.

  Quên thì chạy lại script với --email khác để tạo tài khoản mới.
${rowCount ? `\n  Đã gắn ${rowCount} lô chưa có cơ sở vào cơ sở này.` : ''}

  Thử đăng nhập:
    POST /api/v1/qt/dang-nhap   { "email": "${email}", "mat_khau": "..." }
`);
} catch (e) {
  if (e.code === '23505') {
    console.error(`Email ${email} đã tồn tại. Dùng --email khác.`);
  } else {
    console.error(e.message);
  }
  process.exit(1);
}

await pool.end();
