-- =====================================================================
-- TramTrack — bổ sung phần quản trị
-- Thêm ba bảng: co_so, nguoi_dung, bao_cao
-- Cộng với lo, tem, su_kien_quet ở tệp 001 là đủ sáu bảng.
-- =====================================================================

-- ---------------------------------------------------------------------
-- SỐ THỨ TỰ SERIAL — cấp phát toàn hệ thống, không theo từng lô
--
-- Cột tem.serial là DUY NHẤT trên toàn bảng. Nếu đánh số theo từng lô thì
-- lô thứ hai sẽ sinh lại TDT-2026-000001 và đâm vào lô thứ nhất.
--
-- Dùng chuỗi số của Postgres vì nextval() là nguyên tử: hai người cùng bấm
-- sinh mã một lúc vẫn nhận hai dải số rời nhau, không cần khoá bảng.
--
-- Dải từ 900000 trở lên dành riêng cho tem demo, chuỗi này không chạm tới.
-- ---------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS tem_so_thu_tu START 1 MAXVALUE 899999;

-- ---------------------------------------------------------------------
-- CƠ SỞ SẢN XUẤT — mỗi cơ sở là một người thuê riêng trên hệ thống
--
-- Pure Global là nhà máy gia công, sản xuất cho nhiều thương hiệu khách
-- hàng khác nhau. Mỗi thương hiệu phải có không gian dữ liệu riêng, nếu
-- không thì nhà máy không dùng được. Đó là lý do bảng này tồn tại ngay
-- từ đầu chứ không để thêm sau.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS co_so (
  id          SERIAL PRIMARY KEY,
  ma_co_so    TEXT        NOT NULL UNIQUE,
  ten         TEXT        NOT NULL,
  dia_chi     TEXT,
  ma_so_thue  TEXT,
  kich_hoat   BOOLEAN     NOT NULL DEFAULT true,
  tao_luc     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gắn lô vào cơ sở. Cho phép NULL để dữ liệu cũ không gãy.
ALTER TABLE lo ADD COLUMN IF NOT EXISTS co_so_id INTEGER REFERENCES co_so(id);
CREATE INDEX IF NOT EXISTS lo_co_so_idx ON lo (co_so_id);

-- ---------------------------------------------------------------------
-- NGƯỜI DÙNG — nhân sự của cơ sở, bốn vai trò
--
--   quan_tri    toàn quyền trong phạm vi cơ sở, được phát hành và thu hồi lô
--   nhap_lieu   tạo và sửa lô, KHÔNG được tự phát hành
--   kiem_nghiem gắn phiếu kiểm nghiệm vào lô
--   nguoi_xem   chỉ đọc
--
-- Việc tách quyền phát hành ra khỏi quyền nhập liệu là có chủ đích: một
-- người không được vừa khai dữ liệu vừa tự duyệt dữ liệu của chính mình.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nguoi_dung (
  id            SERIAL PRIMARY KEY,
  co_so_id      INTEGER     NOT NULL REFERENCES co_so(id),
  email         TEXT        NOT NULL UNIQUE,
  mat_khau_bam  TEXT        NOT NULL,
  ho_ten        TEXT        NOT NULL,
  vai_tro       TEXT        NOT NULL
                CHECK (vai_tro IN ('quan_tri','nhap_lieu','kiem_nghiem','nguoi_xem')),
  kich_hoat     BOOLEAN     NOT NULL DEFAULT true,
  dang_nhap_luc TIMESTAMPTZ,
  tao_luc       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nguoi_dung_co_so_idx ON nguoi_dung (co_so_id);

-- ---------------------------------------------------------------------
-- BÁO CÁO NGHI NGỜ — người tiêu dùng gửi về
--
-- Đây là thứ biến hệ thống từ công cụ tra cứu thành công cụ có ích thật
-- cho cơ sở: họ biết hàng nghi vấn xuất hiện ở đâu.
--
-- Không bắt người báo cáo đăng nhập, không bắt khai tên. Trường lien_he
-- để trống được và chỉ dùng khi cơ sở cần hỏi lại.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bao_cao (
  id              BIGSERIAL PRIMARY KEY,
  tem_id          BIGINT      REFERENCES tem(id),
  serial_khai_bao TEXT        NOT NULL,
  ly_do           TEXT        NOT NULL
                  CHECK (ly_do IN ('MA_KHONG_TON_TAI','MA_DA_KICH_HOAT','TEM_BI_RACH',
                                   'NGHI_HANG_GIA','KHAC')),
  noi_dung        TEXT,
  noi_mua         TEXT,
  anh             TEXT,
  lien_he         TEXT,
  tinh_uoc_tinh   TEXT,
  trang_thai      TEXT        NOT NULL DEFAULT 'MOI'
                  CHECK (trang_thai IN ('MOI','DANG_XU_LY','DA_XU_LY','BO_QUA')),
  ghi_chu_xu_ly   TEXT,
  xu_ly_boi       INTEGER     REFERENCES nguoi_dung(id),
  xu_ly_luc       TIMESTAMPTZ,
  tao_luc         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bao_cao_trang_idx ON bao_cao (trang_thai);
CREATE INDEX IF NOT EXISTS bao_cao_tem_idx   ON bao_cao (tem_id);
CREATE INDEX IF NOT EXISTS bao_cao_thoi_idx  ON bao_cao (tao_luc DESC);

-- ---------------------------------------------------------------------
-- NHẬT KÝ THAO TÁC QUẢN TRỊ — chỉ ghi thêm, không sửa, không xoá
--
-- Khi có tranh chấp về một lô thì đây là thứ đầu tiên phải lôi ra.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nhat_ky (
  id          BIGSERIAL PRIMARY KEY,
  nguoi_id    INTEGER     REFERENCES nguoi_dung(id),
  hanh_dong   TEXT        NOT NULL,
  doi_tuong   TEXT,
  chi_tiet    JSONB,
  thoi_diem   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nhat_ky_thoi_idx ON nhat_ky (thoi_diem DESC);

-- Chặn sửa và xoá ở mức cơ sở dữ liệu, không chỉ ở mức mã nguồn.
CREATE OR REPLACE RULE nhat_ky_khong_sua AS ON UPDATE TO nhat_ky DO INSTEAD NOTHING;
CREATE OR REPLACE RULE nhat_ky_khong_xoa AS ON DELETE TO nhat_ky DO INSTEAD NOTHING;
