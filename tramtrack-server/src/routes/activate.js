import { Router } from 'express';
import { truyVan } from '../db.js';
import { chuanHoaMa, maDungDinhDang, serialDungDinhDang } from '../lib/codes.js';
import { doiChieuMa, tieuTonThoiGianTuongDuong } from '../lib/hash.js';
import { tinhCuaRequest } from '../lib/geo.js';
import { thongTinLo, ghiSuKien } from './verify.js';
import { kyKhuVuc, dungDauKhuVuc } from '../lib/auth.js';
import { khuVucHopLe } from '../lib/dvhc.js';

export const router = Router();

const SO_LAN_SAI_TOI_DA = 5;
const PHUT_KHOA = 15;

/**
 * Sàn thời gian phản hồi cho MỌI câu trả lời của Tầng 2.
 *
 * Vì sao cần: các nhánh xử lý tốn thời gian khác nhau — nhánh mã sai chạy
 * một phép băm rồi cập nhật, nhánh bị khoá trả lời ngay không băm, nhánh
 * kích hoạt trùng còn đọc thêm một lần nữa. Đo thời gian là phân biệt được.
 *
 * Cân bằng khối lượng công việc giữa các nhánh là cách mong manh: thêm một
 * truy vấn ở đâu đó là lệch lại. Đặt sàn cố định thì mọi nhánh bằng nhau
 * theo định nghĩa, và kiểm chứng được bằng một phép đo đơn giản.
 *
 * 120 ms: cao hơn nhánh chậm nhất đo được (~40 ms) với biên an toàn, và vẫn
 * nằm sâu dưới ngưỡng 800 ms đã đặt cho độ trễ xác thực.
 */
const SAN_THOI_GIAN_MS = 120;

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

/** Trả lời sau khi đã đủ sàn thời gian tính từ lúc nhận yêu cầu */
async function traLoiDeu(res, batDau, duLieu) {
  const daTon = Number(process.hrtime.bigint() - batDau) / 1e6;
  if (daTon < SAN_THOI_GIAN_MS) await ngu(SAN_THOI_GIAN_MS - daTon);
  return res.json(duLieu);
}

/**
 * TẦNG 2 — kích hoạt sau khi cào.
 * POST /api/v1/a/:serial     body: { "ma": "7KQM-R4XH-P9TW" }
 *
 * Kết quả trả về:
 *   HOP_LE               tem thật, lần kích hoạt đầu tiên
 *   CANH_BAO             mã đã được kích hoạt trước đó — trả BẰNG CHỨNG, không trả phán quyết
 *   DA_THU_HOI           lô đã bị thu hồi, ưu tiên cao nhất
 *   BI_KHOA              sai quá nhiều lần, tạm khoá serial này
 *   KHONG_XAC_THUC_DUOC  mã sai HOẶC serial không tồn tại — cố ý gộp làm một
 *
 * Việc gộp hai trường hợp cuối là có chủ đích: nếu phân biệt được
 * "serial đúng nhưng mã sai" với "serial không tồn tại" thì kẻ dò mã biết
 * mình đã tìm đúng serial và chỉ còn phải dò phần mã. Thời gian phản hồi
 * cũng được làm phẳng vì lý do tương tự.
 */
router.post('/a/:serial', async (req, res, next) => {
  const batDau = process.hrtime.bigint();
  try {
    const serial = String(req.params.serial || '').toUpperCase();
    const ma = chuanHoaMa(req.body?.ma);
    const tinh = tinhCuaRequest(req);

    // Sai định dạng: vẫn tiêu thời gian tương đương rồi trả lời giống hệt
    // trường hợp không tìm thấy.
    if (!serialDungDinhDang(serial) || !maDungDinhDang(ma)) {
      await tieuTonThoiGianTuongDuong();
      await ghiSuKien(null, 'KHONG_TIM_THAY', tinh);
      return traLoiDeu(res, batDau, { ket_qua: 'KHONG_XAC_THUC_DUOC', serial });
    }

    const { rows } = await truyVan(
      `SELECT t.id, t.serial, t.ma_an_bam, t.trang_thai,
              t.kich_hoat_luc, t.kich_hoat_tinh, t.so_lan_sai, t.khoa_den,
              l.ma_lo, l.ten_dong_sp, l.ngay_chung_cat, l.ham_luong_cineole,
              l.so_phieu_coa, l.don_vi_kiem_nghiem, l.anh_phieu_coa, l.hanh_trinh,
              l.trang_thai AS lo_trang_thai, l.ly_do_thu_hoi, l.thu_hoi_luc
         FROM tem t
         JOIN lo  l ON l.id = t.lo_id
        WHERE t.serial = $1`,
      [serial]
    );

    if (rows.length === 0) {
      await tieuTonThoiGianTuongDuong();
      await ghiSuKien(null, 'KHONG_TIM_THAY', tinh);
      return traLoiDeu(res, batDau, { ket_qua: 'KHONG_XAC_THUC_DUOC', serial });
    }

    const r = rows[0];

    if (r.lo_trang_thai === 'DA_THU_HOI') {
      await ghiSuKien(r.id, 'DA_THU_HOI', tinh);
      return traLoiDeu(res, batDau, {
        ket_qua: 'DA_THU_HOI',
        serial,
        thu_hoi: { ly_do: r.ly_do_thu_hoi, thoi_diem: r.thu_hoi_luc },
        lo: thongTinLo(r),
      });
    }

    if (r.khoa_den && new Date(r.khoa_den) > new Date()) {
      await ghiSuKien(r.id, 'BI_KHOA', tinh);
      return traLoiDeu(res, batDau, { ket_qua: 'BI_KHOA', serial, mo_khoa_luc: r.khoa_den });
    }

    const maDung = await doiChieuMa(ma, r.ma_an_bam);

    if (!maDung) {
      const soLanSai = r.so_lan_sai + 1;
      const phaiKhoa = soLanSai >= SO_LAN_SAI_TOI_DA;
      await truyVan(
        `UPDATE tem
            SET so_lan_sai = $2,
                khoa_den   = CASE WHEN $3 THEN now() + ($4 || ' minutes')::interval
                                  ELSE khoa_den END
          WHERE id = $1`,
        [r.id, phaiKhoa ? 0 : soLanSai, phaiKhoa, String(PHUT_KHOA)]
      );
      await ghiSuKien(r.id, 'MA_SAI', tinh);
      // Trả lời giống hệt trường hợp không tìm thấy — xem ghi chú đầu file.
      return traLoiDeu(res, batDau, { ket_qua: 'KHONG_XAC_THUC_DUOC', serial });
    }

    // ---------------------------------------------------------------
    // Mã đúng. Chốt kích hoạt bằng CẬP NHẬT CÓ ĐIỀU KIỆN.
    //
    // Không đọc rồi mới ghi: hai yêu cầu đến cùng lúc sẽ cùng đọc thấy
    // "chưa kích hoạt" và cùng trả HỢP LỆ, nghĩa là một tem sao chép lọt
    // qua. Điều kiện nằm trong chính câu UPDATE thì cơ sở dữ liệu bảo đảm
    // chỉ một yêu cầu đổi được trạng thái.
    // ---------------------------------------------------------------
    const capNhat = await truyVan(
      `UPDATE tem
          SET trang_thai     = 'DA_KICH_HOAT',
              kich_hoat_luc  = now(),
              kich_hoat_tinh = $2,
              so_lan_sai     = 0,
              khoa_den       = NULL
        WHERE id = $1 AND trang_thai = 'CHUA_KICH_HOAT'
        RETURNING kich_hoat_luc`,
      [r.id, tinh]
    );

    if (capNhat.rowCount === 1) {
      await ghiSuKien(r.id, 'KICH_HOAT_OK', tinh);
      return traLoiDeu(res, batDau, {
        ket_qua: 'HOP_LE',
        serial,
        kich_hoat_luc: capNhat.rows[0].kich_hoat_luc,
        // Dấu cho phép người vừa kích hoạt tự khai khu vực (tùy chọn), xem PUT bên dưới.
        khu_vuc_dau: kyKhuVuc(serial, capNhat.rows[0].kich_hoat_luc),
        lo: thongTinLo(r),
      });
    }

    // 0 dòng: tem đã được kích hoạt trước đó. Đọc lại để lấy bằng chứng.
    const lai = await truyVan(
      'SELECT kich_hoat_luc, kich_hoat_tinh FROM tem WHERE id = $1',
      [r.id]
    );
    const dau = lai.rows[0] || {};
    await ghiSuKien(r.id, 'KICH_HOAT_TRUNG', tinh);

    // Quy tắc nghiệp vụ: chỉ nêu địa điểm khi nó nói lên điều gì đó.
    //
    //   biết tỉnh hiện tại, TRÙNG tỉnh kích hoạt đầu  → giấu, vì vô nghĩa
    //   biết tỉnh hiện tại, KHÁC tỉnh kích hoạt đầu   → hiện, đây là bằng chứng
    //   không biết tỉnh hiện tại                      → hiện, để người quét tự
    //                                                   đối chiếu với nơi họ đang đứng
    //
    // Vế thứ ba quan trọng: tra tỉnh từ IP thường thất bại vì mạng di động
    // dùng NAT. Nếu đòi phải biết tỉnh hiện tại mới hiện thì gần như không
    // bao giờ hiện, và màn cảnh báo mất hẳn phần bằng chứng mạnh nhất.
    const hienViTri = Boolean(dau.kich_hoat_tinh) && dau.kich_hoat_tinh !== tinh;

    return traLoiDeu(res, batDau, {
      // Hệ thống công bố SỰ KIỆN, không công bố phán quyết về chai nào thật.
      ket_qua: 'CANH_BAO',
      serial,
      bang_chung: {
        kich_hoat_dau_luc: dau.kich_hoat_luc,
        kich_hoat_dau_tinh: hienViTri ? dau.kich_hoat_tinh : null,
        hien_vi_tri: hienViTri,
      },
      lo: thongTinLo(r),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Người mua tự khai khu vực SAU khi kích hoạt — hoàn toàn tùy chọn.
 * PUT /api/v1/a/:serial/khu-vuc   body: { dau, ma_tinh, ma_xa? }
 *
 * Ràng buộc:
 *   - cần `dau` do máy chủ phát lúc kích hoạt, nên chỉ người vừa kích hoạt ghi được
 *   - chỉ ghi MỘT LẦN cho mỗi tem, và chỉ trong 30 phút đầu sau kích hoạt
 *   - mã tỉnh/xã được kiểm tra với danh sách hiện hành, xã phải thuộc đúng tỉnh
 *   - chỉ lưu mã đơn vị hành chính, không lưu toạ độ hay địa chỉ mạng
 */
router.put('/a/:serial/khu-vuc', async (req, res, next) => {
  try {
    const serial = String(req.params.serial || '').toUpperCase();
    const maTinh = String(req.body?.ma_tinh || '');
    const maXa = req.body?.ma_xa ? String(req.body.ma_xa) : null;

    if (!serialDungDinhDang(serial) || !khuVucHopLe(maTinh, maXa)) {
      return res.status(400).json({ loi: 'Khu vực không hợp lệ' });
    }

    const { rows } = await truyVan(
      `SELECT id, trang_thai, kich_hoat_luc, khu_vuc_ma_tinh,
              (kich_hoat_luc > now() - interval '30 minutes') AS con_han
         FROM tem WHERE serial = $1`,
      [serial]
    );
    const t = rows[0];
    // Không phân biệt "không có tem" với "dấu sai": cùng một câu trả lời.
    if (!t || t.trang_thai !== 'DA_KICH_HOAT' || !t.kich_hoat_luc ||
        !dungDauKhuVuc(req.body?.dau, serial, t.kich_hoat_luc)) {
      return res.status(403).json({ loi: 'Không ghi được khu vực cho tem này' });
    }
    if (!t.con_han) return res.status(409).json({ loi: 'Đã quá thời gian khai khu vực cho tem này' });
    if (t.khu_vuc_ma_tinh) return res.status(409).json({ loi: 'Tem này đã có khu vực' });

    const kq = await truyVan(
      `UPDATE tem SET khu_vuc_ma_tinh = $2, khu_vuc_ma_xa = $3, khu_vuc_luc = now()
        WHERE id = $1 AND khu_vuc_ma_tinh IS NULL RETURNING id`,
      [t.id, maTinh, maXa]
    );
    if (kq.rowCount === 0) return res.status(409).json({ loi: 'Tem này đã có khu vực' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
