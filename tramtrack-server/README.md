# TramTrack — API xác thực và truy xuất

Backend hoàn chỉnh. **Sáu bảng, mười sáu điểm cuối, bảy script.**
44/44 phép thử API đạt, 100/100 vòng chống kích hoạt đồng thời đạt.

---

## Chạy lần đầu

```powershell
cd D:\tramtrack-system\tramtrack-server
npm install
```

Tạo tệp `.env` (xem `.env.example`). Hai thứ bắt buộc:

```
DATABASE_URL=postgresql://postgres:MATKHAU@localhost:5432/tramtrack
DATABASE_SSL=false
TOKEN_SECRET=<chuỗi ngẫu nhiên từ 32 ký tự trở lên>
```

Sinh `TOKEN_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Rồi:

```powershell
npm run migrate            # tạo sáu bảng
npm run tao-nguoi-dung     # tạo cơ sở + tài khoản quản trị, in mật khẩu MỘT LẦN
npm run seed-demo          # ba con tem cho kịch bản demo
npm run dev                # chạy ở cổng 3000
```

---

## Mười sáu điểm cuối

### Công khai — người tiêu dùng gọi, không cần đăng nhập

| | |
|---|---|
| `GET /api/v1/health` | máy chủ và cơ sở dữ liệu còn sống không |
| `GET /api/v1/s/:serial` | **Tầng 1** — tra cứu khi tem còn nguyên |
| `POST /api/v1/a/:serial` | **Tầng 2** — kích hoạt sau khi cào. Body `{ "ma": "7KQM-R4XH-P9TW" }` |
| `POST /api/v1/bao-cao` | gửi báo cáo nghi ngờ |

### Quản trị — cần phiếu đăng nhập trong header `Authorization: Bearer <phiếu>`

| | |
|---|---|
| `POST /api/v1/qt/dang-nhap` | `{ email, mat_khau }` → trả phiếu |
| `GET /api/v1/qt/toi` | ai đang đăng nhập |
| `POST /api/v1/qt/doi-mat-khau` | |
| `GET /api/v1/qt/lo` | danh sách lô kèm số tem và tỉ lệ kích hoạt |
| `POST /api/v1/qt/lo` | tạo lô |
| `GET /api/v1/qt/lo/:maLo` | chi tiết lô |
| `PATCH /api/v1/qt/lo/:maLo` | sửa lô — **chỉ khi còn ở trạng thái nháp** |
| `POST /api/v1/qt/lo/:maLo/phat-hanh` | **chặn nếu chưa có phiếu kiểm nghiệm** |
| `POST /api/v1/qt/lo/:maLo/thu-hoi` | bắt buộc nêu lý do |
| `POST /api/v1/qt/lo/:maLo/sinh-ma` | sinh N tem, trả mã **một lần duy nhất** |
| `GET /api/v1/qt/lo/:maLo/tem` | danh sách tem, không bao giờ trả mã |
| `GET /api/v1/qt/thong-ke` | số liệu cho bảng điều khiển |
| `GET /api/v1/qt/bao-cao` | danh sách báo cáo nghi ngờ |
| `PATCH /api/v1/qt/bao-cao/:id` | xử lý báo cáo |

Bốn vai trò: `quan_tri`, `nhap_lieu`, `kiem_nghiem`, `nguoi_xem`.
**Người nhập liệu không tự phát hành hay thu hồi lô được** — một người không
được vừa khai dữ liệu vừa tự duyệt dữ liệu của chính mình.

---

## In tem

```powershell
npm run mint -- --lo LO-2026-Q4-01 --so 30     # sinh mã, xuất CSV
npm run ban-in -- --tep IN-LO-2026-Q4-01-xxx.csv   # dựng bản in A4
```

Mở tệp HTML sinh ra bằng trình duyệt rồi Ctrl+P. **Chọn A4, lề 0, TẮT "scale
to fit"** — bật nó lên là tem in sai kích thước thật và miếng cào dán vào sẽ lệch.

Con tem bản rút gọn **30 × 20 mm**: mã QR công khai 9 mm, serial, và dải
**26 × 7,5 mm** chứa mã 12 ký tự để dán miếng cào lên. 72 tem một trang A4.

> Tệp CSV và tệp HTML đều chứa mã bí mật ở dạng đọc được. Cơ sở dữ liệu chỉ
> giữ bản băm nên không khôi phục lại được. **In xong, dán cào xong thì xoá cả hai.**
> In hỏng thì huỷ dải mã và sinh lại, không in lại mã cũ.

---

## Kiểm thử

```powershell
npm run test:race     # 100 vòng, mỗi vòng hai yêu cầu kích hoạt song song
npm run test:api      # 44 phép thử toàn bộ API, cần máy chủ đang chạy
```

`test:api` cần thêm `TEST_EMAIL` và `TEST_MAT_KHAU` trong `.env` thì mới chạy
phần quản trị.

Bộ kiểm thử không chỉ kiểm tra đường đi đúng — nó kiểm tra cả những chỗ **phải
bị chặn**: phiếu bị sửa chữ ký, sửa lô đã phát hành, phát hành lô chưa có COA,
danh sách tem rò mã, và rò rỉ qua thời gian phản hồi.

---

## Bảy quyết định đã cài vào mã, đừng vô tình gỡ

**Hệ thống không phán chai nào thật.** `CANH_BAO` trả về sự kiện — mã này đã
kích hoạt lúc nào, ở đâu — chứ không nói "chai của bạn là giả". Nếu mã bị lộ
từ lúc in thì kẻ gian kích hoạt trước, và lần đầu tiên lại chính là hàng giả.

**Mã sai và serial không tồn tại trả lời giống hệt nhau,** cùng kết quả và cùng
thời gian. Phân biệt được là cho kẻ dò mã biết đã tìm đúng serial. Mọi câu trả
lời Tầng 2 đều có **sàn thời gian 120 ms**; đăng nhập có sàn 250 ms.

**Kích hoạt dùng cập nhật có điều kiện,** không đọc rồi mới ghi. Chạy
`npm run test:race` để chứng minh.

**Serial lấy từ chuỗi số toàn hệ thống,** không đếm theo từng lô. Đếm theo lô
thì lô thứ hai sinh lại `TDT-2026-000001` và đâm vào lô thứ nhất — lỗi này đã
xảy ra thật trong lúc kiểm thử và được sửa bằng `nextval()`.

**Không lưu địa chỉ IP.** Bảng `su_kien_quet` không có cột IP — ràng buộc ở mức
lược đồ, không phải lời hứa trong tài liệu.

**Nhật ký thao tác chỉ ghi thêm.** Bảng `nhat_ky` có `RULE` chặn `UPDATE` và
`DELETE` ngay trong cơ sở dữ liệu, nên kể cả mã nguồn có lỗi cũng không xoá được.

**Mỗi cơ sở là một người thuê riêng.** Mọi truy vấn quản trị đều lọc theo
`co_so_id` của người đang đăng nhập. Pure Global là nhà máy gia công sản xuất
cho nhiều thương hiệu — không tách dữ liệu thì họ không dùng được.

---

## Trước khi triển khai

- [ ] **Chốt tên miền.** `PUBLIC_BASE_URL` đi thẳng vào mã QR, không sửa được sau khi in.
- [ ] Phải có **HTTPS**. Trình duyệt chỉ cho dùng camera trên `https` hoặc `localhost`.
- [ ] Đổi `CORS_ORIGIN` từ `*` sang đúng tên miền frontend.
- [ ] Đặt `TOKEN_SECRET` khác với lúc chạy ở máy.
- [ ] Cấu hình frontend trả `index.html` cho mọi đường dẫn, nếu không `/s/TDT-...` ra 404.
- [ ] Gọi `/api/v1/health` từ điện thoại thật, không chỉ từ máy tính.
