-- Hành trình của lô: nguyên liệu → chưng cất → (kiểm nghiệm đã có) → đóng chai.
-- Một cột JSONB, máy chủ tự làm sạch và kiểm tra trước khi ghi (xem src/lib/hanhtrinh.js).
-- Mỗi chặng có địa điểm riêng vì vùng trồng, nơi chưng cất và nơi đóng chai có thể ở các tỉnh khác nhau.
ALTER TABLE lo ADD COLUMN IF NOT EXISTS hanh_trinh JSONB;
