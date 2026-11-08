import { docPhieu } from '../lib/auth.js';
import { truyVan } from '../db.js';

/**
 * Chặn mọi yêu cầu không mang phiếu hợp lệ.
 * Gắn req.nguoi = { id, co_so_id, vai_tro } cho các bước sau dùng.
 */
export function canDangNhap(req, res, next) {
  const header = req.headers.authorization || '';
  const phieu = header.startsWith('Bearer ') ? header.slice(7) : null;
  const noi_dung = phieu ? docPhieu(phieu) : null;

  if (!noi_dung) {
    return res.status(401).json({ loi: 'Chưa đăng nhập hoặc phiên đã hết hạn' });
  }
  req.nguoi = noi_dung;
  next();
}

/**
 * Chặn theo vai trò.
 *   canVaiTro('quan_tri')                 chỉ quản trị cơ sở
 *   canVaiTro('quan_tri','nhap_lieu')     một trong hai
 */
export function canVaiTro(...vaiTro) {
  return (req, res, next) => {
    if (!req.nguoi || !vaiTro.includes(req.nguoi.vai_tro)) {
      return res.status(403).json({
        loi: 'Vai trò hiện tại không được phép thực hiện thao tác này',
        can_vai_tro: vaiTro,
      });
    }
    next();
  };
}

/**
 * Ghi nhật ký thao tác. Chỉ ghi thêm — bảng nhat_ky đã chặn sửa và xoá ở
 * mức cơ sở dữ liệu nên kể cả mã nguồn có lỗi cũng không xoá được.
 */
export async function ghiNhatKy(nguoiId, hanhDong, doiTuong, chiTiet) {
  try {
    await truyVan(
      'INSERT INTO nhat_ky (nguoi_id, hanh_dong, doi_tuong, chi_tiet) VALUES ($1,$2,$3,$4)',
      [nguoiId || null, hanhDong, doiTuong || null, chiTiet ? JSON.stringify(chiTiet) : null]
    );
  } catch (e) {
    console.error('Không ghi được nhật ký:', e.message);
  }
}
