-- =====================================================================
-- TramTrack — lược đồ cơ sở dữ liệu tối thiểu cho vòng chung kết
-- Ba bảng: lo, tem, su_kien_quet
--
-- Ghi chú về quyền riêng tư: bảng su_kien_quet KHÔNG có cột địa chỉ IP.
-- IP chỉ tồn tại trong bộ nhớ đủ lâu để tra ra tên tỉnh rồi bị bỏ.
-- Đây là ràng buộc ở mức lược đồ, không phải lời hứa trong tài liệu.
-- =====================================================================

-- ---------------------------------------------------------------------
-- LÔ SẢN XUẤT
-- Một lô gắn với đúng một phiếu kiểm nghiệm.
-- Quy tắc nghiệp vụ: phải có COA mới được chuyển sang DA_PHAT_HANH.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lo (
  id                  SERIAL PRIMARY KEY,
  ma_lo               TEXT        NOT NULL UNIQUE,
  ten_dong_sp         TEXT        NOT NULL,
  ngay_chung_cat      DATE,

  -- phiếu kiểm nghiệm: bắt buộc trước khi phát hành
  ham_luong_cineole   NUMERIC(5,2),
  so_phieu_coa        TEXT,
  don_vi_kiem_nghiem  TEXT,
  anh_phieu_coa       TEXT,

  trang_thai          TEXT        NOT NULL DEFAULT 'NHAP'
                      CHECK (trang_thai IN ('NHAP','DA_PHAT_HANH','DA_THU_HOI')),
  ly_do_thu_hoi       TEXT,
  thu_hoi_luc         TIMESTAMPTZ,

  tao_luc             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Không cho phát hành lô khi chưa có phiếu kiểm nghiệm.
ALTER TABLE lo DROP CONSTRAINT IF EXISTS lo_phat_hanh_can_coa;
ALTER TABLE lo ADD CONSTRAINT lo_phat_hanh_can_coa CHECK (
  trang_thai <> 'DA_PHAT_HANH'
  OR (so_phieu_coa IS NOT NULL AND ham_luong_cineole IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- TEM — mỗi dòng là MỘT đơn vị sản phẩm (một chai)
-- Đây là chỗ thể hiện định danh cấp đơn vị thay vì cấp lô.
--
-- ma_an_bam: chỉ lưu bản băm Argon2id (đã kèm muối riêng trong chuỗi).
-- Mã bí mật dạng thô KHÔNG BAO GIỜ được ghi vào bảng này.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tem (
  id              BIGSERIAL PRIMARY KEY,
  serial          TEXT        NOT NULL UNIQUE,
  ma_an_bam       TEXT        NOT NULL,
  lo_id           INTEGER     NOT NULL REFERENCES lo(id),

  trang_thai      TEXT        NOT NULL DEFAULT 'CHUA_KICH_HOAT'
                  CHECK (trang_thai IN ('CHUA_KICH_HOAT','DA_KICH_HOAT','DA_HUY')),

  -- dấu vết lần kích hoạt đầu tiên, dùng làm bằng chứng ở màn CẢNH BÁO
  kich_hoat_luc   TIMESTAMPTZ,
  kich_hoat_tinh  TEXT,

  -- chống dò mã: 5 lần sai thì khoá serial này 15 phút
  so_lan_sai      INTEGER     NOT NULL DEFAULT 0,
  khoa_den        TIMESTAMPTZ,

  tao_luc         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tem_lo_idx    ON tem (lo_id);
CREATE INDEX IF NOT EXISTS tem_trang_idx ON tem (trang_thai);

-- ---------------------------------------------------------------------
-- SỰ KIỆN QUÉT — ghi sự kiện ẩn danh, không dựng hồ sơ người dùng
-- Không có cột ip. Không có cột định danh thiết bị. Cố ý.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS su_kien_quet (
  id            BIGSERIAL PRIMARY KEY,
  tem_id        BIGINT      REFERENCES tem(id),
  loai          TEXT        NOT NULL
                CHECK (loai IN ('TRA_CUU_T1','KICH_HOAT_OK','KICH_HOAT_TRUNG',
                                'MA_SAI','KHONG_TIM_THAY','BI_KHOA','DA_THU_HOI')),
  thoi_diem     TIMESTAMPTZ NOT NULL DEFAULT now(),
  tinh_uoc_tinh TEXT
);

CREATE INDEX IF NOT EXISTS su_kien_tem_idx  ON su_kien_quet (tem_id);
CREATE INDEX IF NOT EXISTS su_kien_thoi_idx ON su_kien_quet (thoi_diem);
