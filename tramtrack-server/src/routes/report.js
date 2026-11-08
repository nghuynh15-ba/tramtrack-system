import { Router } from 'express';
import { truyVan, giaoDich } from '../db.js';
import { serialDungDinhDang } from '../lib/codes.js';
import { tinhCuaRequest } from '../lib/geo.js';

export const router = Router();

const TOI_DA_ANH = 2;
const TOI_DA_KY_TU_ANH = 200000;
const DANG_ANH = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;

const LY_DO_HOP_LE = ['MA_KHONG_TON_TAI', 'MA_DA_KICH_HOAT', 'TEM_BI_RACH', 'NGHI_HANG_GIA', 'KHAC'];

/**
 * Người tiêu dùng gửi báo cáo nghi ngờ.
 * POST /api/v1/bao-cao
 *
 * Không cần đăng nhập, không cần khai tên. Trường lien_he để trống được và
 * chỉ dùng khi cơ sở cần hỏi lại. Đây là kênh biến hệ thống từ công cụ tra
 * cứu thành thứ có ích thật cho cơ sở.
 *
 * Serial trong báo cáo có thể KHÔNG tồn tại trong hệ thống — đó chính là
 * trường hợp đáng báo cáo nhất. Nên vẫn nhận và lưu nguyên chuỗi người dùng
 * khai, chỉ gắn tem_id khi tra ra được.
 */
router.post('/bao-cao', async (req, res, next) => {
  try {
    const b = req.body || {};
    const serial = String(b.serial || '').toUpperCase().trim();
    const ly_do = LY_DO_HOP_LE.includes(b.ly_do) ? b.ly_do : 'KHAC';

    if (!serial) {
      return res.status(400).json({ loi: 'Thiếu mã sản phẩm' });
    }

    const noi_dung = String(b.noi_dung || '').slice(0, 2000) || null;
    const noi_mua  = String(b.noi_mua  || '').slice(0, 500)  || null;
    const lien_he  = String(b.lien_he  || '').slice(0, 200)  || null;
    const anh      = String(b.anh      || '').slice(0, 1000) || null;

    // Ảnh bằng chứng: tối đa 2, chỉ JPEG (trình duyệt đã nén sẵn), mỗi ảnh có hạn.
    let dsAnh = [];
    if (b.anh_bang_chung !== undefined && b.anh_bang_chung !== null) {
      if (!Array.isArray(b.anh_bang_chung) || b.anh_bang_chung.length > TOI_DA_ANH) {
        return res.status(400).json({ loi: `Tối đa ${TOI_DA_ANH} ảnh` });
      }
      for (const a of b.anh_bang_chung) {
        if (typeof a !== 'string' || a.length > TOI_DA_KY_TU_ANH || !DANG_ANH.test(a)) {
          return res.status(400).json({ loi: 'Ảnh không hợp lệ hoặc quá lớn' });
        }
      }
      dsAnh = b.anh_bang_chung;
    }

    let temId = null;
    if (serialDungDinhDang(serial)) {
      const { rows } = await truyVan('SELECT id FROM tem WHERE serial = $1', [serial]);
      if (rows.length) temId = rows[0].id;
    }

    // Báo cáo và ảnh vào cùng một giao dịch: không để lại báo cáo mất ảnh.
    const bc = await giaoDich(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO bao_cao (tem_id, serial_khai_bao, ly_do, noi_dung, noi_mua, anh, lien_he, tinh_uoc_tinh)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, tao_luc`,
        [temId, serial, ly_do, noi_dung, noi_mua, anh, lien_he, tinhCuaRequest(req)]
      );
      for (let i = 0; i < dsAnh.length; i++) {
        await c.query(
          'INSERT INTO bao_cao_anh (bao_cao_id, thu_tu, anh) VALUES ($1,$2,$3)',
          [rows[0].id, i + 1, dsAnh[i]]
        );
      }
      return rows[0];
    });

    // Không tiết lộ serial có tồn tại trong hệ thống hay không — người gửi
    // báo cáo không cần biết, mà kẻ dò mã thì rất muốn biết.
    return res.status(201).json({
      ok: true,
      ma_bao_cao: bc.id,
      tao_luc: bc.tao_luc,
      loi_nhan: 'Đã nhận báo cáo. Cơ sở sản xuất sẽ xem xét và xử lý.',
    });
  } catch (e) {
    next(e);
  }
});
