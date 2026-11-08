import { Router } from 'express';
import { truyVan, giaoDich } from '../db.js';
import { sinhMaBiMat, dinhDangMa, taoSerial } from '../lib/codes.js';
import { bamMa } from '../lib/hash.js';
import { canDangNhap, canVaiTro, ghiNhatKy } from '../middleware/auth.js';
import { lamSachHanhTrinh } from '../lib/hanhtrinh.js';

export const router = Router();
router.use(canDangNhap);

const DOC  = ['quan_tri', 'nhap_lieu', 'kiem_nghiem', 'nguoi_xem'];
const SUA  = ['quan_tri', 'nhap_lieu'];
const DUYET = ['quan_tri'];

const ANH_HOP_LE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const ANH_TOI_DA = 200000;
const thieuAnhPhieu = 'Chưa có ảnh phiếu kiểm nghiệm. Ảnh phiếu là bắt buộc trước khi phát hành hoặc sinh mã.';

/** Mọi truy vấn đều giới hạn trong cơ sở của người đang đăng nhập. */
const cuaToi = (req) => req.nguoi.co_so_id;

// ---------------------------------------------------------------- danh sách
router.get('/lo', canVaiTro(...DOC), async (req, res, next) => {
  try {
    const { rows } = await truyVan(
      `SELECT l.id, l.ma_lo, l.ten_dong_sp, l.ngay_chung_cat, l.ham_luong_cineole,
              l.so_phieu_coa, l.don_vi_kiem_nghiem, l.trang_thai, l.tao_luc,
              count(t.id)::int                                            AS so_tem,
              count(t.id) FILTER (WHERE t.trang_thai='DA_KICH_HOAT')::int AS da_kich_hoat
         FROM lo l LEFT JOIN tem t ON t.lo_id = l.id
        WHERE l.co_so_id = $1
        GROUP BY l.id ORDER BY l.tao_luc DESC LIMIT 200`,
      [cuaToi(req)]
    );
    res.json({ lo: rows });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- chi tiết
router.get('/lo/:maLo', canVaiTro(...DOC), async (req, res, next) => {
  try {
    const { rows } = await truyVan(
      `SELECT l.*, count(t.id)::int AS so_tem,
              count(t.id) FILTER (WHERE t.trang_thai='DA_KICH_HOAT')::int AS da_kich_hoat
         FROM lo l LEFT JOIN tem t ON t.lo_id = l.id
        WHERE l.ma_lo = $1 AND l.co_so_id = $2 GROUP BY l.id`,
      [req.params.maLo, cuaToi(req)]
    );
    if (!rows.length) return res.status(404).json({ loi: 'Không tìm thấy lô' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- tạo lô
router.post('/lo', canVaiTro(...SUA), async (req, res, next) => {
  try {
    const b = req.body || {};
    const ma_lo = String(b.ma_lo || '').trim().toUpperCase();
    const ten_dong_sp = String(b.ten_dong_sp || '').trim();
    if (!ma_lo || !ten_dong_sp) {
      return res.status(400).json({ loi: 'Thiếu mã lô hoặc tên dòng sản phẩm' });
    }
    // Ảnh phiếu kiểm nghiệm là bắt buộc: không có lô nào được tạo mà thiếu chứng từ.
    if (typeof b.anh_phieu_coa !== 'string' || !ANH_HOP_LE.test(b.anh_phieu_coa)) {
      return res.status(400).json({ loi: 'Phải đính kèm ảnh phiếu kiểm nghiệm (JPG, PNG hoặc WebP)' });
    }
    if (b.anh_phieu_coa.length > ANH_TOI_DA) {
      return res.status(413).json({ loi: 'Ảnh phiếu quá lớn (tối đa khoảng 150 KB sau khi nén)' });
    }
    const ht = lamSachHanhTrinh(b.hanh_trinh, b.ngay_chung_cat);
    if (ht.loi) return res.status(400).json({ loi: ht.loi });
    const { rows } = await truyVan(
      `INSERT INTO lo (ma_lo, ten_dong_sp, ngay_chung_cat, ham_luong_cineole,
                       so_phieu_coa, don_vi_kiem_nghiem, anh_phieu_coa, hanh_trinh, co_so_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [ma_lo, ten_dong_sp, b.ngay_chung_cat || null, b.ham_luong_cineole ?? null,
       b.so_phieu_coa || null, b.don_vi_kiem_nghiem || null, b.anh_phieu_coa || null,
       ht.gia_tri ? JSON.stringify(ht.gia_tri) : null, cuaToi(req)]
    );
    await ghiNhatKy(req.nguoi.id, 'TAO_LO', `lo:${ma_lo}`, { ten_dong_sp });
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ loi: 'Mã lô này đã tồn tại' });
    next(e);
  }
});

// ---------------------------------------------------------------- sửa lô
router.patch('/lo/:maLo', canVaiTro(...SUA), async (req, res, next) => {
  try {
    const { rows: cu } = await truyVan(
      'SELECT id, trang_thai FROM lo WHERE ma_lo = $1 AND co_so_id = $2',
      [req.params.maLo, cuaToi(req)]
    );
    if (!cu.length) return res.status(404).json({ loi: 'Không tìm thấy lô' });

    // Lô đã phát hành thì không sửa được. Tem đã in, đã ra thị trường — sửa
    // dữ liệu lúc này là đổi lời khai sau khi người mua đã đọc.
    if (cu[0].trang_thai !== 'NHAP') {
      return res.status(409).json({
        loi: 'Lô đã phát hành nên không sửa được. Ghi một lô đính chính mới nếu cần.',
        trang_thai: cu[0].trang_thai,
      });
    }

    const b = req.body || {};
    // hanh_trinh: có gửi thì thay cả khối; không gửi thì giữ nguyên.
    let htJson = null;
    if (b.hanh_trinh !== undefined) {
      const ht = lamSachHanhTrinh(b.hanh_trinh, b.ngay_chung_cat);
      if (ht.loi) return res.status(400).json({ loi: ht.loi });
      htJson = JSON.stringify(ht.gia_tri ?? {});
    }
    const { rows } = await truyVan(
      `UPDATE lo SET ten_dong_sp        = COALESCE($2, ten_dong_sp),
                     ngay_chung_cat     = COALESCE($3, ngay_chung_cat),
                     ham_luong_cineole  = COALESCE($4, ham_luong_cineole),
                     so_phieu_coa       = COALESCE($5, so_phieu_coa),
                     don_vi_kiem_nghiem = COALESCE($6, don_vi_kiem_nghiem),
                     anh_phieu_coa      = COALESCE($7, anh_phieu_coa),
                     hanh_trinh         = COALESCE($8::jsonb, hanh_trinh)
        WHERE id = $1 RETURNING *`,
      [cu[0].id, b.ten_dong_sp ?? null, b.ngay_chung_cat ?? null, b.ham_luong_cineole ?? null,
       b.so_phieu_coa ?? null, b.don_vi_kiem_nghiem ?? null, b.anh_phieu_coa ?? null, htJson]
    );
    await ghiNhatKy(req.nguoi.id, 'SUA_LO', `lo:${req.params.maLo}`, { ...b, anh_phieu_coa: b.anh_phieu_coa ? '[ảnh]' : undefined });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- gắn ảnh phiếu
/**
 * PUT /api/v1/qt/lo/:maLo/anh-phieu   body: { anh_phieu_coa }
 *
 * Chỉ THÊM, không THAY. Lô đã phát hành thì không sửa được (xem PATCH ở trên),
 * nhưng thiếu ảnh phiếu là thiếu bằng chứng chứ không phải đổi lời khai, nên
 * cho bổ sung một lần. Đã có ảnh rồi thì từ chối: người mua có thể đã xem ảnh
 * cũ, đổi ảnh sau lưng họ cũng là sửa chứng cứ.
 */
router.put('/lo/:maLo/anh-phieu', canVaiTro(...SUA), async (req, res, next) => {
  try {
    const anh = req.body?.anh_phieu_coa;
    if (typeof anh !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(anh)) {
      return res.status(400).json({ loi: 'Ảnh phải là JPG, PNG hoặc WebP' });
    }
    if (anh.length > 200000) {
      return res.status(413).json({ loi: 'Ảnh quá lớn (tối đa khoảng 150 KB sau khi nén)' });
    }

    const { rows } = await truyVan(
      `UPDATE lo SET anh_phieu_coa = $3
        WHERE ma_lo = $1 AND co_so_id = $2 AND anh_phieu_coa IS NULL
        RETURNING id`,
      [req.params.maLo, cuaToi(req), anh]
    );
    if (!rows.length) {
      const { rows: co } = await truyVan(
        'SELECT 1 FROM lo WHERE ma_lo = $1 AND co_so_id = $2', [req.params.maLo, cuaToi(req)]
      );
      if (!co.length) return res.status(404).json({ loi: 'Không tìm thấy lô' });
      return res.status(409).json({ loi: 'Lô đã có ảnh phiếu, không thay được' });
    }

    await ghiNhatKy(req.nguoi.id, 'GAN_ANH_PHIEU', `lo:${req.params.maLo}`, { kich_thuoc: anh.length });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- phát hành
router.post('/lo/:maLo/phat-hanh', canVaiTro(...DUYET), async (req, res, next) => {
  try {
    const { rows } = await truyVan(
      'SELECT id, trang_thai, so_phieu_coa, ham_luong_cineole, (anh_phieu_coa IS NOT NULL) AS co_anh FROM lo WHERE ma_lo = $1 AND co_so_id = $2',
      [req.params.maLo, cuaToi(req)]
    );
    if (!rows.length) return res.status(404).json({ loi: 'Không tìm thấy lô' });
    const l = rows[0];

    if (l.trang_thai === 'DA_THU_HOI') {
      return res.status(409).json({ loi: 'Lô đã thu hồi, không phát hành lại được' });
    }
    // Quy tắc nghiệp vụ đã chốt: phải có phiếu kiểm nghiệm mới được phát hành.
    if (!l.so_phieu_coa || l.ham_luong_cineole === null) {
      return res.status(409).json({
        loi: 'Chưa có phiếu kiểm nghiệm. Phải gắn số phiếu COA và hàm lượng cineole trước khi phát hành.',
      });
    }
    if (!l.co_anh) return res.status(409).json({ loi: thieuAnhPhieu });

    await truyVan(`UPDATE lo SET trang_thai = 'DA_PHAT_HANH' WHERE id = $1`, [l.id]);
    await ghiNhatKy(req.nguoi.id, 'PHAT_HANH_LO', `lo:${req.params.maLo}`, null);
    res.json({ ok: true, trang_thai: 'DA_PHAT_HANH' });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- thu hồi
router.post('/lo/:maLo/thu-hoi', canVaiTro(...DUYET), async (req, res, next) => {
  try {
    const ly_do = String(req.body?.ly_do || '').trim();
    if (!ly_do) return res.status(400).json({ loi: 'Phải nêu lý do thu hồi' });

    const { rows } = await truyVan(
      `UPDATE lo SET trang_thai = 'DA_THU_HOI', ly_do_thu_hoi = $3, thu_hoi_luc = now()
        WHERE ma_lo = $1 AND co_so_id = $2 RETURNING id`,
      [req.params.maLo, cuaToi(req), ly_do]
    );
    if (!rows.length) return res.status(404).json({ loi: 'Không tìm thấy lô' });

    await ghiNhatKy(req.nguoi.id, 'THU_HOI_LO', `lo:${req.params.maLo}`, { ly_do });
    res.json({ ok: true, trang_thai: 'DA_THU_HOI' });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- sinh mã
/**
 * POST /api/v1/qt/lo/:maLo/sinh-ma    body: { so_luong }
 *
 * Trả về mã bí mật dạng ĐỌC ĐƯỢC — một lần duy nhất, ngay trong câu trả lời
 * này. Cơ sở dữ liệu chỉ giữ bản băm nên không có cách nào lấy lại. Mất là
 * phải huỷ dải tem và sinh lại.
 */
router.post('/lo/:maLo/sinh-ma', canVaiTro(...DUYET), async (req, res, next) => {
  try {
    const soLuong = Math.min(Math.max(parseInt(req.body?.so_luong, 10) || 0, 1), 5000);

    const { rows } = await truyVan(
      'SELECT id, trang_thai, so_phieu_coa, ham_luong_cineole, (anh_phieu_coa IS NOT NULL) AS co_anh FROM lo WHERE ma_lo = $1 AND co_so_id = $2',
      [req.params.maLo, cuaToi(req)]
    );
    if (!rows.length) return res.status(404).json({ loi: 'Không tìm thấy lô' });
    const l = rows[0];

    if (!l.so_phieu_coa || l.ham_luong_cineole === null) {
      return res.status(409).json({ loi: 'Chưa có phiếu kiểm nghiệm, chưa sinh mã được' });
    }
    if (!l.co_anh) return res.status(409).json({ loi: thieuAnhPhieu });
    if (l.trang_thai === 'DA_THU_HOI') {
      return res.status(409).json({ loi: 'Lô đã thu hồi' });
    }

    const nam = new Date().getFullYear();
    const BASE = process.env.PUBLIC_BASE_URL || '';

    // Lấy sẵn cả dải số thứ tự trong một lượt. nextval() là nguyên tử nên
    // hai người cùng sinh mã vẫn nhận hai dải rời nhau, không trùng serial.
    const { rows: so } = await truyVan(
      `SELECT nextval('tem_so_thu_tu')::bigint AS n FROM generate_series(1, $1)`, [soLuong]
    );

    const ketQua = await giaoDich(async (c) => {
      const ra = [];
      for (let i = 0; i < soLuong; i++) {
        const serial = taoSerial(nam, so[i].n);
        const ma = sinhMaBiMat();
        await c.query('INSERT INTO tem (serial, ma_an_bam, lo_id) VALUES ($1,$2,$3)',
          [serial, await bamMa(ma), l.id]);
        ra.push({ serial, ma: dinhDangMa(ma), url_t1: `${BASE}/s/${serial}`, url_t2: `${BASE}/a/${serial}` });
      }
      await c.query(`UPDATE lo SET trang_thai='DA_PHAT_HANH' WHERE id=$1 AND trang_thai<>'DA_THU_HOI'`, [l.id]);
      return ra;
    });

    await ghiNhatKy(req.nguoi.id, 'SINH_MA', `lo:${req.params.maLo}`, { so_luong: soLuong });

    res.status(201).json({
      so_luong: ketQua.length,
      canh_bao: 'Danh sách mã bí mật dưới đây chỉ trả về một lần duy nhất. ' +
                'Cơ sở dữ liệu chỉ lưu bản băm nên không khôi phục lại được. ' +
                'In xong, dán lớp cào xong thì xoá.',
      tem: ketQua,
    });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------- danh sách tem
/** Không bao giờ trả về mã bí mật hay bản băm của nó. */
router.get('/lo/:maLo/tem', canVaiTro(...DOC), async (req, res, next) => {
  try {
    const { rows } = await truyVan(
      `SELECT t.serial, t.trang_thai, t.kich_hoat_luc, t.kich_hoat_tinh, t.tao_luc
         FROM tem t JOIN lo l ON l.id = t.lo_id
        WHERE l.ma_lo = $1 AND l.co_so_id = $2
        ORDER BY t.serial LIMIT 5000`,
      [req.params.maLo, cuaToi(req)]
    );
    res.json({ so_luong: rows.length, tem: rows });
  } catch (e) { next(e); }
});
