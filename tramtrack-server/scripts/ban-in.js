import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

/**
 * Dựng bản in A4 từ tệp CSV do scripts/mint.js xuất ra.
 *
 *   node scripts/ban-in.js --tep IN-LO-2026-Q4-01-1234567890.csv
 *
 * Kết quả là một tệp HTML. Mở bằng trình duyệt rồi Ctrl+P, chọn khổ A4,
 * đặt lề 0 và TẮT "scale to fit" — nếu không con tem sẽ in sai kích thước
 * thật và lớp cào dán lên sẽ lệch.
 *
 * Con tem theo bản rút gọn 30 × 20 mm:
 *   - một mã QR công khai 13 × 13 mm, quét được khi tem còn nguyên
 *   - serial in dưới mã QR
 *   - một dải 24 × 7 mm chứa mã 12 ký tự, dán miếng cào lên trên
 *
 * Bỏ mã QR ẩn so với bản cũ. Người mua gõ tay 12 ký tự. Đổi lại con tem
 * vừa chai 10 ml và không còn lo cào rách mã.
 */

const args = process.argv.slice(2);
const doc = (ten, md) => { const i = args.indexOf(`--${ten}`); return i >= 0 && args[i+1] ? args[i+1] : md; };

const tep   = doc('tep');
const COT   = parseInt(doc('cot', '6'), 10);
const HANG  = parseInt(doc('hang', '12'), 10);

if (!tep) {
  console.error('Thiếu --tep. Ví dụ: node scripts/ban-in.js --tep IN-LO-2026-Q4-01-1760000000000.csv');
  process.exit(1);
}

const dong = readFileSync(tep, 'utf8').trim().split(/\r?\n/);
const dau = dong[0].split(',');
const iSerial = dau.indexOf('serial');
const iMa     = dau.indexOf('ma_bi_mat');
const iUrl    = dau.indexOf('url_tang_1');
if (iSerial < 0 || iMa < 0 || iUrl < 0) {
  console.error('Tệp CSV không đúng định dạng. Cần có cột serial, ma_bi_mat, url_tang_1.');
  process.exit(1);
}

const tem = dong.slice(1).filter(Boolean).map((d) => {
  const c = d.split(',');
  return { serial: c[iSerial], ma: c[iMa], url: c[iUrl] };
});

console.log(`Đang dựng bản in cho ${tem.length} con tem...`);

// Mã QR dạng SVG, mức sửa lỗi cao để chịu được trầy xước và in mờ.
const o = [];
for (const t of tem) {
  o.push({
    ...t,
    qr: await QRCode.toString(t.url, {
      type: 'svg', errorCorrectionLevel: 'H', margin: 0, width: 200,
    }),
  });
}

const moiTrang = COT * HANG;
const soTrang = Math.ceil(o.length / moiTrang);

const oTem = (t) => `
  <div class="tem">
    <div class="tren">
      <div class="qr">${t.qr}</div>
      <div class="hieu">
        <div class="nhan">TRAMTRACK</div>
        <div class="mien">tramtrack.vn</div>
        <div class="serial">${t.serial}</div>
      </div>
    </div>
    <div class="cao">
      <div class="ma">${t.ma}</div>
    </div>
  </div>`;

const trang = [];
for (let p = 0; p < soTrang; p++) {
  const lat = o.slice(p * moiTrang, (p + 1) * moiTrang);
  trang.push(`<section class="trang">
    <div class="luoi">${lat.map(oTem).join('')}</div>
    <div class="chan">TramTrack · trang ${p + 1}/${soTrang} · ${lat.length} tem ·
      ${lat[0].serial} → ${lat[lat.length - 1].serial}</div>
  </section>`);
}

const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8">
<title>Bản in tem — ${tem.length} con</title>
<style>
  @page { size: A4; margin: 8mm; }
  * { box-sizing: border-box; }
  body { margin:0; background:#555; font-family: "Segoe UI", Arial, sans-serif; }

  .trang {
    width: 210mm; min-height: 297mm; padding: 8mm;
    background:#fff; margin: 10mm auto; page-break-after: always;
    display:flex; flex-direction:column;
  }
  .luoi {
    display:grid;
    grid-template-columns: repeat(${COT}, 30mm);
    grid-auto-rows: 20mm;
    gap: 2mm;
    justify-content: center;
  }

  /* --- con tem 30 × 20 mm --- */
  .tem {
    width:30mm; height:20mm; padding:1mm;
    border:0.2mm dashed #bbb;           /* đường cắt, không in đậm */
    display:flex; flex-direction:column; justify-content:space-between;
    overflow:hidden;
  }
  .tren { display:flex; gap:1mm; align-items:flex-start; }
  .qr   { width:9mm; height:9mm; flex:0 0 9mm; }
  .qr svg { width:100%; height:100%; display:block; }
  .hieu { flex:1; min-width:0; }
  .nhan   { font-size:2.1mm; font-weight:700; letter-spacing:.12mm; color:#111; line-height:1.1; }
  .mien   { font-size:1.6mm; color:#555; line-height:1.2; margin-top:.2mm; }
  .serial { font-family:"Consolas",monospace; font-size:1.95mm; font-weight:700;
            color:#111; margin-top:.8mm; letter-spacing:.02mm; white-space:nowrap; }

  /* --- dải phủ cào 24 × 7 mm: dán miếng cào lên đúng ô này --- */
  .cao {
    width:26mm; height:7.5mm; margin:0 auto;
    border:0.25mm solid #999; border-radius:0.6mm;
    display:flex; align-items:center; justify-content:center;
    background:#fff;
  }
  /* 14 ký tự (12 mã + 2 gạch) ở cỡ 2,75mm chiếm khoảng 23mm — vừa ô 26mm.
     To hơn là tràn, nhỏ hơn là khó gõ tay. */
  .ma { font-family:"Consolas",monospace; font-size:2.75mm; font-weight:700;
        letter-spacing:0; color:#000; white-space:nowrap; }

  .chan { margin-top:auto; padding-top:3mm; font-size:2.6mm; color:#888; text-align:center; }

  @media print {
    body { background:#fff; }
    .trang { margin:0; box-shadow:none; }
    .huongdan { display:none; }
  }
  .huongdan {
    width:210mm; margin:10mm auto 0; padding:6mm 8mm; background:#FDF6E8;
    border:1px solid #D8C9A0; border-radius:4px; font-size:13px; color:#3a3a2a; line-height:1.6;
  }
  .huongdan b { color:#7a5b10; }
  .huongdan ol { margin:8px 0 0; padding-left:20px; }
</style></head><body>

<div class="huongdan">
  <b>Trước khi in — đọc kỹ ba dòng này</b>
  <ol>
    <li>Chọn khổ <b>A4</b>, đặt lề <b>None / 0</b>, và <b>TẮT</b> tuỳ chọn "Fit to page" hoặc "Scale to fit".
        Bật nó lên thì tem in ra sai kích thước thật và miếng cào dán vào sẽ lệch.</li>
    <li>In thử <b>một trang ra giấy thường</b> trước, lấy thước đo một con tem:
        phải đúng <b>30 × 20 mm</b>. Đúng rồi mới in lên giấy decal.</li>
    <li>Dán miếng cào lên đúng ô viền 26 × 7,5 mm ở dưới mỗi con tem — ô chứa mã 12 ký tự.
        <b>Che kín, không để hở mép.</b> Soi đèn pin từ phía sau không được đọc ra chữ.</li>
  </ol>
  <b>Tệp này chứa mã bí mật ở dạng đọc được.</b> In và dán cào xong thì xoá cả tệp HTML này
  lẫn tệp CSV gốc. Cơ sở dữ liệu chỉ giữ bản băm nên không khôi phục lại được.
</div>

${trang.join('\n')}
</body></html>`;

const ten = tep.replace(/\.csv$/i, '') + '-BAN-IN.html';
writeFileSync(ten, html, 'utf8');

console.log(`
Xong. Bản in: ${ten}

  ${tem.length} tem · ${COT} cột × ${HANG} hàng · ${soTrang} trang A4
  Tem 30 × 20 mm, mã QR công khai 9 mm, dải phủ cào 26 × 7,5 mm

Mở tệp bằng trình duyệt rồi Ctrl+P. Đọc khung hướng dẫn màu vàng ở đầu trang
trước khi bấm in — nhất là chỗ TẮT "scale to fit".

  !!  Tệp này và tệp CSV gốc đều chứa mã bí mật dạng đọc được.
  !!  In xong, dán cào xong thì xoá cả hai.
`);
