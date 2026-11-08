/**
 * Tra tỉnh thành từ địa chỉ IP — phiên bản tối thiểu cho vòng chung kết.
 *
 * NGUYÊN TẮC, không được vi phạm:
 *   1. Chỉ trả về tên tỉnh. Không trả quận huyện, không trả toạ độ.
 *   2. Địa chỉ IP KHÔNG được ghi xuống cơ sở dữ liệu. Nó chỉ sống trong
 *      bộ nhớ đủ lâu để gọi hàm này rồi bị bỏ.
 *   3. Trả về null khi không chắc. Giao diện xử lý null bằng cách chỉ hiện
 *      thời gian, không hiện địa điểm — đúng quy tắc nghiệp vụ đã chốt:
 *      "chỉ hiện vị trí khi khác tỉnh, cùng tỉnh thì hiện khoảng thời gian".
 *
 * Mạng di động Việt Nam dùng NAT nhiều, nên IP thường chỉ ra tới tỉnh đặt
 * cổng của nhà mạng chứ không phải tỉnh của người quét. Vì vậy giao diện
 * luôn phải ghi "khu vực ước tính", và đó là lý do mặc định trả null:
 * thà không hiện còn hơn hiện sai tỉnh rồi làm hỏng chính bằng chứng.
 */

const BO_QUA = new Set(['127.0.0.1', '::1', 'localhost']);

/** Lấy IP từ request, có tính đến khi chạy sau proxy của nền tảng triển khai */
export function layIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

/**
 * Tra tỉnh. Bản hiện tại luôn trả null — cố ý, xem ghi chú ở đầu file.
 *
 * Khi nào cần bật thật: nạp một bảng dải IP Việt Nam vào bộ nhớ lúc khởi
 * động rồi tra nhị phân ở đây. Không gọi dịch vụ ngoài trong lúc xử lý
 * yêu cầu, vì như vậy là gửi IP của người quét cho bên thứ ba.
 */
export function traTinhTuIp(ip) {
  if (!ip || BO_QUA.has(ip)) return null;
  return null;
}

/** Hàm tiện dụng: nhận request, trả tên tỉnh hoặc null, không giữ lại IP */
export function tinhCuaRequest(req) {
  return traTinhTuIp(layIp(req));
}
