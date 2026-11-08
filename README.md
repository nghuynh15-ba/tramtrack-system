# TramTrack — Hệ thống xác thực & truy xuất nguồn gốc sản phẩm

Hệ thống chống hàng giả bằng **tem QR hai tầng**: người tiêu dùng quét QR để tra cứu sản phẩm, rồi cào lớp phủ lấy mã bí mật để **kích hoạt** — mỗi mã chỉ kích hoạt được một lần. Nhà sản xuất quản lý lô hàng, sinh mã, in tem và theo dõi báo cáo nghi ngờ trên trang quản trị.

## Bài toán nghiệp vụ

| Vấn đề | Cách hệ thống giải quyết |
|---|---|
| Hàng giả sao chép được mã QR | Tem có 2 tầng: QR công khai (tra cứu) + mã bí mật dưới lớp cào (kích hoạt một lần) |
| Không biết sản phẩm đã bị dùng lại mã hay chưa | Ghi nhận sự kiện kích hoạt đầu tiên (thời điểm, khu vực); lần quét sau trả cảnh báo |
| Nhà máy gia công cho nhiều thương hiệu | Mỗi cơ sở là một "người thuê" riêng, dữ liệu tách biệt theo `co_so_id` |
| Rủi ro gian lận nội bộ | Phân quyền 4 vai trò; người nhập liệu không tự phát hành/thu hồi lô |
| Lô chưa kiểm nghiệm vẫn ra thị trường | Không phát hành được lô nếu chưa có phiếu kiểm nghiệm (COA) |

## Vai trò người dùng

- **Người tiêu dùng** — tra cứu, kích hoạt, gửi báo cáo nghi ngờ (không cần đăng nhập)
- **Quản trị (`quan_tri`)**, **Nhập liệu (`nhap_lieu`)**, **Kiểm nghiệm (`kiem_nghiem`)**, **Người xem (`nguoi_xem`)**

## Tính năng chính

- Tra cứu tem (Tầng 1) và kích hoạt sau khi cào (Tầng 2)
- Quản lý lô: tạo → kiểm nghiệm → phát hành → thu hồi (có lý do)
- Sinh mã hàng loạt, xuất CSV và dựng bản in tem A4 (72 tem/trang)
- Bảng điều khiển thống kê, xử lý báo cáo nghi ngờ
- Nhật ký thao tác chỉ ghi thêm (chặn `UPDATE`/`DELETE` ngay ở CSDL)

## Quyết định thiết kế đáng chú ý

- **Chống kích hoạt đồng thời**: dùng cập nhật có điều kiện thay vì đọc-rồi-ghi; kiểm chứng bằng 100 vòng thử song song.
- **Chống dò mã**: mã sai và serial không tồn tại trả lời giống hệt nhau, có sàn thời gian phản hồi.
- **Bảo mật dữ liệu**: mã bí mật chỉ lưu dạng băm Argon2; không lưu địa chỉ IP (ràng buộc ở mức lược đồ).
- **Không "phán" hàng thật/giả**: hệ thống chỉ báo sự kiện (mã đã kích hoạt lúc nào, ở đâu).

## Công nghệ

| Tầng | Công nghệ |
|---|---|
| Backend | Node.js ≥ 20, Express, PostgreSQL (`pg`), Argon2 |
| Frontend | React 18, Vite, Tailwind CSS, `html5-qrcode`, `lucide-react` |

## Cấu trúc

```
tramtrack-system/
├── tramtrack-server/   # API (16 điểm cuối, 6 bảng, 7 script)
├── tramtrack-client/   # Giao diện React
└── deploy/             # Script đóng gói & cài đặt
```

## Chạy thử ở máy

```bash
# Backend
cd tramtrack-server
npm install
cp .env.example .env        # điền DATABASE_URL và TOKEN_SECRET (>= 32 ký tự)
npm run migrate             # tạo bảng
npm run tao-nguoi-dung      # tạo tài khoản quản trị
npm run seed-demo           # dữ liệu demo
npm run dev                 # http://localhost:3000

# Frontend (terminal khác)
cd tramtrack-client
npm install
npm run dev
```

Tài liệu API đầy đủ: xem [`tramtrack-server/README.md`](tramtrack-server/README.md).

## Kiểm thử

```bash
npm run test:race   # 100 vòng, mỗi vòng 2 yêu cầu kích hoạt song song
npm run test:api    # 44 phép thử toàn bộ API
```

## Vai trò của tôi

> _Điền vào: bạn phụ trách phần nào (phân tích yêu cầu, thiết kế CSDL, viết API, giao diện...)._
