-- Khu vực kích hoạt do người mua tự khai (tùy chọn): mã tỉnh/thành và mã xã/phường
-- theo đơn vị hành chính hiện hành. Chỉ lưu mã, không toạ độ, không địa chỉ mạng.
ALTER TABLE tem ADD COLUMN IF NOT EXISTS khu_vuc_ma_tinh TEXT;
ALTER TABLE tem ADD COLUMN IF NOT EXISTS khu_vuc_ma_xa   TEXT;
ALTER TABLE tem ADD COLUMN IF NOT EXISTS khu_vuc_luc     TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS tem_khu_vuc_idx ON tem (khu_vuc_ma_tinh) WHERE khu_vuc_ma_tinh IS NOT NULL;
