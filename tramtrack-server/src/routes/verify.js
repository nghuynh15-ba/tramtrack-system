import { Router } from 'express';
import { truyVan } from '../db.js';
import { serialDungDinhDang } from '../lib/codes.js';
import { tinhCuaRequest } from '../lib/geo.js';
import { hanhTrinhCongKhai } from '../lib/hanhtrinh.js';

export const router = Router();

/**
 * TẦNG 1 — tra cứu không phá tem.
 * GET /api/v1/s/:serial
 *
 * Đây là điểm cuối người mua gọi khi còn đứng ở quầy, tem chưa cào.
 * Nó trả thông tin lô và cho biết tem đã được kích hoạt hay chưa.
 *
 * KHÔNG BAO GIỜ trả về ma_an_bam hay bất cứ thứ gì suy ra được mã bí mật.
 */
router.get('/s/:serial', async (req, res, next) => {
  try {
    const serial = String(req.params.serial || '').toUpperCase();
    const tinh = tinhCuaRequest(req);

    if (!serialDungDinhDang(serial)) {
      await ghiSuKien(null, 'KHONG_TIM_THAY', tinh);
      return res.json({ ket_qua: 'KHONG_TIM_THAY', serial });
    }

    const { rows } = await truyVan(
      `SELECT t.id, t.serial, t.trang_thai, t.kich_hoat_luc, t.kich_hoat_tinh,
              l.ma_lo, l.ten_dong_sp, l.ngay_chung_cat, l.ham_luong_cineole,
              l.so_phieu_coa, l.don_vi_kiem_nghiem, l.anh_phieu_coa, l.hanh_trinh,
              l.trang_thai AS lo_trang_thai, l.ly_do_thu_hoi, l.thu_hoi_luc
         FROM tem t
         JOIN lo  l ON l.id = t.lo_id
        WHERE t.serial = $1`,
      [serial]
    );

    if (rows.length === 0) {
      await ghiSuKien(null, 'KHONG_TIM_THAY', tinh);
      return res.json({ ket_qua: 'KHONG_TIM_THAY', serial });
    }

    const r = rows[0];

    // Thu hồi được ưu tiên cao nhất vì nó liên quan an toàn người dùng.
    if (r.lo_trang_thai === 'DA_THU_HOI') {
      await ghiSuKien(r.id, 'DA_THU_HOI', tinh);
      return res.json({
        ket_qua: 'DA_THU_HOI',
        serial,
        thu_hoi: { ly_do: r.ly_do_thu_hoi, thoi_diem: r.thu_hoi_luc },
        lo: thongTinLo(r),
      });
    }

    await ghiSuKien(r.id, 'TRA_CUU_T1', tinh);

    return res.json({
      ket_qua: 'TIM_THAY',
      serial,
      da_kich_hoat: r.trang_thai === 'DA_KICH_HOAT',
      // Chỉ nêu thời điểm, không nêu tỉnh ở Tầng 1 — Tầng 1 là tra cứu,
      // không phải nơi trưng bằng chứng.
      kich_hoat_luc: r.trang_thai === 'DA_KICH_HOAT' ? r.kich_hoat_luc : null,
      lo: thongTinLo(r),
    });
  } catch (e) {
    next(e);
  }
});

export function thongTinLo(r) {
  return {
    ma_lo: r.ma_lo,
    ten_dong_sp: r.ten_dong_sp,
    ngay_chung_cat: r.ngay_chung_cat,
    ham_luong_cineole: r.ham_luong_cineole === null ? null : Number(r.ham_luong_cineole),
    so_phieu_coa: r.so_phieu_coa,
    don_vi_kiem_nghiem: r.don_vi_kiem_nghiem,
    anh_phieu_coa: r.anh_phieu_coa,
    hanh_trinh: hanhTrinhCongKhai(r.hanh_trinh),
  };
}

export async function ghiSuKien(temId, loai, tinh) {
  try {
    await truyVan(
      'INSERT INTO su_kien_quet (tem_id, loai, tinh_uoc_tinh) VALUES ($1, $2, $3)',
      [temId, loai, tinh]
    );
  } catch (e) {
    // Ghi sự kiện hỏng thì không được làm hỏng câu trả lời cho người quét.
    console.error('Không ghi được sự kiện quét:', e.message);
  }
}
