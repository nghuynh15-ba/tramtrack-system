-- Ảnh bằng chứng đính kèm báo cáo của người tiêu dùng.
-- Mỗi báo cáo tối đa 2 ảnh (giới hạn ở tầng ứng dụng). Ảnh lưu dạng data URL
-- JPEG đã nén ở trình duyệt. Xoá báo cáo thì ảnh đi theo.
CREATE TABLE IF NOT EXISTS bao_cao_anh (
  id          BIGSERIAL PRIMARY KEY,
  bao_cao_id  BIGINT      NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  thu_tu      SMALLINT    NOT NULL DEFAULT 1,
  anh         TEXT        NOT NULL,
  tao_luc     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bao_cao_anh_bc_idx ON bao_cao_anh (bao_cao_id);
