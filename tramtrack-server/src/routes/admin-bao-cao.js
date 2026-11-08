import { Router } from 'express';
import { truyVan } from '../db.js';
import { tenTinh, tenXa } from '../lib/dvhc.js';
import { canDangNhap, canVaiTro, ghiNhatKy } from '../middleware/auth.js';

export const router = Router();
router.use(canDangNhap);

const DOC = ['quan_tri', 'nhap_lieu', 'kiem_nghiem', 'nguoi_xem'];
const XU_LY = ['quan_tri', 'nhap_lieu'];

// ---------------------------------------------------------------- thống kê
/**
 * GET /api/v1/qt/thong-ke — số liệu cho bảng điều khiển
 * Mọi con số đều giới hạn trong cơ sở của người đang đăng nhập.
 */
router.get('/thong-ke', canVaiTro(...DOC), async (req, res, next) => {
  try {
    const coSo = req.nguoi.co_so_id;

    const [tong, theoTinh, ganDay, baoCao, khuVuc] = await Promise.all([
      truyVan(
        `SELECT count(DISTINCT l.id)::int                                     AS so_lo,
                count(t.id)::int                                             AS so_tem,
                count(t.id) FILTER (WHERE t.trang_thai='DA_KICH_HOAT')::int  AS da_kich_hoat,
                count(DISTINCT l.id) FILTER (WHERE l.trang_thai='DA_THU_HOI')::int AS lo_thu_hoi
           FROM lo l LEFT JOIN tem t ON t.lo_id = l.id
          WHERE l.co_so_id = $1`, [coSo]),
      truyVan(
        `SELECT COALESCE(s.tinh_uoc_tinh,'không rõ') AS tinh, count(*)::int AS so_luot
           FROM su_kien_quet s JOIN tem t ON t.id = s.tem_id JOIN lo l ON l.id = t.lo_id
          WHERE l.co_so_id = $1 AND s.thoi_diem > now() - interval '30 days'
          GROUP BY 1 ORDER BY 2 DESC LIMIT 20`, [coSo]),
      truyVan(
        `SELECT s.loai, count(*)::int AS so_luot
           FROM su_kien_quet s JOIN tem t ON t.id = s.tem_id JOIN lo l ON l.id = t.lo_id
          WHERE l.co_so_id = $1 AND s.thoi_diem > now() - interval '30 days'
          GROUP BY 1`, [coSo]),
      truyVan(
        // b.trang_thai phải ghi rõ tên bảng: cả bao_cao, tem và lo đều có
        // một cột tên trang_thai, không chỉ rõ thì Postgres không biết chọn cột nào.
        `SELECT count(*)::int AS tong,
                count(*) FILTER (WHERE b.trang_thai='MOI')::int AS moi
           FROM bao_cao b LEFT JOIN tem t ON t.id = b.tem_id LEFT JOIN lo l ON l.id = t.lo_id
          WHERE l.co_so_id = $1 OR b.tem_id IS NULL`, [coSo]),
      truyVan(
        // Khu vực do người mua tự khai lúc kích hoạt. Đếm theo tem đã kích hoạt,
        // gần nhất với "một chai đã được mua và mở".
        `SELECT t.khu_vuc_ma_tinh AS ma_tinh, t.khu_vuc_ma_xa AS ma_xa,
                count(*)::int AS so_tem
           FROM tem t JOIN lo l ON l.id = t.lo_id
          WHERE l.co_so_id = $1 AND t.trang_thai = 'DA_KICH_HOAT'
            AND t.khu_vuc_ma_tinh IS NOT NULL
          GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 500`, [coSo]),
    ]);

    const sk = Object.fromEntries(ganDay.rows.map((r) => [r.loai, r.so_luot]));
    const t = tong.rows[0];

    res.json({
      lo: { tong: t.so_lo, da_thu_hoi: t.lo_thu_hoi },
      tem: {
        tong: t.so_tem,
        da_kich_hoat: t.da_kich_hoat,
        ti_le_kich_hoat: t.so_tem ? +(t.da_kich_hoat / t.so_tem * 100).toFixed(1) : 0,
      },
      // 30 ngày gần nhất
      quet_30_ngay: {
        tra_cuu_t1: sk.TRA_CUU_T1 || 0,
        kich_hoat_ok: sk.KICH_HOAT_OK || 0,
        kich_hoat_trung: sk.KICH_HOAT_TRUNG || 0,
        ma_sai: sk.MA_SAI || 0,
      },
      theo_tinh: theoTinh.rows,
      bao_cao: { tong: baoCao.rows[0].tong, moi: baoCao.rows[0].moi },
      // Khu vực tự khai: mỗi dòng là một cặp (tỉnh, xã/phường) và số tem đã kích hoạt ở đó.
      khu_vuc: khuVuc.rows.map((r) => ({
        ma_tinh: r.ma_tinh,
        ten_tinh: tenTinh(r.ma_tinh) || r.ma_tinh,
        ma_xa: r.ma_xa,
        ten_xa: r.ma_xa ? (tenXa(r.ma_tinh, r.ma_xa) || r.ma_xa) : null,
        so_tem: r.so_tem,
      })),
    });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- danh sách báo cáo
router.get('/bao-cao', canVaiTro(...DOC), async (req, res, next) => {
  try {
    const trangThai = req.query.trang_thai || null;
    const { rows } = await truyVan(
      `SELECT b.id, b.serial_khai_bao, b.ly_do, b.noi_dung, b.noi_mua, b.anh,
              b.lien_he, b.tinh_uoc_tinh, b.trang_thai, b.ghi_chu_xu_ly, b.tao_luc,
              t.serial AS serial_tim_thay, l.ma_lo,
              (SELECT count(*)::int FROM bao_cao_anh x WHERE x.bao_cao_id = b.id) AS so_anh
         FROM bao_cao b
         LEFT JOIN tem t ON t.id = b.tem_id
         LEFT JOIN lo  l ON l.id = t.lo_id
        WHERE (l.co_so_id = $1 OR b.tem_id IS NULL)
          AND ($2::text IS NULL OR b.trang_thai = $2)
        ORDER BY b.tao_luc DESC LIMIT 300`,
      [req.nguoi.co_so_id, trangThai]
    );
    res.json({ so_luong: rows.length, bao_cao: rows });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- ảnh bằng chứng
/** Chỉ báo cáo thuộc cơ sở của người đăng nhập (hoặc chưa gắn được tem nào) mới xem được ảnh. */
router.get('/bao-cao/:id/anh', canVaiTro(...DOC), async (req, res, next) => {
  try {
    const { rows } = await truyVan(
      `SELECT x.thu_tu, x.anh
         FROM bao_cao_anh x
         JOIN bao_cao b ON b.id = x.bao_cao_id
         LEFT JOIN tem t ON t.id = b.tem_id
         LEFT JOIN lo  l ON l.id = t.lo_id
        WHERE b.id = $1 AND (l.co_so_id = $2 OR b.tem_id IS NULL)
        ORDER BY x.thu_tu`,
      [req.params.id, req.nguoi.co_so_id]
    );
    res.json({ anh: rows });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- xử lý báo cáo
router.patch('/bao-cao/:id', canVaiTro(...XU_LY), async (req, res, next) => {
  try {
    const hopLe = ['MOI', 'DANG_XU_LY', 'DA_XU_LY', 'BO_QUA'];
    const trangThai = req.body?.trang_thai;
    if (!hopLe.includes(trangThai)) {
      return res.status(400).json({ loi: 'Trạng thái không hợp lệ', hop_le: hopLe });
    }
    const { rows } = await truyVan(
      `UPDATE bao_cao
          SET trang_thai = $2, ghi_chu_xu_ly = COALESCE($3, ghi_chu_xu_ly),
              xu_ly_boi = $4, xu_ly_luc = now()
        WHERE id = $1
          AND (tem_id IS NULL OR tem_id IN (
                 SELECT t.id FROM tem t JOIN lo l ON l.id = t.lo_id WHERE l.co_so_id = $5))
        RETURNING id, trang_thai`,
      [req.params.id, trangThai, req.body?.ghi_chu ?? null, req.nguoi.id, req.nguoi.co_so_id]
    );
    if (!rows.length) return res.status(404).json({ loi: 'Không tìm thấy báo cáo' });
    await ghiNhatKy(req.nguoi.id, 'XU_LY_BAO_CAO', `bao_cao:${req.params.id}`, { trang_thai: trangThai });
    res.json(rows[0]);
  } catch (e) { next(e); }
});
