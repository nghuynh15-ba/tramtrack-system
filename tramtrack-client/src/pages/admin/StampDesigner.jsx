import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Printer, Upload, Download, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  KHUON, chieuCao, danhGia, docCsv, dungPdf, dungTrangIn, khaiBaoLogo, laDiaChiNoiBo, luoiA4,
  maTran, mienCuaUrl, napLogo, noiDungQr, veTem,
} from '../../services/tem';

/**
 * Thiết kế tem và xuất trang in — chạy hoàn toàn trong trình duyệt.
 *
 * Chọn khuôn theo cỡ chai, chỉnh kiểu mã QR và logo ở giữa, xem trước, rồi nạp
 * tệp CSV do bước "Sinh mã" tải xuống để dựng trang in A4 đúng kích thước thật.
 *
 * Mã bí mật chỉ nằm trong tệp CSV mà người dùng tự chọn. Màn hình KHÔNG hiện
 * mã bí mật (bản xem trước dùng mã giả), không gửi gì lên máy chủ, và không lưu
 * lại sau khi đóng trang.
 */

const NHAN = 'text-[10px] font-bold uppercase tracking-wider text-[#4F6357] mb-2 block';

function Chon({ giaTri, dat, tuyChon, rongDeu = true }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tuyChon.map(([v, ten]) => (
        <button
          key={v}
          type="button"
          onClick={() => dat(v)}
          className={`px-3.5 py-2 rounded-lg text-sm border transition-colors ${rongDeu ? 'flex-1 min-w-[90px]' : ''} ${
            giaTri === v ? 'bg-[#135E3E] text-white border-[#135E3E] font-semibold' : 'bg-white border-emerald-900/15 text-[#4F6357] hover:border-[#135E3E]/50'
          }`}
        >
          {ten}
        </button>
      ))}
    </div>
  );
}

export default function StampDesigner() {
  const [khuon, setKhuon] = useState('lon11');
  const [kieuQr, setKieuQr] = useState('tron');
  const [mau, setMau] = useState('xanh');
  const [logoBat, setLogoBat] = useState(true);
  const [coLogo, setCoLogo] = useState('vua');
  const [hoa, setHoa] = useState(true);
  const [vienCat, setVienCat] = useState(true);
  const [vienVang, setVienVang] = useState(true);
  const [loiNhac, setLoiNhac] = useState(false);
  const [nhanBuoc, setNhanBuoc] = useState(true);

  const [logo, setLogo] = useState(null);
  const [loiLogo, setLoiLogo] = useState(null);
  const [tem, setTem] = useState([]);
  const [tenTep, setTenTep] = useState('');
  const [loiTep, setLoiTep] = useState(null);
  const [chiInThu, setChiInThu] = useState(false);
  const [dang, setDang] = useState(false);
  const [loiPdf, setLoiPdf] = useState(null);
  const [tienPdf, setTienPdf] = useState('');
  const tepRef = useRef(null);

  useEffect(() => {
    let huy = false;
    napLogo().then((l) => { if (!huy) setLogo(l); }).catch((e) => { if (!huy) setLoiLogo(e.message || 'Không tải được logo'); });
    return () => { huy = true; };
  }, []);

  const tuyChon = useMemo(
    () => ({ kieuQr, mau, logoBat: logoBat && Boolean(logo), coLogo, hoa, vienCat, vienVang, loiNhac, nhanBuoc }),
    [kieuQr, mau, logoBat, logo, coLogo, hoa, vienCat, vienVang, loiNhac, nhanBuoc]
  );

  // Bản xem trước: serial thật của tem đầu tiên (nếu đã nạp tệp), mã bí mật luôn là mã giả.
  const mau1 = tem[0];
  const urlMau = mau1 ? mau1.url : `${window.location.origin}/s/TDT-2026-000001`;
  const temMau = { serial: mau1 ? mau1.serial : 'TDT-2026-000001', ma: 'XXXX-XXXX-XXXX', url: urlMau };

  const mt = useMemo(() => maTran(noiDungQr(urlMau, hoa)), [urlMau, hoa]);
  const svgLon = useMemo(() => veTem(khuon, temMau, tuyChon, { inMm: false, matran: mt }), [khuon, tuyChon, mt, urlMau, mau1]); // eslint-disable-line react-hooks/exhaustive-deps
  const svgThat = useMemo(() => veTem(khuon, temMau, tuyChon, { inMm: true, matran: mt }), [khuon, tuyChon, mt, urlMau, mau1]); // eslint-disable-line react-hooks/exhaustive-deps
  const dg = useMemo(() => danhGia(khuon, mt, tuyChon), [khuon, mt, tuyChon]);
  const K = KHUON[khuon];
  const luoi = luoiA4(khuon, loiNhac, nhanBuoc);
  const caoTem = chieuCao(khuon, loiNhac, nhanBuoc);
  const noiBo = laDiaChiNoiBo(urlMau);

  function chonTep(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setLoiTep(null);
    if (f.size > 3 * 1024 * 1024) { setLoiTep('Tệp quá lớn để là tệp CSV tem.'); return; }
    const doc = new FileReader();
    doc.onload = () => {
      const kq = docCsv(String(doc.result || ''));
      if (kq.loi) { setTem([]); setTenTep(''); setLoiTep(kq.loi); return; }
      setTem(kq.tem); setTenTep(f.name); setChiInThu(false);
    };
    doc.onerror = () => setLoiTep('Không đọc được tệp.');
    doc.readAsText(f);
  }

  function dung() {
    return dungTrangIn({ tem, khuon, tuyChon, logo: tuyChon.logoBat ? logo : null });
  }

  function moTrangIn() {
    setDang(true);
    // Để React kịp hiện trạng thái "đang dựng" trước khi dựng chuỗi lớn.
    setTimeout(() => {
      try {
        const url = URL.createObjectURL(new Blob([dung()], { type: 'text/html;charset=utf-8' }));
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
      } finally { setDang(false); }
    }, 30);
  }

  function taiHtml() {
    const url = URL.createObjectURL(new Blob([dung()], { type: 'text/html;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ban-in-${khuon}-${tem.length}-tem.html`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function taiPdf() {
    setDang(true); setLoiPdf(null); setTienPdf('Đang dựng PDF…');
    try {
      const blob = await dungPdf({
        tem, khuon, tuyChon, logo: tuyChon.logoBat ? logo : null,
        khiTienDo: (d, t) => setTienPdf(`Đang dựng PDF… trang ${d}/${t}`),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ban-in-${khuon}-${tem.length}-tem.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setTienPdf('');
    } catch (e) {
      setLoiPdf(e.message || 'Không dựng được PDF.');
      setTienPdf('');
    } finally { setDang(false); }
  }

  const coTheXuat = tem.length > 0 && (!noiBo || chiInThu);
  const nang = kieuQr === 'tron' && tem.length > 200;

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] font-sans text-[#0A1A12]">
      <div dangerouslySetInnerHTML={{ __html: tuyChon.logoBat ? khaiBaoLogo(logo) : '' }} />

      <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider mb-1">Thiết kế tem</h1>
      <p className="text-sm text-[#4F6357] mb-8 max-w-3xl">
        Chọn khuôn theo cỡ chai, chỉnh mã QR và logo, rồi xuất trang in A4 đúng kích thước thật từ tệp CSV của bước sinh mã.
        Mọi thứ chạy trên máy này, không gửi gì lên máy chủ.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ------------------------------------------------- điều khiển */}
        <div className="w-full lg:w-[48%] space-y-6">
          <section className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
            <span className={NHAN}>1. Khuôn tem theo cỡ chai</span>
            <div className="space-y-2">
              {Object.entries(KHUON).map(([ma, k]) => (
                <button
                  key={ma}
                  type="button"
                  onClick={() => setKhuon(ma)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${khuon === ma ? 'border-[#135E3E] bg-emerald-50' : 'border-emerald-900/15 bg-white hover:border-[#135E3E]/50'}`}
                >
                  <div className="font-semibold text-sm">{k.ten}</div>
                  <div className="text-[12px] text-[#4F6357] mt-0.5">
                    Tem {k.rong} × {chieuCao(ma, loiNhac, nhanBuoc)} mm · QR {k.qr} mm · ô cào {k.caoRong} × {k.caoCao} mm
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <span className={NHAN}>2. Kiểu mã QR</span>
              <Chon giaTri={kieuQr} dat={setKieuQr} tuyChon={[['tron', 'Bo tròn (như mẫu)'], ['vuong', 'Vuông (dễ quét nhất)']]} />
            </div>
            <div>
              <span className={NHAN}>Màu mã</span>
              <Chon giaTri={mau} dat={setMau} tuyChon={[['xanh', 'Xanh lục đậm'], ['den', 'Đen']]} />
            </div>
            <div>
              <span className={NHAN}>Logo ở giữa mã QR</span>
              <Chon giaTri={logoBat ? 'bat' : 'tat'} dat={(v) => setLogoBat(v === 'bat')} tuyChon={[['bat', 'Có logo'], ['tat', 'Không logo']]} />
              {logoBat && (
                <div className="mt-2">
                  <Chon giaTri={coLogo} dat={setCoLogo} tuyChon={[['nho', 'Nhỏ'], ['vua', 'Vừa'], ['lon', 'Lớn']]} />
                </div>
              )}
              {loiLogo && <p className="text-[12px] text-rose-700 mt-2">{loiLogo}. Mã sẽ được dựng không có logo.</p>}
            </div>
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={hoa} onChange={(e) => setHoa(e.target.checked)} className="mt-1" />
              <span>
                <strong>Viết hoa toàn bộ địa chỉ trong mã</strong> (khuyên dùng). Mã gọn hơn nên ô mã to hơn, dễ quét hơn. Địa chỉ vẫn mở bình thường.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={nhanBuoc} onChange={(e) => setNhanBuoc(e.target.checked)} className="mt-1" />
              <span>
                <strong>Hai nhãn đánh số</strong>: “1 · QUÉT KIỂM TRA” (xanh) dưới mã QR và thanh vàng “2 · CÀO ĐỂ KÍCH HOẠT” trên ô mã bí mật, để người mua không nhầm mã cào với mã QR.
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={loiNhac} onChange={(e) => setLoiNhac(e.target.checked)} />
              Dòng “QUÉT ĐỂ TRUY XUẤT NGUỒN GỐC” dưới ô mã (tắt thì tem thấp hơn)
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={vienVang} onChange={(e) => setVienVang(e.target.checked)} />
              Viền vàng bo góc (in cùng tem)
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={vienCat} onChange={(e) => setVienCat(e.target.checked)} />
              Vẽ đường cắt nét đứt quanh tem
            </label>
          </section>
        </div>

        {/* ------------------------------------------------- xem trước */}
        <div className="w-full lg:w-[52%] space-y-6">
          <section className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
            <span className={NHAN}>Xem trước (phóng to)</span>
            <div className="bg-[#EEF2EC] rounded-xl p-6 flex justify-center">
              <div
                className="bg-white shadow-md"
                style={{ width: `min(100%, ${K.rong * 12}px)` }}
                dangerouslySetInnerHTML={{ __html: svgLon }}
              />
            </div>
            <p className="text-[11.5px] text-[#4F6357] mt-2">
              Mã bí mật trong bản xem trước là mã giả. Bản in lấy mã thật từ tệp CSV.
            </p>

            <span className={`${NHAN} mt-5`}>Kích thước thật ({K.rong} × {caoTem} mm, theo màn hình)</span>
            <div className="bg-[#EEF2EC] rounded-xl p-4 flex items-center justify-center">
              <div dangerouslySetInnerHTML={{ __html: svgThat }} />
            </div>
          </section>

          <section className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm">
            <span className={NHAN}>Đánh giá kỹ thuật</span>
            <dl className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã QR</dt>
                <dd className="font-mono font-bold mt-0.5">{dg.soO} × {dg.soO} ô · mức sửa lỗi H</dd>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mỗi ô mã</dt>
                <dd className="font-mono font-bold mt-0.5">{dg.oMm.toFixed(3)} mm</dd>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logo</dt>
                <dd className="font-mono font-bold mt-0.5">{dg.logoO ? `${dg.logoMm.toFixed(1)} mm · ${dg.logoPhanTram.toFixed(1)}% mã` : 'không có'}</dd>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 col-span-2">
                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khoảng cách quét ước tính (từ mô phỏng, chưa phải đo thật)</dt>
                <dd className="font-mono font-bold mt-0.5">đưa điện thoại trong khoảng {Math.round(dg.xaToiDaMm / 10)} cm</dd>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Một trang A4</dt>
                <dd className="font-mono font-bold mt-0.5">{luoi.cot} × {luoi.hang} = {luoi.moiTrang} tem</dd>
              </div>
            </dl>
            {dg.canhBao.length > 0 && (
              <ul className="space-y-2">
                {dg.canhBao.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[12.5px] bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 leading-relaxed">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {c}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[12px] text-[#4F6357] leading-relaxed mt-3">
              Số ô mã phụ thuộc độ dài địa chỉ trong mã: địa chỉ ngắn thì ô to hơn. Quét thử bản in thật trên ít nhất ba điện thoại, kể cả khi nghiêng và dưới đèn vàng, trước khi in hàng loạt.
            </p>
          </section>
        </div>
      </div>

      {/* ------------------------------------------------- xuất bản in */}
      <section className="bg-white border border-emerald-900/10 rounded-2xl p-5 sm:p-6 shadow-sm mt-8">
        <span className={NHAN}>3. Xuất trang in</span>
        <p className="text-sm text-[#4F6357] mb-4 max-w-3xl">
          Chọn tệp CSV do bước <strong>Sinh mã</strong> đã tải xuống (cột serial, ma_bi_mat, url_tang_1).
          Tệp chứa mã bí mật thật nên chỉ được đọc trên máy này.
        </p>

        <input ref={tepRef} type="file" accept=".csv,text/csv" onChange={chonTep} className="hidden" />
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => tepRef.current && tepRef.current.click()}
            className="inline-flex items-center gap-2 bg-white border border-[#135E3E] text-[#135E3E] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-50"
          >
            <Upload size={16} /> Chọn tệp CSV
          </button>
          {tem.length > 0 && (
            <span className="inline-flex items-center gap-2 text-sm text-[#135E3E]">
              <CheckCircle2 size={16} /> <span className="font-mono">{tenTep}</span> · {tem.length.toLocaleString('vi-VN')} tem · {Math.ceil(tem.length / luoi.moiTrang)} trang A4
            </span>
          )}
        </div>
        {loiTep && <p role="alert" className="text-sm text-rose-700 mb-4">{loiTep}</p>}

        {noiBo && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm leading-relaxed mb-4">
            <strong>Địa chỉ trong mã QR là địa chỉ nội bộ</strong> ({mienCuaUrl(urlMau) || urlMau}). Tem in ra chỉ quét được ở mạng này.
            Dùng cho in thử thì được. Muốn in tem thật, phải đặt <span className="font-mono">PUBLIC_BASE_URL</span> là địa chỉ
            công khai (HTTPS) rồi <strong>sinh mã lại</strong>, vì địa chỉ đã được ghi vào tệp CSV.
            {tem.length > 0 && (
              <label className="flex items-center gap-2 mt-3 font-semibold cursor-pointer">
                <input type="checkbox" checked={chiInThu} onChange={(e) => setChiInThu(e.target.checked)} />
                Tôi hiểu, đây chỉ là bản in thử
              </label>
            )}
          </div>
        )}

        {nang && (
          <p className="text-[12.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4">
            Kiểu bo tròn với {tem.length} tem tạo tệp khá nặng (hàng chục MB) và trang in sẽ mở chậm. Muốn nhẹ hơn, chọn kiểu vuông.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={moTrangIn}
            disabled={!coTheXuat || dang}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#135E3E] to-[#0A3D27] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {dang ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Mở trang in
          </button>
          <button
            type="button"
            onClick={taiHtml}
            disabled={!coTheXuat || dang}
            className="inline-flex items-center gap-2 bg-white border border-emerald-900/20 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-emerald-50 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Tải tệp HTML
          </button>
          <button
            type="button"
            onClick={taiPdf}
            disabled={!coTheXuat || dang}
            className="inline-flex items-center gap-2 bg-white border border-emerald-900/20 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-emerald-50 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Tải tệp PDF (A4, 600 dpi)
          </button>
        </div>

        {tienPdf && <p className="text-[12.5px] text-[#135E3E] mt-3">{tienPdf}</p>}
        {loiPdf && <p className="text-[12.5px] text-red-700 mt-3">{loiPdf}</p>}
        <p className="text-[12px] text-[#4F6357] leading-relaxed mt-4 max-w-3xl">
          Tệp PDF đã đúng khổ A4 và đúng kích thước thật. Khi in chỉ cần chọn "Kích thước thực" (Actual size / 100%), không chọn "Vừa trang". Tệp PDF cũng chứa mã bí mật đọc được, hãy xóa sau khi in.
        </p>
        <p className="text-[12px] text-[#4F6357] leading-relaxed mt-4 max-w-3xl">
          Trang in mở ở thẻ mới. Trong hộp thoại in: khổ A4, lề None, tỉ lệ 100% và tắt "Fit to page". Trang có thước 100 mm để đối chiếu.
          In và dán lớp cào xong, hãy xóa tệp CSV và tệp HTML vì cả hai chứa mã bí mật đọc được.
        </p>
      </section>
    </div>
  );
}
