import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,

    /**
     * host: true mở cổng ra cả mạng LAN, không chỉ localhost.
     * Cần cho việc thử bằng điện thoại thật trong cùng wifi — mà quét tem bằng
     * điện thoại mới là cách dùng thật của hệ thống này.
     */
    host: true,

    /**
     * Cho phép mở qua đường hầm công khai (Cloudflare Tunnel) để thử Zalo bằng
     * địa chỉ HTTPS thật trước khi triển khai. Chỉ nhận các tên miền này, còn lại
     * vẫn bị Vite chặn. Bỏ dòng này khi không còn dùng đường hầm.
     */
    allowedHosts: ['.trycloudflare.com'],

    /**
     * Chuyển tiếp /api sang máy chủ ở cổng 3000.
     *
     * Chọn proxy thay vì để giao diện gọi thẳng http://localhost:3000 vì:
     *   1. Cùng gốc nên không vướng CORS, không có yêu cầu preflight.
     *   2. Điện thoại mở http://192.168.x.x:5173 là gọi API được ngay, không
     *      phải sửa địa chỉ máy chủ cho từng máy — nếu gọi thẳng localhost thì
     *      "localhost" trên điện thoại là chính cái điện thoại đó.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
