import { Router } from 'express';
import { truyVan } from '../db.js';
import { bamMa, doiChieuMa, tieuTonThoiGianTuongDuong } from '../lib/hash.js';
import { taoPhieu } from '../lib/auth.js';
import { canDangNhap, ghiNhatKy } from '../middleware/auth.js';

export const router = Router();

const SAN_MS = 250;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * POST /api/v1/qt/dang-nhap   body: { email, mat_khau }
 *
 * Email sai và mật khẩu sai trả về cùng một lỗi, cùng một thời gian phản hồi
 * — cùng lý do như ở Tầng 2: phân biệt được là cho kẻ tấn công biết email nào
 * có thật trong hệ thống.
 */
router.post('/dang-nhap', async (req, res, next) => {
  const batDau = process.hrtime.bigint();
  const traLoiDeu = async (ma, duLieu) => {
    const daTon = Number(process.hrtime.bigint() - batDau) / 1e6;
    if (daTon < SAN_MS) await ngu(SAN_MS - daTon);
    return res.status(ma).json(duLieu);
  };

  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const matKhau = String(req.body?.mat_khau || '');

    if (!email || !matKhau) {
      await tieuTonThoiGianTuongDuong();
      return traLoiDeu(401, { loi: 'Email hoặc mật khẩu không đúng' });
    }

    const { rows } = await truyVan(
      `SELECT n.id, n.co_so_id, n.email, n.mat_khau_bam, n.ho_ten, n.vai_tro, n.kich_hoat,
              c.ten AS ten_co_so, c.ma_co_so
         FROM nguoi_dung n JOIN co_so c ON c.id = n.co_so_id
        WHERE n.email = $1`,
      [email]
    );

    if (rows.length === 0) {
      await tieuTonThoiGianTuongDuong();
      return traLoiDeu(401, { loi: 'Email hoặc mật khẩu không đúng' });
    }

    const n = rows[0];
    const dung = await doiChieuMa(matKhau, n.mat_khau_bam);

    if (!dung || !n.kich_hoat) {
      return traLoiDeu(401, { loi: 'Email hoặc mật khẩu không đúng' });
    }

    await truyVan('UPDATE nguoi_dung SET dang_nhap_luc = now() WHERE id = $1', [n.id]);
    await ghiNhatKy(n.id, 'DANG_NHAP', `nguoi_dung:${n.id}`, null);

    return traLoiDeu(200, {
      phieu: taoPhieu({ id: n.id, co_so_id: n.co_so_id, vai_tro: n.vai_tro }),
      nguoi: {
        id: n.id, email: n.email, ho_ten: n.ho_ten, vai_tro: n.vai_tro,
        co_so: { id: n.co_so_id, ma_co_so: n.ma_co_so, ten: n.ten_co_so },
      },
    });
  } catch (e) {
    next(e);
  }
});

/** GET /api/v1/qt/toi — ai đang đăng nhập */
router.get('/toi', canDangNhap, async (req, res, next) => {
  try {
    const { rows } = await truyVan(
      `SELECT n.id, n.email, n.ho_ten, n.vai_tro, n.co_so_id,
              c.ma_co_so, c.ten AS ten_co_so
         FROM nguoi_dung n JOIN co_so c ON c.id = n.co_so_id
        WHERE n.id = $1`,
      [req.nguoi.id]
    );
    if (!rows.length) return res.status(401).json({ loi: 'Tài khoản không còn tồn tại' });
    const n = rows[0];
    res.json({
      id: n.id, email: n.email, ho_ten: n.ho_ten, vai_tro: n.vai_tro,
      co_so: { id: n.co_so_id, ma_co_so: n.ma_co_so, ten: n.ten_co_so },
    });
  } catch (e) { next(e); }
});

/** POST /api/v1/qt/doi-mat-khau */
router.post('/doi-mat-khau', canDangNhap, async (req, res, next) => {
  try {
    const cu = String(req.body?.mat_khau_cu || '');
    const moi = String(req.body?.mat_khau_moi || '');
    if (moi.length < 10) {
      return res.status(400).json({ loi: 'Mật khẩu mới phải từ 10 ký tự trở lên' });
    }
    const { rows } = await truyVan('SELECT mat_khau_bam FROM nguoi_dung WHERE id = $1', [req.nguoi.id]);
    if (!rows.length || !(await doiChieuMa(cu, rows[0].mat_khau_bam))) {
      return res.status(401).json({ loi: 'Mật khẩu hiện tại không đúng' });
    }
    await truyVan('UPDATE nguoi_dung SET mat_khau_bam = $2 WHERE id = $1',
      [req.nguoi.id, await bamMa(moi)]);
    await ghiNhatKy(req.nguoi.id, 'DOI_MAT_KHAU', `nguoi_dung:${req.nguoi.id}`, null);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
