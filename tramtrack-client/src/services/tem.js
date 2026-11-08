import QRCode from 'qrcode';

/**
 * Dựng tem TramTrack: mã QR (có thể kèm logo ở giữa), serial, ô mã cào, và
 * trang in A4. Mọi thứ chạy trong trình duyệt, không gọi máy chủ.
 *
 * Mỗi con tem là MỘT ảnh SVG kích thước thật tính bằng mm (viewBox cũng là mm).
 * Chữ dùng `textLength` nên luôn vừa bề rộng đã tính, không phụ thuộc phông
 * của máy in. Bản xem trước trong màn hình và bản in xuất ra dùng chung các
 * hàm này, nên xem gì in nấy.
 *
 * Logo ở giữa mã QR: mức sửa lỗi luôn là H (khôi phục được khoảng 30% dữ liệu).
 * Vùng logo là một ô vuông k×k ô mã (k lẻ), các ô mã nằm dưới đó được BỎ đi
 * chứ không chồng lên, và phần bị bỏ giữ dưới 13% diện tích mã. Đó là cách làm
 * bảo thủ, nhưng vẫn phải quét thử trên tem in thật trước khi in hàng loạt.
 */

export const GAP_MM = 2;
const A4 = { rong: 210, cao: 297, le: 8 };

/**
 * Bốn khuôn theo cỡ chai. Bố cục dọc như mẫu: mã QR ở trên, ô mã bí mật (dưới lớp
 * cào) ngay dưới mã QR, rồi serial nhỏ, kèm hai nhãn đánh số "1 QUÉT" và "2 CÀO" (dòng "QUÉT ĐỂ TRUY XUẤT
 * NGUỒN GỐC" là tuỳ chọn, mặc định tắt). Chiều cao tem tính ra từ các phần bên trong (xem `boCuc`), không đặt cứng.
 * Cỡ mã QR và ô cào giữ theo bản tính trước; chiều rộng khuôn 30/30/26/16 mm.
 */
export const KHUON = {
  lon: {
    ten: 'Khổ lớn · chai từ 30 ml', ghi: 'QR 9 mm, ô mã 26 mm',
    rong: 30, qr: 9, caoRong: 26, caoCao: 6.5, chuMa: 2.75, dongMa: 1,
  },
  lon11: {
    ten: 'Khổ lớn, QR 11 mm · dễ quét hơn', ghi: 'Cùng chiều rộng 30 mm, QR to hơn',
    rong: 30, qr: 11, caoRong: 26, caoCao: 6.5, chuMa: 2.75, dongMa: 1,
  },
  vua: {
    ten: 'Khổ vừa · chai 10–20 ml', ghi: 'QR 8,5 mm, ô mã 22 mm',
    rong: 26, qr: 8.5, caoRong: 22, caoCao: 6, chuMa: 2.5, dongMa: 1,
  },
  nho: {
    ten: 'Khổ nhỏ · chai 5 ml', ghi: 'Hẹp 16 mm, mã xếp 3 dòng',
    rong: 16, qr: 9, caoRong: 11, caoCao: 10, chuMa: 2.5, dongMa: 3,
  },
  ngang5: {
    ten: 'Khổ ngang · chai 5–10 ml, vùng dán thấp', ghi: 'Rộng 32 mm, cao 17,6 mm, QR 11 mm, ô mã 16×10 mm',
    bo: 'ngang', rong: 32, qr: 11, caoRong: 16, caoCao: 10, chuMa: 2.5, dongMa: 3,
  },
};

const LE = 1.2;          // lề trong của tem (mm)

/**
 * Toạ độ các phần của tem dọc và chiều cao tem.
 * `coNhac`: có dòng "QUÉT ĐỂ TRUY XUẤT NGUỒN GỐC" hay không.
 * `coNhan`: có hai nhãn đánh số để người mua không nhầm mã QR với mã cào:
 * "1 · QUÉT KIỂM TRA" (xanh) dưới mã QR và thanh vàng "2 · CÀO ĐỂ KÍCH HOẠT" trên ô mã bí mật.
 */
function boCuc(K, coNhac = true, coNhan = true) {
  if (K.bo === 'ngang') {
    // Bố cục ngang cho chai nhỏ, vùng dán thấp: QR bên trái, ô mã bên phải, serial dưới cùng.
    const qrX = LE + 0.3;
    const qrY = LE + 0.3;
    const stripX = K.rong - (LE + 0.3) - K.caoRong;
    const tabY = qrY;
    const tabH = 2.1;
    const stripY = coNhan ? tabY + tabH + 0.15 : qrY;
    const capY = qrY + K.qr + 0.5 + 1.35;
    const duoi = Math.max(stripY + K.caoCao, capY);
    const serialY = duoi + 0.8 + 1.3;
    const cao = Math.round((serialY + 1.1) * 10) / 10;
    return { ngang: true, qrX, qrY, stripX, stripY, dongNhac: [], fsNhac: 1.3, nhacY0: 0, buocNhac: 1.75, serialY, cao, coNhan, capY, tabY, tabH, nhanQuet: 'QUÉT', nhanCao: 'CÀO MÃ' };
  }
  const qrX = (K.rong - K.qr) / 2;
  const qrY = LE + 0.3;
  const stripX = (K.rong - K.caoRong) / 2;
  const hep = K.rong < 20;                     // khuôn hẹp: lời nhắc 3 dòng, nhãn ngắn
  const nhanQuet = hep ? 'QUÉT' : 'QUÉT KIỂM TRA';
  const nhanCao = hep ? 'CÀO MÃ' : 'CÀO ĐỂ KÍCH HOẠT';
  const capY = qrY + K.qr + 0.5 + 1.35;        // đường cơ sở của nhãn quét
  const tabY = qrY + K.qr + 0.5 + 1.8 + 0.5;   // thanh vàng
  const tabH = 2.1;
  const stripY = coNhan ? tabY + tabH + 0.15 : qrY + K.qr + 0.9;
  const dongNhac = !coNhac ? [] : hep ? ['QUÉT ĐỂ', 'TRUY XUẤT', 'NGUỒN GỐC'] : ['QUÉT ĐỂ TRUY XUẤT NGUỒN GỐC'];
  const fsNhac = hep ? 1.5 : 1.3;
  const buocNhac = 1.75;
  const duoiO = stripY + K.caoCao;
  const nhacY0 = duoiO + 0.8 + 1.1;
  const serialY = dongNhac.length
    ? nhacY0 + (dongNhac.length - 1) * buocNhac + 2.0
    : duoiO + 0.8 + 1.3;
  const cao = Math.round((serialY + 1.1) * 10) / 10;
  return { qrX, qrY, stripX, stripY, dongNhac, fsNhac, nhacY0, buocNhac, serialY, cao, coNhan, capY, tabY, tabH, nhanQuet, nhanCao };
}
for (const k of Object.values(KHUON)) k.cao = boCuc(k).cao;

/** Chiều cao tem (mm) theo khuôn và có/không dòng lời nhắc. */
export const chieuCao = (khuon, coNhac = true, coNhan = true) => boCuc(KHUON[khuon], coNhac, coNhan).cao;

export const MAU_QR = { xanh: '#0B3D27', den: '#000000' };
const VANG = '#B8913A';

/** Cỡ ô logo theo tỉ lệ cạnh mã QR, làm tròn về số lẻ. */
const TI_LE_LOGO = { nho: 0.19, vua: 0.27, lon: 0.35 };
export const TOI_DA_LOGO_PHAN_TRAM = 13;

// ------------------------------------------------------------------ mã QR

export function maTran(noiDung) {
  const q = QRCode.create(noiDung, { errorCorrectionLevel: 'H' });
  const n = q.modules.size;
  return { n, version: q.version, toi: (r, c) => r >= 0 && c >= 0 && r < n && c < n && !!q.modules.get(r, c) };
}

/** Số ô vuông ở cạnh vùng logo (lẻ, tối thiểu 5, không quá giới hạn diện tích). */
export function coLogoO(n, coLogo) {
  let k = Math.round(n * (TI_LE_LOGO[coLogo] || TI_LE_LOGO.vua));
  if (k % 2 === 0) k += 1;
  k = Math.max(5, k);
  while (k > 5 && (k * k) / (n * n) * 100 > TOI_DA_LOGO_PHAN_TRAM) k -= 2;
  return k;
}

const so = (x) => String(Math.round(x * 1000) / 1000);

function hinhBoTron(x, y, w, h, r) {
  return `M${so(x + r)} ${so(y)}H${so(x + w - r)}a${r} ${r} 0 0 1 ${r} ${r}V${so(y + h - r)}a${r} ${r} 0 0 1 ${-r} ${r}H${so(x + r)}a${r} ${r} 0 0 1 ${-r} ${-r}V${so(y + r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
}

/**
 * Nhóm <g> vẽ mã QR trong hệ toạ độ mm. `viTri` = { x, y, kichThuoc }.
 * kieu: 'vuong' (an toàn nhất) | 'tron' (góc bo như bản mẫu).
 */
export function veQr(mt, { x, y, kichThuoc, mau, kieu, logo }) {
  const { n } = mt;
  const k = logo ? logo.k : 0;
  const a = k ? (n - k) / 2 : -1;
  const trongLogo = (r, c) => k > 0 && r >= a && r < a + k && c >= a && c < a + k;
  const trongMat = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const tron = kieu === 'tron';
  // Ô "đậm" dùng cho phép tính bo góc: bỏ ô thuộc mắt định vị và vùng logo.
  const dam = (r, c) => mt.toi(r, c) && !trongLogo(r, c) && !(tron && trongMat(r, c));

  let d = '';
  if (!tron) {
    for (let r = 0; r < n; r++) {
      let c = 0;
      while (c < n) {
        if (!dam(r, c)) { c++; continue; }
        let e = c;
        while (e < n && dam(r, e)) e++;
        d += `M${c} ${r}h${e - c}v1h${-(e - c)}z`;
        c = e;
      }
    }
  } else {
    const R = 0.42;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!dam(r, c)) continue;
        const tren = dam(r - 1, c), duoi = dam(r + 1, c), trai = dam(r, c - 1), phai = dam(r, c + 1);
        const tl = !tren && !trai, tr = !tren && !phai, br = !duoi && !phai, bl = !duoi && !trai;
        if (!tl && !tr && !br && !bl) { d += `M${c} ${r}h1v1h-1z`; continue; }
        const g = (b) => (b ? R : 0);
        d += `M${so(c + g(tl))} ${r}H${so(c + 1 - g(tr))}`;
        if (tr) d += `a${R} ${R} 0 0 1 ${R} ${R}`;
        d += `V${so(r + 1 - g(br))}`;
        if (br) d += `a${R} ${R} 0 0 1 ${-R} ${R}`;
        d += `H${so(c + g(bl))}`;
        if (bl) d += `a${R} ${R} 0 0 1 ${-R} ${-R}`;
        d += `V${so(r + g(tl))}`;
        if (tl) d += `a${R} ${R} 0 0 1 ${R} ${-R}`;
        d += 'Z';
      }
    }
    // Ba mắt định vị: vòng ngoài bo tròn, lõi 3×3 bo nhẹ.
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      d += hinhBoTron(ox, oy, 7, 7, 2) + hinhBoTron(ox + 1, oy + 1, 5, 5, 1.2) + hinhBoTron(ox + 2, oy + 2, 3, 3, 0.9);
    }
  }

  const s = kichThuoc / n;
  let g = `<g transform="translate(${so(x)} ${so(y)}) scale(${so(s)})">`;
  g += `<path d="${d}" fill="${mau}" fill-rule="evenodd"/>`;
  if (k) {
    g += `<rect x="${a - 0.1}" y="${a - 0.1}" width="${k + 0.2}" height="${k + 0.2}" rx="${so(k * 0.16)}" fill="#fff"/>`;
    g += `<use href="#tt-logo" x="${a + 0.7}" y="${a + 0.7}" width="${k - 1.4}" height="${k - 1.4}"/>`;
  }
  return g + '</g>';
}

/** Khai báo logo dùng chung cho cả trang; mỗi tem chỉ tham chiếu bằng <use>. */
export function khaiBaoLogo(logo) {
  if (!logo) return '';
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>` +
    `<symbol id="tt-logo" viewBox="0 0 ${logo.rong} ${logo.cao}"><image href="${logo.href}" width="${logo.rong}" height="${logo.cao}"/></symbol>` +
    `</defs></svg>`;
}

// ------------------------------------------------------------------ một con tem

const sach = (s, mau) => String(s || '').replace(mau, '');
const chuSerial = (s) => sach(s, /[^A-Za-z0-9-]/g);
const chuMien = (s) => sach(s, /[^A-Za-z0-9.-]/g);

export function mienCuaUrl(url) {
  try { return chuMien(new URL(url).hostname.toLowerCase()); } catch { return ''; }
}

/** Địa chỉ nội bộ: không dùng được để in tem thật. */
export function laDiaChiNoiBo(url) {
  try {
    const h = new URL(url).hostname;
    return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/.test(h) || h.endsWith('.local') || h.endsWith('.test') || !h.includes('.');
  } catch { return true; }
}

export function noiDungQr(url, hoa) {
  return hoa ? String(url).toUpperCase() : String(url);
}

/**
 * Trả về chuỗi <svg> của một tem. `tem` = { serial, ma, url }.
 * tuyChon: { kieuQr, mau, logoBat, coLogo, hoa, vienCat, vienVang, loiNhac, nhanBuoc }.
 * `inMm`: true thì gắn width/height theo mm (bản in); false thì co giãn theo khung.
 */
export function veTem(khuon, tem, tuyChon, { inMm = true, matran = null } = {}) {
  const K = KHUON[khuon];
  const L = boCuc(K, tuyChon.loiNhac === true, tuyChon.nhanBuoc !== false);
  const serial = chuSerial(tem.serial);
  const ma = chuSerial(tem.ma);
  const mt = matran || maTran(noiDungQr(tem.url, tuyChon.hoa));
  const logo = tuyChon.logoBat ? { k: coLogoO(mt.n, tuyChon.coLogo) } : null;
  const mau = MAU_QR[tuyChon.mau] || MAU_QR.xanh;
  const sf = 'font-family="Segoe UI, Arial, sans-serif"';
  const cx = K.rong / 2;
  const cxQ = L.ngang ? L.qrX + K.qr / 2 : cx;          // tâm cột mã QR
  const cxS = L.ngang ? L.stripX + K.caoRong / 2 : cx;  // tâm cột ô mã bí mật

  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="tem" viewBox="0 0 ${K.rong} ${L.cao}"` +
    (inMm ? ` width="${K.rong}mm" height="${L.cao}mm"` : '') +
    ` font-family="Consolas, 'Courier New', monospace" shape-rendering="geometricPrecision">`;
  s += `<rect x="0" y="0" width="${K.rong}" height="${L.cao}" fill="#fff"/>`;
  if (tuyChon.vienVang) {
    s += `<rect x="0.55" y="0.55" width="${so(K.rong - 1.1)}" height="${so(L.cao - 1.1)}" rx="1.6" fill="none" stroke="${VANG}" stroke-width="0.3"/>`;
  }
  if (tuyChon.vienCat) {
    s += `<rect x="0.1" y="0.1" width="${so(K.rong - 0.2)}" height="${so(L.cao - 0.2)}" fill="none" stroke="#bbb" stroke-width="0.2" stroke-dasharray="0.8 0.6"/>`;
  }
  s += veQr(mt, { x: L.qrX, y: L.qrY, kichThuoc: K.qr, mau, kieu: tuyChon.kieuQr, logo });

  if (L.coNhan) {
    // Nhãn 1: quét mã QR (màu xanh, cùng màu với mã).
    const fsL = 1.5;
    const rongQuet = L.nhanQuet.length * fsL * 0.66;
    const x0 = cxQ - (1.7 + 0.5 + rongQuet) / 2;
    s += `<circle cx="${so(x0 + 0.85)}" cy="${so(L.capY - 0.5)}" r="0.85" fill="${mau}"/>`;
    s += `<text x="${so(x0 + 0.85)}" y="${so(L.capY)}" ${sf} font-size="1.4" font-weight="700" fill="#fff" text-anchor="middle">1</text>`;
    s += `<text x="${so(x0 + 2.2)}" y="${so(L.capY)}" ${sf} font-size="${fsL}" font-weight="700" fill="${mau}" letter-spacing="0.06" textLength="${so(rongQuet)}" lengthAdjust="spacingAndGlyphs">${L.nhanQuet}</text>`;
    // Nhãn 2: thanh vàng ngay trên ô mã bí mật. Nằm NGOÀI ô nên lớp cào không che nó.
    s += `<rect x="${so(L.stripX)}" y="${so(L.tabY)}" width="${K.caoRong}" height="${L.tabH}" rx="0.5" fill="${VANG}"/>`;
    const rongCao = L.nhanCao.length * fsL * 0.66;
    const y0 = cxS - (1.7 + 0.5 + rongCao) / 2;
    const cyT = L.tabY + L.tabH / 2;
    s += `<circle cx="${so(y0 + 0.85)}" cy="${so(cyT)}" r="0.8" fill="#fff"/>`;
    s += `<text x="${so(y0 + 0.85)}" y="${so(cyT + 0.5)}" ${sf} font-size="1.4" font-weight="700" fill="${VANG}" text-anchor="middle">2</text>`;
    s += `<text x="${so(y0 + 2.2)}" y="${so(cyT + 0.52)}" ${sf} font-size="${fsL}" font-weight="700" fill="#fff" letter-spacing="0.06" textLength="${so(rongCao)}" lengthAdjust="spacingAndGlyphs">${L.nhanCao}</text>`;
  }

  // Ô mã bí mật (dán lớp cào lên đúng ô này). Có nhãn thì viền vàng để tách khỏi mã QR.
  s += `<rect x="${so(L.stripX)}" y="${so(L.stripY)}" width="${K.caoRong}" height="${K.caoCao}" rx="0.6" fill="#fff" stroke="${L.coNhan ? VANG : '#999'}" stroke-width="${L.coNhan ? 0.4 : 0.25}"/>`;
  const fs = K.chuMa;
  if (K.dongMa === 1) {
    s += `<text x="${so(cxS)}" y="${so(L.stripY + K.caoCao / 2 + fs * 0.35)}" font-size="${fs}" font-weight="700" fill="#000" text-anchor="middle" textLength="${so(ma.length * fs * 0.6)}" lengthAdjust="spacingAndGlyphs">${ma}</text>`;
  } else {
    ma.split('-').forEach((g, i) => {
      s += `<text x="${so(cxS)}" y="${so(L.stripY + 3.2 + i * 3)}" font-size="${fs}" font-weight="700" fill="#000" text-anchor="middle" textLength="${so(g.length * fs * 0.6)}" lengthAdjust="spacingAndGlyphs">${g}</text>`;
    });
  }

  // Lời nhắc dưới ô mã.
  L.dongNhac.forEach((t, i) => {
    s += `<text x="${so(cx)}" y="${so(L.nhacY0 + i * L.buocNhac)}" ${sf} font-size="${L.fsNhac}" font-weight="700" fill="${mau}" text-anchor="middle" letter-spacing="0.08" textLength="${so(t.length * L.fsNhac * 0.66)}" lengthAdjust="spacingAndGlyphs">${t}</text>`;
  });

  // Serial nhỏ để đọc khi báo cáo.
  const fsS = Math.min(1.4, (K.rong - 2.4) / (serial.length * 0.62));
  s += `<text x="${so(cx)}" y="${so(L.serialY)}" font-size="${so(fsS)}" fill="#555" text-anchor="middle" textLength="${so(serial.length * fsS * 0.6)}" lengthAdjust="spacingAndGlyphs">${serial}</text>`;
  return s + '</svg>';
}

/** Nhận xét kỹ thuật cho một khuôn + tuỳ chọn, hiện cạnh bản xem trước. */
export function danhGia(khuon, mt, tuyChon) {
  const K = KHUON[khuon];
  const k = tuyChon.logoBat ? coLogoO(mt.n, tuyChon.coLogo) : 0;
  const oMm = K.qr / mt.n;
  const logoPhanTram = k ? (k * k) / (mt.n * mt.n) * 100 : 0;
  const canhBao = [];
  if (oMm < 0.22) canhBao.push('Ô mã dưới 0,22 mm: nhiều máy in và camera sẽ khó đọc. Nên chọn khuôn có QR to hơn.');
  else if (oMm < 0.25) canhBao.push('Ô mã dưới 0,25 mm: sát ngưỡng. Quét thử trên ít nhất ba điện thoại trước khi in hàng loạt.');
  if (tuyChon.logoBat && K.qr <= 9) canhBao.push(`Logo chỉ rộng khoảng ${(k * oMm).toFixed(1)} mm nên rất nhỏ. Khuôn QR 11 mm cho logo rõ hơn.`);
  if (tuyChon.kieuQr === 'tron') canhBao.push('Kiểu bo tròn đẹp hơn nhưng khó quét hơn kiểu vuông một chút, nhất là khi mực in loang. Nếu quét thử thấy chậm, đổi sang kiểu vuông.');

  // Khoảng cách quét ước tính, từ mô phỏng ảnh chụp (bộ giải mã ZXing, khung hình 1920 px,
  // góc nhìn 65°, nghiêng 30°, mờ nhẹ, mực loang 0,04 mm). Cần khoảng 4 điểm ảnh mỗi ô
  // (5 điểm với kiểu bo tròn). Đây là ước tính, không thay cho quét thử trên tem in thật.
  const diemAnhMoiO = tuyChon.kieuQr === 'tron' ? 5 : 4;
  const xaToiDaMm = (oMm * 1507) / diemAnhMoiO;
  if (xaToiDaMm < 100) canhBao.push(`Ước tính phải đưa điện thoại gần khoảng ${Math.round(xaToiDaMm / 10)} cm mới đọc được. Nhiều điện thoại không lấy nét được gần như vậy. Nên dùng khuôn QR 11 mm hoặc địa chỉ ngắn hơn.`);
  return { soO: mt.n, phienBan: mt.version, oMm, logoO: k, logoMm: k * oMm, logoPhanTram, xaToiDaMm, canhBao };
}

// ------------------------------------------------------------------ CSV và trang in

export function docCsv(noiDung) {
  const dong = String(noiDung).replace(/^﻿/, '').trim().split(/\r?\n/);
  const dau = (dong[0] || '').split(',').map((s) => s.trim());
  const iS = dau.indexOf('serial'), iM = dau.indexOf('ma_bi_mat'), iU = dau.indexOf('url_tang_1');
  if (iS < 0 || iM < 0 || iU < 0) return { loi: 'Tệp không đúng định dạng. Cần có các cột serial, ma_bi_mat, url_tang_1: hãy chọn đúng tệp CSV do bước "Sinh mã" tải xuống.' };
  const tem = [];
  for (let i = 1; i < dong.length; i++) {
    if (!dong[i].trim()) continue;
    const c = dong[i].split(',').map((s) => s.trim());
    const t = { serial: c[iS], ma: c[iM], url: c[iU] };
    if (!/^[A-Z0-9-]{6,40}$/.test(t.serial) || !/^[A-Z0-9-]{8,20}$/.test(t.ma) || !/^https?:\/\//i.test(t.url)) {
      return { loi: `Dòng ${i + 1} của tệp không hợp lệ.` };
    }
    tem.push(t);
  }
  if (!tem.length) return { loi: 'Tệp không có tem nào.' };
  if (tem.length > 5000) return { loi: 'Tệp có hơn 5.000 tem. Chia nhỏ ra rồi in từng phần.' };
  return { tem };
}

export function luoiA4(khuon, coNhac = true, coNhan = true) {
  const K = KHUON[khuon];
  const cao = chieuCao(khuon, coNhac, coNhan);
  const cot = Math.floor((A4.rong - 2 * A4.le + GAP_MM) / (K.rong + GAP_MM));
  const hang = Math.floor((A4.cao - 2 * A4.le + GAP_MM) / (cao + GAP_MM));
  return { cot, hang, moiTrang: cot * hang };
}

export function dungTrangIn({ tem, khuon, tuyChon, logo }) {
  const K = KHUON[khuon];
  const coNhac = tuyChon.loiNhac === true;
  const coNhan = tuyChon.nhanBuoc !== false;
  const cao = chieuCao(khuon, coNhac, coNhan);
  const { cot, hang, moiTrang } = luoiA4(khuon, coNhac, coNhan);
  const soTrang = Math.ceil(tem.length / moiTrang);
  const trang = [];
  for (let p = 0; p < soTrang; p++) {
    const lat = tem.slice(p * moiTrang, (p + 1) * moiTrang);
    trang.push(`<section class="trang"><div class="luoi">${lat.map((t) => veTem(khuon, t, tuyChon)).join('')}</div>` +
      `<div class="chan">TramTrack · trang ${p + 1}/${soTrang} · ${lat.length} tem · ${chuSerial(lat[0].serial)} → ${chuSerial(lat[lat.length - 1].serial)}</div></section>`);
  }
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Bản in tem · ${tem.length} con · ${K.rong}×${cao} mm</title>
<style>
@page { size: A4; margin: 8mm; }
*{box-sizing:border-box} body{margin:0;background:#555;font-family:"Segoe UI",Arial,sans-serif}
.trang{width:210mm;min-height:297mm;padding:8mm;background:#fff;margin:10mm auto;page-break-after:always;display:flex;flex-direction:column}
.luoi{display:grid;grid-template-columns:repeat(${cot},${K.rong}mm);grid-auto-rows:${cao}mm;gap:${GAP_MM}mm;justify-content:center}
.tem{display:block}
.chan{margin-top:auto;padding-top:3mm;font-size:2.6mm;color:#888;text-align:center}
.huongdan{width:210mm;margin:10mm auto 0;padding:6mm 8mm;background:#FDF6E8;border:1px solid #D8C9A0;border-radius:4px;font-size:13px;color:#3a3a2a;line-height:1.6}
.huongdan b{color:#7a5b10}.huongdan ol{margin:8px 0 0;padding-left:20px}
.thuoc{margin:10px 0 4px;width:100mm;height:6mm;border-left:1px solid #000;border-right:1px solid #000;background:repeating-linear-gradient(90deg,#000 0,#000 .2mm,transparent .2mm,transparent 10mm);position:relative}
.thuoc span{position:absolute;top:6.5mm;font-size:10px}
@media print{body{background:#fff}.trang{margin:0}.huongdan{display:none}}
</style></head><body>
${khaiBaoLogo(logo)}
<div class="huongdan"><b>Trước khi in, đọc kỹ</b>
<ol>
<li>Chọn khổ <b>A4</b>, lề <b>None / 0</b>, tỉ lệ <b>100% (Default)</b> và <b>TẮT</b> "Fit to page". Bật nó thì tem in sai kích thước thật.</li>
<li>In thử <b>một trang ra giấy thường</b>. Đặt thước lên vạch dưới đây: phải đúng 100 mm. Rồi đo một con tem: phải đúng <b>${K.rong} × ${cao} mm</b>.</li>
<li>Quét thử mã QR của tem in thử bằng ít nhất <b>ba điện thoại</b> khác nhau, cả khi nghiêng 30° và dưới đèn vàng. Đạt rồi mới in lên giấy decal.</li>
<li>Dán miếng cào kín ô viền chứa mã bí mật, không để hở mép. Soi đèn pin từ phía sau không được đọc ra chữ.</li>
</ol>
<div class="thuoc"><span style="left:-2px">0</span><span style="left:48mm">50</span><span style="left:98mm">100 mm</span></div>
<div style="height:8mm"></div>
<b>Tệp này chứa mã bí mật ở dạng đọc được.</b> In và dán cào xong thì xóa tệp này và cả tệp CSV gốc.
</div>
${trang.join('\n')}
</body></html>`;
}

/** Nạp logo từ thư mục public, thu nhỏ để tệp in không phình. */
export async function napLogo(duongDan = '/assets/botanical/logo-icon.png', canhToiDa = 256) {
  const res = await fetch(duongDan);
  if (!res.ok) throw new Error('Không tải được logo');
  const blob = await res.blob();
  const bm = await createImageBitmap(blob);
  const ti = Math.min(1, canhToiDa / Math.max(bm.width, bm.height));
  const rong = Math.round(bm.width * ti), cao = Math.round(bm.height * ti);
  const cv = document.createElement('canvas');
  cv.width = rong; cv.height = cao;
  cv.getContext('2d').drawImage(bm, 0, 0, rong, cao);
  return { href: cv.toDataURL('image/png'), rong, cao };
}

// ------------------------------------------------------------------ PDF

function taiAnhSvg(svg) {
  return new Promise((ok, loi) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => loi(new Error('Không dựng được ảnh tem'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/** Ghép các trang JPEG thành một tệp PDF A4 (mỗi trang một ảnh phủ kín). */
function ghiPdf(trang) {
  const enc = new TextEncoder();
  const parts = [];
  let dai = 0;
  const day = (u8) => { parts.push(u8); dai += u8.length; };
  const chu = (s) => day(enc.encode(s));
  const vi = [];
  const bat = (n) => { vi[n] = dai; };

  day(Uint8Array.of(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a));
  const W = 595.28, H = 841.89;
  const kids = trang.map((_, i) => `${3 + 3 * i} 0 R`).join(' ');
  bat(1); chu('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  bat(2); chu(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${trang.length} >>\nendobj\n`);
  trang.forEach((t, i) => {
    const p = 3 + 3 * i, c = p + 1, im = p + 2;
    bat(p); chu(`${p} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${c} 0 R >>\nendobj\n`);
    const nd = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    bat(c); chu(`${c} 0 obj\n<< /Length ${nd.length} >>\nstream\n${nd}\nendstream\nendobj\n`);
    bat(im); chu(`${im} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${t.w} /Height ${t.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${t.buf.length} >>\nstream\n`);
    day(t.buf);
    chu('\nendstream\nendobj\n');
  });
  const tong = 3 + 3 * trang.length;
  const xref = dai;
  chu(`xref\n0 ${tong}\n0000000000 65535 f \n`);
  for (let n = 1; n < tong; n++) chu(`${String(vi[n]).padStart(10, '0')} 00000 n \n`);
  chu(`trailer\n<< /Size ${tong} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}

/**
 * Dựng tệp PDF A4 của các tem (cùng bố cục với trang in HTML), mỗi trang là một ảnh
 * 600 dpi nên kích thước tem trên giấy là kích thước thật. Chạy trong trình duyệt.
 * `khiTienDo(đã, tổng)` được gọi sau mỗi trang.
 */
export async function dungPdf({ tem, khuon, tuyChon, logo, dpi = 600, khiTienDo }) {
  const K = KHUON[khuon];
  const coNhac = tuyChon.loiNhac === true;
  const coNhan = tuyChon.nhanBuoc !== false;
  const cao = chieuCao(khuon, coNhac, coNhan);
  const { cot, moiTrang } = luoiA4(khuon, coNhac, coNhan);
  const soTrang = Math.ceil(tem.length / moiTrang);
  const pxMm = dpi / 25.4;
  const W = Math.round(A4.rong * pxMm);
  const H = Math.round(A4.cao * pxMm);
  const trong = A4.rong - 2 * A4.le;
  const x0 = A4.le + (trong - (cot * K.rong + (cot - 1) * GAP_MM)) / 2;
  const y0 = A4.le;
  const trang = [];

  for (let p = 0; p < soTrang; p++) {
    const lat = tem.slice(p * moiTrang, (p + 1) * moiTrang);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < lat.length; i++) {
      let svg = veTem(khuon, lat[i], tuyChon);
      if (logo) svg = svg.replace(/<use href="#tt-logo"([^>]*)\/>/g, `<image href="${logo.href}"$1/>`);
      const img = await taiAnhSvg(svg);
      const c = i % cot, r = Math.floor(i / cot);
      g.drawImage(img, (x0 + c * (K.rong + GAP_MM)) * pxMm, (y0 + r * (cao + GAP_MM)) * pxMm, K.rong * pxMm, cao * pxMm);
    }
    g.fillStyle = '#888';
    g.font = `${2.6 * pxMm}px Arial, sans-serif`;
    g.textAlign = 'center';
    g.fillText(`TramTrack · trang ${p + 1}/${soTrang} · ${lat.length} tem · ${chuSerial(lat[0].serial)} → ${chuSerial(lat[lat.length - 1].serial)}`, W / 2, H - A4.le * pxMm);
    const blob = await new Promise((ok) => cv.toBlob(ok, 'image/jpeg', 0.97));
    if (!blob) throw new Error('Trình duyệt không tạo được ảnh trang in. Thử máy tính khác hoặc dùng tệp HTML.');
    trang.push({ buf: new Uint8Array(await blob.arrayBuffer()), w: W, h: H });
    cv.width = 1; cv.height = 1;
    if (khiTienDo) khiTienDo(p + 1, soTrang);
  }
  return ghiPdf(trang);
}
