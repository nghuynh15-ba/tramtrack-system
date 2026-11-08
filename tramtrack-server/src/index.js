import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as verifyRouter }    from './routes/verify.js';
import { router as activateRouter }  from './routes/activate.js';
import { router as reportRouter }    from './routes/report.js';
import { router as adminAuthRouter } from './routes/admin-auth.js';
import { router as adminLoRouter }   from './routes/admin-lo.js';
import { router as adminBcRouter }   from './routes/admin-bao-cao.js';
import { kiemTraKetNoi } from './db.js';
import { khoiDongBamGia, doThoiGianBam } from './lib/hash.js';

const app = express();

// Chạy sau proxy của nền tảng triển khai thì mới đọc đúng X-Forwarded-For.
app.set('trust proxy', 1);

// /bao-cao nhận tới 2 ảnh bằng chứng nên cần hạn lớn hơn; mọi đường khác giữ
// 256 KB. Phải tách từ đầu: bộ đọc JSON toàn cục chạy trước và sẽ từ chối
// yêu cầu lớn bằng lỗi 413 trước khi tới được bộ đọc riêng của đường này.
const jsonNho = express.json({ limit: '256kb' });
const jsonBaoCao = express.json({ limit: '700kb' });
app.use((req, res, next) => (req.path === '/api/v1/bao-cao' ? jsonBaoCao : jsonNho)(req, res, next));
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.disable('x-powered-by');

app.get('/api/v1/health', async (_req, res) => {
  try {
    const bayGio = await kiemTraKetNoi();
    res.json({ ok: true, csdl: 'ket_noi_duoc', thoi_diem: bayGio });
  } catch (e) {
    res.status(503).json({ ok: false, loi: e.message });
  }
});

// ---- công khai, người tiêu dùng gọi ----
app.use('/api/v1', verifyRouter);     // GET  /s/:serial      Tầng 1
app.use('/api/v1', activateRouter);   // POST /a/:serial      Tầng 2
app.use('/api/v1', reportRouter);     // POST /bao-cao

// ---- quản trị, phải đăng nhập ----
app.use('/api/v1/qt', adminAuthRouter);  // dang-nhap, toi, doi-mat-khau
app.use('/api/v1/qt', adminLoRouter);    // lô, sinh mã, phát hành, thu hồi
app.use('/api/v1/qt', adminBcRouter);    // thống kê, báo cáo nghi ngờ

app.use((_req, res) => res.status(404).json({ loi: 'Không có đường dẫn này' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ loi: 'Lỗi máy chủ' });
});

const PORT = Number(process.env.PORT || 3000);

(async () => {
  await khoiDongBamGia();            // dựng sẵn băm giả để làm phẳng thời gian
  const ms = await doThoiGianBam();  // số liệu này ghi vào Chương 5 của quyển
  console.log(`Thời gian băm Argon2id một lần: ${ms.toFixed(1)} ms`);
  app.listen(PORT, () => console.log(`TramTrack API đang chạy ở cổng ${PORT}`));
})();
